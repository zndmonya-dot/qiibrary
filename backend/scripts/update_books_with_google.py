#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
既存の書籍データにGoogle Books APIからサムネイルと説明文を追加
"""

import sys
import os
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.book import Book
from app.services.google_books_service import get_google_books_service

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


def update_books_with_google_data():
    """既存の書籍データにGoogle Booksからサムネイルと説明文を追加"""
    
    logger.info("=" * 80)
    logger.info("既存書籍データの更新開始（Google Books API）")
    logger.info("=" * 80)
    
    db: Session = SessionLocal()
    google_books_service = get_google_books_service()
    
    updated_count = 0
    not_found_count = 0
    
    try:
        # 全ての書籍を取得
        books = db.query(Book).all()
        logger.info(f"対象書籍数: {len(books)}冊\n")
        
        for i, book in enumerate(books, 1):
            isbn = book.isbn
            logger.info(f"[{i}/{len(books)}] ISBN: {isbn} - {book.title[:40]}...")
            
            # 既にサムネイルと説明がある場合はスキップ
            if book.thumbnail_url and book.description:
                logger.info(f"  [SKIP] Already has thumbnail and description")
                continue
            
            # Google Books APIから取得
            google_data = google_books_service.get_book_by_isbn(isbn)
            
            if not google_data:
                logger.info(f"  [NOT FOUND] Google Books に存在しません")
                not_found_count += 1
                continue
            
            # データを更新
            updated = False
            
            # サムネイルURLを更新
            if not book.thumbnail_url and google_data.get('thumbnail_url'):
                book.thumbnail_url = google_data['thumbnail_url']
                logger.info(f"  [UPDATE] Thumbnail: {google_data['thumbnail_url'][:60]}...")
                updated = True
            
            # 説明文を更新
            if not book.description and google_data.get('description'):
                book.description = google_data['description']
                desc_preview = google_data['description'][:80].replace('\n', ' ')
                logger.info(f"  [UPDATE] Description: {desc_preview}...")
                updated = True
            
            # タイトルが空の場合は補完（openBDで取得できなかった場合）
            if not book.title or book.title.startswith('ISBN:'):
                if google_data.get('title'):
                    book.title = google_data['title']
                    logger.info(f"  [UPDATE] Title: {google_data['title'][:60]}...")
                    updated = True
            
            # 著者が不明の場合は補完
            if book.author == '著者不明' or not book.author:
                if google_data.get('author'):
                    book.author = google_data['author']
                    logger.info(f"  [UPDATE] Author: {google_data['author'][:60]}...")
                    updated = True
            
            if updated:
                db.commit()
                db.refresh(book)
                updated_count += 1
                logger.info(f"  [SUCCESS] Updated!")
            else:
                logger.info(f"  [SKIP] No updates needed")
        
        logger.info("\n" + "=" * 80)
        logger.info("[COMPLETE] 書籍データ更新完了！")
        logger.info("=" * 80)
        logger.info(f"総書籍数: {len(books)}冊")
        logger.info(f"更新した書籍: {updated_count}冊")
        logger.info(f"見つからなかった: {not_found_count}冊")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"エラーが発生しました: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    update_books_with_google_data()

