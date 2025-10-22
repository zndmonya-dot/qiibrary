# スマホ版UX改善

## 実施した改善

### 1. ホバーエフェクトの削除（スマホ版）

タッチデバイスではホバー効果が不要なため、`@media (hover: hover) and (pointer: fine)` を使用してデスクトップのみに限定しました。

#### 修正箇所
- `frontend/app/globals.css`:
  - `.hover-primary`
  - `.hover-link`
  - `.hover-scale`
  - `.hover-card`
  - `.btn-primary`
  - `.btn-youtube`
  - `.btn-amazon`
  - `.card-primary`
  - `.card-youtube`
  - `.tab-button`
  - スクロールバーのホバー効果

#### 効果
- スマホでタップしても不要なホバー効果が表示されない
- タッチ操作がより自然に
- パフォーマンスの軽微な向上

---

### 2. 書籍詳細ボタンの非表示（スマホ版）

スマホでは画面が狭いため、書籍詳細ボタンを非表示にしました。

#### 修正箇所
- `frontend/components/BookCard.tsx` (128-139行目):
  ```tsx
  {/* Amazon書籍詳細ボタン（デスクトップのみ） */}
  {book.amazon_affiliate_url && (
    <a
      href={book.amazon_affiliate_url}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden md:inline-flex w-[160px] ..."
    >
  ```

#### 効果
- スマホで画面スペースを節約
- UIがすっきり
- 書籍画像やタイトルから直接Amazonに遷移可能

---

### 3. アフィリエイトリンク問題の修正（スマホ版）

スマホで`target="_blank"`を使用すると、一部のブラウザでアフィリエイトパラメータが剥がれる問題を修正しました。

#### 修正箇所
- `frontend/components/BookCard.tsx`:
  
**書籍画像リンク** (64-77行目):
```tsx
<a
  href={book.amazon_affiliate_url}
  target="_blank"
  rel="noopener noreferrer nofollow"
  className="block hover-scale"
  onClick={(e) => {
    analytics.clickAmazonLink(book.isbn || '', book.title);
    // スマホではアフィリエイトリンクを保持するため、同じタブで開く
    if (window.innerWidth < 768) {
      e.preventDefault();
      window.location.href = book.amazon_affiliate_url || '';
    }
  }}
>
```

**タイトルリンク** (155-168行目):
```tsx
<a
  href={book.amazon_affiliate_url}
  target="_blank"
  rel="noopener noreferrer nofollow"
  className="group inline-block"
  onClick={(e) => {
    analytics.clickAmazonLink(book.isbn || '', book.title);
    // スマホではアフィリエイトリンクを保持するため、同じタブで開く
    if (window.innerWidth < 768) {
      e.preventDefault();
      window.location.href = book.amazon_affiliate_url || '';
    }
  }}
>
```

#### 仕組み
1. デスクトップ（`window.innerWidth >= 768`）: `target="_blank"`で新しいタブで開く
2. スマホ（`window.innerWidth < 768`）: `window.location.href`で同じタブで遷移
   - `preventDefault()`でデフォルトの動作をキャンセル
   - `window.location.href`で直接遷移することでアフィリエイトリンクを保持

#### 効果
- スマホでもAmazonアソシエイトリンクが正しく機能
- 紹介料が適切に計上される
- ユーザー体験の向上（スマホでは同じタブで開く方が自然）

---

## テスト方法

### デスクトップ
1. ブラウザをデスクトップサイズ（幅768px以上）で開く
2. 書籍カードにマウスホバー → ホバー効果が表示される
3. 書籍詳細ボタンが表示される
4. Amazonリンクをクリック → 新しいタブで開く

### スマホ
1. ブラウザをモバイルサイズ（幅768px未満）で開く
2. 書籍カードをタップ → ホバー効果が表示されない
3. 書籍詳細ボタンが非表示
4. 書籍画像またはタイトルをタップ → 同じタブでAmazonに遷移
5. URLにアフィリエイトパラメータが含まれているか確認

### アフィリエイトリンクの確認

Amazon URLに以下のパラメータが含まれているか確認：
```
?tag=your-associate-tag-22
```

---

## デプロイ

```bash
git add -A
git commit -m "Improve mobile UX: remove hover effects, hide detail button, fix affiliate links"
git push origin main
```

- ✅ Vercel: 自動デプロイ
- ✅ Render: 自動デプロイ

---

## 技術詳細

### メディアクエリの使用

```css
@media (hover: hover) and (pointer: fine) {
  /* デスクトップのみのスタイル */
  .hover-scale {
    @apply hover:opacity-80 transition-opacity duration-200;
  }
}
```

- `hover: hover`: ホバー機能が利用可能なデバイス（マウスなど）
- `pointer: fine`: 精密なポインティングデバイス（マウス、トラックパッドなど）
- スマホやタブレット（タッチデバイス）は除外される

### Tailwindの`md:`プレフィックス

```tsx
className="hidden md:inline-flex"
```

- `hidden`: デフォルト（スマホ）で非表示
- `md:inline-flex`: 768px以上（タブレット・デスクトップ）で表示

### JavaScriptによる画面幅判定

```tsx
if (window.innerWidth < 768) {
  // スマホ用の処理
} else {
  // デスクトップ用の処理
}
```

Tailwindの`md:`ブレークポイントと一致（768px）

---

## まとめ

### 改善効果
- ✅ スマホでの操作性向上
- ✅ 不要なホバー効果を削除
- ✅ UI/UXの最適化（デバイスごと）
- ✅ アフィリエイトリンク問題の解決
- ✅ 画面スペースの有効活用

### パフォーマンス
- ホバー効果の削減により、軽微なパフォーマンス向上
- CSSメディアクエリはブラウザレベルで最適化される

### SEO
- `rel="nofollow"`を追加してアフィリエイトリンクを適切に処理
- `rel="noopener noreferrer"`でセキュリティ対策

### ユーザー体験
- デバイスに応じた最適なUI/UX
- スマホでは同じタブで開く（戻るボタンで戻れる）
- デスクトップでは新しいタブで開く（元のページを保持）

