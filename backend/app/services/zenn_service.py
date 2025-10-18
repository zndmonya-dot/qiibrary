"""
Zenn APIから書籍情報と記事情報を取得するサービス

参考:
- Books API: https://zenn.dev/api/books?order=latest&count=50
- Articles API: https://zenn.dev/api/articles?order=daily&count=50
"""

import logging
import requests
import time
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class ZennService:
    """Zenn APIから書籍情報と記事情報を取得するサービス"""
    
    def __init__(self):
        self.base_url = "https://zenn.dev/api"
        self.timeout = 15
    
    def get_books(
        self, 
        order: str = "latest",
        max_results: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Zenn Booksを取得
        
        Args:
            order: 並び順 ('latest', 'liked' など)
            max_results: 最大取得件数
            
        Returns:
            書籍情報の辞書のリスト
        """
        all_books = []
        page = 1
        
        try:
            while len(all_books) < max_results:
                params = {
                    'order': order,
                    'count': min(50, max_results - len(all_books)),
                    'page': page
                }
                
                response = requests.get(
                    f"{self.base_url}/books",
                    params=params,
                    timeout=self.timeout
                )
                response.raise_for_status()
                
                data = response.json()
                books = data.get('books', [])
                
                if not books:
                    break
                
                for book in books:
                    book_info = self._extract_book_info(book)
                    all_books.append(book_info)
                
                # 次のページがなければ終了
                if 'next_page' not in data or data['next_page'] is None:
                    break
                
                page = data['next_page']
                
                # レート制限対策
                time.sleep(0.5)
            
            logger.info(f"✓ Zenn Books: {len(all_books)} 冊取得")
            return all_books[:max_results]
            
        except requests.exceptions.Timeout:
            logger.error("Zenn Books API timeout")
            return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Zenn Books API error: {e}")
            return []
    
    def get_trending_articles(
        self,
        order: str = "daily",
        max_results: int = 50,
        article_type: str = "tech"
    ) -> List[Dict[str, Any]]:
        """
        Zennのトレンド記事を取得
        
        Args:
            order: 並び順 ('daily', 'weekly', 'liked' など)
            max_results: 最大取得件数
            article_type: 記事タイプ ('tech', 'idea', または None で全て)
            
        Returns:
            記事情報の辞書のリスト
        """
        all_articles = []
        page = 1
        
        try:
            while len(all_articles) < max_results:
                params = {
                    'order': order,
                    'count': min(50, max_results - len(all_articles)),
                    'page': page
                }
                
                if article_type:
                    params['article_type'] = article_type
                
                response = requests.get(
                    f"{self.base_url}/articles",
                    params=params,
                    timeout=self.timeout
                )
                response.raise_for_status()
                
                data = response.json()
                articles = data.get('articles', [])
                
                if not articles:
                    break
                
                for article in articles:
                    article_info = self._extract_article_info(article)
                    all_articles.append(article_info)
                
                # 次のページがなければ終了
                if 'next_page' not in data or data['next_page'] is None:
                    break
                
                page = data['next_page']
                
                # レート制限対策
                time.sleep(0.5)
            
            logger.info(f"✓ Zenn Articles: {len(all_articles)} 件取得 (order: {order})")
            return all_articles[:max_results]
            
        except requests.exceptions.Timeout:
            logger.error("Zenn Articles API timeout")
            return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Zenn Articles API error: {e}")
            return []
    
    def _extract_book_info(self, book_data: Dict) -> Dict[str, Any]:
        """Zenn Books APIのレスポンスから書籍情報を抽出"""
        
        # 出版日
        published_at_str = book_data.get('published_at')
        published_at = None
        if published_at_str:
            try:
                # ISO 8601形式のパース
                published_at = datetime.fromisoformat(published_at_str.replace('Z', '+00:00'))
                published_at = published_at.replace(tzinfo=None)  # タイムゾーンなし
            except ValueError:
                pass
        
        # ユーザー情報
        user = book_data.get('user', {})
        username = user.get('username', 'unknown')
        
        # Zenn BookのslugをASINの代わりに使用
        book_slug = book_data.get('slug', '')
        book_id = f"zenn_{book_slug}"  # プレフィックスを追加してZenn Booksと識別
        
        # Zenn Books URL
        book_path = book_data.get('path', f"/{username}/books/{book_slug}")
        zenn_url = f"https://zenn.dev{book_path}"
        
        # 画像URL
        cover_image = book_data.get('cover_image_small_url') or book_data.get('cover_image_url')
        
        return {
            'asin': book_id,  # ZennのslugをASIN代わりに使用
            'title': book_data.get('title', ''),
            'author': user.get('name') or user.get('username'),
            'publisher': 'Zenn',
            'publication_date': published_at,
            'price': book_data.get('price', 0),
            'sale_price': None,
            'discount_rate': None,
            'rating': None,
            'review_count': None,
            'image_url': cover_image,
            'description': None,  # Books APIからは詳細説明は取得できない
            'amazon_url': None,  # Zenn BooksはAmazonにはない
            'affiliate_url': zenn_url,  # Zenn URLをアフィリエイトリンクとして使用
            'zenn_url': zenn_url,
            'liked_count': book_data.get('liked_count', 0),
            'locale': 'ja',  # Zennは日本語のみ
        }
    
    def _extract_article_info(self, article_data: Dict) -> Dict[str, Any]:
        """Zenn Articles APIのレスポンスから記事情報を抽出"""
        
        # 出版日
        published_at_str = article_data.get('published_at')
        published_at = None
        if published_at_str:
            try:
                published_at = datetime.fromisoformat(published_at_str.replace('Z', '+00:00'))
                published_at = published_at.replace(tzinfo=None)
            except ValueError:
                pass
        
        # ユーザー情報
        user = article_data.get('user', {})
        username = user.get('username', 'unknown')
        
        # 記事のslug
        article_slug = article_data.get('slug', '')
        
        # 記事URL
        article_path = article_data.get('path', f"/{username}/articles/{article_slug}")
        article_url = f"https://zenn.dev{article_path}"
        
        return {
            'article_id': f"article_{article_slug}",
            'title': article_data.get('title', ''),
            'slug': article_slug,
            'author': user.get('name') or user.get('username'),
            'username': username,
            'avatar_url': user.get('avatar_small_url'),
            'article_type': article_data.get('article_type', 'tech'),
            'emoji': article_data.get('emoji'),
            'published_at': published_at,
            'liked_count': article_data.get('liked_count', 0),
            'bookmarked_count': article_data.get('bookmarked_count', 0),
            'comments_count': article_data.get('comments_count', 0),
            'body_letters_count': article_data.get('body_letters_count', 0),
            'article_url': article_url,
            'locale': 'ja',
        }


# シングルトンインスタンス
_zenn_service_instance = None


def get_zenn_service() -> ZennService:
    """ZennServiceのシングルトンインスタンスを取得"""
    global _zenn_service_instance
    if _zenn_service_instance is None:
        _zenn_service_instance = ZennService()
    return _zenn_service_instance

