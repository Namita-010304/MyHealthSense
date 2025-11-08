from sqlalchemy import create_engine
from app.core.config import settings

print("🔍 Testing database connection...")

engine = create_engine(settings.DATABASE_URL)

try:
    with engine.connect() as conn:
        print("✅ Connected successfully to:", conn)
except Exception as e:
    print("❌ Connection failed:", e)
