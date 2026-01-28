from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from app.core.database import Base

class Diet(Base):
    __tablename__ = "diets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    meal_type = Column(String, nullable=False)
    food_items = Column(String, nullable=False)
    calories = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
