/**
 * renderer と main process の間で使う IPC 契約です。
 * prompt だけでなく model / reasoningEffort もここで明示し、preload を安全な境界に保ちます。
 */
import type { ModelId, ReasoningEffort } from "@shared/types";

const IPC_CHANNEL_DEFINITIONS = {
  sendMessage: "chat:send-message",
} as const;

/**
 * 利用する IPC チャネル名の一覧です。
 */
export const IPC_CHANNELS = IPC_CHANNEL_DEFINITIONS;

/**
 * メッセージ送信要求を表します。
 *
 * @remarks
 * prompt 本文に加えて、renderer が選択した model / reasoningEffort を
 * main process まで安全に橋渡しするための契約です。
 */
export interface SendMessageRequest {
  prompt: string;
  model: ModelId;
  reasoningEffort: ReasoningEffort;
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
  sendMessage(
    prompt: string,
    model?: ModelId,
    reasoningEffort?: ReasoningEffort,
  ): Promise<SendMessageResponse>;
}
