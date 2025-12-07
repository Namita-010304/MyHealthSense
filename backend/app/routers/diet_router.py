from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.diet_model import Diet
from app.schemas.diet_schema import DietCreate, DietResponse
from app.utils.logger import logger

router = APIRouter(prefix="/diets", tags=["Diets"])


@router.post("/", response_model=DietResponse)
async def create_diet(entry: DietCreate, db: AsyncSession = Depends(get_db)):
    new_entry = Diet(**entry.dict())
    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)

    logger.info(f"New diet entry: {new_entry.meal_type} - items: {new_entry.food_items}")
    return new_entry


@router.get("/", response_model=List[DietResponse])
async def get_diets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Diet).order_by(Diet.created_at.desc()))
    items = result.scalars().all()

    logger.info(f"Fetched {len(items)} diet entries.")
    return items


@router.put("/{diet_id}", response_model=DietResponse)
async def update_diet(diet_id: int, updated: DietCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Diet).filter(Diet.id == diet_id))
    entry = result.scalar_one_or_none()

    if not entry:
        logger.warning(f"Update failed — Diet ID {diet_id} not found.")
        raise HTTPException(status_code=404, detail="Diet entry not found")

    for k, v in updated.dict().items():
        setattr(entry, k, v)

    await db.commit()
    await db.refresh(entry)

    logger.info(f"Updated Diet ID {entry.id}: {entry.meal_type}")
    return entry


@router.delete("/{diet_id}")
async def delete_diet(diet_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Diet).filter(Diet.id == diet_id))
    entry = result.scalar_one_or_none()

    if not entry:
        logger.warning(f"Delete failed — Diet ID {diet_id} not found.")
        raise HTTPException(status_code=404, detail="Diet entry not found")

    await db.delete(entry)
    await db.commit()

    logger.info(f"Deleted Diet ID {entry.id}: {entry.meal_type}")
    return {"message": f"Diet entry '{entry.meal_type}' deleted successfully."}
