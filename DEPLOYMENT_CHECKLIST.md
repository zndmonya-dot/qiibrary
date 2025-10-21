# 🚀 デプロイ前チェックリスト

## ✅ 完了した準備作業

### 1. データベース準備
- ✅ Neonデータベース（qiibrary）にデータ移行完了
  - books: 17,346件
  - qiita_articles: 22,750件
  - book_qiita_mentions: 43,272件

### 2. コード修正
- ✅ CORS設定を更新（Vercel URLを許可）
- ✅ 一時スクリプトをアーカイブに整理

### 3. Git状態
- ✅ 変更ファイル確認済み
  - `backend/app/main.py` - CORS設定追加
  - `.gitignore` - アーカイブフォルダ除外

---

## 📋 デプロイ手順

### Step 1: Gitコミット
```bash
git add backend/app/main.py .gitignore
git commit -m "fix: Add Vercel CORS origin and organize temporary scripts"
git push origin main
```

### Step 2: Renderの環境変数を設定
Renderダッシュボードで以下を設定：

```
DATABASE_URL=postgresql://neondb_owner:npg_XOEKiw51krxM@ep-wispy-breeze-addh6sch-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

FRONTEND_URL=https://qiibrary.vercel.app
```

**設定手順:**
1. https://render.com/ にログイン
2. `qiibrary` サービスを選択
3. `Environment` タブを開く
4. 上記の環境変数を追加
5. `Save Changes` → 自動で再デプロイ

### Step 3: 動作確認
1. **APIの確認**
   ```
   https://qiibrary.onrender.com/
   https://qiibrary.onrender.com/docs
   https://qiibrary.onrender.com/api/rankings/
   ```

2. **フロントエンドの確認**
   ```
   https://qiibrary.vercel.app
   ```

3. **データ取得の確認**
   - トップページでランキングが表示されるか
   - 書籍詳細ページが開けるか

---

## 🔍 トラブルシューティング

### APIがタイムアウトする場合
- Renderの無料プランはスリープするので、初回は起動に時間がかかります
- 30秒～1分待ってから再度アクセス

### データが表示されない場合
1. Renderのログを確認
2. DATABASE_URLが正しく設定されているか確認
3. Neonデータベースに接続できているか確認

### CORSエラーが出る場合
- FRONTEND_URLが正しく設定されているか確認
- ブラウザのコンソールでエラー内容を確認

---

## 📝 変更内容サマリー

**backend/app/main.py:**
- Vercel本番URL (`https://qiibrary.vercel.app`) をCORS許可リストに追加
- より柔軟なCORS設定に変更

**.gitignore:**
- 一時移行スクリプトのアーカイブフォルダを除外
- データベース接続情報ファイルを除外

---

## ✨ デプロイ後の確認項目

- [ ] API が正常に起動している
- [ ] ランキングAPIがデータを返す
- [ ] フロントエンドが表示される
- [ ] CORSエラーが出ない
- [ ] 書籍詳細ページが開ける
- [ ] Neonデータベースからデータが取得できている

---

**作成日:** 2025-10-21
**プロジェクト:** qiibrary (旧 booktube)



