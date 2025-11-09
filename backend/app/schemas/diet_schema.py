from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DietCreate(BaseModel):
    meal_type: str
    food_items: str
    calories: Optional[int] = None
    notes: Optional[str] = None

class DietResponse(BaseModel):
    id: int
    meal_type: str
    food_items: str
    calories: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
