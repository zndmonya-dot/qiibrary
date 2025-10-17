# 取得できるデータの具体例

## 📺 YouTube Data API v3 から取得できるデータ

### 1. 動画検索結果

**検索クエリ**: "プログラミング 本 おすすめ"

```json
{
  "video_id": "dQw4w9WgXcQ",
  "title": "【2024年版】現役エンジニアがおすすめするプログラミング本10選",
  "description": "今回は、実際に読んで役立ったプログラミング本を10冊紹介します。\n\n📚紹介する本\n1. リーダブルコード https://www.amazon.co.jp/dp/4873115655\n2. Clean Code https://amzn.to/3xYz...\n3. プログラマーのためのSQL https://www.amazon.co.jp/dp/4798115169\n...",
  "channel_id": "UCabcdefghijk123456789",
  "channel_name": "エンジニアTV",
  "published_at": "2024-03-15T10:30:00Z",
  "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "view_count": 125000,
  "like_count": 4500,
  "comment_count": 320,
  "duration_seconds": 1245,
  "found_by_keywords": ["プログラミング 本 おすすめ", "技術書 レビュー"]
}
```

### 2. 動画詳細情報

```json
{
  "video_id": "abc123xyz",
  "title": "【完全保存版】Python学習におすすめの本5選",
  "description": "Pythonを学ぶならこの本！\n\n📖紹介書籍\n・Python実践入門 https://www.amazon.co.jp/dp/4297103214\n・ゼロから作るDeep Learning https://amzn.asia/d/abc123\n・Effective Python https://www.amazon.co.jp/dp/4873119030\n\nチャプター:\n0:00 イントロ\n2:30 初心者向け\n8:15 中級者向け\n15:40 上級者向け",
  "channel_id": "UC987654321xyz",
  "channel_name": "プログラミングチャンネル",
  "published_at": "2024-02-20T15:00:00Z",
  "thumbnail_url": "https://i.ytimg.com/vi/abc123xyz/maxresdefault.jpg",
  "view_count": 89000,
  "like_count": 3200,
  "comment_count": 180,
  "duration_seconds": 1680
}
```

---

## 📚 Amazonリンク抽出で取得できるデータ

### 1. 動画説明欄から抽出されるAmazonリンク

**入力**: 動画の description フィールド

**出力**:
```json
[
  {
    "asin": "4873115655",
    "locale": "ja",
    "url": "https://www.amazon.co.jp/dp/4873115655"
  },
  {
    "asin": "4297103214",
    "locale": "ja",
    "url": "https://www.amazon.co.jp/dp/4297103214"
  },
  {
    "asin": "4873119030",
    "locale": "ja",
    "url": "https://www.amazon.co.jp/dp/4873119030"
  }
]
```

### 2. 短縮URLの展開

**入力**:
```
https://amzn.to/3xYz123
https://amzn.asia/d/abc456
```

**処理**: HTTPリダイレクトを追跡

**出力**:
```json
[
  {
    "asin": "4873115655",
    "locale": "ja",
    "url": "https://www.amazon.co.jp/dp/4873115655",
    "original_short_url": "https://amzn.to/3xYz123"
  }
]
```

---

## 📖 Amazon Product Advertising API v5 から取得できるデータ

### 1. 書籍の詳細情報

**入力**: ASIN "4873115655"

**出力**:
```json
{
  "asin": "4873115655",
  "title": "リーダブルコード ―より良いコードを書くためのシンプルで実践的なテクニック",
  "author": "Dustin Boswell, Trevor Foucher",
  "publisher": "オライリージャパン",
  "publication_date": "2012-06-23",
  "price": 2640,
  "sale_price": null,
  "discount_rate": null,
  "rating": 4.4,
  "review_count": 892,
  "image_url": "https://m.media-amazon.com/images/I/51MgH8Jmr+L.jpg",
  "description": "コードは理解しやすくなければならない。本書はこの原則を日々のコーディングの様々な場面に当てはめる方法を紹介します。名前の付け方、コメントの書き方など、エンジニアが本当に知りたかった基本原則とテクニックを解説。美しいコードを見ると感動する。優れたコードは見た瞬間に何をしているかが理解できる。本書の目的は、君のコードを良くすることだ。",
  "amazon_url": "https://www.amazon.co.jp/dp/4873115655",
  "affiliate_url": "https://www.amazon.co.jp/dp/4873115655?tag=yourtag-22",
  "locale": "ja"
}
```

### 2. セール中の書籍

**出力**:
```json
{
  "asin": "4297124394",
  "title": "良いコード/悪いコードで学ぶ設計入門",
  "author": "仙塲 大也",
  "publisher": "技術評論社",
  "publication_date": "2022-04-30",
  "price": 3278,
  "sale_price": 2622,
  "discount_rate": 20,
  "rating": 4.5,
  "review_count": 456,
  "image_url": "https://m.media-amazon.com/images/I/51Q5Z4JmR+L.jpg",
  "description": "コードの良し悪しを具体例で学ぶ。保守性の高い設計、適切な命名、責務の分離など、現場で即戦力となる設計スキルを実践的に習得できます。",
  "amazon_url": "https://www.amazon.co.jp/dp/4297124394",
  "affiliate_url": "https://www.amazon.co.jp/dp/4297124394?tag=yourtag-22",
  "locale": "ja"
}
```

### 3. 英語書籍

**入力**: ASIN "0132350882"

**出力**:
```json
{
  "asin": "0132350882",
  "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
  "author": "Robert C. Martin",
  "publisher": "Prentice Hall",
  "publication_date": "2008-08-01",
  "price": 4280,
  "sale_price": null,
  "discount_rate": null,
  "rating": 4.7,
  "review_count": 3254,
  "image_url": "https://m.media-amazon.com/images/I/41xShlnTZTL.jpg",
  "description": "A handbook of agile software craftsmanship that teaches practical techniques for writing clean, maintainable code. Learn how to tell the difference between good and bad code.",
  "amazon_url": "https://www.amazon.com/dp/0132350882",
  "affiliate_url": "https://www.amazon.com/dp/0132350882?tag=yourtag-20",
  "locale": "en"
}
```

---

## 🔄 統合されたデータフロー

### ステップ1: YouTube検索
```
入力: "Python 本"
↓
出力: 50件の動画
```

### ステップ2: Amazonリンク抽出
```
入力: 50件の動画の description
↓
処理: 正規表現 + URL展開
↓
出力: 15個のユニークなASIN
```

### ステップ3: Amazon商品情報取得
```
入力: 15個のASIN
↓
処理: Amazon PA-API (10件ずつ)
↓
出力: 15冊の書籍詳細情報
```

### ステップ4: データ統合
```json
{
  "book": {
    "asin": "4873119049",
    "title": "ゼロから作るDeep Learning",
    "author": "斎藤 康毅",
    "price": 3740,
    "rating": 4.3,
    "review_count": 678,
    "image_url": "https://m.media-amazon.com/images/I/51ZBvVBUSQL.jpg",
    "description": "ディープラーニングの本格的な入門書...",
    "amazon_url": "https://www.amazon.co.jp/dp/4873119049",
    "affiliate_url": "https://www.amazon.co.jp/dp/4873119049?tag=yourtag-22",
    "locale": "ja"
  },
  "youtube_videos": [
    {
      "video_id": "xyz123",
      "title": "【機械学習入門】おすすめ本3選",
      "channel_name": "AI研究所",
      "view_count": 45000,
      "like_count": 1200,
      "published_at": "2024-01-15T12:00:00Z",
      "video_url": "https://www.youtube.com/watch?v=xyz123"
    },
    {
      "video_id": "abc789",
      "title": "Deep Learning始めるならこの本！",
      "channel_name": "プログラミング大学",
      "view_count": 32000,
      "like_count": 890,
      "published_at": "2024-02-10T08:30:00Z",
      "video_url": "https://www.youtube.com/watch?v=abc789"
    }
  ],
  "statistics": {
    "total_views": 77000,
    "total_mentions": 2,
    "average_rating": 4.3,
    "first_mentioned_at": "2024-01-15T12:00:00Z",
    "latest_mentioned_at": "2024-02-10T08:30:00Z"
  }
}
```

---

## 📊 データベースに保存されるデータ構造

### Books テーブル
```sql
+-------------------+------------------------------------------+
| asin              | 4873115655                               |
| title             | リーダブルコード                          |
| author            | Dustin Boswell, Trevor Foucher           |
| publisher         | オライリージャパン                        |
| publication_date  | 2012-06-23                               |
| price             | 2640                                     |
| sale_price        | NULL                                     |
| discount_rate     | NULL                                     |
| rating            | 4.4                                      |
| review_count      | 892                                      |
| image_url         | https://m.media-amazon.com/images/...    |
| description       | コードは理解しやすく...                   |
| amazon_url        | https://www.amazon.co.jp/dp/4873115655   |
| affiliate_url     | ...?tag=yourtag-22                       |
| locale            | ja                                       |
| total_views       | 1234567                                  |
| total_mentions    | 8                                        |
| latest_mention_at | 2024-03-20 15:30:00                      |
| created_at        | 2024-01-01 00:00:00                      |
| updated_at        | 2024-03-20 16:00:00                      |
+-------------------+------------------------------------------+
```

### YouTube Videos テーブル
```sql
+------------------+------------------------------------------+
| video_id         | dQw4w9WgXcQ                              |
| title            | 【2024年版】プログラミング本10選          |
| channel_id       | UCabcdefghijk123456789                   |
| channel_name     | エンジニアTV                              |
| thumbnail_url    | https://i.ytimg.com/vi/dQw4w9WgXcQ/... |
| video_url        | https://www.youtube.com/watch?v=...     |
| view_count       | 125000                                   |
| like_count       | 4500                                     |
| published_at     | 2024-03-15 10:30:00                      |
| created_at       | 2024-03-15 11:00:00                      |
+------------------+------------------------------------------+
```

### Book Mentions テーブル（中間テーブル）
```sql
+----------+-------------+---------------------+
| book_id  | video_id    | mentioned_at        |
+----------+-------------+---------------------+
| 1        | dQw4w9WgXcQ | 2024-03-15 10:30:00 |
| 1        | abc123xyz   | 2024-02-20 15:00:00 |
| 2        | abc123xyz   | 2024-02-20 15:00:00 |
+----------+-------------+---------------------+
```

### Daily Stats テーブル
```sql
+----------+------------+------------+----------+
| book_id  | date       | views      | mentions |
+----------+------------+------------+----------+
| 1        | 2024-03-20 | 15000      | 1        |
| 1        | 2024-03-21 | 18500      | 2        |
| 2        | 2024-03-20 | 8900       | 1        |
+----------+------------+------------+----------+
```

---

## 🎯 実際のランキングデータ

### 日次ランキング（2024-03-20）
```json
{
  "period": {
    "type": "daily",
    "date": "2024-03-20"
  },
  "rankings": [
    {
      "rank": 1,
      "book": {
        "asin": "4873115655",
        "title": "リーダブルコード",
        "author": "Dustin Boswell",
        "rating": 4.4,
        "image_url": "...",
        "price": 2640
      },
      "stats": {
        "daily_views": 18500,
        "total_views": 1234567,
        "mention_count": 8
      }
    },
    {
      "rank": 2,
      "book": {
        "asin": "4297124394",
        "title": "良いコード/悪いコードで学ぶ設計入門",
        "author": "仙塲 大也",
        "rating": 4.5,
        "image_url": "...",
        "price": 2622,
        "sale_price": 2622,
        "discount_rate": 20
      },
      "stats": {
        "daily_views": 16200,
        "total_views": 856432,
        "mention_count": 7
      }
    }
  ]
}
```

---

## 📈 取得できるデータのまとめ

### YouTube から取得
- ✅ 動画タイトル・説明文
- ✅ チャンネル名・チャンネルID
- ✅ 再生回数・いいね数・コメント数
- ✅ 公開日時・動画長
- ✅ サムネイル画像URL

### Amazon から取得
- ✅ 書籍タイトル・著者・出版社
- ✅ 発売日
- ✅ 価格・セール価格・割引率
- ✅ 星評価・レビュー数
- ✅ 表紙画像URL
- ✅ 商品説明文
- ✅ アフィリエイトリンク

### 統計情報（自動計算）
- ✅ 累計再生回数
- ✅ 紹介動画数
- ✅ 最新言及日時
- ✅ 日次/月次/年次の再生数推移
- ✅ ランキング順位の変動

---

## 🔧 API の制限と注意点

### YouTube Data API v3
- **1日のクォータ**: 10,000 ユニット（無料枠）
- **検索1回**: 100ユニット
- **動画詳細1回**: 1ユニット
- **推奨**: 1日100回程度の検索が上限

### Amazon Product Advertising API v5
- **リクエスト制限**: 1秒に1リクエスト
- **1回の取得**: 最大10商品
- **レスポンス時間**: 通常100-300ms
- **注意**: アソシエイトIDが必要

---

このように、**実際の書籍情報**と**YouTube動画の統計情報**を組み合わせて、リアルタイムで人気の技術書ランキングを作成できます！🚀

