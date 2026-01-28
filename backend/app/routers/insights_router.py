from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user_model import User
from app.routers.health_router import weekly_summary
from app.services.insights_service import generate_rule_based_insights

router = APIRouter(
    prefix="/insights",
    tags=["Insights"]
)

@router.get("/weekly")
async def get_weekly_rule_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns rule-based weekly health insights for the logged-in user.
    """

    # 1️⃣ Get aggregated weekly data
    summary = await weekly_summary(
        db=db,
        current_user=current_user
    )

    # 2️⃣ Generate rule-based insights
    insights = generate_rule_based_insights(summary)

    return {
        "period": summary["period"],
        "user_id": current_user.id,
        "signals": insights["signals"],
        "observations": insights["insights"],
        "risk_level": insights["risk_level"],
        "risk_points": insights["risk_points"],
        "confidence": insights["confidence"]
    }
