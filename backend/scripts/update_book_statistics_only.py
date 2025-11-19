#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
書籍の統計情報のみを更新するスクリプト
（first_mentioned_at, latest_mention_at, total_mentions）
"""

import sys
import os
from pathlib import Path

# プロジェクトのルートディレクトリをPythonパスに追加
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
import argparse
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from app.database import SessionLocal
from app.models.book import Book, BookQiitaMention

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


def update_book_statistics(db: Session, book_ids: list = None):
    """
    書籍の統計情報を更新
    
    Args:
        db: データベースセッション
        book_ids: 更新対象の書籍IDリスト（Noneの場合は全書籍を更新）
    """
    if book_ids:
        # 指定された書籍IDのみを更新
        books = db.query(Book).filter(Book.id.in_(book_ids)).all()
        logger.info(f"統計情報更新開始: {len(books)}件の書籍を処理します")
    else:
        # 全書籍を更新
        books = db.query(Book).all()
        logger.info(f"統計情報更新開始: 全{len(books)}件の書籍を処理します")
    
    batch_size = 100  # 100件ずつ処理してコミット
    processed = 0
    
    for i in range(0, len(books), batch_size):
        batch = books[i:i + batch_size]
        try:
            for book in batch:
                try:
                    # total_mentionsを更新（1から始まる）
                    mention_count = db.query(BookQiitaMention).filter(
                        BookQiitaMention.book_id == book.id
                    ).count()
                    
                    # mentionがある場合は1から始まる値、ない場合は0
                    book.total_mentions = mention_count if mention_count > 0 else 0
                    
                    # latest_mention_atとfirst_mentioned_atを更新
                    mentions = db.query(BookQiitaMention).filter(
                        BookQiitaMention.book_id == book.id
                    ).order_by(BookQiitaMention.mentioned_at.asc()).all()
                    
                    if mentions:
                        # 最も古い言及日時
                        book.first_mentioned_at = mentions[0].mentioned_at
                        # 最も新しい言及日時
                        book.latest_mention_at = mentions[-1].mentioned_at
                    else:
                        # mentionがない場合はNULL
                        book.first_mentioned_at = None
                        book.latest_mention_at = None
                except Exception as e:
                    logger.warning(f"書籍ID {book.id} の統計情報更新でエラー: {e}")
                    continue
            
            # バッチごとにコミット
            db.commit()
            processed += len(batch)
            
            if processed % 1000 == 0:
                logger.info(f"統計情報更新進捗: {processed}/{len(books)}件処理完了")
                
        except OperationalError as e:
            logger.error(f"データベース接続エラー: {e}")
            logger.info("再接続を試みます...")
            try:
                db.rollback()
            except:
                pass
            try:
                db.close()
            except:
                pass
            # 新しいセッションを作成
            db = SessionLocal()
            # 再接続後、書籍を再取得して同じバッチから再開
            if book_ids:
                books = db.query(Book).filter(Book.id.in_(book_ids)).all()
            else:
                books = db.query(Book).all()
            # 同じバッチを再処理
            batch = books[i:i + batch_size]
            continue
        except Exception as e:
            logger.error(f"統計情報更新でエラー: {e}")
            db.rollback()
            continue
    
    logger.info(f"[OK] 書籍統計情報を更新完了: {processed}件処理")


def main():
    """メイン処理"""
    parser = argparse.ArgumentParser(description='書籍の統計情報のみを更新')
    parser.add_argument(
        '--book-ids',
        nargs='+',
        type=int,
        default=None,
        help='更新対象の書籍IDリスト（指定なしの場合は全書籍を更新）'
    )
    
    args = parser.parse_args()
    
    db = SessionLocal()
    
    try:
        update_book_statistics(db, book_ids=args.book_ids)
    except Exception as e:
        logger.error(f"[ERROR] エラー: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == '__main__':
    main()

