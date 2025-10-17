# セットアップ完了

## サーバー起動状態

### バックエンド（FastAPI）
- **URL**: http://localhost:8000
- **APIドキュメント**: http://localhost:8000/docs
- **ヘルスチェック**: http://localhost:8000/health

### フロントエンド（Next.js）
- **URL**: http://localhost:3000

## 動作確認

### 1. バックエンドAPI確認
ブラウザで以下にアクセス：
- http://localhost:8000/docs - Swagger UI（対話的なAPIドキュメント）
- http://localhost:8000/api/rankings/daily - 日別ランキング（サンプルデータ）
- http://localhost:8000/api/books/4873115655 - 書籍詳細（リーダブルコード）

### 2. フロントエンド確認
ブラウザで http://localhost:3000 にアクセス

**表示される画面**:
- YouTubeカラーテーマ（赤`#FF0000` + ダーク背景`#0F0F0F`）
- 日別・月別・年別タブ切り替え
- TOP 5の技術書ランキング
- 各書籍に「紹介動画を見る」「Amazonで購入」ボタン

**書籍詳細ページ**:
- 任意の書籍をクリック → 詳細ページ表示
- YouTube動画埋め込み
- 書籍情報詳細
- 複数のCTAボタン

## サンプルデータ

現在、以下の5冊のサンプルデータが表示されます：

1. **リーダブルコード** - Dustin Boswell
2. **プログラマーのためのCPU入門** - Takenobu T.
3. **良いコード/悪いコードで学ぶ設計入門** - 仙塲 大也
4. **ゼロから作るDeep Learning** - 斎藤 康毅
5. **現場で使える！pandas データ前処理入門** - 株式会社ロンバート

## 次のステップ

### データベースセットアップ（未実装）
現在はサンプルデータのみです。実際のデータベースを使用する場合：

1. PostgreSQLをインストール
2. データベース作成
3. `backend/.env` を編集（DATABASE_URLを設定）
4. マイグレーション実行:
   ```bash
   cd backend
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

### YouTube APIとAmazon API連携（未実装）
APIキーを取得して `backend/.env` に設定してください。

### 実装が必要な機能
- [ ] データベースモデルの実装
- [ ] YouTube Data API連携
- [ ] Amazon Product Advertising API連携
- [ ] Amazonリンク抽出ロジック
- [ ] Celeryバックグラウンドジョブ
- [ ] 管理画面

## トラブルシューティング

### ポートが使用中の場合
別のポートで起動：
```bash
# バックエンド
.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8001

# フロントエンド（package.jsonを編集するか）
npm run dev -- -p 3001
```

### パッケージの再インストール
```bash
# バックエンド
.venv\Scripts\python.exe -m pip install -r backend\requirements.txt

# フロントエンド
cd frontend
npm install
```

## デザイン

### YouTubeカラーパレット
- メインカラー: `#FF0000` (赤)
- 背景: `#0F0F0F` (ダークグレー)
- カード: `#212121`
- ホバー: `#3F3F3F`
- テキスト: `#FFFFFF` (メイン) / `#AAAAAA` (セカンダリ)

### アイコン
Remix Icon（remixicon.com）を使用

## サーバー停止方法

バックグラウンドで起動したサーバーを停止する場合：
1. タスクマネージャーを開く
2. `python.exe` と `node.exe` のプロセスを終了

または、各ターミナルで `Ctrl + C`

