from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user_model import User
from app.routers.health_router import weekly_summary
from app.services.insights_service import generate_rule_based_insights
from app.services.ai_service import AIService
from app.utils.ai_parser import parse_ai_json

router = APIRouter(
    prefix="/ai",
    tags=["AI Insights"]
)

ai_service = AIService()


@router.get("/weekly-summary")
async def get_ai_weekly_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns AI-powered weekly health insights
    grounded on rule-based analysis.
    """

    # 1️⃣ Aggregate weekly data
    summary = await weekly_summary(
        db=db,
        current_user=current_user
    )

    # 2️⃣ Rule-based insights (ground truth)
    rule_insights = generate_rule_based_insights(summary)

    # 3️⃣ AI-powered explanation (raw)
    ai_raw = ai_service.generate_weekly_health_insights(
        signals=rule_insights["signals"],
        observations=rule_insights["insights"],
        risk_level=rule_insights["risk_level"]
    )

    # 4️⃣ Safe JSON parsing
    parsed_ai = parse_ai_json(ai_raw["raw_response"])

    return {
        "period": summary["period"],
        "user_id": current_user.id,

        # Rule-based layer
        "signals": rule_insights["signals"],
        "observations": rule_insights["insights"],
        "risk_level": rule_insights["risk_level"],
        "risk_points": rule_insights["risk_points"],

        # AI layer (safe + structured)
        "ai_insights": parsed_ai.dict() if parsed_ai else None,
        "ai_fallback": parsed_ai is None,

        "confidence": "rule-based + ai-assisted"
    }
