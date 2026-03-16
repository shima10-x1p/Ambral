/**
 * チャット入力欄と送信オプション UI を担当する View です。
 * prompt 本文に加えて model / reasoningEffort を renderer state から受け取り、
 * 送信時にはそのまま main process へ渡せる形を保ちます。
 */
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import {
  availableModels,
  reasoningEfforts,
  type ModelId,
  type ReasoningEffort,
} from "@shared/types";
import styles from "./ChatInput.module.css";

interface ChatInputProps {
  isLoading: boolean;
  model: ModelId;
  onSend(content: string): Promise<void>;
  onModelChange(model: ModelId): void;
  onReasoningEffortChange(reasoningEffort: ReasoningEffort): void;
  reasoningEffort: ReasoningEffort;
}

/**
 * チャット入力欄を表示します。
 *
 * @param props - 送信処理とローディング状態です。
 * @returns 入力欄 UI です。
 */
export function ChatInput(props: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, 144);
    textarea.style.height = `${nextHeight}px`;
  }, [value]);

  async function handleSubmit(): Promise<void> {
    const content = value.trim();

    if (!content || props.isLoading) {
      return;
    }

    await props.onSend(content);
    setValue("");
  }

  async function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): Promise<void> {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    await handleSubmit();
  }

  function handleModelChange(event: ChangeEvent<HTMLSelectElement>): void {
    props.onModelChange(event.target.value as ModelId);
  }

  function handleReasoningEffortChange(event: ChangeEvent<HTMLSelectElement>): void {
    props.onReasoningEffortChange(event.target.value as ReasoningEffort);
  }

  return (
    <div className={styles.container}>
      <div className={styles.composer}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          disabled={props.isLoading}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            void handleKeyDown(event);
          }}
          placeholder="メッセージを入力..."
          rows={1}
          value={value}
        />
        <button
          className={styles.sendButton}
          disabled={props.isLoading || !value.trim()}
          onClick={() => {
            void handleSubmit();
          }}
          type="button"
        >
          送信
        </button>
      </div>

      <div className={styles.optionsBar}>
        <label className={styles.optionField}>
          <span className={styles.optionLabel}>Model</span>
          <select
            className={styles.select}
            disabled={props.isLoading}
            onChange={handleModelChange}
            value={props.model}
          >
            {availableModels.map((option) => (
              <option key={option.id} value={option.id}>
                {`${option.displayName} (${option.premiumMultiplier})`}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.optionField}>
          <span className={styles.optionLabel}>Reasoning Effort</span>
          <select
            className={styles.select}
            disabled={props.isLoading}
            onChange={handleReasoningEffortChange}
            value={props.reasoningEffort}
          >
            {reasoningEfforts.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
