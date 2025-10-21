from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import rankings, books, admin
import os

app = FastAPI(
    title="Qiibrary API",
    description="Qiita記事で言及されたIT技術書ランキングAPI",
    version="0.1.0"
)

# CORS設定
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    frontend_url,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(rankings.router, prefix="/api/rankings", tags=["rankings"])
app.include_router(books.router, prefix="/api/books", tags=["books"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


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

