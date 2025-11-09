from fastapi import FastAPI
from app.core.database import SessionLocal
from app.routers import symptom_router, medication_router, diet_router
from sqlalchemy import text

app = FastAPI(title="MyHealthSense")

app.include_router(symptom_router.router)
app.include_router(medication_router.router)
app.include_router(diet_router.router)


@app.get("/")
def root():
    return {"message": "MyHealthSense backend is running 🚀"}

@app.get("/ping-db")
def ping_db():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        return {"status": "✅ Database connection successful"}
    except Exception as e:
        return {"status": "❌ Database connection failed", "error": str(e)}
    finally:
        db.close()
