import asyncio
from app.core.database import Base, engine
from app.models.symptom_model import Symptom
from app.models.medication_model import Medication
from app.models.diet_model import Diet
from app.models.lifestyle_model import Lifestyle
from app.models.user_model import User
from app.models.chat_message_model import ChatMessage

async def create_tables():
    print("🔄 Dropping existing tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    print("🔄 Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("✅ Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_tables())
