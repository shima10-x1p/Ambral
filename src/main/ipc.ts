/**
 * renderer から届く送信リクエストを Copilot service へ中継する IPC ハンドラです。
 * 画面側には例外を直接漏らさず、表示用のエラーメッセージへ正規化して返します。
 */
import { ipcMain } from "electron";
import {
  IPC_CHANNELS,
  type SendMessageRequest,
  type SendMessageResponse,
} from "@shared/ipc";
import { copilotService } from "./services/copilotService";

/**
 * アプリ起動時に必要な IPC ハンドラを登録します。
 *
 * @returns IPC ハンドラの登録が完了したことを表します。
 */
export function registerIpcHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.sendMessage);
  ipcMain.handle(
    IPC_CHANNELS.sendMessage,
    async (_event, request: SendMessageRequest): Promise<SendMessageResponse> => {
      return handleSendMessage(request);
    },
  );
}

async function handleSendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
  const prompt = request.prompt.trim();

  if (!prompt) {
    return { error: "メッセージが空です。" };
  }

  try {
    // model / reasoningEffort は shared 契約に従って renderer から到着します。
    return {
      content: await copilotService.sendMessage(
        prompt,
        request.model,
        request.reasoningEffort,
      ),
    };
  } catch (caughtError: unknown) {
    return {
      error: extractErrorMessage(caughtError),
    };
  }
}

/**
 * 例外をユーザー向けの短い表示文へ変換します。
 */
function extractErrorMessage(caughtError: unknown): string {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  return "GitHub Copilot との通信中に予期しないエラーが発生しました。";
}
