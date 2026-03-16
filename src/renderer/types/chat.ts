/**
 * renderer 専用の表示型を定義します。
 * shared の ChatMessage を土台に、UI が必要とする表示用メタ情報だけを追加します。
 */
import type { ChatMessage } from "@shared/types";

/**
 * renderer で扱う表示用メッセージ型です。
 * `isError` によりエラーメッセージの見た目を切り替えます。
 */
export type ChatViewMessage = ChatMessage & {
  isError?: boolean;
};