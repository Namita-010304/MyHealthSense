from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.lifestyle_model import Lifestyle
from app.schemas.lifestyle_schema import LifestyleCreate, LifestyleResponse
from app.utils.logger import logger
from app.core.dependencies import get_current_user
from app.models.user_model import User

router = APIRouter(prefix="/lifestyles", tags=["Lifestyle"])


@router.post("/", response_model=LifestyleResponse)
async def create_lifestyle(entry: LifestyleCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_entry = Lifestyle(
        user_id=current_user.id,
        **entry.dict()
    )
    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)

    logger.info("New lifestyle entry created.")
    return new_entry


@router.get("/me", response_model=List[LifestyleResponse])
async def get_my_lifestyles(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Lifestyle)
        .where(Lifestyle.user_id == current_user.id)
        .order_by(Lifestyle.created_at.desc()))
    items = result.scalars().all()

    logger.info(f"Fetched {len(items)} lifestyle entries.")
    return items


@router.put("/{lifestyle_id}", response_model=LifestyleResponse)
async def update_lifestyle(
    lifestyle_id: int,
    updated: LifestyleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Lifestyle).where(
        Lifestyle.id == lifestyle_id,
        Lifestyle.user_id == current_user.id
    ))
    entry = result.scalar_one_or_none()

    if not entry:
        logger.warning(f"Update failed — Lifestyle ID {lifestyle_id} not found.")
        raise HTTPException(status_code=404, detail="Lifestyle entry not found")

    for k, v in updated.dict().items():
        setattr(entry, k, v)

    await db.commit()
    await db.refresh(entry)

    logger.info(f"Updated Lifestyle ID {entry.id}")
    return entry


@router.delete("/{lifestyle_id}")
async def delete_lifestyle(lifestyle_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Lifestyle).where(
        Lifestyle.id == lifestyle_id,
        Lifestyle.user_id == current_user.id
    ))
    entry = result.scalar_one_or_none()

    if not entry:
        logger.warning(f"Delete failed — Lifestyle ID {lifestyle_id} not found.")
        raise HTTPException(status_code=404, detail="Lifestyle entry not found")

    await db.delete(entry)
    await db.commit()

    logger.info(f"Deleted Lifestyle ID {entry.id}")
    return {"message": "Lifestyle entry deleted successfully."}
