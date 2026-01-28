from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.database import get_db
from app.models.user_model import User
from app.models.chat_message_model import ChatMessage
from app.models.diet_model import Diet
from app.models.lifestyle_model import Lifestyle
from app.models.medication_model import Medication
from app.models.symptom_model import Symptom
from app.schemas.user_schema import UserCreate, UserLogin, TokenResponse, UserProfile, UserProfileUpdate
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.utils.logger import logger

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.email == user.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = User(
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(str(new_user.id))

    logger.info(f"New user registered: {new_user.email}")
    return TokenResponse(access_token=token)

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.email == user.email)
    )
    db_user = result.scalar_one_or_none()

    if not db_user or not verify_password(
        user.password, db_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(str(db_user.id))

    logger.info(f"User logged in: {db_user.email}")
    return TokenResponse(access_token=token)

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile information"""
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        age=current_user.age,
        gender=current_user.gender,
        height=current_user.height,
        weight=current_user.weight,
        wake_up_time=current_user.wake_up_time,
        sleep_time=current_user.sleep_time,
        meals_per_day=current_user.meals_per_day,
        exercise_frequency=current_user.exercise_frequency,
        water_intake=current_user.water_intake,
        medical_conditions=current_user.medical_conditions,
        health_goals=current_user.health_goals,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None
    )

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's profile information"""
    # Update only the fields that are provided
    for field, value in profile_data.dict(exclude_unset=True).items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)

    logger.info(f"User profile updated: {current_user.email}")

    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        age=current_user.age,
        gender=current_user.gender,
        height=current_user.height,
        weight=current_user.weight,
        wake_up_time=current_user.wake_up_time,
        sleep_time=current_user.sleep_time,
        meals_per_day=current_user.meals_per_day,
        exercise_frequency=current_user.exercise_frequency,
        water_intake=current_user.water_intake,
        medical_conditions=current_user.medical_conditions,
        health_goals=current_user.health_goals,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None
    )

@router.delete("/profile")
async def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete the current user's account and all associated data"""
    user_id = current_user.id

    # Delete all related data first
    await db.execute(delete(ChatMessage).where(ChatMessage.user_id == user_id))
    await db.execute(delete(Diet).where(Diet.user_id == user_id))
    await db.execute(delete(Lifestyle).where(Lifestyle.user_id == user_id))
    await db.execute(delete(Medication).where(Medication.user_id == user_id))
    await db.execute(delete(Symptom).where(Symptom.user_id == user_id))

    # Delete the user
    await db.execute(delete(User).where(User.id == user_id))

    await db.commit()

    logger.info(f"User account deleted: {current_user.email}")

    return {"message": "Account deleted successfully"}
