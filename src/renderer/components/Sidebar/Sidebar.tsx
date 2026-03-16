/**
 * 単一セッション前提のサイドバーです。
 * 将来の履歴機能を見据えつつ、現段階では案内表示だけを提供します。
 */
import styles from "./Sidebar.module.css";

/**
 * チャット画面のサイドバーを表示します。
 *
 * @returns サイドバー UI です。
 */
export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div>
        <p className={styles.eyebrow}>Ambral</p>
        <h1 className={styles.title}>Desktop Chat</h1>
        <p className={styles.description}>
          最小構成の AI チャット体験をここから育てていきます。
        </p>
      </div>

      <button className={styles.newChatButton} type="button">
        ＋ 新規チャット
      </button>

      <div className={styles.placeholder}>
        <p className={styles.placeholderTitle}>履歴</p>
        <p className={styles.placeholderText}>
          Phase 2 では単一セッションのみを扱います。
        </p>
      </div>
    </aside>
  );
}
