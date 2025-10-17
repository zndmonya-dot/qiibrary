"""
YouTube Data API v3 サービス
動画検索、詳細情報取得、統計情報取得
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
import re
import logging
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from ..config import settings
from ..config.search_keywords import (
    get_high_priority_keywords,
    get_all_keywords,
    should_exclude_video,
    SEARCH_CONFIG,
)

logger = logging.getLogger(__name__)


class YouTubeService:
    def __init__(self, api_key: Optional[str] = None):
        """YouTube Data API クライアント初期化"""
        self.api_key = api_key or settings.YOUTUBE_API_KEY
        self.youtube = build('youtube', 'v3', developerKey=self.api_key)
        self.config = SEARCH_CONFIG
    
    def search_videos(
        self,
        query: str,
        max_results: int = 50,
        published_after: Optional[datetime] = None,
        locale: str = "ja"
    ) -> List[Dict]:
        """
        キーワードで動画を検索
        
        Args:
            query: 検索キーワード
            max_results: 最大取得件数
            published_after: この日時以降に公開された動画のみ
            locale: ロケール (ja/en)
        
        Returns:
            動画情報のリスト
        """
        try:
            # デフォルトで過去1年以内の動画を検索
            if not published_after:
                published_after = datetime.now() - timedelta(
                    days=self.config['max_video_age_days']
                )
            
            # ロケールに応じた地域コード
            region_code = "JP" if locale == "ja" else "US"
            relevance_language = "ja" if locale == "ja" else "en"
            
            # 検索リクエスト
            search_response = self.youtube.search().list(
                q=query,
                part='id,snippet',
                type='video',
                maxResults=min(max_results, 50),  # APIの制限
                order=self.config['order'],
                publishedAfter=published_after.isoformat() + 'Z',
                regionCode=region_code,
                relevanceLanguage=relevance_language,
                videoDuration=self.config['video_duration'],
                videoDefinition=self.config['video_definition'],
            ).execute()
            
            videos = []
            for item in search_response.get('items', []):
                video_id = item['id']['videoId']
                snippet = item['snippet']
                
                # 除外キーワードチェック
                if should_exclude_video(snippet['title'], snippet.get('description', '')):
                    logger.info(f"除外: {snippet['title']}")
                    continue
                
                videos.append({
                    'video_id': video_id,
                    'title': snippet['title'],
                    'description': snippet.get('description', ''),
                    'channel_id': snippet['channelId'],
                    'channel_name': snippet['channelTitle'],
                    'published_at': snippet['publishedAt'],
                    'thumbnail_url': snippet['thumbnails']['high']['url'],
                })
            
            logger.info(f"検索完了: '{query}' -> {len(videos)}件")
            return videos
        
        except HttpError as e:
            logger.error(f"YouTube API エラー: {e}")
            return []
    
    def get_video_details(self, video_ids: List[str]) -> List[Dict]:
        """
        動画の詳細情報を取得（統計情報含む）
        
        Args:
            video_ids: 動画IDのリスト（最大50件）
        
        Returns:
            動画詳細情報のリスト
        """
        try:
            # APIは最大50件まで
            video_ids = video_ids[:50]
            
            videos_response = self.youtube.videos().list(
                part='snippet,statistics,contentDetails',
                id=','.join(video_ids)
            ).execute()
            
            videos = []
            for item in videos_response.get('items', []):
                snippet = item['snippet']
                statistics = item.get('statistics', {})
                content_details = item.get('contentDetails', {})
                
                # 再生回数チェック
                view_count = int(statistics.get('viewCount', 0))
                if view_count < self.config['min_views']:
                    continue
                
                # 動画長チェック
                duration_seconds = self._parse_duration(
                    content_details.get('duration', 'PT0S')
                )
                if duration_seconds < self.config['min_video_length']:
                    continue
                
                videos.append({
                    'video_id': item['id'],
                    'title': snippet['title'],
                    'description': snippet.get('description', ''),
                    'channel_id': snippet['channelId'],
                    'channel_name': snippet['channelTitle'],
                    'published_at': snippet['publishedAt'],
                    'thumbnail_url': snippet['thumbnails']['high']['url'],
                    'view_count': view_count,
                    'like_count': int(statistics.get('likeCount', 0)),
                    'comment_count': int(statistics.get('commentCount', 0)),
                    'duration_seconds': duration_seconds,
                })
            
            return videos
        
        except HttpError as e:
            logger.error(f"YouTube API エラー: {e}")
            return []
    
    def search_and_get_details(
        self,
        query: str,
        max_results: int = 50,
        locale: str = "ja"
    ) -> List[Dict]:
        """
        検索と詳細取得を一度に実行
        
        Args:
            query: 検索キーワード
            max_results: 最大取得件数
            locale: ロケール
        
        Returns:
            詳細情報付き動画リスト
        """
        # 検索実行
        videos = self.search_videos(query, max_results, locale=locale)
        
        if not videos:
            return []
        
        # 動画IDを抽出
        video_ids = [v['video_id'] for v in videos]
        
        # 詳細情報を取得（50件ずつ）
        detailed_videos = []
        for i in range(0, len(video_ids), 50):
            batch = video_ids[i:i+50]
            details = self.get_video_details(batch)
            detailed_videos.extend(details)
        
        return detailed_videos
    
    def bulk_search(
        self,
        keywords: Optional[List[str]] = None,
        high_priority_only: bool = True,
        locale: str = "ja"
    ) -> List[Dict]:
        """
        複数のキーワードで一括検索
        
        Args:
            keywords: 検索キーワードリスト（Noneの場合は自動選択）
            high_priority_only: 高優先度キーワードのみ使用
            locale: ロケール
        
        Returns:
            全キーワードの検索結果（重複除去済み）
        """
        if keywords is None:
            if high_priority_only:
                keywords = get_high_priority_keywords(locale)
            else:
                keywords = get_all_keywords(locale)
        
        all_videos = {}
        for keyword in keywords:
            logger.info(f"検索中: {keyword}")
            videos = self.search_and_get_details(keyword, locale=locale)
            
            # video_id をキーとして重複除去
            for video in videos:
                video_id = video['video_id']
                if video_id not in all_videos:
                    all_videos[video_id] = video
                    all_videos[video_id]['found_by_keywords'] = [keyword]
                else:
                    all_videos[video_id]['found_by_keywords'].append(keyword)
        
        result = list(all_videos.values())
        logger.info(f"一括検索完了: {len(result)}件の動画を発見")
        return result
    
    def _parse_duration(self, duration: str) -> int:
        """
        ISO 8601 duration を秒数に変換
        例: PT15M33S -> 933秒
        """
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration)
        
        if not match:
            return 0
        
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        
        return hours * 3600 + minutes * 60 + seconds
    
    def extract_amazon_links(self, description: str) -> List[str]:
        """
        動画説明欄からAmazonリンクを抽出
        
        Args:
            description: 動画の説明文
        
        Returns:
            AmazonリンクのリストASIN
        """
        amazon_links = []
        
        # Amazon URL パターン
        patterns = [
            r'amazon\.co\.jp/(?:.*/)?(dp|gp/product)/([A-Z0-9]{10})',
            r'amazon\.com/(?:.*/)?(dp|gp/product)/([A-Z0-9]{10})',
            r'amzn\.to/([A-Za-z0-9]+)',
            r'amzn\.asia/([A-Za-z0-9]+)',
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, description, re.IGNORECASE)
            for match in matches:
                if 'amazon' in pattern:
                    asin = match.group(2)
                else:
                    # 短縮URLの場合は実際のASINの取得が必要
                    # ここでは短縮URLをそのまま保存
                    asin = match.group(1)
                
                amazon_links.append(asin)
        
        # 重複除去
        return list(set(amazon_links))
    
    def get_video_url(self, video_id: str) -> str:
        """動画URLを生成"""
        return f"https://www.youtube.com/watch?v={video_id}"
    
    def get_channel_url(self, channel_id: str) -> str:
        """チャンネルURLを生成"""
        return f"https://www.youtube.com/channel/{channel_id}"


# シングルトンインスタンス
_youtube_service = None


def get_youtube_service() -> YouTubeService:
    """YouTubeServiceのシングルトンインスタンスを取得"""
    global _youtube_service
    if _youtube_service is None:
        _youtube_service = YouTubeService()
    return _youtube_service

