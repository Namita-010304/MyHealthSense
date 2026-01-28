from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user_model import User
from app.models.diet_model import Diet
from app.models.symptom_model import Symptom
from app.models.medication_model import Medication
from app.models.lifestyle_model import Lifestyle

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/weekly-summary")
async def weekly_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    start_date = now - timedelta(days=7)

    # Diet
    diet_result = await db.execute(
        select(Diet).where(
            Diet.user_id == current_user.id,
            Diet.created_at >= start_date
        )
    )
    diets = diet_result.scalars().all()

    # Symptoms
    symptom_result = await db.execute(
        select(Symptom).where(
            Symptom.user_id == current_user.id,
            Symptom.created_at >= start_date
        )
    )
    symptoms = symptom_result.scalars().all()

    # Medications
    medication_result = await db.execute(
        select(Medication).where(
            Medication.user_id == current_user.id,
            Medication.created_at >= start_date
        )
    )
    medications = medication_result.scalars().all()

    # Lifestyle
    lifestyle_result = await db.execute(
        select(Lifestyle).where(
            Lifestyle.user_id == current_user.id,
            Lifestyle.created_at >= start_date
        )
    )
    lifestyle = lifestyle_result.scalars().all()

    return {
        "period": "last_7_days",
        "user_id": current_user.id,

        "diet_entries": diets,
        "symptoms": symptoms,
        "medications": medications,
        "lifestyle": lifestyle,

        "counts": {
            "diet": len(diets),
            "symptoms": len(symptoms),
            "medications": len(medications),
            "lifestyle": len(lifestyle),
        }
    }
