const IPC_CHANNEL_DEFINITIONS = {
  sendMessage: "chat:send-message",
} as const;

/**
 * 利用する IPC チャネル名の一覧です。
 */
export const IPC_CHANNELS = IPC_CHANNEL_DEFINITIONS;

/**
 * メッセージ送信要求を表します。
 */
export interface SendMessageRequest {
  prompt: string;
}

/**
 * メッセージ送信成功時の応答です。
 */
export interface SendMessageSuccessResponse {
  content: string;
}

/**
 * メッセージ送信失敗時の応答です。
 */
export interface SendMessageErrorResponse {
  error: string;
}

/**
 * メッセージ送信の IPC 応答型です。
 */
export type SendMessageResponse = SendMessageSuccessResponse | SendMessageErrorResponse;

/**
 * renderer に公開する最小限の API 契約です。
 */
export interface ElectronAPI {
  sendMessage(prompt: string): Promise<SendMessageResponse>;
}
