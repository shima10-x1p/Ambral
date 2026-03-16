---
description: 'TypeScript コーディング規約 — 関数設計・コメント・TSDoc・モダン構文'
applyTo: '**/*.ts, **/*.tsx'
---

# TypeScript コーディング規約

## 関数設計

- 各関数は単一の責務のみを持つ（Single Responsibility Principle）
- 関数のパラメータは3つ以内を目標とする。超える場合はオブジェクト引数を使用する
- Boolean フラグで関数の振る舞いを変えず、別関数に分割する
- 関数名は動詞で始め、処理内容を明示する（例: `fetchUser`, `validateInput`, `formatDate`）
- 副作用がある関数は名前で明示する（例: `saveUser`, `sendNotification`）
- 1関数は15〜25行を目安とし、長くなる場合はヘルパー関数に分割する

## コメント規約

- コメントは「Why（なぜ）」を説明し、「What（何を）」は書かない
- コードを自己説明的にし（適切な命名、説明変数の使用）、コメントの必要性を最小化する
- マジックナンバーには名前付き定数を使用する
- コメントアウトされたコードは残さない（バージョン管理を使用する）
- TODO/FIXME は理由を必ず付記する（例: `// TODO: dueDate カラムにインデックスを追加する`）
- バナーコメントやセクション区切りコメントは使用しない

## ドキュメンテーション（TSDoc）

- export されたすべての関数・クラス・インターフェース・型・定数に TSDoc コメントを付与する
- `@param` には型を書かず、用途と制約のみ記述する（例: `@param userId - 取得対象のユーザー ID`）
- `@returns` には戻り値の意味を記述する（型情報は不要）
- 例外を投げる可能性がある場合は `@throws` を記述する
- 非自明な処理には `@remarks` で背景・理由を説明する
- 使用方法が直感的でない場合は `@example` でコード例を提示する
- TypeScript の型システムで表現できる情報を TSDoc で重複記述しない
- private メンバーや内部関数は、複雑な場合のみコメントする

### TSDoc の例

```typescript
/**
 * 指定されたユーザーのプロフィールを取得する。
 *
 * @remarks
 * キャッシュが存在する場合はキャッシュから返却する。
 * キャッシュの有効期限は {@link CACHE_TTL_MS} で定義されている。
 *
 * @param userId - 取得対象のユーザー ID
 * @returns ユーザープロフィール。見つからない場合は `undefined`
 * @throws {@link NetworkError} API 通信に失敗した場合
 *
 * @example
 * ```typescript
 * const profile = await getUserProfile("user-123");
 * console.log(profile?.displayName);
 * ```
 */
export async function getUserProfile(userId: string): Promise<UserProfile | undefined> {
  // ...
}
```

## モダン TypeScript

- `namespace` は使用しない。ES Modules（`import`/`export`）で整理する
- 通常の `enum` は使用しない。Union 型 + `as const` オブジェクトを使用する
- `any` は使用しない。`unknown` + 型ガードを使用する
- `var` は使用しない。`const` を優先し、再代入が必要な場合のみ `let` を使用する
- `satisfies` 演算子を活用して型チェックとリテラル型の保持を両立する
- Optional Chaining (`?.`) と Nullish Coalescing (`??`) を積極的に使用する
- CommonJS (`require`/`module.exports`) は使用しない。ESM を使用する
- インターフェースに `I` プレフィックスは付けない
- 後方互換性のためにレガシーパターンを維持しない。常に最新の TypeScript 機能を優先する

### モダンな定数定義の例

```typescript
// ❌ レガシー enum
enum Status { Active, Inactive, Pending }

// ✅ Union 型 + as const
const STATUS = {
  Active: "active",
  Inactive: "inactive",
  Pending: "pending",
} as const;
type Status = typeof STATUS[keyof typeof STATUS];
```

```typescript
// ✅ satisfies で型チェックとリテラル型を両立
const ROUTES = {
  home: "/",
  about: "/about",
  user: "/user/:id",
} satisfies Record<string, string>;
```
