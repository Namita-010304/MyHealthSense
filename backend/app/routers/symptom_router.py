from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.symptom_model import Symptom
from app.schemas.symptom_schema import SymptomCreate, SymptomResponse
from app.utils.logger import logger
from typing import List

router = APIRouter(prefix="/symptoms", tags=["Symptoms"])

# POST → Add a new symptom
@router.post("/", response_model=SymptomResponse)
def create_symptom(symptom: SymptomCreate, db: Session = Depends(get_db)):
    new_symptom = Symptom(**symptom.dict())
    db.add(new_symptom)
    db.commit()
    db.refresh(new_symptom)

    logger.info(
        f"New symptom added: {new_symptom.symptom_name} (Severity: {new_symptom.severity})"
    )

    return new_symptom

# GET → Fetch all symptoms
@router.get("/", response_model=List[SymptomResponse])
def get_symptoms(db: Session = Depends(get_db)):
    symptoms = db.query(Symptom).order_by(Symptom.created_at.desc()).all()
    logger.info(f"Fetched {len(symptoms)} symptoms from database.")
    return symptoms

# PUT → Update a symptom by ID
@router.put("/{symptom_id}", response_model=SymptomResponse)
def update_symptom(symptom_id: int, updated_data: SymptomCreate, db: Session = Depends(get_db)):
    symptom = db.query(Symptom).filter(Symptom.id == symptom_id).first()

    if not symptom:
        logger.warning(f"Update failed — Symptom ID {symptom_id} not found.")
        raise HTTPException(status_code=404, detail="Symptom not found")

    for key, value in updated_data.dict().items():
        setattr(symptom, key, value)

    db.commit()
    db.refresh(symptom)

    logger.info(f"Updated Symptom ID {symptom.id}: {symptom.symptom_name} (Severity: {symptom.severity})")
    return symptom

# DELETE → Remove a symptom by ID
@router.delete("/{symptom_id}")
def delete_symptom(symptom_id: int, db: Session = Depends(get_db)):
    symptom = db.query(Symptom).filter(Symptom.id == symptom_id).first()

    if not symptom:
        logger.warning(f"Delete failed — Symptom ID {symptom_id} not found.")
        raise HTTPException(status_code=404, detail="Symptom not found")

    db.delete(symptom)
    db.commit()

    logger.info(f"Deleted Symptom ID {symptom.id}: {symptom.symptom_name}")
    return {"message": f"Symptom '{symptom.symptom_name}' deleted successfully."}