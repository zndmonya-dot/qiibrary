"""add first_mentioned_at column

Revision ID: 004
Revises: 003
Create Date: 2025-10-21 20:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # booksテーブルにfirst_mentioned_atカラムを追加
    op.add_column('books', sa.Column('first_mentioned_at', sa.DateTime(), nullable=True))
    
    # インデックスを追加
    op.create_index('idx_books_first_mention', 'books', ['first_mentioned_at'], unique=False)


def downgrade() -> None:
    # インデックスを削除
    op.drop_index('idx_books_first_mention', table_name='books')
    
    # カラムを削除
    op.drop_column('books', 'first_mentioned_at')

