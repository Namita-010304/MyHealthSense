from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user_model import User
from app.schemas.chat_schema import ChatRequest
from app.routers.health_router import weekly_summary
from app.services.insights_service import generate_rule_based_insights
from app.services.ai_service import AIService
from app.services.chat_memory_service import (
    save_message,
    get_recent_messages
)

router = APIRouter(
    prefix="/ai",
    tags=["AI Chat"]
)

ai_service = AIService()

@router.post("/chat")
async def health_chat(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1️⃣ Fetch recent chat memory
    history = await get_recent_messages(db, current_user.id)

    memory_text = "\n".join(
        f"{m.role}: {m.content}" for m in history
    )

    # 2️⃣ Weekly health context
    summary = await weekly_summary(db=db, current_user=current_user)
    rules = generate_rule_based_insights(summary)

    context = f"""
Risk level: {rules['risk_level']}
Signals: {rules['signals']}
Observations: {rules['insights']}
"""

    # 3️⃣ Save user message
    await save_message(
        db, current_user.id, "user", payload.message
    )

    # 4️⃣ AI reply with memory
    reply = ai_service.chat_about_health(
        user_message=payload.message,
        context=context,
        memory=memory_text
    )

    # 5️⃣ Save AI reply
    await save_message(
        db, current_user.id, "assistant", reply
    )

    return {
        "reply": reply,
        "confidence": "ai-assisted with memory"
    }
