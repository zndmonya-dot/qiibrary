"""
YouTube動画詳細情報カラムを追加するマイグレーションスクリプト
"""
import sys
from pathlib import Path
from sqlalchemy import text, inspect

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal


def check_column_exists(db, table_name: str, column_name: str) -> bool:
    """カラムが存在するかチェック"""
    inspector = inspect(db.bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def migrate():
    """マイグレーションを実行"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("🔄 YouTube動画詳細情報カラム追加マイグレーション")
        print("=" * 80)
        
        # カラムの存在確認
        columns_to_add = {
            'channel_name': 'VARCHAR(255)',
            'view_count': 'INTEGER DEFAULT 0',
            'like_count': 'INTEGER DEFAULT 0',
            'published_at': 'TIMESTAMP'
        }
        
        existing_columns = []
        missing_columns = []
        
        for col_name, col_type in columns_to_add.items():
            if check_column_exists(db, 'book_youtube_links', col_name):
                existing_columns.append(col_name)
            else:
                missing_columns.append((col_name, col_type))
        
        if existing_columns:
            print(f"✅ 既に存在するカラム: {', '.join(existing_columns)}")
        
        if not missing_columns:
            print("✅ すべてのカラムが既に存在します。マイグレーション不要です。")
            return
        
        print(f"\n📋 追加するカラム: {len(missing_columns)}件")
        for col_name, col_type in missing_columns:
            print(f"  - {col_name} ({col_type})")
        
        # ユーザーに確認
        print("\n⚠️  これらのカラムを追加します。")
        response = input("実行しますか？ (yes/no): ")
        if response.lower() != 'yes':
            print("❌ キャンセルしました")
            return
        
        # カラムを追加
        for col_name, col_type in missing_columns:
            try:
                query = text(f"ALTER TABLE book_youtube_links ADD COLUMN IF NOT EXISTS {col_name} {col_type}")
                db.execute(query)
                print(f"✅ {col_name} を追加しました")
            except Exception as e:
                print(f"❌ {col_name} の追加に失敗: {e}")
        
        # インデックスを追加
        try:
            query = text("CREATE INDEX IF NOT EXISTS idx_youtube_links_view_count ON book_youtube_links(view_count DESC)")
            db.execute(query)
            print("✅ インデックス idx_youtube_links_view_count を追加しました")
        except Exception as e:
            print(f"⚠️  インデックスの追加に失敗: {e}")
        
        db.commit()
        
        print("\n" + "=" * 80)
        print("✅ マイグレーション完了！")
        print("=" * 80)
        
        # 確認
        print("\n📊 追加後のカラム一覧:")
        inspector = inspect(db.bind)
        columns = inspector.get_columns('book_youtube_links')
        for col in columns:
            print(f"  - {col['name']}: {col['type']}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()

