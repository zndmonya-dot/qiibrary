from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .api import rankings, books, admin, data_update, daily_tweet, youtube
from .scheduler import start_scheduler, stop_scheduler
from .middleware.rate_limit import RateLimitMiddleware
from .middleware.security import SecurityHeadersMiddleware
from .middleware.admin_auth import verify_admin_access
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
    # ローカル開発（HTTP）
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    # ローカル開発（HTTPS）
    "https://localhost:3000",
    "https://localhost:3001",
    "https://localhost:3002",
    "https://127.0.0.1:3000",
    "https://127.0.0.1:3001",
    "https://127.0.0.1:3002",
    # Vercel本番環境
    "https://qiibrary.com",
    "https://www.qiibrary.com",
    # Vercel実際のURL
    "https://qiibrary.vercel.app",
]

# Vercelのプレビュー環境も許可（*.vercel.app）
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
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# レート制限ミドルウェア（ボット攻撃対策）
app.add_middleware(RateLimitMiddleware)

# セキュリティヘッダーミドルウェア
app.add_middleware(SecurityHeadersMiddleware)

# 管理者API認証ミドルウェア
@app.middleware("http")
async def admin_auth_middleware(request: Request, call_next):
    """管理者APIへのアクセスを認証でチェック    """
    if request.url.path.startswith("/api/admin"):
        await verify_admin_access(request)
    response = await call_next(request)
    return response


@app.get("/api/admin/scheduler/status")
async def get_scheduler_status(request: Request):
    """スケジューラーの稼働状況を確認（管理者のみ）"""
    await verify_admin_access(request)
    
    if not scheduler:
        return {"status": "not_initialized"}
    
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": str(job.next_run_time) if job.next_run_time else None
        })
        
    return {
        "status": "running" if scheduler.running else "stopped",
        "timezone": str(scheduler.timezone),
        "jobs": jobs
    }


# ルーター登録
app.include_router(rankings.router, prefix="/api/rankings", tags=["rankings"])
app.include_router(books.router, prefix="/api/books", tags=["books"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(data_update.router, prefix="/api/admin", tags=["admin"])
app.include_router(daily_tweet.router, prefix="/api/admin", tags=["admin"])
app.include_router(youtube.router, prefix="/api/youtube", tags=["youtube"])


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
    """
    アプリケーション起動時にスケジューラーを開始
    """
    global scheduler
    logger.info("アプリケーション起動中...")
    scheduler = start_scheduler()
    logger.info("アプリケーション起動完了")


@app.on_event("shutdown")
async def shutdown_event():
    """
    アプリケーション終了時にスケジューラーを停止
    """
    global scheduler
    logger.info("アプリケーション終了中...")
    stop_scheduler(scheduler)
    logger.info("アプリケーション終了完了")

