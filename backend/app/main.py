from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import rankings, books
from .scheduler import start_scheduler, stop_scheduler
from .middleware.rate_limit import RateLimitMiddleware
from .middleware.security import SecurityHeadersMiddleware
from .monitoring.sentry import init_sentry
import os
import logging

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Sentry初期化（エラー監視）
init_sentry()

app = FastAPI(
    title="Qiibrary API",
    description="Qiita記事で言及されたIT技術書ランキングAPI",
    version="0.1.0"
)

# スケジューラーのインスタンスを保持
scheduler = None

# CORS設定
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    frontend_url,
    # ローカル開発
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    # 本番環境
    "https://qiibrary.com",
    "https://www.qiibrary.com",
    "https://qiibrary.vercel.app",
]

# Vercelのプレビュー環境も許可
vercel_preview_domain = os.getenv("VERCEL_PREVIEW_DOMAIN", "")
if vercel_preview_domain:
    allowed_origins.append(vercel_preview_domain)

# 環境変数で追加のオリジンを許可
extra_origins = os.getenv("EXTRA_ALLOWED_ORIGINS", "")
if extra_origins:
    for origin in extra_origins.split(","):
        if origin.strip():
            allowed_origins.append(origin.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# レート制限ミドルウェア
app.add_middleware(RateLimitMiddleware)

# セキュリティヘッダーミドルウェア
app.add_middleware(SecurityHeadersMiddleware)

# ルーター登録（公開APIのみ）
app.include_router(rankings.router, prefix="/api/rankings", tags=["rankings"])
app.include_router(books.router, prefix="/api/books", tags=["books"])


@app.get("/")
async def root():
    return {
        "message": "Qiibrary API",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時にスケジューラーを開始"""
    global scheduler
    logger.info("アプリケーション起動中...")
    scheduler = start_scheduler()
    logger.info("アプリケーション起動完了")


@app.on_event("shutdown")
async def shutdown_event():
    """アプリケーション終了時にスケジューラーを停止"""
    global scheduler
    logger.info("アプリケーション終了中...")
    stop_scheduler(scheduler)
    logger.info("アプリケーション終了完了")
