"""Qiita + Rakuten Books対応のデータベーススキーマ

Revision ID: 002
Revises: 
Create Date: 2025-10-18 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ===== qiita_articles テーブル =====
    op.create_table(
        'qiita_articles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('qiita_id', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('author_id', sa.String(length=200), nullable=False),
        sa.Column('author_name', sa.String(length=200), nullable=True),
        sa.Column('tags', JSONB, nullable=False),
        sa.Column('likes_count', sa.Integer(), nullable=True),
        sa.Column('stocks_count', sa.Integer(), nullable=True),
        sa.Column('comments_count', sa.Integer(), nullable=True),
        sa.Column('book_mention_count', sa.Integer(), nullable=True),
        sa.Column('published_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_qiita_articles_author_id'), 'qiita_articles', ['author_id'], unique=False)
    op.create_index(op.f('ix_qiita_articles_id'), 'qiita_articles', ['id'], unique=False)
    op.create_index(op.f('ix_qiita_articles_likes_count'), 'qiita_articles', ['likes_count'], unique=False)
    op.create_index(op.f('ix_qiita_articles_qiita_id'), 'qiita_articles', ['qiita_id'], unique=True)
    op.create_index('idx_qiita_articles_published', 'qiita_articles', ['published_at'], unique=False)
    op.create_index('idx_qiita_articles_tags', 'qiita_articles', ['tags'], unique=False, postgresql_using='gin')

    # ===== books テーブル =====
    op.create_table(
        'books',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('isbn', sa.String(length=20), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('author', sa.String(length=300), nullable=True),
        sa.Column('publisher', sa.String(length=200), nullable=True),
        sa.Column('publication_date', sa.Date(), nullable=True),
        sa.Column('rakuten_data', JSONB, nullable=True),
        sa.Column('amazon_url', sa.String(length=500), nullable=True),
        sa.Column('amazon_affiliate_url', sa.String(length=500), nullable=True),
        sa.Column('rakuten_url', sa.String(length=500), nullable=True),
        sa.Column('rakuten_affiliate_url', sa.String(length=500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('thumbnail_url', sa.String(length=500), nullable=True),
        sa.Column('total_mentions', sa.Integer(), nullable=True),
        sa.Column('latest_mention_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_books_id'), 'books', ['id'], unique=False)
    op.create_index(op.f('ix_books_isbn'), 'books', ['isbn'], unique=True)
    op.create_index('idx_books_latest_mention', 'books', ['latest_mention_at'], unique=False)
    op.create_index('idx_books_mentions', 'books', ['total_mentions'], unique=False)

    # ===== book_qiita_mentions テーブル =====
    op.create_table(
        'book_qiita_mentions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('book_id', sa.Integer(), nullable=False),
        sa.Column('article_id', sa.Integer(), nullable=False),
        sa.Column('mentioned_at', sa.DateTime(), nullable=False),
        sa.Column('extracted_identifier', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['article_id'], ['qiita_articles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_book_qiita_mentions_id'), 'book_qiita_mentions', ['id'], unique=False)
    op.create_index('idx_book_qiita_article', 'book_qiita_mentions', ['article_id', 'mentioned_at'], unique=False)
    op.create_index('idx_book_qiita_book', 'book_qiita_mentions', ['book_id', 'mentioned_at'], unique=False)
    op.create_index('idx_book_qiita_date', 'book_qiita_mentions', ['mentioned_at'], unique=False)

    # ===== book_youtube_links テーブル =====
    op.create_table(
        'book_youtube_links',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('book_id', sa.Integer(), nullable=False),
        sa.Column('youtube_url', sa.String(length=500), nullable=False),
        sa.Column('youtube_video_id', sa.String(length=20), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=True),
        sa.Column('thumbnail_url', sa.String(length=500), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_book_youtube_links_id'), 'book_youtube_links', ['id'], unique=False)
    op.create_index('idx_youtube_links_book', 'book_youtube_links', ['book_id', 'display_order'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_youtube_links_book', table_name='book_youtube_links')
    op.drop_index(op.f('ix_book_youtube_links_id'), table_name='book_youtube_links')
    op.drop_table('book_youtube_links')
    
    op.drop_index('idx_book_qiita_date', table_name='book_qiita_mentions')
    op.drop_index('idx_book_qiita_book', table_name='book_qiita_mentions')
    op.drop_index('idx_book_qiita_article', table_name='book_qiita_mentions')
    op.drop_index(op.f('ix_book_qiita_mentions_id'), table_name='book_qiita_mentions')
    op.drop_table('book_qiita_mentions')
    
    op.drop_index('idx_books_mentions', table_name='books')
    op.drop_index('idx_books_latest_mention', table_name='books')
    op.drop_index(op.f('ix_books_isbn'), table_name='books')
    op.drop_index(op.f('ix_books_id'), table_name='books')
    op.drop_table('books')
    
    op.drop_index('idx_qiita_articles_tags', table_name='qiita_articles', postgresql_using='gin')
    op.drop_index('idx_qiita_articles_published', table_name='qiita_articles')
    op.drop_index(op.f('ix_qiita_articles_qiita_id'), table_name='qiita_articles')
    op.drop_index(op.f('ix_qiita_articles_likes_count'), table_name='qiita_articles')
    op.drop_index(op.f('ix_qiita_articles_id'), table_name='qiita_articles')
    op.drop_index(op.f('ix_qiita_articles_author_id'), table_name='qiita_articles')
    op.drop_table('qiita_articles')

