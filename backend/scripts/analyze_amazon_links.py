#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Qiita記事から抽出したAmazonリンクを分析
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import re
from app.database import SessionLocal
from app.models.qiita_article import QiitaArticle
from app.models.book import Book, BookQiitaMention

def analyze_amazon_asin(asin: str):
    """ASINが何か分析"""
    # ISBN-10は10桁の数字（最後がXの場合もある）
    if re.match(r'^\d{9}[\dX]$', asin):
        return 'ISBN-10 (書籍)', True
    # ISBN-13は13桁
    elif re.match(r'^\d{13}$', asin):
        return 'ISBN-13 (書籍)', True
    # B0から始まるのは電子書籍やその他商品
    elif asin.startswith('B0'):
        return 'Kindle/その他', False
    # その他のASIN
    else:
        return '不明なASIN', False

def main():
    db = SessionLocal()
    
    print('=' * 80)
    print('📊 Qiita記事からのAmazonリンク分析')
    print('=' * 80)
    
    # 全Qiita記事を取得
    articles = db.query(QiitaArticle).all()
    
    total_amazon_links = 0
    isbn10_count = 0
    isbn13_count = 0
    kindle_count = 0
    other_count = 0
    
    amazon_patterns = [
        r'amazon\.co\.jp/.*?/dp/([A-Z0-9]{10})',
        r'amazon\.co\.jp/dp/([A-Z0-9]{10})',
        r'amazon\.com/.*?/dp/([A-Z0-9]{10})',
        r'amazon\.com/dp/([A-Z0-9]{10})',
        r'amzn\.to/([A-Z0-9]+)',
    ]
    
    print('\n🔍 記事ごとのAmazonリンク分析...\n')
    
    sample_links = []
    
    for article in articles[:10]:  # 最初の10記事をサンプル分析
        if not article.body_html:
            continue
        
        found_asins = set()
        for pattern in amazon_patterns:
            matches = re.findall(pattern, article.body_html)
            found_asins.update(matches)
        
        if found_asins:
            print(f'記事: {article.title[:60]}...')
            for asin in found_asins:
                total_amazon_links += 1
                asin_type, is_isbn = analyze_amazon_asin(asin)
                print(f'  → ASIN: {asin} ({asin_type})')
                
                if is_isbn:
                    if len(asin) == 10:
                        isbn10_count += 1
                    else:
                        isbn13_count += 1
                    sample_links.append((asin, asin_type, article.url))
                elif asin.startswith('B0'):
                    kindle_count += 1
                else:
                    other_count += 1
            print()
    
    print('=' * 80)
    print('📈 統計サマリー')
    print('=' * 80)
    print(f'合計Amazonリンク: {total_amazon_links} 件')
    print(f'  ├─ ISBN-10 (書籍): {isbn10_count} 件 ({isbn10_count/total_amazon_links*100:.1f}%)' if total_amazon_links > 0 else '  ├─ ISBN-10 (書籍): 0 件')
    print(f'  ├─ ISBN-13 (書籍): {isbn13_count} 件 ({isbn13_count/total_amazon_links*100:.1f}%)' if total_amazon_links > 0 else '  ├─ ISBN-13 (書籍): 0 件')
    print(f'  ├─ Kindle/その他: {kindle_count} 件 ({kindle_count/total_amazon_links*100:.1f}%)' if total_amazon_links > 0 else '  ├─ Kindle/その他: 0 件')
    print(f'  └─ 不明: {other_count} 件 ({other_count/total_amazon_links*100:.1f}%)' if total_amazon_links > 0 else '  └─ 不明: 0 件')
    
    print('\n' + '=' * 80)
    print('💡 Amazon PA-APIなしで取得できる情報')
    print('=' * 80)
    print('''
✅ APIなしで取得可能:
   1. ASIN (URLから抽出)
      - 例: https://www.amazon.co.jp/dp/4297139642 → 4297139642
   
   2. Amazon商品ページURL (ASINから生成)
      - https://www.amazon.co.jp/dp/{ASIN}
   
   3. Amazonアフィリエイトリンク (ASINとアフィリエイトタグで生成)
      - https://www.amazon.co.jp/dp/{ASIN}/?tag={YOUR_TAG}
   
   4. ISBN (ASINが10桁または13桁の数字の場合)
      - 書籍のASINはISBN-10と同じことが多い
      - このISBNで楽天Books APIを検索可能！
''')
    
    print('=' * 80)
    print('❌ Amazon PA-APIが必要な情報')
    print('=' * 80)
    print('''
   1. 商品タイトル
   2. 著者名
   3. 出版社
   4. 発売日
   5. 商品画像URL (Amazonサーバーの画像)
   6. 価格情報
   7. レビュー評価
   8. 商品説明
   
   → これらは楽天Books APIやGoogle Books APIで代替可能！
''')
    
    print('=' * 80)
    print('🚀 改善提案：Amazonリンク → ISBN抽出 → 楽天API')
    print('=' * 80)
    print('''
現在の戦略:
   ❌ Qiita記事本文からISBN抽出 (成功率7.2%)
   
改善案:
   ✅ Qiita記事本文からAmazonリンク抽出
   ✅ AmazonリンクからASIN抽出
   ✅ ASINがISBN形式(10桁/13桁)なら、それをISBNとして使用
   ✅ そのISBNで楽天Books APIを検索
   
期待される効果:
   - より多くの書籍情報を取得できる（Amazonリンクは多い）
   - ISBN抽出の精度向上（URLから確実に取得）
   - 楽天APIでの検索成功率向上
''')
    
    if sample_links:
        print('\n' + '=' * 80)
        print('📚 サンプル: AmazonリンクからISBNを取得')
        print('=' * 80)
        for asin, asin_type, article_url in sample_links[:5]:
            print(f'ASIN/ISBN: {asin} ({asin_type})')
            print(f'記事URL: {article_url}')
            print(f'Amazon URL: https://www.amazon.co.jp/dp/{asin}')
            print(f'→ このISBNで楽天API検索可能！')
            print()
    
    db.close()

if __name__ == '__main__':
    main()

