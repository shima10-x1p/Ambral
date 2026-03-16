import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { messageRoles } from "../../../src/shared/types";
import { MessageList } from "../../../src/renderer/components/MessageList/MessageList";

describe("MessageList", () => {
  const scrollIntoViewMock = vi.fn();

  beforeEach(() => {
    scrollIntoViewMock.mockReset();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
  });

  it("メッセージがないときは空状態を表示する", () => {
    render(<MessageList error={null} isLoading={false} messages={[]} />);

    expect(screen.getByText("最初のメッセージを送ってみましょう")).toBeInTheDocument();
    expect(screen.getByText("Enter で送信、Shift+Enter で改行できます。")).toBeInTheDocument();
  });

  it("ローディング中は生成中カードを表示する", () => {
    render(<MessageList error={null} isLoading messages={[]} />);

    expect(screen.getByLabelText("応答を生成中")).toBeInTheDocument();
  });

  it("メッセージ更新時に末尾へスクロールする", () => {
    const { rerender } = render(<MessageList error={null} isLoading={false} messages={[]} />);

    rerender(
      <MessageList
        error={null}
        isLoading={false}
        messages={[
          {
            id: "message-1",
            role: messageRoles.User,
            content: "こんにちは",
            timestamp: "2026-03-16T23:00:00.000Z",
          },
        ]}
      />,
    );

    expect(scrollIntoViewMock).toHaveBeenCalled();
    expect(screen.getByText("こんにちは")).toBeInTheDocument();
  });
});
