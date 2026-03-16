# 要求分析: UI改善 — カスタムタイトルバー・余白縮小・シャドウ削除

## 要求概要
アプリの外観を洗練させるため、VSCode風のカスタムタイトルバー導入、各要素の縦余白の圧縮、全要素からのbox-shadow削除を行う。

## 対話ログサマリー
- Q: タイトルバーの方式は？ → A: titleBarOverlay（推奨） — Electron の titleBarOverlay API を使用し、OS標準のウィンドウ操作ボタンを維持
- Q: タイトルバー領域の使い方は？ → A: ドラッグ領域のみ（シンプル） — ナビゲーション等は配置せず、サイドバー/ChatAreaが上に広がる形
- Q: メニューバーの扱いは？ → A: メニューバーを非表示 — 現時点でメニュー機能は不要
- Q: 縦余白の調整範囲は？ → A: 全体的に縮める — サイドバー、ヘッダー、メッセージ間、入力欄、セレクトボックスなどすべて
- Q: シャドウの除去範囲は？ → A: 全シャドウ削除 — メッセージカード、入力欄、サイドバー履歴カード、サイドバー内側シャドウすべて

## 機能要件
| ID | 要件 | 優先度 | 備考 |
|----|------|--------|------|
| FR-1 | Electron の titleBarOverlay API を使用し、タイトルバーをアプリUIと一体化する | Must-have | `titleBarStyle: 'hidden'` + `titleBarOverlay` オプション |
| FR-2 | メニューバーを非表示にする | Must-have | `autoHideMenuBar: true` または `Menu.setApplicationMenu(null)` |
| FR-3 | サイドバー・ChatArea上部にドラッグ可能領域（`-webkit-app-region: drag`）を設ける | Must-have | ウィンドウ操作ボタン領域との重なりを避ける |
| FR-4 | 全体的に縦余白を圧縮する | Must-have | サイドバー gap/padding、ヘッダー上余白、メッセージ間 gap、入力欄下余白、セレクトボックス高さ |
| FR-5 | 全要素から box-shadow を削除する | Must-have | MessageItem `.card`、ChatInput `.composer`、Sidebar `.placeholder`、Sidebar `.sidebar` inset shadow、送信ボタン hover shadow |

## 非機能要件
| ID | 要件 | カテゴリ |
|----|------|---------|
| NFR-1 | Windows でのウィンドウ操作（スナップ、最小化、最大化、閉じる）が正常に動作すること | 互換性 |
| NFR-2 | titleBarOverlay のボタン色がアプリのダークテーマと調和すること | UI一貫性 |

## 制約条件
- Electron の `titleBarOverlay` API は Windows / macOS で利用可能（Linux は部分対応）
- Windows をプライマリターゲットとする（copilot-instructions.md の方針に準拠）
- サイドバー幅・ChatArea のレイアウト構造は維持する
- focus-within 時のシャドウ（入力欄のアクセント）は削除対象に含める

## 影響範囲
- 既存ファイル:
  - `src/main/index.ts` — BrowserWindow 設定変更（titleBarStyle, titleBarOverlay, autoHideMenuBar）
  - `src/renderer/App.module.css` — ドラッグ領域の追加、min-height 調整
  - `src/renderer/App.tsx` — ドラッグ領域要素の追加（必要に応じて）
  - `src/renderer/global.css` — body の余白調整
  - `src/renderer/components/ChatArea/ChatArea.module.css` — ヘッダー余白縮小
  - `src/renderer/components/ChatInput/ChatInput.module.css` — 下余白縮小、シャドウ削除
  - `src/renderer/components/MessageItem/MessageItem.module.css` — シャドウ削除、パディング縮小
  - `src/renderer/components/MessageList/MessageList.module.css` — メッセージ間 gap 縮小
  - `src/renderer/components/Sidebar/Sidebar.module.css` — gap/padding 縮小、シャドウ削除
- 新規ファイル: なし（CSS変更のみで対応可能）

## 受入基準
- [ ] アプリ起動時にOS標準のタイトルバー・メニューバーが表示されないこと
- [ ] ウィンドウ右上に最小化・最大化・閉じるボタンが表示されること
- [ ] タイトルバー領域をドラッグしてウィンドウ移動ができること
- [ ] ウィンドウのスナップ操作（Windows のドラッグスナップ）が正常に動作すること
- [ ] 各要素の縦余白が圧縮され、よりコンパクトな見た目になっていること
- [ ] 全要素から box-shadow が除去されていること
- [ ] サイドバー・ChatArea・入力欄の基本機能が変わらず動作すること

## 未解決の疑問点
- なし
