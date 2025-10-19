"""
説明文が空の書籍に案内メッセージを追加するスクリプト
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

# 追加する説明文
MESSAGE = """【書籍情報について】

現在、この書籍の詳細情報（タイトル、著者、サムネイル画像など）を表示することができません。

これは、Amazonアソシエイトプログラムの承認待ちのため、Amazon PA-APIを使用できない技術的な制約によるものです。

Amazonアソシエイトプログラムの承認が完了次第、速やかにシステムを改修し、書籍の詳細情報とサムネイル画像を表示できるようにいたします。

現在も、この書籍のAmazonページへのリンクは正常に機能しています。
詳細な書籍情報のご確認および購入は、下記の「Amazonで購入」ボタンからお願いいたします。

ご不便をおかけして申し訳ございませんが、何卒ご理解のほどよろしくお願いいたします。"""

def add_message_to_empty_descriptions():
    """
    説明文が空の書籍に案内メッセージを追加
    """
    db = SessionLocal()
    
    try:
        logger.info("=" * 80)
        logger.info("説明文が空の書籍に案内メッセージを追加")
        logger.info("=" * 80)
        logger.info("")
        
        # 説明文が空またはNullの書籍を検索（タイトルが正常なものも含む）
        empty_description_books = db.query(Book).filter(
            (Book.description == None) | (Book.description == '')
        ).all()
        
        logger.info(f"説明文が空の書籍: {len(empty_description_books):,}冊")
        logger.info("")
        
        # タイトル別に集計
        title_starts_with_isbn = 0
        title_normal = 0
        
        for book in empty_description_books:
            if book.title and book.title.startswith('ISBN:'):
                title_starts_with_isbn += 1
            else:
                title_normal += 1
        
        logger.info(f"  - タイトルが「ISBN:」で始まる書籍: {title_starts_with_isbn:,}冊")
        logger.info(f"  - タイトルが正常な書籍: {title_normal:,}冊")
        logger.info("")
        
        # 全ての説明文が空の書籍に案内メッセージを追加
        updated_count = 0
        for book in empty_description_books:
            book.description = MESSAGE
            updated_count += 1
        
        db.commit()
        
        logger.info("=" * 80)
        logger.info("✓ 案内メッセージの追加完了")
        logger.info("=" * 80)
        logger.info(f"メッセージを追加した書籍: {updated_count:,}冊")
        logger.info("")
        logger.info("追加したメッセージ:")
        logger.info("-" * 80)
        logger.info(MESSAGE)
        logger.info("-" * 80)
        
    finally:
        db.close()

if __name__ == "__main__":
    add_message_to_empty_descriptions()

