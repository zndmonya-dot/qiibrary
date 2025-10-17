"""
Amazon Product Advertising API v5 統合サービス

書籍情報（タイトル、著者、価格、画像など）を取得
"""

from typing import Optional, Dict, Any
import logging
from datetime import datetime

try:
    from amazon.paapi import AmazonAPI
except ImportError:
    AmazonAPI = None

from app.config import settings

logger = logging.getLogger(__name__)


class AmazonService:
    """Amazon Product Advertising API クライアント"""
    
    def __init__(
        self,
        access_key: str = None,
        secret_key: str = None,
        associate_tag: str = None,
        region: str = 'JP'
    ):
        """
        初期化
        
        Args:
            access_key: AWS Access Key
            secret_key: AWS Secret Key
            associate_tag: Amazon Associate Tag
            region: リージョン ('JP' または 'US')
        """
        self.access_key = access_key or settings.AMAZON_ACCESS_KEY
        self.secret_key = secret_key or settings.AMAZON_SECRET_KEY
        self.associate_tag = associate_tag or settings.AMAZON_ASSOCIATE_TAG
        self.region = region
        
        # API クライアント初期化（ライブラリがインストールされている場合）
        if AmazonAPI and not self._is_dummy_credentials():
            try:
                self.client = AmazonAPI(
                    key=self.access_key,
                    secret=self.secret_key,
                    tag=self.associate_tag,
                    country=region
                )
                self.enabled = True
                logger.info(f"Amazon API initialized for region: {region}")
            except Exception as e:
                logger.warning(f"Failed to initialize Amazon API: {e}")
                self.client = None
                self.enabled = False
        else:
            self.client = None
            self.enabled = False
            if self._is_dummy_credentials():
                logger.info("Amazon API: Using dummy credentials (demo mode)")
    
    def _is_dummy_credentials(self) -> bool:
        """ダミー認証情報かどうかを判定"""
        return (
            'dummy' in self.access_key.lower() or
            'dummy' in self.secret_key.lower()
        )
    
    async def get_book_info(self, asin: str, locale: str = 'ja') -> Optional[Dict[str, Any]]:
        """
        ASINから書籍情報を取得
        
        Args:
            asin: Amazon ASIN
            locale: ロケール ('ja' または 'en')
        
        Returns:
            書籍情報の辞書、エラー時はNone
        """
        # リージョン設定
        region = 'JP' if locale == 'ja' else 'US'
        domain = 'amazon.co.jp' if locale == 'ja' else 'amazon.com'
        
        # Amazon API が有効な場合は実際のデータを取得
        if self.enabled and self.client:
            try:
                return await self._fetch_from_api(asin, region, domain)
            except Exception as e:
                logger.error(f"Amazon API error for ASIN {asin}: {e}")
                # エラー時はフォールバック
                return self._create_fallback_book_info(asin, domain, locale)
        else:
            # デモモード：最低限の情報を返す
            return self._create_fallback_book_info(asin, domain, locale)
    
    async def _fetch_from_api(self, asin: str, region: str, domain: str) -> Optional[Dict[str, Any]]:
        """Amazon APIから実際のデータを取得"""
        try:
            # API呼び出し
            response = self.client.get_items(
                item_ids=[asin],
                resources=[
                    'ItemInfo.Title',
                    'ItemInfo.ByLineInfo',
                    'ItemInfo.ContentInfo',
                    'ItemInfo.ProductInfo',
                    'Images.Primary.Large',
                    'Offers.Listings.Price',
                    'Offers.Listings.SavingBasis',
                ]
            )
            
            if not response or not response.items:
                logger.warning(f"No data returned from Amazon API for ASIN: {asin}")
                return None
            
            item = response.items[0]
            
            # 書籍情報を抽出
            book_info = {
                'asin': asin,
                'title': self._extract_title(item),
                'author': self._extract_author(item),
                'publisher': self._extract_publisher(item),
                'publication_date': self._extract_publication_date(item),
                'price': self._extract_price(item),
                'sale_price': self._extract_sale_price(item),
                'discount_rate': self._calculate_discount_rate(item),
                'rating': self._extract_rating(item),
                'review_count': self._extract_review_count(item),
                'image_url': self._extract_image_url(item),
                'description': self._extract_description(item),
                'amazon_url': f"https://www.{domain}/dp/{asin}",
                'affiliate_url': f"https://www.{domain}/dp/{asin}?tag={self.associate_tag}",
                'locale': 'ja' if region == 'JP' else 'en',
            }
            
            return book_info
            
        except Exception as e:
            logger.error(f"Error fetching from Amazon API: {e}")
            raise
    
    def _create_fallback_book_info(self, asin: str, domain: str, locale: str) -> Dict[str, Any]:
        """フォールバック用の書籍情報を生成"""
        return {
            'asin': asin,
            'title': f"Book {asin}",
            'author': None,
            'publisher': None,
            'publication_date': None,
            'price': None,
            'sale_price': None,
            'discount_rate': None,
            'rating': None,
            'review_count': None,
            'image_url': f"https://m.media-amazon.com/images/I/{asin}.jpg",
            'description': None,
            'amazon_url': f"https://www.{domain}/dp/{asin}",
            'affiliate_url': f"https://www.{domain}/dp/{asin}?tag={self.associate_tag}",
            'locale': locale,
        }
    
    # データ抽出ヘルパーメソッド
    def _extract_title(self, item) -> Optional[str]:
        """タイトルを抽出"""
        try:
            return item.item_info.title.display_value
        except (AttributeError, KeyError):
            return None
    
    def _extract_author(self, item) -> Optional[str]:
        """著者を抽出"""
        try:
            contributors = item.item_info.by_line_info.contributors
            if contributors:
                return ', '.join([c.name for c in contributors])
        except (AttributeError, KeyError):
            pass
        return None
    
    def _extract_publisher(self, item) -> Optional[str]:
        """出版社を抽出"""
        try:
            return item.item_info.by_line_info.manufacturer.display_value
        except (AttributeError, KeyError):
            return None
    
    def _extract_publication_date(self, item) -> Optional[datetime]:
        """発売日を抽出"""
        try:
            date_str = item.item_info.content_info.publication_date.display_value
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except (AttributeError, KeyError, ValueError):
            return None
    
    def _extract_price(self, item) -> Optional[int]:
        """通常価格を抽出"""
        try:
            return int(item.offers.listings[0].price.amount)
        except (AttributeError, KeyError, IndexError, ValueError):
            return None
    
    def _extract_sale_price(self, item) -> Optional[int]:
        """セール価格を抽出"""
        try:
            saving_basis = item.offers.listings[0].saving_basis
            if saving_basis:
                return int(saving_basis.amount)
        except (AttributeError, KeyError, IndexError, ValueError):
            pass
        return None
    
    def _calculate_discount_rate(self, item) -> Optional[int]:
        """割引率を計算"""
        try:
            price = self._extract_price(item)
            sale_price = self._extract_sale_price(item)
            if price and sale_price and sale_price < price:
                return int(((price - sale_price) / price) * 100)
        except:
            pass
        return None
    
    def _extract_rating(self, item) -> Optional[float]:
        """評価を抽出"""
        try:
            return float(item.customer_reviews.star_rating.value)
        except (AttributeError, KeyError, ValueError):
            return None
    
    def _extract_review_count(self, item) -> Optional[int]:
        """レビュー数を抽出"""
        try:
            return int(item.customer_reviews.count)
        except (AttributeError, KeyError, ValueError):
            return None
    
    def _extract_image_url(self, item) -> Optional[str]:
        """画像URLを抽出"""
        try:
            return item.images.primary.large.url
        except (AttributeError, KeyError):
            # フォールバックとしてASINから画像URLを生成
            try:
                asin = item.asin
                return f"https://m.media-amazon.com/images/I/{asin}.jpg"
            except:
                return None
    
    def _extract_description(self, item) -> Optional[str]:
        """説明を抽出"""
        try:
            features = item.item_info.features.display_values
            if features:
                return '\n'.join(features)
        except (AttributeError, KeyError):
            pass
        return None


# グローバルインスタンス（日本用）
amazon_service_jp = AmazonService(region='JP')

# グローバルインスタンス（US用）
amazon_service_us = AmazonService(region='US')


def get_amazon_service(locale: str = 'ja') -> AmazonService:
    """ロケールに応じたAmazonServiceインスタンスを取得"""
    return amazon_service_jp if locale == 'ja' else amazon_service_us
