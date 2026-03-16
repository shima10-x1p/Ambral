---
name: audit-log
description: >
  開発パイプラインの監査ログを YAML 形式で記録するスキル。
  各エージェントがフェーズ開始・完了時にログエントリを追記する。
  「監査ログ」「audit」「ログ記録」で呼び出せる。
---

# 監査ログ スキル

開発パイプラインの各フェーズにおけるエージェントのアクションを `.handover/<機能名>/audit.yaml` に YAML 形式で記録する。

## 監査ログファイルの構造

ファイルパス: `.handover/<機能名>/audit.yaml`

```yaml
feature: "<機能名>"
entries:
  - timestamp: "2026-03-04T15:00:00+09:00"
    agent: requirements-analyst
    model: Claude Opus 4.6
    cycle: 1
    phase: requirements
    action: phase_start
    status: in_progress
    input: "(ユーザー要求テキスト)"
    output: null
    summary: null
```

## エントリのスキーマ

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `timestamp` | ISO 8601 string | ✅ | エントリ記録時刻 |
| `agent` | string | ✅ | エージェント名（orchestrator / requirements-analyst / planner / implementer / tester / reviewer） |
| `model` | string | ✅ | 使用モデル名 |
| `cycle` | integer | ✅ | サイクル番号 |
| `phase` | string | ✅ | フェーズ名（requirements / planning / implementation / testing / review） |
| `action` | string | ✅ | アクション種別: `phase_start` / `phase_complete` / `error` / `retry` |
| `status` | string | ✅ | ステータス: `in_progress` / `done` / `failed` / `blocked` |
| `input` | string \| null | - | 入力ファイルパスまたは情報の要約 |
| `output` | string \| null | - | 出力ファイルパス |
| `summary` | string \| null | - | アクションの要約（1〜2文） |
| `verdict` | string \| null | - | reviewer 専用: `approved` / `changes_requested` |

## 記録ルール

1. **フェーズ開始時**: `action: phase_start`, `status: in_progress` で記録
2. **フェーズ完了時**: `action: phase_complete`, `status: done` で記録
3. **エラー発生時**: `action: error`, `status: failed` で記録し、`summary` にエラー内容を記述
4. **差し戻し再実行時**: `action: retry`, `status: in_progress` で記録

## ファイル操作ルール

- `.handover/<機能名>/audit.yaml` が存在しない場合は、`feature` ヘッダー付きで新規作成する
- 既存の場合は `entries:` 配列の末尾に新しいエントリを追記する
- YAML の整合性を壊さないよう、インデント（スペース2つ）を厳守する

## 記録例（完全なパイプライン）

```yaml
feature: feat-blog-posts
entries:
  - timestamp: "2026-03-04T15:00:00+09:00"
    agent: requirements-analyst
    model: Claude Opus 4.6
    cycle: 1
    phase: requirements
    action: phase_start
    status: in_progress
    input: "ブログ投稿のCRUD機能を実装する"
    output: null
    summary: null

  - timestamp: "2026-03-04T15:05:00+09:00"
    agent: requirements-analyst
    model: Claude Opus 4.6
    cycle: 1
    phase: requirements
    action: phase_complete
    status: done
    input: null
    output: ".handover/feat-blog-posts/cycle-1/1-requirements.md"
    summary: "要件分析完了。FR-5件、NFR-2件を整理"

  - timestamp: "2026-03-04T15:06:00+09:00"
    agent: planner
    model: Claude Opus 4.6
    cycle: 1
    phase: planning
    action: phase_start
    status: in_progress
    input: ".handover/feat-blog-posts/cycle-1/1-requirements.md"
    output: null
    summary: null

  - timestamp: "2026-03-04T15:12:00+09:00"
    agent: planner
    model: Claude Opus 4.6
    cycle: 1
    phase: planning
    action: phase_complete
    status: done
    input: null
    output: ".handover/feat-blog-posts/cycle-1/2-plan.md"
    summary: "3フェーズに分割。Phase 1: データモデル、Phase 2: API、Phase 3: UI"

  - timestamp: "2026-03-04T15:13:00+09:00"
    agent: implementer
    model: GPT-5.3-Codex
    cycle: 1
    phase: implementation
    action: phase_start
    status: in_progress
    input: ".handover/feat-blog-posts/cycle-1/2-plan.md"
    output: null
    summary: null

  - timestamp: "2026-03-04T15:25:00+09:00"
    agent: implementer
    model: GPT-5.3-Codex
    cycle: 1
    phase: implementation
    action: phase_complete
    status: done
    input: null
    output: ".handover/feat-blog-posts/cycle-1/3-impl.md"
    summary: "Phase 1 実装完了。Post モデル・マイグレーション・リポジトリを作成"

  - timestamp: "2026-03-04T15:26:00+09:00"
    agent: tester
    model: GPT-5.3-Codex
    cycle: 1
    phase: testing
    action: phase_start
    status: in_progress
    input: ".handover/feat-blog-posts/cycle-1/3-impl.md"
    output: null
    summary: null

  - timestamp: "2026-03-04T15:35:00+09:00"
    agent: tester
    model: GPT-5.3-Codex
    cycle: 1
    phase: testing
    action: phase_complete
    status: done
    input: null
    output: ".handover/feat-blog-posts/cycle-1/4-test.md"
    summary: "全12件テスト PASS。カバレッジ 87%"

  - timestamp: "2026-03-04T15:36:00+09:00"
    agent: reviewer
    model: Claude Opus 4.6
    cycle: 1
    phase: review
    action: phase_start
    status: in_progress
    input: ".handover/feat-blog-posts/cycle-1/"
    output: null
    summary: null

  - timestamp: "2026-03-04T15:42:00+09:00"
    agent: reviewer
    model: Claude Opus 4.6
    cycle: 1
    phase: review
    action: phase_complete
    status: done
    input: null
    output: ".handover/feat-blog-posts/cycle-1/5-review.md"
    summary: "全要件充足、コード品質良好"
    verdict: approved
```
