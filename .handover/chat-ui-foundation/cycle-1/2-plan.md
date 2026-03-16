# 実装計画: chat-ui-foundation

## 実装方針

Electron Forge + Vite テンプレートをベースに、main / preload / renderer / shared の 4 層アーキテクチャでプロジェクトを構成する。各 Phase でアプリが起動可能な状態を維持しつつ、段階的に機能を追加する。

- **Phase 1** でプロジェクト骨組みと基本配線を完成させ、空のウィンドウが表示される状態にする
- **Phase 2** でチャット UI を構築し、ダミー応答で会話が成立する状態にする
- **Phase 3** で GitHub Copilot SDK を接続し、実際の AI 応答で 1 往復チャットできる状態にする

## ディレクトリ構成（最終形）

```
Ambral/
├── .github/                          # 既存（変更なし）
├── .handover/                        # ハンドオーバーファイル
├── forge.config.ts                   # Electron Forge 設定
├── vite.main.config.ts               # Vite 設定（main）
├── vite.preload.config.ts            # Vite 設定（preload）
├── vite.renderer.config.ts           # Vite 設定（renderer）
├── tsconfig.json                     # TypeScript 設定
├── package.json                      # プロジェクト設定
├── .gitignore                        # Git ignore
├── README.md                         # セットアップ・起動手順
└── src/
    ├── shared/                       # main / preload / renderer 共有
    │   ├── types.ts                  # ChatMessage 型、MessageRole 等
    │   └── ipc.ts                    # IPC チャネル名、request/response 型
    ├── main/                         # Electron メインプロセス
    │   ├── index.ts                  # エントリ（app 起動、BrowserWindow 生成）
    │   ├── ipc.ts                    # IPC ハンドラ登録
    │   └── services/
    │       └── copilotService.ts     # GitHub Copilot SDK ラッパー
    ├── preload/
    │   └── index.ts                  # contextBridge で API 公開
    └── renderer/
        ├── index.html                # HTML エントリ
        ├── main.tsx                  # React エントリ
        ├── global.css                # グローバルスタイル（リセット、CSS 変数）
        ├── App.tsx                   # ルートコンポーネント（レイアウト）
        ├── App.module.css            # App スタイル
        ├── components/
        │   ├── Sidebar/
        │   │   ├── Sidebar.tsx
        │   │   └── Sidebar.module.css
        │   ├── ChatArea/
        │   │   ├── ChatArea.tsx
        │   │   └── ChatArea.module.css
        │   ├── MessageList/
        │   │   ├── MessageList.tsx
        │   │   └── MessageList.module.css
        │   ├── MessageItem/
        │   │   ├── MessageItem.tsx
        │   │   └── MessageItem.module.css
        │   └── ChatInput/
        │       ├── ChatInput.tsx
        │       └── ChatInput.module.css
        ├── hooks/
        │   └── useChat.ts            # チャットロジック（状態管理、送信処理）
        ├── services/
        │   └── chatService.ts        # preload API 経由の送信呼び出し
        └── types/
            └── css-modules.d.ts      # CSS Modules 型宣言
```

## 実装フェーズ

要件の規模に応じて、以下の 3 フェーズに分割して段階的に実装する。
各フェーズは独立して実装→テスト→レビュー可能な単位とする。

---

### Phase 1: プロジェクト雛形と基本配線

- 概要: Electron Forge + Vite + React + TypeScript のプロジェクト骨組みを作成し、空のウィンドウが表示される状態にする。main / preload / renderer の基本配線を完了させる。
- タスク:
  - [ ] Task-1-1: プロジェクト設定ファイルの作成
    - 説明: package.json、tsconfig.json、forge.config.ts、Vite 設定ファイル 3 つ、.gitignore を作成する
    - ファイル:
      - `package.json`（新規）
      - `tsconfig.json`（新規）
      - `forge.config.ts`（新規）
      - `vite.main.config.ts`（新規）
      - `vite.preload.config.ts`（新規）
      - `vite.renderer.config.ts`（新規）
      - `.gitignore`（新規）
    - 方針:
      - Electron Forge の `@electron-forge/plugin-vite` を使用
      - React 用に `@vitejs/plugin-react` を Vite renderer 設定に追加
      - pnpm を想定した設定（`packageManager` フィールド）
      - TypeScript は strict モード
      - tsconfig の `paths` で `@shared/*` エイリアスを設定し、shared モジュールの import を簡潔にする
      - Vite の `resolve.alias` でも同じエイリアスを設定
  - [ ] Task-1-2: shared 層の型定義
    - 説明: main / preload / renderer で共有する型と IPC チャネル定義を作成する
    - ファイル:
      - `src/shared/types.ts`（新規）
      - `src/shared/ipc.ts`（新規）
    - 方針:
      - `ChatMessage` 型: `id`, `role`（"user" | "assistant"）, `content`, `timestamp`
      - `MessageRole` を Union 型 + `as const` で定義（enum は使わない）
      - IPC チャネル名を `as const` オブジェクトで定義
      - `SendMessageRequest` / `SendMessageResponse` 型を定義
      - `SendMessageResponse` にはエラー情報を含められる構造にする（`{ content: string } | { error: string }`）
  - [ ] Task-1-3: main プロセスのエントリポイント
    - 説明: Electron の起動処理と BrowserWindow の生成を実装する
    - ファイル:
      - `src/main/index.ts`（新規）
    - 方針:
      - `app.whenReady()` で BrowserWindow を生成
      - preload スクリプトのパスを Forge の環境変数（`MAIN_WINDOW_PRELOAD_VITE_DEV_SERVER_URL` / `MAIN_WINDOW_PRELOAD_VITE_NAME`）から解決
      - ウィンドウサイズは 1200x800 程度（Windows で使いやすいサイズ）
      - `webPreferences.contextIsolation: true`, `nodeIntegration: false`
      - IPC ハンドラの登録は別モジュール（`ipc.ts`）から呼び出す
  - [ ] Task-1-4: preload スクリプト
    - 説明: contextBridge で renderer に最小限の API を公開する
    - ファイル:
      - `src/preload/index.ts`（新規）
    - 方針:
      - `contextBridge.exposeInMainWorld("electronAPI", { ... })` で公開
      - 初期は `sendMessage(prompt: string): Promise<SendMessageResponse>` のみ
      - TypeScript の型安全性のため `Window` インターフェースを拡張するか、shared に型を置く
  - [ ] Task-1-5: renderer エントリポイント
    - 説明: React アプリのエントリポイントと最小限の App コンポーネントを作成する
    - ファイル:
      - `src/renderer/index.html`（新規）
      - `src/renderer/main.tsx`（新規）
      - `src/renderer/App.tsx`（新規 — プレースホルダー）
      - `src/renderer/global.css`（新規 — 最小リセット）
      - `src/renderer/types/css-modules.d.ts`（新規）
    - 方針:
      - `index.html` は Vite のエントリ HTML。`<div id="root">` を含む
      - `main.tsx` で `createRoot` を使い `App` をマウント
      - `App.tsx` は「Ambral」と表示するだけのプレースホルダー
      - `global.css` で基本リセット（box-sizing, margin, font-family）と CSS 変数の定義
      - `css-modules.d.ts` で `.module.css` の型宣言
  - [ ] Task-1-6: main の IPC ハンドラ（スタブ）
    - 説明: IPC ハンドラを登録するモジュールを作成する。初期はダミー応答を返す
    - ファイル:
      - `src/main/ipc.ts`（新規）
    - 方針:
      - `ipcMain.handle(IPC_CHANNELS.SendMessage, ...)` でハンドラを登録
      - 初期実装はダミー応答（`"これはダミー応答です。"`）を返す
      - 後の Phase で Copilot SDK に差し替えやすいよう、応答生成を関数に分離する
- 受入基準:
  - [ ] `pnpm install` が成功する
  - [ ] `pnpm start` で Electron ウィンドウが表示される
  - [ ] ウィンドウにプレースホルダーテキストが表示される
  - [ ] DevTools のコンソールにエラーがない
  - [ ] preload の `electronAPI` が renderer から参照可能
- 前提: なし

---

### Phase 2: チャット UI とダミー応答

- 概要: ChatGPT / Codex App 風のチャット UI を構築し、ダミー応答で会話が成立する状態にする。サイドバー、メッセージ一覧、入力欄、ローディング表示を実装する。
- タスク:
  - [ ] Task-2-1: グローバルスタイルと CSS 変数の定義
    - 説明: ライトモードの配色、フォント、スペーシングなどを CSS 変数として定義する
    - ファイル: `src/renderer/global.css`（更新）
    - 方針:
      - `:root` に CSS 変数を定義: `--color-bg`, `--color-sidebar-bg`, `--color-text`, `--color-border`, `--color-user-msg-bg`, `--color-assistant-msg-bg`, `--color-primary`, `--color-input-bg` など
      - ライトモード（Codex App 風）: 白基調、サイドバーは薄いグレー、アクセントカラーは落ち着いた青〜緑系
      - `body` に `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` を設定
  - [ ] Task-2-2: App レイアウト（サイドバー + メインエリア）
    - 説明: App コンポーネントをサイドバーとチャットエリアの 2 カラムレイアウトに更新する
    - ファイル:
      - `src/renderer/App.tsx`（更新）
      - `src/renderer/App.module.css`（新規）
    - 方針:
      - CSS Grid または Flexbox で 2 カラム: サイドバー（幅 260px 固定） + メインエリア（残り）
      - `height: 100vh` で画面全体を使う
  - [ ] Task-2-3: Sidebar コンポーネント
    - 説明: アプリロゴと「新規チャット」ボタンのプレースホルダーを配置したサイドバーを作成する
    - ファイル:
      - `src/renderer/components/Sidebar/Sidebar.tsx`（新規）
      - `src/renderer/components/Sidebar/Sidebar.module.css`（新規）
    - 方針:
      - 上部: アプリ名「Ambral」をロゴとして表示
      - 「＋ 新規チャット」ボタン（見た目のみ、クリック時の動作は将来実装）
      - 下部は空きスペース（将来のチャット履歴一覧用）
      - 背景は `--color-sidebar-bg`
  - [ ] Task-2-4: ChatArea コンポーネント
    - 説明: メッセージ一覧と入力欄を含むメインチャットエリアのコンテナを作成する
    - ファイル:
      - `src/renderer/components/ChatArea/ChatArea.tsx`（新規）
      - `src/renderer/components/ChatArea/ChatArea.module.css`（新規）
    - 方針:
      - Flexbox で縦方向に配置: MessageList（flex: 1、スクロール可能）+ ChatInput（下部固定）
      - `useChat` フックから状態と操作を受け取り、子コンポーネントに渡す
  - [ ] Task-2-5: MessageList / MessageItem コンポーネント
    - 説明: メッセージ一覧と個別メッセージの表示コンポーネントを作成する
    - ファイル:
      - `src/renderer/components/MessageList/MessageList.tsx`（新規）
      - `src/renderer/components/MessageList/MessageList.module.css`（新規）
      - `src/renderer/components/MessageItem/MessageItem.tsx`（新規）
      - `src/renderer/components/MessageItem/MessageItem.module.css`（新規）
    - 方針:
      - MessageList: メッセージ配列を受け取り、MessageItem を並べる。`overflow-y: auto` でスクロール
      - MessageItem: role（user / assistant）に応じてスタイルを変える
        - ユーザー: 右寄せまたは異なる背景色
        - アシスタント: 左寄せまたは異なる背景色
        - ChatGPT 風に左揃えで、role ラベルとアイコンで区別するのが自然
      - ローディング中の表示: アシスタントの MessageItem でアニメーションドット（`...`）を表示
      - 最新メッセージへの自動スクロール: `useRef` + `scrollIntoView` で実装
  - [ ] Task-2-6: ChatInput コンポーネント
    - 説明: テキスト入力欄と送信ボタンを作成する
    - ファイル:
      - `src/renderer/components/ChatInput/ChatInput.tsx`（新規）
      - `src/renderer/components/ChatInput/ChatInput.module.css`（新規）
    - 方針:
      - `<textarea>` を使用（複数行対応のため `<input>` ではなく）
      - Enter で送信、Shift+Enter で改行
      - `onKeyDown` で `e.key === "Enter" && !e.shiftKey` を検出
      - 送信ボタンは `<button>` で、入力が空のときは `disabled`
      - 送信中（ローディング中）は入力欄と送信ボタンを `disabled` にする
      - textarea の高さは内容に応じて自動伸縮（`rows` + CSS `resize: none`、最大 6 行程度）
  - [ ] Task-2-7: useChat フック
    - 説明: チャットの状態管理と送信ロジックを担当するカスタムフックを作成する
    - ファイル: `src/renderer/hooks/useChat.ts`（新規）
    - 方針:
      - 状態: `messages: ChatMessage[]`, `isLoading: boolean`, `error: string | null`
      - `sendMessage(content: string)`: ユーザーメッセージを追加 → `isLoading = true` → chatService.sendMessage 呼び出し → アシスタントメッセージを追加 → `isLoading = false`
      - エラー時は `error` に格納し、メッセージ一覧にエラー表示
      - メッセージ ID は `crypto.randomUUID()` で生成
  - [ ] Task-2-8: chatService（renderer 側 service）
    - 説明: preload API を経由して main プロセスにメッセージを送る service を作成する
    - ファイル: `src/renderer/services/chatService.ts`（新規）
    - 方針:
      - `window.electronAPI.sendMessage(prompt)` を呼び出すだけの薄いラッパー
      - 将来の streaming 対応時に差し替えポイントとなる
- 受入基準:
  - [ ] チャット画面が表示される（サイドバー + メインチャット領域）
  - [ ] メッセージを入力して Enter で送信できる
  - [ ] Shift+Enter で改行できる
  - [ ] ダミー応答が返り、メッセージ一覧に表示される
  - [ ] ユーザーメッセージとアシスタントメッセージが視覚的に区別できる
  - [ ] 応答待ち中にローディング表示が出る
  - [ ] 新しいメッセージ追加時に自動スクロールする
  - [ ] 送信中は入力欄と送信ボタンが無効化される
- 前提: Phase 1 完了

---

### Phase 3: GitHub Copilot SDK 接続と仕上げ

- 概要: main プロセスで GitHub Copilot SDK を初期化し、IPC 経由で renderer からの送信リクエストを SDK に中継する。エラーハンドリングを実装し、README を完成させる。
- タスク:
  - [ ] Task-3-1: Copilot SDK service モジュール
    - 説明: GitHub Copilot SDK のクライアント初期化・セッション管理・メッセージ送信を担当する service を作成する
    - ファイル: `src/main/services/copilotService.ts`（新規）
    - 方針:
      - `CopilotClient` をアプリ起動時に生成し、`start()` で起動
      - `createSession()` でセッションを作成（初期はモデル指定なし＝デフォルト）
      - `sendMessage(prompt: string): Promise<string>` — `session.sendAndWait()` で応答を取得し、`content` を返す
      - エラー時は明示的なエラーメッセージを返す（CLI 未検出、認証失敗、タイムアウト等）
      - アプリ終了時に `client.stop()` でクリーンアップ
      - 将来の streaming 対応に備え、`sendMessage` の戻り値を変えやすい構造にする
  - [ ] Task-3-2: IPC ハンドラの SDK 接続
    - 説明: IPC ハンドラのダミー応答を Copilot SDK 呼び出しに差し替える
    - ファイル: `src/main/ipc.ts`（更新）
    - 方針:
      - `copilotService.sendMessage(prompt)` を呼び出す
      - エラーを catch し、`{ error: string }` 形式で renderer に返す
  - [ ] Task-3-3: main エントリの SDK ライフサイクル管理
    - 説明: アプリ起動時に SDK を初期化し、終了時にクリーンアップする
    - ファイル: `src/main/index.ts`（更新）
    - 方針:
      - `app.whenReady()` 内で `copilotService.initialize()` を呼ぶ
      - `app.on("before-quit")` で `copilotService.dispose()` を呼ぶ
      - 初期化失敗時はアプリを起動するがエラーをログに記録し、チャット送信時にエラーメッセージを返す
  - [ ] Task-3-4: renderer のエラー表示
    - 説明: SDK エラーをチャット画面上に表示する
    - ファイル:
      - `src/renderer/hooks/useChat.ts`（更新）
      - `src/renderer/components/MessageItem/MessageItem.tsx`（更新）
      - `src/renderer/components/MessageItem/MessageItem.module.css`（更新）
    - 方針:
      - `SendMessageResponse` の `error` フィールドをチェック
      - エラー時はアシスタントメッセージとして赤系の背景でエラーメッセージを表示
      - `useChat` の `error` 状態を使い、エラー後も次のメッセージを送信可能にする
  - [ ] Task-3-5: README の作成
    - 説明: セットアップ手順、起動方法、前提条件を記載する
    - ファイル: `README.md`（更新）
    - 方針:
      - プロジェクト概要
      - 前提条件: Node.js 18+, pnpm, GitHub Copilot CLI（PATH に通っていること）
      - セットアップ: `pnpm install`
      - 起動: `pnpm start`
      - ディレクトリ構成の概要
      - 技術スタック一覧
- 受入基準:
  - [ ] GitHub Copilot SDK で実際の 1 往復チャットが成立する
  - [ ] SDK エラー時に UI 上にエラーメッセージが表示される
  - [ ] エラー後も次のメッセージを送信できる
  - [ ] README にセットアップ手順と起動方法が記載されている
  - [ ] `pnpm install && pnpm start` でアプリが起動する
- 前提: Phase 2 完了

---

## フェーズ依存関係

```
Phase 1 (雛形・配線) → Phase 2 (チャット UI・ダミー応答) → Phase 3 (SDK 接続・仕上げ)
```

各 Phase 完了時点でアプリが起動可能な状態を維持する:
- Phase 1 完了: 空のウィンドウが表示される
- Phase 2 完了: ダミー応答でチャットが動作する
- Phase 3 完了: Copilot SDK で実際の AI 応答が返る

## 技術選定

| カテゴリ | 選定 | 理由 |
|---------|------|------|
| フレームワーク | Electron 35+ | 最新安定版 |
| ビルド | Electron Forge + `@electron-forge/plugin-vite` | 公式推奨、Vite による高速 HMR |
| フロントエンド | React 19 + TypeScript | 要件指定 |
| バンドラー | Vite 6 + `@vitejs/plugin-react` | Forge Vite プラグインと統合 |
| CSS | CSS Modules（Vite 組み込み） | ゼロコンフィグ、スコープ自動限定 |
| AI SDK | `@github/copilot-sdk` | 要件指定 |
| パッケージマネージャー | pnpm | 要件指定 |
| 状態管理 | React useState/useReducer | 軽量、追加ライブラリ不要 |

## 主要な依存パッケージ

### dependencies
- `react`, `react-dom`
- `@github/copilot-sdk`

### devDependencies
- `electron`
- `@electron-forge/cli`, `@electron-forge/plugin-vite`
- `@vitejs/plugin-react`
- `typescript`
- `@types/react`, `@types/react-dom`
- `vite`

## リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| `@github/copilot-sdk` が技術プレビューで API が変わる可能性 | 中 | SDK 呼び出しを `copilotService.ts` に閉じ込め、影響範囲を限定する |
| GitHub Copilot CLI が PATH にない環境でのエラー | 中 | SDK 初期化時にエラーをキャッチし、UI 上に分かりやすいメッセージを表示する |
| Electron Forge + Vite の preload パス解決が環境依存 | 低 | Forge が提供する環境変数（`MAIN_WINDOW_PRELOAD_VITE_DEV_SERVER_URL` 等）を使い、ハードコードしない |
| CSS Modules の型定義が不足して TypeScript エラー | 低 | `css-modules.d.ts` で `*.module.css` のモジュール宣言を追加する |
| pnpm の node_modules 構造が Electron のネイティブモジュールと相性が悪い場合 | 低 | `.npmrc` に `shamefully-hoist=true` を設定して対応。ただし Copilot SDK にネイティブモジュールがなければ不要 |

## 変更ファイル数の見積もり

| Phase | 新規ファイル | 更新ファイル | 合計 |
|-------|-------------|-------------|------|
| Phase 1 | 13 | 0 | 13 |
| Phase 2 | 12 | 3 | 15 |
| Phase 3 | 1 | 4 | 5 |
| **合計** | **26** | **7** | **33** |
