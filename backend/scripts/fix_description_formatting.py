"""
説明文のフォーマットを調整するスクリプト（見切れ対策）
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

# 改善された説明文（最初に空行を追加）
IMPROVED_MESSAGE = """
【書籍情報について】

現在、この書籍の詳細情報（タイトル、著者、サムネイル画像など）を表示することができません。

これは、Amazonアソシエイトプログラムの承認待ちのため、Amazon PA-APIを使用できない技術的な制約によるものです。

Amazonアソシエイトプログラムの承認が完了次第、速やかにシステムを改修し、書籍の詳細情報とサムネイル画像を表示できるようにいたします。

現在も、この書籍のAmazonページへのリンクは正常に機能しています。
詳細な書籍情報のご確認および購入は、下記の「Amazonで購入」ボタンからお願いいたします。

ご不便をおかけして申し訳ございませんが、何卒ご理解のほどよろしくお願いいたします。
"""

# 古いメッセージの開始部分（検索用）
OLD_MESSAGE_START = "【書籍情報について】"

def fix_description_formatting():
    """
    説明文のフォーマットを調整（最初に改行を追加）
    """
    db = SessionLocal()
    
    try:
        logger.info("=" * 80)
        logger.info("説明文のフォーマットを調整")
        logger.info("=" * 80)
        logger.info("")
        
        # 【書籍情報について】で始まる説明文を持つ書籍を検索
        books_with_message = db.query(Book).filter(
            Book.description.like(f'{OLD_MESSAGE_START}%')
        ).all()
        
        logger.info(f"対象書籍数: {len(books_with_message):,}冊")
        logger.info("")
        
        updated_count = 0
        
        for book in books_with_message:
            # 説明文を新しいフォーマットに更新
            book.description = IMPROVED_MESSAGE
            updated_count += 1
        
        db.commit()
        
        logger.info("=" * 80)
        logger.info("✓ フォーマット調整完了")
        logger.info("=" * 80)
        logger.info(f"更新した書籍: {updated_count:,}冊")
        logger.info("")
        logger.info("改善後の説明文:")
        logger.info("-" * 80)
        logger.info(IMPROVED_MESSAGE)
        logger.info("-" * 80)
        
    finally:
        db.close()

if __name__ == "__main__":
    fix_description_formatting()

