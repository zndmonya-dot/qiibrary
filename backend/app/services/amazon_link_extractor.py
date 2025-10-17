"""
Amazonリンク抽出サービス
YouTube動画の説明欄からAmazonリンクを抽出し、ASINを取得
"""

import re
import logging
from typing import List, Dict, Optional, Set
from urllib.parse import urlparse, parse_qs
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class AmazonLinkExtractor:
    """Amazonリンク抽出クラス"""
    
    # Amazon ドメイン
    AMAZON_DOMAINS = [
        'amazon.co.jp',
        'amazon.com',
        'amazon.co.uk',
        'amazon.de',
        'amazon.fr',
        'amazon.ca',
        'amazon.it',
        'amazon.es',
        'amazon.in',
        'amazon.com.br',
        'amazon.com.mx',
        'amazon.com.au',
    ]
    
    # 短縮URL ドメイン
    SHORT_URL_DOMAINS = [
        'amzn.to',
        'amzn.asia',
        'a.co',
    ]
    
    # ASIN パターン（10文字の英数字）
    ASIN_PATTERN = re.compile(r'[A-Z0-9]{10}')
    
    def __init__(self):
        self.http_client = httpx.Client(
            follow_redirects=True,
            timeout=10.0,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        )
    
    def extract_amazon_info(self, text: str) -> List[Dict[str, str]]:
        """
        テキストからAmazon商品情報を抽出
        
        Args:
            text: 検索対象のテキスト（動画説明文など）
        
        Returns:
            [{"asin": "...", "locale": "ja", "url": "..."}] のリスト
        """
        results = []
        seen_asins = set()
        
        # 1. 標準的なAmazon URLを検索
        for match in re.finditer(r'https?://[^\s]+', text):
            url = match.group(0)
            info = self._parse_amazon_url(url)
            
            if info and info['asin'] not in seen_asins:
                results.append(info)
                seen_asins.add(info['asin'])
        
        # 2. 短縮URLを検索して展開
        for match in re.finditer(r'https?://(?:' + '|'.join(re.escape(d) for d in self.SHORT_URL_DOMAINS) + r')/[^\s]+', text):
            short_url = match.group(0)
            info = self._resolve_short_url(short_url)
            
            if info and info['asin'] not in seen_asins:
                results.append(info)
                seen_asins.add(info['asin'])
        
        logger.info(f"抽出完了: {len(results)}件のAmazon商品")
        return results
    
    def _parse_amazon_url(self, url: str) -> Optional[Dict[str, str]]:
        """
        Amazon URLからASINとロケールを抽出
        
        Args:
            url: Amazon URL
        
        Returns:
            {"asin": "...", "locale": "ja/en", "url": "..."} or None
        """
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower().replace('www.', '')
            
            # Amazonドメインチェック
            if not any(d in domain for d in self.AMAZON_DOMAINS):
                return None
            
            # ロケール判定
            locale = "ja" if "amazon.co.jp" in domain else "en"
            
            # パスからASINを抽出
            # パターン: /dp/ASIN, /gp/product/ASIN, /ASIN/ など
            path = parsed.path
            
            # dp/ または gp/product/ のパターン
            dp_match = re.search(r'/(dp|gp/product)/([A-Z0-9]{10})', path)
            if dp_match:
                asin = dp_match.group(2)
                return {
                    "asin": asin,
                    "locale": locale,
                    "url": url,
                }
            
            # /ASIN/ の直接パターン
            direct_match = re.search(r'/([A-Z0-9]{10})(?:/|$|\?)', path)
            if direct_match:
                asin = direct_match.group(1)
                return {
                    "asin": asin,
                    "locale": locale,
                    "url": url,
                }
            
            return None
        
        except Exception as e:
            logger.warning(f"URL解析エラー: {url} - {e}")
            return None
    
    def _resolve_short_url(self, short_url: str) -> Optional[Dict[str, str]]:
        """
        短縮URLを展開してASINを取得
        
        Args:
            short_url: 短縮URL (amzn.to/xxx など)
        
        Returns:
            {"asin": "...", "locale": "ja/en", "url": "..."} or None
        """
        try:
            logger.info(f"短縮URL展開中: {short_url}")
            
            # HTTPリクエストでリダイレクトを追跡
            response = self.http_client.get(short_url)
            
            if response.status_code == 200:
                final_url = str(response.url)
                return self._parse_amazon_url(final_url)
            
            return None
        
        except Exception as e:
            logger.warning(f"短縮URL展開エラー: {short_url} - {e}")
            return None
    
    def extract_asins_from_videos(self, videos: List[Dict]) -> Dict[str, List[str]]:
        """
        複数の動画からASINを抽出し、ASIN -> video_ids のマッピングを作成
        
        Args:
            videos: 動画情報のリスト
        
        Returns:
            {asin: [video_id1, video_id2, ...]} の辞書
        """
        asin_to_videos = {}
        
        for video in videos:
            video_id = video.get('video_id')
            description = video.get('description', '')
            
            amazon_items = self.extract_amazon_info(description)
            
            for item in amazon_items:
                asin = item['asin']
                if asin not in asin_to_videos:
                    asin_to_videos[asin] = {
                        'video_ids': [],
                        'locale': item['locale'],
                        'sample_url': item['url'],
                    }
                asin_to_videos[asin]['video_ids'].append(video_id)
        
        logger.info(f"全動画から {len(asin_to_videos)} 件のユニークな書籍を発見")
        return asin_to_videos
    
    def validate_asin(self, asin: str) -> bool:
        """
        ASINの形式が正しいか検証
        
        Args:
            asin: ASIN
        
        Returns:
            True if valid
        """
        if not asin or len(asin) != 10:
            return False
        
        return bool(self.ASIN_PATTERN.match(asin))
    
    def __del__(self):
        """クリーンアップ"""
        try:
            self.http_client.close()
        except:
            pass


# シングルトンインスタンス
_extractor = None


def get_amazon_link_extractor() -> AmazonLinkExtractor:
    """AmazonLinkExtractorのシングルトンインスタンスを取得"""
    global _extractor
    if _extractor is None:
        _extractor = AmazonLinkExtractor()
    return _extractor

