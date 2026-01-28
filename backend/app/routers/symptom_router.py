from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.symptom_model import Symptom
from app.schemas.symptom_schema import SymptomCreate, SymptomResponse
from app.utils.logger import logger
from app.core.dependencies import get_current_user
from app.models.user_model import User

router = APIRouter(prefix="/symptoms", tags=["Symptoms"])


# POST → Add a new symptom
@router.post("/", response_model=SymptomResponse)
async def create_symptom(symptom: SymptomCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_symptom = Symptom(
        user_id=current_user.id,
        **symptom.dict()
    )
    db.add(new_symptom)

    await db.commit()
    await db.refresh(new_symptom)

    logger.info(
        f"New symptom added: {new_symptom.symptom_name} (Severity: {new_symptom.severity})"
    )

    return new_symptom


# GET → Fetch all symptoms
@router.get("/me", response_model=List[SymptomResponse])
async def get_my_symptoms(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Symptom)
        .where(Symptom.user_id == current_user.id)
        .order_by(Symptom.created_at.desc())
    )
    symptoms = result.scalars().all()

    logger.info(f"Fetched {len(symptoms)} symptoms from database.")
    return symptoms


# PUT → Update a symptom by ID
@router.put("/{symptom_id}", response_model=SymptomResponse)
async def update_symptom(symptom_id: int, updated_data: SymptomCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Symptom).where(
            Symptom.id == symptom_id,
            Symptom.user_id == current_user.id
        )
    )
    symptom = result.scalar_one_or_none()

    if not symptom:
        logger.warning(f"Update failed — Symptom ID {symptom_id} not found.")
        raise HTTPException(status_code=404, detail="Symptom not found")

    for key, value in updated_data.dict().items():
        setattr(symptom, key, value)

    await db.commit()
    await db.refresh(symptom)

    logger.info(
        f"Updated Symptom ID {symptom.id}: {symptom.symptom_name} (Severity: {symptom.severity})"
    )
    return symptom


# DELETE → Remove a symptom by ID
@router.delete("/{symptom_id}")
async def delete_symptom(symptom_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Symptom).where(
            Symptom.id == symptom_id,
            Symptom.user_id == current_user.id
        )
    )
    symptom = result.scalar_one_or_none()

    if not symptom:
        logger.warning(f"Delete failed — Symptom ID {symptom_id} not found.")
        raise HTTPException(status_code=404, detail="Symptom not found")

    # async delete
    await db.delete(symptom)
    await db.commit()

    logger.info(f"Deleted Symptom ID {symptom.id}: {symptom.symptom_name}")
    return {"message": f"Symptom '{symptom.symptom_name}' deleted successfully."}
