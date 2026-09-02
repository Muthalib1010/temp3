from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import Farmer, Mandi, Crop, Slot, Booking, Payment, Notification
from auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(Farmer).count() > 0:
        print("Database already seeded.")
        db.close()
        return

    print("Seeding initial agriculture dataset...")

    # 1. Seed Farmers
    farmer1 = Farmer(
        name="Ramesh Kumar",
        mobile="9876543210",
        password_hash=hash_password("password123"),
        role="farmer",
        village="Aluva West",
        district="Ernakulam",
        state="Kerala",
        pincode="683101",
        preferred_language="en",
        farmer_id="KL-2026-00891",
        aadhaar_last4="4819"
    )
    farmer2 = Farmer(
        name="Suresh Patel",
        mobile="9876543211",
        password_hash=hash_password("password123"),
        role="farmer",
        village="Perumbavoor Town",
        district="Ernakulam",
        state="Kerala",
        pincode="683542",
        preferred_language="hi",
        farmer_id="KL-2026-00892",
        aadhaar_last4="9102"
    )
    farmer3 = Farmer(
        name="Priya Sharma",
        mobile="9876543212",
        password_hash=hash_password("password123"),
        role="farmer",
        village="Kothamangalam East",
        district="Ernakulam",
        state="Kerala",
        pincode="686691",
        preferred_language="ml",
        farmer_id="KL-2026-00893",
        aadhaar_last4="3381"
    )
    admin_user = Farmer(
        name="Officer Rajesh Verma",
        mobile="9999999999",
        password_hash=hash_password("admin123"),
        role="admin",
        village="District Collectorate",
        district="Ernakulam",
        state="Kerala",
        pincode="682030",
        preferred_language="en",
        farmer_id="GOV-ADM-001"
    )
    db.add_all([farmer1, farmer2, farmer3, admin_user])
    db.commit()

    # 2. Seed Mandis / Procurement Centers
    m1 = Mandi(
        name="Aluva Procurement Center",
        location="Market Road, Near Railway Station",
        district="Ernakulam",
        state="Kerala",
        address="APMC Yard, Market Rd, Aluva, Kerala 683101",
        operating_hours="08:00 AM - 05:00 PM",
        capacity_per_day=200,
        latitude=10.1076,
        longitude=76.3516,
        contact_phone="+91 484 259 8811",
        active=True
    )
    m2 = Mandi(
        name="Ernakulam APMC Mandi",
        location="Vyttila Agricultural Hub",
        district="Ernakulam",
        state="Kerala",
        address="APMC Complex, Vyttila Hub, Kochi, Kerala 682019",
        operating_hours="07:30 AM - 06:00 PM",
        capacity_per_day=250,
        latitude=9.9816,
        longitude=76.2999,
        contact_phone="+91 484 280 4422",
        active=True
    )
    m3 = Mandi(
        name="Perumbavoor Procurement Depot",
        location="AM Road, Near Sub-Jail",
        district="Ernakulam",
        state="Kerala",
        address="Farmers Depot, AM Road, Perumbavoor, Kerala 683542",
        operating_hours="08:30 AM - 05:30 PM",
        capacity_per_day=150,
        latitude=10.1147,
        longitude=76.4789,
        contact_phone="+91 484 252 3311",
        active=True
    )
    m4 = Mandi(
        name="Kothamangalam Farmers Hub",
        location="High Range Junction",
        district="Ernakulam",
        state="Kerala",
        address="Kothamangalam Agro Complex, NH-85, Kerala 686691",
        operating_hours="08:00 AM - 04:30 PM",
        capacity_per_day=120,
        latitude=10.0617,
        longitude=76.6277,
        contact_phone="+91 485 286 1190",
        active=True
    )
    db.add_all([m1, m2, m3, m4])
    db.commit()

    # 3. Seed Crops with MSP
    crops_data = [
        ("Paddy (Dhan)", "നെല്ല് / धान", "Cereals", 2300.0, 23.0),
        ("Wheat (Gehun)", "ഗോതമ്പ് / गेहूं", "Cereals", 2275.0, 22.75),
        ("Maize (Makka)", "ചോളം / मक्का", "Coarse Cereals", 2090.0, 20.90),
        ("Cotton (Kapas)", "പരുത്തി / कपास", "Commercial", 7121.0, 71.21),
        ("Groundnut (Moongphali)", "നിലക്കടല / मूंगफली", "Oilseeds", 6783.0, 67.83),
        ("Sugarcane (Ganna)", "കരിമ്പ് / गन्ना", "Cash Crops", 340.0, 3.40),
        ("Mustard (Sarson)", "കടുക് / सरसों", "Oilseeds", 5650.0, 56.50),
        ("Soyabean", "സോയാബീൻ / सोयाबीन", "Oilseeds", 4892.0, 48.92),
    ]
    crop_objs = []
    for name, local, cat, msp, rate in crops_data:
        c = Crop(
            name=name,
            local_name=local,
            category=cat,
            msp_price=msp,
            rate_per_kg=rate,
            active=True
        )
        crop_objs.append(c)
        db.add(c)
    db.commit()

    # 4. Seed Slots for all 4 Mandis across Today and next 7 days
    time_windows = [
        ("08:00 AM", "09:00 AM", 15),
        ("09:00 AM", "10:00 AM", 20),
        ("10:00 AM", "11:00 AM", 20),
        ("11:00 AM", "12:00 PM", 18),
        ("01:00 PM", "02:00 PM", 15),
        ("02:00 PM", "03:00 PM", 20),
        ("03:00 PM", "04:00 PM", 20),
        ("04:00 PM", "05:00 PM", 15),
    ]

    all_mandis = [m1, m2, m3, m4]
    today = datetime.utcnow().date()
    slot_objs = []

    for mandi in all_mandis:
        for day_offset in range(8):
            slot_date = (today + timedelta(days=day_offset)).strftime("%Y-%m-%d")
            for idx, (st, et, cap) in enumerate(time_windows):
                # Set realistic booked count
                if day_offset == 0 and idx == 2:
                    booked = 15 # Almost full
                    status = "ALMOST_FULL"
                elif day_offset == 0 and idx == 3:
                    booked = cap # Full
                    status = "FULL"
                elif day_offset == 0 and idx <= 1:
                    booked = 8
                    status = "OPEN"
                elif day_offset == 1 and idx == 1:
                    booked = 14
                    status = "ALMOST_FULL"
                else:
                    booked = 2 if day_offset <= 2 else 0
                    status = "OPEN"
                
                s = Slot(
                    mandi_id=mandi.id,
                    date=slot_date,
                    start_time=st,
                    end_time=et,
                    capacity=cap,
                    booked_count=booked,
                    status=status
                )
                db.add(s)
                slot_objs.append(s)
    db.commit()

    # 5. Seed Realistic Demo Bookings
    today_str = today.strftime("%Y-%m-%d")
    target_slot = db.query(Slot).filter(
        Slot.mandi_id == m1.id,
        Slot.date == today_str,
        Slot.start_time == "10:00 AM"
    ).first()

    if target_slot:
        # Active Booking for Demo Farmer Ramesh Kumar
        booking_ramesh = Booking(
            booking_id="FSB-2026-000123",
            farmer_id=farmer1.id,
            mandi_id=m1.id,
            crop_id=crop_objs[0].id, # Paddy
            slot_id=target_slot.id,
            quantity=850.0,
            queue_number=12,
            status="CONFIRMED",
            procurement_status="BOOKED",
            current_stage_index=0,
            estimated_wait_minutes=35,
            now_serving_number=8,
            total_amount=round(850.0 * 23.0, 2), # ₹19,550
            qr_code_data=f"FSB-PASS|FSB-2026-000123|FARMER:{farmer1.id}|MANDI:{m1.id}|DATE:{today_str}|QUEUE:12|CROP:Paddy|QTY:850KG",
            created_at=datetime.utcnow() - timedelta(hours=3)
        )
        db.add(booking_ramesh)
        db.commit()
        db.refresh(booking_ramesh)

        # Payment for Ramesh's active booking
        p_ramesh = Payment(
            booking_id=booking_ramesh.id,
            amount=booking_ramesh.total_amount,
            status="PENDING",
            bank_name="State Bank of India",
            ifsc_prefix="SBIN0008412",
            account_last4="4819",
            pfms_reference="PFMS-IND-2026-00123"
        )
        db.add(p_ramesh)

        # Past Completed Booking for Ramesh Kumar
        past_slot = db.query(Slot).filter(Slot.mandi_id == m1.id).first()
        booking_past = Booking(
            booking_id="FSB-2026-000089",
            farmer_id=farmer1.id,
            mandi_id=m1.id,
            crop_id=crop_objs[1].id, # Wheat
            slot_id=past_slot.id,
            quantity=500.0,
            queue_number=4,
            status="COMPLETED",
            procurement_status="PAYMENT_COMPLETED",
            current_stage_index=6,
            estimated_wait_minutes=0,
            now_serving_number=15,
            total_amount=round(500.0 * 22.75, 2), # ₹11,375
            qr_code_data=f"FSB-PASS|FSB-2026-000089|FARMER:{farmer1.id}|MANDI:{m1.id}|COMPLETED",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(booking_past)
        db.commit()
        db.refresh(booking_past)

        p_past = Payment(
            booking_id=booking_past.id,
            amount=booking_past.total_amount,
            status="COMPLETED",
            transaction_id="DBT-TXN-2026-889123",
            payment_date=datetime.utcnow() - timedelta(days=1),
            bank_name="State Bank of India",
            ifsc_prefix="SBIN0008412",
            account_last4="4819",
            pfms_reference="PFMS-IND-2026-00089"
        )
        db.add(p_past)

        # Other farmers' bookings for queue vibrancy
        booking_suresh = Booking(
            booking_id="FSB-2026-000120",
            farmer_id=farmer2.id,
            mandi_id=m1.id,
            crop_id=crop_objs[2].id, # Maize
            slot_id=target_slot.id,
            quantity=600.0,
            queue_number=8,
            status="IN_PROGRESS",
            procurement_status="WEIGHING",
            current_stage_index=2,
            estimated_wait_minutes=0,
            now_serving_number=8,
            total_amount=round(600.0 * 20.90, 2),
            qr_code_data="FSB-PASS|FSB-2026-000120",
            created_at=datetime.utcnow() - timedelta(hours=4)
        )
        booking_priya = Booking(
            booking_id="FSB-2026-000121",
            farmer_id=farmer3.id,
            mandi_id=m1.id,
            crop_id=crop_objs[0].id, # Paddy
            slot_id=target_slot.id,
            quantity=1200.0,
            queue_number=9,
            status="ARRIVED",
            procurement_status="ARRIVED",
            current_stage_index=1,
            estimated_wait_minutes=3,
            now_serving_number=8,
            total_amount=round(1200.0 * 23.0, 2),
            qr_code_data="FSB-PASS|FSB-2026-000121",
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.add_all([booking_suresh, booking_priya])
        db.commit()

    # 6. Notifications for Ramesh
    n1 = Notification(
        farmer_id=farmer1.id,
        title="🔔 Slot Booking Confirmed",
        message="Your procurement slot at Aluva Center is confirmed for 10:00 AM today. Queue #12.",
        type="BOOKING",
        read=True,
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    n2 = Notification(
        farmer_id=farmer1.id,
        title="🔔 Queue Update",
        message="Counter #1 is now serving Queue #8. You are 4 positions ahead. Estimated wait: 12 minutes.",
        type="QUEUE",
        read=False,
        created_at=datetime.utcnow() - timedelta(minutes=15)
    )
    n3 = Notification(
        farmer_id=farmer1.id,
        title="💰 Payment Received",
        message="₹11,375.00 has been credited to your SBI account via DBT for booking FSB-2026-000089.",
        type="PAYMENT",
        read=True,
        created_at=datetime.utcnow() - timedelta(days=1)
    )
    db.add_all([n1, n2, n3])
    db.commit()

    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
