const MESSAGE_ROLES = {
  User: "user",
  Assistant: "assistant",
} as const;

/**
 * チャットメッセージの送信者種別を表します。
 */
export type MessageRole = typeof MESSAGE_ROLES[keyof typeof MESSAGE_ROLES];

/**
 * チャットメッセージを表します。
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

/**
 * 利用可能なメッセージ種別の一覧です。
 */
export const messageRoles = MESSAGE_ROLES;
