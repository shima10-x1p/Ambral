import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_REASONING_EFFORT,
  messageRoles,
} from "../../../src/shared/types";
import { chatService } from "../../../src/renderer/services/chatService";
import { useChat } from "../../../src/renderer/hooks/useChat";

vi.mock("../../../src/renderer/services/chatService", () => ({
  chatService: {
    sendMessage: vi.fn(),
  },
}));

describe("useChat", () => {
  const sendMessageMock = vi.mocked(chatService.sendMessage);

  beforeEach(() => {
    sendMessageMock.mockReset();
  });

  it("送信成功時に user / assistant メッセージを追加する", async () => {
    sendMessageMock.mockResolvedValue({ content: "こんにちは、Ambralです。" });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("  最初の質問  ");
    });

    expect(sendMessageMock).toHaveBeenCalledWith(
      "最初の質問",
      DEFAULT_MODEL_ID,
      DEFAULT_REASONING_EFFORT,
    );
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({
      role: messageRoles.User,
      content: "最初の質問",
    });
    expect(result.current.messages[1]).toMatchObject({
      role: messageRoles.Assistant,
      content: "こんにちは、Ambralです。",
    });
  });

  it("エラーレスポンス時にエラー状態とエラーメッセージを追加する", async () => {
    sendMessageMock.mockResolvedValue({ error: "GitHub Copilot CLI が見つかりません。" });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("助けて");
    });

    expect(result.current.error).toBe("GitHub Copilot CLI が見つかりません。");
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toMatchObject({
      role: messageRoles.Assistant,
      content: "GitHub Copilot CLI が見つかりません。",
      isError: true,
    });
  });

  it("空白だけの入力は送信しない", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("   ");
    });

    expect(sendMessageMock).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it("変更した model / reasoningEffort を次回送信に使う", async () => {
    sendMessageMock.mockResolvedValue({ content: "切り替え済みです。" });

    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.setModel("claude-sonnet-4.6");
      result.current.setReasoningEffort("high");
    });

    await act(async () => {
      await result.current.sendMessage("モデル変更後");
    });

    expect(sendMessageMock).toHaveBeenCalledWith(
      "モデル変更後",
      "claude-sonnet-4.6",
      "high",
    );
  });
});
