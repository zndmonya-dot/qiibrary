#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
openBD (Open Bibliographic Data) APIサービス

openBD: https://openbd.jp/
API仕様: https://openbd.jp/

完全無料・無制限で日本の書籍情報を取得できるサービス
"""

import logging
import requests
import time
from typing import Optional, Dict, Any, List
from datetime import datetime, date

from ..config.settings import settings

logger = logging.getLogger(__name__)


def isbn13_to_isbn10(isbn13: str) -> Optional[str]:
    """
    ISBN-13をISBN-10に変換
    
    Args:
        isbn13: 13桁のISBN（978または979で始まる）
        
    Returns:
        10桁のISBN-10、変換できない場合はNone
    """
    # ハイフンとスペースを除去
    isbn13 = isbn13.replace('-', '').replace(' ', '')
    
    # 13桁でない、または978で始まらない場合は変換不可
    if len(isbn13) != 13 or not isbn13.startswith('978'):
        return None
    
    # 978プレフィックスを除いた9桁を取得
    isbn10_base = isbn13[3:12]
    
    # チェックディジットを計算
    check_sum = 0
    for i, digit in enumerate(isbn10_base, start=1):
        check_sum += int(digit) * (11 - i)
    
    check_digit = (11 - (check_sum % 11)) % 11
    
    # チェックディジットが10の場合は'X'
    if check_digit == 10:
        check_digit_str = 'X'
    else:
        check_digit_str = str(check_digit)
    
    return isbn10_base + check_digit_str


class OpenBDService:
    """openBD APIから書籍情報を取得するサービス"""
    
    def __init__(self):
        self.base_url = "https://api.openbd.jp/v1"
        self.timeout = 10
        self.rate_limit_interval = 0.1  # 念のため100msの間隔
        self.last_request_time = None
    
    def _wait_for_rate_limit(self):
        """レート制限を守るための待機（念のため）"""
        if self.last_request_time:
            elapsed = (datetime.now() - self.last_request_time).total_seconds()
            sleep_time = self.rate_limit_interval - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)
        self.last_request_time = datetime.now()
    
    def get_book_by_isbn(self, isbn: str) -> Optional[Dict[str, Any]]:
        """
        ISBNから書籍情報を取得
        
        Args:
            isbn: ISBN-10 or ISBN-13
            
        Returns:
            書籍情報（辞書形式）、見つからない場合はNone
        """
        try:
            self._wait_for_rate_limit()
            
            # ISBNを正規化（ハイフンを除去）
            normalized_isbn = isbn.replace('-', '').replace(' ', '')
            
            # openBD API: GET https://api.openbd.jp/v1/get?isbn={ISBN}
            response = requests.get(
                f"{self.base_url}/get",
                params={'isbn': normalized_isbn},
                timeout=self.timeout
            )
            response.raise_for_status()
            
            data = response.json()
            
            # openBDはリストで返す（複数ISBNに対応）
            if not data or not isinstance(data, list) or len(data) == 0:
                logger.warning(f"openBDで書籍が見つかりません: ISBN={isbn}")
                return None
            
            book_data = data[0]  # 最初の要素を取得
            
            if book_data is None:
                logger.warning(f"openBDで書籍が見つかりません: ISBN={isbn}")
                return None
            
            return self._extract_book_info(book_data, normalized_isbn)
            
        except requests.exceptions.Timeout:
            logger.error(f"openBD API timeout: ISBN={isbn}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"openBD API error: ISBN={isbn}, error={e}")
            return None
    
    def get_books_by_isbns(self, isbns: List[str]) -> List[Optional[Dict[str, Any]]]:
        """
        複数のISBNから書籍情報を一括取得（最大10,000件まで）
        
        Args:
            isbns: ISBNのリスト
            
        Returns:
            書籍情報のリスト（見つからない場合はNone）
        """
        try:
            self._wait_for_rate_limit()
            
            # ISBNを正規化
            normalized_isbns = [isbn.replace('-', '').replace(' ', '') for isbn in isbns]
            
            # openBD API: GET https://api.openbd.jp/v1/get?isbn=ISBN1,ISBN2,...
            isbn_param = ','.join(normalized_isbns)
            
            response = requests.get(
                f"{self.base_url}/get",
                params={'isbn': isbn_param},
                timeout=self.timeout
            )
            response.raise_for_status()
            
            data = response.json()
            
            # 結果をパース
            results = []
            for i, book_data in enumerate(data):
                if book_data is None:
                    results.append(None)
                else:
                    results.append(self._extract_book_info(book_data, normalized_isbns[i]))
            
            return results
            
        except requests.exceptions.Timeout:
            logger.error(f"openBD API timeout: ISBNs={isbns}")
            return [None] * len(isbns)
        except requests.exceptions.RequestException as e:
            logger.error(f"openBD API error: ISBNs={isbns}, error={e}")
            return [None] * len(isbns)
    
    def _extract_book_info(self, book_data: Dict, isbn: str) -> Dict[str, Any]:
        """openBD APIのレスポンスから書籍情報を抽出"""
        
        # openBDのデータ構造:
        # {
        #   "summary": {...},  # 概要情報
        #   "onix": {...},     # ONIX形式の詳細情報
        #   "hanmoto": {...}   # 版元ドットコム情報
        # }
        
        summary = book_data.get('summary', {})
        onix = book_data.get('onix', {})
        hanmoto = book_data.get('hanmoto', {})
        
        # タイトル
        title = summary.get('title', '')
        
        # 著者
        author = summary.get('author', '')
        
        # 出版社
        publisher = summary.get('publisher', '')
        
        # 発売日
        pubdate_str = summary.get('pubdate', '')
        publication_date = None
        if pubdate_str:
            try:
                # 形式: YYYYMMDD
                publication_date = datetime.strptime(pubdate_str, '%Y%m%d').date()
            except ValueError:
                try:
                    # 形式: YYYY-MM-DD
                    publication_date = datetime.strptime(pubdate_str, '%Y-%m-%d').date()
                except ValueError:
                    pass
        
        # 書影URL
        thumbnail_url = summary.get('cover', '')
        
        # 説明文
        description = ''
        
        # ONIXから説明文を取得
        if onix:
            collateds = onix.get('CollateralDetail', {}).get('TextContent', [])
            for collated in collateds:
                text_type = collated.get('TextType', '')
                if text_type in ['02', '03']:  # 02: 短い説明, 03: 長い説明
                    description = collated.get('Text', '')
                    if description:
                        break
        
        # 版元ドットコムから説明文を取得（ONIXにない場合）
        if not description and hanmoto:
            description = hanmoto.get('toji', '') or hanmoto.get('genrecodetrc', '')
        
        # AmazonアフィリエイトURLを生成（ISBN-13の場合は自動的にISBN-10に変換）
        amazon_url = self.generate_amazon_url(isbn)
        amazon_affiliate_url = self.generate_amazon_affiliate_url(isbn)
        
        return {
            'isbn': isbn,
            'title': title,
            'author': author,
            'publisher': publisher,
            'publication_date': publication_date,
            'description': description,
            'thumbnail_url': thumbnail_url,
            'amazon_url': amazon_url,
            'amazon_affiliate_url': amazon_affiliate_url,
            'book_data': {
                'summary': summary,
                'onix': onix,
                'hanmoto': hanmoto,
            }
        }
    
    def generate_amazon_affiliate_url(self, isbn: str, asin: Optional[str] = None) -> str:
        """
        ISBNまたはASINからAmazonアフィリエイトURLを生成
        
        現在の実装（一時的）:
            ISBNベースでURLを生成（ISBN-13の場合は自動的にISBN-10に変換）
            
        将来の実装（Amazon PA-API承認後）:
            Amazon PA-APIから取得したASINとURLを使用
        
        Args:
            isbn: ISBN-10, ISBN-13, or Amazon ASIN
            asin: Amazon ASIN（将来のAmazon PA-API用、現在は未使用）
            
        Returns:
            AmazonアフィリエイトURL
        """
        # 将来的にASINが提供される場合はそれを優先（Amazon PA-API統合後）
        product_id = asin if asin else isbn
        
        # ISBN-13の場合はISBN-10に変換（Amazonは10桁を推奨）
        if not asin and len(product_id.replace('-', '').replace(' ', '')) == 13:
            isbn10 = isbn13_to_isbn10(product_id)
            if isbn10:
                product_id = isbn10
                logger.debug(f"ISBN-13 {isbn} を ISBN-10 {isbn10} に変換")
        
        # Amazon.co.jpのベースURL
        base_url = f"https://www.amazon.co.jp/dp/{product_id}"
        
        # アソシエイトタグが設定されている場合、アフィリエイトリンクを生成
        if settings.AMAZON_ASSOCIATE_TAG:
            # 標準的なアフィリエイトリンク形式
            # ?tag=YOUR_TAG&linkCode=osi&th=1&psc=1
            return f"{base_url}?tag={settings.AMAZON_ASSOCIATE_TAG}&linkCode=osi&th=1&psc=1"
        
        # アソシエイトタグが未設定の場合、通常のURLを返す
        return base_url
    
    def generate_amazon_url(self, isbn: str) -> str:
        """
        ISBNからAmazonの通常URLを生成（アフィリエイトなし）
        
        Args:
            isbn: ISBN-10, ISBN-13, or Amazon ASIN
            
        Returns:
            Amazon商品URL
        """
        product_id = isbn
        
        # ISBN-13の場合はISBN-10に変換（Amazonは10桁を推奨）
        if len(product_id.replace('-', '').replace(' ', '')) == 13:
            isbn10 = isbn13_to_isbn10(product_id)
            if isbn10:
                product_id = isbn10
        
        return f"https://www.amazon.co.jp/dp/{product_id}"


# シングルトンインスタンス
_openbd_service_instance = None


def get_openbd_service() -> OpenBDService:
    """OpenBDServiceのシングルトンインスタンスを取得"""
    global _openbd_service_instance
    if _openbd_service_instance is None:
        _openbd_service_instance = OpenBDService()
    return _openbd_service_instance

