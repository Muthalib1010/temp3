from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas import MandiResponse
import crud

router = APIRouter(prefix="/api/mandis", tags=["Mandis / Procurement Centers"])

@router.get("", response_model=List[MandiResponse])
def list_mandis(
    query: Optional[str] = Query(None, description="Search by name, location or district"),
    district: Optional[str] = Query(None, description="Filter by district"),
    latitude: Optional[float] = Query(None, description="User latitude for distance calculation"),
    longitude: Optional[float] = Query(None, description="User longitude for distance calculation"),
    db: Session = Depends(get_db)
):
    return crud.get_mandis(db, query=query, district=district, user_lat=latitude, user_lon=longitude)

@router.get("/{id}", response_model=MandiResponse)
def get_mandi(id: int, db: Session = Depends(get_db)):
    mandi = crud.get_mandi_by_id(db, id)
    if not mandi:
        raise HTTPException(status_code=404, detail="Procurement center not found.")
    mandis_list = crud.get_mandis(db, query=mandi.name)
    for m in mandis_list:
        if m["id"] == id:
            return m
    return mandi
