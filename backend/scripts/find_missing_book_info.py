"""
書籍情報が取得できていないデータを特定するスクリプト
"""
import sys
from pathlib import Path

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.book import Book
import logging

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def find_missing_info():
    """
    書籍情報が不完全なデータを検索
    """
    db = SessionLocal()
    
    try:
        logger.info("=" * 80)
        logger.info("書籍情報が不完全なデータを検索中")
        logger.info("=" * 80)
        logger.info("")
        
        # タイトルが「ISBN: 」で始まる書籍を検索
        missing_title_books = db.query(Book).filter(
            Book.title.like('ISBN:%')
        ).order_by(Book.id).all()
        
        logger.info(f"タイトルが取得できていない書籍: {len(missing_title_books)}冊")
        logger.info("")
        
        if missing_title_books:
            logger.info("詳細:")
            for book in missing_title_books[:50]:  # 最初の50件を表示
                logger.info(f"  ID: {book.id:5d} | ISBN: {book.isbn} | タイトル: {book.title}")
            
            if len(missing_title_books) > 50:
                logger.info(f"  ... 他 {len(missing_title_books) - 50}冊")
        
        logger.info("")
        
        # サムネイルがない書籍を検索
        missing_thumbnail_books = db.query(Book).filter(
            (Book.thumbnail_url == None) | (Book.thumbnail_url == '')
        ).count()
        
        logger.info(f"サムネイルがない書籍: {missing_thumbnail_books:,}冊")
        
        # 説明がない書籍を検索
        missing_description_books = db.query(Book).filter(
            (Book.description == None) | (Book.description == '')
        ).count()
        
        logger.info(f"説明がない書籍: {missing_description_books:,}冊")
        
        # 著者がない書籍を検索
        missing_author_books = db.query(Book).filter(
            (Book.author == None) | (Book.author == '')
        ).count()
        
        logger.info(f"著者がない書籍: {missing_author_books:,}冊")
        
        # 出版社がない書籍を検索
        missing_publisher_books = db.query(Book).filter(
            (Book.publisher == None) | (Book.publisher == '')
        ).count()
        
        logger.info(f"出版社がない書籍: {missing_publisher_books:,}冊")
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("検索完了")
        logger.info("=" * 80)
        
        # 不完全な情報を持つ書籍のISBNリストを返す
        return [book.isbn for book in missing_title_books]
        
    finally:
        db.close()

if __name__ == "__main__":
    missing_isbns = find_missing_info()
    
    if missing_isbns:
        print("\n情報が不完全な書籍のISBN一覧:")
        for isbn in missing_isbns[:20]:
            print(f"  {isbn}")
        if len(missing_isbns) > 20:
            print(f"  ... 他 {len(missing_isbns) - 20}件")

