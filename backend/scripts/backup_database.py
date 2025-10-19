"""
データベースのバックアップを取得するスクリプト
"""
import sys
from pathlib import Path
from datetime import datetime
import subprocess
import os

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
import logging

# .envファイルを読み込む
env_path = backend_dir / '.env'
load_dotenv(env_path)

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def backup_database(backup_dir: str):
    """
    PostgreSQLデータベースのバックアップを取得
    """
    try:
        # バックアップディレクトリを作成
        backup_path = Path(backup_dir)
        backup_path.mkdir(parents=True, exist_ok=True)
        
        # タイムスタンプ付きのバックアップファイル名
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = backup_path / f"booktube_backup_{timestamp}.sql"
        
        logger.info("=" * 80)
        logger.info("データベースバックアップ開始")
        logger.info("=" * 80)
        logger.info(f"バックアップ先: {backup_file}")
        
        # 環境変数から接続情報を取得
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_name = os.getenv('DB_NAME', 'booktube')
        db_user = os.getenv('DB_USER', 'postgres')
        db_password = os.getenv('DB_PASSWORD', '')
        
        # 統計情報を表示
        from app.database import SessionLocal
        from app.models.book import Book
        from app.models.qiita_article import QiitaArticle
        from app.models.book import BookQiitaMention
        
        db = SessionLocal()
        try:
            total_books = db.query(Book).count()
            total_articles = db.query(QiitaArticle).count()
            total_mentions = db.query(BookQiitaMention).count()
            
            logger.info("")
            logger.info("バックアップ対象データ:")
            logger.info(f"  総書籍数: {total_books:,}冊")
            logger.info(f"  総記事数: {total_articles:,}件")
            logger.info(f"  総メンション数: {total_mentions:,}件")
            logger.info("")
        finally:
            db.close()
        
        # pg_dumpコマンドを実行
        env = os.environ.copy()
        env['PGPASSWORD'] = db_password
        
        cmd = [
            'pg_dump',
            '-h', db_host,
            '-p', db_port,
            '-U', db_user,
            '-d', db_name,
            '-F', 'p',  # プレーンテキスト形式
            '-f', str(backup_file),
            '--verbose'
        ]
        
        logger.info("pg_dumpを実行中...")
        result = subprocess.run(
            cmd,
            env=env,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        
        if result.returncode == 0:
            # ファイルサイズを取得
            file_size = backup_file.stat().st_size
            size_mb = file_size / (1024 * 1024)
            
            logger.info("=" * 80)
            logger.info("✓ バックアップ完了")
            logger.info("=" * 80)
            logger.info(f"バックアップファイル: {backup_file}")
            logger.info(f"ファイルサイズ: {size_mb:.2f} MB")
            logger.info("")
            
            # 圧縮バックアップも作成
            logger.info("圧縮バックアップを作成中...")
            import gzip
            import shutil
            
            compressed_file = backup_path / f"booktube_backup_{timestamp}.sql.gz"
            with open(backup_file, 'rb') as f_in:
                with gzip.open(compressed_file, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            
            compressed_size = compressed_file.stat().st_size
            compressed_mb = compressed_size / (1024 * 1024)
            compression_ratio = (1 - compressed_size / file_size) * 100
            
            logger.info("✓ 圧縮完了")
            logger.info(f"圧縮ファイル: {compressed_file}")
            logger.info(f"圧縮後サイズ: {compressed_mb:.2f} MB")
            logger.info(f"圧縮率: {compression_ratio:.1f}%")
            logger.info("")
            logger.info(f"バックアップが {backup_dir} に保存されました。")
            
        else:
            logger.error("=" * 80)
            logger.error("✗ バックアップ失敗")
            logger.error("=" * 80)
            logger.error(f"エラー: {result.stderr}")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"バックアップ中にエラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='データベースのバックアップを取得')
    parser.add_argument(
        '--backup-dir',
        type=str,
        default=r'C:\booktube\backup',
        help='バックアップディレクトリ (デフォルト: C:\\booktube\\backup)'
    )
    
    args = parser.parse_args()
    
    backup_database(args.backup_dir)

