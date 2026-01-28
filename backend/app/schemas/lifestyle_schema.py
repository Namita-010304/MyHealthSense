from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LifestyleCreate(BaseModel):
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = None     # 1–5
    exercise_minutes: Optional[int] = None
    exercise_type: Optional[str] = None
    stress_level: Optional[int] = None      # 1–5
    water_intake: Optional[float] = None    # liters
    notes: Optional[str] = None


class LifestyleResponse(BaseModel):
    id: int
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = None
    exercise_minutes: Optional[int] = None
    exercise_type: Optional[str] = None
    stress_level: Optional[int] = None
    water_intake: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
