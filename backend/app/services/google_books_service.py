"""
Google Books APIサービス
"""

import logging
import requests
import time
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)


class GoogleBooksService:
    """Google Books APIから書籍情報を取得するサービス"""
    
    def __init__(self):
        self.base_url = "https://www.googleapis.com/books/v1/volumes"
        self.timeout = 10
        self.last_request_time = 0
        self.min_request_interval = 0.1  # 100ms間隔（秒間10リクエスト）
    
    def _wait_for_rate_limit(self):
        """レート制限のための待機"""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        
        if time_since_last_request < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last_request
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    def get_book_by_isbn(self, isbn: str) -> Optional[Dict[str, Any]]:
        """
        ISBNから書籍情報を取得（サムネイルと説明文）
        
        Args:
            isbn: ISBN-10 or ISBN-13
            
        Returns:
            書籍情報（辞書形式）、見つからない場合はNone
        """
        try:
            self._wait_for_rate_limit()
            
            # ISBNを正規化（ハイフンを除去）
            normalized_isbn = isbn.replace('-', '').replace(' ', '')
            
            # Google Books API: ISBNで検索
            response = requests.get(
                self.base_url,
                params={'q': f'isbn:{normalized_isbn}'},
                timeout=self.timeout
            )
            response.raise_for_status()
            
            data = response.json()
            
            # 検索結果がない場合
            if data.get('totalItems', 0) == 0:
                logger.debug(f"Google Booksで書籍が見つかりません: ISBN={isbn}")
                return None
            
            # 最初の検索結果を取得
            book = data['items'][0]
            volume_info = book.get('volumeInfo', {})
            
            return self._extract_book_info(volume_info, normalized_isbn)
            
        except requests.exceptions.Timeout:
            logger.error(f"Google Books API timeout: ISBN={isbn}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Google Books API error: ISBN={isbn}, error={e}")
            return None
    
    def _extract_book_info(self, volume_info: Dict, isbn: str) -> Dict[str, Any]:
        """Google Books APIのレスポンスから書籍情報を抽出"""
        
        # サムネイル画像
        image_links = volume_info.get('imageLinks', {})
        thumbnail_url = ''
        
        # 優先順位: thumbnail > smallThumbnail
        if image_links.get('thumbnail'):
            thumbnail_url = image_links['thumbnail']
            # HTTPSに変換（Google BooksはHTTPで返すことがある）
            thumbnail_url = thumbnail_url.replace('http://', 'https://')
        elif image_links.get('smallThumbnail'):
            thumbnail_url = image_links['smallThumbnail']
            thumbnail_url = thumbnail_url.replace('http://', 'https://')
        
        # 説明文
        description = volume_info.get('description', '')
        
        # タイトル（補完用）
        title = volume_info.get('title', '')
        
        # 著者（補完用）
        authors = volume_info.get('authors', [])
        author = ', '.join(authors) if authors else ''
        
        # 出版社（補完用）
        publisher = volume_info.get('publisher', '')
        
        # 発売日（補完用）
        published_date_str = volume_info.get('publishedDate', '')
        publication_date = None
        if published_date_str:
            try:
                # 形式: YYYY-MM-DD または YYYY-MM または YYYY
                if len(published_date_str) == 4:  # YYYY
                    publication_date = datetime.strptime(published_date_str, '%Y').date()
                elif len(published_date_str) == 7:  # YYYY-MM
                    publication_date = datetime.strptime(published_date_str, '%Y-%m').date()
                else:  # YYYY-MM-DD
                    publication_date = datetime.strptime(published_date_str, '%Y-%m-%d').date()
            except ValueError:
                pass
        
        return {
            'isbn': isbn,
            'title': title,
            'author': author,
            'publisher': publisher,
            'publication_date': publication_date,
            'description': description,
            'thumbnail_url': thumbnail_url,
        }
    
    def get_books_by_isbns(self, isbns: List[str]) -> List[Optional[Dict[str, Any]]]:
        """
        複数のISBNから書籍情報を一括取得
        
        Args:
            isbns: ISBNのリスト
            
        Returns:
            書籍情報のリスト（見つからない場合はNone）
        """
        results = []
        
        for isbn in isbns:
            book_info = self.get_book_by_isbn(isbn)
            results.append(book_info)
        
        return results


# シングルトンインスタンス
_google_books_service = None


def get_google_books_service() -> GoogleBooksService:
    """Google Books Serviceのシングルトンインスタンスを取得"""
    global _google_books_service
    
    if _google_books_service is None:
        _google_books_service = GoogleBooksService()
    
    return _google_books_service

