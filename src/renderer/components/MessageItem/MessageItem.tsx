/**
 * 単一メッセージカードの描画コンポーネントです。
 * role と isError に応じて見た目だけを切り替え、データ加工は行いません。
 */
import { messageRoles } from "@shared/types";
import type { ChatViewMessage } from "../../types/chat";
import styles from "./MessageItem.module.css";

interface MessageItemProps {
  isLoading?: boolean;
  message?: ChatViewMessage;
}

/**
 * 単一メッセージを表示します。
 *
 * @param props - メッセージ本体またはローディング状態です。
 * @returns メッセージアイテム UI です。
 */
export function MessageItem(props: MessageItemProps) {
  if (props.isLoading) {
    return (
      <article className={`${styles.row} ${styles.assistantRow}`}>
        <div className={`${styles.card} ${styles.assistantCard}`}>
          <p className={styles.label}>Assistant</p>
          <div aria-label="応答を生成中" className={styles.loadingDots}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </article>
    );
  }

  if (!props.message) {
    return null;
  }

  // renderer の表示ラベルだけをここで切り替え、shared の role 値自体は変更しません。
  const isUser = props.message.role === messageRoles.User;
  const isError = props.message.isError === true;
  const roleLabel = isUser ? "You" : isError ? "Error" : "Assistant";
  const rowClassName = isUser ? styles.userRow : styles.assistantRow;
  const cardClassName = isUser
    ? styles.userCard
    : isError
      ? styles.errorCard
      : styles.assistantCard;

  return (
    <article className={`${styles.row} ${rowClassName}`}>
      <div className={`${styles.card} ${cardClassName}`}>
        <p className={styles.label}>{roleLabel}</p>
        <p className={styles.content}>{props.message.content}</p>
      </div>
    </article>
  );
}
