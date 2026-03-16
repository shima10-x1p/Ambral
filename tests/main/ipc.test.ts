import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_REASONING_EFFORT,
} from "../../src/shared/types";
import { IPC_CHANNELS } from "../../src/shared/ipc";
import { registerIpcHandlers } from "../../src/main/ipc";
import { copilotService } from "../../src/main/services/copilotService";

type RegisteredHandler = (
  event: unknown,
  request: { prompt: string; model: string; reasoningEffort: string },
) => Promise<unknown>;

const electronMocks = vi.hoisted(() => {
  let registeredHandler: RegisteredHandler | undefined;

  return {
    removeHandler: vi.fn(),
    handleSpy: vi.fn(),
    getRegisteredHandler: () => registeredHandler,
    setRegisteredHandler: (callback: RegisteredHandler | undefined) => {
      registeredHandler = callback;
    },
  };
});

vi.mock("electron", () => ({
  ipcMain: {
    removeHandler: electronMocks.removeHandler,
    handle: vi.fn((channel: string, callback: RegisteredHandler) => {
      electronMocks.handleSpy(channel, callback);
      electronMocks.setRegisteredHandler(callback);
    }),
  },
}));

vi.mock("../../src/main/services/copilotService", () => ({
  copilotService: {
    sendMessage: vi.fn(),
  },
}));

describe("main/ipc", () => {
  const sendMessageMock = vi.mocked(copilotService.sendMessage);

  beforeEach(() => {
    electronMocks.removeHandler.mockReset();
    electronMocks.handleSpy.mockReset();
    sendMessageMock.mockReset();
    electronMocks.setRegisteredHandler(undefined);
  });

  it("IPC ハンドラを登録する", () => {
    registerIpcHandlers();

    expect(electronMocks.removeHandler).toHaveBeenCalledWith(IPC_CHANNELS.sendMessage);
    expect(electronMocks.handleSpy).toHaveBeenCalledWith(
      IPC_CHANNELS.sendMessage,
      expect.any(Function),
    );
    expect(electronMocks.getRegisteredHandler()).toBeTypeOf("function");
  });

  it("空メッセージは service を呼ばずにエラーを返す", async () => {
    registerIpcHandlers();

    const response = await electronMocks.getRegisteredHandler()?.(null, {
      prompt: "   ",
      model: DEFAULT_MODEL_ID,
      reasoningEffort: DEFAULT_REASONING_EFFORT,
    });

    expect(sendMessageMock).not.toHaveBeenCalled();
    expect(response).toEqual({ error: "メッセージが空です。" });
  });

  it("trim 後の prompt と選択値を service へ渡す", async () => {
    sendMessageMock.mockResolvedValue("応答本文");
    registerIpcHandlers();

    const response = await electronMocks.getRegisteredHandler()?.(null, {
      prompt: "  質問です  ",
      model: "claude-sonnet-4.6",
      reasoningEffort: "high",
    });

    expect(sendMessageMock).toHaveBeenCalledWith("質問です", "claude-sonnet-4.6", "high");
    expect(response).toEqual({ content: "応答本文" });
  });

  it("service 例外をユーザー向けエラーへ変換する", async () => {
    sendMessageMock.mockRejectedValue(new Error("認証に失敗しました。"));
    registerIpcHandlers();

    const response = await electronMocks.getRegisteredHandler()?.(null, {
      prompt: "質問",
      model: DEFAULT_MODEL_ID,
      reasoningEffort: DEFAULT_REASONING_EFFORT,
    });

    expect(response).toEqual({ error: "認証に失敗しました。" });
  });
});
