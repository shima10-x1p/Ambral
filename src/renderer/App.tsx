/**
 * renderer 全体のルートレイアウトです。
 * 画面は Sidebar と ChatArea に分割し、状態は下位の ViewModel に委譲します。
 */
import { ChatArea } from "./components/ChatArea/ChatArea";
import { Sidebar } from "./components/Sidebar/Sidebar";
import styles from "./App.module.css";

/**
 * アプリのルートレイアウトを表示します。
 *
 * @returns サイドバー付きチャット画面です。
 */
function App() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <ChatArea />
    </div>
  );
}

export default App;
