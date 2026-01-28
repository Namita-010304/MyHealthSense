from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MyHealthSense"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # AI Service Configuration
    VERTEX_PROJECT_ID: str
    VERTEX_LOCATION: str = "us-central1"
    VERTEX_MODEL_NAME: str = "gemini-2.5-flash-lite"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8"
    }

settings = Settings()
