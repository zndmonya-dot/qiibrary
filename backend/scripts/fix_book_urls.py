#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
既存の書籍データのAmazon/楽天URLを修正するスクリプト
"""

import sys
from pathlib import Path

# プロジェクトのルートディレクトリをPythonパスに追加
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.book import Book
from app.services.openbd_service import get_openbd_service

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


def fix_book_urls(db: Session, openbd_service):
    """全書籍のURLを修正（ISBN-13をISBN-10に変換してAmazon URLを生成）"""
    books = db.query(Book).all()
    
    logger.info(f"書籍数: {len(books)}")
    
    fixed_count = 0
    
    for book in books:
        needs_update = False
        
        # Amazon URLを修正（自動的にISBN-13をISBN-10に変換）
        correct_amazon_url = openbd_service.generate_amazon_url(book.isbn)
        if book.amazon_url != correct_amazon_url:
            logger.info(f"Amazon URL修正: {book.title}")
            logger.info(f"  ISBN: {book.isbn}")
            logger.info(f"  旧: {book.amazon_url}")
            logger.info(f"  新: {correct_amazon_url}")
            book.amazon_url = correct_amazon_url
            needs_update = True
        
        # Amazonアフィリエイトリンクを修正（自動的にISBN-13をISBN-10に変換）
        correct_amazon_affiliate_url = openbd_service.generate_amazon_affiliate_url(book.isbn)
        if book.amazon_affiliate_url != correct_amazon_affiliate_url:
            logger.info(f"Amazonアフィリエイトリンク修正: {book.title}")
            logger.info(f"  ISBN: {book.isbn}")
            logger.info(f"  旧: {book.amazon_affiliate_url}")
            logger.info(f"  新: {correct_amazon_affiliate_url}")
            book.amazon_affiliate_url = correct_amazon_affiliate_url
            needs_update = True
        
        if needs_update:
            fixed_count += 1
    
    if fixed_count > 0:
        db.commit()
        logger.info(f"✅ {fixed_count} 件の書籍URLを修正しました")
    else:
        logger.info("✅ すべての書籍URLは正しい状態です")


def main():
    db: Session = SessionLocal()
    openbd_service = get_openbd_service()
    
    logger.info("================================================================================")
    logger.info("📚 書籍URLの修正")
    logger.info("================================================================================")
    
    try:
        fix_book_urls(db, openbd_service)
    except Exception as e:
        logger.error(f"エラーが発生しました: {e}", exc_info=True)
    finally:
        db.close()
    
    logger.info("================================================================================")
    logger.info("✅ 完了")
    logger.info("================================================================================")


if __name__ == "__main__":
    main()

