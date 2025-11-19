# YouTube動画詳細情報の取得

## 現状

現在、YouTube動画は以下の情報のみを保存しています：

- `youtube_url`: 動画URL
- `youtube_video_id`: 動画ID
- `title`: 動画タイトル（手動入力または自動取得）
- `thumbnail_url`: サムネイルURL（自動生成）
- `display_order`: 表示順序

## 追加したい情報

- ✅ **タイトル**: 動画の正式なタイトル
- ❌ **再生回数**: 動画の視聴回数
- ❌ **投稿者**: チャンネル名
- ❌ **投稿日**: 公開日時
- ❌ **いいね数**: 高評価数

## YouTube Data API v3 の必要性

### 1. API キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. **YouTube Data API v3** を有効化
4. **認証情報** → **APIキー** を作成

### 2. 無料枠の制限

- **1日あたり10,000クォータ**
- 動画詳細取得: 1リクエスト = 1クォータ
- 100動画/日まで取得可能

### 3. 実装方法

#### 環境変数の設定

```bash
# backend/.env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

#### APIクライアントの実装

```python
# backend/app/services/youtube_service.py

import os
import requests
from typing import Optional, Dict

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/videos"

def get_video_details(video_id: str) -> Optional[Dict]:
    """
    YouTube動画の詳細情報を取得
    
    Args:
        video_id: YouTube動画ID
        
    Returns:
        動画詳細情報（タイトル、再生回数、チャンネル名など）
    """
    if not YOUTUBE_API_KEY:
        return None
    
    params = {
        "part": "snippet,statistics",
        "id": video_id,
        "key": YOUTUBE_API_KEY
    }
    
    try:
        response = requests.get(YOUTUBE_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("items"):
            return None
        
        item = data["items"][0]
        snippet = item.get("snippet", {})
        statistics = item.get("statistics", {})
        
        return {
            "title": snippet.get("title"),
            "channel_name": snippet.get("channelTitle"),
            "published_at": snippet.get("publishedAt"),
            "view_count": int(statistics.get("viewCount", 0)),
            "like_count": int(statistics.get("likeCount", 0)),
            "comment_count": int(statistics.get("commentCount", 0)),
        }
    except Exception as e:
        print(f"YouTube API error: {e}")
        return None
```

#### データベーステーブルの拡張

```python
# backend/app/models/book.py

class BookYouTubeLink(Base):
    """書籍とYouTube動画のリンク（手動追加）"""
    
    __tablename__ = 'book_youtube_links'
    
    # 既存のカラム
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey('books.id', ondelete='CASCADE'), nullable=False)
    youtube_url = Column(String(500), nullable=False)
    youtube_video_id = Column(String(20))
    title = Column(String(500))
    thumbnail_url = Column(String(500))
    display_order = Column(Integer, default=1, nullable=False)
    
    # 追加するカラム
    channel_name = Column(String(255))  # チャンネル名
    view_count = Column(Integer, default=0)  # 再生回数
    like_count = Column(Integer, default=0)  # いいね数
    published_at = Column(DateTime)  # 公開日時
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())  # 最終更新
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
```

#### マイグレーション

```bash
# データベース変更
cd backend
alembic revision --autogenerate -m "Add YouTube video details columns"
alembic upgrade head
```

#### 動画追加時にAPIを呼び出す

```python
# backend/app/api/admin.py

from ..services.youtube_service import get_video_details

@router.post("/books/{book_id}/youtube")
async def add_youtube_link(
    book_id: int,
    link_data: YouTubeLinkCreate,
    db: Session = Depends(get_db)
):
    """書籍にYouTube動画を追加"""
    # ... 既存のコード ...
    
    # YouTube API で詳細情報を取得
    video_details = get_video_details(video_id)
    
    new_link = BookYouTubeLink(
        book_id=book_id,
        youtube_url=link_data.youtube_url,
        youtube_video_id=video_id,
        thumbnail_url=thumbnail_url,
        display_order=link_data.display_order,
        # API から取得した情報
        title=video_details.get("title") if video_details else None,
        channel_name=video_details.get("channel_name") if video_details else None,
        view_count=video_details.get("view_count") if video_details else 0,
        like_count=video_details.get("like_count") if video_details else 0,
        published_at=video_details.get("published_at") if video_details else None,
    )
    
    # ... 既存のコード ...
```

#### 定期的な更新（オプション）

再生回数などは日々変化するため、定期的に更新する仕組みも検討：

```python
# backend/app/tasks/update_youtube_stats.py

from apscheduler.schedulers.background import BackgroundScheduler

def update_all_youtube_stats():
    """全YouTube動画の統計情報を更新"""
    db = SessionLocal()
    try:
        links = db.query(BookYouTubeLink).all()
        for link in links:
            if link.youtube_video_id:
                details = get_video_details(link.youtube_video_id)
                if details:
                    link.view_count = details.get("view_count", 0)
                    link.like_count = details.get("like_count", 0)
        db.commit()
    finally:
        db.close()

# スケジューラーに追加（毎日1回更新）
scheduler.add_job(
    update_all_youtube_stats,
    trigger=CronTrigger(hour=4, minute=0, timezone=JST),
    id='update_youtube_stats',
    name='YouTube動画統計情報の更新',
    replace_existing=True
)
```

### 4. フロントエンドでの表示

```tsx
{/* 動画情報 */}
<div className="p-3 md:p-4">
  <h3 className="text-sm md:text-base font-bold text-qiita-text-dark dark:text-white mb-2 group-hover-text-green line-clamp-2 leading-relaxed">
    {video.title}
  </h3>
  
  <div className="flex items-center gap-2 mb-2 text-xs text-qiita-text dark:text-dark-text">
    <i className="ri-youtube-line text-red-500"></i>
    <span className="truncate">{video.channel_name}</span>
  </div>
  
  {/* 統計情報 */}
  <div className="flex items-center gap-3 text-xs text-qiita-text dark:text-dark-text">
    <span className="flex items-center gap-1">
      <i className="ri-eye-line"></i>
      {formatNumber(video.view_count)}回
    </span>
    <span className="flex items-center gap-1">
      <i className="ri-thumb-up-line"></i>
      {formatNumber(video.like_count)}
    </span>
  </div>
</div>
```

## まとめ

### すぐに実装できること
✅ 埋め込み再生（モーダル）- **実装済み**

### YouTube API が必要なこと
❌ 正確なタイトル取得  
❌ 再生回数の表示  
❌ 投稿者（チャンネル名）の表示  
❌ 公開日時の表示  
❌ いいね数の表示  

### 代替案
YouTube APIを使わない場合、以下の方法で一部情報を取得可能：

1. **タイトル**: 管理画面で手動入力
2. **チャンネル名**: 管理画面で手動入力
3. **再生回数・いいね数**: 表示しない、または「YouTubeで確認」リンクのみ

YouTube Data API v3 の利用を推奨しますが、無料枠の制限があるため、動画数が多い場合は注意が必要です。

