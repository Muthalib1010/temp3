from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator

# --- Auth Schemas ---
class FarmerRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    mobile: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=4)
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    preferred_language: Optional[str] = "en"
    farmer_id: Optional[str] = None
    aadhaar_last4: Optional[str] = None

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        cleaned = "".join(filter(str.isdigit, v))
        if len(cleaned) < 10:
            raise ValueError("Mobile number must have at least 10 digits")
        return cleaned[-10:]

class FarmerLogin(BaseModel):
    mobile: str
    password: str

class DemoLoginRequest(BaseModel):
    role: str = Field(default="farmer") # "farmer" or "admin"

class OTPLoginRequest(BaseModel):
    mobile: str
    otp: str

class ForgotPasswordRequest(BaseModel):
    mobile: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    farmer: "FarmerResponse"

class FarmerUpdate(BaseModel):
    name: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    preferred_language: Optional[str] = None
    farmer_id: Optional[str] = None
    aadhaar_last4: Optional[str] = None

class FarmerResponse(BaseModel):
    id: int
    name: str
    mobile: str
    role: str
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    preferred_language: str
    farmer_id: Optional[str] = None
    aadhaar_last4: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Mandi Schemas ---
class MandiResponse(BaseModel):
    id: int
    name: str
    location: str
    district: str
    state: str
    address: str
    operating_hours: str
    capacity_per_day: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_phone: str
    active: bool
    distance_km: Optional[float] = None
    available_slots_today: Optional[int] = None
    status: Optional[str] = "Open"

    class Config:
        from_attributes = True

# --- Crop Schemas ---
class CropResponse(BaseModel):
    id: int
    name: str
    local_name: Optional[str] = None
    category: str
    msp_price: float # ₹ per Quintal
    rate_per_kg: float # ₹ per kg
    active: bool

    class Config:
        from_attributes = True

# --- Slot Schemas ---
class SlotResponse(BaseModel):
    id: int
    mandi_id: int
    date: str
    start_time: str
    end_time: str
    capacity: int
    booked_count: int
    available_count: int
    status: str # OPEN, ALMOST_FULL, FULL, CLOSED

    class Config:
        from_attributes = True

class DateAvailabilityResponse(BaseModel):
    date: str
    day_name: str
    total_slots: int
    available_slots: int
    is_available: bool
    status_label: str

# --- Booking Schemas ---
class BookingCreate(BaseModel):
    mandi_id: int
    crop_id: int
    slot_id: int
    quantity: float = Field(..., gt=0, le=10000) # Max 10,000 kg per booking

class BookingStageAdvance(BaseModel):
    stage_index: Optional[int] = None # Or next stage automatically if None

class BookingResponse(BaseModel):
    id: int
    booking_id: str
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_mobile: Optional[str] = None
    mandi_id: int
    mandi_name: Optional[str] = None
    mandi_district: Optional[str] = None
    crop_id: int
    crop_name: Optional[str] = None
    crop_category: Optional[str] = None
    quantity: float
    slot_id: int
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    queue_number: int
    now_serving_number: int
    ahead_in_queue: int
    estimated_wait_minutes: int
    status: str
    procurement_status: str
    current_stage_index: int
    total_amount: float
    qr_code_data: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DigitalPassResponse(BaseModel):
    booking_id: str
    farmer_name: str
    farmer_mobile: str
    farmer_id_card: Optional[str] = None
    mandi_name: str
    mandi_address: str
    mandi_phone: str
    date: str
    time_slot: str
    crop_name: str
    quantity: float
    rate_per_kg: float
    total_estimated_value: float
    queue_number: int
    status: str
    qr_code_data: str
    issued_at: str

# --- Payment Schemas ---
class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    booking_code: Optional[str] = None
    farmer_name: Optional[str] = None
    crop_name: Optional[str] = None
    quantity: Optional[float] = None
    mandi_name: Optional[str] = None
    amount: float
    status: str # PENDING, PROCESSING, COMPLETED, FAILED
    transaction_id: Optional[str] = None
    payment_date: Optional[datetime] = None
    bank_name: str
    ifsc_prefix: str
    account_last4: str
    pfms_reference: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    farmer_id: int
    booking_id: Optional[int] = None
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Admin Dashboard Schemas ---
class AdminDashboardSummary(BaseModel):
    total_bookings_today: int
    waiting_count: int
    in_procurement_count: int
    completed_count: int
    payment_pending_count: int
    payment_completed_count: int
    now_serving: int
    total_crop_procured_kg: float
    total_payout_inr: float

class AdminQueueItem(BaseModel):
    id: int
    booking_id: str
    farmer_name: str
    farmer_mobile: str
    crop_name: str
    quantity: float
    slot_time: str
    queue_number: int
    status: str
    procurement_status: str
    current_stage_index: int
    estimated_wait_minutes: int
    amount: float
    payment_status: str
