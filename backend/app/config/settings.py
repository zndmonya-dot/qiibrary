from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/qiibrary?client_encoding=utf8"
    
    # API Keys
    QIITA_API_TOKEN: str = ""
    
    # Affiliate IDs
    AMAZON_ASSOCIATE_TAG: str = ""  # Amazonアフィリエイトタグ
    
    # Admin
    ADMIN_TOKEN: str = ""  # 管理画面アクセス用トークン
    
    # Redis（サンプルデモ用にオプショナル）
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT（本番環境では必ず環境変数で設定してください）
    SECRET_KEY: str = "dev-secret-key-CHANGE-THIS-IN-PRODUCTION-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Timezone
    TIMEZONE: str = "Asia/Tokyo"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True
        extra = 'ignore'  # 不要な環境変数を無視


settings = Settings()

