import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import styles from "./ChatInput.module.css";

interface ChatInputProps {
  isLoading: boolean;
  onSend(content: string): Promise<void>;
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
    </div>
  );
}
