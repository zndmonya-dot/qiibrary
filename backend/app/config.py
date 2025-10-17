from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database（サンプルデモ用にオプショナル）
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/booktube"
    
    # Redis（サンプルデモ用にオプショナル）
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # YouTube API（サンプルデモ用にオプショナル）
    YOUTUBE_API_KEY: str = "dummy_youtube_api_key"
    
    # Amazon API（サンプルデモ用にオプショナル）
    AMAZON_ACCESS_KEY: str = "dummy_amazon_access_key"
    AMAZON_SECRET_KEY: str = "dummy_amazon_secret_key"
    AMAZON_ASSOCIATE_TAG: str = "yourtag-22"
    AMAZON_REGION: str = "jp"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Timezone
    TIMEZONE: str = "Asia/Tokyo"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

