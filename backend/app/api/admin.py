"""
管理者用APIエンドポイント
"""

import logging
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import SessionLocal
from ..models.book import Book, BookYouTubeLink
from ..config.settings import settings

router = APIRouter()
logger = logging.getLogger(__name__)


# データベース依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 簡易認証
def verify_admin_token(authorization: Optional[str] = Header(None)):
    """管理者トークンを検証"""
    if not settings.ADMIN_TOKEN:
        raise HTTPException(status_code=500, detail="Admin token not configured")
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Bearer トークン形式
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.replace("Bearer ", "")
    
    if token != settings.ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid admin token")
    
    return True


# リクエストモデル
class YouTubeLinkCreate(BaseModel):
    youtube_url: str
    display_order: int = 1


class YouTubeLinkUpdate(BaseModel):
    youtube_url: Optional[str] = None
    display_order: Optional[int] = None


# YouTube動画ID抽出
def extract_youtube_video_id(url: str) -> Optional[str]:
    """YouTube URLから動画IDを抽出"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/embed\/([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/v\/([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


@router.get("/books/search")
async def search_books(
    q: str,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_token)
):
    """書籍を検索（管理者用）"""
    books = db.query(Book).filter(
        Book.title.ilike(f"%{q}%")
    ).limit(limit).all()
    
    return [
        {
            "id": book.id,
            "isbn": book.isbn,
            "title": book.title,
            "author": book.author,
            "thumbnail_url": book.thumbnail_url,
        }
        for book in books
    ]


@router.get("/books/{book_id}/youtube")
async def get_youtube_links(
    book_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_token)
):
    """書籍に紐付いたYouTube動画を取得"""
    book = db.query(Book).filter(Book.id == book_id).first()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    links = db.query(BookYouTubeLink).filter(
        BookYouTubeLink.book_id == book_id
    ).order_by(BookYouTubeLink.display_order).all()
    
    return {
        "book": {
            "id": book.id,
            "isbn": book.isbn,
            "title": book.title,
            "author": book.author,
            "thumbnail_url": book.thumbnail_url,
        },
        "youtube_links": [
            {
                "id": link.id,
                "youtube_url": link.youtube_url,
                "youtube_video_id": link.youtube_video_id,
                "title": link.title,
                "thumbnail_url": link.thumbnail_url,
                "display_order": link.display_order,
            }
            for link in links
        ]
    }


@router.post("/books/{book_id}/youtube")
async def add_youtube_link(
    book_id: int,
    link_data: YouTubeLinkCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_token)
):
    """書籍にYouTube動画を追加"""
    # 書籍の存在確認
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # YouTube動画IDを抽出
    video_id = extract_youtube_video_id(link_data.youtube_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    # YouTubeサムネイルURL生成
    thumbnail_url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    
    # 新しいリンクを作成
    new_link = BookYouTubeLink(
        book_id=book_id,
        youtube_url=link_data.youtube_url,
        youtube_video_id=video_id,
        thumbnail_url=thumbnail_url,
        display_order=link_data.display_order,
    )
    
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    
    logger.info(f"YouTube動画追加: book_id={book_id}, video_id={video_id}")
    
    return {
        "id": new_link.id,
        "youtube_url": new_link.youtube_url,
        "youtube_video_id": new_link.youtube_video_id,
        "thumbnail_url": new_link.thumbnail_url,
        "display_order": new_link.display_order,
    }


@router.put("/youtube/{link_id}")
async def update_youtube_link(
    link_id: int,
    link_data: YouTubeLinkUpdate,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_token)
):
    """YouTube動画を更新"""
    link = db.query(BookYouTubeLink).filter(BookYouTubeLink.id == link_id).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="YouTube link not found")
    
    # URLが変更された場合は動画IDも更新
    if link_data.youtube_url:
        video_id = extract_youtube_video_id(link_data.youtube_url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
        link.youtube_url = link_data.youtube_url
        link.youtube_video_id = video_id
        link.thumbnail_url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    
    if link_data.display_order is not None:
        link.display_order = link_data.display_order
    
    db.commit()
    db.refresh(link)
    
    logger.info(f"YouTube動画更新: link_id={link_id}")
    
    return {
        "id": link.id,
        "youtube_url": link.youtube_url,
        "youtube_video_id": link.youtube_video_id,
        "thumbnail_url": link.thumbnail_url,
        "display_order": link.display_order,
    }


@router.delete("/youtube/{link_id}")
async def delete_youtube_link(
    link_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin_token)
):
    """YouTube動画を削除"""
    link = db.query(BookYouTubeLink).filter(BookYouTubeLink.id == link_id).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="YouTube link not found")
    
    db.delete(link)
    db.commit()
    
    logger.info(f"YouTube動画削除: link_id={link_id}")
    
    return {"message": "YouTube link deleted successfully"}

