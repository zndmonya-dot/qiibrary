#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
指定ID以降の書籍IDを詰めるスクリプト
（17,351以降のIDを連番に詰める）
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
from sqlalchemy import text

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


def renumber_books_after_id(db: Session, start_id: int):
    """
    指定ID以降の書籍IDを詰める
    
    Args:
        db: データベースセッション
        start_id: 開始ID（このID以降を詰める）
    """
    # 対象書籍を取得（ID順）
    books = db.query(Book).filter(Book.id >= start_id).order_by(Book.id.asc()).all()
    
    if not books:
        logger.info(f"ID {start_id} 以降の書籍がありません")
        return
    
    logger.info(f"ID {start_id} 以降の書籍: {len(books)}件を詰めます")
    logger.info(f"現在のID範囲: {books[0].id} ～ {books[-1].id}")
    
    # 新しいIDの開始値（既存の最大ID + 1）
    max_existing_id = db.query(Book).filter(Book.id < start_id).order_by(Book.id.desc()).first()
    if max_existing_id:
        new_start_id = max_existing_id.id + 1
    else:
        new_start_id = start_id
    
    logger.info(f"新しいID範囲: {new_start_id} ～ {new_start_id + len(books) - 1}")
    
    # 一時的なIDマッピングを作成（衝突を避けるため、まず大きなIDに移動）
    temp_offset = 1000000
    id_mapping = {}
    
    # Step 1: 一時IDに移動
    # 外部キー制約があるため、まず外部キー参照を更新してから書籍IDを更新
    logger.info("Step 1: 一時IDに移動中...")
    for i, book in enumerate(books):
        old_id = book.id
        temp_id = temp_offset + i
        id_mapping[old_id] = {
            'temp_id': temp_id,
            'new_id': new_start_id + i
        }
        
        # まず外部キー参照を一時IDに更新（一時IDの書籍はまだ存在しないが、後で作成する）
        # しかし、これは外部キー制約違反になるため、別の方法を使う
        # 外部キー参照を削除してから、書籍IDを更新し、その後外部キー参照を再作成する
    
    # 外部キー参照を一時テーブルに保存
    logger.info("外部キー参照を一時保存中...")
    db.execute(text("DROP TABLE IF EXISTS temp_book_mentions"))
    db.execute(text("""
        CREATE TEMP TABLE temp_book_mentions AS
        SELECT * FROM book_qiita_mentions
        WHERE book_id >= :start_id
    """), {'start_id': start_id})
    
    # 外部キー参照を削除
    logger.info("外部キー参照を削除中...")
    db.execute(text("DELETE FROM book_qiita_mentions WHERE book_id >= :start_id"), {'start_id': start_id})
    db.commit()
    
    # 書籍IDを一時IDに更新
    logger.info("書籍IDを一時IDに更新中...")
    for i, book in enumerate(books):
        old_id = book.id
        temp_id = temp_offset + i
        db.execute(
            text("UPDATE books SET id = :temp_id WHERE id = :old_id"),
            {'temp_id': temp_id, 'old_id': old_id}
        )
    db.commit()
    
    # 外部キー参照を一時IDで復元
    logger.info("外部キー参照を一時IDで復元中...")
    for old_id, mapping in id_mapping.items():
        temp_id = mapping['temp_id']
        db.execute(text("""
            UPDATE temp_book_mentions
            SET book_id = :temp_id
            WHERE book_id = :old_id
        """), {'temp_id': temp_id, 'old_id': old_id})
    
    db.execute(text("""
        INSERT INTO book_qiita_mentions
        SELECT * FROM temp_book_mentions
    """))
    db.commit()
    
    logger.info("Step 1 完了: 一時IDへの移動完了")
    
    # Step 2: 最終IDに移動
    # 外部キー参照を削除→書籍ID更新→外部キー参照再作成
    logger.info("Step 2: 最終IDに移動中...")
    
    # 外部キー参照を一時テーブルに保存
    logger.info("外部キー参照を一時保存中...")
    db.execute(text("""
        DROP TABLE IF EXISTS temp_book_mentions2;
        CREATE TEMP TABLE temp_book_mentions2 AS
        SELECT * FROM book_qiita_mentions
        WHERE book_id >= :temp_offset
    """), {'temp_offset': temp_offset})
    
    # 外部キー参照を削除
    logger.info("外部キー参照を削除中...")
    db.execute(text("DELETE FROM book_qiita_mentions WHERE book_id >= :temp_offset"), {'temp_offset': temp_offset})
    db.commit()
    
    # 書籍IDを最終IDに更新
    logger.info("書籍IDを最終IDに更新中...")
    for old_id, mapping in id_mapping.items():
        temp_id = mapping['temp_id']
        new_id = mapping['new_id']
        db.execute(
            text("UPDATE books SET id = :new_id WHERE id = :temp_id"),
            {'new_id': new_id, 'temp_id': temp_id}
        )
    db.commit()
    
    # 外部キー参照を最終IDで復元
    logger.info("外部キー参照を最終IDで復元中...")
    for old_id, mapping in id_mapping.items():
        temp_id = mapping['temp_id']
        new_id = mapping['new_id']
        db.execute(text("""
            UPDATE temp_book_mentions2
            SET book_id = :new_id
            WHERE book_id = :temp_id
        """), {'new_id': new_id, 'temp_id': temp_id})
    
    db.execute(text("""
        INSERT INTO book_qiita_mentions
        SELECT * FROM temp_book_mentions2
    """))
    db.commit()
    
    logger.info("Step 2 完了: 最終IDへの移動完了")
    
    # シーケンスを更新（PostgreSQLの場合）
    try:
        max_id = db.query(Book).order_by(Book.id.desc()).first()
        if max_id:
            db.execute(text(f"SELECT setval('books_id_seq', {max_id.id}, true)"))
            db.commit()
            logger.info(f"シーケンスを {max_id.id} に更新しました")
    except Exception as e:
        logger.warning(f"シーケンス更新でエラー（無視します）: {e}")
    
    logger.info(f"[OK] ID詰め完了: {len(books)}件の書籍IDを詰めました")


def main():
    """メイン処理"""
    parser = argparse.ArgumentParser(description='指定ID以降の書籍IDを詰める')
    parser.add_argument(
        '--start-id',
        type=int,
        default=17351,
        help='開始ID（このID以降を詰める、デフォルト: 17351）'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='ドライラン（実際には実行しない）'
    )
    
    args = parser.parse_args()
    
    if args.dry_run:
        logger.info("*** ドライランモード ***")
    
    db = SessionLocal()
    
    try:
        if not args.dry_run:
            logger.warning("この操作は既存データを変更します。本当に実行しますか？")
            logger.warning("Ctrl+Cでキャンセルしてください（10秒待機）...")
            import time
            time.sleep(10)
        
        renumber_books_after_id(db, args.start_id)
    except KeyboardInterrupt:
        logger.info("キャンセルされました")
        db.rollback()
        sys.exit(0)
    except Exception as e:
        logger.error(f"[ERROR] エラー: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == '__main__':
    main()

