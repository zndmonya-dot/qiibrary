from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class BookBase(BaseModel):
    asin: str
    title: str
    author: Optional[str] = None
    publisher: Optional[str] = None
    publication_date: Optional[date] = None
    price: Optional[int] = None
    sale_price: Optional[int] = None
    discount_rate: Optional[int] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    image_url: Optional[str] = None
    amazon_url: str
    affiliate_url: str
    description: Optional[str] = None


class BookStats(BaseModel):
    total_views: int
    daily_views: Optional[int] = 0
    monthly_views: Optional[int] = 0
    yearly_views: Optional[int] = 0
    mention_count: int


class Book(BookBase):
    id: int
    total_views: int
    total_mentions: int
    locale: str = "ja"
    latest_mention_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class YouTubeVideo(BaseModel):
    video_id: str
    title: str
    channel_name: str
    thumbnail_url: Optional[str] = None
    video_url: str
    view_count: int
    like_count: int
    published_at: datetime
    
    class Config:
        from_attributes = True


class BookDetail(Book):
    youtube_videos: List[YouTubeVideo] = []


class RankingItem(BaseModel):
    rank: int
    book: Book
    stats: BookStats

