import { describe, expect, it } from "vitest";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_REASONING_EFFORT,
  availableModels,
  reasoningEfforts,
} from "../../src/shared/types";

describe("shared/types", () => {
  it("モデル選択肢を18件公開し、既定モデルを含む", () => {
    expect(availableModels).toHaveLength(18);
    expect(availableModels.some((model) => model.id === DEFAULT_MODEL_ID)).toBe(true);
    expect(availableModels[0]).toMatchObject({
      id: DEFAULT_MODEL_ID,
      displayName: "GPT-5.4",
      premiumMultiplier: "1x",
    });
  });

  it("Reasoning Effort の既定値と選択肢を公開する", () => {
    expect(reasoningEfforts.map((option) => option.id)).toEqual(["low", "medium", "high"]);
    expect(DEFAULT_REASONING_EFFORT).toBe("medium");
  });
});
