import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/renderer/App";

vi.mock("../../src/renderer/components/Sidebar/Sidebar", () => ({
  Sidebar: () => <aside>Sidebar</aside>,
}));

vi.mock("../../src/renderer/components/ChatArea/ChatArea", () => ({
  ChatArea: () => <section>ChatArea</section>,
}));

describe("App", () => {
  it("左右のドラッグ領域と主要レイアウトを描画する", () => {
    const { container } = render(<App />);

    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.getByText("ChatArea")).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });
});
