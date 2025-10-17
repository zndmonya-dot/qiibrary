"""
API動作テスト
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.services.ranking_service import RankingService

print("\n" + "="*60)
print("🧪 API動作テスト")
print("="*60 + "\n")

# データベース接続
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # 今日の日付を確認
    today = date.today()
    print(f"📅 今日の日付: {today}\n")
    
    # 統計データの日付範囲を確認
    from app.models.book import BookDailyStat
    from sqlalchemy import func
    
    date_range = db.query(
        func.min(BookDailyStat.date).label('min_date'),
        func.max(BookDailyStat.date).label('max_date'),
        func.count(BookDailyStat.id).label('count')
    ).first()
    
    print(f"📊 統計データ:")
    print(f"  最古: {date_range.min_date}")
    print(f"  最新: {date_range.max_date}")
    print(f"  件数: {date_range.count}件\n")
    
    # 今日のデータがあるか確認
    today_stats = db.query(BookDailyStat).filter(
        BookDailyStat.date == today
    ).count()
    print(f"🔍 今日のデータ: {today_stats}件\n")
    
    # ランキングサービスをテスト
    print("="*60)
    print("📈 ランキング取得テスト")
    print("="*60 + "\n")
    
    ranking_service = RankingService(db)
    
    # 今日のランキング
    print("1. 今日のランキング:")
    try:
        rankings = ranking_service.get_today_ranking(locale="ja", limit=10)
        print(f"   ✅ {len(rankings)}件取得")
        if rankings:
            print(f"   1位: {rankings[0]['book']['title']}")
    except Exception as e:
        print(f"   ❌ エラー: {e}")
        import traceback
        traceback.print_exc()
    
    print()
    
    # 過去30日のランキング
    print("2. 過去30日のランキング:")
    try:
        rankings = ranking_service.get_last30days_ranking(locale="ja", limit=10)
        print(f"   ✅ {len(rankings)}件取得")
        if rankings:
            print(f"   1位: {rankings[0]['book']['title']}")
    except Exception as e:
        print(f"   ❌ エラー: {e}")
        import traceback
        traceback.print_exc()
    
    print()

finally:
    db.close()

print("="*60)
print("✅ テスト完了")
print("="*60 + "\n")

