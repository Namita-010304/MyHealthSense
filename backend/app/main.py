from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.routers import symptom_router, medication_router, diet_router
from app.core.database import get_db

# Initialize FastAPI app
app = FastAPI(title="MyHealthSense")

# Include your routers
app.include_router(symptom_router.router)
app.include_router(medication_router.router)
app.include_router(diet_router.router)

@app.get("/")
def root():
    return {"message": "MyHealthSense backend is running 🚀"}

@app.get("/ping-db")
async def ping_db(db: AsyncSession = Depends(get_db)):
    """
    Checks async connection to Neon PostgreSQL.
    """
    try:
        result = await db.execute(text("SELECT 1"))
        return {
            "status": "Database connection successful",
            "result": result.scalar()
        }
    except Exception as e:
        return {
            "status": "Database connection failed",
            "error": str(e)
        }
