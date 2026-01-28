from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.models.chat_message_model import ChatMessage

MAX_MEMORY = 10  # last 10 messages (5 user + 5 AI)

async def save_message(
    db: AsyncSession,
    user_id: int,
    role: str,
    content: str
):
    message = ChatMessage(
        user_id=user_id,
        role=role,
        content=content
    )
    db.add(message)
    await db.commit()

async def get_recent_messages(
    db: AsyncSession,
    user_id: int
) -> List[ChatMessage]:
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(MAX_MEMORY)
    )
    messages = result.scalars().all()
    return list(reversed(messages))  # chronological order
