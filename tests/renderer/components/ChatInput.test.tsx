import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_REASONING_EFFORT,
  availableModels,
  reasoningEfforts,
} from "../../../src/shared/types";
import { ChatInput } from "../../../src/renderer/components/ChatInput/ChatInput";

describe("ChatInput", () => {
  const onSend = vi.fn<(_content: string) => Promise<void>>();
  const onModelChange = vi.fn();
  const onReasoningEffortChange = vi.fn();

  beforeEach(() => {
    onSend.mockReset();
    onSend.mockResolvedValue(undefined);
    onModelChange.mockReset();
    onReasoningEffortChange.mockReset();
  });

  it("空欄では送信ボタンを無効化する", () => {
    render(
      <ChatInput
        isLoading={false}
        model={DEFAULT_MODEL_ID}
        onModelChange={onModelChange}
        onReasoningEffortChange={onReasoningEffortChange}
        onSend={onSend}
        reasoningEffort={DEFAULT_REASONING_EFFORT}
      />,
    );

    expect(screen.getByRole("button", { name: "送信" })).toBeDisabled();
  });

  it("Enter で送信し、Shift+Enter では送信しない", async () => {
    const user = userEvent.setup();

    render(
      <ChatInput
        isLoading={false}
        model={DEFAULT_MODEL_ID}
        onModelChange={onModelChange}
        onReasoningEffortChange={onReasoningEffortChange}
        onSend={onSend}
        reasoningEffort={DEFAULT_REASONING_EFFORT}
      />,
    );

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "1行目");
    await user.keyboard("{Shift>}{Enter}{/Shift}");

    expect(onSend).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");

    expect(onSend).toHaveBeenCalledOnce();
    expect(onSend).toHaveBeenCalledWith("1行目");
  });

  it("モデルと Reasoning Effort の選択肢を表示し、変更イベントを流す", async () => {
    const user = userEvent.setup();

    render(
      <ChatInput
        isLoading={false}
        model={DEFAULT_MODEL_ID}
        onModelChange={onModelChange}
        onReasoningEffortChange={onReasoningEffortChange}
        onSend={onSend}
        reasoningEffort={DEFAULT_REASONING_EFFORT}
      />,
    );

    const selects = screen.getAllByRole("combobox");
    const modelSelect = selects[0];
    const reasoningSelect = selects[1];

    expect(screen.getAllByRole("option")).toHaveLength(
      availableModels.length + reasoningEfforts.length,
    );
    expect(modelSelect).toHaveValue(DEFAULT_MODEL_ID);
    expect(reasoningSelect).toHaveValue(DEFAULT_REASONING_EFFORT);

    await user.selectOptions(modelSelect, "claude-opus-4.6");
    await user.selectOptions(reasoningSelect, "high");

    expect(onModelChange).toHaveBeenCalledWith("claude-opus-4.6");
    expect(onReasoningEffortChange).toHaveBeenCalledWith("high");
  });

  it("送信中は入力欄と select を無効化する", () => {
    render(
      <ChatInput
        isLoading
        model={DEFAULT_MODEL_ID}
        onModelChange={onModelChange}
        onReasoningEffortChange={onReasoningEffortChange}
        onSend={onSend}
        reasoningEffort={DEFAULT_REASONING_EFFORT}
      />,
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "送信" })).toBeDisabled();
    expect(screen.getAllByRole("combobox")[0]).toBeDisabled();
    expect(screen.getAllByRole("combobox")[1]).toBeDisabled();
  });
});
