"""
YouTube動画詳細情報取得サービス
"""
import logging
import requests
from typing import Optional, Dict
from ..config.settings import settings

logger = logging.getLogger(__name__)

YOUTUBE_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos"


def get_video_details(video_id: str) -> Optional[Dict]:
    """
    YouTube動画の詳細情報を取得
    
    Args:
        video_id: YouTube動画ID
        
    Returns:
        動画詳細情報（タイトル、再生回数、チャンネル名など）
    """
    if not settings.YOUTUBE_API_KEY:
        logger.warning("YouTube API key not configured")
        return None
    
    try:
        params = {
            "part": "snippet,statistics",
            "id": video_id,
            "key": settings.YOUTUBE_API_KEY
        }
        
        response = requests.get(YOUTUBE_VIDEO_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("items"):
            logger.warning(f"No video found for ID: {video_id}")
            return None
        
        item = data["items"][0]
        snippet = item.get("snippet", {})
        statistics = item.get("statistics", {})
        
        return {
            "title": snippet.get("title", ""),
            "channel_name": snippet.get("channelTitle", ""),
            "description": snippet.get("description", ""),
            "published_at": snippet.get("publishedAt", ""),
            "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
            "view_count": int(statistics.get("viewCount", 0)),
            "like_count": int(statistics.get("likeCount", 0)),
            "comment_count": int(statistics.get("commentCount", 0)),
        }
    
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403:
            logger.error("YouTube API quota exceeded")
        else:
            logger.error(f"YouTube API HTTP error: {e}")
        return None
    except Exception as e:
        logger.error(f"YouTube API error: {e}", exc_info=True)
        return None

