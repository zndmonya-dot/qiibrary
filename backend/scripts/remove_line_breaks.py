"""
説明文から改行を削除するスクリプト
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

# 改行なしの説明文
COMPACT_MESSAGE = """【書籍情報について】現在、この書籍の詳細情報（タイトル、著者、サムネイル画像など）を表示できません。Amazonアソシエイトプログラムの承認待ちのため、Amazon PA-APIを使用できない技術的な制約があります。承認完了次第、速やかに改修いたします。詳細な書籍情報のご確認および購入は、下記の「Amazonで購入」ボタンからお願いいたします。"""

# 検索用パターン
OLD_MESSAGE_START = "【書籍情報について】"

def remove_line_breaks():
    """
    説明文から改行を削除
    """
    db = SessionLocal()
    
    try:
        logger.info("=" * 80)
        logger.info("説明文から改行を削除")
        logger.info("=" * 80)
        logger.info("")
        
        # 【書籍情報について】で始まる説明文を持つ書籍を検索
        books_to_update = db.query(Book).filter(
            Book.description.like(f'{OLD_MESSAGE_START}%')
        ).all()
        
        logger.info(f"対象書籍数: {len(books_to_update):,}冊")
        logger.info("")
        
        updated_count = 0
        
        for book in books_to_update:
            book.description = COMPACT_MESSAGE
            updated_count += 1
        
        db.commit()
        
        logger.info("=" * 80)
        logger.info("✓ 改行削除完了")
        logger.info("=" * 80)
        logger.info(f"更新した書籍: {updated_count:,}冊")
        logger.info("")
        logger.info("改行削除後の説明文:")
        logger.info("-" * 80)
        logger.info(COMPACT_MESSAGE)
        logger.info("-" * 80)
        
    finally:
        db.close()

if __name__ == "__main__":
    remove_line_breaks()

