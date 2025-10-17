"""
YouTube動画関連モデル
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base


class YouTubeVideo(Base):
    """YouTube動画マスター"""
    
    __tablename__ = 'youtube_videos'
    
    # 主キー
    id = Column(Integer, primary_key=True, index=True)
    
    # YouTube情報
    video_id = Column(String(20), nullable=False, unique=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(String(5000))  # 説明文（長い場合がある）
    
    # チャンネル情報
    channel_id = Column(String(50), nullable=False, index=True)
    channel_name = Column(String(200), nullable=False)
    
    # URL
    thumbnail_url = Column(String(500))
    video_url = Column(String(500), nullable=False)
    channel_url = Column(String(500))
    
    # 統計情報
    view_count = Column(Integer, default=0, index=True)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    duration_seconds = Column(Integer)  # 動画長（秒）
    
    # ロケール
    locale = Column(String(2), nullable=False, default='ja', index=True)  # ja/en
    
    # YouTube公開日時
    published_at = Column(DateTime, nullable=False, index=True)
    
    # タイムスタンプ
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # リレーション
    mentions = relationship('BookMention', back_populates='video', cascade='all, delete-orphan')
    
    # インデックス
    __table_args__ = (
        Index('idx_videos_locale_views', 'locale', 'view_count'),
        Index('idx_videos_channel', 'channel_id', 'published_at'),
        Index('idx_videos_published', 'published_at'),
    )
    
    def __repr__(self):
        return f"<YouTubeVideo(video_id='{self.video_id}', title='{self.title}')>"
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'video_id': self.video_id,
            'title': self.title,
            'description': self.description,
            'channel_id': self.channel_id,
            'channel_name': self.channel_name,
            'thumbnail_url': self.thumbnail_url,
            'video_url': self.video_url,
            'channel_url': self.channel_url,
            'view_count': self.view_count,
            'like_count': self.like_count,
            'comment_count': self.comment_count,
            'duration_seconds': self.duration_seconds,
            'locale': self.locale,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class BookMention(Base):
    """書籍と動画の関連（中間テーブル）"""
    
    __tablename__ = 'book_mentions'
    
    # 主キー
    id = Column(Integer, primary_key=True, index=True)
    
    # 外部キー
    book_id = Column(Integer, ForeignKey('books.id', ondelete='CASCADE'), nullable=False)
    video_id = Column(Integer, ForeignKey('youtube_videos.id', ondelete='CASCADE'), nullable=False)
    
    # 言及日時（動画の公開日時と同じ）
    mentioned_at = Column(DateTime, nullable=False, index=True)
    
    # 抽出元URL（デバッグ用）
    extracted_from_url = Column(String(500))
    
    # タイムスタンプ
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    # リレーション
    book = relationship('Book', back_populates='mentions')
    video = relationship('YouTubeVideo', back_populates='mentions')
    
    # ユニーク制約とインデックス
    __table_args__ = (
        UniqueConstraint('book_id', 'video_id', name='uq_book_video'),
        Index('idx_mentions_book', 'book_id', 'mentioned_at'),
        Index('idx_mentions_video', 'video_id', 'mentioned_at'),
        Index('idx_mentions_date', 'mentioned_at'),
    )
    
    def __repr__(self):
        return f"<BookMention(book_id={self.book_id}, video_id={self.video_id})>"
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'book_id': self.book_id,
            'video_id': self.video_id,
            'mentioned_at': self.mentioned_at.isoformat() if self.mentioned_at else None,
            'extracted_from_url': self.extracted_from_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

