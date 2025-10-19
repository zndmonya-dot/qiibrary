"""
2020年以降のデータを削除するスクリプト
"""
import sys
from pathlib import Path
from datetime import datetime

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.book import Book, BookQiitaMention, BookYouTubeLink
from app.models.qiita_article import QiitaArticle
from sqlalchemy import text
import logging

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def delete_2020_data():
    """2020年以降のデータを削除"""
    db = SessionLocal()
    
    try:
        cutoff_date = datetime(2020, 1, 1)
        
        logger.info("=" * 80)
        logger.info("2020年以降のデータ削除を開始")
        logger.info("=" * 80)
        
        # 1. 削除前の統計情報
        total_books = db.query(Book).count()
        total_articles = db.query(QiitaArticle).count()
        total_mentions = db.query(BookQiitaMention).count()
        
        books_2020 = db.query(Book).filter(Book.first_mentioned_at >= cutoff_date).count()
        articles_2020 = db.query(QiitaArticle).filter(QiitaArticle.published_at >= cutoff_date).count()
        
        logger.info(f"現在の統計:")
        logger.info(f"  総書籍数: {total_books}冊")
        logger.info(f"  総記事数: {total_articles}件")
        logger.info(f"  総メンション数: {total_mentions}件")
        logger.info("")
        logger.info(f"2020年以降:")
        logger.info(f"  書籍数: {books_2020}冊")
        logger.info(f"  記事数: {articles_2020}件")
        
        # 2. 2020年以降の記事を取得
        articles_to_delete = db.query(QiitaArticle).filter(
            QiitaArticle.published_at >= cutoff_date
        ).all()
        
        article_ids_to_delete = [a.id for a in articles_to_delete]
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("削除処理開始")
        logger.info("=" * 80)
        
        # 3. book_qiita_mentions の削除（2020年以降の記事に関連するもの）
        if article_ids_to_delete:
            mentions_deleted = db.query(BookQiitaMention).filter(
                BookQiitaMention.article_id.in_(article_ids_to_delete)
            ).delete(synchronize_session=False)
            logger.info(f"✓ book_qiita_mentions: {mentions_deleted}件削除")
        
        # 4. qiita_articles の削除
        if article_ids_to_delete:
            articles_deleted = db.query(QiitaArticle).filter(
                QiitaArticle.id.in_(article_ids_to_delete)
            ).delete(synchronize_session=False)
            logger.info(f"✓ qiita_articles: {articles_deleted}件削除")
        
        # 5. 書籍の削除（first_mentioned_at が2020年以降のもの）
        # ただし、2019年以前にも言及されている書籍は残す
        books_to_check = db.query(Book).filter(
            Book.first_mentioned_at >= cutoff_date
        ).all()
        
        books_deleted_count = 0
        for book in books_to_check:
            # この書籍に関連する2019年以前のメンションがあるか確認
            older_mentions = db.query(BookQiitaMention).join(QiitaArticle).filter(
                BookQiitaMention.book_id == book.id,
                QiitaArticle.published_at < cutoff_date
            ).count()
            
            if older_mentions == 0:
                # 2019年以前のメンションがない場合のみ削除
                # まず、YouTube リンクを削除
                db.query(BookYouTubeLink).filter(BookYouTubeLink.book_id == book.id).delete()
                # 書籍を削除
                db.delete(book)
                books_deleted_count += 1
            else:
                # 2019年以前にも言及されている場合は、first_mentioned_at と latest_mention_at を更新
                oldest_mention = db.query(QiitaArticle).join(BookQiitaMention).filter(
                    BookQiitaMention.book_id == book.id
                ).order_by(QiitaArticle.published_at.asc()).first()
                
                latest_mention = db.query(QiitaArticle).join(BookQiitaMention).filter(
                    BookQiitaMention.book_id == book.id
                ).order_by(QiitaArticle.published_at.desc()).first()
                
                if oldest_mention:
                    book.first_mentioned_at = oldest_mention.published_at
                if latest_mention:
                    book.latest_mention_at = latest_mention.published_at
        
        logger.info(f"✓ books: {books_deleted_count}冊削除")
        
        # 6. コミット
        db.commit()
        
        # 7. 削除後の統計情報
        logger.info("")
        logger.info("=" * 80)
        logger.info("削除完了")
        logger.info("=" * 80)
        
        remaining_books = db.query(Book).count()
        remaining_articles = db.query(QiitaArticle).count()
        remaining_mentions = db.query(BookQiitaMention).count()
        
        logger.info(f"削除後の統計:")
        logger.info(f"  総書籍数: {remaining_books}冊")
        logger.info(f"  総記事数: {remaining_articles}件")
        logger.info(f"  総メンション数: {remaining_mentions}件")
        logger.info("")
        logger.info(f"削除された数:")
        logger.info(f"  書籍: {total_books - remaining_books}冊")
        logger.info(f"  記事: {total_articles - remaining_articles}件")
        logger.info(f"  メンション: {total_mentions - remaining_mentions}件")
        
    except Exception as e:
        db.rollback()
        logger.error(f"エラーが発生しました: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    delete_2020_data()

