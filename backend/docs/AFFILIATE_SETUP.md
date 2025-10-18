# アフィリエイト設定ガイド

## 概要

BookTuberでは、AmazonアソシエイトプログラムとRakuten楽天アフィリエイトの両方を使用して収益化を行います。

## 重要な設計方針

### 現在（一時的な実装）
```
Qiita記事 → ISBN抽出 → 楽天Books API → 書籍情報取得
                ↓
        Amazonアフィリエイトリンク生成（ISBNベース）
        楽天アフィリエイトリンク生成（楽天APIレスポンスから）
```

### 将来（Amazon PA-API承認後）
```
Qiita記事 → ISBN抽出 → Amazon PA-API → 書籍情報取得（優先）
                ↓                ↓
        楽天Books API（フォールバック）
                ↓
        Amazonアフィリエイトリンク（API経由の正確なURL）
        楽天アフィリエイトリンク
```

## 1. Amazonアソシエイトプログラム

### 登録方法
1. https://affiliate.amazon.co.jp/ にアクセス
2. Amazonアカウントでサインイン
3. 「無料アカウントを作成する」をクリック
4. 必要情報を入力（サイト情報、支払い情報など）
5. アソシエイトタグを取得

### アソシエイトタグの形式
```
your-site-name-22
```

### .envファイルへの設定
```bash
AMAZON_ASSOCIATE_TAG=your-site-name-22
```

### 現在の実装（ISBNベース）

```python
def generate_amazon_affiliate_url(self, isbn: str) -> str:
    """
    ISBNからAmazonアフィリエイトURLを生成
    
    現在はISBNベースでURLを生成。
    将来的にAmazon PA-API承認後は、APIから正確なASINとURLを取得。
    """
    base_url = f"https://www.amazon.co.jp/dp/{isbn}"
    
    if settings.AMAZON_ASSOCIATE_TAG:
        return f"{base_url}?tag={settings.AMAZON_ASSOCIATE_TAG}"
    return base_url
```

### リンク形式
```
https://www.amazon.co.jp/dp/{ISBN}?tag={YOUR_TAG}
```

**例:**
```
https://www.amazon.co.jp/dp/9784297139643?tag=booktuber-22
```

---

## 2. Rakuten楽天アフィリエイト

### 登録方法
1. https://affiliate.rakuten.co.jp/ にアクセス
2. 楽天会員IDでログイン
3. アフィリエイト申請（審査あり）
4. アフィリエイトIDを取得

### アフィリエイトIDの形式
```
1234abcd.5678efgh.1234abcd.9012ijkl
```
※ 4つの部分がドット(.)で区切られている

### .envファイルへの設定
```bash
# 実際に取得したIDを設定してください
RAKUTEN_AFFILIATE_ID=4d68df76.e6c2f9be.4d68df77.c1a45e1f
```

### 現在の実装

```python
# 楽天アフィリエイトリンク生成
if settings.RAKUTEN_AFFILIATE_ID and item_url:
    affiliate_parts = settings.RAKUTEN_AFFILIATE_ID.split('.')
    if len(affiliate_parts) == 4:
        affiliate_url = f"https://hb.afl.rakuten.co.jp/hgc/{affiliate_parts[0]}/{affiliate_parts[1]}/{affiliate_parts[2]}/{affiliate_parts[3]}/?pc={item_url}"
```

### リンク形式
```
https://hb.afl.rakuten.co.jp/hgc/{PART1}/{PART2}/{PART3}/{PART4}/?pc={PRODUCT_URL}
```

**例:**
```
https://hb.afl.rakuten.co.jp/hgc/4d68df76/e6c2f9be/4d68df77/c1a45e1f/?pc=https://books.rakuten.co.jp/rb/17627318/
```

---

## 3. .envファイルのセットアップ

### 現在のbackend/.envファイルを作成

```bash
cd backend
cp .env.template .env  # テンプレートをコピー
```

### 実際の値を設定

```bash
# backend/.env

# データベース
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booktuber?client_encoding=utf8

# Qiita API
QIITA_API_TOKEN=e7a768292ef8fcf440fd5991d5f1c40ba26962ed

# 楽天Books API
RAKUTEN_APPLICATION_ID=1071050827889458183

# アフィリエイト設定（重要！）
AMAZON_ASSOCIATE_TAG=booktuber-22  # ← 実際のタグに変更
RAKUTEN_AFFILIATE_ID=4d68df76.e6c2f9be.4d68df77.c1a45e1f

# その他
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
TIMEZONE=Asia/Tokyo
ENVIRONMENT=development
```

---

## 4. アフィリエイトリンクの動作確認

### テストスクリプト

```python
# backend/scripts/test_affiliate_links.py
from app.config.settings import settings
from app.services.rakuten_books_service import get_rakuten_books_service

def test_affiliate_links():
    # テスト用ISBN
    test_isbn = "9784297139643"
    
    # 楽天Books API経由でアフィリエイトリンク生成
    service = get_rakuten_books_service()
    book_info = service.get_book_by_isbn(test_isbn)
    
    if book_info:
        print("✅ 書籍情報取得成功")
        print(f"タイトル: {book_info['title']}")
        print(f"Amazon URL: {book_info.get('amazon_url')}")
        print(f"Amazonアフィリエイト: {book_info.get('amazon_affiliate_url')}")
        print(f"楽天 URL: {book_info.get('rakuten_url')}")
        print(f"楽天アフィリエイト: {book_info.get('rakuten_affiliate_url')}")
    else:
        print("❌ 書籍情報取得失敗")
```

実行:
```bash
cd backend
python scripts/test_affiliate_links.py
```

---

## 5. フロントエンドでの表示

### 購入ボタン（既存実装）

```tsx
{/* Amazon購入ボタン */}
{book.amazon_affiliate_url && (
  <a
    href={book.amazon_affiliate_url}
    target="_blank"
    rel="noopener noreferrer"
    className="btn-amazon"
  >
    <i className="ri-amazon-line"></i>
    <span>Amazonで購入</span>
  </a>
)}

{/* 楽天購入ボタン */}
{book.rakuten_affiliate_url && (
  <a
    href={book.rakuten_affiliate_url}
    target="_blank"
    rel="noopener noreferrer"
    className="btn-rakuten"
  >
    <i className="ri-shopping-cart-line"></i>
    <span>楽天ブックスで購入</span>
  </a>
)}
```

---

## 6. 将来のAmazon PA-API統合

### Amazon PA-API承認後に追加する設定

```bash
# backend/.env

# Amazon PA-API設定（承認後に有効化）
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_PARTNER_TAG=your-amazon-partner-tag-22
AMAZON_REGION=us-west-2
```

### 実装の移行

1. `backend/app/services/amazon_pa_api_service.py` を作成
2. Amazon PA-APIで書籍情報を取得
3. `rakuten_books_service.py`をフォールバックとして使用
4. より正確な書籍情報とASINを取得

---

## 7. 収益化のヒント

### Amazon
- 24時間のクッキー有効期間
- 購入完了で3%〜10%の報酬
- 最低支払額: 5,000円

### 楽天
- 89日間のクッキー有効期間（長い！）
- 購入完了で2%〜8%の報酬
- 最低支払額: 3,001円

### 推奨戦略
1. **両方のリンクを表示** - ユーザーに選択肢を提供
2. **楽天を優先表示** - クッキー期間が長く成約しやすい
3. **トラフィックを集める** - SEO最適化とQiita記事での露出
4. **Amazon PA-API承認** - サイトの実績を積んでから申請

---

## 8. トラブルシューティング

### アフィリエイトリンクが表示されない

**原因1: .envファイルの設定ミス**
```bash
# 設定を確認
cd backend
cat .env | grep AFFILIATE
```

**原因2: 環境変数の読み込み失敗**
```bash
# サーバーを再起動
cd backend
# Ctrl+Cでサーバー停止後
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**原因3: フロントエンドのキャッシュ**
```bash
# フロントエンドを再起動
cd frontend
# Ctrl+Cで停止後
npm run dev
```

### アフィリエイトIDの形式エラー

**楽天アフィリエイトID**
- 必ず4つの部分に分かれていること
- ドット(.)で区切られていること
- 例: `1234abcd.5678efgh.1234abcd.9012ijkl`

**AmazonアソシエイトTag**
- `-22`で終わること（日本の場合）
- 例: `booktuber-22`

---

## まとめ

✅ **現在の実装（一時的）**
- ISBNベースでAmazonアフィリエイトリンク生成
- 楽天Books APIで書籍情報と楽天アフィリエイトリンク取得
- すぐに収益化開始可能

✅ **将来の実装（Amazon PA-API承認後）**
- Amazon PA-APIで正確な書籍情報とASIN取得
- より詳細な商品情報を提供
- 収益性の向上

📝 **重要**: 
まずは現在の実装でサイトを公開し、トラフィックを集めてから、Amazon PA-APIの承認を申請するのが最良の戦略です！

