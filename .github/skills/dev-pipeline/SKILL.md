---
name: dev-pipeline
description: >
  要求分析→計画→実装→テスト→レビューの開発パイプラインを実行する。
  「パイプライン実行」「開発フロー」「dev-pipeline」で呼び出せる。
---

# 開発パイプライン スキル

このスキルが呼び出されたら、以下の順序でカスタムエージェントを使用して作業を進めてください。

## 手順

1. **@requirements-analyst** で要求を分析し、`.handover/<機能名>/cycle-<N>/1-requirements.md` を作成する
2. **@planner** で実装計画を作成し、`2-plan.md` を作成する
3. **@implementer** でコードを実装し、`3-impl.md` を作成する
4. **@tester** でテストを作成・実行し、`4-test.md` を作成する
5. **@reviewer** でレビューを行い、`5-review.md` を作成する

## ルール

- 各フェーズは**サブエージェント**として実行し、コンテキストを分離すること
- エージェント間のコンテキスト引き継ぎは `.handover/` ディレクトリのファイルを通じて行うこと
- `.handover/index.md` を最新の状態に保つこと
- レビューで差し戻し（CHANGES REQUESTED）の場合は、新しいサイクル（`cycle-N+1`）を作成して修正を行うこと
- 最大3サイクルまで繰り返す

## 使い方の例

```
dev-pipeline を実行してください。
機能名: feat-blog-posts
要求: ブログ投稿のCRUD機能を実装する
```

または **@orchestrator** を直接呼び出しても同様のワークフローが実行されます。
