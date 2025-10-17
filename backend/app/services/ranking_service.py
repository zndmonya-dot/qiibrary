"""
ランキング集計サービス
スライディングウィンドウ方式による日次/30日/365日ランキング
"""

import logging
from typing import List, Dict, Optional
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from ..models.book import Book, BookDailyStat
from ..models.youtube_video import YouTubeVideo, BookMention

logger = logging.getLogger(__name__)


class RankingService:
    """ランキング集計サービス"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_today_ranking(
        self,
        locale: str = "ja",
        limit: int = 50
    ) -> List[Dict]:
        """
        今日のランキングを取得
        
        Args:
            locale: ロケール (ja/en)
            limit: 取得件数
        
        Returns:
            ランキングリスト
        """
        today = date.today()
        return self._get_ranking_by_date_range(
            start_date=today,
            end_date=today,
            locale=locale,
            limit=limit,
            ranking_type="today"
        )
    
    def get_last30days_ranking(
        self,
        locale: str = "ja",
        limit: int = 50
    ) -> List[Dict]:
        """
        過去30日間のランキングを取得（スライディングウィンドウ）
        
        Args:
            locale: ロケール
            limit: 取得件数
        
        Returns:
            ランキングリスト
        """
        end_date = date.today()
        start_date = end_date - timedelta(days=30)
        
        return self._get_ranking_by_date_range(
            start_date=start_date,
            end_date=end_date,
            locale=locale,
            limit=limit,
            ranking_type="last30days"
        )
    
    def get_last365days_ranking(
        self,
            locale: str = "ja",
        limit: int = 50
    ) -> List[Dict]:
        """
        過去365日間のランキングを取得（スライディングウィンドウ）
        
        Args:
            locale: ロケール
            limit: 取得件数
        
        Returns:
            ランキングリスト
        """
        end_date = date.today()
        start_date = end_date - timedelta(days=365)
        
        return self._get_ranking_by_date_range(
            start_date=start_date,
            end_date=end_date,
            locale=locale,
            limit=limit,
            ranking_type="last365days"
        )
    
    def _get_ranking_by_date_range(
        self,
        start_date: date,
        end_date: date,
        locale: str,
        limit: int,
        ranking_type: str
    ) -> List[Dict]:
        """
        指定期間のランキングを取得
        
        Args:
            start_date: 開始日
            end_date: 終了日
            locale: ロケール
            limit: 取得件数
            ranking_type: ランキングタイプ
        
        Returns:
            ランキングリスト
        """
        # 期間内の日次統計を集計
        stats_query = (
            self.db.query(
                Book.id.label('book_id'),
                Book.asin,
                Book.title,
                Book.author,
                Book.publisher,
                Book.publication_date,
                Book.price,
                Book.sale_price,
                Book.discount_rate,
                Book.rating,
                Book.review_count,
                Book.image_url,
                Book.amazon_url,
                Book.affiliate_url,
                Book.description,
                Book.locale,
                func.sum(BookDailyStat.daily_views).label('total_views'),
                func.sum(BookDailyStat.daily_mentions).label('total_mentions'),
                func.count(BookDailyStat.id).label('active_days'),
            )
            .join(BookDailyStat, Book.id == BookDailyStat.book_id)
            .filter(
                and_(
                    BookDailyStat.date >= start_date,
                    BookDailyStat.date <= end_date,
                    Book.locale == locale
                )
            )
            .group_by(
                Book.id,
                Book.asin,
                Book.title,
                Book.author,
                Book.publisher,
                Book.publication_date,
                Book.price,
                Book.sale_price,
                Book.discount_rate,
                Book.rating,
                Book.review_count,
                Book.image_url,
                Book.amazon_url,
                Book.affiliate_url,
                Book.description,
                Book.locale,
            )
            .order_by(func.sum(BookDailyStat.daily_views).desc())
            .limit(limit)
        )
        
        results = stats_query.all()
        
        # ランキング形式に整形
        rankings = []
        for rank, row in enumerate(results, start=1):
            rankings.append({
                "rank": rank,
                "book": {
                    "id": row.book_id,
                    "asin": row.asin,
                    "title": row.title,
                    "author": row.author,
                    "publisher": row.publisher,
                    "publication_date": row.publication_date.isoformat() if row.publication_date else None,
                    "price": row.price,
                    "sale_price": row.sale_price,
                    "discount_rate": row.discount_rate,
                    "rating": row.rating,
                    "review_count": row.review_count,
                    "image_url": row.image_url,
                    "amazon_url": row.amazon_url,
                    "affiliate_url": row.affiliate_url,
                    "description": row.description,
                    "locale": row.locale,
                },
                "stats": {
                    "total_views": int(row.total_views) if row.total_views else 0,
                    "total_mentions": int(row.total_mentions) if row.total_mentions else 0,
                    "active_days": int(row.active_days) if row.active_days else 0,
                }
            })
        
        logger.info(
            f"ランキング取得完了: {ranking_type} ({start_date} - {end_date}), "
            f"locale={locale}, {len(rankings)}件"
        )
        
        return rankings
    
    def get_monthly_archive_ranking(
        self,
        year: int,
        month: int,
        locale: str = "ja",
        limit: int = 50
    ) -> List[Dict]:
        """
        特定月のアーカイブランキングを取得（カレンダー月）
        
        Args:
            year: 年
            month: 月
            locale: ロケール
            limit: 取得件数
        
        Returns:
            ランキングリスト
        """
        # 月の最初と最後の日を計算
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        return self._get_ranking_by_date_range(
            start_date=start_date,
            end_date=end_date,
            locale=locale,
            limit=limit,
            ranking_type=f"monthly_archive_{year}_{month:02d}"
        )
    
    def get_yearly_archive_ranking(
        self,
        year: int,
        locale: str = "ja",
        limit: int = 50
    ) -> List[Dict]:
        """
        特定年のアーカイブランキングを取得（カレンダー年）
        
        Args:
            year: 年
            locale: ロケール
            limit: 取得件数
        
        Returns:
            ランキングリスト
        """
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)
        
        return self._get_ranking_by_date_range(
            start_date=start_date,
            end_date=end_date,
            locale=locale,
            limit=limit,
            ranking_type=f"yearly_archive_{year}"
        )
    
    def calculate_daily_stats(self, target_date: Optional[date] = None):
        """
        日次統計を計算してDBに保存
        
        Args:
            target_date: 対象日（Noneの場合は昨日）
        """
        if target_date is None:
            target_date = date.today() - timedelta(days=1)
        
        logger.info(f"日次統計計算開始: {target_date}")
        
        # その日に公開された動画から、書籍の統計を計算
        # mentioned_at が target_date の範囲にある BookMention を集計
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())
        
        stats_query = (
            self.db.query(
                Book.id.label('book_id'),
                func.sum(YouTubeVideo.view_count).label('daily_views'),
                func.count(YouTubeVideo.id).label('daily_mentions')
            )
            .join(BookMention, Book.id == BookMention.book_id)
            .join(YouTubeVideo, BookMention.video_id == YouTubeVideo.id)
            .filter(
                and_(
                    BookMention.mentioned_at >= start_datetime,
                    BookMention.mentioned_at <= end_datetime
                )
            )
            .group_by(Book.id)
        )
        
        results = stats_query.all()
        
        # DBに保存
        for row in results:
            stat = BookDailyStat(
                book_id=row.book_id,
                date=target_date,
                daily_views=int(row.daily_views) if row.daily_views else 0,
                daily_mentions=int(row.daily_mentions) if row.daily_mentions else 0,
            )
            
            # UPSERT（存在すれば更新、なければ挿入）
            existing = self.db.query(BookDailyStat).filter(
                and_(
                    BookDailyStat.book_id == stat.book_id,
                    BookDailyStat.date == stat.date
                )
            ).first()
            
            if existing:
                existing.daily_views = stat.daily_views
                existing.daily_mentions = stat.daily_mentions
            else:
                self.db.add(stat)
        
        self.db.commit()
        logger.info(f"日次統計計算完了: {target_date}, {len(results)}件")
    
    def update_book_cache(self):
        """
        Bookテーブルのキャッシュフィールド（total_views, total_mentions）を更新
        """
        logger.info("書籍キャッシュ更新開始")
        
        # 全書籍の統計を再計算
        stats_query = (
            self.db.query(
                Book.id.label('book_id'),
                func.sum(BookDailyStat.daily_views).label('total_views'),
                func.sum(BookDailyStat.daily_mentions).label('total_mentions'),
                func.max(BookMention.mentioned_at).label('latest_mention_at'),
            )
            .outerjoin(BookDailyStat, Book.id == BookDailyStat.book_id)
            .outerjoin(BookMention, Book.id == BookMention.book_id)
            .group_by(Book.id)
        )
        
        results = stats_query.all()
        
        # 更新
        for row in results:
            book = self.db.query(Book).filter(Book.id == row.book_id).first()
            if book:
                book.total_views = int(row.total_views) if row.total_views else 0
                book.total_mentions = int(row.total_mentions) if row.total_mentions else 0
                book.latest_mention_at = row.latest_mention_at
        
        self.db.commit()
        logger.info(f"書籍キャッシュ更新完了: {len(results)}件")


# ヘルパー関数
def get_ranking_service(db: Session) -> RankingService:
    """RankingServiceインスタンスを取得"""
    return RankingService(db)

