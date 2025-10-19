"""
データ収集完了後の統計情報を確認するスクリプト
"""
import sys
from pathlib import Path

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.book import Book, BookQiitaMention
from app.models.qiita_article import QiitaArticle
import logging

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_stats():
    """統計情報を表示"""
    db = SessionLocal()
    
    try:
        logger.info("=" * 80)
        logger.info("データベース統計情報")
        logger.info("=" * 80)
        
        # 基本統計
        total_books = db.query(Book).count()
        total_articles = db.query(QiitaArticle).count()
        total_mentions = db.query(BookQiitaMention).count()
        
        logger.info(f"総書籍数: {total_books:,}冊")
        logger.info(f"総記事数: {total_articles:,}件")
        logger.info(f"総メンション数: {total_mentions:,}件")
        
        # 日付範囲
        first_book = db.query(Book).order_by(Book.first_mentioned_at).first()
        last_book = db.query(Book).order_by(Book.first_mentioned_at.desc()).first()
        
        if first_book and last_book:
            logger.info("")
            logger.info("データ期間:")
            logger.info(f"  最古の書籍メンション: {first_book.first_mentioned_at.strftime('%Y-%m-%d')}")
            logger.info(f"  最新の書籍メンション: {last_book.first_mentioned_at.strftime('%Y-%m-%d')}")
            logger.info(f"  最古の書籍: {first_book.title[:50]}...")
            logger.info(f"  最新の書籍: {last_book.title[:50]}...")
        
        # ID範囲
        max_id = db.query(Book.id).order_by(Book.id.desc()).first()
        if max_id:
            logger.info("")
            logger.info(f"書籍ID範囲: 1 ～ {max_id[0]}")
        
        logger.info("=" * 80)
        
    finally:
        db.close()

if __name__ == "__main__":
    check_stats()

