"""
ランキング集計サービス（Qiita記事ベース）
"""

import logging
import math
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models.book import Book, BookQiitaMention
from ..models.qiita_article import QiitaArticle
from ..services.openbd_service import get_openbd_service

logger = logging.getLogger(__name__)


class RankingService:
    """Qiita記事ベースのランキング集計サービス"""
    
    def __init__(self, db: Session):
        self.db = db
        self.openbd_service = get_openbd_service()
    
    def get_ranking(
        self,
        tags: Optional[List[str]] = None,
        days: Optional[int] = None,
        year: Optional[int] = None,
        month: Optional[int] = None,
        limit: Optional[int] = None,
        scoring_method: str = "weighted"
    ) -> List[Dict]:
        """
        書籍ランキングを取得
        
        Args:
            tags: フィルタするタグのリスト（例: ["Python", "JavaScript"]）
            days: 過去N日間のランキング（Qiita記事のpublished_at基準、Noneの場合は全期間）
            year: 特定の年のランキング（例: 2024、Qiita記事が投稿された年）
            month: 特定の月のランキング（1-12、yearと併用、Qiita記事が投稿された月）
            limit: 取得件数（Noneの場合は全件）
            scoring_method: スコアリング方式
                - "simple": シンプル（言及数のみ）
                - "weighted": 加重スコア（推奨）
                - "quality": 品質重視
        
        Returns:
            ランキングリスト
        
        Note:
            期間フィルタは実際にその期間内に投稿されたQiita記事を基準にします。
            例：2022年のランキングは、2022年内に投稿されたQiita記事で言及された書籍が対象。
        """
        # 基本クエリ：書籍ごとの言及数とユニークユーザー数を集計
        query = (
            self.db.query(
                Book.id,
                Book.isbn,
                Book.title,
                Book.author,
                Book.publisher,
                Book.publication_date,
                Book.description,
                Book.thumbnail_url,
                Book.amazon_url,
                Book.amazon_affiliate_url,
                Book.total_mentions,
                Book.first_mentioned_at,
                func.count(BookQiitaMention.id).label('mention_count'),
                func.count(func.distinct(QiitaArticle.id)).label('article_count'),
                func.count(func.distinct(QiitaArticle.author_id)).label('unique_user_count'),  # ユニークユーザー数
                func.sum(QiitaArticle.likes_count).label('total_likes'),
                func.max(BookQiitaMention.mentioned_at).label('latest_mention_at'),
            )
            .join(BookQiitaMention, Book.id == BookQiitaMention.book_id)
            .join(QiitaArticle, BookQiitaMention.article_id == QiitaArticle.id)
        )
        
        # タグフィルタ
        if tags:
            # タグのいずれかに一致する記事のみ
            tag_conditions = []
            for tag in tags:
                tag_conditions.append(
                    func.jsonb_exists(QiitaArticle.tags, tag)
                )
            if len(tag_conditions) == 1:
                query = query.filter(tag_conditions[0])
            else:
                query = query.filter(func.or_(*tag_conditions))
        
        # 期間フィルタ（Qiita記事のpublished_at基準）
        if days is not None:
            start_date = datetime.now() - timedelta(days=days)
            query = query.filter(QiitaArticle.published_at >= start_date)
        
        # 年別・月別フィルタ
        if year is not None:
            from datetime import date
            import calendar
            
            if month is not None:
                # 特定の年月（Qiita記事が当該月に投稿されたもの）
                month_start = date(year, month, 1)
                last_day = calendar.monthrange(year, month)[1]
                month_end = date(year, month, last_day)
                query = query.filter(
                    QiitaArticle.published_at >= month_start,
                    QiitaArticle.published_at <= month_end
                )
            else:
                # 年全体（Qiita記事が当該年に投稿されたもの）
                year_start = date(year, 1, 1)
                year_end = date(year, 12, 31)
                query = query.filter(
                    QiitaArticle.published_at >= year_start,
                    QiitaArticle.published_at <= year_end
                )
        
        # グループ化
        query = query.group_by(
            Book.id,
            Book.isbn,
            Book.title,
            Book.author,
            Book.publisher,
            Book.publication_date,
            Book.description,
            Book.thumbnail_url,
            Book.amazon_url,
            Book.amazon_affiliate_url,
            Book.total_mentions,
            Book.first_mentioned_at,
        )
        
        results = query.all()
        
        # スコア計算とソート
        scored_results = []
        for row in results:
            mention_count = int(row.mention_count) if row.mention_count else 0
            article_count = int(row.article_count) if row.article_count else 0
            unique_user_count = int(row.unique_user_count) if row.unique_user_count else 0
            total_likes = int(row.total_likes) if row.total_likes else 0
            avg_likes = total_likes / article_count if article_count > 0 else 0
            
            # スコアリング方式に応じて計算
            # 【重要】ユニークユーザー数を基準にすることで、1人が大量投稿しても高スコアにならない
            score: float
            if scoring_method == "simple":
                # シンプル：ユニークユーザー数のみ
                score = float(unique_user_count)
            elif scoring_method == "weighted":
                # 加重スコア
                # スコア = (ユニークユーザー数 × 10) + (総いいね数 × 0.5) + (平均いいね数 × 3)
                score = (unique_user_count * 10) + (total_likes * 0.5) + (avg_likes * 3)
            elif scoring_method == "quality":
                # 品質重視（デフォルト）
                # スコア = ユニークユーザー数 × (1 + log(平均いいね数 + 1))
                # 多くのユーザーに支持され、かついいね数も多い書籍を上位に
                score = unique_user_count * (1 + math.log(avg_likes + 1))
            else:
                # デフォルトは品質重視
                score = unique_user_count * (1 + math.log(avg_likes + 1))
            
            scored_results.append((score, row, avg_likes))
        
        # スコアでソート
        scored_results.sort(key=lambda x: x[0], reverse=True)
        
        # 上位N件を取得とスコアを保持（limitがNoneの場合は全件）
        top_results = scored_results[:limit] if limit is not None else scored_results
        
        # ランキング形式に整形
        rankings = []
        now = datetime.now()
        for rank, (calculated_score, row, _) in enumerate(top_results, start=1):
            # スコアと統計情報を再計算
            mention_count = int(row.mention_count) if row.mention_count else 0
            article_count = int(row.article_count) if row.article_count else 0
            unique_user_count = int(row.unique_user_count) if row.unique_user_count else 0
            total_likes = int(row.total_likes) if row.total_likes else 0
            avg_likes = total_likes / article_count if article_count > 0 else 0
            
            # NEWバッジ判定：初登場から30日以内
            is_new = False
            if row.first_mentioned_at:
                days_since_first = (now - row.first_mentioned_at).days
                is_new = days_since_first <= 30
            
            # 動的にAmazonアフィリエイトURLを生成
            amazon_affiliate_url = self.openbd_service.generate_amazon_affiliate_url(row.isbn)
            
            rankings.append({
                "rank": rank,
                "book": {
                    "id": row.id,
                    "isbn": row.isbn,
                    "title": row.title,
                    "author": row.author,
                    "publisher": row.publisher,
                    "publication_date": row.publication_date.isoformat() if row.publication_date else None,
                    "description": row.description,
                    "thumbnail_url": row.thumbnail_url,
                    "amazon_url": row.amazon_url,
                    "amazon_affiliate_url": amazon_affiliate_url,  # 動的に生成
                    "total_mentions": row.total_mentions,
                },
                "stats": {
                    "mention_count": mention_count,
                    "article_count": article_count,
                    "unique_user_count": unique_user_count,  # ユニークユーザー数
                    "total_likes": total_likes,
                    "avg_likes": round(avg_likes, 2),  # 平均いいね数
                    "score": round(calculated_score, 2),  # スコア
                    "latest_mention_at": row.latest_mention_at.isoformat() if row.latest_mention_at else None,
                    "is_new": is_new,  # NEWバッジ表示フラグ
                }
            })
        
        logger.info(
            f"ランキング取得完了: tags={tags}, days={days}, {len(rankings)}件"
        )
        
        return rankings
    
    def get_all_tags(self) -> List[Dict]:
        """
        すべてのタグとその書籍数を取得
        
        Returns:
            タグのリスト（書籍数でソート）
        """
        # すべての記事からタグを抽出
        articles = self.db.query(QiitaArticle.tags).all()
        
        # タグごとに書籍数をカウント
        tag_counts = {}
        for article in articles:
            for tag in article.tags:
                if tag not in tag_counts:
                    tag_counts[tag] = 0
                tag_counts[tag] += 1
        
        # ソート
        sorted_tags = sorted(
            [{"tag": tag, "book_count": count} for tag, count in tag_counts.items()],
            key=lambda x: x["book_count"],
            reverse=True
        )
        
        return sorted_tags
    
    def get_available_years(self) -> List[int]:
        """
        データが存在する年のリストを取得
        
        Returns:
            年のリスト（降順）
        """
        from sqlalchemy import extract, distinct
        from typing import Any, List as ListType
        
        # latest_mention_atから年を抽出
        years: ListType[Any] = (
            self.db.query(distinct(extract('year', Book.latest_mention_at)))
            .filter(Book.latest_mention_at.isnot(None))
            .order_by(extract('year', Book.latest_mention_at).desc())
            .all()
        )
        
        return [int(year[0]) for year in years if year[0]]


# ヘルパー関数
def get_ranking_service(db: Session) -> RankingService:
    """RankingServiceインスタンスを取得"""
    return RankingService(db)
