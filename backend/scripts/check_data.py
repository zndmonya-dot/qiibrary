#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
データベースの内容を確認するスクリプト
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.book import Book, BookQiitaMention
from app.models.qiita_article import QiitaArticle

def main():
    db = SessionLocal()
    
    print('=' * 80)
    print('データベース統計')
    print('=' * 80)
    print(f'書籍数: {db.query(Book).count()} 件')
    print(f'Qiita記事数: {db.query(QiitaArticle).count()} 件')
    print(f'書籍-記事関連数: {db.query(BookQiitaMention).count()} 件')
    
    print('\n' + '=' * 80)
    print('楽天APIで取得できた書籍（トップ10）')
    print('=' * 80)
    books = db.query(Book).filter(~Book.title.like('書籍 %')).order_by(Book.total_mentions.desc()).limit(10).all()
    
    for i, book in enumerate(books, 1):
        print(f'\n{i}. {book.title}')
        print(f'   ISBN: {book.isbn}')
        print(f'   著者: {book.author or "不明"}')
        print(f'   出版社: {book.publisher or "不明"}')
        print(f'   言及数: {book.total_mentions} 件')
        
        # この書籍を言及している記事を表示
        mentions = db.query(BookQiitaMention, QiitaArticle)\
            .join(QiitaArticle, BookQiitaMention.article_id == QiitaArticle.id)\
            .filter(BookQiitaMention.book_id == book.id)\
            .all()
        
        if mentions:
            print(f'   関連記事:')
            for mention, article in mentions:
                print(f'     - {article.title[:50]}... (いいね: {article.likes_count})')
    
    print('\n' + '=' * 80)
    print('統計')
    print('=' * 80)
    rakuten_count = db.query(Book).filter(~Book.title.like('書籍 %')).count()
    not_found_count = db.query(Book).filter(Book.title.like('書籍 %')).count()
    print(f'楽天APIで取得できた書籍: {rakuten_count} 件')
    print(f'楽天APIで見つからなかった書籍: {not_found_count} 件')
    print(f'成功率: {rakuten_count / (rakuten_count + not_found_count) * 100:.1f}%')
    
    db.close()

if __name__ == '__main__':
    main()

