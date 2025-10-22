from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# データベース接続プールの最適化設定
# NEON PostgreSQLでのパフォーマンスを向上させるための設定
connect_args = {
    "options": "-c client_encoding=utf8",
    "application_name": "qiibrary_backend",
}

# NEON PostgreSQL用の追加設定
if "neon.tech" in settings.DATABASE_URL:
    connect_args.update({
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    })

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,          # 接続前にpingして有効性を確認
    pool_recycle=300,             # 5分ごとに接続をリサイクル（クラウドDBのタイムアウト対策）
    pool_size=10,                 # 接続プールサイズ（デフォルト5→10）
    max_overflow=20,              # 最大オーバーフロー接続数（デフォルト10→20）
    pool_timeout=30,              # 接続待機タイムアウト（秒）
    echo_pool=False,              # 接続プールログ（デバッグ用、本番ではFalse）
    connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """データベースセッションの依存性注入"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

