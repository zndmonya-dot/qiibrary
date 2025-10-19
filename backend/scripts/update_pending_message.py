"""
既存の説明文を新しいメッセージに更新するスクリプト
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

# 新しい説明文
NEW_MESSAGE = """【書籍情報について】

現在、この書籍の詳細情報（タイトル、著者、サムネイル画像など）を表示することができません。

これは、Amazonアソシエイトプログラムの承認待ちのため、Amazon PA-APIを使用できない技術的な制約によるものです。

Amazonアソシエイトプログラムの承認が完了次第、速やかにシステムを改修し、書籍の詳細情報とサムネイル画像を表示できるようにいたします。

現在も、この書籍のAmazonページへのリンクは正常に機能しています。
詳細な書籍情報のご確認および購入は、下記の「Amazonで購入」ボタンからお願いいたします。

ご不便をおかけして申し訳ございませんが、何卒ご理解のほどよろしくお願いいたします。"""

# 古い説明文（検索用）
OLD_MESSAGE_START = "この書籍の詳細情報は現在取得中です。"

def update_pending_message():
    """
    古い説明文を新しいものに更新
    """
    db = SessionLocal()
    
    try:
        logger.info("=" * 80)
        logger.info("説明文を新しいメッセージに更新")
        logger.info("=" * 80)
        logger.info("")
        
        # タイトルが「ISBN: 」で始まる書籍を検索
        books = db.query(Book).filter(
            Book.title.like('ISBN:%')
        ).all()
        
        logger.info(f"対象書籍数: {len(books):,}冊")
        logger.info("")
        
        updated_count = 0
        
        for book in books:
            # 古い説明文または空の場合に新しい説明文を設定
            if not book.description or book.description.strip() == '' or OLD_MESSAGE_START in book.description:
                book.description = NEW_MESSAGE
                updated_count += 1
        
        db.commit()
        
        logger.info("=" * 80)
        logger.info("✓ 説明文の更新完了")
        logger.info("=" * 80)
        logger.info(f"更新した書籍: {updated_count:,}冊")
        logger.info("")
        logger.info("新しい説明文:")
        logger.info("-" * 80)
        logger.info(NEW_MESSAGE)
        logger.info("-" * 80)
        
    finally:
        db.close()

if __name__ == "__main__":
    update_pending_message()

