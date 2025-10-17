"""
データベースの内容を確認するスクリプト
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from app.config import settings

engine = create_engine(settings.DATABASE_URL)

print("\n" + "="*60)
print("📊 データベース内容確認")
print("="*60 + "\n")

with engine.connect() as conn:
    # 書籍数
    result = conn.execute(text("SELECT COUNT(*) FROM books"))
    book_count = result.scalar()
    print(f"📚 書籍数: {book_count}件\n")
    
    # 書籍一覧
    if book_count > 0:
        print("=== 保存された書籍 ===\n")
        result = conn.execute(text(
            "SELECT id, asin, title, total_views, total_mentions, locale "
            "FROM books ORDER BY total_views DESC"
        ))
        for row in result:
            print(f"ID: {row[0]}")
            print(f"ASIN: {row[1]}")
            print(f"タイトル: {row[2]}")
            print(f"再生数: {row[3]:,}")
            print(f"動画数: {row[4]}")
            print(f"ロケール: {row[5]}")
            print("-" * 60)
    
    # YouTube動画数
    result = conn.execute(text("SELECT COUNT(*) FROM youtube_videos"))
    video_count = result.scalar()
    print(f"\n🎥 YouTube動画数: {video_count}件\n")
    
    # YouTube動画一覧
    if video_count > 0:
        print("=== 保存された動画 ===\n")
        result = conn.execute(text(
            "SELECT id, video_id, title, channel_name, view_count, like_count "
            "FROM youtube_videos ORDER BY view_count DESC LIMIT 5"
        ))
        for row in result:
            print(f"動画ID: {row[1]}")
            print(f"タイトル: {row[2][:60]}...")
            print(f"チャンネル: {row[3]}")
            print(f"再生数: {row[4]:,}")
            print(f"いいね数: {row[5]:,}")
            print("-" * 60)
    
    # 関連付け数
    result = conn.execute(text("SELECT COUNT(*) FROM book_mentions"))
    mention_count = result.scalar()
    print(f"\n🔗 書籍-動画関連付け: {mention_count}件")
    
    # 統計データ数
    result = conn.execute(text("SELECT COUNT(*) FROM book_daily_stats"))
    stats_count = result.scalar()
    print(f"📈 統計データ: {stats_count}件\n")

print("="*60)
print("✅ データベース確認完了")
print("="*60 + "\n")

