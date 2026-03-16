import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_MODEL_ID, DEFAULT_REASONING_EFFORT } from "../../../src/shared/types";
import { chatService } from "../../../src/renderer/services/chatService";

describe("chatService", () => {
  beforeEach(() => {
    window.electronAPI = {
      sendMessage: vi.fn().mockResolvedValue({ content: "ok" }),
    };
  });

  it("renderer から preload API へ引数をそのまま渡す", async () => {
    await chatService.sendMessage("こんにちは", DEFAULT_MODEL_ID, DEFAULT_REASONING_EFFORT);

    expect(window.electronAPI.sendMessage).toHaveBeenCalledWith(
      "こんにちは",
      DEFAULT_MODEL_ID,
      DEFAULT_REASONING_EFFORT,
    );
  });
});
