"""
データベースパフォーマンス分析スクリプト
"""

import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.config import settings
import time

def analyze_query_performance():
    """クエリパフォーマンスを分析"""
    engine = create_engine(settings.DATABASE_URL)
    
    print("=" * 80)
    print("データベースパフォーマンス分析")
    print("=" * 80)
    
    with engine.connect() as conn:
        # 1. テーブルサイズ確認
        print("\n【1. テーブルサイズ】")
        result = conn.execute(text("""
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
                pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        """))
        
        for row in result:
            print(f"  {row.tablename:30s} {row.size:>15s}")
        
        # 2. レコード数確認
        print("\n【2. レコード数】")
        tables = ['books', 'qiita_articles', 'book_qiita_mentions', 'book_youtube_links']
        for table in tables:
            result = conn.execute(text(f"SELECT COUNT(*) as count FROM {table}"))
            count = result.scalar()
            print(f"  {table:30s} {count:>15,} 行")
        
        # 3. インデックス一覧
        print("\n【3. 既存インデックス】")
        result = conn.execute(text("""
            SELECT 
                schemaname,
                tablename,
                indexname,
                indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname
        """))
        
        current_table = None
        for row in result:
            if current_table != row.tablename:
                print(f"\n  [{row.tablename}]")
                current_table = row.tablename
            print(f"    - {row.indexname}")
        
        # 4. ランキングクエリの実行計画を分析
        print("\n【4. ランキングクエリの実行計画（EXPLAIN ANALYZE）】")
        print("  クエリ実行中...")
        
        # 実際のランキングクエリ（簡略版）
        start_time = time.time()
        result = conn.execute(text("""
            EXPLAIN ANALYZE
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
                GROUP BY b.id, b.isbn, b.title, b.author, b.publisher, b.publication_date,
                         b.description, b.thumbnail_url, b.amazon_url, b.amazon_affiliate_url,
                         b.total_mentions, b.first_mentioned_at
            )
            SELECT 
                *,
                unique_user_count * (1 + LN(CASE WHEN article_count > 0 THEN (total_likes::float / article_count) + 1 ELSE 1 END)) as calculated_score
            FROM book_stats
            ORDER BY calculated_score DESC
            LIMIT 100
        """))
        elapsed_time = time.time() - start_time
        
        print(f"\n  実行時間: {elapsed_time:.3f}秒\n")
        for row in result:
            print(f"  {row[0]}")
        
        # 5. トップ記事取得クエリの実行計画
        print("\n【5. トップ記事取得クエリの実行計画】")
        print("  クエリ実行中...")
        
        start_time = time.time()
        result = conn.execute(text("""
            EXPLAIN ANALYZE
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
                WHERE bqm.book_id IN (SELECT id FROM books ORDER BY total_mentions DESC LIMIT 100)
            )
            SELECT * FROM ranked_articles WHERE rn <= 3
            ORDER BY book_id, rn
        """))
        elapsed_time = time.time() - start_time
        
        print(f"\n  実行時間: {elapsed_time:.3f}秒\n")
        for row in result:
            print(f"  {row[0]}")
        
        # 6. インデックスの使用状況
        print("\n【6. インデックス使用状況】")
        result = conn.execute(text("""
            SELECT 
                schemaname,
                relname as tablename,
                indexrelname as indexname,
                idx_scan as index_scans,
                idx_tup_read as tuples_read,
                idx_tup_fetch as tuples_fetched
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public'
            ORDER BY idx_scan DESC
            LIMIT 20
        """))
        
        print(f"  {'Index Name':40s} {'Scans':>10s} {'Reads':>12s} {'Fetches':>12s}")
        print("  " + "-" * 78)
        for row in result:
            print(f"  {row.indexname:40s} {row.index_scans:>10,} {row.tuples_read:>12,} {row.tuples_fetched:>12,}")
        
        # 7. 未使用のインデックス検出
        print("\n【7. 未使用インデックス（idx_scan = 0）】")
        result = conn.execute(text("""
            SELECT 
                schemaname,
                relname as tablename,
                indexrelname as indexname,
                pg_size_pretty(pg_relation_size(indexrelid)) as index_size
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public' AND idx_scan = 0
            ORDER BY pg_relation_size(indexrelid) DESC
        """))
        
        unused_indexes = list(result)
        if unused_indexes:
            for row in unused_indexes:
                print(f"  {row.tablename}.{row.indexname} ({row.index_size})")
        else:
            print("  なし（すべてのインデックスが使用されています）")
        
        # 8. データベース統計情報の更新日時
        print("\n【8. テーブル統計情報の最終更新】")
        result = conn.execute(text("""
            SELECT 
                schemaname,
                relname,
                last_vacuum,
                last_autovacuum,
                last_analyze,
                last_autoanalyze
            FROM pg_stat_user_tables
            WHERE schemaname = 'public'
            ORDER BY relname
        """))
        
        for row in result:
            print(f"\n  [{row.relname}]")
            print(f"    Last VACUUM:        {row.last_vacuum or 'なし'}")
            print(f"    Last Auto VACUUM:   {row.last_autovacuum or 'なし'}")
            print(f"    Last ANALYZE:       {row.last_analyze or 'なし'}")
            print(f"    Last Auto ANALYZE:  {row.last_autoanalyze or 'なし'}")

def suggest_optimizations():
    """最適化の提案"""
    print("\n" + "=" * 80)
    print("最適化の提案")
    print("=" * 80)
    
    suggestions = [
        {
            "title": "1. 複合インデックスの追加",
            "description": "JOINで使用される列の組み合わせに複合インデックスを追加",
            "commands": [
                "CREATE INDEX idx_bqm_book_article ON book_qiita_mentions(book_id, article_id, mentioned_at);",
                "CREATE INDEX idx_qa_published_likes ON qiita_articles(published_at DESC, likes_count DESC);",
            ]
        },
        {
            "title": "2. カバリングインデックス",
            "description": "クエリで使用される列をすべてインデックスに含める（Index Only Scan）",
            "commands": [
                "CREATE INDEX idx_bqm_covering ON book_qiita_mentions(book_id, article_id, mentioned_at) INCLUDE (id, extracted_identifier);",
            ]
        },
        {
            "title": "3. パーシャルインデックス",
            "description": "条件付きインデックスで特定の条件のクエリを高速化",
            "commands": [
                "CREATE INDEX idx_books_active ON books(total_mentions DESC) WHERE total_mentions > 0;",
                "CREATE INDEX idx_qa_recent ON qiita_articles(published_at DESC) WHERE published_at >= NOW() - INTERVAL '365 days';",
            ]
        },
        {
            "title": "4. 統計情報の更新",
            "description": "クエリプランナーが最適な実行計画を作成できるよう統計情報を更新",
            "commands": [
                "VACUUM ANALYZE books;",
                "VACUUM ANALYZE qiita_articles;",
                "VACUUM ANALYZE book_qiita_mentions;",
            ]
        },
        {
            "title": "5. マテリアライズドビュー",
            "description": "頻繁にアクセスされるランキングデータを事前計算",
            "commands": [
                """CREATE MATERIALIZED VIEW mv_book_rankings AS
                WITH book_stats AS (
                    SELECT 
                        b.id, b.isbn, b.title, b.author, b.total_mentions,
                        COUNT(DISTINCT qa.author_id) as unique_user_count,
                        COALESCE(SUM(qa.likes_count), 0) as total_likes,
                        COUNT(DISTINCT qa.id) as article_count
                    FROM books b
                    JOIN book_qiita_mentions bqm ON b.id = bqm.book_id
                    JOIN qiita_articles qa ON bqm.article_id = qa.id
                    GROUP BY b.id, b.isbn, b.title, b.author, b.total_mentions
                )
                SELECT 
                    *,
                    unique_user_count * (1 + LN(CASE WHEN article_count > 0 THEN (total_likes::float / article_count) + 1 ELSE 1 END)) as score
                FROM book_stats;""",
                "CREATE UNIQUE INDEX idx_mv_rankings_id ON mv_book_rankings(id);",
                "CREATE INDEX idx_mv_rankings_score ON mv_book_rankings(score DESC);",
                "-- 定期的に更新: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_book_rankings;",
            ]
        },
    ]
    
    for suggestion in suggestions:
        print(f"\n【{suggestion['title']}】")
        print(f"  {suggestion['description']}\n")
        for cmd in suggestion['commands']:
            print(f"  {cmd}")

if __name__ == "__main__":
    try:
        analyze_query_performance()
        suggest_optimizations()
        
        print("\n" + "=" * 80)
        print("分析完了")
        print("=" * 80)
        print("\n次のステップ:")
        print("  1. 上記の実行計画を確認し、Seq Scanが多い箇所を特定")
        print("  2. 提案されたインデックスを検討・適用")
        print("  3. 統計情報を更新（VACUUM ANALYZE）")
        print("  4. 再度パフォーマンスを測定\n")
        
    except Exception as e:
        print(f"\nエラー: {e}")
        import traceback
        traceback.print_exc()

