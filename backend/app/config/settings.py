from pydantic_settings import BaseSettings
from pydantic import field_validator
import logging
import os

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/qiibrary?client_encoding=utf8"
    
    # API Keys
    QIITA_API_TOKEN: str = ""
    
    # Affiliate IDs
    AMAZON_ASSOCIATE_TAG: str = ""
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Timezone
    TIMEZONE: str = "Asia/Tokyo"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @field_validator('ENVIRONMENT')
    def validate_environment(cls, v):
        """環境変数の妥当性をチェック"""
        allowed_envs = ['development', 'staging', 'production']
        if v not in allowed_envs:
            logger.warning(f"不正なENVIRONMENT値: {v}。developmentにフォールバック")
            return 'development'
        return v
    
    @field_validator('DATABASE_URL')
    def validate_database_url(cls, v):
        """データベースURL検証"""
        if 'postgresql' not in v and 'postgres' not in v:
            logger.warning("PostgreSQL以外のデータベースURLが検出されました")
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True
        extra = 'ignore'


settings = Settings()

# 本番環境のセキュリティチェック
if settings.ENVIRONMENT == 'production':
    logger.info("=== 本番環境のセキュリティチェック ===")
    
    if not settings.QIITA_API_TOKEN:
        logger.warning("⚠️ QIITA_API_TOKENが未設定です")
    
    if settings.DATABASE_URL.startswith("postgresql://postgres:postgres@localhost"):
        logger.critical("⚠️ デフォルトのデータベースURLが使用されています！")
    
    logger.info("=== セキュリティチェック完了 ===")
