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
from datetime import datetime, date, timedelta
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
    
    logger.info(f"[OK] 新規記事作成: {qiita_id}")
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
            'author': '著者情報なし',
            'publisher': '出版社情報なし',
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
    
    logger.info(f"[OK] 新規書籍作成: {isbn} - {new_book.title}")
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


def update_book_statistics(db: Session, book_ids: Optional[list] = None):
    """
    書籍の統計情報を更新
    
    Args:
        db: データベースセッション
        book_ids: 更新対象の書籍IDリスト（Noneの場合は全書籍を更新）
    """
    from sqlalchemy.exc import OperationalError
    
    if book_ids:
        # 指定された書籍IDのみを更新
        books = db.query(Book).filter(Book.id.in_(book_ids)).all()
        logger.info(f"統計情報更新開始: {len(books)}件の書籍を処理します")
    else:
        # 全書籍を更新（過去のデータも含む）
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


def run_data_collection(tags=None, max_articles=5000, hours=24):
    """
    データ収集を実行する関数（スケジューラーから呼び出し可能）
    
    Args:
        tags: 収集対象のタグリスト（Noneの場合は全記事を対象）
        max_articles: 最大記事数
        hours: 過去何時間以内の記事を取得するか（デフォルト: 24時間）
    
    Raises:
        Exception: データ収集でエラーが発生した場合
    """
    # 24時間前の日時を計算
    created_after = datetime.now() - timedelta(hours=hours)
    
    logger.info("=" * 80)
    logger.info("Qiita記事から書籍情報を抽出")
    logger.info(f"取得期間: 過去{hours}時間以内（{created_after.strftime('%Y-%m-%d %H:%M:%S')}以降）")
    if tags:
        logger.info(f"対象タグ: {', '.join(tags)}")
        logger.info(f"最大記事数: {max_articles}件/タグ")
    else:
        logger.info("対象: 全記事（タグ制限なし）")
        logger.info(f"最大記事数: {max_articles}件")
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
        updated_book_ids = set()  # 統計情報を更新する書籍IDを記録
        
        # タグが指定されている場合は各タグごとに処理、未指定の場合は全記事を処理
        tags_to_process = tags if tags else [None]
        
        for tag in tags_to_process:
            if tag:
                logger.info(f"\n{'='*80}")
                logger.info(f"[タグ: {tag}] データ収集開始")
                logger.info(f"{'='*80}")
            else:
                logger.info(f"\n{'='*80}")
                logger.info("[全記事] データ収集開始")
                logger.info(f"{'='*80}")
            
            # Step 1: 書籍への言及がある記事を取得（24時間以内）
            articles_with_books = qiita_service.get_articles_with_book_references(
                tag=tag,
                max_articles=max_articles,
                created_after=created_after
            )
            
            logger.info(f"[OK] 書籍言及記事: {len(articles_with_books)} 件")
            total_articles += len(articles_with_books)
            
            # Step 2: 記事と書籍をデータベースに保存
            from sqlalchemy.exc import OperationalError
            
            processed_article_ids = set()  # 処理済み記事IDを記録
            
            for article_data in articles_with_books:
                qiita_id = article_data.get('qiita_id')
                
                # 既に処理済みの記事はスキップ（再接続後の再処理を防ぐ）
                if qiita_id in processed_article_ids:
                    continue
                
                max_retries = 3
                retry_count = 0
                
                while retry_count < max_retries:
                    try:
                        # 記事を保存
                        article = get_or_create_article(db, article_data)
                        
                        # 書籍参照を処理
                        book_refs = article_data.get('book_references', [])
                        
                        for identifier in book_refs:
                            try:
                                # 書籍を取得または作成
                                book = get_or_create_book_from_isbn(db, identifier, openbd_service)
                                
                                if book:
                                    total_books += 1
                                    updated_book_ids.add(book.id)  # 統計情報更新対象に追加
                                    
                                    # 書籍と記事の関連を作成（重複チェック済み）
                                    create_book_qiita_mention(db, book, article, identifier)
                                    total_mentions += 1
                            except OperationalError as e:
                                logger.warning(f"データベース接続エラー（書籍保存中）: {e}")
                                logger.info("再接続を試みます...")
                                try:
                                    db.rollback()
                                except:
                                    pass
                                try:
                                    db.close()
                                except:
                                    pass
                                db = SessionLocal()
                                # 再接続後、同じ書籍から再開（重複チェックで既存データはスキップされる）
                                article = get_or_create_article(db, article_data)
                                book = get_or_create_book_from_isbn(db, identifier, openbd_service)
                                if book:
                                    total_books += 1
                                    updated_book_ids.add(book.id)
                                    create_book_qiita_mention(db, book, article, identifier)
                                    total_mentions += 1
                            except Exception as e:
                                logger.warning(f"書籍保存でエラー（ISBN: {identifier}）: {e}")
                                continue
                        
                        # 記事の処理が成功したら記録
                        processed_article_ids.add(qiita_id)
                        break  # 成功したらループを抜ける
                        
                    except OperationalError as e:
                        retry_count += 1
                        logger.warning(f"データベース接続エラー（記事保存中、リトライ {retry_count}/{max_retries}）: {e}")
                        if retry_count < max_retries:
                            logger.info("再接続を試みます...")
                            try:
                                db.rollback()
                            except:
                                pass
                            try:
                                db.close()
                            except:
                                pass
                            db = SessionLocal()
                            # 再接続後、同じ記事から再開（重複チェックで既存データはスキップされる）
                        else:
                            logger.error(f"記事保存が{max_retries}回失敗しました。スキップします: {qiita_id}")
                            break
                    except Exception as e:
                        logger.warning(f"記事保存でエラー: {e}")
                        # エラーが発生しても処理済みとして記録（次回再実行時にスキップされる）
                        processed_article_ids.add(qiita_id)
                        break
            
            if tag:
                logger.info(f"[OK] [タグ: {tag}] 完了")
            else:
                logger.info(f"[OK] [全記事] 完了")
        
        # Step 3: 統計情報を更新（新規作成/更新された書籍のみ）
        logger.info(f"\n{'='*80}")
        logger.info(f"[統計情報更新中...] (対象: {len(updated_book_ids)}件の書籍)")
        update_book_statistics(db, book_ids=list(updated_book_ids))
        
        logger.info(f"\n{'='*80}")
        logger.info("[OK] データ収集完了！")
        logger.info(f"{'='*80}")
        logger.info(f"収集記事数: {total_articles} 件")
        logger.info(f"書籍数: {total_books} 件")
        logger.info(f"言及数: {total_mentions} 件")
        logger.info(f"{'='*80}")
        
    except Exception as e:
        logger.error(f"[ERROR] エラー: {e}", exc_info=True)
        db.rollback()
        raise  # 例外を再発生させてスケジューラーで処理できるようにする
    
    finally:
        db.close()


def main():
    """メイン処理（コマンドライン実行用）"""
    parser = argparse.ArgumentParser(description='Qiita記事から書籍情報を収集')
    parser.add_argument(
        '--tags',
        nargs='*',
        default=None,
        help='収集対象のタグ（スペース区切り）。指定なしの場合は全記事を対象'
    )
    parser.add_argument(
        '--max-articles',
        type=int,
        default=5000,
        help='タグごとの最大記事数（タグ未指定の場合は全記事）'
    )
    parser.add_argument(
        '--hours',
        type=int,
        default=24,
        help='過去何時間分の記事を取得するか（デフォルト: 24時間）'
    )
    parser.add_argument(
        '--days',
        type=int,
        default=None,
        help='過去何日分の記事を取得するか（hoursより優先）'
    )
    
    args = parser.parse_args()
    
    # 日数が指定されている場合は時間を計算
    hours = args.hours
    if args.days is not None:
        hours = args.days * 24
    
    try:
        run_data_collection(tags=args.tags, max_articles=args.max_articles, hours=hours)
    except Exception as e:
        logger.error(f"データ収集でエラーが発生しました: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

