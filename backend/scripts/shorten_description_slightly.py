"""
説明文を少し短くするスクリプト
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

# 短縮版の説明文
SHORTENED_MESSAGE = """
【書籍情報について】

現在、この書籍の詳細情報（タイトル、著者、サムネイル画像など）を表示できません。

Amazonアソシエイトプログラムの承認待ちのため、Amazon PA-APIを使用できない技術的な制約があります。承認完了次第、速やかに改修いたします。

詳細な書籍情報のご確認および購入は、下記の「Amazonで購入」ボタンからお願いいたします。
"""

# 検索用パターン
OLD_MESSAGE_PATTERN = "現在、この書籍の詳細情報を取得できません。"

def shorten_descriptions():
    """
    説明文を少し短くする
    """
    db = SessionLocal()
    
    try:
        logger.info("=" * 80)
        logger.info("説明文を短縮")
        logger.info("=" * 80)
        logger.info("")
        
        # 短い説明文を持つ書籍を検索
        books_to_update = db.query(Book).filter(
            Book.description.like(f'%{OLD_MESSAGE_PATTERN}%')
        ).all()
        
        logger.info(f"対象書籍数: {len(books_to_update):,}冊")
        logger.info("")
        
        updated_count = 0
        
        for book in books_to_update:
            book.description = SHORTENED_MESSAGE.strip()
            updated_count += 1
        
        db.commit()
        
        logger.info("=" * 80)
        logger.info("✓ 説明文の短縮完了")
        logger.info("=" * 80)
        logger.info(f"更新した書籍: {updated_count:,}冊")
        logger.info("")
        logger.info("短縮後の説明文:")
        logger.info("-" * 80)
        logger.info(SHORTENED_MESSAGE.strip())
        logger.info("-" * 80)
        
    finally:
        db.close()

if __name__ == "__main__":
    shorten_descriptions()

