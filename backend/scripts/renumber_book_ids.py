"""
書籍IDを first_mentioned_at の順序で 1 から連番に振り直すスクリプト
"""
import sys
from pathlib import Path
from datetime import datetime

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.book import Book, BookQiitaMention, BookYouTubeLink
from sqlalchemy import text
import logging

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def renumber_book_ids():
    """書籍IDを連番に振り直す"""
    db = SessionLocal()
    
    try:
        logger.info("=" * 80)
        logger.info("書籍IDの連番振り直しを開始")
        logger.info("=" * 80)
        
        # 1. 現在の統計情報
        total_books = db.query(Book).count()
        total_mentions = db.query(BookQiitaMention).count()
        total_youtube = db.query(BookYouTubeLink).count()
        
        logger.info(f"現在の統計:")
        logger.info(f"  総書籍数: {total_books}冊")
        logger.info(f"  総メンション数: {total_mentions}件")
        logger.info(f"  総YouTubeリンク数: {total_youtube}件")
        logger.info("")
        
        # 2. 一時テーブルを作成
        logger.info("一時テーブルを作成中...")
        db.execute(text("""
            CREATE TEMP TABLE books_temp AS
            SELECT 
                ROW_NUMBER() OVER (ORDER BY first_mentioned_at ASC NULLS LAST, created_at ASC, id ASC) AS new_id,
                id AS old_id,
                isbn,
                title,
                author,
                publisher,
                publication_date,
                book_data,
                amazon_url,
                amazon_affiliate_url,
                description,
                thumbnail_url,
                total_mentions,
                first_mentioned_at,
                latest_mention_at,
                created_at,
                updated_at
            FROM books
            ORDER BY first_mentioned_at ASC NULLS LAST, created_at ASC, id ASC
        """))
        
        # 3. book_qiita_mentions の一時テーブルを作成
        logger.info("book_qiita_mentions の一時テーブルを作成中...")
        db.execute(text("""
            CREATE TEMP TABLE book_qiita_mentions_temp AS
            SELECT 
                bqm.id,
                bt.new_id AS new_book_id,
                bqm.article_id,
                bqm.mentioned_at,
                bqm.extracted_identifier,
                bqm.created_at
            FROM book_qiita_mentions bqm
            JOIN books_temp bt ON bqm.book_id = bt.old_id
        """))
        
        # 4. book_youtube_links の一時テーブルを作成
        logger.info("book_youtube_links の一時テーブルを作成中...")
        db.execute(text("""
            CREATE TEMP TABLE book_youtube_links_temp AS
            SELECT 
                byl.id,
                bt.new_id AS new_book_id,
                byl.youtube_url,
                byl.youtube_video_id,
                byl.title,
                byl.thumbnail_url,
                byl.display_order,
                byl.created_at,
                byl.updated_at
            FROM book_youtube_links byl
            JOIN books_temp bt ON byl.book_id = bt.old_id
        """))
        
        db.commit()
        logger.info("一時テーブルの作成完了")
        logger.info("")
        
        # 5. 既存テーブルをTRUNCATEして、新しいデータを挿入
        logger.info("既存データを削除中...")
        db.execute(text("TRUNCATE TABLE book_qiita_mentions CASCADE"))
        db.execute(text("TRUNCATE TABLE book_youtube_links CASCADE"))
        db.execute(text("TRUNCATE TABLE books CASCADE"))
        db.commit()
        logger.info("削除完了")
        logger.info("")
        
        # 6. books テーブルに新しいデータを挿入
        logger.info("books テーブルに新しいデータを挿入中...")
        db.execute(text("""
            INSERT INTO books (
                id, isbn, title, author, publisher, publication_date,
                book_data, amazon_url, amazon_affiliate_url, description,
                thumbnail_url, total_mentions, first_mentioned_at, latest_mention_at,
                created_at, updated_at
            )
            SELECT 
                new_id, isbn, title, author, publisher, publication_date,
                book_data, amazon_url, amazon_affiliate_url, description,
                thumbnail_url, total_mentions, first_mentioned_at, latest_mention_at,
                created_at, updated_at
            FROM books_temp
            ORDER BY new_id
        """))
        db.commit()
        logger.info(f"books テーブル: {total_books}件挿入完了")
        logger.info("")
        
        # 7. book_qiita_mentions テーブルに新しいデータを挿入
        logger.info("book_qiita_mentions テーブルに新しいデータを挿入中...")
        db.execute(text("""
            INSERT INTO book_qiita_mentions (
                id, book_id, article_id, mentioned_at, extracted_identifier, created_at
            )
            SELECT 
                id, new_book_id, article_id, mentioned_at, extracted_identifier, created_at
            FROM book_qiita_mentions_temp
            ORDER BY id
        """))
        db.commit()
        logger.info(f"book_qiita_mentions テーブル: {total_mentions}件挿入完了")
        logger.info("")
        
        # 8. book_youtube_links テーブルに新しいデータを挿入
        if total_youtube > 0:
            logger.info("book_youtube_links テーブルに新しいデータを挿入中...")
            db.execute(text("""
                INSERT INTO book_youtube_links (
                    id, book_id, youtube_url, youtube_video_id, title,
                    thumbnail_url, display_order, created_at, updated_at
                )
                SELECT 
                    id, new_book_id, youtube_url, youtube_video_id, title,
                    thumbnail_url, display_order, created_at, updated_at
                FROM book_youtube_links_temp
                ORDER BY id
            """))
            db.commit()
            logger.info(f"book_youtube_links テーブル: {total_youtube}件挿入完了")
            logger.info("")
        
        # 9. シーケンスをリセット
        logger.info("シーケンスをリセット中...")
        db.execute(text(f"SELECT setval('books_id_seq', {total_books}, true)"))
        db.commit()
        logger.info(f"books_id_seq を {total_books} にリセット")
        logger.info("")
        
        # 10. 結果の確認
        logger.info("=" * 80)
        logger.info("IDの振り直し完了")
        logger.info("=" * 80)
        
        # 最初と最後の書籍を確認
        first_book = db.query(Book).order_by(Book.id).first()
        last_book = db.query(Book).order_by(Book.id.desc()).first()
        
        logger.info(f"最初の書籍: ID={first_book.id}, ISBN={first_book.isbn}, Title={first_book.title[:50] if first_book.title else 'N/A'}...")
        logger.info(f"最後の書籍: ID={last_book.id}, ISBN={last_book.isbn}, Title={last_book.title[:50] if last_book.title else 'N/A'}...")
        logger.info("")
        logger.info(f"IDは 1 から {total_books} まで連番になっています")
        
    except Exception as e:
        db.rollback()
        logger.error(f"エラーが発生しました: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    renumber_book_ids()

