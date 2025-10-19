"""
ランキングAPIエンドポイント（Qiitaベース）
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database import SessionLocal
from ..services.ranking_service import RankingService

router = APIRouter()


# データベース依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=dict)
async def get_rankings(
    tags: Optional[str] = Query(None, description="カンマ区切りのタグリスト（例: Python,JavaScript）"),
    days: Optional[int] = Query(None, ge=1, le=365, description="過去N日間（指定なし=全期間）"),
    year: Optional[int] = Query(None, ge=2015, le=2030, description="特定の年（例: 2024）"),
    month: Optional[int] = Query(None, ge=1, le=12, description="特定の月（1-12、yearと併用）"),
    limit: Optional[int] = Query(None, ge=1, le=100000, description="取得件数（指定なし=全件）"),
    db: Session = Depends(get_db)
):
    """
    書籍ランキング取得（タグ、期間、年、月でフィルタ可能）
    
    Args:
        tags: フィルタするタグ（カンマ区切り）
        days: 過去N日間（latest_mention_at基準、Noneの場合は全期間）
        year: 特定の年（例: 2024）
        month: 特定の月（1-12、yearと併用、例: 10）
        limit: 取得件数 (1-100)
    
    Returns:
        ランキングデータ
    """
    try:
        # タグをリストに変換
        tag_list = None
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        ranking_service = RankingService(db)
        rankings = ranking_service.get_ranking(
            tags=tag_list,
            days=days,
            year=year,
            month=month,
            limit=limit,
            scoring_method="quality"  # 品質重視方式を使用
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
            "rankings": rankings,
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
