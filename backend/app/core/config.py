from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MyHealthSense"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8"
    }

settings = Settings()
