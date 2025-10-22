"""
データ更新API
管理者用：Qiita記事を収集してデータベースを更新
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
import logging
from ..database import get_db
from ..services.qiita_service import get_qiita_service
from ..services.openbd_service import get_openbd_service
from ..services.google_books_service import get_google_books_service
from ..models.qiita_article import QiitaArticle
from ..models.book import Book, BookQiitaMention
import requests
import time

logger = logging.getLogger(__name__)

router = APIRouter()


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
    """ISBNから書籍を取得または作成"""
    
    existing_book = db.query(Book).filter(Book.isbn == isbn).first()
    
    if existing_book:
        return existing_book
    
    openbd_info = openbd_service.get_book_by_isbn(isbn)
    google_info = google_books_service.get_book_by_isbn(isbn)
    
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
    
    if google_info:
        if not thumbnail_url:
            thumbnail_url = google_info.get('thumbnail_url')
        if not description:
            description = google_info.get('description')
        if not title or title.startswith('ISBN:'):
            title = google_info.get('title') or title
        if author == '著者情報なし':
            author = google_info.get('author') or author
    
    amazon_url = openbd_service.generate_amazon_url(isbn)
    amazon_affiliate_url = openbd_service.generate_amazon_affiliate_url(isbn)
    
    book_data_json = None
    if openbd_info:
        book_data_json = openbd_info.copy()
        if book_data_json.get('publication_date') and isinstance(book_data_json['publication_date'], date):
            book_data_json['publication_date'] = book_data_json['publication_date'].isoformat()
    
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
        logger.info(f"[NEW BOOK] {new_book.title[:50]}... (ISBN: {isbn})")
        return new_book
    except Exception:
        db.rollback()
        existing_book = db.query(Book).filter(Book.isbn == isbn).first()
        if existing_book:
            return existing_book
        else:
            raise


def update_data_background(start_date: date, end_date: date, db: Session):
    """バックグラウンドでデータを更新"""
    logger.info(f"データ更新開始: {start_date} 〜 {end_date}")
    
    qiita_service = get_qiita_service()
    openbd_service = get_openbd_service()
    google_books_service = get_google_books_service()
    
    total_articles_checked = 0
    articles_with_books = 0
    total_mentions = 0
    
    try:
        all_articles = []
        page = 1
        per_page = 100
        
        # 全記事を取得
        while True:
            logger.info(f"Page {page} を取得中...")
            
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
                break
            
            logger.info(f"取得: {len(articles)}件")
            all_articles.extend(articles)
            
            page += 1
            time.sleep(1)
        
        # 古い順にソート
        all_articles_sorted = sorted(all_articles, key=lambda x: x.get('created_at', ''))
        
        logger.info(f"全{len(all_articles_sorted)}件の記事を処理開始")
        
        # 記事を処理
        for article in all_articles_sorted:
            total_articles_checked += 1
            
            created_at = datetime.fromisoformat(article.get('created_at', '').replace('Z', '+00:00'))
            
            body = article.get('body', '')
            refs = qiita_service.extract_book_references(body)
            
            if not refs:
                continue
            
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
            
            db_article = get_or_create_article(db, article_data)
            db_article.book_mention_count = len(refs)
            db.commit()
            
            articles_with_books += 1
            
            for isbn in refs:
                book = get_or_create_book_from_isbn(db, isbn, openbd_service, google_books_service)
                
                existing_mention = db.query(BookQiitaMention).filter(
                    BookQiitaMention.book_id == book.id,
                    BookQiitaMention.article_id == db_article.id
                ).first()
                
                if not existing_mention:
                    mention = BookQiitaMention(
                        book_id=book.id,
                        article_id=db_article.id,
                        mentioned_at=db_article.published_at,
                        extracted_identifier=isbn
                    )
                    db.add(mention)
                    
                    book.total_mentions = (book.total_mentions or 0) + 1
                    
                    if book.first_mentioned_at is None:
                        book.first_mentioned_at = db_article.published_at
                    else:
                        if db_article.published_at < book.first_mentioned_at:
                            book.first_mentioned_at = db_article.published_at
                    
                    if book.latest_mention_at is None:
                        book.latest_mention_at = db_article.published_at
                    else:
                        if db_article.published_at > book.latest_mention_at:
                            book.latest_mention_at = db_article.published_at
                    
                    db.add(book)
                    db.commit()
                    total_mentions += 1
            
            time.sleep(0.1)
        
        logger.info(f"データ更新完了: 記事{total_articles_checked}件, 新規言及{total_mentions}件")
        
    except Exception as e:
        logger.error(f"データ更新エラー: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


@router.post("/update-data")
def trigger_data_update(
    background_tasks: BackgroundTasks,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """
    データ更新をトリガー（バックグラウンド実行）
    
    Args:
        days: 過去何日分のデータを取得するか（デフォルト: 7日）
    """
    try:
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        # バックグラウンドタスクとして実行
        background_tasks.add_task(update_data_background, start_date, end_date, db)
        
        return {
            "message": "データ更新を開始しました",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "status": "processing"
        }
    except Exception as e:
        logger.error(f"データ更新のトリガーに失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

