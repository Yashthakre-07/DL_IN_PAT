from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PAT-IQA Web Platform"
    API_V1_STR: str = "/api/v1"
    
    # Origins for Next.js frontend
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Path mappings
    MODEL_DIR: str = "../models"
    DATA_DIR: str = "../data"
    SAVED_MODELS_DIR: str = "../saved_models"

    class Config:
        case_sensitive = True

settings = Settings()
