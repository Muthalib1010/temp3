from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from database import Base

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    mobile = Column(String(15), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="farmer") # 'farmer' or 'admin'
    village = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    preferred_language = Column(String(10), default="en")
    farmer_id = Column(String(50), nullable=True, unique=True)
    aadhaar_last4 = Column(String(4), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    bookings = relationship("Booking", back_populates="farmer", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="farmer", cascade="all, delete-orphan")

class Mandi(Base):
    __tablename__ = "mandis"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    location = Column(String(150), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    operating_hours = Column(String(100), default="08:00 AM - 06:00 PM")
    capacity_per_day = Column(Integer, default=150)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    contact_phone = Column(String(20), default="+91 484 259 8811")
    active = Column(Boolean, default=True)

    # Relationships
    slots = relationship("Slot", back_populates="mandi", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="mandi")

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    local_name = Column(String(150), nullable=True)
    category = Column(String(50), nullable=False) # Cereals, Pulses, Commercial, Oilseeds, Cash Crops
    msp_price = Column(Float, nullable=False) # in Rupees per Quintal (100 kg)
    rate_per_kg = Column(Float, nullable=False) # MSP / 100
    active = Column(Boolean, default=True)

    # Relationships
    bookings = relationship("Booking", back_populates="crop")

class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    mandi_id = Column(Integer, ForeignKey("mandis.id"), nullable=False, index=True)
    date = Column(String(20), nullable=False, index=True) # YYYY-MM-DD
    start_time = Column(String(20), nullable=False) # e.g. "09:00 AM"
    end_time = Column(String(20), nullable=False)   # e.g. "10:00 AM"
    capacity = Column(Integer, default=20)
    booked_count = Column(Integer, default=0)
    status = Column(String(20), default="OPEN") # OPEN, ALMOST_FULL, FULL, CLOSED

    # Relationships
    mandi = relationship("Mandi", back_populates="slots")
    bookings = relationship("Booking", back_populates="slot")

    __table_args__ = (
        UniqueConstraint('mandi_id', 'date', 'start_time', name='_mandi_date_slot_uc'),
    )

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. FSB-2026-000123
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False, index=True)
    mandi_id = Column(Integer, ForeignKey("mandis.id"), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False, index=True)
    slot_id = Column(Integer, ForeignKey("slots.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False) # in kg
    queue_number = Column(Integer, nullable=False)
    status = Column(String(30), default="CONFIRMED") # CONFIRMED, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED
    procurement_status = Column(String(40), default="BOOKED") # BOOKED, ARRIVED, WEIGHING, QUALITY_CHECK, COMPLETED, PAYMENT_PROCESSING, PAYMENT_COMPLETED
    current_stage_index = Column(Integer, default=0) # 0 to 6
    estimated_wait_minutes = Column(Integer, default=30)
    now_serving_number = Column(Integer, default=1)
    total_amount = Column(Float, default=0.0)
    qr_code_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="bookings")
    mandi = relationship("Mandi", back_populates="bookings")
    crop = relationship("Crop", back_populates="bookings")
    slot = relationship("Slot", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="booking", cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String(30), default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED
    transaction_id = Column(String(100), unique=True, index=True, nullable=True)
    payment_date = Column(DateTime, nullable=True)
    bank_name = Column(String(100), default="State Bank of India")
    ifsc_prefix = Column(String(10), default="SBIN0008412")
    account_last4 = Column(String(4), default="4819")
    pfms_reference = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    booking = relationship("Booking", back_populates="payment")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), default="INFO") # BOOKING, QUEUE, REMINDER, PROCUREMENT, PAYMENT, SYSTEM
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="notifications")
    booking = relationship("Booking", back_populates="notifications")
