# テストレポート: chat-ui-foundation

## テスト結果サマリー
- 全体結果: PASS
- テスト数: 24件中24件成功
- カバレッジ: 80.93%

## テストケース一覧
| テスト名 | 種別 | 結果 | 備考 |
|---------|------|------|------|
| shared/types: モデル選択肢を18件公開し、既定モデルを含む | Unit | ✅ PASS | shared 契約の整合性を確認 |
| shared/types: Reasoning Effort の既定値と選択肢を公開する | Unit | ✅ PASS | shared 契約の整合性を確認 |
| chatService: renderer から preload API へ引数をそのまま渡す | Unit | ✅ PASS | renderer → preload の橋渡し |
| useChat: 送信成功時に user / assistant メッセージを追加する | Unit | ✅ PASS | 基本送受信フロー |
| useChat: エラーレスポンス時にエラー状態とエラーメッセージを追加する | Unit | ✅ PASS | UI エラー表示フロー |
| useChat: 空白だけの入力は送信しない | Unit | ✅ PASS | 異常系 |
| useChat: 変更した model / reasoningEffort を次回送信に使う | Unit | ✅ PASS | 後続機能も含めた送信経路確認 |
| ChatInput: 空欄では送信ボタンを無効化する | Unit | ✅ PASS | 入力制御 |
| ChatInput: Enter で送信し、Shift+Enter では送信しない | Integration | ✅ PASS | UI 操作導線 |
| ChatInput: モデルと Reasoning Effort の選択肢を表示し、変更イベントを流す | Integration | ✅ PASS | 後続機能も含めた UI 確認 |
| ChatInput: 送信中は入力欄と select を無効化する | Unit | ✅ PASS | ローディング制御 |
| MessageList: メッセージがないときは空状態を表示する | Unit | ✅ PASS | 初期表示 |
| MessageList: ローディング中は生成中カードを表示する | Unit | ✅ PASS | ローディング表示 |
| MessageList: メッセージ更新時に末尾へスクロールする | Integration | ✅ PASS | 自動スクロール |
| App: 左右のドラッグ領域と主要レイアウトを描画する | Unit | ✅ PASS | 現行レイアウトの基本構造確認 |
| preload/index: renderer に公開する API が既定値を補完する | Unit | ✅ PASS | preload の既定値補完 |
| preload/index: renderer が指定した model / reasoningEffort をそのまま渡す | Unit | ✅ PASS | IPC request 構築 |
| main/ipc: IPC ハンドラを登録する | Unit | ✅ PASS | main の受け口 |
| main/ipc: 空メッセージは service を呼ばずにエラーを返す | Unit | ✅ PASS | 異常系 |
| main/ipc: trim 後の prompt と選択値を service へ渡す | Integration | ✅ PASS | renderer → main → service 配線 |
| main/ipc: service 例外をユーザー向けエラーへ変換する | Unit | ✅ PASS | エラーハンドリング |
| copilotService: 同じモデルでは既存セッションを再利用し、モデル変更時だけ再作成する | Unit | ✅ PASS | 現行 service のセッション管理 |
| copilotService: 空の応答はユーザー向けエラーとして扱う | Unit | ✅ PASS | SDK 異常系 |
| copilotService: CLI 未検出系の初期化失敗を分かりやすい文面へ変換する | Unit | ✅ PASS | CLI エラー変換 |

## 発見された問題
1. なし

## テストファイル
- `tests/shared/types.test.ts`
- `tests/renderer/services/chatService.test.ts`
- `tests/renderer/hooks/useChat.test.tsx`
- `tests/renderer/components/ChatInput.test.tsx`
- `tests/renderer/components/MessageList.test.tsx`
- `tests/renderer/App.test.tsx`
- `tests/preload/index.test.ts`
- `tests/main/ipc.test.ts`
- `tests/main/services/copilotService.test.ts`
- `tests/vitest.d.ts`
- `vitest.config.ts`
- `vitest.setup.ts`

## レビューエージェントへの注記
- チャット UI の基本導線、preload / IPC 契約、Copilot service の主要異常系まで自動テスト化済みです。
- 実 SDK と実 Electron ウィンドウを伴う E2E は未追加のため、必要なら別途統合テストまたは手動確認を推奨します。
