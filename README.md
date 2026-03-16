# Ambral

Electron + React + TypeScript で構成した、Windows 向けのミニマルな AI チャットアプリです。  
現時点では単一ウィンドウ・単一セッションのチャット体験に絞り、GitHub Copilot SDK を main process に閉じ込めた構成で 1 往復の会話を成立させます。

## 前提条件

- Node.js 20 以上
- pnpm
- GitHub Copilot CLI
	- グローバル導入済み、または `node_modules/.bin/copilot(.cmd)` が利用可能であること
	- GitHub Copilot へログイン済みであること

## セットアップ

```bash
pnpm install
```

## 起動方法

```bash
pnpm start
```

型チェックのみを行う場合:

```bash
pnpm typecheck
```

## 現在の機能

- サイドバー付きの単一チャット画面
- Enter 送信 / Shift+Enter 改行
- 最新メッセージへの自動スクロール
- 送信中のローディング表示
- GitHub Copilot SDK 経由の単一セッション応答
- SDK 初期化失敗時・送信失敗時の UI エラー表示

## ディレクトリ構成

```text
.
├─ src/
│  ├─ main/        # Electron main process と Copilot SDK 呼び出し
│  ├─ preload/     # contextBridge による最小 API 公開
│  ├─ renderer/    # React UI
│  └─ shared/      # IPC 型、メッセージ型、共通契約
├─ forge.config.ts
├─ vite.main.config.ts
├─ vite.preload.config.ts
├─ vite.renderer.config.ts
└─ tsconfig.json
```

## 技術スタック

- Electron
- React
- TypeScript
- Electron Forge
- Vite
- GitHub Copilot SDK

## 補足

- renderer から Node.js API や Copilot SDK を直接参照しません
- Copilot SDK の初期化に失敗してもアプリ自体は起動し、送信時にエラーを表示します
