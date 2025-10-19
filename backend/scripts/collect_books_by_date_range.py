#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
期間指定でQiita記事から書籍情報を収集
2025-01-01 から今日までの全記事をチェック
"""

import sys
import os
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
from datetime import datetime, date
from sqlalchemy.orm import Session
import requests
import time

from app.database import SessionLocal
from app.models.qiita_article import QiitaArticle
from app.models.book import Book, BookQiitaMention
from app.services.qiita_service import get_qiita_service
from app.services.openbd_service import get_openbd_service
from app.services.google_books_service import get_google_books_service

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


def get_or_create_article(db: Session, article_data: dict) -> QiitaArticle:
    """Qiita記事を取得または作成"""
    qiita_id = article_data['qiita_id']
    
    existing_article = db.query(QiitaArticle).filter(QiitaArticle.qiita_id == qiita_id).first()
    
    if existing_article:
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


def get_or_create_book_from_isbn(
    db: Session,
    isbn: str,
    openbd_service,
    google_books_service
) -> Book:
    """ISBNから書籍を取得または作成（openBD + Google Books）"""
    
    # 既存の書籍を検索
    existing_book = db.query(Book).filter(Book.isbn == isbn).first()
    
    if existing_book:
        return existing_book
    
    # openBDから基本情報を取得
    openbd_info = openbd_service.get_book_by_isbn(isbn)
    
    # Google Booksからサムネイルと説明を取得
    google_info = google_books_service.get_book_by_isbn(isbn)
    
    # 統合
    if openbd_info:
        title = openbd_info.get('title', f'ISBN: {isbn} の書籍')
        author = openbd_info.get('author', '著者情報なし')
        publisher = openbd_info.get('publisher', '出版社情報なし')
        publication_date = openbd_info.get('publication_date')
        description = openbd_info.get('description')
        thumbnail_url = openbd_info.get('thumbnail_url')
    else:
        title = f'ISBN: {isbn} の書籍'
        author = '著者情報なし'
        publisher = '出版社情報なし'
        publication_date = None
        description = None
        thumbnail_url = None
    
    # Google Booksから補完
    if google_info:
        if not thumbnail_url:
            thumbnail_url = google_info.get('thumbnail_url')
        if not description:
            description = google_info.get('description')
        if not title or title.startswith('ISBN:'):
            title = google_info.get('title') or title
        if author == '著者情報なし':
            author = google_info.get('author') or author
    
    # AmazonアフィリエイトURLを生成
    amazon_url = openbd_service.generate_amazon_url(isbn)
    amazon_affiliate_url = openbd_service.generate_amazon_affiliate_url(isbn)
    
    # book_dataのpublication_dateを文字列に変換
    book_data_json = None
    if openbd_info:
        book_data_json = openbd_info.copy()
        if book_data_json.get('publication_date') and isinstance(book_data_json['publication_date'], date):
            book_data_json['publication_date'] = book_data_json['publication_date'].isoformat()
    
    # 新しい書籍を作成
    new_book = Book(
        isbn=isbn,
        title=title,
        author=author,
        publisher=publisher,
        publication_date=publication_date,
        description=description,
        thumbnail_url=thumbnail_url,
        amazon_url=amazon_url,
        amazon_affiliate_url=amazon_affiliate_url,
        book_data=book_data_json,
        total_mentions=0,
        first_mentioned_at=None,
        latest_mention_at=None,
    )
    
    db.add(new_book)
    
    try:
        db.commit()
        db.refresh(new_book)
        logger.info(f"  [NEW BOOK] {new_book.title[:50]}... (ISBN: {isbn})")
        return new_book
    except Exception as e:
        # 重複エラーの場合は既存の書籍を取得
        db.rollback()
        existing_book = db.query(Book).filter(Book.isbn == isbn).first()
        if existing_book:
            logger.debug(f"  [EXISTING] ISBN {isbn} already exists (concurrent insert)")
            return existing_book
        else:
            # それ以外のエラーは再度発生させる
            raise


def collect_qiita_articles_by_date(start_date: date, end_date: date):
    """
    期間指定でQiita記事を収集
    
    Args:
        start_date: 開始日（2025-01-01）
        end_date: 終了日（今日）
    """
    
    logger.info("=" * 80)
    logger.info("Qiita記事収集開始（期間指定）")
    logger.info("=" * 80)
    logger.info(f"期間: {start_date} 〜 {end_date}")
    logger.info(f"対象: Amazon書籍リンクを含む記事")
    logger.info("=" * 80)
    
    qiita_service = get_qiita_service()
    openbd_service = get_openbd_service()
    google_books_service = get_google_books_service()
    
    total_articles_checked = 0
    articles_with_books = 0
    total_books = 0
    total_mentions = 0
    
    # ステップ1: 全記事を取得
    logger.info("="*80)
    logger.info("ステップ1: 全記事を取得中...")
    logger.info("="*80)
    
    all_articles = []
    page = 1
    per_page = 100
    
    try:
        while True:
            logger.info(f"Page {page} を取得中...")
            
            # Qiita APIから記事を取得（期間範囲指定）
            response = requests.get(
                'https://qiita.com/api/v2/items',
                headers={'Authorization': f'Bearer {qiita_service.token}'},
                params={
                    'page': page,
                    'per_page': per_page,
                    'query': f'created:>={start_date.isoformat()} created:<={end_date.isoformat()}'
                },
                timeout=10
            )
            
            if response.status_code != 200:
                logger.error(f"Qiita API error: {response.status_code}")
                break
            
            articles = response.json()
            
            if not articles:
                logger.info("これ以上記事がありません。")
                break
            
            logger.info(f"  取得: {len(articles)}件")
            all_articles.extend(articles)
            
            # 次のページへ
            page += 1
            time.sleep(1)  # ページ間の待機時間
        
        # ステップ2: 古い順でソート
        logger.info("="*80)
        logger.info(f"ステップ2: 全{len(all_articles)}件の記事を古い順にソート中...")
        logger.info("="*80)
        
        all_articles_sorted = sorted(all_articles, key=lambda x: x.get('created_at', ''))
        
        if all_articles_sorted:
            logger.info(f"ソート完了！最古: {all_articles_sorted[0]['created_at']}")
            logger.info(f"         最新: {all_articles_sorted[-1]['created_at']}")
        
        # ステップ3: 古い記事から順に処理
        logger.info("="*80)
        logger.info("ステップ3: 記事を処理中（古い順）...")
        logger.info("="*80)
        
        db: Session = SessionLocal()
        try:
            for article in all_articles_sorted:
                total_articles_checked += 1
                
                created_at = datetime.fromisoformat(article.get('created_at', '').replace('Z', '+00:00'))
                
                # 本文から書籍識別子を抽出
                body = article.get('body', '')
                refs = qiita_service.extract_book_references(body)
                
                if not refs:
                    continue
                
                # 記事データを整形
                user = article.get('user', {})
                tags = [tag['name'] for tag in article.get('tags', [])]
                
                article_data = {
                    'qiita_id': article.get('id', ''),
                    'title': article.get('title', ''),
                    'url': article.get('url', ''),
                    'author_id': user.get('id', ''),
                    'author_name': user.get('name'),
                    'tags': tags,
                    'likes_count': article.get('likes_count', 0),
                    'stocks_count': article.get('stocks_count', 0),
                    'comments_count': article.get('comments_count', 0),
                    'published_at': created_at,
                }
                
                # 記事をDBに保存
                db_article = get_or_create_article(db, article_data)
                db_article.book_mention_count = len(refs)
                db.commit()
                
                articles_with_books += 1
                article_date = db_article.published_at.strftime('%Y-%m-%d')
                logger.info(f"[{total_articles_checked}] ({article_date}) {db_article.title[:60]}... ({len(refs)}冊)")
                
                # 各書籍を処理
                for isbn in refs:
                    book = get_or_create_book_from_isbn(db, isbn, openbd_service, google_books_service)
                    
                    # 書籍と記事の関連付け
                    existing_mention = db.query(BookQiitaMention).filter(
                        BookQiitaMention.book_id == book.id,
                        BookQiitaMention.article_id == db_article.id
                    ).first()
                    
                    if not existing_mention:
                        # メンション作成（記事の公開日時を使用）
                        mention = BookQiitaMention(
                            book_id=book.id,
                            article_id=db_article.id,
                            mentioned_at=db_article.published_at,
                            extracted_identifier=isbn
                        )
                        db.add(mention)
                        
                        # 書籍の統計情報を更新
                        book.total_mentions = (book.total_mentions or 0) + 1
                        
                        # 初回言及日時を設定（初回のみ）
                        if book.first_mentioned_at is None:
                            book.first_mentioned_at = db_article.published_at
                        else:
                            # より古い日付があれば更新
                            if db_article.published_at < book.first_mentioned_at:
                                book.first_mentioned_at = db_article.published_at
                        
                        # 最終言及日時を更新
                        if book.latest_mention_at is None:
                            book.latest_mention_at = db_article.published_at
                        else:
                            # より新しい日付があれば更新
                            if db_article.published_at > book.latest_mention_at:
                                book.latest_mention_at = db_article.published_at
                        
                        db.add(book)
                        db.commit()
                        total_mentions += 1
                    
                    total_books += 1
                
                # レート制限対策
                time.sleep(0.1)
        
        except KeyboardInterrupt:
            logger.info("\n\n中断されました")
        except Exception as e:
            logger.error(f"エラーが発生しました: {e}", exc_info=True)
            db.rollback()
        finally:
            db.close()
            
    except KeyboardInterrupt:
        logger.info("\n\n取得処理が中断されました")
    except Exception as e:
        logger.error(f"取得処理でエラーが発生しました: {e}", exc_info=True)
    
    logger.info("\n" + "=" * 80)
    logger.info("[COMPLETE] データ収集完了！")
    logger.info("=" * 80)
    logger.info(f"チェックした記事数: {total_articles_checked}件")
    logger.info(f"書籍リンクを含む記事: {articles_with_books}件")
    logger.info(f"書籍数: {total_books}件（重複含む）")
    logger.info(f"新規言及数: {total_mentions}件")
    logger.info("=" * 80)


if __name__ == "__main__":
    # コマンドライン引数で日付範囲を指定可能
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', type=str, help='開始日 (YYYY-MM-DD)', required=False)
    parser.add_argument('--end', type=str, help='終了日 (YYYY-MM-DD)', required=False)
    args = parser.parse_args()
    
    if args.start:
        start_date = date.fromisoformat(args.start)
    else:
        start_date = date(2025, 1, 1)
    
    if args.end:
        end_date = date.fromisoformat(args.end)
    else:
        end_date = date.today()
    
    collect_qiita_articles_by_date(start_date, end_date)

