"""
ランキング集計サービス（Qiita記事ベース）
"""

import logging
from typing import List, Dict, Optional
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc

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
        limit: int = 50
    ) -> List[Dict]:
        """
        書籍ランキングを取得
        
        Args:
            tags: フィルタするタグのリスト（例: ["Python", "JavaScript"]）
            days: 過去N日間のランキング（Noneの場合は全期間）
            limit: 取得件数
        
        Returns:
            ランキングリスト
        """
        # 基本クエリ：書籍ごとの言及数を集計
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
                func.count(BookQiitaMention.id).label('mention_count'),
                func.count(func.distinct(QiitaArticle.id)).label('article_count'),
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
        
        # 期間フィルタ
        if days is not None:
            start_date = datetime.now() - timedelta(days=days)
            query = query.filter(BookQiitaMention.mentioned_at >= start_date)
        
        # グループ化とソート
        query = (
            query.group_by(
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
            )
            .order_by(
                func.count(BookQiitaMention.id).desc(),  # 言及数でソート
                func.sum(QiitaArticle.likes_count).desc(),  # いいね数でソート
            )
            .limit(limit)
        )
        
        results = query.all()
        
        # ランキング形式に整形
        rankings = []
        for rank, row in enumerate(results, start=1):
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
                    "mention_count": int(row.mention_count) if row.mention_count else 0,
                    "article_count": int(row.article_count) if row.article_count else 0,
                    "total_likes": int(row.total_likes) if row.total_likes else 0,
                    "latest_mention_at": row.latest_mention_at.isoformat() if row.latest_mention_at else None,
                }
            })
        
        logger.info(
            f"ランキング取得完了: tags={tags}, days={days}, {len(rankings)}件"
        )
        
        return rankings
    
    def get_all_tags(self) -> List[Dict[str, any]]:
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


# ヘルパー関数
def get_ranking_service(db: Session) -> RankingService:
    """RankingServiceインスタンスを取得"""
    return RankingService(db)
