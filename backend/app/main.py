from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api import rankings, books

app = FastAPI(
    title="BookTuber API",
    description="YouTubeで紹介されたIT技術書ランキングAPI",
    version="0.1.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(rankings.router, prefix="/api/rankings", tags=["rankings"])
app.include_router(books.router, prefix="/api/books", tags=["books"])


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

