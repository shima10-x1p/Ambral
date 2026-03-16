/**
 * renderer から main process へ送信要求を橋渡しする薄い service です。
 * UI は IPC の詳細を知らず、このモジュールだけを経由して送信します。
 */
import type { SendMessageResponse } from "@shared/ipc";
import type { ModelId, ReasoningEffort } from "@shared/types";

/**
 * renderer から main のチャット送信 API を呼び出します。
 */
export const chatService = {
  async sendMessage(
    prompt: string,
    model: ModelId,
    reasoningEffort: ReasoningEffort,
  ): Promise<SendMessageResponse> {
    return window.electronAPI.sendMessage(prompt, model, reasoningEffort);
  },
};
