/**
 * preload は renderer へ最小限の安全な API だけを公開します。
 * Node.js / Electron の詳細はここで隠蔽し、IPC 契約だけを橋渡しします。
 */
import { contextBridge, ipcRenderer } from "electron";
import {
  IPC_CHANNELS,
  type ElectronAPI,
  type SendMessageRequest,
  type SendMessageResponse,
} from "@shared/ipc";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_REASONING_EFFORT,
  type ModelId,
  type ReasoningEffort,
} from "@shared/types";

const electronAPI: ElectronAPI = {
  async sendMessage(
    prompt: string,
    model?: ModelId,
    reasoningEffort?: ReasoningEffort,
  ): Promise<SendMessageResponse> {
    // renderer 側が未指定でも shared の既定値で契約を満たします。
    const request: SendMessageRequest = {
      prompt,
      model: model ?? DEFAULT_MODEL_ID,
      reasoningEffort: reasoningEffort ?? DEFAULT_REASONING_EFFORT,
    };

    return ipcRenderer.invoke(IPC_CHANNELS.sendMessage, request);
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

declare global {
  /**
   * renderer から参照する preload 公開 API です。
   */
  interface Window {
    electronAPI: ElectronAPI;
  }
}
