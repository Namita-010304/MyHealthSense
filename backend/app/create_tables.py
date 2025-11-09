from app.core.database import Base, engine
from app.models.symptom_model import Symptom
from app.models.medication_model import Medication  
from app.models.diet_model import Diet

print("🔄 Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")
