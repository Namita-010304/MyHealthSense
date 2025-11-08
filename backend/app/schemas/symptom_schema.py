from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Request model (for POST)
class SymptomCreate(BaseModel):
    symptom_name: str
    severity: Optional[str] = None
    notes: Optional[str] = None

# Response model (for GET)
class SymptomResponse(BaseModel):
    id: int
    symptom_name: str
    severity: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True   # allows SQLAlchemy models → Pydantic conversion (orm)
