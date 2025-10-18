from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api import rankings, books, admin

app = FastAPI(
    title="BookTuber API",
    description="Qiita記事で言及されたIT技術書ランキングAPI",
    version="0.1.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL, 
        "http://localhost:3000",
        "http://localhost:3001",  # Next.jsがポート3000使用中の場合
    ],
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
        "message": "BookTuber API",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

