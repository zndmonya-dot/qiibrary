"""
書籍情報が不完全なデータをGoogle Books APIで更新するスクリプト
"""
import sys
from pathlib import Path
import time

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.book import Book
from app.services.google_books_service import GoogleBooksService
import logging

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def update_missing_info(limit: int = None):
    """
    書籍情報が不完全なデータを更新
    
    Args:
        limit: 更新する最大件数（Noneの場合は全件）
    """
    db = SessionLocal()
    google_books_service = GoogleBooksService()
    
    try:
        logger.info("=" * 80)
        logger.info("書籍情報の更新を開始")
        logger.info("=" * 80)
        logger.info("")
        
        # タイトルが「ISBN: 」で始まる書籍を検索
        query = db.query(Book).filter(Book.title.like('ISBN:%'))
        
        if limit:
            missing_books = query.limit(limit).all()
            total_count = query.count()
            logger.info(f"更新対象: {total_count:,}冊中、{limit}冊を更新")
        else:
            missing_books = query.all()
            logger.info(f"更新対象: {len(missing_books):,}冊")
        
        logger.info("")
        
        updated_count = 0
        failed_count = 0
        
        for i, book in enumerate(missing_books, 1):
            try:
                logger.info(f"[{i}/{len(missing_books)}] ISBN: {book.isbn} を更新中...")
                
                # Google Books APIで情報を取得
                book_info = google_books_service.get_book_by_isbn(book.isbn)
                
                if book_info:
                    # 情報を更新
                    if book_info.get('title'):
                        book.title = book_info['title']
                    if book_info.get('authors'):
                        book.author = ', '.join(book_info['authors'])
                    if book_info.get('publisher'):
                        book.publisher = book_info['publisher']
                    if book_info.get('publishedDate'):
                        book.publication_date = book_info['publishedDate']
                    if book_info.get('description'):
                        book.description = book_info['description']
                    if book_info.get('thumbnail'):
                        book.thumbnail_url = book_info['thumbnail']
                    
                    db.commit()
                    updated_count += 1
                    logger.info(f"  ✓ 更新成功: {book.title[:60]}")
                else:
                    failed_count += 1
                    logger.info(f"  ✗ 情報が見つかりませんでした")
                
                # API制限を考慮して少し待機
                if i % 10 == 0:
                    time.sleep(1)
                
            except Exception as e:
                failed_count += 1
                logger.error(f"  ✗ エラー: {e}")
                continue
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("更新完了")
        logger.info("=" * 80)
        logger.info(f"更新成功: {updated_count:,}冊")
        logger.info(f"更新失敗: {failed_count:,}冊")
        logger.info(f"合計処理: {len(missing_books):,}冊")
        
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='不完全な書籍情報を更新')
    parser.add_argument(
        '--limit',
        type=int,
        default=None,
        help='更新する最大件数（デフォルト: 全件）'
    )
    
    args = parser.parse_args()
    
    update_missing_info(limit=args.limit)

