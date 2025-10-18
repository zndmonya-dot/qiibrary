#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
抽出されたISBN/ASINを分析
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import re
from app.database import SessionLocal
from app.models.book import Book, BookQiitaMention

def analyze_identifier(identifier: str):
    """識別子が何か分析"""
    # ISBN-10は10桁の数字（最後がXの場合もある）
    if re.match(r'^\d{9}[\dX]$', identifier):
        return 'ISBN-10 (Amazon ASINとして使用可能)', True, 10
    # ISBN-13は13桁
    elif re.match(r'^\d{13}$', identifier):
        return 'ISBN-13', True, 13
    # B0から始まるのは電子書籍やその他商品
    elif identifier.startswith('B0'):
        return 'Amazon ASIN (Kindle/その他)', False, len(identifier)
    # 楽天ブックスID
    elif identifier.startswith('rakuten_rb'):
        return '楽天ブックスID', False, len(identifier)
    # その他
    else:
        return f'不明 (長さ{len(identifier)})', False, len(identifier)

def main():
    db = SessionLocal()
    
    print('=' * 80)
    print('📊 Qiita記事から抽出されたISBN/ASIN分析')
    print('=' * 80)
    
    # 全書籍を取得
    all_books = db.query(Book).all()
    
    # 抽出された識別子を分析
    isbn10_count = 0
    isbn13_count = 0
    amazon_asin_count = 0
    rakuten_count = 0
    unknown_count = 0
    
    # 楽天APIで成功/失敗
    rakuten_success = 0
    rakuten_failed = 0
    
    print(f'\n合計書籍数: {len(all_books)} 件\n')
    
    print('=' * 80)
    print('📋 サンプル: 抽出された識別子')
    print('=' * 80)
    
    for book in all_books[:20]:  # 最初の20件をサンプル表示
        identifier_type, is_isbn, length = analyze_identifier(book.isbn)
        
        # 楽天API成功判定
        is_rakuten_success = not book.title.startswith('書籍 ')
        
        status = '✅' if is_rakuten_success else '❌'
        print(f'{status} {book.isbn:20s} → {identifier_type:40s} | {book.title[:50]}')
        
        # 統計カウント
        if length == 10 and is_isbn:
            isbn10_count += 1
        elif length == 13 and is_isbn:
            isbn13_count += 1
        elif identifier_type.startswith('Amazon ASIN'):
            amazon_asin_count += 1
        elif identifier_type.startswith('楽天'):
            rakuten_count += 1
        else:
            unknown_count += 1
        
        if is_rakuten_success:
            rakuten_success += 1
        else:
            rakuten_failed += 1
    
    # 全書籍の統計
    for book in all_books[20:]:
        identifier_type, is_isbn, length = analyze_identifier(book.isbn)
        is_rakuten_success = not book.title.startswith('書籍 ')
        
        if length == 10 and is_isbn:
            isbn10_count += 1
        elif length == 13 and is_isbn:
            isbn13_count += 1
        elif identifier_type.startswith('Amazon ASIN'):
            amazon_asin_count += 1
        elif identifier_type.startswith('楽天'):
            rakuten_count += 1
        else:
            unknown_count += 1
        
        if is_rakuten_success:
            rakuten_success += 1
        else:
            rakuten_failed += 1
    
    total = len(all_books)
    
    print('\n' + '=' * 80)
    print('📈 識別子タイプ別統計')
    print('=' * 80)
    print(f'ISBN-10 (Amazon ASIN可能): {isbn10_count:4d} 件 ({isbn10_count/total*100:5.1f}%)')
    print(f'ISBN-13:                   {isbn13_count:4d} 件 ({isbn13_count/total*100:5.1f}%)')
    print(f'Amazon ASIN (Kindle等):    {amazon_asin_count:4d} 件 ({amazon_asin_count/total*100:5.1f}%)')
    print(f'楽天ブックスID:            {rakuten_count:4d} 件 ({rakuten_count/total*100:5.1f}%)')
    print(f'不明:                      {unknown_count:4d} 件 ({unknown_count/total*100:5.1f}%)')
    print(f'─' * 80)
    print(f'合計:                      {total:4d} 件')
    
    print('\n' + '=' * 80)
    print('📈 楽天Books API検索結果')
    print('=' * 80)
    print(f'✅ 成功 (書籍情報取得):    {rakuten_success:4d} 件 ({rakuten_success/total*100:5.1f}%)')
    print(f'❌ 失敗 (ダミーデータ):    {rakuten_failed:4d} 件 ({rakuten_failed/total*100:5.1f}%)')
    print(f'─' * 80)
    print(f'合計:                      {total:4d} 件')
    
    print('\n' + '=' * 80)
    print('💡 Amazon PA-APIなしで取得できる情報')
    print('=' * 80)
    print('''
✅ APIなしで取得可能:
   1. ✅ ASIN/ISBN (Qiita記事から抽出済み)
      - ISBN-10: URLやリンクから抽出
      - ISBN-13: 記事本文から抽出
   
   2. ✅ Amazon商品ページURL (ASINから生成可能)
      - 例: https://www.amazon.co.jp/dp/{ASIN}
   
   3. ✅ Amazonアフィリエイトリンク (ASINとタグで生成)
      - 例: https://www.amazon.co.jp/dp/{ASIN}/?tag={YOUR_TAG}
''')
    
    print('=' * 80)
    print('❌ Amazon PA-APIが必要な情報 → 楽天APIで代替中')
    print('=' * 80)
    print('''
   ❌ 商品タイトル     → ✅ 楽天Books APIで取得中 ({rakuten_success}件成功)
   ❌ 著者名           → ✅ 楽天Books APIで取得中
   ❌ 出版社           → ✅ 楽天Books APIで取得中
   ❌ 発売日           → ✅ 楽天Books APIで取得中
   ❌ 商品画像URL      → ✅ 楽天Books APIで取得中
   ❌ 価格情報         → ✅ 楽天Books APIで取得中
   ❌ レビュー評価     → ✅ 楽天Books APIで取得中
   ❌ 商品説明         → ✅ 楽天Books APIで取得中
   
   → Amazon PA-API不要！楽天APIで完全代替可能！
'''.format(rakuten_success=rakuten_success))
    
    print('=' * 80)
    print('🚀 楽天API成功率を上げる方法')
    print('=' * 80)
    print(f'''
現在の成功率: {rakuten_success/total*100:.1f}% ({rakuten_success}/{total}件)

失敗する理由:
   1. 洋書（英語のISBN） - 楽天ブックスJPには登録なし
   2. 廃版・絶版の書籍
   3. 電子書籍専用（紙の本なし）
   4. ISBN抽出ミス
   5. 楽天取り扱いなし

改善策:
   ✅ 本番データ収集（5000件×2タグ）で成功率向上
   ✅ Google Books APIをフォールバック追加
   ✅ OpenBD APIをフォールバック追加（日本の書籍に強い）
   ✅ ISBN-10とISBN-13の相互変換を実装
''')
    
    db.close()

if __name__ == '__main__':
    main()

