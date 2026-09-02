from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
from models import Farmer
from schemas import (
    BookingCreate, BookingResponse, BookingStageAdvance, DigitalPassResponse
)
from dependencies import get_current_user
import crud

router = APIRouter(prefix="/api/bookings", tags=["Bookings & Queue"])

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def book_procurement_slot(
    booking_in: BookingCreate,
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        booking = crud.create_booking(db, current_user.id, booking_in)
        return crud.serialize_booking(db, booking)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Booking could not be completed: {str(e)}"
        )

@router.get("", response_model=List[BookingResponse])
def get_farmer_bookings(
    status: Optional[str] = Query(None, description="Filter: UPCOMING, ACTIVE, COMPLETED, CANCELLED"),
    crop_id: Optional[int] = Query(None, description="Filter by crop ID"),
    search: Optional[str] = Query(None, description="Search by Booking ID"),
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_farmer_bookings(db, current_user.id, status_filter=status, crop_id=crop_id, search=search)

@router.get("/{id}", response_model=BookingResponse)
def get_booking_details(
    id: str,
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = crud.get_booking_by_id(db, id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found.")
    # Farmers can only access their own booking unless admin
    if current_user.role != "admin" and booking["farmer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this booking.")
    return booking

@router.patch("/{id}/cancel", response_model=BookingResponse)
def cancel_booking(
    id: int,
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        updated = crud.cancel_booking(db, id, current_user.id)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{id}/advance-stage", response_model=BookingResponse)
def advance_stage(
    id: int,
    payload: Optional[BookingStageAdvance] = None,
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    explicit_stage = payload.stage_index if payload else None
    try:
        updated = crud.advance_booking_stage(db, id, explicit_stage)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{id}/pass", response_model=DigitalPassResponse)
def get_digital_pass(
    id: int,
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return crud.get_digital_pass(db, id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
