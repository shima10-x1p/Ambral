import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_REASONING_EFFORT,
} from "../../src/shared/types";
import { IPC_CHANNELS } from "../../src/shared/ipc";

const exposeInMainWorld = vi.fn();
const invoke = vi.fn();

vi.mock("electron", () => ({
  contextBridge: {
    exposeInMainWorld,
  },
  ipcRenderer: {
    invoke,
  },
}));

describe("preload/index", () => {
  beforeEach(() => {
    vi.resetModules();
    exposeInMainWorld.mockReset();
    invoke.mockReset();
  });

  it("renderer に公開する API が既定値を補完する", async () => {
    await import("../../src/preload/index");
    const electronAPI = exposeInMainWorld.mock.calls[0][1];

    await electronAPI.sendMessage("こんにちは");

    expect(exposeInMainWorld).toHaveBeenCalledWith("electronAPI", expect.any(Object));
    expect(invoke).toHaveBeenCalledWith(IPC_CHANNELS.sendMessage, {
      prompt: "こんにちは",
      model: DEFAULT_MODEL_ID,
      reasoningEffort: DEFAULT_REASONING_EFFORT,
    });
  });

  it("renderer が指定した model / reasoningEffort をそのまま渡す", async () => {
    await import("../../src/preload/index");
    const electronAPI = exposeInMainWorld.mock.calls[0][1];

    await electronAPI.sendMessage("変更あり", "claude-sonnet-4.6", "high");

    expect(invoke).toHaveBeenCalledWith(IPC_CHANNELS.sendMessage, {
      prompt: "変更あり",
      model: "claude-sonnet-4.6",
      reasoningEffort: "high",
    });
  });
});
