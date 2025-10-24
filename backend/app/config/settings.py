from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional
import logging
import os

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/qiibrary?client_encoding=utf8"
    
    # API Keys
    QIITA_API_TOKEN: str = ""
    YOUTUBE_API_KEY: str = ""  # YouTube Data API v3
    
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
    
    @field_validator('ENVIRONMENT')
    def validate_environment(cls, v):
        """環境変数の妥当性をチェック"""
        allowed_envs = ['development', 'staging', 'production']
        if v not in allowed_envs:
            logger.warning(f"不正なENVIRONMENT値: {v}。developmentにフォールバック")
            return 'development'
        return v
    
    @field_validator('SECRET_KEY')
    def validate_secret_key(cls, v):
        """本番環境でのSECRET_KEY検証"""
        environment = os.getenv('ENVIRONMENT', 'development')
        if environment == 'production':
            if v.startswith('dev-') or len(v) < 32:
                logger.error("本番環境で安全でないSECRET_KEYが検出されました！")
                raise ValueError(
                    "本番環境では32文字以上のランダムなSECRET_KEYを設定してください"
                )
        return v
    
    @field_validator('ADMIN_TOKEN')
    def validate_admin_token(cls, v):
        """本番環境でのADMIN_TOKEN検証"""
        environment = os.getenv('ENVIRONMENT', 'development')
        if environment == 'production' and not v:
            logger.error("本番環境でADMIN_TOKENが設定されていません！")
            raise ValueError(
                "本番環境ではADMIN_TOKENを必ず設定してください"
            )
        if v and len(v) < 16:
            logger.warning("ADMIN_TOKENが短すぎます。16文字以上を推奨します")
        return v
    
    @field_validator('DATABASE_URL')
    def validate_database_url(cls, v):
        """データベースURL検証（機密情報をログに出力しない）"""
        if 'postgresql' not in v and 'postgres' not in v:
            # 機密情報を含む可能性があるため、URLを直接ログに出力しない
            logger.warning("PostgreSQL以外のデータベースURLが検出されました")
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True
        extra = 'ignore'  # 不要な環境変数を無視


settings = Settings()

# セキュリティ警告のログ出力
if settings.ENVIRONMENT == 'production':
    logger.info("=== 本番環境のセキュリティチェック ===")
    
    if not settings.ADMIN_TOKEN:
        logger.critical("⚠️ ADMIN_TOKENが未設定です！")
    
    if not settings.QIITA_API_TOKEN:
        logger.warning("⚠️ QIITA_API_TOKENが未設定です")
    
    if settings.DATABASE_URL.startswith("postgresql://postgres:postgres@localhost"):
        logger.critical("⚠️ デフォルトのデータベースURLが使用されています！")
    
    logger.info("=== セキュリティチェック完了 ===")

