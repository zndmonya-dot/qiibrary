"""
ランキング集計サービス（Qiita記事ベース）
"""

import logging
import math
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from ..models.book import Book, BookQiitaMention
from ..models.qiita_article import QiitaArticle
from ..services.openbd_service import get_openbd_service

logger = logging.getLogger(__name__)


class RankingService:
    """Qiita記事ベースのランキング集計サービス"""
    
    def __init__(self, db: Session):
        self.db = db
        self.openbd_service = get_openbd_service()
    
    def get_ranking_fast(
        self,
        tags: Optional[List[str]] = None,
        days: Optional[int] = None,
        year: Optional[int] = None,
        month: Optional[int] = None,
        limit: Optional[int] = 100
    ) -> List[Dict]:
        """
        高速ランキング取得（直接SQL使用、top_articlesも2クエリで効率取得）
        
        NEONなどネットワークレイテンシーが高い環境でも高速動作
        """
        # 期間条件を構築
        date_condition = ""
        if days is not None:
            start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            date_condition = f"AND qa.published_at >= '{start_date}'"
        elif year is not None and month is not None:
            import calendar
            last_day = calendar.monthrange(year, month)[1]
            date_condition = f"AND qa.published_at >= '{year}-{month:02d}-01' AND qa.published_at <= '{year}-{month:02d}-{last_day}'"
        elif year is not None:
            date_condition = f"AND qa.published_at >= '{year}-01-01' AND qa.published_at <= '{year}-12-31'"
        
        # タグ条件を構築
        tag_condition = ""
        if tags:
            tag_checks = " OR ".join([f"qa.tags ? '{tag}'" for tag in tags])
            tag_condition = f"AND ({tag_checks})"
        
        # limit句
        limit_clause = f"LIMIT {limit}" if limit else ""
        
        # 直接SQL（1回のクエリでランキングデータ取得）
        # スコアを計算してソート（元のget_ranking()と同じロジック）
        sql = text(f"""
            WITH book_stats AS (
                SELECT 
                    b.id, b.isbn, b.title, b.author, b.publisher, b.publication_date,
                    b.description, b.thumbnail_url, b.amazon_url, b.amazon_affiliate_url,
                    b.total_mentions, b.first_mentioned_at,
                    COUNT(DISTINCT bqm.id) as mention_count,
                    COUNT(DISTINCT qa.id) as article_count,
                    COUNT(DISTINCT qa.author_id) as unique_user_count,
                    COALESCE(SUM(qa.likes_count), 0) as total_likes,
                    MAX(bqm.mentioned_at) as latest_mention_at
                FROM books b
                JOIN book_qiita_mentions bqm ON b.id = bqm.book_id
                JOIN qiita_articles qa ON bqm.article_id = qa.id
                WHERE 1=1
                {date_condition}
                {tag_condition}
                GROUP BY b.id, b.isbn, b.title, b.author, b.publisher, b.publication_date,
                         b.description, b.thumbnail_url, b.amazon_url, b.amazon_affiliate_url,
                         b.total_mentions, b.first_mentioned_at
            )
            SELECT 
                *,
                -- 品質重視スコア: unique_user_count * (1 + ln(avg_likes + 1))
                unique_user_count * (1 + LN(CASE WHEN article_count > 0 THEN (total_likes::float / article_count) + 1 ELSE 1 END)) as calculated_score
            FROM book_stats
            ORDER BY calculated_score DESC
            {limit_clause}
        """)
        
        results = self.db.execute(sql).fetchall()
        
        # 取得した書籍IDのリストを作成
        book_ids = [row.id for row in results]
        
        # トップ記事を一括取得（2回目のクエリ）
        top_articles_map = {}
        if book_ids:
            # WINDOW関数でトップ3記事を一括取得
            articles_sql = text(f"""
                WITH ranked_articles AS (
                    SELECT 
                        bqm.book_id,
                        qa.id,
                        qa.qiita_id,
                        qa.title,
                        qa.url,
                        qa.author_id,
                        qa.author_name,
                        qa.likes_count,
                        qa.published_at,
                        ROW_NUMBER() OVER (PARTITION BY bqm.book_id ORDER BY qa.likes_count DESC) as rn
                    FROM book_qiita_mentions bqm
                    JOIN qiita_articles qa ON bqm.article_id = qa.id
                    WHERE bqm.book_id = ANY(:book_ids)
                    {date_condition}
                    {tag_condition}
                )
                SELECT * FROM ranked_articles WHERE rn <= 3
                ORDER BY book_id, rn
            """)
            
            articles_results = self.db.execute(articles_sql, {"book_ids": book_ids}).fetchall()
            
            # book_id別にトップ記事を整理
            for article in articles_results:
                if article.book_id not in top_articles_map:
                    top_articles_map[article.book_id] = []
                
                top_articles_map[article.book_id].append({
                    "id": article.id,
                    "qiita_id": article.qiita_id,
                    "title": article.title,
                    "url": article.url,
                    "author_id": article.author_id,
                    "author_name": article.author_name,
                    "likes_count": article.likes_count,
                    "published_at": article.published_at.isoformat() if article.published_at else None,
                })
        
        # ランキング形式に整形
        rankings = []
        now = datetime.now()
        for rank, row in enumerate(results, start=1):
            mention_count = int(row.mention_count) if row.mention_count else 0
            article_count = int(row.article_count) if row.article_count else 0
            unique_user_count = int(row.unique_user_count) if row.unique_user_count else 0
            total_likes = int(row.total_likes) if row.total_likes else 0
            avg_likes = total_likes / article_count if article_count > 0 else 0
            
            # スコア（SQLで計算済み）
            score = float(row.calculated_score) if hasattr(row, 'calculated_score') else unique_user_count * (1 + math.log(avg_likes + 1))
            
            # NEWバッジ判定
            is_new = False
            if row.first_mentioned_at:
                days_since_first = (now - row.first_mentioned_at).days
                is_new = days_since_first <= 30
            
            # Amazonアフィリエイトリンク生成
            amazon_affiliate_url = self.openbd_service.generate_amazon_affiliate_url(row.isbn)
            
            # トップ記事を取得
            top_articles = top_articles_map.get(row.id, [])
            
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
                    "amazon_affiliate_url": amazon_affiliate_url,
                    "total_mentions": row.total_mentions,
                },
                "stats": {
                    "mention_count": mention_count,
                    "article_count": article_count,
                    "unique_user_count": unique_user_count,
                    "total_likes": total_likes,
                    "avg_likes": round(avg_likes, 2),
                    "score": round(score, 2),
                    "latest_mention_at": row.latest_mention_at.isoformat() if row.latest_mention_at else None,
                    "is_new": is_new,
                },
                "top_articles": top_articles,
            })
        
        logger.info(f"高速ランキング取得完了: {len(rankings)}件、トップ記事も取得")
        return rankings
    
    def get_ranking(
        self,
        tags: Optional[List[str]] = None,
        days: Optional[int] = None,
        year: Optional[int] = None,
        month: Optional[int] = None,
        limit: Optional[int] = 100,  # デフォルト100件に制限してパフォーマンス改善
        scoring_method: str = "weighted"
    ) -> List[Dict]:
        """
        書籍ランキングを取得
        
        Args:
            tags: フィルタするタグのリスト（例: ["Python", "JavaScript"]）
            days: 過去N日間のランキング（Qiita記事のpublished_at基準、Noneの場合は全期間）
            year: 特定の年のランキング（例: 2024、Qiita記事が投稿された年）
            month: 特定の月のランキング（1-12、yearと併用、Qiita記事が投稿された月）
            limit: 取得件数（デフォルト: 100件、パフォーマンスのため制限推奨）
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
            
            # トップ3記事を取得
            top_articles = self._get_top_articles(row.id, tags, days, year, month, limit=3)
            
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
                },
                "top_articles": top_articles,  # トップ3記事
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
    
    def _get_top_articles(
        self,
        book_id: int,
        tags: Optional[List[str]] = None,
        days: Optional[int] = None,
        year: Optional[int] = None,
        month: Optional[int] = None,
        limit: int = 3
    ) -> List[Dict]:
        """
        指定された書籍のトップN記事を取得（いいね数順）
        
        Args:
            book_id: 書籍ID
            tags: タグフィルタ
            days: 期間フィルタ（日数）
            year: 年フィルタ
            month: 月フィルタ
            limit: 取得件数
        
        Returns:
            トップN記事のリスト
        """
        query = (
            self.db.query(QiitaArticle)
            .join(BookQiitaMention, BookQiitaMention.article_id == QiitaArticle.id)
            .filter(BookQiitaMention.book_id == book_id)
        )
        
        # タグフィルタ
        if tags:
            tag_conditions = []
            for tag in tags:
                tag_conditions.append(func.jsonb_exists(QiitaArticle.tags, tag))
            if len(tag_conditions) == 1:
                query = query.filter(tag_conditions[0])
            else:
                query = query.filter(func.or_(*tag_conditions))
        
        # 期間フィルタ
        if days is not None:
            start_date = datetime.now() - timedelta(days=days)
            query = query.filter(QiitaArticle.published_at >= start_date)
        
        # 年別・月別フィルタ
        if year is not None:
            from datetime import date
            import calendar
            
            if month is not None:
                month_start = date(year, month, 1)
                last_day = calendar.monthrange(year, month)[1]
                month_end = date(year, month, last_day)
                query = query.filter(
                    QiitaArticle.published_at >= month_start,
                    QiitaArticle.published_at <= month_end
                )
            else:
                year_start = date(year, 1, 1)
                year_end = date(year, 12, 31)
                query = query.filter(
                    QiitaArticle.published_at >= year_start,
                    QiitaArticle.published_at <= year_end
                )
        
        # いいね数順でソートして上位N件を取得
        articles = query.order_by(QiitaArticle.likes_count.desc()).limit(limit).all()
        
        # 結果を整形
        result = []
        for article in articles:
            result.append({
                "id": article.id,
                "title": article.title,
                "url": article.url,
                "author_id": article.author_id,
                "author_name": article.author_name,
                "likes_count": article.likes_count,
                "published_at": article.published_at.isoformat() if article.published_at else None,
            })
        
        return result
    
    def get_available_years(self) -> List[int]:
        """
        データが存在する年のリストを取得（高速版：直接SQL使用）
        
        Returns:
            年のリスト（降順）
        """
        # 直接SQLで高速化
        sql = text("""
            SELECT DISTINCT EXTRACT(YEAR FROM published_at)::int as year
            FROM qiita_articles
            WHERE published_at IS NOT NULL
            ORDER BY year DESC
        """)
        
        results = self.db.execute(sql).fetchall()
        return [int(row.year) for row in results if row.year]


# ヘルパー関数
def get_ranking_service(db: Session) -> RankingService:
    """RankingServiceインスタンスを取得"""
    return RankingService(db)
