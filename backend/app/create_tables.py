from app.core.database import Base, engine
from app.models.symptom_model import Symptom

print("🔄 Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")
