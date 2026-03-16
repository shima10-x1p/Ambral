import type { SendMessageResponse } from "@shared/ipc";

/**
 * renderer から main のチャット送信 API を呼び出します。
 */
export const chatService = {
  async sendMessage(prompt: string): Promise<SendMessageResponse> {
    return window.electronAPI.sendMessage(prompt);
  },
};
