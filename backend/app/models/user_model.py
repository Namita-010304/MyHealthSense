from sqlalchemy import Column, Integer, String, DateTime, Text, func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Profile information
    full_name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    height = Column(Integer, nullable=True)  # in cm
    weight = Column(Integer, nullable=True)  # in kg

    # Daily routine
    wake_up_time = Column(String, nullable=True)  # HH:MM format
    sleep_time = Column(String, nullable=True)   # HH:MM format
    meals_per_day = Column(Integer, nullable=True)
    exercise_frequency = Column(Integer, nullable=True)  # times per week
    water_intake = Column(Integer, nullable=True)  # glasses per day

    # Health information
    medical_conditions = Column(Text, nullable=True)
    health_goals = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
