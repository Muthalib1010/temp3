from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Farmer
from schemas import NotificationResponse
from dependencies import get_current_user
import crud

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_farmer_notifications(db, current_user.id)

@router.patch("/{id}/read", response_model=NotificationResponse)
def mark_read(
    id: int,
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return crud.mark_notification_read(db, id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/read-all")
def mark_all_read(
    current_user: Farmer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = crud.mark_all_notifications_read(db, current_user.id)
    return {"message": f"Marked {count} notifications as read", "count": count}
