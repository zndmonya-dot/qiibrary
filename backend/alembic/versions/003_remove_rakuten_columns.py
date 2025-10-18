"""remove rakuten columns and rename rakuten_data to book_data

Revision ID: 003
Revises: 002
Create Date: 2025-01-18 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    """
    楽天ブックス関連カラムを削除し、rakuten_dataをbook_dataにリネーム
    """
    # 1. rakuten_dataをbook_dataにリネーム
    op.alter_column('books', 'rakuten_data', new_column_name='book_data')
    
    # 2. 不要な楽天カラムを削除
    op.drop_column('books', 'rakuten_url')
    op.drop_column('books', 'rakuten_affiliate_url')


def downgrade():
    """
    ロールバック用（楽天カラムを復元）
    """
    # 楽天カラムを復元
    op.add_column('books', sa.Column('rakuten_url', sa.String(500), nullable=True))
    op.add_column('books', sa.Column('rakuten_affiliate_url', sa.String(500), nullable=True))
    
    # book_dataをrakuten_dataに戻す
    op.alter_column('books', 'book_data', new_column_name='rakuten_data')

