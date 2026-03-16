import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_REASONING_EFFORT,
} from "../../../src/shared/types";

const sdkMocks = vi.hoisted(() => ({
  approveAll: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  createSession: vi.fn(),
}));

const childProcessMocks = vi.hoisted(() => ({
  execFileSync: vi.fn(),
}));

vi.mock("@github/copilot-sdk", () => ({
  approveAll: sdkMocks.approveAll,
  CopilotClient: class MockCopilotClient {
    start = sdkMocks.start;
    stop = sdkMocks.stop;
    createSession = sdkMocks.createSession;
  },
}));

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();

  return {
    ...actual,
    execFileSync: childProcessMocks.execFileSync,
  };
});

describe("copilotService", () => {
  beforeEach(() => {
    vi.resetModules();
    sdkMocks.approveAll.mockReset();
    sdkMocks.start.mockReset();
    sdkMocks.stop.mockReset();
    sdkMocks.createSession.mockReset();
    childProcessMocks.execFileSync.mockReset();
    sdkMocks.start.mockResolvedValue(undefined);
    sdkMocks.stop.mockResolvedValue([]);
    childProcessMocks.execFileSync.mockReturnValue("C:\\Program Files\\GitHub Copilot\\copilot.exe\r\n");
  });

  afterEach(async () => {
    const module = await import("../../../src/main/services/copilotService");
    await module.copilotService.dispose();
  });

  it("同じモデルでは既存セッションを再利用し、モデル変更時だけ再作成する", async () => {
    const disconnectFirst = vi.fn().mockResolvedValue(undefined);
    const disconnectSecond = vi.fn().mockResolvedValue(undefined);
    const sendAndWaitFirst = vi
      .fn()
      .mockResolvedValueOnce({ data: { content: "最初の応答" } })
      .mockResolvedValueOnce({ data: { content: "2回目の応答" } });
    const sendAndWaitSecond = vi.fn().mockResolvedValue({ data: { content: "別モデルの応答" } });

    sdkMocks.createSession
      .mockResolvedValueOnce({ disconnect: disconnectFirst, sendAndWait: sendAndWaitFirst })
      .mockResolvedValueOnce({ disconnect: disconnectSecond, sendAndWait: sendAndWaitSecond });

    const { copilotService } = await import("../../../src/main/services/copilotService");

    await expect(
      copilotService.sendMessage("こんにちは", DEFAULT_MODEL_ID, DEFAULT_REASONING_EFFORT),
    ).resolves.toBe("最初の応答");
    await expect(
      copilotService.sendMessage("続けて", DEFAULT_MODEL_ID, "high"),
    ).resolves.toBe("2回目の応答");
    await expect(
      copilotService.sendMessage("モデル変更", "claude-sonnet-4.6", "low"),
    ).resolves.toBe("別モデルの応答");

    expect(sdkMocks.start).toHaveBeenCalledTimes(1);
    expect(sdkMocks.createSession).toHaveBeenCalledTimes(2);
    expect(sdkMocks.createSession).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        model: DEFAULT_MODEL_ID,
        onPermissionRequest: sdkMocks.approveAll,
      }),
    );
    expect(sdkMocks.createSession).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        model: "claude-sonnet-4.6",
        onPermissionRequest: sdkMocks.approveAll,
      }),
    );
    expect(disconnectFirst).toHaveBeenCalledTimes(1);
    expect(disconnectSecond).not.toHaveBeenCalled();
  });

  it("空の応答はユーザー向けエラーとして扱う", async () => {
    sdkMocks.createSession.mockResolvedValue({
      disconnect: vi.fn().mockResolvedValue(undefined),
      sendAndWait: vi.fn().mockResolvedValue({ data: { content: "   " } }),
    });

    const { copilotService } = await import("../../../src/main/services/copilotService");

    await expect(
      copilotService.sendMessage("応答確認", DEFAULT_MODEL_ID, DEFAULT_REASONING_EFFORT),
    ).rejects.toThrow("GitHub Copilot から応答を取得できませんでした。");
  });

  it("CLI 未検出系の初期化失敗を分かりやすい文面へ変換する", async () => {
    sdkMocks.createSession.mockRejectedValue(new Error("spawn copilot.exe ENOENT"));

    const { copilotService } = await import("../../../src/main/services/copilotService");

    await expect(
      copilotService.sendMessage("初期化確認", DEFAULT_MODEL_ID, DEFAULT_REASONING_EFFORT),
    ).rejects.toThrow("GitHub Copilot CLI が見つかりません。");
  });
});
