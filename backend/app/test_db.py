import asyncio
from sqlalchemy import text
from app.core.database import engine

async def test_connection():
    print("🔍 Testing ASYNC DB connection...")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("✅ Connected successfully!", result.scalar())
    except Exception as e:
        print("❌ Connection failed:", e)

asyncio.run(test_connection())
