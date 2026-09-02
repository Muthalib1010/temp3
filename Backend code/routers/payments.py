from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Farmer
from schemas import PaymentResponse
from dependencies import get_current_user
import crud

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.get("", response_model=List[PaymentResponse])
def get_my_payments(
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_farmer_payments(db, current_user.id)

@router.get("/{id}", response_model=PaymentResponse)
def get_payment(
    id: int,
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return crud.get_payment_by_id(db, id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{id}/clear", response_model=PaymentResponse)
def simulate_payment_clearance(
    id: int,
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Simulates DBT PFMS direct transfer clearance into farmer's account."""
    try:
        return crud.clear_payment(db, id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
