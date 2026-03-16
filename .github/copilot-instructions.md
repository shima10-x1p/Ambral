# Copilot Instructions

## このリポジトリの目的
このリポジトリは、Electron + React + TypeScript で作る Windows 向けデスクトップ AI チャットアプリです。
将来的には AI エージェント機能を段階的に追加していきますが、現在は土台となるミニマルなチャットアプリを整える段階です。

## 現在の開発方針
まずは最小限で動く実装を優先してください。
当面の目標は次のとおりです。

- 単一ウィンドウ
- 単一チャット画面
- 単一セッション
- ユーザー入力からアシスタント応答までの基本導線
- Windows で実行しやすく、デバッグしやすい構成

依頼されていない大きな機能は先回りして追加しないでください。

## 技術スタック
- Electron
- React
- TypeScript
- GitHub Copilot SDK

## アーキテクチャ方針
アプリは Electron のプロセス境界を崩さずに構成してください。

### main
Electron メインプロセスです。
次を担当します。

- アプリ起動処理
- BrowserWindow の生成
- IPC ハンドラの登録
- GitHub Copilot SDK の呼び出し
- セッション管理
- 将来追加する永続化やツール実行の受け口

### preload
`contextBridge` を使った安全な橋渡しだけを担当します。

- renderer へ必要最小限の API を公開する
- Node.js や Electron の詳細を renderer に直接渡さない
- 広すぎる API を公開しない

### renderer
React による UI 層です。

- 画面表示
- ユーザー入力
- 送信操作
- ローディング表示
- エラー表示
- 画面用 state の管理

renderer では Node.js API や GitHub Copilot SDK を直接使わないでください。

### shared
main / preload / renderer で共有する契約を置きます。

- IPC の request / response 型
- DTO
- チャットメッセージ型
- 共通の定数や識別子

## React 側の設計方針
React 側は MVVM に近い形で整理してください。

- View: React components
- ViewModel: custom hooks
- Model / Service: API 呼び出しやデータ変換

たとえばチャット機能では次の分離を基本にしてください。

- `components`: 画面表示
- `hooks`: 画面ロジック
- `services`: renderer から見た API 呼び出し
- `types` / `state`: 画面用の型や状態

過度に class ベースへ寄せず、React に自然な設計を優先してください。

## UI の考え方
UI は ChatGPT や Codex App のような、落ち着いたチャットアプリを目指します。
ただし、初期段階では見た目の作り込みより基本導線を優先してください。

優先するもの:
- サイドバーの土台
- メッセージ一覧
- 入力欄
- 送信動作
- ローディング表示
- Enter 送信
- Shift+Enter 改行
- 最新メッセージへの自動スクロール

## 実装の進め方
小さな段階に分けて進めてください。
推奨順序は次のとおりです。

1. プロジェクト骨組みの作成
2. 静的なチャット UI の作成
3. ダミー応答によるチャット動作
4. renderer と main の IPC 接続
5. GitHub Copilot SDK の組み込み
6. ローディング表示やエラー表示の調整
7. 将来の streaming へ差し替えやすい形への整理

複数ファイルを変更するときも、できるだけ各段階でアプリが起動できる状態を保ってください。

## GitHub Copilot SDK の扱い
GitHub Copilot SDK は main process で使用してください。
最初は最小の request / response を優先し、まずは 1 往復のチャットを成立させてください。

- SDK 呼び出しは service module に閉じ込める
- renderer に SDK 固有の詳細を持ち込まない
- 将来的に streaming へ差し替えやすい構造にする

## 今は作らないもの
明示的に依頼されない限り、次は追加しないでください。

- 永続化
- 複数チャット管理
- モデル切替 UI
- 設定画面
- ファイル添付
- ツール実行
- 自動更新
- インストーラー作成
- 重い状態管理ライブラリ
- 不要な UI フレームワーク
- 早すぎる抽象化

## コード方針
- TypeScript の型は明示的で読みやすくする
- 小さな関数、小さなモジュールを優先する
- main / preload / renderer の境界を崩さない
- import を整合させる
- 無関係な依存関係を勝手に増やさない
- 動いている部分を理由なく全面的に書き換えない
- 命名は一貫性を優先し、過度に凝らない

## 生成コードの期待
コードを生成するときは次を守ってください。

- ファイルは省略せず完成形で示す
- 既存ファイルを編集する場合は変更後の全体像を示す
- セットアップや実行方法が変わる場合は README も更新する
- 正確さ、明快さ、段階的な前進を優先する