from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Farmer
from schemas import FarmerResponse, FarmerUpdate
from dependencies import get_current_user
import crud

router = APIRouter(prefix="/api/farmers", tags=["Farmers"])

@router.get("/me", response_model=FarmerResponse)
def get_current_farmer_profile(current_user: Farmer = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=FarmerResponse)
def update_current_farmer_profile(
    update_in: FarmerUpdate,
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = crud.update_farmer(db, current_user, update_in)
    return updated
