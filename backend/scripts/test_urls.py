#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
URLが正しく生成されているかテストするスクリプト
"""

import sys
from pathlib import Path

# プロジェクトのルートディレクトリをPythonパスに追加
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
import requests

logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    logger.info("================================================================================")
    logger.info("📊 URL生成テスト")
    logger.info("================================================================================")
    
    # APIから1件取得
    response = requests.get("http://localhost:8000/api/rankings/?limit=1")
    data = response.json()
    
    if not data['rankings']:
        logger.error("ランキングデータが取得できませんでした")
        return
    
    book = data['rankings'][0]['book']
    
    logger.info("")
    logger.info(f"📚 タイトル: {book['title']}")
    logger.info(f"📖 ISBN: {book['isbn']}")
    logger.info("")
    logger.info("🔗 Amazon:")
    logger.info(f"   通常: {book['amazon_url']}")
    logger.info(f"   アフィリエイト: {book['amazon_affiliate_url']}")
    logger.info("")
    logger.info("🔗 楽天ブックス:")
    logger.info(f"   通常: {book['rakuten_url']}")
    logger.info(f"   アフィリエイト: {book['rakuten_affiliate_url']}")
    logger.info("")
    logger.info("================================================================================")
    logger.info("✅ URLをブラウザで確認してください")
    logger.info("================================================================================")

if __name__ == "__main__":
    main()

