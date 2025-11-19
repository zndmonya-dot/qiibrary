"""
スケジューラーの起動テスト
実際に起動して、正常に設定されているか確認
"""
import sys
from pathlib import Path
import logging

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.scheduler import start_scheduler, stop_scheduler

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

print("=" * 80)
print("🧪 スケジューラー起動テスト")
print("=" * 80)

try:
    # スケジューラーを起動
    scheduler = start_scheduler()
    
    if scheduler:
        print("\n📊 登録されているジョブ:")
        jobs = scheduler.get_jobs()
        
        for job in jobs:
            print(f"\n  ジョブID: {job.id}")
            print(f"  名前: {job.name}")
            print(f"  次回実行: {job.next_run_time}")
            print(f"  トリガー: {job.trigger}")
        
        print("\n" + "=" * 80)
        print(f"✅ スケジューラーテスト成功！")
        print(f"登録ジョブ数: {len(jobs)}")
        print("=" * 80)
        
        # スケジューラーを停止
        print("\nスケジューラーを停止します...")
        stop_scheduler(scheduler)
        print("✅ 停止完了")
    else:
        print("\n⚠️  スケジューラーは無効化されています")
        print("環境変数 DISABLE_SCHEDULER を確認してください")
        
except Exception as e:
    print(f"\n❌ エラー: {e}")
    import traceback
    traceback.print_exc()

