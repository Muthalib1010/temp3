from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import CropResponse
import crud

router = APIRouter(prefix="/api/crops", tags=["Crops & MSP Rates"])

@router.get("", response_model=List[CropResponse])
def list_crops(db: Session = Depends(get_db)):
    return crud.get_crops(db)

@router.get("/{id}", response_model=CropResponse)
def get_crop(id: int, db: Session = Depends(get_db)):
    crop = crud.get_crop_by_id(db, id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found.")
    return crop
