#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
特定の書籍のURLをテスト
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.book import Book

logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    db: Session = SessionLocal()
    
    # ISBN-13が変換されたはずの書籍を検索
    book = db.query(Book).filter(Book.isbn == "9784775991855").first()
    
    if not book:
        logger.error("書籍が見つかりません")
        return
    
    logger.info("================================================================================")
    logger.info("📊 書籍URLテスト: Python3ではじめるシステムトレード第2版")
    logger.info("================================================================================")
    logger.info("")
    logger.info(f"📚 タイトル: {book.title}")
    logger.info(f"📖 ISBN: {book.isbn}")
    logger.info("")
    logger.info("🔗 Amazon:")
    logger.info(f"   通常: {book.amazon_url}")
    logger.info(f"   アフィリエイト: {book.amazon_affiliate_url}")
    logger.info("")
    logger.info("🔗 楽天ブックス:")
    logger.info(f"   通常: {book.rakuten_url}")
    logger.info(f"   アフィリエイト: {book.rakuten_affiliate_url}")
    logger.info("")
    logger.info("================================================================================")
    logger.info("✅ ブラウザで確認してください:")
    logger.info(f"   {book.amazon_affiliate_url}")
    logger.info("================================================================================")
    
    db.close()

if __name__ == "__main__":
    main()

