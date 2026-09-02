from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Farmer
from schemas import (
    FarmerRegister, FarmerLogin, DemoLoginRequest, OTPLoginRequest,
    ForgotPasswordRequest, TokenResponse, FarmerResponse
)
from auth import create_access_token, hash_password, verify_password
import crud

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(farmer_in: FarmerRegister, db: Session = Depends(get_db)):
    existing = crud.get_farmer_by_mobile(db, farmer_in.mobile)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A farmer account with this mobile number already exists."
        )
    farmer = crud.create_farmer(db, farmer_in, role="farmer")
    token = create_access_token({"sub": farmer.id, "role": farmer.role, "name": farmer.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "farmer": farmer
    }

@router.post("/login", response_model=TokenResponse)
def login(login_in: FarmerLogin, db: Session = Depends(get_db)):
    farmer = crud.authenticate_farmer(db, login_in.mobile, login_in.password)
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mobile number or password is incorrect."
        )
    token = create_access_token({"sub": farmer.id, "role": farmer.role, "name": farmer.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "farmer": farmer
    }

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(payload: DemoLoginRequest, db: Session = Depends(get_db)):
    """Fast login for SIH hackathon judges."""
    role = payload.role.lower()
    if role == "admin":
        user = db.query(Farmer).filter(Farmer.role == "admin").first()
        if not user:
            # Fallback create admin
            reg = FarmerRegister(
                name="Officer Rajesh Verma",
                mobile="9999999999",
                password="admin",
                village="Collectorate",
                district="Ernakulam",
                state="Kerala"
            )
            user = crud.create_farmer(db, reg, role="admin")
    else:
        user = db.query(Farmer).filter(Farmer.role == "farmer", Farmer.mobile == "9876543210").first()
        if not user:
            user = db.query(Farmer).filter(Farmer.role == "farmer").first()
            if not user:
                reg = FarmerRegister(
                    name="Ramesh Kumar (Demo)",
                    mobile="9876543210",
                    password="password123",
                    village="Aluva West",
                    district="Ernakulam",
                    state="Kerala",
                    pincode="683101"
                )
                user = crud.create_farmer(db, reg, role="farmer")
                
    token = create_access_token({"sub": user.id, "role": user.role, "name": user.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "farmer": user
    }

@router.post("/otp-login", response_model=TokenResponse)
def otp_login(payload: OTPLoginRequest, db: Session = Depends(get_db)):
    """Simulated OTP verification for farmers (OTP 1234 or any 4-digit code works in demo)."""
    farmer = crud.get_farmer_by_mobile(db, payload.mobile)
    if not farmer:
        # Auto-create profile on OTP if first time
        reg = FarmerRegister(
            name="Kisan Member",
            mobile=payload.mobile,
            password="password123",
            district="Ernakulam",
            state="Kerala"
        )
        farmer = crud.create_farmer(db, reg, role="farmer")
        
    token = create_access_token({"sub": farmer.id, "role": farmer.role, "name": farmer.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "farmer": farmer
    }

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    farmer = crud.get_farmer_by_mobile(db, payload.mobile)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer mobile number not found.")
    farmer.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully. Please login with your new password."}
