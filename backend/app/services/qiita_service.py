"""
Qiita APIから記事情報を取得し、書籍情報を抽出するサービス
"""

import logging
import requests
import time
import re
from typing import List, Dict, Any, Optional, Set
from datetime import datetime
from bs4 import BeautifulSoup

from ..config.settings import settings

logger = logging.getLogger(__name__)


class QiitaService:
    """Qiita APIから記事情報を取得するサービス"""
    
    def __init__(self):
        self.base_url = "https://qiita.com/api/v2"
        self.token = settings.QIITA_API_TOKEN
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        self.timeout = 15
        self.rate_limit_interval = 3.6  # 1000リクエスト/時間 = 3.6秒/リクエスト
        self.last_request_time = None
    
    def _wait_for_rate_limit(self):
        """レート制限を守るための待機"""
        if self.last_request_time:
            elapsed = (datetime.now() - self.last_request_time).total_seconds()
            sleep_time = self.rate_limit_interval - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)
        self.last_request_time = datetime.now()
    
    def get_articles_by_tag(
        self,
        tag: str,
        max_results: int = 5000,
        per_page: int = 100
    ) -> List[Dict[str, Any]]:
        """
        指定タグの記事を取得
        
        Args:
            tag: タグ名（例: "Python", "JavaScript"）
            max_results: 最大取得件数
            per_page: 1リクエストあたりの取得件数（最大100）
            
        Returns:
            記事情報のリスト
        """
        all_articles = []
        page = 1
        
        try:
            while len(all_articles) < max_results:
                self._wait_for_rate_limit()
                
                params = {
                    'page': page,
                    'per_page': min(per_page, 100),
                    'query': f'tag:{tag}'
                }
                
                response = requests.get(
                    f"{self.base_url}/items",
                    headers=self.headers,
                    params=params,
                    timeout=self.timeout
                )
                response.raise_for_status()
                
                articles = response.json()
                
                if not articles:
                    break
                
                for article in articles:
                    article_info = self._extract_article_info(article)
                    all_articles.append(article_info)
                
                logger.info(f"✓ Tag '{tag}': {len(all_articles)} 件取得（Page {page}）")
                
                # 最大100ページまで
                if page >= 100 or len(articles) < per_page:
                    break
                
                page += 1
            
            logger.info(f"✓ Tag '{tag}': 合計 {len(all_articles)} 件取得完了")
            return all_articles[:max_results]
            
        except requests.exceptions.Timeout:
            logger.error(f"Qiita API timeout for tag: {tag}")
            return all_articles
        except requests.exceptions.RequestException as e:
            logger.error(f"Qiita API error for tag '{tag}': {e}")
            return all_articles
    
    def get_article_body(self, article_id: str) -> Optional[str]:
        """
        記事の本文を取得
        
        Args:
            article_id: Qiita記事ID
            
        Returns:
            記事本文（Markdown）
        """
        try:
            self._wait_for_rate_limit()
            
            response = requests.get(
                f"{self.base_url}/items/{article_id}",
                headers=self.headers,
                timeout=self.timeout
            )
            response.raise_for_status()
            
            data = response.json()
            return data.get('body', '')
            
        except requests.exceptions.RequestException as e:
            logger.error(f"記事本文取得エラー (id: {article_id}): {e}")
            return None
    
    def _extract_article_info(self, article_data: Dict) -> Dict[str, Any]:
        """Qiita APIのレスポンスから記事情報を抽出"""
        
        # 公開日時
        created_at_str = article_data.get('created_at')
        created_at = None
        if created_at_str:
            try:
                created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                created_at = created_at.replace(tzinfo=None)
            except ValueError:
                pass
        
        # ユーザー情報
        user = article_data.get('user', {})
        
        # タグ情報
        tags = [tag.get('name') for tag in article_data.get('tags', [])]
        
        return {
            'qiita_id': article_data.get('id', ''),
            'title': article_data.get('title', ''),
            'url': article_data.get('url', ''),
            'author_id': user.get('id', ''),
            'author_name': user.get('name') or user.get('id'),
            'tags': tags,
            'likes_count': article_data.get('likes_count', 0),
            'stocks_count': article_data.get('stocks_count', 0),
            'comments_count': article_data.get('comments_count', 0),
            'published_at': created_at,
            'body': article_data.get('body', ''),  # 本文も含める
        }
    
    def extract_book_references(self, body: str) -> Set[str]:
        """
        記事本文からAmazonリンクの書籍識別子（ISBN-10/ASIN）を抽出
        
        ※仕様：Amazonリンクのみを検知（ISBNの直接記述は無視）
        
        Args:
            body: 記事本文（Markdown）
            
        Returns:
            抽出された識別子のセット（Amazon ISBN-10/ASIN 10桁のみ）
        """
        references = set()
        
        if not body:
            return references
        
        # AmazonリンクからASIN/ISBNを抽出（10桁の英数字のみ）
        # 対応パターン:
        # - https://www.amazon.co.jp/dp/4297139642/
        # - https://www.amazon.co.jp/gp/product/4297139642/
        # - https://amazon.co.jp/exec/obidos/ASIN/4297139642/
        # - https://www.amazon.co.jp/書籍名/dp/4297139642/ref=...
        # - https://amzn.to/xxxxx や https://amzn.asia/d/xxxxx
        amazon_patterns = [
            r'amazon\.co\.jp/[^\s]*?/dp/([A-Z0-9]{10})',       # 標準dpリンク
            r'amazon\.co\.jp/dp/([A-Z0-9]{10})',               # 短縮dpリンク
            r'amazon\.co\.jp/gp/product/([A-Z0-9]{10})',       # 商品ページリンク
            r'amazon\.co\.jp/exec/obidos/ASIN/([A-Z0-9]{10})', # 旧形式
            r'amazon\.com/[^\s]*?/dp/([A-Z0-9]{10})',          # US版
            r'amazon\.com/dp/([A-Z0-9]{10})',
            r'amazon\.com/gp/product/([A-Z0-9]{10})',
            r'amzn\.to/([A-Za-z0-9]{7,})',                     # 短縮URL (7文字以上)
            r'amzn\.asia/d/([A-Za-z0-9]{7,})',                 # Asia短縮URL
        ]
        
        for pattern in amazon_patterns:
            for match in re.finditer(pattern, body, re.IGNORECASE):
                identifier = match.group(1)
                # 10桁の英数字（ISBN-10またはASIN）のみを受け入れる
                if len(identifier) == 10 and re.match(r'^[A-Z0-9]{10}$', identifier, re.IGNORECASE):
                    references.add(identifier.upper())
                # 短縮URLの場合は7文字以上でも受け入れる（ASINの可能性）
                elif 'amzn' in pattern and len(identifier) >= 7:
                    # 注: 短縮URLは実際のASINに解決する必要があるが、
                    # 簡易実装として10桁のみを対象とする
                    if len(identifier) == 10:
                        references.add(identifier.upper())
        
        return references
    
    def get_articles_with_book_references(
        self,
        tag: str,
        max_articles: int = 5000
    ) -> List[Dict[str, Any]]:
        """
        書籍への言及がある記事を取得
        
        Args:
            tag: タグ名
            max_articles: 最大取得記事数
            
        Returns:
            記事情報のリスト（book_referencesキーに抽出された書籍識別子を含む）
        """
        # 記事一覧を取得
        articles = self.get_articles_by_tag(tag, max_results=max_articles)
        
        articles_with_books = []
        
        for article in articles:
            # 本文から書籍情報を抽出
            body = article.get('body', '')
            book_refs = self.extract_book_references(body)
            
            if book_refs:
                article['book_references'] = list(book_refs)
                articles_with_books.append(article)
                logger.info(f"✓ 記事「{article['title']}」から書籍 {len(book_refs)} 件抽出")
        
        logger.info(f"書籍言及記事: {len(articles_with_books)} / {len(articles)} 件")
        return articles_with_books


# シングルトンインスタンス
_qiita_service_instance = None


def get_qiita_service() -> QiitaService:
    """QiitaServiceのシングルトンインスタンスを取得"""
    global _qiita_service_instance
    if _qiita_service_instance is None:
        _qiita_service_instance = QiitaService()
    return _qiita_service_instance

