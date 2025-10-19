#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Qiitaの最古の記事を検索
"""
import sys
from pathlib import Path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import requests
from app.config.settings import settings

# Qiita APIで最古の記事を検索
headers = {'Authorization': f'Bearer {settings.QIITA_API_TOKEN}'}

# 最も古い記事を検索（created_at昇順でソート）
response = requests.get(
    'https://qiita.com/api/v2/items',
    headers=headers,
    params={
        'page': 1,
        'per_page': 1,
        'query': 'created:>=2011-01-01 stocks:>0'  # Qiitaのサービス開始は2011年
    },
    timeout=10
)

if response.status_code == 200:
    articles = response.json()
    if articles:
        oldest = articles[0]
        print(f"Qiita oldest article date: {oldest['created_at']}")
        print(f"URL: {oldest['url']}")
    else:
        print("No articles found")
else:
    print(f"API Error: {response.status_code}")
    print(response.text)

