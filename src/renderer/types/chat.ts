import type { ChatMessage } from "@shared/types";

/**
 * renderer で扱う表示用メッセージ型です。
 * `isError` によりエラーメッセージの見た目を切り替えます。
 */
export type ChatViewMessage = ChatMessage & {
  isError?: boolean;
};