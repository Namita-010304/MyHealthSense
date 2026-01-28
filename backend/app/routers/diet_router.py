from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.diet_model import Diet
from app.schemas.diet_schema import DietCreate, DietResponse
from app.utils.logger import logger
from app.core.dependencies import get_current_user
from app.models.user_model import User

router = APIRouter(prefix="/diets", tags=["Diets"])

@router.post("/", response_model=DietResponse)
async def create_diet(
    entry: DietCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_entry = Diet(
        user_id=current_user.id,
        **entry.dict()
    )
    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)
    return new_entry

@router.get("/me", response_model=list[DietResponse])
async def get_my_diets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Diet)
        .where(Diet.user_id == current_user.id)
        .order_by(Diet.created_at.desc())
    )
    return result.scalars().all()

@router.put("/{diet_id}", response_model=DietResponse)
async def update_diet(
    diet_id: int,
    updated: DietCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Diet).where(
            Diet.id == diet_id,
            Diet.user_id == current_user.id
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="Diet not found")

    for k, v in updated.dict().items():
        setattr(entry, k, v)

    await db.commit()
    await db.refresh(entry)
    return entry

@router.delete("/{diet_id}")
async def delete_diet(
    diet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Diet).where(
            Diet.id == diet_id,
            Diet.user_id == current_user.id
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=404, detail="Diet not found")

    await db.delete(entry)
    await db.commit()
    return {"message": "Diet entry deleted"}
