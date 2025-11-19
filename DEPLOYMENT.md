# Qiibrary デプロイガイド

## 本番環境HTTPS設定

### 1. Vercel（フロントエンド）

#### 環境変数設定
Vercelダッシュボード → Settings → Environment Variables で以下を設定：

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

- Vercelは自動的にHTTPSを提供します
- カスタムドメインも自動でHTTPS化されます

### 2. Render（バックエンド）

#### 環境変数設定
Renderダッシュボード → Environment で以下を設定：

```
DATABASE_URL=postgresql://neondb_owner:npg_XOEKiw51krxM@ep-wispy-breeze-a4dh6sch-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
QIITA_API_TOKEN=（あなたのQiita APIトークン）
AMAZON_ASSOCIATE_TAG=（あなたのAmazonアソシエイトタグ）
SECRET_KEY=（本番用の安全なキー、32文字以上）
FRONTEND_URL=https://qiibrary.vercel.app
TIMEZONE=Asia/Tokyo
ENVIRONMENT=production
```

- Renderも自動的にHTTPSを提供します
- URLは `https://your-app-name.onrender.com` の形式になります

### 3. NEON Database（PostgreSQL）

- SSL接続は自動的に有効（`sslmode=require`）
- 接続文字列にSSLパラメータが含まれています

---

## ローカル開発環境でのHTTPS対応（オプション）

### Next.js (フロントエンド)

#### 方法1: mkcert（推奨）

```powershell
# Chocolateyでmkcertをインストール
choco install mkcert

# ローカルCA証明書を作成
mkcert -install

# localhost用の証明書を作成
cd frontend
mkcert localhost 127.0.0.1 ::1

# package.jsonのdevスクリプトを更新
# "dev": "next dev --experimental-https --experimental-https-key ./localhost+2-key.pem --experimental-https-cert ./localhost+2.pem"
```

#### 方法2: 自己署名証明書

```powershell
# OpenSSLで自己署名証明書を作成
cd frontend
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### FastAPI (バックエンド)

```powershell
# uvicornでSSL対応起動
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 --ssl-keyfile=../frontend/localhost+2-key.pem --ssl-certfile=../frontend/localhost+2.pem
```

### 環境変数

#### backend/.env
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booktuber?client_encoding=utf8
QIITA_API_TOKEN=your_token
AMAZON_ASSOCIATE_TAG=your-tag-22
SECRET_KEY=dev-secret-key-change-in-production
FRONTEND_URL=https://localhost:3000
TIMEZONE=Asia/Tokyo
ENVIRONMENT=development
```

#### frontend/.env.local
```
NEXT_PUBLIC_API_URL=https://localhost:8000
```

---

## セキュリティチェックリスト

### 本番環境

- [ ] `SECRET_KEY`を32文字以上のランダム文字列に変更
- [ ] `ENVIRONMENT=production`に設定
- [ ] `DATABASE_URL`にSSLパラメータ（`sslmode=require`）が含まれている
- [ ] CORS設定が適切（本番URLのみ許可）
- [ ] API_TOKENが環境変数で管理されている
- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] Vercel/Renderの環境変数が設定されている

### 開発環境

- [ ] ローカルデータベースへの接続が動作する
- [ ] フロントエンドがバックエンドAPIに接続できる
- [ ] CORS設定でlocalhostが許可されている

---

## トラブルシューティング

### Mixed Content エラー

HTTPSページからHTTP APIへのアクセスはブロックされます。

**解決策**: フロントエンド・バックエンド両方をHTTPSにする

### CORS エラー

バックエンドの`allowed_origins`に本番URLが含まれているか確認

**解決策**: `backend/app/main.py`の`allowed_origins`を更新

### SSL証明書エラー

自己署名証明書の場合、ブラウザで警告が表示されます

**解決策**: mkcertを使用してローカルCA証明書を作成

---

## デプロイフロー

1. GitHubにpush
   ```bash
   git add .
   git commit -m "Update for HTTPS"
   git push origin main
   ```

2. Vercel（自動デプロイ）
   - mainブランチへのpushで自動デプロイ
   - ビルドログを確認: https://vercel.com/dashboard

3. Render（自動デプロイ）
   - mainブランチへのpushで自動デプロイ
   - ログを確認: https://dashboard.render.com/

4. 動作確認
   - [ ] フロントエンドがHTTPSでアクセス可能
   - [ ] バックエンドAPIがHTTPSでアクセス可能
   - [ ] ランキングページが正常に表示される
   - [ ] 書籍詳細ページが正常に表示される
   - [ ] NEWバッジが正しく表示される

---

## 本番URLの例

- フロントエンド: `https://qiibrary.vercel.app`
- バックエンド: `https://qiibrary-api.onrender.com`
- データベース: `postgresql://...@...neon.tech/...?sslmode=require`
