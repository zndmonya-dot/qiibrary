"""
毎日自動でQiitaデータを収集するスケジューラー
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import date, timedelta
import sys
from pathlib import Path
import os
import pytz

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from scripts.collect_books_by_date_range import collect_qiita_articles_by_date

logger = logging.getLogger(__name__)

# 日本時間のタイムゾーン
JST = pytz.timezone('Asia/Tokyo')


def daily_data_update():
    """
    毎日実行されるデータ更新タスク
    昨日のデータを収集する
    """
    try:
        logger.info("=" * 80)
        logger.info("🔄 定期データ更新開始")
        logger.info("=" * 80)
        
        # 昨日のデータを収集
        end_date = date.today() - timedelta(days=1)
        start_date = end_date
        
        logger.info(f"📅 収集期間: {start_date} 〜 {end_date}")
        
        # データ収集実行
        collect_qiita_articles_by_date(start_date, end_date)
        
        logger.info("=" * 80)
        logger.info("✅ 定期データ更新完了")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"❌ 定期データ更新エラー: {e}", exc_info=True)


def start_scheduler():
    """
    スケジューラーを起動
    毎日深夜3時（日本時間）にデータ更新を実行
    """
    # 環境変数でスケジューラーを無効化できるようにする（開発時など）
    if os.getenv("DISABLE_SCHEDULER", "false").lower() == "true":
        logger.info("⏸️  スケジューラーは無効化されています（DISABLE_SCHEDULER=true）")
        return None
    
    scheduler = BackgroundScheduler(timezone=JST)
    
    # 毎日深夜3時（日本時間）に実行
    scheduler.add_job(
        daily_data_update,
        trigger=CronTrigger(hour=3, minute=0, timezone=JST),
        id='daily_update',
        name='毎日のQiitaデータ更新',
        replace_existing=True
    )
    
    scheduler.start()
    
    logger.info("=" * 80)
    logger.info("🚀 スケジューラー起動完了")
    logger.info("⏰ 毎日 03:00 (JST) にデータ更新を実行します")
    logger.info("=" * 80)
    
    return scheduler


def stop_scheduler(scheduler):
    """
    スケジューラーを停止
    """
    if scheduler:
        scheduler.shutdown()
        logger.info("⏹️  スケジューラー停止")

