"""
書籍APIエンドポイント（Qiitaベース）
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import SessionLocal
from ..models.book import Book, BookQiitaMention, BookYouTubeLink
from ..models.qiita_article import QiitaArticle
from ..services.openbd_service import get_openbd_service

router = APIRouter()


# データベース依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{isbn}", response_model=dict)
async def get_book_detail(
    isbn: str,
    db: Session = Depends(get_db)
):
    """
    書籍詳細情報取得
    
    Args:
        isbn: ISBN-10 or ISBN-13
    
    Returns:
        書籍詳細（Qiita記事・YouTube動画リスト含む）
    """
    try:
        # 書籍情報を取得
        book = db.query(Book).filter(Book.isbn == isbn).first()
        
        if not book:
            raise HTTPException(status_code=404, detail=f"書籍が見つかりません: {isbn}")
        
        # 関連するQiita記事を取得（すべて表示）
        qiita_articles = (
            db.query(QiitaArticle)
            .join(BookQiitaMention, QiitaArticle.id == BookQiitaMention.article_id)
            .filter(BookQiitaMention.book_id == book.id)
            .order_by(QiitaArticle.likes_count.desc())
            .all()
        )
        
        # 関連するYouTube動画リンクを取得
        youtube_links = (
            db.query(BookYouTubeLink)
            .filter(BookYouTubeLink.book_id == book.id)
            .order_by(BookYouTubeLink.display_order)
            .all()
        )
        
        # 動的にAmazonアフィリエイトURLを生成
        openbd_service = get_openbd_service()
        amazon_affiliate_url = openbd_service.generate_amazon_affiliate_url(book.isbn)
        
        # レスポンス形式に変換
        book_dict = book.to_dict()
        book_dict["amazon_affiliate_url"] = amazon_affiliate_url  # アフィリエイトURLを上書き
        
        return {
            "book": book_dict,
            "qiita_articles": [article.to_dict() for article in qiita_articles],
            "youtube_links": [
                {
                    "id": link.id,
                    "youtube_url": link.youtube_url,
                    "youtube_video_id": link.youtube_video_id,
                    "title": link.title,
                    "thumbnail_url": link.thumbnail_url,
                    "display_order": link.display_order,
                }
                for link in youtube_links
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"書籍情報取得エラー: {str(e)}")


@router.get("/", response_model=dict)
async def search_books(
    q: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    書籍検索
    
    Args:
        q: 検索キーワード（タイトルまたは著者）
        limit: 取得件数
        offset: オフセット
    
    Returns:
        書籍リスト
    """
    try:
        query = db.query(Book)
        
        # キーワード検索
        if q:
            search_pattern = f"%{q}%"
            query = query.filter(
                (Book.title.ilike(search_pattern)) |
                (Book.author.ilike(search_pattern))
            )
        
        # 人気順でソート（言及数）
        query = query.order_by(Book.total_mentions.desc())
        
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
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"書籍検索エラー: {str(e)}")
