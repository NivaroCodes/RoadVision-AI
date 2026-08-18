from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Qala Vision"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./roadvision.db"
    
    SECRET_KEY: str = "roadvision-insecure-secret-key-for-dev-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ML_SERVICE_URL: str = "http://localhost:8001"
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
