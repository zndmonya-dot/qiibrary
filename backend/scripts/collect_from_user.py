#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
特定Qiitaユーザーの記事から書籍情報を収集
"""

import sys
import os
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
import argparse
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.qiita_article import QiitaArticle
from app.models.book import Book, BookQiitaMention
from app.services.qiita_service import get_qiita_service
from app.services.openbd_service import get_openbd_service

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


def get_user_articles(user_id: str, max_articles: int = 100):
    """
    特定ユーザーの記事を取得
    """
    qiita_service = get_qiita_service()
    
    import requests
    import time
    
    all_articles = []
    page = 1
    
    logger.info(f"ユーザー @{user_id} の記事を取得中...")
    
    while len(all_articles) < max_articles:
        try:
            response = requests.get(
                f'https://qiita.com/api/v2/users/{user_id}/items',
                headers={'Authorization': f'Bearer {qiita_service.token}'},
                params={'page': page, 'per_page': 100}
            )
            
            if response.status_code == 404:
                logger.error(f"ユーザー @{user_id} が見つかりません")
                return []
            
            response.raise_for_status()
            articles = response.json()
            
            if not articles:
                break
            
            for article_data in articles:
                article = qiita_service._extract_article_info(article_data)
                all_articles.append(article)
            
            logger.info(f"  ✓ {len(all_articles)}件取得（Page {page}）")
            
            if len(articles) < 100:
                break
            
            page += 1
            time.sleep(3.6)  # レート制限
            
        except Exception as e:
            logger.error(f"エラー: {e}")
            break
    
    logger.info(f"✅ 合計 {len(all_articles)}件の記事を取得")
    return all_articles[:max_articles]


def get_or_create_article(db: Session, article_data: dict) -> QiitaArticle:
    """Qiita記事を取得または作成"""
    qiita_id = article_data['qiita_id']
    
    existing_article = db.query(QiitaArticle).filter(QiitaArticle.qiita_id == qiita_id).first()
    
    if existing_article:
        existing_article.likes_count = article_data.get('likes_count', 0)
        existing_article.stocks_count = article_data.get('stocks_count', 0)
        existing_article.comments_count = article_data.get('comments_count', 0)
        existing_article.updated_at = datetime.now()
        db.commit()
        db.refresh(existing_article)
        return existing_article
    
    new_article = QiitaArticle(
        qiita_id=qiita_id,
        title=article_data.get('title', ''),
        url=article_data.get('url', ''),
        author_id=article_data.get('author_id', ''),
        author_name=article_data.get('author_name'),
        tags=article_data.get('tags', []),
        likes_count=article_data.get('likes_count', 0),
        stocks_count=article_data.get('stocks_count', 0),
        comments_count=article_data.get('comments_count', 0),
        book_mention_count=0,
        published_at=article_data.get('published_at', datetime.now()),
    )
    
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    
    return new_article


def normalize_isbn(isbn: str) -> str:
    """ISBNを正規化"""
    return isbn.replace('-', '').replace(' ', '')


def get_or_create_book(db: Session, isbn: str, openbd_service) -> Optional[Book]:
    """書籍を取得または作成"""
    normalized_isbn = normalize_isbn(isbn)
    
    # 既存の書籍を検索
    existing_book = db.query(Book).filter(Book.isbn == normalized_isbn).first()
    if existing_book:
        return existing_book
    
    # openBDから書籍情報を取得
    book_info = openbd_service.get_book_info(normalized_isbn)
    
    if not book_info:
        logger.warning(f"  ⚠ ISBN {normalized_isbn}: openBDで見つかりません")
        return None
    
    # 新しい書籍を作成
    new_book = Book(
        isbn=normalized_isbn,
        title=book_info.get('title', f'ISBN: {normalized_isbn}'),
        author=book_info.get('author'),
        publisher=book_info.get('publisher'),
        publication_date=book_info.get('publication_date'),
        description=book_info.get('description'),
        thumbnail_url=book_info.get('thumbnail_url'),
        amazon_url=openbd_service.generate_amazon_url(normalized_isbn),
        amazon_affiliate_url=openbd_service.generate_amazon_affiliate_url(normalized_isbn),
        book_data=book_info,
    )
    
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    
    logger.info(f"  ✓ 新規書籍: {new_book.title[:40]}...")
    return new_book


def main():
    parser = argparse.ArgumentParser(description='特定ユーザーの記事から書籍情報を収集')
    parser.add_argument('--user', required=True, help='QiitaユーザーID（例: sappuruさん）')
    parser.add_argument('--max-articles', type=int, default=100, help='最大記事数')
    
    args = parser.parse_args()
    
    logger.info("=" * 80)
    logger.info(f"ユーザー @{args.user} の記事から書籍情報を収集")
    logger.info("=" * 80)
    
    qiita_service = get_qiita_service()
    openbd_service = get_openbd_service()
    db = SessionLocal()
    
    try:
        # ユーザーの記事を取得
        articles = get_user_articles(args.user, args.max_articles)
        
        if not articles:
            logger.error("記事が取得できませんでした")
            return
        
        # 書籍リンクを含む記事を処理
        total_books = 0
        total_mentions = 0
        
        for article in articles:
            body = article.get('body', '')
            book_refs = qiita_service.extract_book_references(body)
            
            if not book_refs:
                continue
            
            logger.info(f"\n📄 記事: {article['title'][:50]}...")
            logger.info(f"   書籍リンク: {len(book_refs)}件")
            
            # 記事をDBに保存
            qiita_article = get_or_create_article(db, article)
            
            # 各書籍を処理
            for isbn in book_refs:
                book = get_or_create_book(db, isbn, openbd_service)
                
                if book:
                    # 言及を保存
                    existing_mention = db.query(BookQiitaMention).filter(
                        BookQiitaMention.book_id == book.id,
                        BookQiitaMention.qiita_article_id == qiita_article.id
                    ).first()
                    
                    if not existing_mention:
                        mention = BookQiitaMention(
                            book_id=book.id,
                            qiita_article_id=qiita_article.id,
                            mentioned_at=qiita_article.published_at
                        )
                        db.add(mention)
                        total_mentions += 1
                    
                    total_books += 1
            
            db.commit()
        
        logger.info("\n" + "=" * 80)
        logger.info("✅ 収集完了！")
        logger.info("=" * 80)
        logger.info(f"処理した記事: {len(articles)}件")
        logger.info(f"収集した書籍: {total_books}件")
        logger.info(f"新規言及: {total_mentions}件")
        logger.info("=" * 80)
        
    finally:
        db.close()


if __name__ == '__main__':
    main()

