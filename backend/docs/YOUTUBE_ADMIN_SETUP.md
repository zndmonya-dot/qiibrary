# 📺 YouTube動画管理機能セットアップガイド

## 概要

書籍に関連するYouTube動画を手動で紐付ける管理画面の使い方を説明します。

---

## 1️⃣ **管理者トークンの設定**

### **手順1: トークンを生成**

セキュアなランダム文字列を生成します：

**Windowsの場合:**
```powershell
# PowerShellで実行
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**macOS/Linuxの場合:**
```bash
openssl rand -hex 32
```

**出力例:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### **手順2: `.env` ファイルに追加**

`backend/.env` ファイルに以下を追加：

```bash
# 管理画面アクセス用トークン
ADMIN_TOKEN=<上記で生成したトークン>
```

例：
```bash
ADMIN_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### **手順3: バックエンドを再起動**

```bash
cd backend
uvicorn app.main:app --reload
```

---

## 2️⃣ **管理画面へのアクセス**

### **URL:**
```
http://localhost:3000/admin/youtube
```

### **ログイン:**
1. ブラウザで上記URLにアクセス
2. `.env` ファイルに設定した `ADMIN_TOKEN` を入力
3. 「ログイン」ボタンをクリック

---

## 3️⃣ **YouTube動画の追加方法**

### **手順1: 書籍を検索**
1. 検索ボックスに書籍名を入力
2. 「検索」ボタンをクリック
3. 検索結果から目的の書籍をクリック

### **手順2: YouTube動画を追加**
1. YouTube動画のURLを入力欄に貼り付け
   - 例: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. 「追加」ボタンをクリック

### **手順3: 動画の確認・削除**
- 登録済み動画が一覧表示されます
- 削除する場合は「削除」ボタンをクリック

---

## 4️⃣ **対応するYouTube URLフォーマット**

以下の形式のURLに対応しています：

```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
https://www.youtube.com/v/VIDEO_ID
```

---

## 5️⃣ **表示順序について**

動画は追加した順に表示順序が設定されます：

- 1つ目の動画: `display_order = 1`
- 2つ目の動画: `display_order = 2`
- 3つ目の動画: `display_order = 3`

---

## 6️⃣ **セキュリティ上の注意**

### ⚠️ **トークンの管理**

1. **トークンを共有しない**
   - `ADMIN_TOKEN` は管理者のみが知るべき情報です
   - 他の人と共有しないでください

2. **本番環境では強力なトークンを使用**
   - 最低32文字以上のランダムな文字列
   - 英数字と記号を組み合わせる

3. **定期的に変更**
   - セキュリティのため、定期的にトークンを変更してください

---

## 7️⃣ **APIエンドポイント一覧**

管理画面では以下のAPIを使用しています：

### **書籍検索**
```
GET /api/admin/books/search?q=<検索キーワード>
Headers: Authorization: Bearer <ADMIN_TOKEN>
```

### **書籍のYouTube動画取得**
```
GET /api/admin/books/{book_id}/youtube
Headers: Authorization: Bearer <ADMIN_TOKEN>
```

### **YouTube動画追加**
```
POST /api/admin/books/{book_id}/youtube
Headers: Authorization: Bearer <ADMIN_TOKEN>
Body: {
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "display_order": 1
}
```

### **YouTube動画削除**
```
DELETE /api/admin/youtube/{link_id}
Headers: Authorization: Bearer <ADMIN_TOKEN>
```

---

## 8️⃣ **トラブルシューティング**

### **「Invalid admin token」エラー**
- `.env` ファイルの `ADMIN_TOKEN` が正しく設定されているか確認
- バックエンドを再起動してみる

### **「Authorization header required」エラー**
- ログイン画面でトークンを再入力
- ブラウザのlocalStorageをクリアして再ログイン

### **書籍が検索できない**
- データベースに書籍が登録されているか確認
- `python scripts/collect_books_from_qiita.py` でデータを収集

---

## 9️⃣ **フロントエンドでの表示**

追加したYouTube動画は、書籍詳細ページ（`/books/{isbn}`）で自動的に表示されます。

---

## 🔟 **まとめ**

1. `ADMIN_TOKEN` を生成して `.env` に追加
2. `http://localhost:3000/admin/youtube` にアクセス
3. トークンでログイン
4. 書籍を検索してYouTube動画を追加

これで、書籍に関連するYouTube動画を簡単に管理できます！

