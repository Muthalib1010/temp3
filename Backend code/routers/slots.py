from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas import SlotResponse, DateAvailabilityResponse
import crud

router = APIRouter(prefix="/api/slots", tags=["Slots & Availability"])

@router.get("", response_model=List[SlotResponse])
def get_slots(
    mandi_id: int = Query(..., description="ID of the procurement center"),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format (defaults to today)"),
    db: Session = Depends(get_db)
):
    target_date = date or datetime.utcnow().strftime("%Y-%m-%d")
    return crud.get_slots_by_mandi_and_date(db, mandi_id, target_date)

@router.get("/availability", response_model=List[DateAvailabilityResponse])
def get_date_availability(
    mandi_id: int = Query(..., description="ID of the procurement center"),
    days_ahead: int = Query(7, ge=1, le=14, description="Number of days to check"),
    db: Session = Depends(get_db)
):
    return crud.get_date_availability(db, mandi_id, days_ahead)

@router.get("/{id}", response_model=SlotResponse)
def get_slot(id: int, db: Session = Depends(get_db)):
    slot = crud.get_slot_by_id(db, id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found.")
    avail = max(0, slot.capacity - slot.booked_count)
    return {
        "id": slot.id,
        "mandi_id": slot.mandi_id,
        "date": slot.date,
        "start_time": slot.start_time,
        "end_time": slot.end_time,
        "capacity": slot.capacity,
        "booked_count": slot.booked_count,
        "available_count": avail,
        "status": slot.status
    }
