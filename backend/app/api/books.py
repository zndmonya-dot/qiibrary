from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.book import BookDetail, YouTubeVideo

router = APIRouter()


# サンプルデータ
SAMPLE_BOOKS_DETAIL = {
    "4873115655": {
        "id": 1,
        "asin": "4873115655",
        "title": "リーダブルコード",
        "author": "Dustin Boswell, Trevor Foucher",
        "publisher": "オライリージャパン",
        "publication_date": "2012-06-23",
        "price": 2640,
        "sale_price": 2376,  # 10%オフ
        "discount_rate": 10,
        "rating": 4.5,
        "review_count": 1523,
        "image_url": "https://m.media-amazon.com/images/P/4873115655.jpg",
        "amazon_url": "https://www.amazon.co.jp/dp/4873115655",
        "affiliate_url": "https://www.amazon.co.jp/dp/4873115655?tag=yourtag-22",
        "description": "コードは理解しやすくなければならない。本書はこの原則を日々のコーディングの様々な場面に当てはめる方法を紹介します。名前の付け方、コメントの書き方、ループや条件分岐の書き方など、エンジニアが本当に知りたかった基本原則とテクニックを解説。すべてのプログラマーが読むべき一冊です。",
        "total_views": 1234567,
        "total_mentions": 8,
        "latest_mention_at": "2025-10-15T10:00:00+09:00",
        "created_at": "2025-01-01T00:00:00+09:00",
        "updated_at": "2025-10-17T00:00:00+09:00",
        "youtube_videos": [
            {
                "video_id": "dQw4w9WgXcQ",
                "title": "エンジニアなら絶対読むべき技術書10選【2025年版】",
                "channel_name": "テック解説チャンネル",
                "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
                "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "view_count": 123456,
                "like_count": 5678,
                "published_at": "2025-09-15T10:00:00+09:00"
            },
            {
                "video_id": "abc123xyz",
                "title": "新人エンジニアにおすすめの本5選",
                "channel_name": "プログラミング講座",
                "thumbnail_url": "https://i.ytimg.com/vi/abc123xyz/mqdefault.jpg",
                "video_url": "https://www.youtube.com/watch?v=abc123xyz",
                "view_count": 87654,
                "like_count": 3456,
                "published_at": "2025-08-20T15:30:00+09:00"
            },
            {
                "video_id": "xyz789abc",
                "title": "コードレビューで役立つ技術書3選",
                "channel_name": "エンジニアTV",
                "thumbnail_url": "https://i.ytimg.com/vi/xyz789abc/mqdefault.jpg",
                "video_url": "https://www.youtube.com/watch?v=xyz789abc",
                "view_count": 65432,
                "like_count": 2345,
                "published_at": "2025-10-01T12:00:00+09:00"
            }
        ]
    }
}


@router.get("/{asin}")
async def get_book_detail(asin: str):
    """書籍詳細取得"""
    if asin not in SAMPLE_BOOKS_DETAIL:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return SAMPLE_BOOKS_DETAIL[asin]

