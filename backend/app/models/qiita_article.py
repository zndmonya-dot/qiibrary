"""
Qiita記事関連モデル
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB

from ..database import Base


class QiitaArticle(Base):
    """Qiita記事マスター"""
    
    __tablename__ = 'qiita_articles'
    
    # 主キー
    id = Column(Integer, primary_key=True, index=True)
    
    # Qiita記事情報
    qiita_id = Column(String(100), nullable=False, unique=True, index=True)
    title = Column(String(500), nullable=False)
    url = Column(String(500), nullable=False)
    
    # 著者情報
    author_id = Column(String(200), nullable=False, index=True)
    author_name = Column(String(200))
    
    # タグ情報（JSON配列）
    tags = Column(JSONB, nullable=False, default=list)  # ["Python", "機械学習"]
    
    # 統計情報
    likes_count = Column(Integer, default=0, index=True)
    stocks_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    
    # 書籍言及数（キャッシュ）
    book_mention_count = Column(Integer, default=0)
    
    # 記事公開日時
    published_at = Column(DateTime, nullable=False, index=True)
    
    # タイムスタンプ
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # リレーション
    book_mentions = relationship('BookQiitaMention', back_populates='article', cascade='all, delete-orphan')
    
    # インデックス
    __table_args__ = (
        Index('idx_qiita_articles_tags', tags, postgresql_using='gin'),  # JSON検索用
        Index('idx_qiita_articles_published', 'published_at'),
        Index('idx_qiita_articles_likes', 'likes_count'),
    )
    
    def __repr__(self):
        return f"<QiitaArticle(qiita_id='{self.qiita_id}', title='{self.title}')>"
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'qiita_id': self.qiita_id,
            'title': self.title,
            'url': self.url,
            'author_id': self.author_id,
            'author_name': self.author_name,
            'tags': self.tags,
            'likes_count': self.likes_count,
            'stocks_count': self.stocks_count,
            'comments_count': self.comments_count,
            'book_mention_count': self.book_mention_count,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

