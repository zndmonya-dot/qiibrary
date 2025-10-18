#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
データベースを完全にリセットするスクリプト
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from app.config.settings import settings

def main():
    engine = create_engine(settings.DATABASE_URL)
    
    print("データベースをリセット中...")
    
    with engine.begin() as conn:
        # 全テーブルを削除
        conn.execute(text('DROP SCHEMA public CASCADE'))
        conn.execute(text('CREATE SCHEMA public'))
        # alembic_versionテーブルも削除される
        
    print('✓ データベースを完全にリセットしました')

if __name__ == '__main__':
    main()

