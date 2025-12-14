"""
ランキングAPIエンドポイント（Qiitaベース）
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from sqlalchemy import func

from ..database import get_db
from ..services.ranking_service import RankingService
from ..services.cache_service import get_cache_service
from ..models.qiita_article import QiitaArticle
from ..models.book import Book

router = APIRouter()


@router.get("/stats", response_model=dict)
async def get_site_stats(
    db: Session = Depends(get_db),
):
    """
    サイト全体の統計（ブログ総数など）を取得

    Returns:
        total_articles: Qiita記事総数
        total_books: 書籍総数
        total_likes: Qiita記事の総いいね数
    """
    try:
        cache = get_cache_service()
        cache_key = cache.generate_key("site_stats")
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        total_articles = int(db.query(func.count(QiitaArticle.id)).scalar() or 0)
        total_books = int(db.query(func.count(Book.id)).scalar() or 0)
        total_likes = int(db.query(func.coalesce(func.sum(QiitaArticle.likes_count), 0)).scalar() or 0)

        result = {
            "total_articles": total_articles,
            "total_books": total_books,
            "total_likes": total_likes,
            "updated_at": date.today().isoformat(),
        }

        # 更新頻度が低いので長めにキャッシュ
        cache.set(cache_key, result, ttl_seconds=1800)
        return result

    except Exception as e:
        import traceback

        error_msg = f"Stats error: {repr(e)}"
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@router.get("/", response_model=dict)
async def get_rankings(
    tags: Optional[str] = Query(None, description="カンマ区切りのタグリスト（例: Python,JavaScript）"),
    days: Optional[int] = Query(None, ge=1, le=365, description="過去N日間（指定なし=全期間）"),
    year: Optional[int] = Query(None, ge=2015, le=2030, description="特定の年（例: 2024）"),
    month: Optional[int] = Query(None, ge=1, le=12, description="特定の月（1-12、yearと併用）"),
    limit: Optional[int] = Query(100, ge=1, le=10000, description="取得件数（デフォルト: 100）"),
    offset: Optional[int] = Query(0, ge=0, description="オフセット（ページネーション用）"),
    search: Optional[str] = Query(None, description="検索キーワード（書籍名、著者、出版社、ISBN）"),
    db: Session = Depends(get_db)
):
    """
    書籍ランキング取得（サーバーサイド検索・ページネーション対応）
    
    Args:
        tags: フィルタするタグ（カンマ区切り）
        days: 過去N日間（latest_mention_at基準、Noneの場合は全期間）
        year: 特定の年（例: 2024）
        month: 特定の月（1-12、yearと併用、例: 10）
        limit: 取得件数（デフォルト: 100）
        offset: オフセット（ページネーション用、デフォルト: 0）
        search: 検索キーワード
    
    Returns:
        ランキングデータと総件数
    """
    try:
        # タグをリストに変換
        tag_list = None
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        ranking_service = RankingService(db)
        # 高速版を使用（NEONでも高速動作、検索・ページネーション対応）
        result = ranking_service.get_ranking_fast(
            tags=tag_list,
            days=days,
            year=year,
            month=month,
            limit=limit,
            offset=offset,
            search=search
        )
        
        # 期間ラベルを生成
        if year and month:
            period_label = f"{year}年{month}月"
        elif year:
            period_label = f"{year}年"
        elif days:
            period_label = f"過去{days}日間"
        else:
            period_label = "全期間"
        
        if tag_list:
            period_label += f" ({', '.join(tag_list)})"
        
        return {
            "period": {
                "tags": tag_list,
                "days": days,
                "year": year,
                "month": month,
                "label": period_label
            },
            "rankings": result["rankings"],
            "total": result["total"],
            "limit": result["limit"],
            "offset": result["offset"],
            "updated_at": date.today().isoformat()
        }
    
    except Exception as e:
        import traceback
        error_msg = f"Ranking error: {repr(e)}"
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@router.get("/tags", response_model=dict)
async def get_all_tags(
    db: Session = Depends(get_db)
):
    """
    すべてのタグとその書籍数を取得
    
    Returns:
        タグリスト
    """
    try:
        ranking_service = RankingService(db)
        tags = ranking_service.get_all_tags()
        
        return {
            "tags": tags,
            "total": len(tags)
        }
    
    except Exception as e:
        import traceback
        error_msg = f"Tags error: {repr(e)}"
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@router.get("/years", response_model=dict)
async def get_available_years(
    db: Session = Depends(get_db)
):
    """
    データが存在する年のリストを取得
    
    Returns:
        年のリスト（降順）
    """
    try:
        ranking_service = RankingService(db)
        years = ranking_service.get_available_years()
        
        return {
            "years": years,
            "total": len(years)
        }
    
    except Exception as e:
        import traceback
        error_msg = f"Years error: {repr(e)}"
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


# レガシーエンドポイント（互換性のため）
@router.get("/today", response_model=dict)
async def get_today_rankings(
    limit: Optional[int] = Query(None, ge=1, le=100000, description="取得件数（指定なし=全件）"),
    db: Session = Depends(get_db)
):
    """今日のランキング（全期間ランキングを返す）"""
    return await get_rankings(tags=None, days=None, limit=limit, db=db)


@router.get("/last30days", response_model=dict)
async def get_last30days_rankings(
    limit: Optional[int] = Query(None, ge=1, le=100000, description="取得件数（指定なし=全件）"),
    db: Session = Depends(get_db)
):
    """過去30日間のランキング"""
    return await get_rankings(tags=None, days=30, limit=limit, db=db)


@router.get("/last365days", response_model=dict)
async def get_last365days_rankings(
    limit: Optional[int] = Query(None, ge=1, le=100000, description="取得件数（指定なし=全件）"),
    db: Session = Depends(get_db)
):
    """過去365日間のランキング"""
    return await get_rankings(tags=None, days=365, limit=limit, db=db)
