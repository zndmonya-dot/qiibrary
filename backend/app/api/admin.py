"""
管理者用APIエンドポイント
"""

import logging
import re
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import SessionLocal
from ..models.book import Book, BookYouTubeLink
from ..config.settings import settings
from ..services.youtube_service import get_video_details
from ..services.cache_service import get_cache_service

router = APIRouter()
logger = logging.getLogger(__name__)


# データベース依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception as e:
            logger.error(f"データベース接続クローズエラー: {e}")


# 簡易認証
def verify_admin_token(authorization: Optional[str] = Header(None)):
    """管理者トークンを検証"""
    # ADMIN_TOKENが未設定の場合は認証をスキップ（開発環境用）
    if not settings.ADMIN_TOKEN:
        logger.warning("⚠️ ADMIN_TOKEN未設定のため管理者API認証をスキップ")
        return True
    
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
    db: Session = Depends(get_db)
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
    
    # 重複チェック：同じ書籍に同じ動画IDが既に登録されていないか確認
    existing_link = db.query(BookYouTubeLink).filter(
        BookYouTubeLink.book_id == book_id,
        BookYouTubeLink.youtube_video_id == video_id
    ).first()
    
    if existing_link:
        raise HTTPException(
            status_code=400, 
            detail=f"この動画は既に登録されています（登録順: {existing_link.display_order}）"
        )
    
    # YouTube APIから詳細情報を取得
    video_details = get_video_details(video_id)
    
    # YouTubeサムネイルURL生成（APIから取得できない場合のフォールバック）
    thumbnail_url = video_details.get("thumbnail_url") if video_details else f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    
    # 新しいリンクを作成
    new_link = BookYouTubeLink(
        book_id=book_id,
        youtube_url=link_data.youtube_url,
        youtube_video_id=video_id,
        thumbnail_url=thumbnail_url,
        display_order=link_data.display_order,
        # YouTube APIから取得した詳細情報
        title=video_details.get("title") if video_details else None,
        channel_name=video_details.get("channel_name") if video_details else None,
        view_count=video_details.get("view_count", 0) if video_details else 0,
        like_count=video_details.get("like_count", 0) if video_details else 0,
        published_at=datetime.fromisoformat(video_details["published_at"].replace('Z', '+00:00')) if (video_details and video_details.get("published_at")) else None,
    )
    
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    
    logger.info(f"YouTube動画追加: book_id={book_id}, video_id={video_id}, title={new_link.title}")
    
    return {
        "id": new_link.id,
        "youtube_url": new_link.youtube_url,
        "youtube_video_id": new_link.youtube_video_id,
        "title": new_link.title,
        "channel_name": new_link.channel_name,
        "thumbnail_url": new_link.thumbnail_url,
        "view_count": new_link.view_count,
        "like_count": new_link.like_count,
        "display_order": new_link.display_order,
    }


@router.put("/youtube/{link_id}")
async def update_youtube_link(
    link_id: int,
    link_data: YouTubeLinkUpdate,
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
):
    """YouTube動画を削除"""
    link = db.query(BookYouTubeLink).filter(BookYouTubeLink.id == link_id).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="YouTube link not found")
    
    db.delete(link)
    db.commit()
    
    logger.info(f"YouTube動画削除: link_id={link_id}")
    
    return {"message": "YouTube link deleted successfully"}


@router.delete("/books/{book_id}/youtube/all")
async def delete_all_youtube_links(
    book_id: int,
    db: Session = Depends(get_db)
):
    """書籍に紐付いた全てのYouTube動画を削除"""
    # 書籍の存在確認
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # 削除前に件数を取得
    link_count = db.query(BookYouTubeLink).filter(
        BookYouTubeLink.book_id == book_id
    ).count()
    
    if link_count == 0:
        return {
            "message": "削除する動画がありません",
            "deleted_count": 0
        }
    
    # 全ての動画リンクを削除
    db.query(BookYouTubeLink).filter(
        BookYouTubeLink.book_id == book_id
    ).delete()
    
    db.commit()
    
    logger.info(f"YouTube動画一括削除: book_id={book_id}, 削除件数={link_count}件")
    
    return {
        "message": f"{link_count}件の動画を削除しました",
        "deleted_count": link_count
    }


# 一括登録用のリクエストモデル
class YouTubeLinkBatchCreate(BaseModel):
    youtube_urls: List[str]


@router.post("/books/{book_id}/youtube/batch")
async def add_youtube_links_batch(
    book_id: int,
    batch_data: YouTubeLinkBatchCreate,
    db: Session = Depends(get_db)
):
    """書籍にYouTube動画を一括追加"""
    # 書籍の存在確認
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # 現在の最大display_orderを取得
    max_order = db.query(BookYouTubeLink).filter(
        BookYouTubeLink.book_id == book_id
    ).count()
    
    added_links = []
    failed_urls = []
    skipped_urls = []  # 重複でスキップされた動画
    
    for idx, youtube_url in enumerate(batch_data.youtube_urls):
        try:
            # YouTube動画IDを抽出
            video_id = extract_youtube_video_id(youtube_url)
            if not video_id:
                failed_urls.append({"url": youtube_url, "reason": "Invalid YouTube URL"})
                continue
            
            # 重複チェック：同じ書籍に同じ動画IDが既に登録されていないか確認
            existing_link = db.query(BookYouTubeLink).filter(
                BookYouTubeLink.book_id == book_id,
                BookYouTubeLink.youtube_video_id == video_id
            ).first()
            
            if existing_link:
                skipped_urls.append({
                    "url": youtube_url,
                    "reason": f"既に登録済み（順序: {existing_link.display_order}）",
                    "title": existing_link.title
                })
                logger.info(f"重複のためスキップ: book_id={book_id}, video_id={video_id}")
                continue
            
            # YouTube APIから詳細情報を取得
            video_details = get_video_details(video_id)
            
            # YouTubeサムネイルURL生成
            thumbnail_url = video_details.get("thumbnail_url") if video_details else f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
            
            # 新しいリンクを作成
            new_link = BookYouTubeLink(
                book_id=book_id,
                youtube_url=youtube_url,
                youtube_video_id=video_id,
                thumbnail_url=thumbnail_url,
                display_order=max_order + idx + 1,
                # YouTube APIから取得した詳細情報
                title=video_details.get("title") if video_details else None,
                channel_name=video_details.get("channel_name") if video_details else None,
                view_count=video_details.get("view_count", 0) if video_details else 0,
                like_count=video_details.get("like_count", 0) if video_details else 0,
                published_at=datetime.fromisoformat(video_details["published_at"].replace('Z', '+00:00')) if (video_details and video_details.get("published_at")) else None,
            )
            
            db.add(new_link)
            added_links.append({
                "youtube_url": new_link.youtube_url,
                "youtube_video_id": new_link.youtube_video_id,
                "title": new_link.title,
                "channel_name": new_link.channel_name,
            })
            
        except Exception as e:
            failed_urls.append({"url": youtube_url, "reason": str(e)})
            logger.error(f"Failed to add YouTube link: {youtube_url}, error: {e}")
    
    db.commit()
    
    logger.info(f"YouTube動画一括追加: book_id={book_id}, 成功={len(added_links)}件, スキップ={len(skipped_urls)}件, 失敗={len(failed_urls)}件")
    
    return {
        "added": len(added_links),
        "skipped": len(skipped_urls),
        "failed": len(failed_urls),
        "added_links": added_links,
        "skipped_urls": skipped_urls,
        "failed_urls": failed_urls,
    }


# ============================================================
# キャッシュ管理エンドポイント
# ============================================================

@router.get("/cache/stats")
async def get_cache_stats(
    _: bool = Depends(verify_admin_token)
):
    """
    キャッシュの統計情報を取得
    
    Returns:
        キャッシュヒット率などの統計情報
    """
    cache = get_cache_service()
    stats = cache.get_stats()
    
    return {
        "status": "success",
        "stats": stats,
    }


@router.post("/cache/clear")
async def clear_cache(
    _: bool = Depends(verify_admin_token)
):
    """
    すべてのキャッシュをクリア
    
    Note:
        次回アクセス時に自動的にDBから再取得されます
    """
    cache = get_cache_service()
    cache.clear()
    logger.info("管理者がキャッシュをクリアしました")
    
    return {
        "status": "success",
        "message": "All cache cleared successfully",
    }


@router.post("/cache/cleanup")
async def cleanup_expired_cache(
    _: bool = Depends(verify_admin_token)
):
    """
    期限切れのキャッシュをクリーンアップ
    
    Note:
        通常は自動的に期限切れになるため、手動実行は不要です
    """
    cache = get_cache_service()
    cache.cleanup_expired()
    logger.info("管理者が期限切れキャッシュをクリーンアップしました")
    
    return {
        "status": "success",
        "message": "Expired cache cleaned up successfully",
    }

