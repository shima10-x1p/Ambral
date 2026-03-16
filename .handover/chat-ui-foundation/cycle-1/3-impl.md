# 実装レポート: chat-ui-foundation

## 実装サマリー
Phase 1 として、Electron Forge + Vite + React + TypeScript の最小プロジェクト骨組みを構築した。`main` / `preload` / `renderer` / `shared` の4層を分離し、Electron ウィンドウ起動、preload 経由の `electronAPI` 公開、renderer のプレースホルダー表示、IPC スタブ応答まで動作確認済み。

Phase 2 として、ライトモードのチャット UI、サイドバー、メッセージ一覧、入力欄、ローディング表示、Enter 送信 / Shift+Enter 改行、最新メッセージへの自動スクロール、renderer 側の `useChat` フックと `chatService` を実装した。main 側のダミー応答を利用して単一セッションの会話導線が成立する構成に更新した。

Phase 3 として、GitHub Copilot SDK を main process に接続する `copilotService` を追加し、IPC ハンドラをダミー応答から SDK 呼び出しへ差し替えた。起動時初期化・終了時クリーンアップ・CLI 未検出時の劣化動作を実装し、renderer 側では SDK エラーをアシスタントメッセージとして赤系カード表示するよう更新した。README も前提条件・起動方法・構成説明を含む形へ刷新した。

## 変更ファイル一覧
| ファイル | 変更種別 | 説明 |
|---------|---------|------|
| `package.json` | 修正 | Node.js 20+ を要求する `engines` を追加 |
| `tsconfig.json` | 新規作成 | strict モードと `@shared/*` パスエイリアスを定義 |
| `forge.config.ts` | 新規作成 | Forge Vite プラグインと maker 設定を追加 |
| `vite.main.config.ts` | 新規作成 | main プロセス用 Vite 設定を追加 |
| `vite.preload.config.ts` | 新規作成 | preload 用 Vite 設定を追加 |
| `vite.renderer.config.ts` | 新規作成 | renderer 用 Vite + React 設定を追加 |
| `.gitignore` | 新規作成 | ビルド成果物とローカル生成物を除外 |
| `.npmrc` | 新規作成 | pnpm を Forge 互換の hoisted node linker で動作させる設定を追加 |
| `forge.env.d.ts` | 新規作成 | Forge が注入する Vite 定数の型宣言を追加 |
| `src/shared/types.ts` | 新規作成 | `ChatMessage` と `MessageRole` の共有型を追加 |
| `src/shared/ipc.ts` | 新規作成 | IPC チャネル名、request/response、`ElectronAPI` 契約を追加 |
| `src/main/index.ts` | 修正 | SDK 初期化と終了時クリーンアップを追加 |
| `src/main/ipc.ts` | 修正 | `sendMessage` を Copilot service 呼び出しへ差し替え |
| `src/main/services/copilotService.ts` | 新規作成 | Copilot SDK の初期化、単一セッション管理、送信処理、エラーマッピングを追加 |
| `src/preload/index.ts` | 新規作成 | `contextBridge` 経由で `electronAPI.sendMessage` を公開 |
| `src/renderer/index.html` | 新規作成 | renderer の HTML エントリを追加 |
| `src/renderer/main.tsx` | 新規作成 | React のエントリポイントを追加 |
| `src/renderer/App.tsx` | 修正 | サイドバー + チャットエリアの 2 カラムレイアウトへ更新 |
| `src/renderer/App.module.css` | 新規作成 | ルートレイアウトの Grid スタイルを追加 |
| `src/renderer/global.css` | 修正 | ライトモードの色変数と共通 UI スタイルへ更新 |
| `src/renderer/components/Sidebar/Sidebar.tsx` | 新規作成 | アプリ名と新規チャットボタンを持つサイドバーを追加 |
| `src/renderer/components/Sidebar/Sidebar.module.css` | 新規作成 | サイドバーのスタイルを追加 |
| `src/renderer/components/ChatArea/ChatArea.tsx` | 新規作成 | メッセージ一覧と入力欄を束ねるチャット領域を追加 |
| `src/renderer/components/ChatArea/ChatArea.module.css` | 新規作成 | チャット領域ヘッダーのスタイルを追加 |
| `src/renderer/components/MessageList/MessageList.tsx` | 修正 | 一覧末尾アラート表示を廃止し、メッセージベースのエラー表示に更新 |
| `src/renderer/components/MessageList/MessageList.module.css` | 修正 | 旧エラーボックス用スタイルを整理 |
| `src/renderer/components/MessageItem/MessageItem.tsx` | 修正 | エラーメッセージ用ラベルと赤系カード表示を追加 |
| `src/renderer/components/MessageItem/MessageItem.module.css` | 修正 | エラーカードのスタイルを追加 |
| `src/renderer/components/ChatInput/ChatInput.tsx` | 新規作成 | textarea ベースの入力欄と Enter 送信処理を追加 |
| `src/renderer/components/ChatInput/ChatInput.module.css` | 新規作成 | 入力欄と送信ボタンのスタイルを追加 |
| `src/renderer/hooks/useChat.ts` | 修正 | SDK エラーをアシスタントメッセージとして追加する処理を実装 |
| `src/renderer/services/chatService.ts` | 新規作成 | preload API を呼び出す薄い service を追加 |
| `src/renderer/types/chat.ts` | 新規作成 | renderer 表示用のエラー付きメッセージ型を追加 |
| `src/renderer/types/css-modules.d.ts` | 新規作成 | CSS Modules と通常 CSS import の型宣言を追加 |
| `README.md` | 修正 | 前提条件、起動方法、現在の機能、構成説明を追記 |

## 実装の判断・トレードオフ
- Forge のビルド時定数を TypeScript で安全に扱うため、計画外の最小追加として `forge.env.d.ts` を作成した
- `pnpm start` が `node-linker=hoisted` を要求したため、計画外の最小追加として `.npmrc` を作成した
- preload の dev server URL 定数は Forge Vite の実動作上不要だったため、preload は `MAIN_WINDOW_PRELOAD_VITE_NAME` からビルド成果物パスを解決する実装にした
- `@vitejs/plugin-react` と `vite` の peer 依存警告を避けるため、`vite` は `latest` に揃えた
- Electron の postinstall が pnpm に抑止されたため、ローカル検証では Electron を強制再導入して CLI 実体の展開を補完した
- 実運用確認で `package.json` の `main` と Vite 生成物名が不一致だったため、main/preload の出力名を `main.js` / `preload.js` に固定し、Forge の preload target 指定も追加した
- Phase 2 のエラー表示はメッセージ色分けではなく一覧末尾のアラートボックスで実装し、Phase 3 の SDK エラー専用スタイル差し替えをしやすい形に留めた
- Windows では `node_modules/.bin/copilot.cmd` を SDK から直接起動すると失敗し得るため、Phase 3 では `where.exe` で解決した `copilot.exe` を優先使用するようにした
- `cannot find module` を一律で CLI 未検出とみなすと誤診断になるため、SDK 依存解決エラーは PATH 問題と分けて表示するようにした
- `@github/copilot-sdk` は Node.js 20+ を要求していたため、README と `package.json` の `engines` で前提条件を明示した
- main プロセスで SDK の既定 CLI 解決を使うとバンドル後に壊れたため、`cliPath: "copilot"` を明示して外部 CLI を利用する構成にした
- Copilot CLI 未検出時は起動を止めず、main 側で初期化失敗を保持して送信時に UI へエラーメッセージを返す設計にした

## テストエージェントへの注記
- テスト重点ポイント: Electron Forge 起動、Copilot SDK 初期化成功時の 1 往復応答、CLI 未検出時の劣化動作、赤系エラーカード表示、エラー後の再送
- エッジケース: 空文字は送信ボタンが無効化されること、CLI が `PATH` にない場合でもアプリが起動継続すること、SDK 応答が空だった場合にユーザー向けエラーへ変換されること
- テスト実行コマンド: `pnpm typecheck` / `pnpm start`
