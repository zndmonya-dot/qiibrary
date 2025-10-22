"""
本日のツイート文を返すAPIエンドポイント
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Literal
from datetime import datetime, timedelta

from ..database import SessionLocal
from ..services.ranking_service import RankingService
from ..models.book import Book, BookQiitaMention
from ..models.qiita_article import QiitaArticle

router = APIRouter()

# ランキングパターンの定義
RankingPattern = Literal["daily", "weekly", "monthly", "yearly"]


# データベース依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            pass


def format_number(num: int) -> str:
    """数値をフォーマット（K、M単位）"""
    if num >= 1_000_000:
        return f"{num / 1_000_000:.1f}M"
    if num >= 1_000:
        return f"{num / 1_000:.1f}K"
    return str(num)


def get_pattern_config(pattern: RankingPattern) -> dict:
    """パターンごとの設定を返す"""
    now = datetime.now()
    
    if pattern == "daily":
        return {
            "days": 1,
            "year": None,
            "month": None,
            "title": "【Qiita技術書ランキング 本日の1位】",
            "period_label": "24時間"
        }
    elif pattern == "weekly":
        return {
            "days": 7,
            "year": None,
            "month": None,
            "title": "【Qiita技術書ランキング 今週の1位】",
            "period_label": "7日間"
        }
    elif pattern == "monthly":
        # 先月のデータを取得（月初の場合）
        if now.day <= 3:  # 月初3日間は先月のランキング
            last_month = now.replace(day=1) - timedelta(days=1)
            return {
                "days": None,
                "year": last_month.year,
                "month": last_month.month,
                "title": f"【Qiita技術書ランキング {last_month.year}年{last_month.month}月の1位】",
                "period_label": f"{last_month.year}年{last_month.month}月"
            }
        else:
            return {
                "days": None,
                "year": now.year,
                "month": now.month,
                "title": f"【Qiita技術書ランキング {now.year}年{now.month}月の1位】",
                "period_label": f"{now.year}年{now.month}月"
            }
    else:  # yearly
        # 年初の場合は去年のランキング
        if now.month == 1 and now.day <= 7:
            last_year = now.year - 1
            return {
                "days": None,
                "year": last_year,
                "month": None,
                "title": f"【Qiita技術書ランキング {last_year}年の1位】",
                "period_label": f"{last_year}年"
            }
        else:
            return {
                "days": None,
                "year": now.year,
                "month": None,
                "title": f"【Qiita技術書ランキング {now.year}年の1位】",
                "period_label": f"{now.year}年"
            }


def generate_tweet(book: Book, article_count: int, total_likes: int, pattern_config: dict) -> str:
    """ツイート文を生成"""
    likes_display = format_number(total_likes)
    asin = book.isbn.replace('-', '') if book.isbn else ''
    book_url = f"https://qiibrary.com/books/{asin}" if asin else "https://qiibrary.com"
    
    tweet = f"""{pattern_config['title']}

{book.title}

📝 記事掲載数: {article_count}件
❤️ 総評価数: {likes_display}

Qiitaで話題の技術書をランキング化

詳細: {book_url}
購入: {book.amazon_affiliate_url}

#技術書 #Qiita #Qiibrary"""
    
    return tweet


@router.get("/daily-tweet")
async def get_daily_tweet(
    pattern: RankingPattern = Query("daily", description="ランキングパターン: daily, weekly, monthly, yearly"),
    db: Session = Depends(get_db)
):
    """
    ランキング1位のツイート文を返す
    
    パターン:
    - daily: 24時間ランキング
    - weekly: 7日間ランキング
    - monthly: カレンダー上の月ランキング（例: 2025年10月1日〜31日、月初は先月）
    - yearly: カレンダー上の年ランキング（例: 2025年1月1日〜12月31日、年初は去年）
    """
    try:
        # パターン設定を取得
        pattern_config = get_pattern_config(pattern)
        
        # ランキングを取得
        ranking_service = RankingService(db)
        rankings_data = ranking_service.get_ranking_fast(
            days=pattern_config['days'],
            year=pattern_config['year'],
            month=pattern_config['month'],
            limit=1
        )
        
        if not rankings_data or len(rankings_data) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"{pattern_config['period_label']}のランキングデータがありません"
            )
        
        # 1位を取得
        top_item = rankings_data[0]
        book_id = top_item['book']['id']
        
        # 書籍情報を取得
        book = db.query(Book).filter(Book.id == book_id).first()
        if not book:
            raise HTTPException(status_code=404, detail="書籍が見つかりません")
        
        # 累計いいね数を計算
        total_likes = db.query(
            func.sum(QiitaArticle.likes_count)
        ).join(
            BookQiitaMention,
            QiitaArticle.id == BookQiitaMention.article_id
        ).filter(
            BookQiitaMention.book_id == book.id
        ).scalar() or 0
        
        # 累計記事数を計算
        article_count = db.query(
            func.count(func.distinct(QiitaArticle.id))
        ).join(
            BookQiitaMention,
            QiitaArticle.id == BookQiitaMention.article_id
        ).filter(
            BookQiitaMention.book_id == book.id
        ).scalar() or 0
        
        # ツイート文を生成
        tweet = generate_tweet(book, article_count, total_likes, pattern_config)
        
        return {
            "tweet": tweet,
            "pattern": pattern,
            "pattern_label": pattern_config['title'],
            "period_label": pattern_config['period_label'],
            "book_title": book.title,
            "article_count": article_count,
            "total_likes": total_likes,
            "character_count": len(tweet)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"エラーが発生しました: {str(e)}")

