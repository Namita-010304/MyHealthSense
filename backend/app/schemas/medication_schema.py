from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Request model
class MedicationCreate(BaseModel):
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    notes: Optional[str] = None

# Response model
class MedicationResponse(BaseModel):
    id: int
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
