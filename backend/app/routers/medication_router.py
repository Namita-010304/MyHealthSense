from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.medication_model import Medication
from app.schemas.medication_schema import MedicationCreate, MedicationResponse
from app.utils.logger import logger
from app.core.dependencies import get_current_user
from app.models.user_model import User

router = APIRouter(prefix="/medications", tags=["Medications"])

# POST → Add new medication
@router.post("/", response_model=MedicationResponse)
async def create_medication(medication: MedicationCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_med = Medication(
        user_id=current_user.id,
        **medication.dict()
    )
    db.add(new_med)
    await db.commit()
    await db.refresh(new_med)

    logger.info(f"New medication added: {new_med.medicine_name} ({new_med.dosage})")
    return new_med


# GET → Fetch all medications
@router.get("/me", response_model=List[MedicationResponse])
async def get_my_medications(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Medication)
        .where(Medication.user_id == current_user.id)
        .order_by(Medication.created_at.desc())
    )
    meds = result.scalars().all()

    logger.info(f"Fetched {len(meds)} medications from database.")
    return meds


# PUT → Update medication by ID
@router.put("/{med_id}", response_model=MedicationResponse)
async def update_medication(med_id: int, updated_data: MedicationCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Medication).where(
            Medication.id == med_id,
            Medication.user_id == current_user.id
        )
    )
    med = result.scalar_one_or_none()

    if not med:
        logger.warning(f"Update failed — Medication ID {med_id} not found.")
        raise HTTPException(status_code=404, detail="Medication not found")

    for key, value in updated_data.dict().items():
        setattr(med, key, value)

    await db.commit()
    await db.refresh(med)

    logger.info(f"Updated Medication ID {med.id}: {med.medicine_name}")
    return med


# DELETE → Remove medication by ID
@router.delete("/{med_id}")
async def delete_medication(med_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Medication).where(
            Medication.id == med_id,
            Medication.user_id == current_user.id
        )
    )
    med = result.scalar_one_or_none()

    if not med:
        logger.warning(f"Delete failed — Medication ID {med_id} not found.")
        raise HTTPException(status_code=404, detail="Medication not found")

    await db.delete(med)
    await db.commit()

    logger.info(f"Deleted Medication ID {med.id}: {med.medicine_name}")
    return {"message": f"Medication '{med.medicine_name}' deleted successfully."}
