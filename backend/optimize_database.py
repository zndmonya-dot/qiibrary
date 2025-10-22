"""
データベース最適化スクリプト
"""

import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.config import settings
import time

def optimize_database():
    """データベース最適化を実行"""
    engine = create_engine(settings.DATABASE_URL)
    
    print("=" * 80)
    print("データベース最適化")
    print("=" * 80)
    
    with engine.connect() as conn:
        # 1. 未使用インデックスの削除
        print("\n【1. 未使用インデックスの削除】")
        print("  削除対象インデックス:")
        
        unused_indexes_to_drop = [
            # タグ検索は使用しているため保持: 'idx_qiita_articles_tags',
            'idx_books_first_mention',  # ix_books_first_mentioned_atと重複
            'idx_books_latest_mention',  # ix_books_latest_mention_atと重複
            'idx_books_mentions',  # ix_books_total_mentionsと重複
            'idx_qiita_articles_published',  # ix_qiita_articles_published_atと重複
            'idx_qiita_articles_likes',  # ix_qiita_articles_likes_countと重複
            'idx_book_qiita_date',  # ix_book_qiita_mentions_mentioned_atと重複
        ]
        
        for index_name in unused_indexes_to_drop:
            try:
                conn.execute(text(f"DROP INDEX IF EXISTS {index_name} CASCADE"))
                conn.commit()
                print(f"    OK: {index_name} を削除しました")
            except Exception as e:
                print(f"    NG: {index_name} の削除に失敗: {e}")
        
        # 2. 複合インデックスの追加
        print("\n【2. 複合インデックスの追加】")
        
        new_indexes = [
            {
                "name": "idx_bqm_composite",
                "sql": """
                    CREATE INDEX IF NOT EXISTS idx_bqm_composite 
                    ON book_qiita_mentions(book_id, article_id, mentioned_at DESC)
                """,
                "description": "book_qiita_mentions の複合インデックス（JOINとソート最適化）"
            },
            {
                "name": "idx_qa_published_likes_composite",
                "sql": """
                    CREATE INDEX IF NOT EXISTS idx_qa_published_likes_composite 
                    ON qiita_articles(published_at DESC, likes_count DESC)
                """,
                "description": "qiita_articles の複合インデックス（期間フィルタ+いいね順）"
            },
            {
                "name": "idx_books_active_mentions",
                "sql": """
                    CREATE INDEX IF NOT EXISTS idx_books_active_mentions 
                    ON books(total_mentions DESC, id) 
                    WHERE total_mentions > 0
                """,
                "description": "books のパーシャルインデックス（言及がある書籍のみ）"
            },
        ]
        
        for index in new_indexes:
            try:
                print(f"\n  作成中: {index['name']}")
                print(f"    {index['description']}")
                start_time = time.time()
                conn.execute(text(index['sql']))
                conn.commit()
                elapsed = time.time() - start_time
                print(f"    OK: 完了 ({elapsed:.2f}秒)")
            except Exception as e:
                print(f"    NG: 失敗: {e}")
        
        # 3. 統計情報の更新（重要！）
        print("\n【3. 統計情報の更新（ANALYZE）】")
        tables = ['books', 'qiita_articles', 'book_qiita_mentions']
        
        for table in tables:
            try:
                print(f"  {table} を分析中...")
                start_time = time.time()
                conn.execute(text(f"ANALYZE {table}"))
                conn.commit()
                elapsed = time.time() - start_time
                print(f"    OK: 完了 ({elapsed:.2f}秒)")
            except Exception as e:
                print(f"    NG: 失敗: {e}")
        
        # 4. インデックスの再構築（断片化解消）
        print("\n【4. インデックスの再構築（REINDEX）】")
        print("  注意: 本番環境では REINDEX CONCURRENTLY を使用してください")
        
        try:
            print("  インデックスを再構築中...")
            start_time = time.time()
            # ローカル環境では通常のREINDEX、本番ではCONCURRENTLYを使用
            if "localhost" in settings.DATABASE_URL or "127.0.0.1" in settings.DATABASE_URL:
                conn.execute(text("REINDEX TABLE books"))
                conn.execute(text("REINDEX TABLE qiita_articles"))
                conn.execute(text("REINDEX TABLE book_qiita_mentions"))
                conn.commit()
            else:
                print("    スキップ（本番環境ではREINDEX CONCURRENTLYを手動実行してください）")
            elapsed = time.time() - start_time
            print(f"    OK: 完了 ({elapsed:.2f}秒)")
        except Exception as e:
            print(f"    NG: スキップ: {e}")
        
        # 5. 最適化後のインデックス一覧
        print("\n【5. 最適化後のインデックス一覧】")
        result = conn.execute(text("""
            SELECT 
                schemaname,
                tablename,
                indexname,
                pg_size_pretty(pg_relation_size(schemaname||'.'||indexname::text)) as index_size
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname
        """))
        
        current_table = None
        for row in result:
            if current_table != row.tablename:
                print(f"\n  [{row.tablename}]")
                current_table = row.tablename
            print(f"    {row.indexname:50s} {row.index_size:>10s}")

def verify_optimization():
    """最適化結果を検証"""
    engine = create_engine(settings.DATABASE_URL)
    
    print("\n" + "=" * 80)
    print("最適化結果の検証")
    print("=" * 80)
    
    with engine.connect() as conn:
        # ランキングクエリのパフォーマンステスト
        print("\n【ランキングクエリのパフォーマンス】")
        
        queries = [
            {
                "name": "全期間ランキング（TOP 100）",
                "sql": """
                    WITH book_stats AS (
                        SELECT 
                            b.id, b.isbn, b.title, b.author,
                            COUNT(DISTINCT qa.author_id) as unique_user_count,
                            COALESCE(SUM(qa.likes_count), 0) as total_likes,
                            COUNT(DISTINCT qa.id) as article_count
                        FROM books b
                        JOIN book_qiita_mentions bqm ON b.id = bqm.book_id
                        JOIN qiita_articles qa ON bqm.article_id = qa.id
                        GROUP BY b.id, b.isbn, b.title, b.author
                    )
                    SELECT 
                        *,
                        unique_user_count * (1 + LN(CASE WHEN article_count > 0 THEN (total_likes::float / article_count) + 1 ELSE 1 END)) as score
                    FROM book_stats
                    ORDER BY score DESC
                    LIMIT 100
                """
            },
            {
                "name": "過去365日間ランキング（TOP 100）",
                "sql": """
                    WITH book_stats AS (
                        SELECT 
                            b.id, b.isbn, b.title, b.author,
                            COUNT(DISTINCT qa.author_id) as unique_user_count,
                            COALESCE(SUM(qa.likes_count), 0) as total_likes,
                            COUNT(DISTINCT qa.id) as article_count
                        FROM books b
                        JOIN book_qiita_mentions bqm ON b.id = bqm.book_id
                        JOIN qiita_articles qa ON bqm.article_id = qa.id
                        WHERE qa.published_at >= NOW() - INTERVAL '365 days'
                        GROUP BY b.id, b.isbn, b.title, b.author
                    )
                    SELECT 
                        *,
                        unique_user_count * (1 + LN(CASE WHEN article_count > 0 THEN (total_likes::float / article_count) + 1 ELSE 1 END)) as score
                    FROM book_stats
                    ORDER BY score DESC
                    LIMIT 100
                """
            },
            {
                "name": "年別ランキング（2024年、TOP 100）",
                "sql": """
                    WITH book_stats AS (
                        SELECT 
                            b.id, b.isbn, b.title, b.author,
                            COUNT(DISTINCT qa.author_id) as unique_user_count,
                            COALESCE(SUM(qa.likes_count), 0) as total_likes,
                            COUNT(DISTINCT qa.id) as article_count
                        FROM books b
                        JOIN book_qiita_mentions bqm ON b.id = bqm.book_id
                        JOIN qiita_articles qa ON bqm.article_id = qa.id
                        WHERE qa.published_at >= '2024-01-01' AND qa.published_at <= '2024-12-31'
                        GROUP BY b.id, b.isbn, b.title, b.author
                    )
                    SELECT 
                        *,
                        unique_user_count * (1 + LN(CASE WHEN article_count > 0 THEN (total_likes::float / article_count) + 1 ELSE 1 END)) as score
                    FROM book_stats
                    ORDER BY score DESC
                    LIMIT 100
                """
            },
        ]
        
        for query in queries:
            print(f"\n  {query['name']}")
            start_time = time.time()
            result = conn.execute(text(query['sql']))
            rows = result.fetchall()
            elapsed = time.time() - start_time
            print(f"    実行時間: {elapsed*1000:.1f}ms ({len(rows)}件取得)")
            
            if elapsed > 0.5:
                print(f"    WARNING: 500ms超過（要最適化）")
            elif elapsed > 0.2:
                print(f"    NOTICE: 200ms超過（改善余地あり）")
            else:
                print(f"    OK: 高速")

if __name__ == "__main__":
    try:
        optimize_database()
        verify_optimization()
        
        print("\n" + "=" * 80)
        print("最適化完了")
        print("=" * 80)
        print("\n次のステップ:")
        print("  1. バックエンドサーバーを再起動")
        print("  2. フロントエンドで動作確認")
        print("  3. 本番環境（NEON）にも適用を検討\n")
        
    except Exception as e:
        print(f"\nエラー: {e}")
        import traceback
        traceback.print_exc()

