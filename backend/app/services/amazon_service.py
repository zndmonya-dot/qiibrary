"""
Amazon Product Advertising API v5 サービス
書籍情報の取得
"""

import logging
from typing import List, Dict, Optional
from datetime import datetime, date
from amazon.paapi import AmazonAPI

from ..config import settings

logger = logging.getLogger(__name__)


class AmazonService:
    """Amazon Product Advertising API クライアント"""
    
    def __init__(
        self,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        partner_tag: Optional[str] = None,
        region: Optional[str] = None,
    ):
        """
        Amazon PA-API クライアント初期化
        
        Args:
            access_key: AWS Access Key
            secret_key: AWS Secret Key
            partner_tag: アソシエイトタグ
            region: リージョン (jp/us/uk/de/fr/it/ca/es/in/br/mx/au)
        """
        self.access_key = access_key or settings.AMAZON_ACCESS_KEY
        self.secret_key = secret_key or settings.AMAZON_SECRET_KEY
        self.partner_tag = partner_tag or settings.AMAZON_ASSOCIATE_TAG
        self.region = region or settings.AMAZON_REGION
        
        # API クライアント初期化
        try:
            self.api = AmazonAPI(
                access_key=self.access_key,
                secret_key=self.secret_key,
                tag=self.partner_tag,
                region=self.region,
            )
            logger.info(f"Amazon PA-API 初期化成功 (region: {self.region})")
        except Exception as e:
            logger.error(f"Amazon PA-API 初期化エラー: {e}")
            self.api = None
    
    def get_product_info(self, asin: str, locale: str = "ja") -> Optional[Dict]:
        """
        ASINから商品情報を取得
        
        Args:
            asin: Amazon ASIN
            locale: ロケール (ja/en)
        
        Returns:
            商品情報の辞書 or None
        """
        if not self.api:
            logger.error("Amazon API が初期化されていません")
            return None
        
        try:
            # ロケールに応じてリージョンを設定
            region = "jp" if locale == "ja" else "us"
            
            # 商品情報取得
            product = self.api.get_items(
                item_ids=[asin],
                resources=[
                    'Images.Primary.Large',
                    'ItemInfo.Title',
                    'ItemInfo.ByLineInfo',
                    'ItemInfo.ContentInfo',
                    'ItemInfo.Classifications',
                    'ItemInfo.ManufactureInfo',
                    'ItemInfo.ProductInfo',
                    'ItemInfo.Features',
                    'Offers.Listings.Price',
                    'Offers.Listings.SavingBasis',
                    'CustomerReviews.StarRating',
                    'CustomerReviews.Count',
                ],
            )
            
            if not product or not product.items:
                logger.warning(f"商品が見つかりません: {asin}")
                return None
            
            item = product.items[0]
            
            # 商品情報を抽出
            info = self._parse_product_item(item, asin, locale)
            
            logger.info(f"商品情報取得成功: {asin} - {info.get('title', 'N/A')}")
            return info
        
        except Exception as e:
            logger.error(f"商品情報取得エラー: {asin} - {e}")
            return None
    
    def get_multiple_products(
        self,
        asins: List[str],
        locale: str = "ja"
    ) -> Dict[str, Dict]:
        """
        複数のASINの商品情報を一括取得
        
        Args:
            asins: ASINのリスト（最大10件）
            locale: ロケール
        
        Returns:
            {asin: product_info} の辞書
        """
        if not self.api:
            return {}
        
        results = {}
        
        # PA-APIは最大10件まで同時取得可能
        for i in range(0, len(asins), 10):
            batch = asins[i:i+10]
            
            try:
                region = "jp" if locale == "ja" else "us"
                
                products = self.api.get_items(
                    item_ids=batch,
                    resources=[
                        'Images.Primary.Large',
                        'ItemInfo.Title',
                        'ItemInfo.ByLineInfo',
                        'ItemInfo.ContentInfo',
                        'ItemInfo.Classifications',
                        'ItemInfo.ManufactureInfo',
                        'ItemInfo.ProductInfo',
                        'ItemInfo.Features',
                        'Offers.Listings.Price',
                        'Offers.Listings.SavingBasis',
                        'CustomerReviews.StarRating',
                        'CustomerReviews.Count',
                    ],
                )
                
                if products and products.items:
                    for item in products.items:
                        asin = item.asin
                        info = self._parse_product_item(item, asin, locale)
                        results[asin] = info
            
            except Exception as e:
                logger.error(f"一括取得エラー: {batch} - {e}")
                continue
        
        logger.info(f"一括取得完了: {len(results)}/{len(asins)}件")
        return results
    
    def _parse_product_item(self, item, asin: str, locale: str) -> Dict:
        """PA-APIのレスポンスアイテムを解析"""
        try:
            # 基本情報
            title = self._get_attr(item, 'item_info.title.display_value', 'Unknown Title')
            
            # 著者情報
            contributors = self._get_attr(item, 'item_info.by_line_info.contributors', [])
            authors = []
            for contributor in contributors:
                if hasattr(contributor, 'name'):
                    authors.append(contributor.name)
            author = ', '.join(authors) if authors else None
            
            # 出版社
            publisher = self._get_attr(
                item,
                'item_info.by_line_info.manufacturer.display_value',
                None
            )
            
            # 発売日
            publication_date_str = self._get_attr(
                item,
                'item_info.content_info.publication_date.display_value',
                None
            )
            publication_date = self._parse_date(publication_date_str)
            
            # 画像
            image_url = self._get_attr(
                item,
                'images.primary.large.url',
                f'https://m.media-amazon.com/images/P/{asin}.jpg'
            )
            
            # 価格情報
            price = None
            sale_price = None
            discount_rate = None
            
            if hasattr(item, 'offers') and item.offers and item.offers.listings:
                listing = item.offers.listings[0]
                
                # 通常価格
                if hasattr(listing, 'price'):
                    price_obj = listing.price
                    if hasattr(price_obj, 'amount'):
                        price = int(price_obj.amount)
                
                # セール価格
                if hasattr(listing, 'saving_basis'):
                    saving_basis = listing.saving_basis
                    if hasattr(saving_basis, 'amount'):
                        original_price = int(saving_basis.amount)
                        if price and price < original_price:
                            sale_price = price
                            price = original_price
                            discount_rate = int(((original_price - sale_price) / original_price) * 100)
            
            # レビュー情報
            rating = None
            review_count = None
            
            if hasattr(item, 'customer_reviews'):
                reviews = item.customer_reviews
                if hasattr(reviews, 'star_rating'):
                    rating_str = reviews.star_rating.value
                    # "4.5 out of 5 stars" -> 4.5
                    rating = float(rating_str.split()[0])
                
                if hasattr(reviews, 'count'):
                    review_count = reviews.count
            
            # 説明文（Features）
            features = self._get_attr(item, 'item_info.features.display_values', [])
            description = ' '.join(features) if features else None
            
            # Amazon URL
            amazon_domain = "amazon.co.jp" if locale == "ja" else "amazon.com"
            amazon_url = f"https://www.{amazon_domain}/dp/{asin}"
            
            # アフィリエイトURL
            affiliate_tag = settings.AMAZON_ASSOCIATE_TAG
            affiliate_url = f"{amazon_url}?tag={affiliate_tag}"
            
            return {
                "asin": asin,
                "title": title,
                "author": author,
                "publisher": publisher,
                "publication_date": publication_date,
                "price": price,
                "sale_price": sale_price,
                "discount_rate": discount_rate,
                "rating": rating,
                "review_count": review_count,
                "image_url": image_url,
                "description": description,
                "amazon_url": amazon_url,
                "affiliate_url": affiliate_url,
                "locale": locale,
            }
        
        except Exception as e:
            logger.error(f"商品データ解析エラー: {asin} - {e}")
            return {
                "asin": asin,
                "title": "Unknown",
                "locale": locale,
            }
    
    def _get_attr(self, obj, path: str, default=None):
        """ネストされた属性を安全に取得"""
        try:
            attrs = path.split('.')
            value = obj
            for attr in attrs:
                value = getattr(value, attr, None)
                if value is None:
                    return default
            return value
        except:
            return default
    
    def _parse_date(self, date_str: Optional[str]) -> Optional[date]:
        """日付文字列をdateオブジェクトに変換"""
        if not date_str:
            return None
        
        try:
            # "YYYY-MM-DD" 形式
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        except:
            try:
                # "YYYY-MM-DD" 以外の形式も試す
                return datetime.fromisoformat(date_str).date()
            except:
                return None


# シングルトンインスタンス
_amazon_service_ja = None
_amazon_service_en = None


def get_amazon_service(locale: str = "ja") -> AmazonService:
    """AmazonServiceのシングルトンインスタンスを取得"""
    global _amazon_service_ja, _amazon_service_en
    
    if locale == "ja":
        if _amazon_service_ja is None:
            _amazon_service_ja = AmazonService(region="jp")
        return _amazon_service_ja
    else:
        if _amazon_service_en is None:
            _amazon_service_en = AmazonService(region="us")
        return _amazon_service_en

