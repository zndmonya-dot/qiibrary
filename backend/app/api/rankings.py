"""
ランキングAPIエンドポイント
実データベースからランキングを取得
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database import SessionLocal
from ..services.ranking_service import RankingService
from ..schemas.book import RankingItem

router = APIRouter()


# データベース依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/today", response_model=dict)
async def get_today_rankings(
    locale: str = Query("ja", regex="^(ja|en)$"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    今日のランキング取得
    
    Args:
        locale: ロケール (ja/en)
        limit: 取得件数 (1-100)
    
    Returns:
        ランキングデータ
    """
    try:
        ranking_service = RankingService(db)
        rankings = ranking_service.get_today_ranking(
            locale=locale,
            limit=limit
        )
        
        return {
            "period": {
                "type": "today",
                "date": date.today().isoformat(),
                "label": "今日" if locale == "ja" else "Today"
            },
            "rankings": rankings,
            "updated_at": date.today().isoformat()
        }
    
    except Exception as e:
        import traceback
        error_msg = f"Ranking error: {repr(e)}"
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@router.get("/last30days", response_model=dict)
async def get_last30days_rankings(
    locale: str = Query("ja", regex="^(ja|en)$"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    過去30日間のランキング取得（スライディングウィンドウ）
    
    Args:
        locale: ロケール (ja/en)
        limit: 取得件数 (1-100)
    
    Returns:
        ランキングデータ
    """
    try:
        ranking_service = RankingService(db)
        rankings = ranking_service.get_last30days_ranking(
            locale=locale,
            limit=limit
        )
        
        from datetime import timedelta
        end_date = date.today()
        start_date = end_date - timedelta(days=30)
        
        return {
            "period": {
                "type": "last30days",
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "label": "過去30日間" if locale == "ja" else "Past 30 Days"
            },
            "rankings": rankings,
            "updated_at": date.today().isoformat()
        }
    
    except Exception as e:
        import traceback
        error_msg = f"Ranking error: {repr(e)}"
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@router.get("/last365days", response_model=dict)
async def get_last365days_rankings(
    locale: str = Query("ja", regex="^(ja|en)$"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    過去365日間のランキング取得（スライディングウィンドウ）
    
    Args:
        locale: ロケール (ja/en)
        limit: 取得件数 (1-100)
    
    Returns:
        ランキングデータ
    """
    try:
        ranking_service = RankingService(db)
        rankings = ranking_service.get_last365days_ranking(
            locale=locale,
            limit=limit
        )
        
        from datetime import timedelta
        end_date = date.today()
        start_date = end_date - timedelta(days=365)
        
        return {
            "period": {
                "type": "last365days",
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "label": "過去1年間" if locale == "ja" else "Past Year"
            },
            "rankings": rankings,
            "updated_at": date.today().isoformat()
        }
    
    except Exception as e:
        import traceback
        error_msg = f"Ranking error: {repr(e)}"
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@router.get("/monthly/{year}/{month}", response_model=dict)
async def get_monthly_archive_rankings(
    year: int,
    month: int,
    locale: str = Query("ja", regex="^(ja|en)$"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    特定月のアーカイブランキング取得
    
    Args:
        year: 年
        month: 月 (1-12)
        locale: ロケール (ja/en)
        limit: 取得件数 (1-100)
    
    Returns:
        ランキングデータ
    """
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="月は1-12の範囲で指定してください")
    
    try:
        ranking_service = RankingService(db)
        rankings = ranking_service.get_monthly_archive_ranking(
            year=year,
            month=month,
            locale=locale,
            limit=limit
        )
        
        return {
            "period": {
                "type": "monthly_archive",
                "year": year,
                "month": month,
                "label": f"{year}年{month}月" if locale == "ja" else f"{year}-{month:02d}"
            },
            "rankings": rankings,
            "updated_at": date.today().isoformat()
        }
    
    except Exception as e:
        import traceback
        error_msg = f"Ranking error: {repr(e)}"
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@router.get("/yearly/{year}", response_model=dict)
async def get_yearly_archive_rankings(
    year: int,
    locale: str = Query("ja", regex="^(ja|en)$"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    特定年のアーカイブランキング取得
    
    Args:
        year: 年
        locale: ロケール (ja/en)
        limit: 取得件数 (1-100)
    
    Returns:
        ランキングデータ
    """
    try:
        ranking_service = RankingService(db)
        rankings = ranking_service.get_yearly_archive_ranking(
            year=year,
            locale=locale,
            limit=limit
        )
        
        return {
            "period": {
                "type": "yearly_archive",
                "year": year,
                "label": f"{year}年" if locale == "ja" else str(year)
            },
            "rankings": rankings,
            "updated_at": date.today().isoformat()
        }
    
    except Exception as e:
        import traceback
        error_msg = f"Ranking error: {repr(e)}"
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


# レガシーエンドポイント（互換性のため残す）
@router.get("/daily", response_model=dict)
async def get_daily_rankings_legacy(
    date: Optional[date] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    locale: str = Query("ja", regex="^(ja|en)$"),
    db: Session = Depends(get_db)
):
    """
    日別ランキング取得（レガシー）
    今日のランキングにリダイレクト
    """
    return await get_today_rankings(locale=locale, limit=limit, db=db)


@router.get("/monthly", response_model=dict)
async def get_monthly_rankings_legacy(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    limit: int = Query(50, ge=1, le=100),
    locale: str = Query("ja", regex="^(ja|en)$"),
    db: Session = Depends(get_db)
):
    """
    月別ランキング取得（レガシー）
    過去30日ランキングにリダイレクト
    """
    return await get_last30days_rankings(locale=locale, limit=limit, db=db)


@router.get("/yearly", response_model=dict)
async def get_yearly_rankings_legacy(
    year: int = Query(..., ge=2000, le=2100),
    limit: int = Query(50, ge=1, le=100),
    locale: str = Query("ja", regex="^(ja|en)$"),
    db: Session = Depends(get_db)
):
    """
    年別ランキング取得（レガシー）
    過去365日ランキングにリダイレクト
    """
    return await get_last365days_rankings(locale=locale, limit=limit, db=db)
