import { contextBridge, ipcRenderer } from "electron";
import {
  IPC_CHANNELS,
  type ElectronAPI,
  type SendMessageRequest,
  type SendMessageResponse,
} from "@shared/ipc";

const electronAPI: ElectronAPI = {
  async sendMessage(prompt: string): Promise<SendMessageResponse> {
    const request: SendMessageRequest = { prompt };
    return ipcRenderer.invoke(IPC_CHANNELS.sendMessage, request);
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
