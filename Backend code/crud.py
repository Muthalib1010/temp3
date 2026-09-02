import math
import uuid
import secrets
from datetime import datetime, date, timedelta
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc

from models import Farmer, Mandi, Crop, Slot, Booking, Payment, Notification
from schemas import FarmerRegister, FarmerUpdate, BookingCreate
from auth import hash_password, verify_password

# Procurement Stage Names and Flow
STAGES = [
    {"index": 0, "code": "BOOKED", "label": "Booking Confirmed"},
    {"index": 1, "code": "ARRIVED", "label": "Arrived at Center"},
    {"index": 2, "code": "WEIGHING", "label": "Weighing"},
    {"index": 3, "code": "QUALITY_CHECK", "label": "Quality Check"},
    {"index": 4, "code": "COMPLETED", "label": "Procurement Completed"},
    {"index": 5, "code": "PAYMENT_PROCESSING", "label": "Payment Processing"},
    {"index": 6, "code": "PAYMENT_COMPLETED", "label": "Payment Completed"},
]

# --- Farmer CRUD ---

def create_farmer(db: Session, farmer_in: FarmerRegister, role: str = "farmer") -> Farmer:
    hashed_pwd = hash_password(farmer_in.password)
    farmer_id_card = farmer_in.farmer_id or f"KL-{datetime.utcnow().year}-{secrets.randbelow(90000) + 10000}"
    
    farmer = Farmer(
        name=farmer_in.name,
        mobile=farmer_in.mobile,
        password_hash=hashed_pwd,
        role=role,
        village=farmer_in.village,
        district=farmer_in.district,
        state=farmer_in.state,
        pincode=farmer_in.pincode,
        preferred_language=farmer_in.preferred_language or "en",
        farmer_id=farmer_id_card,
        aadhaar_last4=farmer_in.aadhaar_last4
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    
    # Send welcome notification
    welcome_notif = Notification(
        farmer_id=farmer.id,
        title="Welcome to Kisan Slot Booking Portal",
        message=f"Namaste {farmer.name}! Your farmer profile has been registered. You can now book procurement slots at nearby mandis.",
        type="SYSTEM"
    )
    db.add(welcome_notif)
    db.commit()
    return farmer

def get_farmer_by_mobile(db: Session, mobile: str) -> Optional[Farmer]:
    cleaned = "".join(filter(str.isdigit, mobile))[-10:] if mobile else ""
    return db.query(Farmer).filter(Farmer.mobile == cleaned).first()

def get_farmer_by_id(db: Session, farmer_id: int) -> Optional[Farmer]:
    return db.query(Farmer).filter(Farmer.id == farmer_id).first()

def update_farmer(db: Session, farmer: Farmer, update_data: FarmerUpdate) -> Farmer:
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(farmer, field, value)
    db.commit()
    db.refresh(farmer)
    return farmer

def authenticate_farmer(db: Session, mobile: str, password: str) -> Optional[Farmer]:
    farmer = get_farmer_by_mobile(db, mobile)
    if not farmer:
        return None
    if not verify_password(password, farmer.password_hash):
        return None
    return farmer

# --- Mandis CRUD ---

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to calculate approximate distance in km."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def get_mandis(
    db: Session,
    query: Optional[str] = None,
    district: Optional[str] = None,
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None
) -> List[dict]:
    q = db.query(Mandi).filter(Mandi.active == True)
    if district and district.strip():
        q = q.filter(Mandi.district.ilike(f"%{district.strip()}%"))
    if query and query.strip():
        search = f"%{query.strip()}%"
        q = q.filter(or_(Mandi.name.ilike(search), Mandi.location.ilike(search), Mandi.district.ilike(search)))
    
    mandis = q.all()
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    result = []
    for mandi in mandis:
        # Count available slots for today
        today_slots = db.query(Slot).filter(Slot.mandi_id == mandi.id, Slot.date == today_str).all()
        avail_today = sum(max(0, s.capacity - s.booked_count) for s in today_slots) if today_slots else 18
        
        dist = None
        if user_lat is not None and user_lon is not None and mandi.latitude and mandi.longitude:
            dist = calculate_distance(user_lat, user_lon, mandi.latitude, mandi.longitude)
            
        mandi_dict = {
            "id": mandi.id,
            "name": mandi.name,
            "location": mandi.location,
            "district": mandi.district,
            "state": mandi.state,
            "address": mandi.address,
            "operating_hours": mandi.operating_hours,
            "capacity_per_day": mandi.capacity_per_day,
            "latitude": mandi.latitude,
            "longitude": mandi.longitude,
            "contact_phone": mandi.contact_phone,
            "active": mandi.active,
            "distance_km": dist,
            "available_slots_today": avail_today,
            "status": "Open" if avail_today > 0 else "Full Today"
        }
        result.append(mandi_dict)
        
    if user_lat is not None and user_lon is not None:
        result.sort(key=lambda x: (x["distance_km"] if x["distance_km"] is not None else 999999))
    return result

def get_mandi_by_id(db: Session, mandi_id: int) -> Optional[Mandi]:
    return db.query(Mandi).filter(Mandi.id == mandi_id).first()

# --- Crops CRUD ---

def get_crops(db: Session) -> List[Crop]:
    return db.query(Crop).filter(Crop.active == True).order_by(Crop.name).all()

def get_crop_by_id(db: Session, crop_id: int) -> Optional[Crop]:
    return db.query(Crop).filter(Crop.id == crop_id).first()

# --- Slots CRUD ---

def get_date_availability(db: Session, mandi_id: int, days_ahead: int = 7) -> List[dict]:
    today = datetime.utcnow().date()
    date_list = []
    
    for i in range(days_ahead):
        d = today + timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        day_name = d.strftime("%A, %b %d")
        
        slots = db.query(Slot).filter(Slot.mandi_id == mandi_id, Slot.date == d_str).all()
        if not slots:
            # Generate default slots if missing for demo
            total_slots = 24
            avail_slots = 18 if i > 0 else 12
        else:
            total_slots = sum(s.capacity for s in slots)
            avail_slots = sum(max(0, s.capacity - s.booked_count) for s in slots)
            
        status_label = "Available"
        if avail_slots == 0:
            status_label = "Fully Booked"
        elif avail_slots < 5:
            status_label = "Few Slots Left"
            
        date_list.append({
            "date": d_str,
            "day_name": day_name,
            "total_slots": total_slots,
            "available_slots": avail_slots,
            "is_available": avail_slots > 0,
            "status_label": status_label
        })
    return date_list

def get_slots_by_mandi_and_date(db: Session, mandi_id: int, slot_date: str) -> List[dict]:
    slots = db.query(Slot).filter(
        Slot.mandi_id == mandi_id,
        Slot.date == slot_date
    ).order_by(Slot.start_time).all()
    
    result = []
    for s in slots:
        avail = max(0, s.capacity - s.booked_count)
        status_str = "OPEN"
        if avail == 0:
            status_str = "FULL"
        elif avail <= 3:
            status_str = "ALMOST_FULL"
            
        result.append({
            "id": s.id,
            "mandi_id": s.mandi_id,
            "date": s.date,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "capacity": s.capacity,
            "booked_count": s.booked_count,
            "available_count": avail,
            "status": status_str
        })
    return result

def get_slot_by_id(db: Session, slot_id: int) -> Optional[Slot]:
    return db.query(Slot).filter(Slot.id == slot_id).first()

# --- Bookings CRUD ---

def generate_booking_id(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(Booking).count() + 101
    return f"FSB-{year}-{count:06d}"

def create_booking(db: Session, farmer_id: int, booking_in: BookingCreate) -> Booking:
    # 1. Transactional check on Slot Capacity
    slot = db.query(Slot).filter(Slot.id == booking_in.slot_id).with_for_update().first()
    if not slot:
        raise ValueError("Selected slot does not exist.")
    
    if slot.booked_count >= slot.capacity:
        raise ValueError("Sorry, this slot has just been booked by another farmer. Please select another slot.")
    
    mandi = db.query(Mandi).filter(Mandi.id == booking_in.mandi_id).first()
    crop = db.query(Crop).filter(Crop.id == booking_in.crop_id).first()
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    
    if not mandi or not crop or not farmer:
        raise ValueError("Invalid mandi, crop, or farmer ID.")
        
    # Increment slot booked count
    slot.booked_count += 1
    if slot.booked_count >= slot.capacity:
        slot.status = "FULL"
    elif slot.booked_count >= slot.capacity - 3:
        slot.status = "ALMOST_FULL"
        
    # Determine queue number for this mandi and date
    bookings_count_today = db.query(Booking).filter(
        Booking.mandi_id == mandi.id,
        Booking.slot_id == slot.id,
        Booking.status != "CANCELLED"
    ).count()
    queue_num = bookings_count_today + 1
    
    booking_code = generate_booking_id(db)
    total_val = round(crop.rate_per_kg * booking_in.quantity, 2)
    wait_time = max(5, queue_num * 3)
    
    # Create booking record
    booking = Booking(
        booking_id=booking_code,
        farmer_id=farmer.id,
        mandi_id=mandi.id,
        crop_id=crop.id,
        slot_id=slot.id,
        quantity=booking_in.quantity,
        queue_number=queue_num,
        status="CONFIRMED",
        procurement_status="BOOKED",
        current_stage_index=0,
        estimated_wait_minutes=wait_time,
        now_serving_number=1,
        total_amount=total_val,
        qr_code_data=f"FSB-PASS|{booking_code}|FARMER:{farmer.id}|MANDI:{mandi.id}|DATE:{slot.date}|QUEUE:{queue_num}|CROP:{crop.name}|QTY:{booking_in.quantity}KG"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # Create associated payment record
    payment = Payment(
        booking_id=booking.id,
        amount=total_val,
        status="PENDING",
        transaction_id=None,
        bank_name="State Bank of India",
        ifsc_prefix="SBIN0008412",
        account_last4=farmer.mobile[-4:] if farmer.mobile else "4819",
        pfms_reference=f"PFMS-IND-{datetime.utcnow().year}-{booking.id:05d}"
    )
    db.add(payment)
    
    # Create booking confirmed notification
    notif = Notification(
        farmer_id=farmer.id,
        booking_id=booking.id,
        title="🔔 Slot Booking Confirmed",
        message=f"Your procurement slot at {mandi.name} for {crop.name} ({booking.quantity} kg) is confirmed for {slot.date} at {slot.start_time}. Queue No: #{queue_num}.",
        type="BOOKING"
    )
    db.add(notif)
    db.commit()
    db.refresh(booking)
    return booking

def serialize_booking(db: Session, b: Booking) -> dict:
    farmer = db.query(Farmer).filter(Farmer.id == b.farmer_id).first()
    mandi = db.query(Mandi).filter(Mandi.id == b.mandi_id).first()
    crop = db.query(Crop).filter(Crop.id == b.crop_id).first()
    slot = db.query(Slot).filter(Slot.id == b.slot_id).first()
    
    ahead = max(0, b.queue_number - b.now_serving_number) if b.status != "COMPLETED" and b.status != "CANCELLED" else 0
    est_wait = max(0, ahead * 3) if ahead > 0 else (0 if b.current_stage_index >= 4 else 5)
    
    return {
        "id": b.id,
        "booking_id": b.booking_id,
        "farmer_id": b.farmer_id,
        "farmer_name": farmer.name if farmer else "Farmer",
        "farmer_mobile": farmer.mobile if farmer else "",
        "mandi_id": b.mandi_id,
        "mandi_name": mandi.name if mandi else "Procurement Center",
        "mandi_district": mandi.district if mandi else "",
        "crop_id": b.crop_id,
        "crop_name": crop.name if crop else "Crop",
        "crop_category": crop.category if crop else "Cereal",
        "quantity": b.quantity,
        "slot_id": b.slot_id,
        "date": slot.date if slot else "",
        "start_time": slot.start_time if slot else "",
        "end_time": slot.end_time if slot else "",
        "queue_number": b.queue_number,
        "now_serving_number": b.now_serving_number,
        "ahead_in_queue": ahead,
        "estimated_wait_minutes": est_wait,
        "status": b.status,
        "procurement_status": b.procurement_status,
        "current_stage_index": b.current_stage_index,
        "total_amount": b.total_amount,
        "qr_code_data": b.qr_code_data,
        "created_at": b.created_at,
        "updated_at": b.updated_at
    }

def get_farmer_bookings(
    db: Session,
    farmer_id: int,
    status_filter: Optional[str] = None,
    crop_id: Optional[int] = None,
    search: Optional[str] = None
) -> List[dict]:
    q = db.query(Booking).filter(Booking.farmer_id == farmer_id)
    
    if status_filter:
        sf = status_filter.upper()
        if sf == "UPCOMING":
            q = q.filter(Booking.status == "CONFIRMED", Booking.current_stage_index == 0)
        elif sf == "ACTIVE":
            q = q.filter(Booking.status.in_(["CONFIRMED", "ARRIVED", "IN_PROGRESS"]), Booking.current_stage_index > 0, Booking.current_stage_index < 6)
        elif sf == "COMPLETED":
            q = q.filter(Booking.status == "COMPLETED")
        elif sf == "CANCELLED":
            q = q.filter(Booking.status == "CANCELLED")
            
    if crop_id:
        q = q.filter(Booking.crop_id == crop_id)
        
    if search and search.strip():
        s = f"%{search.strip()}%"
        q = q.filter(Booking.booking_id.ilike(s))
        
    bookings = q.order_by(desc(Booking.created_at)).all()
    return [serialize_booking(db, b) for b in bookings]

def get_booking_by_id(db: Session, booking_id_or_code: str) -> Optional[dict]:
    if booking_id_or_code.isdigit():
        b = db.query(Booking).filter(Booking.id == int(booking_id_or_code)).first()
    else:
        b = db.query(Booking).filter(Booking.booking_id == booking_id_or_code).first()
    if not b:
        return None
    return serialize_booking(db, b)

def cancel_booking(db: Session, booking_id: int, farmer_id: int) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.farmer_id == farmer_id).first()
    if not booking:
        raise ValueError("Booking not found.")
        
    if booking.status == "CANCELLED":
        raise ValueError("Booking is already cancelled.")
        
    if booking.current_stage_index > 1 or booking.status == "COMPLETED":
        raise ValueError("Cannot cancel booking once procurement verification has started.")
        
    # Free up slot capacity
    slot = db.query(Slot).filter(Slot.id == booking.slot_id).first()
    if slot and slot.booked_count > 0:
        slot.booked_count -= 1
        if slot.booked_count < slot.capacity:
            slot.status = "OPEN"
            
    booking.status = "CANCELLED"
    booking.procurement_status = "CANCELLED"
    
    # Notify farmer
    notif = Notification(
        farmer_id=farmer_id,
        booking_id=booking.id,
        title="⚠️ Booking Cancelled",
        message=f"Your booking {booking.booking_id} has been cancelled successfully.",
        type="BOOKING"
    )
    db.add(notif)
    db.commit()
    return serialize_booking(db, booking)

def advance_booking_stage(db: Session, booking_id: int, explicit_stage: Optional[int] = None) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise ValueError("Booking not found.")
        
    if booking.status == "CANCELLED":
        raise ValueError("Cannot advance a cancelled booking.")
        
    if explicit_stage is not None:
        target_stage = min(6, max(0, explicit_stage))
    else:
        target_stage = min(6, booking.current_stage_index + 1)
        
    booking.current_stage_index = target_stage
    stage_info = STAGES[target_stage]
    booking.procurement_status = stage_info["code"]
    
    if target_stage == 1:
        booking.status = "ARRIVED"
        notif_title = "📍 Arrived at Center"
        notif_msg = f"Your arrival for {booking.booking_id} is marked. Please proceed to the weighing bridge."
    elif target_stage in [2, 3]:
        booking.status = "IN_PROGRESS"
        notif_title = f"⚖️ {stage_info['label']}"
        notif_msg = f"Procurement stage updated to: {stage_info['label']} for booking {booking.booking_id}."
    elif target_stage == 4:
        booking.status = "COMPLETED"
        notif_title = "🎉 Procurement Completed"
        notif_msg = f"Your crop procurement for {booking.booking_id} is completed successfully! DBT payment processing has initiated."
    elif target_stage == 5:
        booking.status = "COMPLETED"
        notif_title = "💳 Payment Processing"
        notif_msg = f"Direct Benefit Transfer of ₹{booking.total_amount:,.2f} is in progress with PFMS."
        # Update payment status
        payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
        if payment:
            payment.status = "PROCESSING"
    elif target_stage == 6:
        booking.status = "COMPLETED"
        notif_title = "✅ Payment Credited"
        notif_msg = f"₹{booking.total_amount:,.2f} has been credited to your bank account via DBT."
        payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
        if payment:
            payment.status = "COMPLETED"
            payment.payment_date = datetime.utcnow()
            payment.transaction_id = f"DBT-TXN-{datetime.utcnow().year}-{secrets.randbelow(900000)+100000}"
            
    notif = Notification(
        farmer_id=booking.farmer_id,
        booking_id=booking.id,
        title=notif_title,
        message=notif_msg,
        type="PROCUREMENT"
    )
    db.add(notif)
    db.commit()
    return serialize_booking(db, booking)

# --- Digital Pass CRUD ---

def get_digital_pass(db: Session, booking_id: int) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise ValueError("Booking not found.")
        
    farmer = db.query(Farmer).filter(Farmer.id == booking.farmer_id).first()
    mandi = db.query(Mandi).filter(Mandi.id == booking.mandi_id).first()
    crop = db.query(Crop).filter(Crop.id == booking.crop_id).first()
    slot = db.query(Slot).filter(Slot.id == booking.slot_id).first()
    
    return {
        "booking_id": booking.booking_id,
        "farmer_name": farmer.name if farmer else "Farmer",
        "farmer_mobile": farmer.mobile if farmer else "",
        "farmer_id_card": farmer.farmer_id if farmer else "KL-AGRI-001",
        "mandi_name": mandi.name if mandi else "Center",
        "mandi_address": mandi.address if mandi else "",
        "mandi_phone": mandi.contact_phone if mandi else "+91 484 259 8811",
        "date": slot.date if slot else "",
        "time_slot": f"{slot.start_time} - {slot.end_time}" if slot else "",
        "crop_name": crop.name if crop else "Crop",
        "quantity": booking.quantity,
        "rate_per_kg": crop.rate_per_kg if crop else 0.0,
        "total_estimated_value": booking.total_amount,
        "queue_number": booking.queue_number,
        "status": booking.status,
        "qr_code_data": booking.qr_code_data or f"PASS-{booking.booking_id}",
        "issued_at": datetime.utcnow().strftime("%d %B %Y, %I:%M %p")
    }

# --- Payments CRUD ---

def get_payment_by_id(db: Session, payment_or_booking_id: int) -> dict:
    payment = db.query(Payment).filter(
        or_(Payment.id == payment_or_booking_id, Payment.booking_id == payment_or_booking_id)
    ).first()
    
    if not payment:
        raise ValueError("Payment record not found.")
        
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    farmer = db.query(Farmer).filter(Farmer.id == booking.farmer_id).first() if booking else None
    crop = db.query(Crop).filter(Crop.id == booking.crop_id).first() if booking else None
    mandi = db.query(Mandi).filter(Mandi.id == booking.mandi_id).first() if booking else None
    
    return {
        "id": payment.id,
        "booking_id": payment.booking_id,
        "booking_code": booking.booking_id if booking else "",
        "farmer_name": farmer.name if farmer else "",
        "crop_name": crop.name if crop else "",
        "quantity": booking.quantity if booking else 0.0,
        "mandi_name": mandi.name if mandi else "",
        "amount": payment.amount,
        "status": payment.status,
        "transaction_id": payment.transaction_id,
        "payment_date": payment.payment_date,
        "bank_name": payment.bank_name,
        "ifsc_prefix": payment.ifsc_prefix,
        "account_last4": payment.account_last4,
        "pfms_reference": payment.pfms_reference,
        "created_at": payment.created_at
    }

def get_farmer_payments(db: Session, farmer_id: int) -> List[dict]:
    farmer_bookings = db.query(Booking.id).filter(Booking.farmer_id == farmer_id).all()
    booking_ids = [b[0] for b in farmer_bookings]
    
    payments = db.query(Payment).filter(Payment.booking_id.in_(booking_ids)).order_by(desc(Payment.created_at)).all()
    return [get_payment_by_id(db, p.id) for p in payments]

def clear_payment(db: Session, payment_or_booking_id: int) -> dict:
    payment = db.query(Payment).filter(
        or_(Payment.id == payment_or_booking_id, Payment.booking_id == payment_or_booking_id)
    ).first()
    
    if not payment:
        raise ValueError("Payment record not found.")
        
    payment.status = "COMPLETED"
    payment.payment_date = datetime.utcnow()
    payment.transaction_id = f"DBT-PFMS-{datetime.utcnow().year}-{secrets.randbelow(900000)+100000}"
    
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking:
        booking.current_stage_index = 6
        booking.procurement_status = "PAYMENT_COMPLETED"
        booking.status = "COMPLETED"
        
        # Notify farmer
        notif = Notification(
            farmer_id=booking.farmer_id,
            booking_id=booking.id,
            title="💰 DBT Payment Cleared",
            message=f"₹{payment.amount:,.2f} credited to your account (Ref: {payment.transaction_id}).",
            type="PAYMENT"
        )
        db.add(notif)
        
    db.commit()
    return get_payment_by_id(db, payment.id)

# --- Notifications CRUD ---

def get_farmer_notifications(db: Session, farmer_id: int) -> List[Notification]:
    return db.query(Notification).filter(
        Notification.farmer_id == farmer_id
    ).order_by(desc(Notification.created_at)).all()

def mark_notification_read(db: Session, notif_id: int, farmer_id: int) -> Notification:
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.farmer_id == farmer_id
    ).first()
    if not notif:
        raise ValueError("Notification not found.")
    notif.read = True
    db.commit()
    db.refresh(notif)
    return notif

def mark_all_notifications_read(db: Session, farmer_id: int) -> int:
    updated = db.query(Notification).filter(
        Notification.farmer_id == farmer_id,
        Notification.read == False
    ).update({"read": True})
    db.commit()
    return updated

# --- Admin Dashboard & Queue Operations ---

def get_admin_dashboard_summary(db: Session, mandi_id: Optional[int] = None) -> dict:
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    q = db.query(Booking).filter(Booking.status != "CANCELLED")
    if mandi_id:
        q = q.filter(Booking.mandi_id == mandi_id)
        
    all_bookings = q.all()
    
    total = len(all_bookings)
    waiting = sum(1 for b in all_bookings if b.current_stage_index == 0)
    in_procurement = sum(1 for b in all_bookings if 1 <= b.current_stage_index <= 3)
    completed = sum(1 for b in all_bookings if b.current_stage_index >= 4)
    
    payment_pending = sum(1 for b in all_bookings if b.current_stage_index in [4, 5])
    payment_completed = sum(1 for b in all_bookings if b.current_stage_index == 6)
    
    total_kg = sum(b.quantity for b in all_bookings if b.current_stage_index >= 4)
    total_payout = sum(b.total_amount for b in all_bookings if b.current_stage_index == 6)
    
    # Calculate current now_serving max
    now_serving = max([b.now_serving_number for b in all_bookings], default=1)
    
    return {
        "total_bookings_today": total,
        "waiting_count": waiting,
        "in_procurement_count": in_procurement,
        "completed_count": completed,
        "payment_pending_count": payment_pending,
        "payment_completed_count": payment_completed,
        "now_serving": now_serving,
        "total_crop_procured_kg": round(total_kg, 2),
        "total_payout_inr": round(total_payout, 2)
    }

def get_admin_queue(db: Session, mandi_id: Optional[int] = None, search: Optional[str] = None) -> List[dict]:
    q = db.query(Booking).filter(Booking.status != "CANCELLED")
    if mandi_id:
        q = q.filter(Booking.mandi_id == mandi_id)
        
    bookings = q.order_by(Booking.queue_number).all()
    queue_list = []
    
    for b in bookings:
        farmer = db.query(Farmer).filter(Farmer.id == b.farmer_id).first()
        crop = db.query(Crop).filter(Crop.id == b.crop_id).first()
        slot = db.query(Slot).filter(Slot.id == b.slot_id).first()
        payment = db.query(Payment).filter(Payment.booking_id == b.id).first()
        
        farmer_name = farmer.name if farmer else "Farmer"
        farmer_mobile = farmer.mobile if farmer else ""
        crop_name = crop.name if crop else "Crop"
        slot_time = f"{slot.start_time} - {slot.end_time}" if slot else "10:00 AM"
        
        if search and search.strip():
            s = search.strip().lower()
            if not (s in b.booking_id.lower() or s in farmer_name.lower() or s in farmer_mobile):
                continue
                
        queue_list.append({
            "id": b.id,
            "booking_id": b.booking_id,
            "farmer_name": farmer_name,
            "farmer_mobile": farmer_mobile,
            "crop_name": crop_name,
            "quantity": b.quantity,
            "slot_time": slot_time,
            "queue_number": b.queue_number,
            "status": b.status,
            "procurement_status": b.procurement_status,
            "current_stage_index": b.current_stage_index,
            "estimated_wait_minutes": max(0, (b.queue_number - b.now_serving_number) * 3),
            "amount": b.total_amount,
            "payment_status": payment.status if payment else "PENDING"
        })
    return queue_list

def admin_call_next_farmer(db: Session, mandi_id: Optional[int] = None) -> dict:
    """Simulate calling the next farmer in queue."""
    q = db.query(Booking).filter(Booking.status != "CANCELLED")
    if mandi_id:
        q = q.filter(Booking.mandi_id == mandi_id)
        
    bookings = q.order_by(Booking.queue_number).all()
    if not bookings:
        return {"message": "No bookings available to call", "now_serving": 1}
        
    current_serving = max([b.now_serving_number for b in bookings], default=1)
    new_serving = current_serving + 1
    
    # Update now_serving on all active bookings
    for b in bookings:
        b.now_serving_number = new_serving
        ahead = max(0, b.queue_number - new_serving)
        b.estimated_wait_minutes = max(0, ahead * 3)
        
        # If this booking is the one being called right now, advance to ARRIVED / WEIGHING
        if b.queue_number == new_serving and b.current_stage_index == 0:
            b.current_stage_index = 1
            b.procurement_status = "ARRIVED"
            b.status = "ARRIVED"
            
            # Send high priority notification
            notif = Notification(
                farmer_id=b.farmer_id,
                booking_id=b.id,
                title="🔔 Now Serving: Your Turn!",
                message=f"Queue #{b.queue_number} is now being served! Please report immediately to Counter #1 with your Digital Pass.",
                type="QUEUE"
            )
            db.add(notif)
        elif b.queue_number > new_serving:
            # Send queue progress update
            ahead_cnt = b.queue_number - new_serving
            if ahead_cnt in [1, 3, 5]:
                notif = Notification(
                    farmer_id=b.farmer_id,
                    booking_id=b.id,
                    title="🔔 Queue Update",
                    message=f"You are now {ahead_cnt} ahead in the queue. Estimated wait: {ahead_cnt * 3} minutes.",
                    type="QUEUE"
                )
                db.add(notif)
                
    db.commit()
    return {
        "message": f"Called Next: Serving Queue #{new_serving}",
        "now_serving": new_serving,
        "total_active": len(bookings)
    }
