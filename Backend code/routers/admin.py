from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Farmer
from schemas import AdminDashboardSummary, AdminQueueItem, BookingStageAdvance
from dependencies import get_current_user
import crud

router = APIRouter(prefix="/api/admin", tags=["Admin & Mandi Operations"])

@router.get("/dashboard", response_model=AdminDashboardSummary)
def get_dashboard_stats(
    mandi_id: Optional[int] = Query(None, description="Optional filter by Mandi ID"),
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_admin_dashboard_summary(db, mandi_id)

@router.get("/queue", response_model=List[AdminQueueItem])
def get_live_queue(
    mandi_id: Optional[int] = Query(None, description="Optional filter by Mandi ID"),
    search: Optional[str] = Query(None, description="Search by farmer name, mobile or booking ID"),
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_admin_queue(db, mandi_id, search)

@router.post("/call-next")
def call_next_farmer(
    mandi_id: Optional[int] = Query(None, description="Procurement center ID"),
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin calls next farmer in queue, advancing the now serving counter."""
    return crud.admin_call_next_farmer(db, mandi_id)

@router.patch("/bookings/{id}/advance")
def admin_advance_stage(
    id: int,
    payload: Optional[BookingStageAdvance] = None,
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    explicit_stage = payload.stage_index if payload else None
    try:
        return crud.advance_booking_stage(db, id, explicit_stage)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
