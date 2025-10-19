"""
指定された期間を2週間単位で自動的にデータ収集するスクリプト
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta
import subprocess

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import logging

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def collect_batch(start_year, start_month, end_year, end_month):
    """
    指定された期間を2週間単位で自動収集
    """
    current_date = datetime(start_year, start_month, 1)
    end_date = datetime(end_year, end_month, 1)
    
    batch_count = 0
    total_books = 0
    
    logger.info("=" * 80)
    logger.info(f"バッチ収集開始: {start_year}/{start_month} ～ {end_year}/{end_month}")
    logger.info("=" * 80)
    
    while current_date <= end_date:
        year = current_date.year
        month = current_date.month
        
        # 月の最終日を取得
        if month == 12:
            next_month = datetime(year + 1, 1, 1)
        else:
            next_month = datetime(year, month + 1, 1)
        last_day = (next_month - timedelta(days=1)).day
        
        # 前半: 1日～15日
        start_1 = f"{year:04d}-{month:02d}-01"
        end_1 = f"{year:04d}-{month:02d}-15"
        
        # 後半: 16日～月末
        start_2 = f"{year:04d}-{month:02d}-16"
        end_2 = f"{year:04d}-{month:02d}-{last_day:02d}"
        
        # 前半を実行
        batch_count += 1
        logger.info("")
        logger.info("=" * 80)
        logger.info(f"バッチ #{batch_count}: {start_1} ～ {end_1}")
        logger.info("=" * 80)
        
        try:
            result = subprocess.run(
                [sys.executable, "-m", "scripts.collect_books_by_date_range", 
                 "--start", start_1, "--end", end_1],
                cwd=backend_dir,
                capture_output=False,
                text=True,
                check=True
            )
            logger.info(f"✓ バッチ #{batch_count} 完了")
        except subprocess.CalledProcessError as e:
            logger.error(f"✗ バッチ #{batch_count} エラー: {e}")
            logger.info("処理を続行します...")
        
        # 後半を実行
        batch_count += 1
        logger.info("")
        logger.info("=" * 80)
        logger.info(f"バッチ #{batch_count}: {start_2} ～ {end_2}")
        logger.info("=" * 80)
        
        try:
            result = subprocess.run(
                [sys.executable, "-m", "scripts.collect_books_by_date_range", 
                 "--start", start_2, "--end", end_2],
                cwd=backend_dir,
                capture_output=False,
                text=True,
                check=True
            )
            logger.info(f"✓ バッチ #{batch_count} 完了")
        except subprocess.CalledProcessError as e:
            logger.error(f"✗ バッチ #{batch_count} エラー: {e}")
            logger.info("処理を続行します...")
        
        # 次の月へ
        if month == 12:
            current_date = datetime(year + 1, 1, 1)
        else:
            current_date = datetime(year, month + 1, 1)
    
    logger.info("")
    logger.info("=" * 80)
    logger.info("全バッチ処理完了")
    logger.info("=" * 80)
    logger.info(f"総バッチ数: {batch_count}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='指定期間のQiita記事を2週間単位で収集')
    parser.add_argument('--start-year', type=int, required=True, help='開始年')
    parser.add_argument('--start-month', type=int, required=True, help='開始月')
    parser.add_argument('--end-year', type=int, required=True, help='終了年')
    parser.add_argument('--end-month', type=int, required=True, help='終了月')
    
    args = parser.parse_args()
    
    collect_batch(args.start_year, args.start_month, args.end_year, args.end_month)

