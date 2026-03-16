# 要求分析: chat-ui-foundation

## 要求概要
Electron + React + TypeScript で最小限のチャット UI を持つ Windows 向けデスクトップ AI チャットアプリの土台を構築する。GitHub Copilot SDK を使い、1 往復のチャットが成立する状態まで実装する。

## 対話ログサマリー
- Q: アプリの目的（個人利用 / 配布想定） → A: 個人利用が主目的 — インストーラー・配布設定は不要
- Q: ビルドツール → A: Electron Forge + Vite — 公式推奨、高速な HMR 開発体験
- Q: パッケージマネージャー → A: pnpm — 高速・ディスク効率が良い
- Q: UI テーマ → A: ライトモード（Codex App 風） — ダークモードではなく明るいテーマ
- Q: サイドバーの初期内容 → A: 最小限のプレースホルダー — ロゴ +「新規チャット」ボタン程度
- Q: CSS アプローチ → A: CSS Modules — Vite でゼロコンフィグ、スコープ自動限定
- Q: SDK エラー時の振る舞い → A: UI 上にエラーメッセージを表示

## 機能要件
| ID | 要件 | 優先度 | 備考 |
|----|------|--------|------|
| FR-1 | Electron Forge + Vite + TypeScript プロジェクト雛形を作成する | Must-have | pnpm を使用 |
| FR-2 | main / preload / renderer / shared の責務分離を行う | Must-have | Electron のプロセス境界を崩さない |
| FR-3 | 左側にサイドバー（ロゴ +「新規チャット」ボタンのプレースホルダー）を配置する | Must-have | 将来のチャット履歴一覧の土台 |
| FR-4 | 右側にメインチャット領域（メッセージ一覧 + 入力欄 + 送信ボタン）を配置する | Must-have | - |
| FR-5 | ユーザーメッセージとアシスタントメッセージを視覚的に区別する | Must-have | - |
| FR-6 | Enter で送信、Shift+Enter で改行できる | Must-have | - |
| FR-7 | 最新メッセージへの自動スクロールを実装する | Must-have | - |
| FR-8 | ローディング表示（アシスタント応答待ち）を実装する | Must-have | - |
| FR-9 | ダミー応答でチャットを成立させる（SDK 接続前の中間状態） | Must-have | service 層の差し替えで実現 |
| FR-10 | AI 呼び出し部分を差し替え可能な service 層として分離する | Must-have | 将来の streaming 対応に備える |
| FR-11 | GitHub Copilot SDK で 1 往復チャットできる状態まで接続する | Must-have | sendAndWait() ベース |
| FR-12 | SDK エラー時（CLI 未検出、認証失敗、タイムアウト等）に UI 上にエラーメッセージを表示する | Must-have | - |
| FR-13 | README にセットアップ手順と起動方法を記載する | Must-have | pnpm + Windows 前提 |

## 非機能要件
| ID | 要件 | カテゴリ |
|----|------|---------|
| NFR-1 | Windows での実行しやすさを優先する | 互換性 |
| NFR-2 | Vite HMR による高速な開発フィードバックループ | 開発体験 |
| NFR-3 | 将来の streaming 応答に差し替えやすい構造にする | 拡張性 |
| NFR-4 | renderer から Node.js API や Copilot SDK を直接参照しない | セキュリティ / 設計 |
| NFR-5 | CSS Modules でスタイルスコープを管理する | 保守性 |
| NFR-6 | ライトモード（Codex App 風）で UI を構成する | UI/UX |

## 制約条件
- Electron のプロセス境界（main / preload / renderer）を崩さない
- preload は contextBridge で最小限の API のみ公開する
- GitHub Copilot CLI がインストール済みで PATH に通っていること（Node.js 18+）
- pnpm を使用する
- `@github/copilot-sdk` は技術プレビュー版であり、破壊的変更の可能性がある
- 過度な抽象化をしない（YAGNI / KISS / DRY）
- copilot-instructions.md および typescript.instructions.md の規約に従う

## 影響範囲
- 既存ファイル: [README.md](../../README.md)（書き換え）
- 新規ファイル:
  - `package.json`, `tsconfig.json`, `forge.config.ts` 等のプロジェクト設定
  - `src/main/` — Electron メインプロセス（エントリ、IPC ハンドラ、Copilot SDK service）
  - `src/preload/` — contextBridge による API 橋渡し
  - `src/renderer/` — React UI（components, hooks, services, types）
  - `src/shared/` — IPC 型、メッセージ型、共通定数

## 受入基準
- [ ] `pnpm install && pnpm start` でアプリが起動する
- [ ] チャット画面が表示される（サイドバー + メインチャット領域）
- [ ] メッセージを入力して Enter で送信できる
- [ ] Shift+Enter で改行できる
- [ ] ダミー応答が返り、メッセージ一覧に表示される
- [ ] ユーザーメッセージとアシスタントメッセージが視覚的に区別できる
- [ ] 応答待ち中にローディング表示が出る
- [ ] 新しいメッセージ追加時に自動スクロールする
- [ ] GitHub Copilot SDK で実際の 1 往復チャットが成立する
- [ ] SDK エラー時に UI 上にエラーメッセージが表示される
- [ ] README にセットアップ手順と起動方法が記載されている

## 実装順序（推奨）
1. ディレクトリ構成とプロジェクト設定の作成
2. main / preload / renderer の責務整理と基本配線
3. 静的なチャット UI モックの作成
4. ダミー応答でチャット動作を成立させる
5. GitHub Copilot SDK を組み込み 1 往復応答を実装する

## 未解決の疑問点
- なし（すべて対話で合意済み）
