"""
Pythonを使ってデータベースのバックアップを取得するスクリプト
"""
import sys
from pathlib import Path
from datetime import datetime
import json
import gzip

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.book import Book, BookQiitaMention, BookYouTubeLink
from app.models.qiita_article import QiitaArticle
import logging

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def backup_to_json(backup_dir: str):
    """
    データベースのバックアップをJSON形式で取得
    """
    try:
        # バックアップディレクトリを作成
        backup_path = Path(backup_dir)
        backup_path.mkdir(parents=True, exist_ok=True)
        
        # タイムスタンプ付きのバックアップファイル名
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = backup_path / f"booktube_backup_{timestamp}.json"
        
        logger.info("=" * 80)
        logger.info("データベースバックアップ開始")
        logger.info("=" * 80)
        logger.info(f"バックアップ先: {backup_file}")
        logger.info("")
        
        db = SessionLocal()
        
        try:
            # 統計情報を表示
            total_books = db.query(Book).count()
            total_articles = db.query(QiitaArticle).count()
            total_mentions = db.query(BookQiitaMention).count()
            total_youtube = db.query(BookYouTubeLink).count()
            
            logger.info("バックアップ対象データ:")
            logger.info(f"  総書籍数: {total_books:,}冊")
            logger.info(f"  総記事数: {total_articles:,}件")
            logger.info(f"  総メンション数: {total_mentions:,}件")
            logger.info(f"  総YouTube動画: {total_youtube:,}件")
            logger.info("")
            
            # データを収集
            backup_data = {
                'metadata': {
                    'backup_timestamp': timestamp,
                    'total_books': total_books,
                    'total_articles': total_articles,
                    'total_mentions': total_mentions,
                    'total_youtube': total_youtube
                },
                'books': [],
                'articles': [],
                'mentions': [],
                'youtube_links': []
            }
            
            # 書籍データを取得
            logger.info("書籍データを取得中...")
            books = db.query(Book).order_by(Book.id).all()
            for book in books:
                backup_data['books'].append(book.to_dict())
            logger.info(f"  ✓ {len(backup_data['books']):,}冊の書籍データを取得")
            
            # 記事データを取得
            logger.info("記事データを取得中...")
            articles = db.query(QiitaArticle).order_by(QiitaArticle.id).all()
            for article in articles:
                backup_data['articles'].append(article.to_dict())
            logger.info(f"  ✓ {len(backup_data['articles']):,}件の記事データを取得")
            
            # メンションデータを取得
            logger.info("メンションデータを取得中...")
            mentions = db.query(BookQiitaMention).order_by(BookQiitaMention.id).all()
            for mention in mentions:
                mention_dict = {
                    'id': mention.id,
                    'book_id': mention.book_id,
                    'article_id': mention.article_id,
                    'extracted_identifier': mention.extracted_identifier,
                    'mentioned_at': mention.mentioned_at.isoformat() if mention.mentioned_at else None,
                }
                backup_data['mentions'].append(mention_dict)
            logger.info(f"  ✓ {len(backup_data['mentions']):,}件のメンションデータを取得")
            
            # YouTube動画リンクを取得
            logger.info("YouTube動画リンクを取得中...")
            youtube_links = db.query(BookYouTubeLink).order_by(BookYouTubeLink.id).all()
            for link in youtube_links:
                link_dict = {
                    'id': link.id,
                    'book_id': link.book_id,
                    'youtube_video_id': link.youtube_video_id,
                }
                backup_data['youtube_links'].append(link_dict)
            logger.info(f"  ✓ {len(backup_data['youtube_links']):,}件のYouTube動画リンクを取得")
            logger.info("")
            
            # JSONファイルに書き込み
            logger.info("バックアップファイルを書き込み中...")
            with open(backup_file, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)
            
            file_size = backup_file.stat().st_size
            size_mb = file_size / (1024 * 1024)
            
            logger.info(f"  ✓ バックアップファイルを作成: {size_mb:.2f} MB")
            logger.info("")
            
            # 圧縮バックアップも作成
            logger.info("圧縮バックアップを作成中...")
            compressed_file = backup_path / f"booktube_backup_{timestamp}.json.gz"
            with open(backup_file, 'rb') as f_in:
                with gzip.open(compressed_file, 'wb') as f_out:
                    f_out.write(f_in.read())
            
            compressed_size = compressed_file.stat().st_size
            compressed_mb = compressed_size / (1024 * 1024)
            compression_ratio = (1 - compressed_size / file_size) * 100
            
            logger.info("=" * 80)
            logger.info("✓ バックアップ完了")
            logger.info("=" * 80)
            logger.info(f"バックアップファイル: {backup_file}")
            logger.info(f"ファイルサイズ: {size_mb:.2f} MB")
            logger.info("")
            logger.info(f"圧縮ファイル: {compressed_file}")
            logger.info(f"圧縮後サイズ: {compressed_mb:.2f} MB")
            logger.info(f"圧縮率: {compression_ratio:.1f}%")
            logger.info("")
            logger.info(f"バックアップが {backup_dir} に保存されました。")
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"バックアップ中にエラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='データベースのバックアップをJSON形式で取得')
    parser.add_argument(
        '--backup-dir',
        type=str,
        default=r'C:\booktube\backup',
        help='バックアップディレクトリ (デフォルト: C:\\booktube\\backup)'
    )
    
    args = parser.parse_args()
    
    backup_to_json(args.backup_dir)

