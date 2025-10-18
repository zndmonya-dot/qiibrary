#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Qiita記事から書籍情報を抽出してデータベースに保存するスクリプト

使用方法:
    cd backend
    python -m scripts.collect_books_from_qiita --tags Python JavaScript
"""

import sys
import os
from pathlib import Path

# プロジェクトのルートディレクトリをPythonパスに追加
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
import argparse
from typing import Optional
from datetime import datetime, date
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
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


def get_or_create_article(db: Session, article_data: dict) -> QiitaArticle:
    """
    Qiita記事を取得または作成
    
    Args:
        db: データベースセッション
        article_data: 記事情報
        
    Returns:
        QiitaArticleオブジェクト
    """
    qiita_id = article_data['qiita_id']
    
    # 既存の記事を検索
    existing_article = db.query(QiitaArticle).filter(QiitaArticle.qiita_id == qiita_id).first()
    
    if existing_article:
        # 統計情報を更新
        existing_article.likes_count = article_data.get('likes_count', 0)
        existing_article.stocks_count = article_data.get('stocks_count', 0)
        existing_article.comments_count = article_data.get('comments_count', 0)
        existing_article.updated_at = datetime.now()
        db.commit()
        db.refresh(existing_article)
        return existing_article
    
    # 新しい記事を作成
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
    
    logger.info(f"✓ 新規記事作成: {qiita_id}")
    return new_article


def normalize_isbn(isbn: str) -> str:
    """ISBNを正規化（ハイフンを除去）"""
    return isbn.replace('-', '').replace(' ', '')


def get_or_create_book_from_isbn(
    db: Session,
    isbn: str,
    openbd_service
) -> Optional[Book]:
    """
    ISBN/ASINから書籍を取得または作成
    
    Args:
        db: データベースセッション
        isbn: ISBN-10, ISBN-13, または Amazon ASIN (10桁の英数字)
        openbd_service: openBDサービス
        
    Returns:
        Bookオブジェクト、取得できない場合はNone
    """
    # ISBN/ASINを正規化（ハイフン、スペースを除去）
    normalized_isbn = normalize_isbn(isbn)
    
    # 既存の書籍を検索（ISBN-10とISBN-13の両方をチェック）
    existing_book = db.query(Book).filter(
        (Book.isbn == normalized_isbn) | 
        (Book.isbn == isbn)
    ).first()
    if existing_book:
        return existing_book
    
    # openBD APIから書籍情報を取得
    book_info = openbd_service.get_book_by_isbn(isbn)
    
    if not book_info:
        logger.warning(f"書籍情報を取得できません: ISBN={isbn}")
        # 最小限の情報で書籍を作成
        book_info = {
            'isbn': isbn,
            'title': f'書籍 {isbn}',
            'author': '不明',
            'publisher': '不明',
            'publication_date': None,
            'description': None,
            'thumbnail_url': None,
            'amazon_url': None,
            'amazon_affiliate_url': None,
            'book_data': {}
        }
    
    # AmazonアフィリエイトURLを生成（正規化されたISBN/ASINを使用）
    # generate_amazon_url と generate_amazon_affiliate_url が自動的にISBN-13をISBN-10に変換
    amazon_url = book_info.get('amazon_url') or openbd_service.generate_amazon_url(normalized_isbn)
    amazon_affiliate_url = book_info.get('amazon_affiliate_url') or openbd_service.generate_amazon_affiliate_url(normalized_isbn)
    
    # 新しい書籍を作成（正規化されたISBNを使用）
    new_book = Book(
        isbn=normalized_isbn,
        title=book_info['title'],
        author=book_info.get('author'),
        publisher=book_info.get('publisher'),
        publication_date=book_info.get('publication_date'),
        description=book_info.get('description'),
        thumbnail_url=book_info.get('thumbnail_url'),
        amazon_url=amazon_url,  # 正規化されたISBN/ASINを使用
        amazon_affiliate_url=amazon_affiliate_url,
        book_data=book_info.get('book_data', {}),  # openBDのデータを保存
        total_mentions=0,
    )
    
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    
    logger.info(f"✓ 新規書籍作成: {isbn} - {new_book.title}")
    return new_book


def create_book_qiita_mention(
    db: Session,
    book: Book,
    article: QiitaArticle,
    identifier: str
) -> BookQiitaMention:
    """
    書籍と記事の関連を作成
    
    Args:
        db: データベースセッション
        book: 書籍オブジェクト
        article: 記事オブジェクト
        identifier: 抽出された識別子
        
    Returns:
        BookQiitaMentionオブジェクト
    """
    # 既存の関連を検索
    existing_mention = db.query(BookQiitaMention).filter(
        BookQiitaMention.book_id == book.id,
        BookQiitaMention.article_id == article.id
    ).first()
    
    if existing_mention:
        return existing_mention
    
    # 新しい関連を作成
    mention = BookQiitaMention(
        book_id=book.id,
        article_id=article.id,
        mentioned_at=article.published_at,
        extracted_identifier=identifier,
    )
    
    db.add(mention)
    db.commit()
    db.refresh(mention)
    
    return mention


def update_book_statistics(db: Session):
    """書籍の統計情報を更新"""
    books = db.query(Book).all()
    
    for book in books:
        # total_mentionsを更新
        mention_count = db.query(BookQiitaMention).filter(
            BookQiitaMention.book_id == book.id
        ).count()
        
        book.total_mentions = mention_count
        
        # latest_mention_atを更新
        latest_mention = db.query(BookQiitaMention).filter(
            BookQiitaMention.book_id == book.id
        ).order_by(BookQiitaMention.mentioned_at.desc()).first()
        
        if latest_mention:
            book.latest_mention_at = latest_mention.mentioned_at
    
    db.commit()
    logger.info("✓ 書籍統計情報を更新")


def main():
    """メイン処理"""
    parser = argparse.ArgumentParser(description='Qiita記事から書籍情報を収集')
    parser.add_argument(
        '--tags',
        nargs='+',
        default=['Python', 'JavaScript'],
        help='収集対象のタグ（スペース区切り）'
    )
    parser.add_argument(
        '--max-articles',
        type=int,
        default=5000,
        help='タグごとの最大記事数'
    )
    
    args = parser.parse_args()
    
    logger.info("=" * 80)
    logger.info("Qiita記事から書籍情報を抽出")
    logger.info(f"対象タグ: {', '.join(args.tags)}")
    logger.info(f"最大記事数: {args.max_articles}件/タグ")
    logger.info("=" * 80)
    
    # サービスインスタンスを取得
    qiita_service = get_qiita_service()
    openbd_service = get_openbd_service()
    
    # データベースセッションを作成
    db = SessionLocal()
    
    try:
        total_articles = 0
        total_books = 0
        total_mentions = 0
        
        for tag in args.tags:
            logger.info(f"\n{'='*80}")
            logger.info(f"[タグ: {tag}] データ収集開始")
            logger.info(f"{'='*80}")
            
            # Step 1: 書籍への言及がある記事を取得
            articles_with_books = qiita_service.get_articles_with_book_references(
                tag=tag,
                max_articles=args.max_articles
            )
            
            logger.info(f"✓ 書籍言及記事: {len(articles_with_books)} 件")
            total_articles += len(articles_with_books)
            
            # Step 2: 記事と書籍をデータベースに保存
            for article_data in articles_with_books:
                # 記事を保存
                article = get_or_create_article(db, article_data)
                
                # 書籍参照を処理
                book_refs = article_data.get('book_references', [])
                
                for identifier in book_refs:
                    # 書籍を取得または作成
                    book = get_or_create_book_from_isbn(db, identifier, openbd_service)
                    
                    if book:
                        total_books += 1
                        
                        # 書籍と記事の関連を作成
                        create_book_qiita_mention(db, book, article, identifier)
                        total_mentions += 1
            
            logger.info(f"✓ [タグ: {tag}] 完了")
        
        # Step 3: 統計情報を更新
        logger.info(f"\n{'='*80}")
        logger.info("[統計情報更新中...]")
        update_book_statistics(db)
        
        logger.info(f"\n{'='*80}")
        logger.info("✅ データ収集完了！")
        logger.info(f"{'='*80}")
        logger.info(f"収集記事数: {total_articles} 件")
        logger.info(f"書籍数: {total_books} 件")
        logger.info(f"言及数: {total_mentions} 件")
        logger.info(f"{'='*80}")
        
    except Exception as e:
        logger.error(f"❌ エラー: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    
    finally:
        db.close()


if __name__ == '__main__':
    main()

