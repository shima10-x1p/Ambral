# 実装計画: UI改善・モデル選択・ReasoningEffort選択

## 実装方針

既存の Electron + React + TypeScript アーキテクチャと main / preload / renderer / shared の責務境界を維持したまま、以下の 3 フェーズで段階的に実装する。

1. **データ層を先に整備** — shared の型・定数、IPC 契約、main 側 service を先に変更し、モデル選択/ReasoningEffort のデータの流れを確立する
2. **UI テーマをダークモードに切り替え** — CSS カスタムプロパティの全面変更で見た目を一括刷新する
3. **renderer 側の機能・コメント・README を仕上げ** — モデル選択/ReasoningEffort の UI を追加し、フック・サービスの配線を完成させ、コメントとREADMEを更新する

各フェーズ完了時点でアプリが起動可能な状態を維持する。

## 実装フェーズ

### Phase 1: データ層・IPC契約・main側 service の拡張
- 概要: モデル選択と ReasoningEffort のデータ定義を shared に追加し、IPC 契約を拡張し、main 側 service でモデル変更検知・セッション再作成を実装する。この Phase 完了時点では renderer は従来通り prompt のみ送信するが、IPC/service 側は新パラメータを受け取れる状態になる。
- タスク:
  - [ ] Task-1-1: shared/types.ts にモデル定義・ReasoningEffort 定義を追加
    - 説明: 18モデルの定数配列（id, displayName, premiumMultiplier）、ModelId 型、ReasoningEffort 型、デフォルト値定数を追加する
    - ファイル: `src/shared/types.ts`
    - 方針: `AVAILABLE_MODELS` を `as const` 付きのオブジェクト配列で定義する。`ModelId` は配列要素の `id` のユニオン型として導出する。`REASONING_EFFORTS` も同様。`DEFAULT_MODEL_ID` と `DEFAULT_REASONING_EFFORT` を定数としてエクスポートする
  - [ ] Task-1-2: shared/ipc.ts の IPC 契約を拡張
    - 説明: `SendMessageRequest` に `model` と `reasoningEffort` フィールドを追加する。`ElectronAPI.sendMessage` のシグネチャを拡張する
    - ファイル: `src/shared/ipc.ts`
    - 方針: `SendMessageRequest` に `model: ModelId` と `reasoningEffort: ReasoningEffort` を追加する。`ElectronAPI.sendMessage` は `(prompt: string, model: ModelId, reasoningEffort: ReasoningEffort)` とする
  - [ ] Task-1-3: preload/index.ts を新しい IPC 契約に合わせる
    - 説明: `electronAPI.sendMessage` が model / reasoningEffort を受け取り、IPC リクエストに含めて送信する
    - ファイル: `src/preload/index.ts`
    - 方針: 引数を増やし、`SendMessageRequest` に model / reasoningEffort を含める
  - [ ] Task-1-4: main/ipc.ts で model / reasoningEffort を service に渡す
    - 説明: `handleSendMessage` で request から model / reasoningEffort を取り出し、copilotService に渡す
    - ファイル: `src/main/ipc.ts`
    - 方針: `copilotService.sendMessage(prompt, model, reasoningEffort)` の形にする
  - [ ] Task-1-5: copilotService にモデル変更検知・セッション再作成を実装
    - 説明: `sendMessage` が model を受け取り、前回のモデルと異なる場合はセッションを破棄して新しいモデルで再作成する。reasoningEffort も受け取るが、現時点ではログ出力のみ
    - ファイル: `src/main/services/copilotService.ts`
    - 方針: `currentModel` フィールドを追加し、`sendMessage(prompt, model, reasoningEffort)` に変更する。`initialize` は初回のみモデルなしで呼ばれるため、初回セッション作成時はデフォルトモデルを使用する。モデル変更時は `recreateSession(model)` を呼ぶ。`recreateSession` は既存セッションの disconnect → 新 createSession({ model, onPermissionRequest: approveAll }) を行う
- 受入基準:
  - [ ] `src/shared/types.ts` に 18 モデルの定義と ReasoningEffort 定義がある
  - [ ] `src/shared/ipc.ts` の `SendMessageRequest` に model / reasoningEffort フィールドがある
  - [ ] `src/preload/index.ts` が model / reasoningEffort を IPC に含める
  - [ ] `src/main/ipc.ts` が model / reasoningEffort を copilotService に渡す
  - [ ] `copilotService.sendMessage` がモデル変更を検知してセッションを再作成する
  - [ ] TypeScript のビルドが通る（型整合が取れている）
- 前提: なし

### Phase 2: ダークテーマへの全面切り替え
- 概要: CSS カスタムプロパティをダークモードベースに変更し、全コンポーネントのスタイルをダークテーマに適合させる。この Phase では機能変更は行わず、見た目の変更のみ。
- タスク:
  - [ ] Task-2-1: global.css のカスタムプロパティをダークテーマに変更
    - 説明: `:root` のカラーパレットをダーク系に全面変更する。ChatGPT風の落ち着いた配色（濃いグレー背景、柔らかいテキスト色、アクセントカラー）にする
    - ファイル: `src/renderer/global.css`
    - 方針: 既存のカスタムプロパティ名は維持し、値のみ変更する。コントラスト比を確保する。`--color-bg` は `#212121` 程度の濃いグレー、`--color-surface` は `#2f2f2f` 程度、`--color-text` は `#e8e8e8` 程度のライトグレーにする。スクロールバーもダークに合わせる
  - [ ] Task-2-2: App.module.css のダークテーマ調整
    - 説明: ルートレイアウトの背景色がダークテーマに適合していることを確認・調整する
    - ファイル: `src/renderer/App.module.css`
    - 方針: `var(--color-bg)` を参照しているため、global.css の変更で自動的に適用される。追加調整が必要な場合のみ変更
  - [ ] Task-2-3: Sidebar.module.css のダークテーマ対応
    - 説明: サイドバーの背景色、テキスト色、ボーダー、ボタンをダークテーマに適合させる
    - ファイル: `src/renderer/components/Sidebar/Sidebar.module.css`
    - 方針: `var()` 参照を活かし、必要に応じてシャドウやホバー効果の色をダーク向きに調整する
  - [ ] Task-2-4: ChatArea.module.css のダークテーマ対応
    - 説明: チャットエリアのヘッダー、背景をダークテーマに適合させる
    - ファイル: `src/renderer/components/ChatArea/ChatArea.module.css`
    - 方針: `var()` を活かしつつ、ヘッダーのテキスト色やスタイルを洗練させる
  - [ ] Task-2-5: MessageItem.module.css のダークテーマ対応
    - 説明: ユーザー/アシスタント/エラーメッセージのカード背景色、ボーダー、テキスト色をダークテーマに適合させる。ローディングドットの色も調整する
    - ファイル: `src/renderer/components/MessageItem/MessageItem.module.css`
    - 方針: `--color-user-msg-bg` / `--color-assistant-msg-bg` の値が global.css で変わるため自動適用されるが、カードのシャドウやボーダーをダーク向きに微調整する
  - [ ] Task-2-6: MessageList.module.css のダークテーマ対応
    - 説明: メッセージリストの空状態表示をダークテーマに適合させる
    - ファイル: `src/renderer/components/MessageList/MessageList.module.css`
    - 方針: 空状態のボーダーや背景色をダーク向きに調整
  - [ ] Task-2-7: ChatInput.module.css のダークテーマ対応
    - 説明: 入力欄のコンポーザー背景色、ボーダー、テキスト色、送信ボタンをダークテーマに適合させる
    - ファイル: `src/renderer/components/ChatInput/ChatInput.module.css`
    - 方針: `var()` を活かしつつ、入力欄のフォーカス時のスタイルやプレースホルダー色をダーク向きに調整
- 受入基準:
  - [ ] アプリ全体がダークモードベースの配色になっている
  - [ ] テキストの読みやすさが確保されている（薄い文字が見えにくくなっていない）
  - [ ] ユーザー/アシスタント/エラーメッセージが視覚的に区別できる
  - [ ] サイドバー、入力欄、ローディングドットがダークテーマに違和感なく溶け込んでいる
  - [ ] アプリが正常に起動し、チャットが動作する
- 前提: Phase 1 完了（CSS のみの変更なので Phase 1 と並行しても問題ないが、依存順序として Phase 1 完了後に行う）

### Phase 3: renderer 側 UI 追加・コメント補強・README 更新
- 概要: モデル選択/ReasoningEffort のドロップダウンUI を ChatInput に追加し、useChat / chatService / ChatArea の配線を完成させる。全ファイルにコメントを追加し、README を更新する。
- タスク:
  - [ ] Task-3-1: renderer/services/chatService.ts を拡張
    - 説明: `sendMessage` に model / reasoningEffort パラメータを追加する
    - ファイル: `src/renderer/services/chatService.ts`
    - 方針: `window.electronAPI.sendMessage(prompt, model, reasoningEffort)` とする
  - [ ] Task-3-2: renderer/hooks/useChat.ts にモデル/ReasoningEffort state を追加
    - 説明: `model` と `reasoningEffort` の state を管理し、setter を公開する。`sendMessage` 呼び出し時にこれらを chatService に渡す
    - ファイル: `src/renderer/hooks/useChat.ts`
    - 方針: `useState` で `model`（デフォルト: `DEFAULT_MODEL_ID`）と `reasoningEffort`（デフォルト: `DEFAULT_REASONING_EFFORT`）を管理する。`UseChatResult` インターフェースに `model`, `reasoningEffort`, `setModel`, `setReasoningEffort` を追加する
  - [ ] Task-3-3: ChatInput.tsx にモデル / ReasoningEffort ドロップダウンを追加
    - 説明: 入力欄の下に 2 つの select 要素を配置する。モデル選択は `AVAILABLE_MODELS` を列挙し、各 option に倍率を表示する。ReasoningEffort は `REASONING_EFFORTS` を列挙する
    - ファイル: `src/renderer/components/ChatInput/ChatInput.tsx`
    - 方針: `ChatInputProps` に `model`, `reasoningEffort`, `onModelChange`, `onReasoningEffortChange` を追加する。`AVAILABLE_MODELS` と `REASONING_EFFORTS` を `@shared/types` からインポートし、select 要素で表示する。option のテキストは「GPT-5.4 (1x)」の形式にする
  - [ ] Task-3-4: ChatInput.module.css に選択 UI のスタイルを追加
    - 説明: ドロップダウン 2 つを入力欄下部に横並びで配置するスタイルを追加する
    - ファイル: `src/renderer/components/ChatInput/ChatInput.module.css`
    - 方針: `.optionsBar` クラスを追加し、flex で横並び。select 要素にはダークテーマに合う控えめなスタイルを適用する
  - [ ] Task-3-5: ChatArea.tsx で useChat → ChatInput への配線を更新
    - 説明: useChat から取得した model / reasoningEffort / setter を ChatInput に渡す
    - ファイル: `src/renderer/components/ChatArea/ChatArea.tsx`
    - 方針: useChat の返り値に追加された model / reasoningEffort / setModel / setReasoningEffort を ChatInput の props に渡す
  - [ ] Task-3-6: 全ファイルにソースコードコメントを追加
    - 説明: 責務境界、データフロー、IPC契約の役割、model/reasoningEffort の流れを示すコメントを追加する
    - ファイル: 全 .ts / .tsx ファイル（`src/shared/types.ts`, `src/shared/ipc.ts`, `src/main/index.ts`, `src/main/ipc.ts`, `src/main/services/copilotService.ts`, `src/preload/index.ts`, `src/renderer/App.tsx`, `src/renderer/main.tsx`, `src/renderer/components/ChatArea/ChatArea.tsx`, `src/renderer/components/ChatInput/ChatInput.tsx`, `src/renderer/components/MessageItem/MessageItem.tsx`, `src/renderer/components/MessageList/MessageList.tsx`, `src/renderer/components/Sidebar/Sidebar.tsx`, `src/renderer/hooks/useChat.ts`, `src/renderer/services/chatService.ts`, `src/renderer/types/chat.ts`）
    - 方針: ファイル先頭にモジュールの責務を示すブロックコメントを追加する。関数内でデータフローが分かりにくい箇所にインラインコメントを追加する。コードをそのまま言い換えるだけのコメントは追加しない。コメントは日本語で記述する
  - [ ] Task-3-7: README.md を更新
    - 説明: 前提条件（GitHub Copilot CLI のインストール要件）、現在の機能（モデル選択、ReasoningEffort 選択）を更新する
    - ファイル: `README.md`
    - 方針: 「現在の機能」セクションにモデル選択と ReasoningEffort 選択を追記する。前提条件を明確化する
- 受入基準:
  - [ ] 入力欄の下にモデル選択ドロップダウンが表示されている
  - [ ] モデル選択肢に 18 モデルが表示され、各 option にプレミアムリクエスト倍率が表示される
  - [ ] デフォルトモデルが GPT-5.4 である
  - [ ] Reasoning Effort ドロップダウンに low / medium / high が表示されている
  - [ ] デフォルト Reasoning Effort が medium である
  - [ ] モデルを変更して送信すると、main 側で新しいモデルのセッションが作成される
  - [ ] UI 上のメッセージ履歴がモデル変更後も保持される
  - [ ] 全 .ts / .tsx ファイルに責務・データフローを示すコメントがある
  - [ ] README が更新されている
  - [ ] アプリが正常に起動し、チャットの送受信が動作する
- 前提: Phase 1, Phase 2 完了

## フェーズ依存関係
Phase 1 → Phase 2 → Phase 3

## 影響ファイル一覧

| ファイル | Phase 1 | Phase 2 | Phase 3 | 変更種別 |
|----------|---------|---------|---------|----------|
| `src/shared/types.ts` | ✅ | | ✅(コメント) | 型・定数追加 |
| `src/shared/ipc.ts` | ✅ | | ✅(コメント) | IPC契約拡張 |
| `src/main/index.ts` | | | ✅(コメント) | コメントのみ |
| `src/main/ipc.ts` | ✅ | | ✅(コメント) | service呼び出し変更 |
| `src/main/services/copilotService.ts` | ✅ | | ✅(コメント) | セッション再作成追加 |
| `src/preload/index.ts` | ✅ | | ✅(コメント) | 引数拡張 |
| `src/renderer/global.css` | | ✅ | | カラーパレット変更 |
| `src/renderer/App.module.css` | | ✅ | | 微調整 |
| `src/renderer/App.tsx` | | | ✅(コメント) | コメントのみ |
| `src/renderer/main.tsx` | | | ✅(コメント) | コメントのみ |
| `src/renderer/components/ChatArea/ChatArea.tsx` | | | ✅ | props配線変更 |
| `src/renderer/components/ChatArea/ChatArea.module.css` | | ✅ | | ダークテーマ |
| `src/renderer/components/ChatInput/ChatInput.tsx` | | | ✅ | 選択UI追加 |
| `src/renderer/components/ChatInput/ChatInput.module.css` | | ✅ | ✅ | ダークテーマ + 選択UIスタイル |
| `src/renderer/components/MessageItem/MessageItem.tsx` | | | ✅(コメント) | コメントのみ |
| `src/renderer/components/MessageItem/MessageItem.module.css` | | ✅ | | ダークテーマ |
| `src/renderer/components/MessageList/MessageList.tsx` | | | ✅(コメント) | コメントのみ |
| `src/renderer/components/MessageList/MessageList.module.css` | | ✅ | | ダークテーマ |
| `src/renderer/components/Sidebar/Sidebar.tsx` | | | ✅(コメント) | コメントのみ |
| `src/renderer/components/Sidebar/Sidebar.module.css` | | ✅ | | ダークテーマ |
| `src/renderer/hooks/useChat.ts` | | | ✅ | state追加 |
| `src/renderer/services/chatService.ts` | | | ✅ | 引数拡張 |
| `src/renderer/types/chat.ts` | | | ✅(コメント) | コメントのみ |
| `README.md` | | | ✅ | 機能・前提条件更新 |

合計: 24 ファイル（Phase 1: 6, Phase 2: 8, Phase 3: 17 — ただしコメント追加含む。Phase 3 は内容が軽いファイルが多い）

## 技術選定
- CSS カスタムプロパティ: 既存の `var()` 参照を維持し、`:root` の値のみ変更してダークテーマを実現する。追加ライブラリ不要
- select 要素: ネイティブの HTML select を使用する。カスタムドロップダウンは不要
- 型定義: TypeScript の `as const` + テンプレートリテラル型で、モデル一覧から `ModelId` 型を自動導出する
- セッション再作成: copilotService 内の `recreateSession` プライベートメソッドで、disconnect → createSession の手順を踏む

## ダークテーマ カラーパレット（参考値）

```css
:root {
  --color-bg: #212121;
  --color-bg-elevated: #2a2a2a;
  --color-surface: #2f2f2f;
  --color-sidebar-bg: #171717;
  --color-text: #ececec;
  --color-text-muted: #a0a0a0;
  --color-text-subtle: #6b6b6b;
  --color-border: #3a3a3a;
  --color-border-strong: #4a4a4a;
  --color-user-msg-bg: #2b3a35;
  --color-assistant-msg-bg: #303030;
  --color-primary: #5bb98c;
  --color-input-bg: #383838;
}
```

## モデル定義（参考）

```typescript
export const AVAILABLE_MODELS = [
  { id: "gpt-5.4",                   displayName: "GPT-5.4",                          premiumMultiplier: "1x" },
  { id: "gpt-5.3-codex",             displayName: "GPT-5.3-Codex",                    premiumMultiplier: "1x" },
  { id: "gpt-5.2-codex",             displayName: "GPT-5.2-Codex",                    premiumMultiplier: "1x" },
  { id: "gpt-5.2",                   displayName: "GPT-5.2",                          premiumMultiplier: "1x" },
  { id: "gpt-5.1-codex-max",         displayName: "GPT-5.1-Codex-Max",                premiumMultiplier: "1x" },
  { id: "gpt-5.1-codex",             displayName: "GPT-5.1-Codex",                    premiumMultiplier: "1x" },
  { id: "gpt-5.1",                   displayName: "GPT-5.1",                          premiumMultiplier: "1x" },
  { id: "gpt-5.1-codex-mini",        displayName: "GPT-5.1-Codex-Mini (Preview)",     premiumMultiplier: "0.33x" },
  { id: "gpt-5-mini",                displayName: "GPT-5 mini",                       premiumMultiplier: "0x" },
  { id: "gpt-4.1",                   displayName: "GPT-4.1",                          premiumMultiplier: "0x" },
  { id: "claude-sonnet-4.6",         displayName: "Claude Sonnet 4.6",                premiumMultiplier: "1x" },
  { id: "claude-sonnet-4.5",         displayName: "Claude Sonnet 4.5",                premiumMultiplier: "1x" },
  { id: "claude-haiku-4.5",          displayName: "Claude Haiku 4.5",                 premiumMultiplier: "0.33x" },
  { id: "claude-opus-4.6",           displayName: "Claude Opus 4.6",                  premiumMultiplier: "3x" },
  { id: "claude-opus-4.6-fast",      displayName: "Claude Opus 4.6 (fast mode)",      premiumMultiplier: "30x" },
  { id: "claude-opus-4.5",           displayName: "Claude Opus 4.5",                  premiumMultiplier: "3x" },
  { id: "claude-sonnet-4",           displayName: "Claude Sonnet 4",                  premiumMultiplier: "1x" },
  { id: "gemini-3-pro",              displayName: "Gemini 3 Pro (Preview)",            premiumMultiplier: "1x" },
] as const;
```

## リスクと対策
- リスク1: Copilot SDK の `createSession` に渡す model ID のフォーマットが SDK 内部で異なる可能性がある → 対策: `AVAILABLE_MODELS` の `id` フィールドは SDK のドキュメントに記載された形式（例: `"gpt-5"`, `"claude-sonnet-4.5"` 等）に合わせる。正確な ID がわからないモデルは名前からの推測で設定し、実行時エラーが出た場合に修正する
- リスク2: モデル切替時のセッション再作成でエラーが発生し、以降送信不能になる → 対策: `recreateSession` が失敗した場合は initializationError にセットし、次回送信時にリトライ可能な状態にする
- リスク3: Reasoning Effort が現時点で SDK に渡せない → 対策: 要件通り、IPC/state の流れのみ確保し、main 側では受け取る（ログ出力する）だけにする。SDK 側に対応が追加されたらそこだけ変更する
- リスク4: ダークテーマ変更で特定コンポーネントの視認性が低下する → 対策: カスタムプロパティを使い、各コンポーネントで background/color を明示的に指定する。Phase 2 の受入基準で視認性を検証する
