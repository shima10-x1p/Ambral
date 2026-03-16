import { useChat } from "../../hooks/useChat";
import { ChatInput } from "../ChatInput/ChatInput";
import { MessageList } from "../MessageList/MessageList";
import styles from "./ChatArea.module.css";

/**
 * メインのチャットエリアを表示します。
 *
 * @returns メッセージ一覧と入力欄を含む UI です。
 */
export function ChatArea() {
  const { error, isLoading, messages, sendMessage } = useChat();

  return (
    <section className={styles.chatArea}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Single session</p>
          <h2 className={styles.title}>Ambral Chat</h2>
        </div>
      </header>

      <MessageList error={error} isLoading={isLoading} messages={messages} />
      <ChatInput isLoading={isLoading} onSend={sendMessage} />
    </section>
  );
}
