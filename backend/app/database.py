from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# エンコーディングを明示的にUTF-8に設定
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args={
        "options": "-c client_encoding=utf8"
    }
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

