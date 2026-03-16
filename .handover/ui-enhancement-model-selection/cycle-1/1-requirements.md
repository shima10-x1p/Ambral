# 要求分析: UI改善・モデル選択・ReasoningEffort選択

## 要求概要
既存の最小チャット実装を土台に、UI をダークモードベースへ刷新し、モデル選択と Reasoning Effort 選択をチャット入力欄の下に追加する。併せてソースコードコメントと README を改善する。

## 対話ログサマリー
- Q: 4つの目的の優先順位は？ → A: UI改善が最優先 — UI改善を Must-have の最上位に設定
- Q: UIテーマの方向性は？ → A: ダークモードベース（濃い背景） — CSS カスタムプロパティを全面変更
- Q: モデル選択肢の粒度は？ → A: Copilot SDK対応の主要モデルを幅広く列挙 — ユーザー提供の18モデル一覧を採用
- Q: Reasoning Effort の形式は？ → A: 3段階（low / medium / high） — ドロップダウンで選択
- Q: モデル切替時のセッション扱いは？ → A: 送信時に再作成（UI履歴は保持） — main側でモデル変更検知→セッション再作成
- Q: 選択肢の定義位置は？ → A: shared/types.ts に集約 — 型と定数を同ファイルに置く
- Q: 選択UIの形式は？ → A: ドロップダウン（select要素） — コンパクトでシンプル
- Q: デフォルトモデルは？ → A: GPT-5.4 — ユーザーが「(default)」としてマークしたモデル
- Q: プレミアムリクエスト倍率の表示は？ → A: 表示したい — モデル名の横に倍率を併記
- Q: サイドバーの扱いは？ → A: 見た目のみ改善（構成は維持） — プレースホルダー構成はそのまま

## 機能要件
| ID | 要件 | 優先度 | 備考 |
|----|------|--------|------|
| FR-1 | UIをダークモードベースのテーマに変更する | Must-have | CSS カスタムプロパティの全面変更。ChatGPT風の落ち着いたダークテーマ |
| FR-2 | サイドバーの見た目を改善する | Must-have | 構成（タイトル、新規チャットボタン、履歴プレースホルダー）は維持 |
| FR-3 | メッセージ一覧の見た目を改善する | Must-have | ユーザー/アシスタントの見分けやすさ、余白、タイポグラフィ |
| FR-4 | 入力欄の見た目を改善する | Must-have | ダークテーマに合わせた入力欄デザイン |
| FR-5 | ローディング表示をダークテーマに適合させる | Must-have | 既存のアニメーションドットの色調整 |
| FR-6 | モデル選択ドロップダウンを入力欄の下に配置する | Must-have | select 要素で実装 |
| FR-7 | モデル選択肢として18モデルを定義する | Must-have | shared/types.ts に定数定義。各モデルにプレミアムリクエスト倍率を付与 |
| FR-8 | モデル名の横にプレミアムリクエスト倍率を表示する | Must-have | ドロップダウンのoption内に「GPT-5.4 (1x)」のように表示 |
| FR-9 | デフォルトモデルを GPT-5.4 にする | Must-have | 初期選択状態 |
| FR-10 | Reasoning Effort 選択ドロップダウンを入力欄の下に配置する | Must-have | select 要素で実装。low / medium / high の3段階 |
| FR-11 | デフォルト Reasoning Effort を medium にする | Must-have | 初期選択状態 |
| FR-12 | 送信時に選択中の model / reasoningEffort を IPC 経由で main 側へ渡す | Must-have | SendMessageRequest の拡張 |
| FR-13 | main 側 service がモデル変更を検知し、セッションを再作成する | Must-have | 前のモデルと異なる場合のみ再作成。UI上のメッセージ履歴は保持 |
| FR-14 | main 側 service が reasoningEffort を受け取れるようにする | Must-have | SDK側の対応は将来。まずは受け取りの流れを通す |
| FR-15 | ソースコードコメントを追加する | Must-have | 責務境界、IPC契約、データフロー、model/reasoningEffortの流れ |
| FR-16 | README を更新する | Must-have | 前提条件、現在の機能にモデル選択/ReasoningEffort選択を追記 |

## 非機能要件
| ID | 要件 | カテゴリ |
|----|------|---------|
| NFR-1 | ダークテーマの配色は読みやすさを優先し、コントラスト比を確保する | ユーザビリティ |
| NFR-2 | モデル/ReasoningEffort の選択肢定義は将来の追加・削除が容易な形にする | 保守性 |
| NFR-3 | 既存のチャット送信フローを壊さない | 互換性 |
| NFR-4 | main / preload / renderer / shared の責務境界を維持する | アーキテクチャ |
| NFR-5 | 無関係な npm 依存を追加しない | 依存管理 |
| NFR-6 | Windows でのローカル実行しやすさを維持する | 実行環境 |

## 制約条件
- 既存の Electron + React + TypeScript + Electron Forge + Vite 構成を維持する
- CSS Modules によるスタイリングを維持する
- GitHub Copilot SDK は main process でのみ使用する
- renderer から Node.js API や SDK を直接参照しない
- preload は contextBridge による最小限のブリッジのみ
- Copilot SDK の `createSession` に `model` パラメータを渡すことでモデル選択を実現する
- Reasoning Effort は SDK 側に明示的なパラメータがまだないため、IPC/state の流れのみ通す
- モデル切替時のセッション再作成では、前のセッションを dispose してから新しいモデルで createSession する

## 影響範囲
- 既存ファイル:
  - `src/shared/types.ts` — モデル/ReasoningEffort の型・定数を追加
  - `src/shared/ipc.ts` — SendMessageRequest に model / reasoningEffort を追加、ElectronAPI を拡張
  - `src/main/ipc.ts` — model/reasoningEffort を service へ渡すよう変更
  - `src/main/services/copilotService.ts` — model パラメータ対応、セッション再作成ロジック追加
  - `src/main/index.ts` — コメント追加
  - `src/preload/index.ts` — model/reasoningEffort を IPC へ渡すよう変更
  - `src/renderer/global.css` — ダークテーマへカスタムプロパティ全面変更
  - `src/renderer/App.module.css` — 背景色等の調整
  - `src/renderer/components/ChatArea/ChatArea.tsx` — model/reasoningEffort state の受け渡し
  - `src/renderer/components/ChatArea/ChatArea.module.css` — ダークテーマ対応
  - `src/renderer/components/ChatInput/ChatInput.tsx` — model/reasoningEffort 選択UIの追加
  - `src/renderer/components/ChatInput/ChatInput.module.css` — 選択UI のスタイル追加
  - `src/renderer/components/MessageItem/MessageItem.tsx` — コメント追加
  - `src/renderer/components/MessageItem/MessageItem.module.css` — ダークテーマ対応
  - `src/renderer/components/MessageList/MessageList.tsx` — コメント追加
  - `src/renderer/components/MessageList/MessageList.module.css` — ダークテーマ対応
  - `src/renderer/components/Sidebar/Sidebar.tsx` — コメント追加
  - `src/renderer/components/Sidebar/Sidebar.module.css` — ダークテーマ対応
  - `src/renderer/hooks/useChat.ts` — model/reasoningEffort state 管理、sendMessage 引数拡張
  - `src/renderer/services/chatService.ts` — model/reasoningEffort を IPC へ渡す
  - `src/renderer/types/chat.ts` — コメント追加
  - `README.md` — 前提条件・機能一覧の更新
- 新規ファイル: なし（既存ファイルの変更のみ）

## 受入基準
- [ ] アプリが起動し、チャットの送受信が正常に動作する
- [ ] UI がダークモードベースのテーマに変更されている
- [ ] ユーザー発言とアシスタント発言が視覚的に区別できる
- [ ] 入力欄の下にモデル選択ドロップダウンが表示されている
- [ ] モデル選択肢が18種類表示され、各モデルの横にプレミアムリクエスト倍率が表示されている
- [ ] デフォルトモデルが GPT-5.4 である
- [ ] 入力欄の下に Reasoning Effort 選択ドロップダウンが表示されている
- [ ] Reasoning Effort の選択肢が low / medium / high の3つである
- [ ] デフォルト Reasoning Effort が medium である
- [ ] 送信時に選択中の model と reasoningEffort が main 側へ渡されている
- [ ] モデルを変更して送信すると、新しいモデルでセッションが再作成される
- [ ] モデル変更後もUI上のメッセージ履歴が保持される
- [ ] ソースコードに責務境界・データフロー・意図を示すコメントが追加されている
- [ ] README が更新されている
- [ ] 既存のチャット機能が壊れていない

## 未解決の疑問点
- Reasoning Effort を SDK の `sendMessage` や `createSession` にどう渡すか（SDK側の対応待ち。現時点では IPC/state の流れのみ確保し、main 側で受け取るところまで）
