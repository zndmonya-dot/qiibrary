"""
検索キーワード関連モデル
"""

from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.sql import func

from ..database import Base


class SearchKeyword(Base):
    """検索キーワード履歴"""
    
    __tablename__ = 'search_keywords'
    
    # 主キー
    id = Column(Integer, primary_key=True, index=True)
    
    # キーワード情報
    keyword = Column(String(200), nullable=False, index=True)
    category = Column(String(50))  # general, languages, frameworks, etc.
    locale = Column(String(2), nullable=False, default='ja', index=True)  # ja/en
    
    # 検索結果
    videos_found = Column(Integer, default=0)  # 検索で見つかった動画数
    books_found = Column(Integer, default=0)   # 抽出された書籍数
    
    # 最終検索日時
    last_searched_at = Column(DateTime, default=func.now(), nullable=False, index=True)
    
    # 検索回数
    search_count = Column(Integer, default=1)
    
    # タイムスタンプ
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # インデックス
    __table_args__ = (
        Index('idx_keywords_locale_searched', 'locale', 'last_searched_at'),
        Index('idx_keywords_category', 'category', 'locale'),
    )
    
    def __repr__(self):
        return f"<SearchKeyword(keyword='{self.keyword}', locale='{self.locale}')>"
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'keyword': self.keyword,
            'category': self.category,
            'locale': self.locale,
            'videos_found': self.videos_found,
            'books_found': self.books_found,
            'last_searched_at': self.last_searched_at.isoformat() if self.last_searched_at else None,
            'search_count': self.search_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

