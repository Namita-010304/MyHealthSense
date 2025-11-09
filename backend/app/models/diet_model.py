from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base

class Diet(Base):
    __tablename__ = "diets"

    id = Column(Integer, primary_key=True, index=True)
    meal_type = Column(String, nullable=False)       # Breakfast / Lunch / Dinner / Snack
    food_items = Column(String, nullable=False)      # comma-separated or text
    calories = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
