"""
Google Books API サービス

Amazon APIの代替として、Google Books APIから書籍情報を取得します。
- APIキー不要（推奨はあり）
- 無料で即利用可能
- ISBNやASINから書籍情報を検索
"""

import requests
import logging
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class GoogleBooksService:
    """Google Books APIから書籍情報を取得するサービス"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Args:
            api_key: Google Books API Key（オプション。なくても動作するが、レート制限が緩くなる）
        """
        self.api_key = api_key
        self.base_url = "https://www.googleapis.com/books/v1/volumes"
        
    def get_book_info(self, identifier: str, locale: str = 'ja') -> Optional[Dict[str, Any]]:
        """
        ISBN/ASINから書籍情報を取得
        
        Args:
            identifier: ISBN-10、ISBN-13、またはASIN
            locale: 'ja' または 'en'
            
        Returns:
            書籍情報の辞書、見つからない場合はNone
        """
        try:
            # Google Books APIで検索
            params = {
                'q': f'isbn:{identifier}',
                'langRestrict': 'ja' if locale == 'ja' else 'en',
            }
            
            if self.api_key:
                params['key'] = self.api_key
            
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('totalItems', 0) == 0:
                logger.info(f"Google Books: {identifier} が見つかりませんでした")
                return None
            
            # 最初の結果を取得
            item = data['items'][0]
            volume_info = item.get('volumeInfo', {})
            
            # 書籍情報を抽出
            book_info = self._extract_book_info(identifier, volume_info, locale)
            
            logger.info(f"Google Books: '{book_info['title']}' の情報を取得")
            return book_info
            
        except requests.exceptions.Timeout:
            logger.error(f"Google Books API timeout for {identifier}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Google Books API error for {identifier}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in Google Books API: {e}")
            return None
    
    def _extract_book_info(self, identifier: str, volume_info: Dict, locale: str) -> Dict[str, Any]:
        """Google Books APIのレスポンスから書籍情報を抽出"""
        
        # タイトル
        title = volume_info.get('title', f'Book {identifier}')
        subtitle = volume_info.get('subtitle')
        if subtitle:
            title = f"{title}: {subtitle}"
        
        # 著者（複数の場合はカンマ区切り）
        authors = volume_info.get('authors', [])
        author = ', '.join(authors) if authors else None
        
        # 出版社
        publisher = volume_info.get('publisher')
        
        # 出版日（タイムゾーンなし）
        published_date_str = volume_info.get('publishedDate')
        publication_date = None
        if published_date_str:
            try:
                # "YYYY-MM-DD", "YYYY-MM", "YYYY" の形式に対応
                if len(published_date_str) == 4:  # YYYY
                    publication_date = datetime.strptime(published_date_str, '%Y').replace(tzinfo=None)
                elif len(published_date_str) == 7:  # YYYY-MM
                    publication_date = datetime.strptime(published_date_str, '%Y-%m').replace(tzinfo=None)
                else:  # YYYY-MM-DD
                    publication_date = datetime.strptime(published_date_str, '%Y-%m-%d').replace(tzinfo=None)
            except ValueError:
                pass
        
        # 画像URL（大きいサイズを優先）
        image_links = volume_info.get('imageLinks', {})
        image_url = (
            image_links.get('extraLarge') or
            image_links.get('large') or
            image_links.get('medium') or
            image_links.get('thumbnail') or
            f"https://placehold.co/400x600/1a1a1a/white?text={identifier[:8]}"
        )
        
        # 説明
        description = volume_info.get('description')
        
        # 評価（Google Booksには詳細な評価がない）
        average_rating = volume_info.get('averageRating')
        ratings_count = volume_info.get('ratingsCount')
        
        # Amazon URLを構築
        domain = 'amazon.co.jp' if locale == 'ja' else 'amazon.com'
        amazon_url = f"https://www.{domain}/dp/{identifier}"
        
        return {
            'asin': identifier,
            'title': title,
            'author': author,
            'publisher': publisher,
            'publication_date': publication_date,
            'price': None,  # Google Books APIでは価格情報が限定的
            'sale_price': None,
            'discount_rate': None,
            'rating': average_rating,
            'review_count': ratings_count,
            'image_url': image_url,
            'description': description,
            'amazon_url': amazon_url,
            'affiliate_url': amazon_url,  # アフィリエイトタグは後で追加可能
            'locale': locale,
        }


# シングルトンインスタンス
_google_books_service: Optional[GoogleBooksService] = None


def get_google_books_service() -> GoogleBooksService:
    """Google Books Serviceのシングルトンインスタンスを取得"""
    global _google_books_service
    
    if _google_books_service is None:
        # settings.pyから設定を読み込む（オプション）
        try:
            from app.config.settings import settings
            api_key = getattr(settings, 'GOOGLE_BOOKS_API_KEY', None)
        except:
            api_key = None
        
        _google_books_service = GoogleBooksService(api_key=api_key)
    
    return _google_books_service

