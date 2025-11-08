from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base

class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, index=True)
    symptom_name = Column(String, nullable=False)
    severity = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
