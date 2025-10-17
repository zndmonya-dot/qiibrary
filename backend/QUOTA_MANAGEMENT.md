# YouTube API クォータ管理戦略

## 📊 クォータの現実

### **無料枠の制限**
```
1日あたり: 10,000 ユニット

コスト:
- 検索（search.list）: 100ユニット
- 動画詳細（videos.list）: 1ユニット
```

---

## 🎯 現実的な運用プラン

### **Phase 1: 初期データ収集（1週間）**

#### **目標**
- 3,500件の動画データ蓄積
- 約1,000冊の書籍発見

#### **1日の予算配分**
```
朝（06:00）:
  - キーワード検索 3個 × 100pt = 300pt
  - 動画詳細取得 150件 × 1pt = 150pt
  小計: 450pt

昼（12:00）:
  - キーワード検索 3個 × 100pt = 300pt
  - 動画詳細取得 150件 × 1pt = 150pt
  小計: 450pt

夜（18:00）:
  - キーワード検索 3個 × 100pt = 300pt
  - 動画詳細取得 200件 × 1pt = 200pt
  小計: 500pt

合計: 1,400pt/日 （クォータの14%）
```

#### **キーワードローテーション**
```python
月曜日: ["プログラミング 本 おすすめ 2024", "Python 本", "JavaScript 本"]
火曜日: ["技術書 レビュー", "React 本", "AWS 本"]
水曜日: ["エンジニア 本 おすすめ", "設計 本", "Clean Code"]
木曜日: ["リーダブルコード", "Docker 本", "SQL 本"]
金曜日: ["Kubernetes 本", "TypeScript 本", "Go言語 本"]
土曜日: ["機械学習 本", "データサイエンス 本", "統計学 本"]
日曜日: ["アルゴリズム 本", "Web開発 本", "アーキテクチャ 本"]
```

#### **結果予測**
```
1週間の実績:
- 検索: 63回 × 100pt = 6,300pt
- 動画詳細: 3,500件 × 1pt = 3,500pt
- 合計: 9,800pt （クォータの98%）

取得データ:
- ユニーク動画: 約3,500件
- ユニーク書籍: 約1,000冊
- ASIN重複率: 約30%
```

---

### **Phase 2: 通常運用（継続的）**

#### **目標**
- 既存データの更新
- 新規動画の追加
- ランキングの鮮度維持

#### **1日の予算配分**
```
朝（06:00）:
  - 新規キーワード検索 2個 × 100pt = 200pt
  - 動画詳細取得 100件 × 1pt = 100pt
  小計: 300pt

昼（12:00）:
  - 既存動画の統計更新 300件 × 1pt = 300pt
  小計: 300pt

夜（18:00）:
  - 新規キーワード検索 2個 × 100pt = 200pt
  - 動画詳細取得 100件 × 1pt = 100pt
  小計: 300pt

合計: 900pt/日 （クォータの9%）
```

#### **更新戦略**
```
新規動画優先:
  - 過去7日以内の動画を優先的に検索
  - 既知の動画はスキップ

統計更新:
  - 人気動画（再生回数上位）を優先
  - 1週間に1回の頻度で更新
  - 1日300件まで
```

---

## 💡 クォータ節約テクニック

### **1. キャッシュ戦略**

```python
# 検索結果をキャッシュ（24時間）
cache_key = f"search:{keyword}:{locale}"
if redis.exists(cache_key):
    return redis.get(cache_key)  # 0pt消費

# 動画詳細もキャッシュ（7日間）
cache_key = f"video:{video_id}"
if redis.exists(cache_key):
    return redis.get(cache_key)  # 0pt消費
```

### **2. 増分更新**

```python
# 最後の検索以降に公開された動画のみ取得
published_after = last_search_date

# すでに取得済みの動画はスキップ
existing_video_ids = get_existing_video_ids()
new_videos = [v for v in videos if v['id'] not in existing_video_ids]
```

### **3. バッチ処理**

```python
# 動画詳細は50件ずつ取得（効率的）
for i in range(0, len(video_ids), 50):
    batch = video_ids[i:i+50]
    details = youtube.videos().list(id=','.join(batch)).execute()
    # 50件で1ptではなく、50件まとめて取得
```

### **4. 優先度ベース更新**

```python
# 人気動画を優先的に更新
priority_videos = (
    db.query(Video)
    .order_by(Video.view_count.desc())
    .filter(Video.last_updated < 7_days_ago)
    .limit(300)
)
```

---

## 📈 スケーリングオプション

### **オプション1: 複数APIキー**
```
無料アカウント × 3個
= 30,000pt/日

コスト: 無料
リスク: 規約違反の可能性
```

### **オプション2: 有料プラン**
```
YouTube Data API v3 - 有料クォータ

価格: $0.001 / ユニット
月額予算: $100 の場合
= 100,000ユニット/日
= 検索1,000回 + 詳細取得まで可能

推奨: 月間100万PV超えたら検討
```

### **オプション3: データベース優先**
```
YouTube APIは最小限に:
- 新規動画発見のみ
- 統計は週1回更新

既存データを最大活用:
- ランキングはDB内で計算
- キャッシュを積極利用
```

---

## 🔧 実装: クォータトラッカー

```python
# backend/app/services/quota_tracker.py

import redis
from datetime import date

class QuotaTracker:
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL)
        self.daily_limit = 10000
    
    def get_today_usage(self) -> int:
        """今日の使用量を取得"""
        key = f"quota:usage:{date.today()}"
        usage = self.redis.get(key)
        return int(usage) if usage else 0
    
    def add_usage(self, cost: int):
        """使用量を記録"""
        key = f"quota:usage:{date.today()}"
        self.redis.incrby(key, cost)
        self.redis.expire(key, 86400 * 2)  # 2日間保持
    
    def can_use(self, cost: int) -> bool:
        """使用可能かチェック"""
        current = self.get_today_usage()
        return (current + cost) <= self.daily_limit
    
    def remaining(self) -> int:
        """残りクォータ"""
        return self.daily_limit - self.get_today_usage()
```

### **使用例**

```python
from app.services.quota_tracker import QuotaTracker

tracker = QuotaTracker()

# 検索前にチェック
if tracker.can_use(100):
    results = youtube_service.search_videos(keyword)
    tracker.add_usage(100)
else:
    logger.warning("クォータ不足: 検索をスキップ")

# 詳細取得前にチェック
if tracker.can_use(50):
    details = youtube_service.get_video_details(video_ids[:50])
    tracker.add_usage(50)
```

---

## 📊 モニタリング

### **ダッシュボード表示項目**

```
今日の使用量: 1,245 / 10,000 (12.5%)

今日の実績:
- 検索回数: 8回 (800pt)
- 動画詳細: 445件 (445pt)

残りクォータ: 8,755pt
可能な検索: 87回
可能な詳細取得: 8,755件

推定データ収集:
- 今日: 約400件の動画
- 今週: 約2,800件の動画
- 今月: 約12,000件の動画
```

---

## 🎯 結論

### **10,000ポイントで十分運用可能！**

#### **理由:**

1. **効率的なキーワードローテーション**
   - 1日3-9キーワード = 300-900pt
   - 1週間で全カテゴリをカバー

2. **キャッシュ活用**
   - 同じ動画を何度も取得しない
   - 統計は週1回更新で十分

3. **段階的拡大**
   - 初期: 1,400pt/日（データ蓄積）
   - 通常: 900pt/日（維持）
   - スケール時: 有料プラン検討

4. **質を重視**
   - 厳選されたキーワード
   - 人気動画を優先
   - 重複排除

**月間100万PVまでは無料枠で対応可能！** 🚀

その後は:
- 有料プラン: $30-100/月
- または複数サービス併用（Vimeo、Dailymotionなど）

