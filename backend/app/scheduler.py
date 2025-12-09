"""
毎日自動でQiitaデータを収集するスケジューラー
"""
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
from datetime import date, timedelta
import sys
from pathlib import Path
import os
import pytz

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from scripts.collect_books_from_qiita import run_data_collection
from app.database import SessionLocal
from app.services.ranking_service import RankingService
from app.models.book import Book

logger = logging.getLogger(__name__)

# 日本時間のタイムゾーン
JST = pytz.timezone('Asia/Tokyo')


def format_number(num: int) -> str:
    """数値をフォーマット（K、M単位）"""
    if num >= 1_000_000:
        return f"{num / 1_000_000:.1f}M"
    if num >= 1_000:
        return f"{num / 1_000:.1f}K"
    return str(num)


def job_listener(event):
    """
    ジョブの実行結果をログに出力するリスナー
    """
    if event.exception:
        logger.error(f"ジョブ {event.job_id} が失敗しました: {event.exception}")
    else:
        logger.info(f"ジョブ {event.job_id} が正常に完了しました")


def daily_data_update():
    """
    毎日実行されるデータ更新タスク
    全記事から最新の書籍情報を収集する（タグ制限なし）
    """
    try:
        logger.info("=" * 80)
        logger.info("定期データ更新開始")
        logger.info(f"実行時刻: {datetime.now(JST)}")
        logger.info("=" * 80)
        
        # 全記事から書籍情報を収集（タグ制限なし、最大5000件）
        # 既存の記事は重複チェックでスキップされるため、新規記事のみが追加される
        run_data_collection(tags=None, max_articles=5000)
        
        logger.info("=" * 80)
        logger.info("定期データ更新完了")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"定期データ更新エラー: {e}", exc_info=True)


def daily_tweet_generation():
    """
    毎日実行されるツイート文生成タスク
    24時間ランキング1位のツイート文をログに出力
    """
    db = SessionLocal()
    try:
        logger.info("=" * 80)
        logger.info("ツイート文生成開始")
        logger.info(f"実行時刻: {datetime.now(JST)}")
        logger.info("=" * 80)
        
        # 24時間ランキングを取得
        ranking_service = RankingService(db)
        rankings_result = ranking_service.get_ranking_fast(days=1, limit=1)
        
        # 返り値は{"rankings": [...], "total": ...}形式
        rankings_data = rankings_result.get('rankings', [])
        
        if not rankings_data or len(rankings_data) == 0:
            logger.warning("24時間以内のランキングデータがありません")
            return
        
        # 1位を取得
        top_item = rankings_data[0]
        book_id = top_item['book']['id']
        
        # 書籍の累計データを取得
        book = db.query(Book).filter(Book.id == book_id).first()
        if not book:
            logger.error("書籍データが見つかりません")
            return
        
        # 累計いいね数を計算
        from app.models.qiita_article import QiitaArticle
        from app.models.book import BookQiitaMention
        from sqlalchemy import func
        
        total_likes = db.query(
            func.sum(QiitaArticle.likes_count)
        ).join(
            BookQiitaMention,
            QiitaArticle.id == BookQiitaMention.article_id
        ).filter(
            BookQiitaMention.book_id == book.id
        ).scalar() or 0
        
        article_count = db.query(
            func.count(func.distinct(QiitaArticle.id))
        ).join(
            BookQiitaMention,
            QiitaArticle.id == BookQiitaMention.article_id
        ).filter(
            BookQiitaMention.book_id == book.id
        ).scalar() or 0
        
        # ツイート文を生成
        likes_display = format_number(total_likes)
        asin = book.isbn.replace('-', '') if book.isbn else ''
        book_url = f"https://qiibrary.com/books/{asin}" if asin else "https://qiibrary.com"
        
        tweet = f"""【Qiita技術書ランキング 本日の1位】

{book.title}

記事掲載数: {article_count}件
総評価数: {likes_display}

Qiitaで話題の技術書をランキング化

詳細: {book_url}
購入: {book.amazon_affiliate_url}

#技術書 #Qiita #Qiibrary"""
        
        # ログに出力
        logger.info("=" * 80)
        logger.info("本日のツイート文:")
        logger.info("=" * 80)
        logger.info(tweet)
        logger.info("=" * 80)
        logger.info(f"文字数: {len(tweet)} / 280")
        logger.info("=" * 80)
        logger.info("ツイート文生成完了")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"ツイート文生成エラー: {e}", exc_info=True)
    finally:
        db.close()


def start_scheduler():
    """
    スケジューラーを起動
    毎日深夜0時（日本時間）にデータ更新を実行
    """
    # 環境変数でスケジューラーを無効化できるようにする（開発時など）
    if os.getenv("DISABLE_SCHEDULER", "false").lower() == "true":
        logger.info("スケジューラーは無効化されています（DISABLE_SCHEDULER=true）")
        return None
    
    scheduler = BackgroundScheduler(timezone=JST)
    
    # ジョブの実行結果を監視するリスナーを追加
    scheduler.add_listener(job_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)
    
    # 毎日深夜0時（日本時間）にデータ更新を実行
    scheduler.add_job(
        daily_data_update,
        trigger=CronTrigger(hour=0, minute=0, timezone=JST),
        id='daily_update',
        name='毎日のQiitaデータ更新',
        replace_existing=True
    )
    
    # 毎日朝8時（日本時間）にツイート文生成を実行
    scheduler.add_job(
        daily_tweet_generation,
        trigger=CronTrigger(hour=8, minute=0, timezone=JST),
        id='daily_tweet',
        name='毎日のツイート文生成',
        replace_existing=True
    )
    
    scheduler.start()
    
    logger.info("=" * 80)
    logger.info("スケジューラー起動完了")
    logger.info(f"現在のサーバー時刻: {datetime.now(JST)}")
    logger.info("毎日 00:00 (JST) にデータ更新を実行します")
    logger.info("毎日 08:00 (JST) にツイート文生成を実行します")
    logger.info("=" * 80)
    
    return scheduler


def stop_scheduler(scheduler):
    """
    スケジューラーを停止
    """
    if scheduler:
        scheduler.shutdown()
        logger.info("スケジューラー停止")

