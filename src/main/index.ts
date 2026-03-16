/**
 * Electron main process のエントリポイントです。
 * ウィンドウ生成・IPC 登録・Copilot service のライフサイクル管理を担当します。
 */
import path from "node:path";
import { app, BrowserWindow } from "electron";
import { registerIpcHandlers } from "./ipc";
import { copilotService } from "./services/copilotService";

const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 800;

/**
 * メインウィンドウを生成して初期画面を読み込みます。
 *
 * @returns 生成した BrowserWindow インスタンスです。
 */
export async function createMainWindow(): Promise<BrowserWindow> {
  const mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 960,
    minHeight: 640,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#171717",
      symbolColor: "#ececec",
      height: 36,
    },
    autoHideMenuBar: true,
    webPreferences: {
      preload: resolvePreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(resolveRendererHtmlPath());
  }

  return mainWindow;
}

function resolvePreloadPath(): string {
  return path.join(__dirname, "preload.js");
}

function resolveRendererHtmlPath(): string {
  return path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
}

function handleActivate(): void {
  // macOS ではウィンドウを閉じてもプロセスを維持する慣習があるため再生成を許可します。
  if (BrowserWindow.getAllWindows().length === 0) {
    void createMainWindow();
  }
}

function handleWindowAllClosed(): void {
  if (process.platform !== "darwin") {
    app.quit();
  }
}

function handleBeforeQuit(): void {
  void copilotService.dispose();
}

async function bootstrap(): Promise<void> {
  await app.whenReady();

  try {
    // 初期化失敗時も UI 自体は起動継続し、送信時に分かりやすいエラーを返します。
    await copilotService.initialize();
  } catch (caughtError: unknown) {
    console.error("GitHub Copilot SDK の初期化に失敗しました。", caughtError);
  }

  registerIpcHandlers();
  await createMainWindow();

  app.on("activate", handleActivate);
}

void bootstrap();
app.on("before-quit", handleBeforeQuit);
app.on("window-all-closed", handleWindowAllClosed);
