"""
YouTube検索APIエンドポイント
"""
import logging
import requests
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..config.settings import settings

router = APIRouter()
logger = logging.getLogger(__name__)

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


@router.get("/search")
async def search_youtube_videos(
    q: str = Query(..., description="検索キーワード"),
    max_results: int = Query(10, ge=1, le=20, description="取得件数")
):
    """
    YouTube動画を検索
    
    Args:
        q: 検索キーワード（書籍タイトルなど）
        max_results: 最大取得件数（1-20）
    
    Returns:
        検索結果リスト
    """
    if not settings.YOUTUBE_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="YouTube API キーが設定されていません。YOUTUBE_API_KEY 環境変数を設定してください。"
        )
    
    try:
        params = {
            "part": "snippet",
            "q": q,
            "type": "video",
            "maxResults": max_results,
            "key": settings.YOUTUBE_API_KEY,
            "order": "relevance",  # 関連度順
            "videoEmbeddable": "true",  # 埋め込み可能な動画のみ
        }
        
        response = requests.get(YOUTUBE_SEARCH_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        videos = []
        for item in data.get("items", []):
            video_id = item["id"].get("videoId")
            if not video_id:
                continue
            
            snippet = item.get("snippet", {})
            
            videos.append({
                "video_id": video_id,
                "title": snippet.get("title", ""),
                "channel_name": snippet.get("channelTitle", ""),
                "description": snippet.get("description", ""),
                "published_at": snippet.get("publishedAt", ""),
                "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                "youtube_url": f"https://www.youtube.com/watch?v={video_id}",
            })
        
        logger.info(f"YouTube検索成功: {q} - {len(videos)}件")
        
        return {
            "query": q,
            "total_results": len(videos),
            "videos": videos
        }
    
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403:
            raise HTTPException(
                status_code=403,
                detail="YouTube API のクォータ制限に達しました。明日再度お試しください。"
            )
        raise HTTPException(
            status_code=500,
            detail=f"YouTube API エラー: {str(e)}"
        )
    except Exception as e:
        logger.error(f"YouTube検索エラー: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"YouTube検索に失敗しました: {str(e)}"
        )

