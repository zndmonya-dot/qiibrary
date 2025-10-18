"""
Pydantic schemas for Qiita-based book ranking
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date


class BookBase(BaseModel):
    """書籍基本情報"""
    isbn: str
    title: str
    author: Optional[str] = None
    publisher: Optional[str] = None
    publication_date: Optional[date] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    amazon_url: Optional[str] = None
    amazon_affiliate_url: Optional[str] = None


class BookStats(BaseModel):
    """書籍統計情報"""
    mention_count: int = 0
    article_count: int = 0
    total_likes: int = 0
    latest_mention_at: Optional[datetime] = None


class Book(BookBase):
    """書籍詳細"""
    id: int
    book_data: Optional[Dict[str, Any]] = None  # openBDなどから取得したメタデータ
    total_mentions: int = 0
    latest_mention_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QiitaArticle(BaseModel):
    """Qiita記事情報"""
    id: int
    qiita_id: str
    title: str
    url: str
    author_id: str
    author_name: Optional[str] = None
    tags: List[str] = []
    likes_count: int = 0
    stocks_count: int = 0
    comments_count: int = 0
    published_at: datetime
    
    class Config:
        from_attributes = True


class YouTubeLink(BaseModel):
    """YouTube動画リンク"""
    id: int
    youtube_url: str
    youtube_video_id: Optional[str] = None
    title: Optional[str] = None
    thumbnail_url: Optional[str] = None
    display_order: int = 1
    
    class Config:
        from_attributes = True


class BookDetail(BaseModel):
    """書籍詳細（関連情報含む）"""
    book: Book
    qiita_articles: List[QiitaArticle] = []
    youtube_links: List[YouTubeLink] = []


class RankingItem(BaseModel):
    """ランキングアイテム"""
    rank: int
    book: Book
    stats: BookStats
