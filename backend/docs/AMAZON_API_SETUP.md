# Amazon Product Advertising API 設定ガイド

## 📋 概要

BookTuberで実際の書籍情報（タイトル、著者、価格、画像など）を取得するには、Amazon Product Advertising API (PA-API 5.0) の認証情報が必要です。

---

## ⚠️ 重要な前提条件

1. **Amazonアソシエイト・プログラムへの参加が必須**
2. **審査があります**（通常1-2営業日）
3. **登録後180日以内に3件以上の適格売上が必要**
   - 売上がない場合、アカウントが停止される可能性があります
   - テスト期間中はダミーデータで動作確認できます

---

## 🚀 ステップ1: Amazonアソシエイトに登録

### 1-1. サインアップ

**日本の場合:**
- URL: https://affiliate.amazon.co.jp/
- 「無料アカウントを作成する」をクリック

**アメリカの場合:**
- URL: https://affiliate-program.amazon.com/
- 「Join Now for Free」をクリック

### 1-2. 必要情報の入力

1. **アカウント情報**
   - 名前、住所、電話番号

2. **ウェブサイト/アプリ情報**
   - ウェブサイトURL（BookTuberのURL）
   - モバイルアプリ（該当する場合）

3. **ウェブサイト/アプリの説明**
   - 「IT技術書のランキングサイト」
   - 「YouTubeで紹介された技術書をランキング形式で表示」

4. **収益化方法**
   - アフィリエイトリンク経由での購入

5. **支払い情報**
   - 銀行口座情報（報酬の受け取り用）

### 1-3. 審査

- 審査結果は通常1-2営業日でメールで通知されます
- 審査基準:
  - ウェブサイトが実際に存在し、稼働していること
  - コンテンツが適切であること
  - 規約に違反していないこと

---

## 🔑 ステップ2: PA-API 認証情報の取得

### 2-1. アソシエイト・セントラルにアクセス

審査通過後、以下にログイン:
- 日本: https://affiliate.amazon.co.jp/
- アメリカ: https://affiliate-program.amazon.com/

### 2-2. Product Advertising API にアクセス

1. ログイン後、**「ツール」**メニューをクリック
2. **「Product Advertising API」**を選択
3. **「認証情報を管理」**または **「Add Credentials」**をクリック

### 2-3. 認証情報を取得

以下の3つの情報が表示されます:

```
Access Key (アクセスキー):
例: AKIAI************

Secret Key (シークレットキー):
例: ****************************************

Associate Tag (アソシエイトタグ):
例: yourtag-22
```

### ⚠️ **重要:**
- **Secret Key は一度しか表示されません！**
- 必ずコピーして安全な場所に保存してください
- 紛失した場合は、新しい認証情報を作成する必要があります

---

## 🛠️ ステップ3: BookTuber に設定

### 3-1. .env ファイルを作成

`backend`ディレクトリに `.env` ファイルを作成します:

```bash
cd c:\booktube\v0.0.0\backend
notepad .env
```

### 3-2. 認証情報を設定

`.env` ファイルに以下を記述:

```env
# データベース設定
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booktuber?client_encoding=utf8

# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key_here

# Amazon Product Advertising API v5
AMAZON_ACCESS_KEY=AKIAI************          # ← ここを実際の Access Key に置き換え
AMAZON_SECRET_KEY=**********************    # ← ここを実際の Secret Key に置き換え
AMAZON_ASSOCIATE_TAG=yourtag-22             # ← ここを実際の Associate Tag に置き換え
AMAZON_REGION=jp                            # 日本の場合は jp、アメリカの場合は us

# その他の設定
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
TIMEZONE=Asia/Tokyo
ENVIRONMENT=development
```

### 3-3. 設定を保存

ファイルを保存して閉じます。

---

## ✅ ステップ4: 動作確認

### 4-1. データを再収集

```bash
cd c:\booktube\v0.0.0\backend
python scripts\setup_and_collect.py --keywords 3
```

### 4-2. 成功メッセージを確認

Amazon APIが正常に動作している場合:

```
✓ Amazon API: 'リーダブルコード' の情報を取得
✓ Amazon API: 'プログラマーのためのCPU入門' の情報を取得
```

ダミーデータを使用している場合:

```
ℹ ダミーデータを使用: B0DZDXLF1W
```

### 4-3. フロントエンドで確認

1. ブラウザで http://localhost:3000 を開く
2. ページをリロード（F5）
3. 実際の書籍タイトルが表示されることを確認

---

## 🚨 トラブルシューティング

### エラー1: "Amazon API エラー: Invalid credentials"

**原因:** Access Key または Secret Key が間違っています

**解決策:**
1. `.env` ファイルの認証情報を再確認
2. スペースや改行が含まれていないか確認
3. アソシエイト・セントラルで新しい認証情報を作成

### エラー2: "Amazon API エラー: RequestThrottled"

**原因:** APIのリクエスト制限を超えています

**解決策:**
1. 少し時間を置いてから再試行
2. `--keywords` の数を減らす（例: `--keywords 2`）

### エラー3: "ダミーデータを使用"と表示される

**原因:** 以下のいずれか
- `.env` ファイルが読み込まれていない
- 認証情報が設定されていない
- API キーが無効

**解決策:**
1. `.env` ファイルが `backend` ディレクトリに存在するか確認
2. ファイル名が `.env` であることを確認（`.env.txt` ではない）
3. バックエンドを再起動

### エラー4: "アソシエイトアカウントが無効です"

**原因:** 180日以内に3件の売上がなかった

**解決策:**
1. Amazonアソシエイトに再登録
2. それまではダミーデータで動作確認

---

## 📊 API 使用制限

### リクエスト制限（スロットリング）

- **新規アカウント:** 1秒あたり1リクエスト
- **売上実績あり:** 売上に応じて制限が緩和される

### 推奨事項

1. **キャッシュを活用**（BookTuberでは自動実装済み）
2. **バッチ処理**で一度に複数の書籍を取得
3. **定期的な更新**（毎日1回など）にとどめる

---

## 🔐 セキュリティのベストプラクティス

### ⚠️ やってはいけないこと

1. **Git に `.env` をコミットしない**
   - `.gitignore` に `.env` が含まれていることを確認

2. **Secret Key を公開しない**
   - GitHub、SNS、フォーラムなどに投稿しない

3. **フロントエンドに認証情報を埋め込まない**
   - 必ずバックエンドでのみ使用

### ✅ やるべきこと

1. **定期的に認証情報をローテーション**
2. **不要になった認証情報は削除**
3. **本番環境では環境変数を使用**

---

## 📚 参考リンク

### 公式ドキュメント

- [Product Advertising API 公式ドキュメント](https://webservices.amazon.com/paapi5/documentation/)
- [Amazonアソシエイト ヘルプ](https://affiliate.amazon.co.jp/help)
- [PA-API 5.0 移行ガイド](https://webservices.amazon.com/paapi5/documentation/migration-guide.html)

### 利用規約

- [Amazonアソシエイト・プログラム運営規約](https://affiliate.amazon.co.jp/help/operating/agreement)
- [Product Advertising API 利用規約](https://affiliate-program.amazon.com/help/operating/policies)

---

## 💡 よくある質問（FAQ）

### Q1: APIキーの取得に費用はかかりますか？

**A:** いいえ、無料です。ただし、Amazonアソシエイト・プログラムへの参加が必要です。

### Q2: どのくらいで審査結果が出ますか？

**A:** 通常1-2営業日です。

### Q3: 個人でも登録できますか？

**A:** はい、個人でも登録できます。

### Q4: 売上がないとAPIが使えなくなりますか？

**A:** はい、登録後180日以内に3件以上の適格売上がない場合、アカウントが停止される可能性があります。

### Q5: ダミーデータのままでも動作確認できますか？

**A:** はい、YouTube動画の情報とランキング機能は正常に動作します。実際の書籍情報のみダミーになります。

---

## 🎯 まとめ

1. ✅ Amazonアソシエイトに登録（審査あり）
2. ✅ Product Advertising API の認証情報を取得
3. ✅ `backend/.env` ファイルに設定
4. ✅ データを再収集して動作確認

**次のステップ:** [YouTube API設定ガイド](./YOUTUBE_API_SETUP.md)

