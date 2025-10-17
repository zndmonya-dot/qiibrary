# ランキング集計戦略

## 📊 2つのアプローチ

### **方式1: 固定期間方式（カレンダーベース）**

```
日次: 2024年3月20日（1日分）
月次: 2024年3月1日 〜 3月31日（カレンダー月）
年次: 2024年1月1日 〜 12月31日（カレンダー年）
```

#### メリット ✅
- **比較しやすい**: 「3月のランキング」「2024年のランキング」が明確
- **アーカイブ性**: 過去の月/年のランキングを保存・比較できる
- **わかりやすい**: ユーザーにとって直感的

#### デメリット ❌
- **月初・年初問題**: データが少なくランキングが不安定
  - 例: 3月1日時点では1日分のデータしかない
  - 例: 1月5日時点では5日分のデータしかない
- **月末効果**: 月末に近づくほどデータが増える
- **リアルタイム性低い**: 今日の急上昇がランキングに反映されにくい

---

### **方式2: スライディングウィンドウ方式（過去N日）**

```
日次: 今日（1日分）
月次: 過去30日間（2024/02/20 〜 2024/03/20）
年次: 過去365日間（2023/03/20 〜 2024/03/20）
```

#### メリット ✅
- **常に一定量のデータ**: いつ見ても30日分/365日分のデータ
- **リアルタイム性高い**: 今日の話題がすぐ反映される
- **安定性**: データ量が常に同じなので公平
- **トレンド反映**: 最新のトレンドを正確に捉える

#### デメリット ❌
- **期間が流動的**: 「3月のランキング」という概念がない
- **比較しづらい**: 昨年との比較が難しい
- **アーカイブ不向き**: 「2023年のベスト」が作りにくい

---

## 🎯 BookTuber に最適な方式は？

### **推奨: ハイブリッド方式**

両方のメリットを活かす！

```
┌─────────────────────────────────────────────────┐
│ メイン表示（ユーザー向け）                        │
├─────────────────────────────────────────────────┤
│ 📅 今日のランキング  (Today)                     │
│ 🔥 過去30日間     (Past 30 Days)                │
│ 📈 過去365日間    (Past 365 Days)               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ アーカイブ（別ページ）                            │
├─────────────────────────────────────────────────┤
│ 📆 2024年3月     (March 2024)                   │
│ 📆 2024年       (Year 2024)                     │
│ 📆 2023年       (Year 2023)                     │
└─────────────────────────────────────────────────┘
```

---

## 📐 具体的な実装イメージ

### **1. デイリー（今日 or 昨日）**

```python
# 今日のランキング
date = datetime.now().date()
rankings = get_daily_ranking(date)

# UIには「2024年3月20日のランキング」と表示
```

### **2. 月次ランキング（スライディング30日）**

```python
# 過去30日間の合計
end_date = datetime.now().date()
start_date = end_date - timedelta(days=30)

# この期間の累計再生回数でランキング
rankings = aggregate_rankings(start_date, end_date)

# UIには「過去30日間のランキング (2024/02/19 - 2024/03/20)」と表示
```

**メリット:**
- 3月1日でも30日分のデータがある（2月含む）
- 毎日更新されるので常に最新トレンド
- 急上昇した本がすぐランキングに反映

### **3. 年次ランキング（スライディング365日）**

```python
# 過去365日間の合計
end_date = datetime.now().date()
start_date = end_date - timedelta(days=365)

rankings = aggregate_rankings(start_date, end_date)

# UIには「過去1年間のランキング (2023/03/20 - 2024/03/20)」と表示
```

### **4. アーカイブ（カレンダー月/年）**

```python
# 2024年3月の確定ランキング（4月以降に表示）
rankings = get_monthly_ranking(year=2024, month=3)

# 2024年の確定ランキング（2025年以降に表示）
rankings = get_yearly_ranking(year=2024)

# UIには「2024年3月のランキング」と表示
```

---

## 🔄 データ更新頻度

### **リアルタイムランキング（推奨）**

```
スケジュール:
- 日次ランキング: 毎日 00:00 に集計
- 過去30日ランキング: 毎日 01:00 に集計
- 過去365日ランキング: 毎日 02:00 に集計

キャッシュ:
- Redis に 1時間キャッシュ
- ユーザーには高速にレスポンス
```

### **データ収集**

```
スケジュール:
- YouTube動画検索: 6時間ごと
- Amazon情報更新: 24時間ごと
- 統計情報更新: 1時間ごと
```

---

## 📊 UI表示例

### **フロントエンドのタブ**

```typescript
// frontend/app/page.tsx

type PeriodType = 'today' | 'past30days' | 'past365days';

const PERIOD_LABELS = {
  today: {
    ja: '今日',
    en: 'Today'
  },
  past30days: {
    ja: '過去30日',
    en: 'Past 30 Days'
  },
  past365days: {
    ja: '過去1年',
    en: 'Past Year'
  },
};
```

**表示イメージ:**

```
┌─────────────────────────────────────────┐
│ BookTuber - IT技術書ランキング           │
├─────────────────────────────────────────┤
│                                         │
│ [今日] [過去30日] [過去1年]              │
│   ↑                                     │
│  現在選択中                              │
│                                         │
│ 📅 2024/02/19 - 2024/03/20              │
│                                         │
│ 🥇 1位 リーダブルコード                  │
│    📊 125,000 views (↑ 5,200)           │
│    🎬 8 videos                          │
│                                         │
│ 🥈 2位 Clean Code                       │
│    📊 98,500 views (↑ 3,800)            │
│    🎬 6 videos                          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 💾 データベース設計

### **日次統計テーブル（book_daily_stats）**

```sql
CREATE TABLE book_daily_stats (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    date DATE NOT NULL,
    daily_views INTEGER DEFAULT 0,
    daily_mentions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(book_id, date)
);

-- インデックス
CREATE INDEX idx_stats_date_views ON book_daily_stats(date, daily_views DESC);
CREATE INDEX idx_stats_book_date ON book_daily_stats(book_id, date);
```

### **集計クエリ例**

#### 過去30日ランキング

```sql
SELECT 
    b.asin,
    b.title,
    b.author,
    b.image_url,
    b.rating,
    b.price,
    SUM(s.daily_views) as total_views,
    SUM(s.daily_mentions) as total_mentions
FROM books b
JOIN book_daily_stats s ON b.id = s.book_id
WHERE s.date >= CURRENT_DATE - INTERVAL '30 days'
  AND s.date <= CURRENT_DATE
  AND b.locale = 'ja'
GROUP BY b.id
ORDER BY total_views DESC
LIMIT 50;
```

#### 過去365日ランキング

```sql
SELECT 
    b.asin,
    b.title,
    SUM(s.daily_views) as total_views,
    SUM(s.daily_mentions) as total_mentions
FROM books b
JOIN book_daily_stats s ON b.id = s.book_id
WHERE s.date >= CURRENT_DATE - INTERVAL '365 days'
  AND s.date <= CURRENT_DATE
  AND b.locale = 'ja'
GROUP BY b.id
ORDER BY total_views DESC
LIMIT 50;
```

#### カレンダー月ランキング（アーカイブ用）

```sql
SELECT 
    b.asin,
    b.title,
    SUM(s.daily_views) as total_views
FROM books b
JOIN book_daily_stats s ON b.id = s.book_id
WHERE s.date >= '2024-03-01'
  AND s.date <= '2024-03-31'
  AND b.locale = 'ja'
GROUP BY b.id
ORDER BY total_views DESC
LIMIT 50;
```

---

## 🎨 フロントエンドAPI設計

### **推奨エンドポイント**

```typescript
// 今日のランキング
GET /api/rankings/today?locale=ja

// 過去30日ランキング
GET /api/rankings/last30days?locale=ja

// 過去365日ランキング
GET /api/rankings/last365days?locale=ja

// アーカイブ: 特定月
GET /api/rankings/archive/monthly?year=2024&month=3&locale=ja

// アーカイブ: 特定年
GET /api/rankings/archive/yearly?year=2024&locale=ja
```

### **レスポンス例**

```json
{
  "period": {
    "type": "last30days",
    "start_date": "2024-02-19",
    "end_date": "2024-03-20",
    "label": "過去30日間"
  },
  "rankings": [
    {
      "rank": 1,
      "book": {
        "asin": "4873115655",
        "title": "リーダブルコード",
        "rating": 4.4,
        "price": 2640
      },
      "stats": {
        "total_views": 125000,
        "total_mentions": 8,
        "daily_change": 5200,
        "rank_change": 0
      }
    }
  ],
  "updated_at": "2024-03-20T15:00:00Z"
}
```

---

## 🚀 最終推奨

### **メイン表示（トップページ）**
1. **今日** - 本日のホットトピック
2. **過去30日** - 今話題の本（デフォルト表示）
3. **過去1年** - 定番の名著

### **理由:**
- ✅ いつ見ても一定量のデータ
- ✅ 最新トレンドを正確に反映
- ✅ 急上昇した本をすぐキャッチ
- ✅ 月初でもデータが豊富
- ✅ ユーザーにとって「今人気」がわかりやすい

### **将来的な拡張:**
- 📆 アーカイブページで過去の月/年ランキングを表示
- 📈 ランキング変動グラフ（過去30日の推移）
- 🔥 急上昇ランキング（前日比）

---

## 実装方針のまとめ

```
Phase 1: スライディングウィンドウ方式を実装
  - 今日/過去30日/過去365日
  - リアルタイム性重視

Phase 2: カレンダー方式も追加（オプション）
  - アーカイブページ用
  - 「2024年のベスト」など
```

この方針で進めますか？

