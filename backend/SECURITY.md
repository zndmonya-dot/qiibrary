# セキュリティガイド

Qiibraryアプリケーションのセキュリティ対策とベストプラクティスをまとめたドキュメントです。

## 📋 目次

1. [実装済みのセキュリティ機能](#実装済みのセキュリティ機能)
2. [環境変数の管理](#環境変数の管理)
3. [管理者API認証](#管理者api認証)
4. [CORS設定](#cors設定)
5. [レート制限](#レート制限)
6. [入力検証](#入力検証)
7. [セキュリティヘッダー](#セキュリティヘッダー)
8. [データベースセキュリティ](#データベースセキュリティ)
9. [ログとモニタリング](#ログとモニタリング)
10. [脆弱性スキャン](#脆弱性スキャン)
11. [インシデント対応](#インシデント対応)

---

## 🛡️ 実装済みのセキュリティ機能

### 1. 管理者API認証
- **ベアラートークン認証**: すべての管理者APIエンドポイント（`/api/admin/*`）へのアクセスを保護
- **タイミング攻撃対策**: `secrets.compare_digest`を使用した安全なトークン比較
- **認証失敗ログ**: 不正アクセス試行を記録

### 2. レート制限
- **分単位制限**: 30リクエスト/分/IPアドレス
- **時間単位制限**: 300リクエスト/時/IPアドレス
- **管理者API除外**: 管理者APIはレート制限の対象外
- **DDoS対策**: 過剰なリクエストを自動的にブロック

### 3. セキュリティヘッダー
- **HSTS**: HTTPS接続の強制（本番環境のみ）
- **CSP**: コンテンツセキュリティポリシーで不正なコンテンツ実行を防止
- **X-Frame-Options**: クリックジャッキング攻撃を防止
- **X-Content-Type-Options**: MIMEタイプスニッフィング攻撃を防止
- **その他**: Referrer-Policy, Permissions-Policy, X-XSS-Protection

### 4. 入力検証
- **Pydanticモデル**: すべてのAPIエンドポイントで厳格な型チェック
- **SQLインジェクション対策**: 危険な文字の除外とパラメータ化クエリ
- **XSS対策**: 検索クエリから危険な文字を除外
- **文字数制限**: 各入力フィールドに適切な長さ制限

### 5. データベースセキュリティ
- **接続プール最適化**: 過剰な接続を防止（pool_size=5, max_overflow=10）
- **パラメータ化クエリ**: SQLインジェクションを完全に防止
- **インデックス推奨**: パフォーマンスとセキュリティの両立

---

## 🔐 環境変数の管理

### 必須の環境変数（本番環境）

```bash
# 管理者認証トークン（必須）
ADMIN_TOKEN=<16文字以上のランダム文字列>

# JWT秘密鍵（必須）
SECRET_KEY=<32文字以上のランダム文字列>

# 環境設定
ENVIRONMENT=production

# データベースURL
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
```

### セキュアなトークン生成方法

```bash
# ADMIN_TOKENの生成
openssl rand -hex 32

# SECRET_KEYの生成
openssl rand -hex 32
```

### 環境変数の検証

アプリケーション起動時に以下を自動チェック:
- **本番環境でのデフォルト値禁止**: `dev-`で始まるSECRET_KEYは拒否
- **ADMIN_TOKEN長さチェック**: 16文字未満は警告
- **SECRET_KEY長さチェック**: 32文字未満は本番環境でエラー

### .envファイルの保護

```bash
# .envファイルを必ず.gitignoreに追加
echo ".env" >> .gitignore

# .envファイルのパーミッション設定（Unix/Linux）
chmod 600 .env
```

---

## 🔑 管理者API認証

### 認証方法

すべての管理者APIリクエストにベアラートークンが必要:

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     https://api.example.com/api/admin/cache/stats
```

### 保護されているエンドポイント

- `POST /api/admin/data-update` - データ更新
- `GET /api/admin/cache/stats` - キャッシュ統計
- `POST /api/admin/cache/clear` - キャッシュクリア
- `POST /api/admin/cache/cleanup` - キャッシュクリーンアップ
- その他すべての `/api/admin/*` エンドポイント

### 認証エラーハンドリング

- **401 Unauthorized**: トークンなし、または不正なトークン
- **ログ記録**: すべての認証失敗をログに記録
- **自動ブロック**: レート制限と組み合わせてブルートフォース攻撃を防止

---

## 🌐 CORS設定

### 許可されたオリジン

開発環境:
```
http://localhost:3000
https://localhost:3000
```

本番環境:
```
https://qiibrary.com
https://www.qiibrary.com
https://qiibrary.vercel.app
```

### CORS設定のカスタマイズ

環境変数で追加のオリジンを許可可能:

```bash
EXTRA_ALLOWED_ORIGINS=https://example.com,https://another-domain.com
```

### セキュリティ推奨事項

- **ワイルドカード禁止**: `*` は絶対に使用しない
- **HTTPSのみ**: 本番環境ではHTTPSオリジンのみ許可
- **厳格なドメイン**: サブドメインも明示的に指定

---

## ⏱️ レート制限

### 制限値

| 期間 | 制限 | 対象 |
|------|------|------|
| 1分間 | 30リクエスト | 全エンドポイント（管理者API除く） |
| 1時間 | 300リクエスト | 全エンドポイント（管理者API除く） |

### レート制限の調整

`backend/app/middleware/rate_limit.py` で設定変更可能:

```python
app.add_middleware(
    RateLimitMiddleware,
    limit_per_minute=30,  # 1分間の制限
    limit_per_hour=300    # 1時間の制限
)
```

### レート制限エラー

- **429 Too Many Requests**: 制限超過時に返される
- **詳細メッセージ**: "Too Many Requests (minute limit)" または "Too Many Requests (hour limit)"

---

## ✅ 入力検証

### 検証スキーマ

`backend/app/schemas/validation.py` で定義:

#### ランキングクエリ
```python
- tags: 最大200文字、英数字と日本語のみ
- days: 1-3650の整数
- year: 2010-2100の整数
- month: 1-12の整数
- limit: 1-100の整数
- offset: 0-10000の整数
- search: 最大100文字、危険な文字を除外
```

#### ISBN検証
```python
- 10桁または13桁の数字のみ
```

### SQLインジェクション対策

1. **危険な文字の除外**: `[<>"';\\]` を自動削除
2. **パラメータ化クエリ**: すべてのSQLクエリでプレースホルダー使用
3. **文字列長制限**: 検索キーワードは100文字まで

### XSS対策

- 検索クエリから `<>` タグを除外
- エスケープ処理を自動適用
- APIレスポンスは常にJSON形式

---

## 🔒 セキュリティヘッダー

### 自動追加されるヘッダー

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
X-XSS-Protection: 1; mode=block
```

### 管理者APIのキャッシュ防止

管理者APIレスポンスには追加のヘッダー:

```
Cache-Control: no-store, no-cache, must-revalidate, private
Pragma: no-cache
Expires: 0
```

---

## 🗄️ データベースセキュリティ

### 接続セキュリティ

```python
# Neon（本番環境）
connect_args={
    "sslmode": "require",              # SSL必須
    "connect_timeout": 10,             # タイムアウト10秒
    "keepalives": "1",                 # キープアライブ有効
    "keepalives_idle": "30",           # 30秒ごとにキープアライブ
    "keepalives_interval": "10",       # 10秒間隔でリトライ
    "keepalives_count": "5"            # 5回リトライ
}
```

### 推奨インデックス

`backend/RECOMMENDED_INDEXES.sql` を実行してパフォーマンスとセキュリティを向上:

```bash
psql $DATABASE_URL -f backend/RECOMMENDED_INDEXES.sql
```

### バックアップ

定期的なバックアップを推奨:
- **頻度**: 日次（最低）
- **保存期間**: 30日間
- **暗号化**: バックアップファイルは暗号化保存

---

## 📊 ログとモニタリング

### ログレベル

```python
# 開発環境
logging.level = INFO

# 本番環境
logging.level = WARNING
```

### セキュリティログ

以下のイベントを自動的にログ記録:
- ✅ 管理者API認証成功/失敗
- ✅ レート制限超過
- ✅ 入力検証エラー
- ✅ データベース接続エラー
- ✅ 環境変数の設定警告

### 機密情報の除外

ログに以下を**絶対に含めない**:
- ❌ パスワード
- ❌ APIトークン
- ❌ SECRET_KEY
- ❌ ADMIN_TOKEN
- ❌ データベース接続文字列

### モニタリング推奨ツール

- **Sentry**: エラートラッキング（推奨）
- **New Relic**: APMとパフォーマンスモニタリング
- **Datadog**: インフラとログ統合

---

## 🔍 脆弱性スキャン

### 依存関係の脆弱性チェック

```bash
# pip-auditのインストール
pip install pip-audit

# 脆弱性スキャン
pip-audit

# 自動修正
pip-audit --fix
```

### 定期的なアップデート

```bash
# 依存関係のアップデート
pip list --outdated
pip install --upgrade <package-name>

# requirements.txt更新
pip freeze > requirements.txt
```

### セキュリティアドバイザリの確認

- [GitHub Security Advisories](https://github.com/advisories)
- [PyPI Advisory Database](https://github.com/pypa/advisory-database)
- [Snyk Vulnerability Database](https://snyk.io/vuln/)

---

## 🚨 インシデント対応

### セキュリティインシデントの検知

以下の兆候に注意:
1. **異常なトラフィック**: 短時間に大量のリクエスト
2. **認証失敗の急増**: ブルートフォース攻撃の可能性
3. **不正なSQLクエリ**: ログにSQLエラーが多発
4. **データベース負荷**: CPU/メモリ使用率の急上昇

### 対応手順

#### 1. 即座の対応（5分以内）
```bash
# 疑わしいIPからのトラフィックをブロック
# Cloudflare/Vercelのファイアウォールで対応

# 管理者トークンをローテーション
export ADMIN_TOKEN=$(openssl rand -hex 32)
```

#### 2. 調査（30分以内）
```bash
# ログを確認
grep "401 Unauthorized" /var/log/app.log
grep "429 Too Many Requests" /var/log/app.log

# データベースをチェック
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
```

#### 3. 復旧と報告（1時間以内）
- 影響範囲の特定
- 必要に応じてデータベースを復元
- インシデントレポート作成
- ユーザーへの通知（必要な場合）

### 緊急連絡先

```
セキュリティ担当: security@qiibrary.com
インフラ担当: infrastructure@qiibrary.com
```

---

## 📝 セキュリティチェックリスト

### デプロイ前

- [ ] `ENVIRONMENT=production` を設定
- [ ] `ADMIN_TOKEN` を強力なランダム値に設定（16文字以上）
- [ ] `SECRET_KEY` を強力なランダム値に設定（32文字以上）
- [ ] データベースURLが正しく設定されている
- [ ] CORS設定が本番ドメインのみ許可
- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] HTTPS強制が有効
- [ ] データベースインデックスが適用済み
- [ ] 依存関係の脆弱性スキャン実施

### 定期チェック（月次）

- [ ] 依存関係のアップデート
- [ ] セキュリティログの確認
- [ ] 異常なトラフィックパターンの確認
- [ ] データベースバックアップの検証
- [ ] トークンのローテーション（必要に応じて）

---

## 🔗 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

## 📞 連絡先

セキュリティに関する懸念事項や脆弱性を発見した場合:

**Email**: security@qiibrary.com  
**Response Time**: 24時間以内

---

**最終更新**: 2025-10-24  
**バージョン**: 1.0.0

