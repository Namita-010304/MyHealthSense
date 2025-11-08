from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.medication_model import Medication
from app.schemas.medication_schema import MedicationCreate, MedicationResponse
from app.utils.logger import logger

router = APIRouter(prefix="/medications", tags=["Medications"])

# POST → Add new medication
@router.post("/", response_model=MedicationResponse)
def create_medication(medication: MedicationCreate, db: Session = Depends(get_db)):
    new_med = Medication(**medication.dict())
    db.add(new_med)
    db.commit()
    db.refresh(new_med)
    logger.info(f"New medication added: {new_med.medicine_name} ({new_med.dosage})")
    return new_med

#  GET → Fetch all medications
@router.get("/", response_model=List[MedicationResponse])
def get_medications(db: Session = Depends(get_db)):
    meds = db.query(Medication).order_by(Medication.created_at.desc()).all()
    logger.info(f"Fetched {len(meds)} medications from database.")
    return meds

# PUT → Update medication by ID
@router.put("/{med_id}", response_model=MedicationResponse)
def update_medication(med_id: int, updated_data: MedicationCreate, db: Session = Depends(get_db)):
    med = db.query(Medication).filter(Medication.id == med_id).first()
    if not med:
        logger.warning(f"Update failed — Medication ID {med_id} not found.")
        raise HTTPException(status_code=404, detail="Medication not found")
    for key, value in updated_data.dict().items():
        setattr(med, key, value)
    db.commit()
    db.refresh(med)
    logger.info(f"Updated Medication ID {med.id}: {med.medicine_name}")
    return med

# DELETE → Remove medication by ID
@router.delete("/{med_id}")
def delete_medication(med_id: int, db: Session = Depends(get_db)):
    med = db.query(Medication).filter(Medication.id == med_id).first()
    if not med:
        logger.warning(f"Delete failed — Medication ID {med_id} not found.")
        raise HTTPException(status_code=404, detail="Medication not found")
    db.delete(med)
    db.commit()
    logger.info(f"Deleted Medication ID {med.id}: {med.medicine_name}")
    return {"message": f"Medication '{med.medicine_name}' deleted successfully."}
