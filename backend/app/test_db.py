from sqlalchemy import create_engine, text
from app.core.config import settings

print("🔍 Testing database connection...")
print(f"Using DATABASE_URL: {settings.DATABASE_URL}")

# create SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL)

try:
    # try to connect
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
        print("✅ Connected successfully to the PostgreSQL database!")
except Exception as e:
    print("❌ Database connection failed!")
    print("Error details:", e)
