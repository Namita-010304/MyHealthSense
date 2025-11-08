from app.core.database import Base, engine
from app.models.symptom_model import Symptom
from app.models.medication_model import Medication  # ✅ Must import this so SQLAlchemy knows about it

print("🔄 Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")
