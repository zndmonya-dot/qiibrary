"""
書籍関連モデル
"""

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, date

from ..database import Base


class Book(Base):
    """書籍マスター"""
    
    __tablename__ = 'books'
    
    # 主キー
    id = Column(Integer, primary_key=True, index=True)
    
    # Amazon情報
    asin = Column(String(10), nullable=False, unique=True, index=True)
    title = Column(String(500), nullable=False)
    author = Column(String(200))
    publisher = Column(String(200))
    publication_date = Column(Date)
    
    # 価格情報
    price = Column(Integer)  # 通常価格（円 or セント）
    sale_price = Column(Integer)  # セール価格
    discount_rate = Column(Integer)  # 割引率（%）
    
    # レビュー情報
    rating = Column(Float)  # 星評価 (0.0 - 5.0)
    review_count = Column(Integer)  # レビュー数
    
    # 画像・URL
    image_url = Column(String(500))
    amazon_url = Column(String(500), nullable=False)
    affiliate_url = Column(String(500), nullable=False)
    
    # 説明文
    description = Column(Text)
    
    # ロケール
    locale = Column(String(2), nullable=False, default='ja', index=True)  # ja/en
    
    # 統計情報（キャッシュ用）
    total_views = Column(Integer, default=0, index=True)
    total_mentions = Column(Integer, default=0, index=True)
    latest_mention_at = Column(DateTime)
    
    # タイムスタンプ
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # リレーション
    mentions = relationship('BookMention', back_populates='book', cascade='all, delete-orphan')
    daily_stats = relationship('BookDailyStat', back_populates='book', cascade='all, delete-orphan')
    
    # インデックス
    __table_args__ = (
        Index('idx_books_locale_views', 'locale', 'total_views'),
        Index('idx_books_locale_mentions', 'locale', 'total_mentions'),
        Index('idx_books_latest_mention', 'latest_mention_at'),
    )
    
    def __repr__(self):
        return f"<Book(asin='{self.asin}', title='{self.title}', locale='{self.locale}')>"
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'asin': self.asin,
            'title': self.title,
            'author': self.author,
            'publisher': self.publisher,
            'publication_date': self.publication_date.isoformat() if self.publication_date else None,
            'price': self.price,
            'sale_price': self.sale_price,
            'discount_rate': self.discount_rate,
            'rating': self.rating,
            'review_count': self.review_count,
            'image_url': self.image_url,
            'amazon_url': self.amazon_url,
            'affiliate_url': self.affiliate_url,
            'description': self.description,
            'locale': self.locale,
            'total_views': self.total_views,
            'total_mentions': self.total_mentions,
            'latest_mention_at': self.latest_mention_at.isoformat() if self.latest_mention_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class BookDailyStat(Base):
    """書籍の日次統計"""
    
    __tablename__ = 'book_daily_stats'
    
    # 主キー
    id = Column(Integer, primary_key=True, index=True)
    
    # 外部キー
    book_id = Column(Integer, ForeignKey('books.id', ondelete='CASCADE'), nullable=False)
    
    # 日付
    date = Column(Date, nullable=False, index=True)
    
    # 日次統計
    daily_views = Column(Integer, default=0)  # その日の再生回数合計
    daily_mentions = Column(Integer, default=0)  # その日の紹介動画数
    
    # タイムスタンプ
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    # リレーション
    book = relationship('Book', back_populates='daily_stats')
    
    # ユニーク制約とインデックス
    __table_args__ = (
        UniqueConstraint('book_id', 'date', name='uq_book_date'),
        Index('idx_stats_date_views', 'date', 'daily_views'),
        Index('idx_stats_book_date', 'book_id', 'date'),
    )
    
    def __repr__(self):
        return f"<BookDailyStat(book_id={self.book_id}, date='{self.date}', views={self.daily_views})>"
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'book_id': self.book_id,
            'date': self.date.isoformat() if self.date else None,
            'daily_views': self.daily_views,
            'daily_mentions': self.daily_mentions,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

