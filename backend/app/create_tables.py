import asyncio
from app.core.database import Base, engine
from app.models.symptom_model import Symptom
from app.models.medication_model import Medication
from app.models.diet_model import Diet

async def create_tables():
    print("🔄 Creating database tables...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("✅ Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_tables())
