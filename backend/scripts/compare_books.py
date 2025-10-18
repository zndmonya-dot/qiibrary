#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
表示される書籍と表示されない書籍の違いを比較
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.book import Book

def main():
    db = SessionLocal()
    
    print('=' * 80)
    print('✅ 表示される書籍（楽天APIで取得成功）')
    print('=' * 80)
    success_book = db.query(Book).filter(~Book.title.like('書籍 %')).first()
    
    if success_book:
        print(f'タイトル: {success_book.title}')
        print(f'ISBN: {success_book.isbn}')
        print(f'著者: {success_book.author}')
        print(f'出版社: {success_book.publisher}')
        print(f'発売日: {success_book.publication_date}')
        print(f'画像URL: {success_book.thumbnail_url}')
        print(f'Amazon URL: {success_book.amazon_url}')
        print(f'楽天 URL: {success_book.rakuten_url}')
        print(f'楽天アフィリエイトURL: {success_book.rakuten_affiliate_url[:80]}...' if success_book.rakuten_affiliate_url and len(success_book.rakuten_affiliate_url) > 80 else success_book.rakuten_affiliate_url)
        print(f'説明: {success_book.description[:100] if success_book.description else None}...')
        print(f'楽天データ: {success_book.rakuten_data}')
    
    print('\n' + '=' * 80)
    print('❌ 表示されない書籍（楽天APIで見つからず）')
    print('=' * 80)
    fail_book = db.query(Book).filter(Book.title.like('書籍 %')).first()
    
    if fail_book:
        print(f'タイトル: {fail_book.title}')
        print(f'ISBN: {fail_book.isbn}')
        print(f'著者: {fail_book.author}')
        print(f'出版社: {fail_book.publisher}')
        print(f'発売日: {fail_book.publication_date}')
        print(f'画像URL: {fail_book.thumbnail_url}')
        print(f'Amazon URL: {fail_book.amazon_url}')
        print(f'楽天 URL: {fail_book.rakuten_url}')
        print(f'楽天アフィリエイトURL: {fail_book.rakuten_affiliate_url}')
        print(f'説明: {fail_book.description}')
        print(f'楽天データ: {fail_book.rakuten_data}')
    
    print('\n' + '=' * 80)
    print('違いの原因')
    print('=' * 80)
    print('''
✅ 楽天APIで取得できた書籍:
   - 楽天ブックスデータベースにISBNが存在
   - 正確な書籍情報（タイトル、著者、画像等）を取得
   - 価格やレビュー情報も取得可能
   
❌ 楽天APIで取得できなかった書籍:
   - 以下のいずれかの理由で楽天ブックスに存在しない:
     1. 洋書（海外のISBN）
     2. 廃版・絶版の書籍
     3. Qiita記事からのISBN抽出ミス
     4. 電子書籍専用で紙の本として登録されていない
     5. 楽天ブックスの取り扱いがない出版社
   - ダミーデータとして保存（「書籍 {ISBN}」）
   - 画像なし（プレースホルダー表示）
    ''')
    
    print('\n' + '=' * 80)
    print('統計')
    print('=' * 80)
    success_count = db.query(Book).filter(~Book.title.like('書籍 %')).count()
    fail_count = db.query(Book).filter(Book.title.like('書籍 %')).count()
    total = success_count + fail_count
    
    print(f'成功: {success_count} 件 ({success_count/total*100:.1f}%)')
    print(f'失敗: {fail_count} 件 ({fail_count/total*100:.1f}%)')
    print(f'合計: {total} 件')
    
    db.close()

if __name__ == '__main__':
    main()

