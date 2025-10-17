"""Initial schema with sliding window rankings

Revision ID: 001
Revises: 
Create Date: 2024-10-17 21:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Books テーブル
    op.create_table(
        'books',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('asin', sa.String(length=10), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('author', sa.String(length=200), nullable=True),
        sa.Column('publisher', sa.String(length=200), nullable=True),
        sa.Column('publication_date', sa.Date(), nullable=True),
        sa.Column('price', sa.Integer(), nullable=True),
        sa.Column('sale_price', sa.Integer(), nullable=True),
        sa.Column('discount_rate', sa.Integer(), nullable=True),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('review_count', sa.Integer(), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('amazon_url', sa.String(length=500), nullable=False),
        sa.Column('affiliate_url', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('locale', sa.String(length=2), nullable=False),
        sa.Column('total_views', sa.Integer(), nullable=True),
        sa.Column('total_mentions', sa.Integer(), nullable=True),
        sa.Column('latest_mention_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_books_id', 'books', ['id'], unique=False)
    op.create_index('ix_books_asin', 'books', ['asin'], unique=True)
    op.create_index('ix_books_locale', 'books', ['locale'], unique=False)
    op.create_index('ix_books_total_views', 'books', ['total_views'], unique=False)
    op.create_index('ix_books_total_mentions', 'books', ['total_mentions'], unique=False)
    op.create_index('idx_books_locale_views', 'books', ['locale', 'total_views'], unique=False)
    op.create_index('idx_books_locale_mentions', 'books', ['locale', 'total_mentions'], unique=False)
    op.create_index('idx_books_latest_mention', 'books', ['latest_mention_at'], unique=False)
    
    # YouTube Videos テーブル
    op.create_table(
        'youtube_videos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('video_id', sa.String(length=20), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.String(length=5000), nullable=True),
        sa.Column('channel_id', sa.String(length=50), nullable=False),
        sa.Column('channel_name', sa.String(length=200), nullable=False),
        sa.Column('thumbnail_url', sa.String(length=500), nullable=True),
        sa.Column('video_url', sa.String(length=500), nullable=False),
        sa.Column('channel_url', sa.String(length=500), nullable=True),
        sa.Column('view_count', sa.Integer(), nullable=True),
        sa.Column('like_count', sa.Integer(), nullable=True),
        sa.Column('comment_count', sa.Integer(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('locale', sa.String(length=2), nullable=False),
        sa.Column('published_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_youtube_videos_id', 'youtube_videos', ['id'], unique=False)
    op.create_index('ix_youtube_videos_video_id', 'youtube_videos', ['video_id'], unique=True)
    op.create_index('ix_youtube_videos_channel_id', 'youtube_videos', ['channel_id'], unique=False)
    op.create_index('ix_youtube_videos_locale', 'youtube_videos', ['locale'], unique=False)
    op.create_index('ix_youtube_videos_view_count', 'youtube_videos', ['view_count'], unique=False)
    op.create_index('ix_youtube_videos_published_at', 'youtube_videos', ['published_at'], unique=False)
    op.create_index('idx_videos_locale_views', 'youtube_videos', ['locale', 'view_count'], unique=False)
    op.create_index('idx_videos_channel', 'youtube_videos', ['channel_id', 'published_at'], unique=False)
    op.create_index('idx_videos_published', 'youtube_videos', ['published_at'], unique=False)
    
    # Book Mentions テーブル（中間テーブル）
    op.create_table(
        'book_mentions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('book_id', sa.Integer(), nullable=False),
        sa.Column('video_id', sa.Integer(), nullable=False),
        sa.Column('mentioned_at', sa.DateTime(), nullable=False),
        sa.Column('extracted_from_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['video_id'], ['youtube_videos.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('book_id', 'video_id', name='uq_book_video')
    )
    op.create_index('ix_book_mentions_id', 'book_mentions', ['id'], unique=False)
    op.create_index('ix_book_mentions_mentioned_at', 'book_mentions', ['mentioned_at'], unique=False)
    op.create_index('idx_mentions_book', 'book_mentions', ['book_id', 'mentioned_at'], unique=False)
    op.create_index('idx_mentions_video', 'book_mentions', ['video_id', 'mentioned_at'], unique=False)
    op.create_index('idx_mentions_date', 'book_mentions', ['mentioned_at'], unique=False)
    
    # Book Daily Stats テーブル
    op.create_table(
        'book_daily_stats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('book_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('daily_views', sa.Integer(), nullable=True),
        sa.Column('daily_mentions', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('book_id', 'date', name='uq_book_date')
    )
    op.create_index('ix_book_daily_stats_id', 'book_daily_stats', ['id'], unique=False)
    op.create_index('ix_book_daily_stats_date', 'book_daily_stats', ['date'], unique=False)
    op.create_index('idx_stats_date_views', 'book_daily_stats', ['date', 'daily_views'], unique=False)
    op.create_index('idx_stats_book_date', 'book_daily_stats', ['book_id', 'date'], unique=False)
    
    # Search Keywords テーブル
    op.create_table(
        'search_keywords',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('keyword', sa.String(length=200), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('locale', sa.String(length=2), nullable=False),
        sa.Column('videos_found', sa.Integer(), nullable=True),
        sa.Column('books_found', sa.Integer(), nullable=True),
        sa.Column('last_searched_at', sa.DateTime(), nullable=False),
        sa.Column('search_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_search_keywords_id', 'search_keywords', ['id'], unique=False)
    op.create_index('ix_search_keywords_keyword', 'search_keywords', ['keyword'], unique=False)
    op.create_index('ix_search_keywords_locale', 'search_keywords', ['locale'], unique=False)
    op.create_index('ix_search_keywords_last_searched_at', 'search_keywords', ['last_searched_at'], unique=False)
    op.create_index('idx_keywords_locale_searched', 'search_keywords', ['locale', 'last_searched_at'], unique=False)
    op.create_index('idx_keywords_category', 'search_keywords', ['category', 'locale'], unique=False)


def downgrade() -> None:
    op.drop_table('search_keywords')
    op.drop_table('book_daily_stats')
    op.drop_table('book_mentions')
    op.drop_table('youtube_videos')
    op.drop_table('books')

