from app.core.database import SessionLocal

print("🔍 Testing DB session...")

try:
    db = SessionLocal()
    print("✅ Database session created successfully:", db)
    db.close()
except Exception as e:
    print("❌ Failed to create DB session:", e)
