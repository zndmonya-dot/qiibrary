"""
データベースのエンコーディングを確認
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from app.config import settings

print("\n" + "="*60)
print("🔍 エンコーディング確認")
print("="*60 + "\n")

engine = create_engine(settings.DATABASE_URL)

with engine.connect() as conn:
    # データベースのエンコーディングを確認
    result = conn.execute(text(
        "SELECT current_database(), pg_encoding_to_char(encoding) as encoding "
        "FROM pg_database WHERE datname = current_database()"
    ))
    row = result.first()
    print(f"データベース: {row[0]}")
    print(f"エンコーディング: {row[1]}\n")
    
    # 各書籍のデータをチェック
    result = conn.execute(text("SELECT id, asin, title, description FROM books"))
    
    print("="*60)
    print("📚 書籍データ確認")
    print("="*60 + "\n")
    
    for row in result:
        book_id, asin, title, description = row
        print(f"ID: {book_id}, ASIN: {asin}")
        
        # タイトルのエンコーディングをチェック
        try:
            if title:
                title_bytes = title.encode('utf-8')
                print(f"  タイトル: {title} (OK - {len(title_bytes)} bytes)")
        except Exception as e:
            print(f"  ❌ タイトルエラー: {e}")
        
        # 説明文のエンコーディングをチェック
        try:
            if description:
                desc_bytes = description.encode('utf-8')
                print(f"  説明: {len(desc_bytes)} bytes (OK)")
        except Exception as e:
            print(f"  ❌ 説明エラー: {e}")
        
        print()

print("="*60)
print("✅ 確認完了")
print("="*60 + "\n")

