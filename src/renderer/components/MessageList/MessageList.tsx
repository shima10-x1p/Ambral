import { useEffect, useRef } from "react";
import { MessageItem } from "../MessageItem/MessageItem";
import type { ChatViewMessage } from "../../types/chat";
import styles from "./MessageList.module.css";

interface MessageListProps {
  error: string | null;
  isLoading: boolean;
  messages: ChatViewMessage[];
}

/**
 * メッセージ一覧を表示します。
 *
 * @param props - 表示対象のメッセージと状態です。
 * @returns メッセージ一覧 UI です。
 */
export function MessageList(props: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { error, isLoading, messages } = props;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [error, isLoading, messages]);

  const hasMessages = messages.length > 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.list}>
        {!hasMessages && !isLoading ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>最初のメッセージを送ってみましょう</p>
            <p className={styles.emptyText}>
              Enter で送信、Shift+Enter で改行できます。
            </p>
          </div>
        ) : null}

        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}

        {isLoading ? <MessageItem isLoading /> : null}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
