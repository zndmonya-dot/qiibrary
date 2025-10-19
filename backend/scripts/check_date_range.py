#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
from pathlib import Path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.qiita_article import QiitaArticle

db = SessionLocal()

oldest = db.query(QiitaArticle).order_by(QiitaArticle.published_at.asc()).first()
newest = db.query(QiitaArticle).order_by(QiitaArticle.published_at.desc()).first()

if oldest:
    print(f'最古の記事: {oldest.published_at.date()}')
if newest:
    print(f'最新の記事: {newest.published_at.date()}')

total = db.query(QiitaArticle).count()
print(f'記事総数: {total}件')

db.close()

