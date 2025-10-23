"""
手動で書籍情報を更新するスクリプト
Kindle版など、APIで情報が取得できない書籍用
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.book import Book
from datetime import date

def update_book_info(isbn: str, title: str, author: str = None, 
                     publisher: str = None, description: str = None,
                     thumbnail_url: str = None, publication_date: str = None):
    """
    書籍情報を手動で更新
    
    Args:
        isbn: ISBN/ASIN
        title: タイトル
        author: 著者
        publisher: 出版社
        description: 説明文
        thumbnail_url: サムネイルURL
        publication_date: 出版日 (YYYY-MM-DD形式)
    """
    db = SessionLocal()
    try:
        book = db.query(Book).filter(Book.isbn == isbn).first()
        
        if not book:
            print(f"❌ 書籍が見つかりません: {isbn}")
            return
        
        print(f"📚 現在の情報:")
        print(f"  タイトル: {book.title}")
        print(f"  著者: {book.author}")
        print(f"  出版社: {book.publisher}")
        print()
        
        # 更新
        if title:
            book.title = title
        if author:
            book.author = author
        if publisher:
            book.publisher = publisher
        if description:
            book.description = description
        if thumbnail_url:
            book.thumbnail_url = thumbnail_url
        if publication_date:
            try:
                book.publication_date = date.fromisoformat(publication_date)
            except ValueError:
                print(f"⚠️  日付形式が不正です: {publication_date}")
        
        db.commit()
        
        print(f"✅ 更新完了:")
        print(f"  タイトル: {book.title}")
        print(f"  著者: {book.author}")
        print(f"  出版社: {book.publisher}")
        if book.description:
            print(f"  説明: {book.description[:100]}...")
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    # 使用例
    print("=" * 80)
    print("📝 書籍情報の手動更新")
    print("=" * 80)
    print()
    
    # B0FX3JPB16 の例
    update_book_info(
        isbn="B0FX3JPB16",
        title="あなたの実際のタイトルをここに入力",  # ← 実際のタイトルに変更
        author="著者名",  # ← 実際の著者名に変更
        publisher="Amazon Kindle Direct Publishing",
        description="書籍の説明文をここに入力",
        publication_date="2025-01-15"  # ← 実際の出版日に変更
    )

