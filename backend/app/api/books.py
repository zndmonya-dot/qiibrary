"""
書籍APIエンドポイント
実データベースから書籍詳細を取得
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import SessionLocal
from ..models.book import Book
from ..models.youtube_video import YouTubeVideo, BookMention
from ..schemas.book import BookDetail, YouTubeVideo as YouTubeVideoSchema

router = APIRouter()


# データベース依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{asin}", response_model=dict)
async def get_book_detail(
    asin: str,
    db: Session = Depends(get_db)
):
    """
    書籍詳細情報取得
    
    Args:
        asin: Amazon ASIN
    
    Returns:
        書籍詳細（YouTube動画リスト含む）
    """
    try:
        # 書籍情報を取得
        book = db.query(Book).filter(Book.asin == asin).first()
        
        if not book:
            raise HTTPException(status_code=404, detail=f"書籍が見つかりません: {asin}")
        
        # 関連するYouTube動画を取得
        youtube_videos = (
            db.query(YouTubeVideo)
            .join(BookMention, YouTubeVideo.id == BookMention.video_id)
            .filter(BookMention.book_id == book.id)
            .order_by(YouTubeVideo.view_count.desc())
            .all()
        )
        
        # レスポンス形式に変換
        return {
            **book.to_dict(),
            "youtube_videos": [video.to_dict() for video in youtube_videos]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"書籍情報取得エラー: {str(e)}")


@router.get("/", response_model=dict)
async def search_books(
    q: str = None,
    locale: str = "ja",
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    書籍検索
    
    Args:
        q: 検索キーワード（タイトルまたは著者）
        locale: ロケール (ja/en)
        limit: 取得件数
        offset: オフセット
    
    Returns:
        書籍リスト
    """
    try:
        query = db.query(Book).filter(Book.locale == locale)
        
        # キーワード検索
        if q:
            search_pattern = f"%{q}%"
            query = query.filter(
                (Book.title.ilike(search_pattern)) |
                (Book.author.ilike(search_pattern))
            )
        
        # 人気順でソート
        query = query.order_by(Book.total_views.desc())
        
        # ページネーション
        total = query.count()
        books = query.offset(offset).limit(limit).all()
        
        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "books": [book.to_dict() for book in books]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"書籍検索エラー: {str(e)}")
