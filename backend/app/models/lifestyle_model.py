from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from app.core.database import Base

class Lifestyle(Base):
    __tablename__ = "lifestyles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    sleep_hours = Column(Float, nullable=True)              # e.g. 6.5
    sleep_quality = Column(Integer, nullable=True)          # 1–5 scale

    exercise_minutes = Column(Integer, nullable=True)       # total minutes
    exercise_type = Column(String, nullable=True)           # walking, yoga, gym

    stress_level = Column(Integer, nullable=True)           # 1–5 scale
    water_intake = Column(Float, nullable=True)             # liters

    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
