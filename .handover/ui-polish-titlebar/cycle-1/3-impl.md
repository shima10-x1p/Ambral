# 実装レポート: ui-polish-titlebar

## 実装サマリー
Phase 1 として、Electron の `titleBarOverlay` を使ったカスタムタイトルバーを導入し、メニューバーを自動非表示化しました。あわせて renderer 側では 36px のドラッグ領域をサイドバー側とチャット領域側に分けて追加し、全体レイアウトを `height: 100vh` ベースへ変更しました。

UI スタイルは計画どおりに全体の縦余白を圧縮し、メッセージカード・入力欄・サイドバー補助カード・各 hover/focus のドロップシャドウを削除しました。唯一、`composer:focus-within` の視認性確保用フォーカスリングだけは計画どおり維持しています。

## 変更ファイル一覧
| ファイル | 変更種別 | 説明 |
|---------|---------|------|
| `src/main/index.ts` | 修正 | `BrowserWindow` に `titleBarStyle: "hidden"`、`titleBarOverlay`、`autoHideMenuBar` を追加 |
| `src/renderer/App.tsx` | 修正 | 左右 2 分割のドラッグ領域を追加 |
| `src/renderer/App.module.css` | 修正 | タイトルバー 36px を含む 2 行グリッドへ変更し、ドラッグ領域スタイルを追加 |
| `src/renderer/components/Sidebar/Sidebar.module.css` | 修正 | サイドバーの gap / padding を圧縮し、内側シャドウとカード系シャドウを削除 |
| `src/renderer/components/ChatArea/ChatArea.module.css` | 修正 | チャットヘッダー上部余白と見出し間隔を圧縮 |
| `src/renderer/components/MessageList/MessageList.module.css` | 修正 | メッセージ間 gap と上下パディングを圧縮 |
| `src/renderer/components/MessageItem/MessageItem.module.css` | 修正 | メッセージカードの padding / radius を縮小し、シャドウを削除 |
| `src/renderer/components/ChatInput/ChatInput.module.css` | 修正 | 入力欄・送信ボタン・セレクトの余白と高さを圧縮し、シャドウを削除 |
| `src/renderer/global.css` | 修正 | `html` / `body` / `#root` を `height: 100%` ベースへ調整 |
| `.handover/ui-polish-titlebar/audit.yaml` | 修正 | implementation フェーズの監査ログを追記 |
| `.handover/ui-polish-titlebar/cycle-1/3-impl.md` | 新規作成 | 実装結果の引き継ぎレポート |

## 実装の判断・トレードオフ
- ドラッグ領域は `.app` 全体への一括適用ではなく、左右 2 つの専用 div を追加して実装した。これによりサイドバーとチャットエリアで背景色を分けたまま title bar を自然に一体化できる。
- `App.module.css` では専用 wrapper を増やさず、既存構造を保つためにグリッドの 2 行化で対応した。変更量は少ないが、子要素の配置は `App.tsx` の並び順に依存するため、将来ここへ要素追加する際はグリッド割り当ての見直しが必要。
- Windows のドラッグ移動・スナップ・キャプションボタン表示はローカル UI の目視確認が必要なため、今回はコード実装と起動確認まで実施し、詳細な操作確認は tester へ引き継ぐ。

## テストエージェントへの注記
- テスト重点ポイント: カスタムタイトルバー表示、右上の最小化/最大化/閉じるボタン、上端ドラッグ移動、Windows スナップ、チャット送受信・自動スクロール・モデル選択の既存動作
- エッジケース: 上端 36px のドラッグ領域で、サイドバーのテキスト付近やチャットヘッダー上部が正常にドラッグ扱いになること。入力欄やセレクト操作がドラッグに奪われないこと。
- テスト実行コマンド: `pnpm typecheck`, `pnpm start`
