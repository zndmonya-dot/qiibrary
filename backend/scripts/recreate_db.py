#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
データベースを完全に再作成するスクリプト

使用方法:
    python -m scripts.recreate_db
"""
import sys
from pathlib import Path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
from app.database import engine, Base
# 全てのモデルをインポート（テーブル作成に必要）
from app.models.book import Book, BookQiitaMention, BookYouTubeLink
from app.models.qiita_article import QiitaArticle

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def recreate_database():
    """データベースを再作成する"""
    logger.info("================================================================================")
    logger.info("データベース再作成開始")
    logger.info("================================================================================")
    
    # 全てのテーブルを削除
    logger.info("既存のテーブルを削除中...")
    Base.metadata.drop_all(bind=engine)
    logger.info("✓ テーブル削除完了")
    
    # 全てのテーブルを作成
    logger.info("新しいテーブルを作成中...")
    Base.metadata.create_all(bind=engine)
    logger.info("✓ テーブル作成完了")
    
    logger.info("================================================================================")
    logger.info("データベース再作成完了！")
    logger.info("================================================================================")
    logger.info("次のステップ: データ収集スクリプトを実行してください")
    logger.info("  例: python -m scripts.collect_books_by_date_range --start 2025-01-01 --end 2025-01-31")
    logger.info("================================================================================")

if __name__ == "__main__":
    recreate_database()

