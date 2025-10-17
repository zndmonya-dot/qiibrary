# BookTuber セットアップ & データ収集ガイド

## 🚀 クイックスタート

### **1. YouTube API キーの取得**

1. Google Cloud Console にアクセス: https://console.cloud.google.com/
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. **API とサービス** → **ライブラリ** → 「YouTube Data API v3」を検索
4. **有効にする** をクリック
5. **認証情報** → **認証情報を作成** → **APIキー**
6. 作成されたAPIキーをコピー

### **2. 環境変数の設定**

`backend/.env` ファイルを作成（またはコピー）：

```bash
# backend/ ディレクトリで
copy env.local .env
```

`.env` ファイルを編集：

```bash
# YouTube API（必須）
YOUTUBE_API_KEY=your_actual_youtube_api_key_here

# Amazon API（オプション - 実際の書籍情報を取得する場合）
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_ASSOCIATE_TAG=your_associate_tag

# Database（既に設定済み）
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booktuber?client_encoding=utf8
```

### **3. データベースのセットアップ**

pgAdmin 4 で `booktuber` データベースを作成（UTF-8エンコーディング）。

### **4. セットアップスクリプトの実行**

```bash
cd backend
python scripts\setup_and_collect.py --keywords 3
```

**オプション:**
- `--keywords N`: ロケールごとの検索キーワード数（デフォルト: 5）
- `--no-clear`: 既存データをクリアせずに追加モードで実行

**実行内容:**
1. データベーステーブルの作成
2. 既存データのクリア（`--no-clear`を指定しない場合）
3. YouTube APIで日本語キーワードを検索（IT技術書の動画を取得）
4. YouTube APIで英語キーワードを検索
5. 動画説明からAmazonリンクを抽出
6. Amazon APIで書籍情報を取得（またはフォールバック）
7. データベースに保存
8. 統計データの生成

### **5. バックエンドの起動**

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **6. フロントエンドの起動**

```bash
cd frontend
npm run dev
```

### **7. ブラウザで確認**

- **フロントエンド**: http://localhost:3000 (または 3001)
- **バックエンドAPI**: http://localhost:8000/docs

---

## 📊 YouTube API クォータ管理

YouTube Data API v3 には1日あたり **10,000ポイント** の制限があります。

**クォータコスト:**
- 検索（search.list）: **100ポイント**
- 動画詳細（videos.list）: **1ポイント**

**推奨設定:**
- `--keywords 3`: 1日に最大6回実行可能（日本語3 + 英語3 = 600ポイント）
- `--keywords 5`: 1日に最大10回実行可能（1,000ポイント）

詳細は [`QUOTA_MANAGEMENT.md`](./QUOTA_MANAGEMENT.md) を参照。

---

## 🔧 トラブルシューティング

### **エンコーディングエラー**

```
'utf-8' codec can't decode byte 0x83
```

**解決方法:**
1. pgAdmin 4 で `booktuber` データベースを削除
2. 新しいデータベースを作成（**Encoding**: UTF8）
3. または、`.env` の `DATABASE_URL` に `?client_encoding=utf8` を追加

### **YouTube API エラー**

```
API key not valid. Please pass a valid API key.
```

**解決方法:**
- `.env` ファイルに正しいYouTube APIキーを設定
- APIキーに空白や改行が含まれていないか確認

### **データが取得できない**

**確認事項:**
1. YouTube APIキーが有効か
2. クォータ制限を超えていないか（Google Cloud Consoleで確認）
3. インターネット接続が正常か

---

## 📝 定期的なデータ更新

### **手動実行**

```bash
# 追加モード（既存データを残す）
python scripts\setup_and_collect.py --no-clear --keywords 3

# クリア＆再構築
python scripts\setup_and_collect.py --keywords 5
```

### **自動化（Windows タスクスケジューラ）**

1. **タスクスケジューラ** を開く
2. **基本タスクの作成**
3. **トリガー**: 毎日 深夜2時
4. **操作**: プログラムの開始
   - **プログラム**: `C:\Path\To\Python\python.exe`
   - **引数**: `scripts\setup_and_collect.py --no-clear --keywords 3`
   - **開始**: `C:\booktube\v0.0.0\backend`

---

## 🎯 次のステップ

1. **Amazon Product Advertising API**: 実際の書籍情報（タイトル、著者、価格など）を取得
2. **バックグラウンドジョブ**: CeleryやAPSchedulerで自動データ収集
3. **キャッシング**: Redisでランキング結果をキャッシュ
4. **デプロイ**: Vercel (Frontend) + Railway (Backend) + Supabase (DB)

詳細は [`ARCHITECTURE.md`](../ARCHITECTURE.md) と [`DEPLOYMENT.md`](../DEPLOYMENT.md) を参照。

---

## 📧 サポート

問題が発生した場合は、以下を確認してください：
- ログファイル: `backend/logs/`
- Google Cloud Console: クォータ使用状況
- PostgreSQL ログ: pgAdmin 4

Happy Coding! 🚀

