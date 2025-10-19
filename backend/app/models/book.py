"""
書籍関連モデル（Qiita + 楽天ブックス対応）
"""

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB

from ..database import Base


class Book(Base):
    """書籍マスター"""
    
    __tablename__ = 'books'
    
    # 主キー
    id = Column(Integer, primary_key=True, index=True)
    
    # 書籍識別子
    isbn = Column(String(20), nullable=False, unique=True, index=True)  # ISBN-10 or ISBN-13
    
    # 基本情報
    title = Column(String(500), nullable=False)
    author = Column(String(300))
    publisher = Column(String(200))
    publication_date = Column(Date)
    
    # 書籍データ（JSON）- openBDやその他のソースから取得したメタデータ
    book_data = Column(JSONB)
    
    # Amazonリンク
    amazon_url = Column(String(500))
    amazon_affiliate_url = Column(String(500))  # Amazonアフィリエイトリンク
    
    # 書籍説明
    description = Column(Text)
    
    # サムネイル画像
    thumbnail_url = Column(String(500))
    
    # 統計情報（キャッシュ）
    total_mentions = Column(Integer, default=0, index=True)  # Qiita記事での言及数
    first_mentioned_at = Column(DateTime, index=True)  # 初回言及日時（最も古い記事の公開日）
    latest_mention_at = Column(DateTime, index=True)  # 最終言及日時（最も新しい記事の公開日）
    
    # タイムスタンプ
    created_at = Column(DateTime, default=func.now(), nullable=False)  # レコード作成日時
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)  # レコード更新日時
    
    # リレーション
    qiita_mentions = relationship('BookQiitaMention', back_populates='book', cascade='all, delete-orphan')
    youtube_links = relationship('BookYouTubeLink', back_populates='book', cascade='all, delete-orphan')
    
    # インデックス
    __table_args__ = (
        Index('idx_books_mentions', 'total_mentions'),
        Index('idx_books_first_mention', 'first_mentioned_at'),
        Index('idx_books_latest_mention', 'latest_mention_at'),
    )
    
    def __repr__(self):
        return f"<Book(isbn='{self.isbn}', title='{self.title}')>"
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'isbn': self.isbn,
            'title': self.title,
            'author': self.author,
            'publisher': self.publisher,
            'publication_date': self.publication_date.isoformat() if self.publication_date else None,
            'book_data': self.book_data,
            'amazon_url': self.amazon_url,
            'amazon_affiliate_url': self.amazon_affiliate_url,
            'description': self.description,
            'thumbnail_url': self.thumbnail_url,
            'total_mentions': self.total_mentions,
            'first_mentioned_at': self.first_mentioned_at.isoformat() if self.first_mentioned_at else None,
            'latest_mention_at': self.latest_mention_at.isoformat() if self.latest_mention_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class BookQiitaMention(Base):
    """書籍とQiita記事の関連（中間テーブル）"""
    
    __tablename__ = 'book_qiita_mentions'
    
    # 主キー
    id = Column(Integer, primary_key=True, index=True)
    
    # 外部キー
    book_id = Column(Integer, ForeignKey('books.id', ondelete='CASCADE'), nullable=False)
    article_id = Column(Integer, ForeignKey('qiita_articles.id', ondelete='CASCADE'), nullable=False)
    
    # 言及日時（記事の公開日時）
    mentioned_at = Column(DateTime, nullable=False, index=True)
    
    # 抽出された識別子（ISBN、ASIN等）
    extracted_identifier = Column(String(100), nullable=False)
    
    # タイムスタンプ
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    # リレーション
    book = relationship('Book', back_populates='qiita_mentions')
    article = relationship('QiitaArticle', back_populates='book_mentions')
    
    # インデックス
    __table_args__ = (
        Index('idx_book_qiita_book', 'book_id', 'mentioned_at'),
        Index('idx_book_qiita_article', 'article_id', 'mentioned_at'),
        Index('idx_book_qiita_date', 'mentioned_at'),
    )
    
    def __repr__(self):
        return f"<BookQiitaMention(book_id={self.book_id}, article_id={self.article_id})>"


class BookYouTubeLink(Base):
    """書籍とYouTube動画のリンク（手動追加）"""
    
    __tablename__ = 'book_youtube_links'
    
    # 主キー
    id = Column(Integer, primary_key=True, index=True)
    
    # 外部キー
    book_id = Column(Integer, ForeignKey('books.id', ondelete='CASCADE'), nullable=False)
    
    # YouTube動画情報
    youtube_url = Column(String(500), nullable=False)
    youtube_video_id = Column(String(20))  # 動画ID（例: dQw4w9WgXcQ）
    title = Column(String(500))
    thumbnail_url = Column(String(500))
    
    # 表示順序（1, 2, 3）
    display_order = Column(Integer, default=1, nullable=False)
    
    # タイムスタンプ
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # リレーション
    book = relationship('Book', back_populates='youtube_links')
    
    # インデックス
    __table_args__ = (
        Index('idx_youtube_links_book', 'book_id', 'display_order'),
    )
    
    def __repr__(self):
        return f"<BookYouTubeLink(book_id={self.book_id}, youtube_url='{self.youtube_url}')>"

