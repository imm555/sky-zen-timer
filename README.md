# Sky Zen Timer

美しい背景アニメーション付きの禅タイマーアプリケーション

## 開発者向けガイドライン

### PWA全画面表示の実装について

このアプリでは、スマートフォンでの完璧な全画面表示を実現するために、以下の手法を採用しています：

#### 1. 専用背景要素の使用
```css
#backgroundGradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom, #000000, #FFFFFF);
  z-index: -2;
}
```

**理由**: `html`や`body`要素への背景設定は、PWAモードでブラウザごとに異なる描画ルールが適用されるため、専用要素を使用することで確実性を担保。

#### 2. セーフエリア対応
```css
bottom: calc(56px + env(safe-area-inset-bottom));
```

**理由**: ホームインジケータとの重なりを防ぐため。

#### 3. ビューポート設定
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

**理由**: `viewport-fit=cover`により、表示領域をセーフエリアまで拡張。

### 避けるべき手法

1. ❌ `html`/`body`要素への直接的な背景設定
2. ❌ `background-attachment: fixed`（PWAモードで不安定）
3. ❌ `height: 100vh`の`html`要素への適用（PWAで制限される場合がある）

### 推奨する手法

1. ✅ 専用の背景要素を`position: fixed`で配置
2. ✅ `100vw`/`100vh`でビューポート全体をカバー
3. ✅ `z-index: -2`で他の要素の背後に配置

## 機能

- 25分タイマー（ポモドーロテクニック用）
- 5分タイマー
- 美しい背景アニメーション（青空→夕焼け→夜空）
- レスポンシブ対応
- PWA対応（ホーム画面に追加可能）

## 使用方法

1. ブラウザでアクセス
2. 「ホーム画面に追加」でアプリとしてインストール
3. タイマーを選択して開始

## 技術スタック

- HTML5
- CSS3
- Vanilla JavaScript
- Web App Manifest
- Canvas API（フィルムグレイン効果） 