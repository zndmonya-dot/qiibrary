#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
アフィリエイトリンク生成のテスト
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
from app.config.settings import settings
from app.services.rakuten_books_service import get_rakuten_books_service

logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_affiliate_links():
    """アフィリエイトリンク生成のテスト"""
    
    print('=' * 80)
    print('📊 アフィリエイトリンク生成テスト')
    print('=' * 80)
    
    # 環境変数の確認
    print('\n1️⃣ 環境変数の確認')
    print('-' * 80)
    print(f'Amazon Associate Tag: {settings.AMAZON_ASSOCIATE_TAG if settings.AMAZON_ASSOCIATE_TAG else "❌ 未設定"}')
    print(f'Rakuten Affiliate ID: {settings.RAKUTEN_AFFILIATE_ID if settings.RAKUTEN_AFFILIATE_ID else "❌ 未設定"}')
    
    if not settings.AMAZON_ASSOCIATE_TAG:
        print('\n⚠️  警告: AMAZON_ASSOCIATE_TAGが設定されていません')
        print('   .envファイルに以下を追加してください:')
        print('   AMAZON_ASSOCIATE_TAG=your-tag-22')
    
    if not settings.RAKUTEN_AFFILIATE_ID:
        print('\n⚠️  警告: RAKUTEN_AFFILIATE_IDが設定されていません')
        print('   .envファイルに以下を追加してください:')
        print('   RAKUTEN_AFFILIATE_ID=1234abcd.5678efgh.1234abcd.9012ijkl')
    
    # テスト用ISBN
    test_isbns = [
        ("9784297139643", "実践TypeScript 〜 BFFとNext.js & Nuxt.jsの型定義〜"),
        ("9784775991855", "Python3ではじめるシステムトレード第2版"),
        ("9784873119809", "実践Rust入門"),
    ]
    
    print('\n\n2️⃣ 楽天Books API経由でアフィリエイトリンク生成')
    print('-' * 80)
    
    service = get_rakuten_books_service()
    
    for isbn, expected_title in test_isbns:
        print(f'\n📚 ISBN: {isbn}')
        print(f'   期待タイトル: {expected_title}')
        
        # 楽天Books APIで書籍情報取得
        book_info = service.get_book_by_isbn(isbn)
        
        if book_info:
            print(f'   ✅ 楽天API: 取得成功')
            print(f'   タイトル: {book_info["title"][:60]}...' if len(book_info["title"]) > 60 else f'   タイトル: {book_info["title"]}')
            print(f'   著者: {book_info.get("author", "不明")}')
            print(f'   出版社: {book_info.get("publisher", "不明")}')
            
            # Amazon URL
            amazon_url = service.generate_amazon_url(isbn)
            print(f'\n   🔗 Amazon URL (通常):')
            print(f'      {amazon_url}')
            
            # Amazonアフィリエイト
            amazon_affiliate = service.generate_amazon_affiliate_url(isbn)
            print(f'\n   💰 Amazon アフィリエイトリンク:')
            print(f'      {amazon_affiliate}')
            
            if settings.AMAZON_ASSOCIATE_TAG and settings.AMAZON_ASSOCIATE_TAG in amazon_affiliate:
                print(f'      ✅ アソシエイトタグが含まれています')
            else:
                print(f'      ❌ アソシエイトタグが含まれていません')
            
            # 楽天URL
            print(f'\n   🔗 楽天 URL (通常):')
            print(f'      {book_info.get("rakuten_url", "なし")}')
            
            # 楽天アフィリエイト
            print(f'\n   💰 楽天 アフィリエイトリンク:')
            print(f'      {book_info.get("rakuten_affiliate_url", "なし")[:100]}...' if book_info.get("rakuten_affiliate_url") and len(book_info.get("rakuten_affiliate_url")) > 100 else f'      {book_info.get("rakuten_affiliate_url", "なし")}')
            
            if settings.RAKUTEN_AFFILIATE_ID and book_info.get("rakuten_affiliate_url"):
                affiliate_parts = settings.RAKUTEN_AFFILIATE_ID.split('.')
                if all(part in book_info["rakuten_affiliate_url"] for part in affiliate_parts):
                    print(f'      ✅ アフィリエイトIDが含まれています')
                else:
                    print(f'      ❌ アフィリエイトIDが含まれていません')
            else:
                print(f'      ❌ アフィリエイトリンク未生成')
            
        else:
            print(f'   ❌ 楽天API: 取得失敗（この書籍は楽天ブックスにない可能性があります）')
    
    print('\n\n3️⃣ 将来のAmazon PA-API統合について')
    print('-' * 80)
    print('''
現在の実装（一時的）:
  ✅ ISBNベースでAmazonアフィリエイトリンク生成
  ✅ 楽天Books APIで書籍情報取得
  ✅ すぐに収益化開始可能

将来の実装（Amazon PA-API承認後）:
  ⭐ Amazon PA-APIで正確な書籍情報とASIN取得
  ⭐ より詳細な商品情報（在庫状況、価格変動など）
  ⭐ 楽天Books APIはフォールバックとして使用
  ⭐ 収益性の向上

移行手順:
  1. サイトを公開してトラフィックを集める
  2. Amazon PA-APIを申請（審査には実績が必要）
  3. 承認後、amazon_pa_api_service.pyを実装
  4. 既存のrakuten_books_service.pyと統合
    ''')
    
    print('\n' + '=' * 80)
    print('✅ テスト完了')
    print('=' * 80)
    
    if settings.AMAZON_ASSOCIATE_TAG and settings.RAKUTEN_AFFILIATE_ID:
        print('✅ アフィリエイト設定は正常です！')
    else:
        print('⚠️  アフィリエイト設定が不完全です。')
        print('   backend/.envファイルを確認してください。')
        print('   詳細: backend/docs/AFFILIATE_SETUP.md を参照')

if __name__ == '__main__':
    test_affiliate_links()

