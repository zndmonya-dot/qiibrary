"""
PostgreSQLデータベース内にバックアップテーブルを作成するスクリプト
"""
import sys
from pathlib import Path
from datetime import datetime

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, engine
from sqlalchemy import text
import logging

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_backup_tables():
    """
    現在のテーブルのバックアップをデータベース内に作成
    """
    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        logger.info("=" * 80)
        logger.info("データベース内バックアップテーブル作成開始")
        logger.info("=" * 80)
        logger.info(f"タイムスタンプ: {timestamp}")
        logger.info("")
        
        db = SessionLocal()
        
        try:
            # バックアップテーブル名
            tables = {
                'books': f'books_backup_{timestamp}',
                'qiita_articles': f'qiita_articles_backup_{timestamp}',
                'book_qiita_mentions': f'book_qiita_mentions_backup_{timestamp}',
                'book_youtube_links': f'book_youtube_links_backup_{timestamp}',
            }
            
            # 統計情報を取得
            stats = {}
            for original_table in tables.keys():
                result = db.execute(text(f"SELECT COUNT(*) FROM {original_table}"))
                count = result.scalar()
                stats[original_table] = count
            
            logger.info("バックアップ対象データ:")
            logger.info(f"  books: {stats['books']:,}件")
            logger.info(f"  qiita_articles: {stats['qiita_articles']:,}件")
            logger.info(f"  book_qiita_mentions: {stats['book_qiita_mentions']:,}件")
            logger.info(f"  book_youtube_links: {stats['book_youtube_links']:,}件")
            logger.info("")
            
            # 各テーブルのバックアップを作成
            for original_table, backup_table in tables.items():
                logger.info(f"テーブル '{original_table}' をバックアップ中...")
                
                # テーブル構造とデータをコピー
                sql = f"""
                CREATE TABLE {backup_table} AS 
                SELECT * FROM {original_table};
                """
                
                db.execute(text(sql))
                db.commit()
                
                # コピーされた件数を確認
                result = db.execute(text(f"SELECT COUNT(*) FROM {backup_table}"))
                copied_count = result.scalar()
                
                logger.info(f"  ✓ '{backup_table}' を作成: {copied_count:,}件")
            
            logger.info("")
            logger.info("=" * 80)
            logger.info("✓ バックアップテーブル作成完了")
            logger.info("=" * 80)
            logger.info("")
            logger.info("作成されたバックアップテーブル:")
            for original_table, backup_table in tables.items():
                logger.info(f"  - {backup_table} ({stats[original_table]:,}件)")
            
            logger.info("")
            logger.info("バックアップテーブルの削除方法:")
            logger.info(f"  DROP TABLE IF EXISTS {tables['books']};")
            logger.info(f"  DROP TABLE IF EXISTS {tables['qiita_articles']};")
            logger.info(f"  DROP TABLE IF EXISTS {tables['book_qiita_mentions']};")
            logger.info(f"  DROP TABLE IF EXISTS {tables['book_youtube_links']};")
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"バックアップ中にエラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    create_backup_tables()

