"""
Zenn APIから書籍とトレンド記事を取得してデータベースに保存するスクリプト

使用方法:
    python scripts/setup_and_collect_zenn.py
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session

# Add the backend directory to sys.path
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, engine
from app.models.book import Base, Book, BookDailyStat
from app.services.zenn_service import get_zenn_service


class ZennDataCollector:
    """Zenn APIからデータを収集してDBに保存"""
    
    def __init__(self, db: Session):
        self.db = db
        self.zenn_service = get_zenn_service()
    
    def collect_books(self, max_books: int = 50):
        """
        Zenn Booksを取得してDBに保存
        
        Args:
            max_books: 最大取得件数
        """
        print(f"\n{'='*60}")
        print(f"📚 Zenn Booksを取得中...")
        print(f"{'='*60}\n")
        
        # Zenn Books APIから書籍を取得（liked順）
        books_data = self.zenn_service.get_books(
            order='liked',  # いいね順
            max_results=max_books
        )
        
        if not books_data:
            print("\n⚠️ 書籍が取得できませんでした")
            return
        
        print(f"\n✅ {len(books_data)} 冊の書籍を取得しました")
        print(f"\n💾 データベースに保存中...\n")
        
        saved_count = 0
        updated_count = 0
        
        for i, book_data in enumerate(books_data):
            print(f"[{i+1}/{len(books_data)}] 📖 {book_data['title']}")
            
            try:
                # 既存の書籍を確認
                book = self.db.query(Book).filter_by(
                    asin=book_data['asin']
                ).first()
                
                if book:
                    # 更新
                    book.title = book_data['title']
                    book.author = book_data.get('author')
                    book.publisher = book_data.get('publisher')
                    book.publication_date = book_data.get('publication_date')
                    book.price = book_data.get('price')
                    book.image_url = book_data.get('image_url')
                    book.affiliate_url = book_data.get('affiliate_url')
                    book.locale = book_data['locale']
                    updated_count += 1
                    print(f"  ✓ 更新しました\n")
                else:
                    # 新規作成
                    book = Book(
                        asin=book_data['asin'],
                        title=book_data['title'],
                        author=book_data.get('author'),
                        publisher=book_data.get('publisher'),
                        publication_date=book_data.get('publication_date'),
                        price=book_data.get('price'),
                        sale_price=book_data.get('sale_price'),
                        discount_rate=book_data.get('discount_rate'),
                        image_url=book_data.get('image_url'),
                        description=book_data.get('description'),
                        amazon_url=book_data.get('amazon_url'),
                        affiliate_url=book_data.get('affiliate_url'),
                        rating=book_data.get('rating'),
                        review_count=book_data.get('review_count'),
                        locale=book_data['locale'],
                        total_views=0,
                        total_mentions=book_data.get('liked_count', 0),  # いいね数をメンション数として使用
                    )
                    self.db.add(book)
                    saved_count += 1
                    print(f"  ✓ 新規保存しました\n")
                
                self.db.flush()
                
            except Exception as e:
                print(f"  ❌ エラー: {e}\n")
                self.db.rollback()
                continue
        
        try:
            self.db.commit()
            print(f"\n{'='*60}")
            print(f"✅ 書籍保存完了")
            print(f"  • 新規保存: {saved_count} 冊")
            print(f"  • 更新: {updated_count} 冊")
            print(f"{'='*60}\n")
        except Exception as e:
            print(f"\n❌ コミットエラー: {e}")
            self.db.rollback()
            raise
    
    def collect_trending_articles_as_books(self, max_articles: int = 50):
        """
        Zennのトレンド記事から技術書関連の記事を取得してDBに保存
        
        技術書の書評・レビュー記事などを書籍として扱う
        
        Args:
            max_articles: 最大取得件数
        """
        print(f"\n{'='*60}")
        print(f"📰 Zennトレンド記事を取得中...")
        print(f"{'='*60}\n")
        
        # トレンド記事を取得（日次ランキング）
        articles_data = self.zenn_service.get_trending_articles(
            order='daily',
            max_results=max_articles,
            article_type='tech'
        )
        
        if not articles_data:
            print("\n⚠️ 記事が取得できませんでした")
            return
        
        print(f"\n✅ {len(articles_data)} 件の記事を取得しました")
        
        # 技術書関連のキーワードでフィルタリング
        book_keywords = [
            '書籍', '本', 'Book', 'book', '読書',
            '書評', 'レビュー', 'review', 'Review',
            'おすすめ', '技術書', '参考書'
        ]
        
        book_related_articles = []
        for article in articles_data:
            title = article['title']
            if any(keyword in title for keyword in book_keywords):
                book_related_articles.append(article)
        
        print(f"\n📚 技術書関連の記事: {len(book_related_articles)} 件")
        
        if not book_related_articles:
            print("  ⚠️ 技術書関連の記事が見つかりませんでした\n")
            return
        
        print(f"\n💾 データベースに保存中...\n")
        
        saved_count = 0
        updated_count = 0
        
        for i, article_data in enumerate(book_related_articles):
            print(f"[{i+1}/{len(book_related_articles)}] 📰 {article_data['title']}")
            
            try:
                # 記事IDをASINとして使用
                article_asin = article_data['article_id']
                
                # 既存の書籍（記事）を確認
                book = self.db.query(Book).filter_by(
                    asin=article_asin
                ).first()
                
                if book:
                    # 更新
                    book.title = article_data['title']
                    book.author = article_data.get('author')
                    book.publisher = 'Zenn Article'
                    book.publication_date = article_data.get('published_at')
                    book.total_mentions = article_data.get('liked_count', 0)
                    updated_count += 1
                    print(f"  ✓ 更新しました\n")
                else:
                    # 新規作成（記事を書籍として保存）
                    book = Book(
                        asin=article_asin,
                        title=article_data['title'],
                        author=article_data.get('author'),
                        publisher='Zenn Article',
                        publication_date=article_data.get('published_at'),
                        price=0,  # 記事は無料
                        image_url=None,
                        description=None,
                        amazon_url=None,
                        affiliate_url=article_data.get('article_url'),
                        rating=None,
                        review_count=None,
                        locale=article_data['locale'],
                        total_views=0,
                        total_mentions=article_data.get('liked_count', 0),
                    )
                    self.db.add(book)
                    saved_count += 1
                    print(f"  ✓ 新規保存しました\n")
                
                self.db.flush()
                
            except Exception as e:
                print(f"  ❌ エラー: {e}\n")
                self.db.rollback()
                continue
        
        try:
            self.db.commit()
            print(f"\n{'='*60}")
            print(f"✅ 記事保存完了")
            print(f"  • 新規保存: {saved_count} 件")
            print(f"  • 更新: {updated_count} 件")
            print(f"{'='*60}\n")
        except Exception as e:
            print(f"\n❌ コミットエラー: {e}")
            self.db.rollback()
            raise
    
    def generate_stats(self):
        """統計データを生成"""
        print(f"\n{'='*60}")
        print(f"📊 統計データを生成中...")
        print(f"{'='*60}\n")
        
        today = date.today()
        books = self.db.query(Book).all()
        stats_count = 0
        
        for book in books:
            # 過去30日分のダミー統計データを生成
            for days_ago in range(30):
                stat_date = today - timedelta(days=days_ago)
                
                # 既存の統計データをチェック
                existing_stat = self.db.query(BookDailyStat).filter_by(
                    book_id=book.id,
                    date=stat_date
                ).first()
                
                if existing_stat:
                    continue
                
                # ダミーの統計データ
                stat = BookDailyStat(
                    book_id=book.id,
                    date=stat_date,
                    daily_views=max(1, book.total_views // 30),
                    daily_mentions=max(1, book.total_mentions // 30),
                )
                self.db.add(stat)
                stats_count += 1
        
        try:
            self.db.commit()
            print(f"\n✅ {stats_count} 件の統計データを生成\n")
        except Exception as e:
            print(f"\n❌ コミットエラー: {e}")
            self.db.rollback()
            raise


def main():
    print("\n" + "="*60)
    print("Zenn データ収集スクリプト")
    print("="*60 + "\n")
    
    # データベーステーブルを作成
    print("📋 データベーステーブルを作成中...")
    Base.metadata.create_all(bind=engine)
    print("✅ テーブル作成完了\n")
    
    # データベースセッションを作成
    db = SessionLocal()
    
    try:
        collector = ZennDataCollector(db)
        
        # 1. Zenn Booksを取得（上位50冊）
        collector.collect_books(max_books=50)
        
        # 2. Zennトレンド記事から技術書関連を取得（オプション）
        # collector.collect_trending_articles_as_books(max_articles=100)
        
        # 3. 統計データを生成
        collector.generate_stats()
        
        print("\n" + "="*60)
        print("🎉 すべての処理が完了しました！")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == '__main__':
    main()

