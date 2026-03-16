import { execFileSync } from "node:child_process";
import { approveAll, CopilotClient, type CopilotSession } from "@github/copilot-sdk";

const RESPONSE_TIMEOUT_MS = 60_000;

/**
 * GitHub Copilot SDK との接続と単一セッションの送信処理を管理します。
 */
class CopilotService {
  private client: CopilotClient | null = null;

  private initializationError: string | null = null;

  private session: CopilotSession | null = null;

  /**
   * Copilot SDK を初期化し、単一セッションを作成します。
   *
   * @returns 初期化完了を表す Promise です。
   * @throws SDK の起動やセッション生成に失敗した場合
   */
  async initialize(): Promise<void> {
    if (this.client && this.session) {
      return;
    }

    this.initializationError = null;
    const cliPath = resolveCopilotCliPath();

    const client = new CopilotClient({
      cliPath,
      cwd: process.cwd(),
      logLevel: "info",
    });

    try {
      await client.start();
      const session = await client.createSession({
        onPermissionRequest: approveAll,
      });

      this.client = client;
      this.session = session;
    } catch (caughtError: unknown) {
      this.initializationError = mapCopilotErrorMessage(caughtError, cliPath);

      try {
        await client.stop();
      } catch {
        console.error("GitHub Copilot SDK の停止処理に失敗しました。");
      }

      throw new Error(this.initializationError);
    }
  }

  /**
   * Copilot セッションへメッセージを送り、最終応答を返します。
   *
   * @param prompt - 送信するユーザープロンプト
   * @returns アシスタントの最終応答テキストです。
   * @throws SDK 未初期化、タイムアウト、認証失敗などで応答を取得できない場合
   */
  async sendMessage(prompt: string): Promise<string> {
    const session = this.getSession();
    const response = await session.sendAndWait({ prompt }, RESPONSE_TIMEOUT_MS);
    const content = response?.data.content.trim();

    if (!content) {
      throw new Error("GitHub Copilot から応答を取得できませんでした。");
    }

    return content;
  }

  /**
   * セッションとクライアントを破棄します。
   *
   * @returns クリーンアップ完了を表す Promise です。
   */
  async dispose(): Promise<void> {
    const session = this.session;
    const client = this.client;

    this.session = null;
    this.client = null;

    if (session) {
      try {
        await session.disconnect();
      } catch (caughtError: unknown) {
        console.error("GitHub Copilot セッションの切断に失敗しました。", caughtError);
      }
    }

    if (client) {
      try {
        const cleanupErrors = await client.stop();

        if (cleanupErrors.length > 0) {
          console.error("GitHub Copilot SDK の停止時にエラーが発生しました。", cleanupErrors);
        }
      } catch (caughtError: unknown) {
        console.error("GitHub Copilot SDK の停止に失敗しました。", caughtError);
      }
    }
  }

  private getSession(): CopilotSession {
    if (this.session) {
      return this.session;
    }

    if (this.initializationError) {
      throw new Error(this.initializationError);
    }

    throw new Error(
      "GitHub Copilot SDK が初期化されていません。GitHub Copilot CLI のインストールとログイン状態を確認してください。",
    );
  }
}

function mapCopilotErrorMessage(caughtError: unknown, cliPath: string): string {
  const rawMessage = extractErrorMessage(caughtError);
  const normalizedMessage = rawMessage.toLowerCase();

  if (
    normalizedMessage.includes("vscode-jsonrpc/node") ||
    normalizedMessage.includes("err_module_not_found") ||
    normalizedMessage.includes("cannot find module")
  ) {
    return [
      "GitHub Copilot SDK の依存解決に失敗しました。",
      "CLI の PATH ではなく SDK 側の読み込みで失敗している可能性があります。",
      `詳細: ${rawMessage}`,
    ].join(" ");
  }

  if (
    normalizedMessage.includes("enoent") ||
    normalizedMessage.includes("spawn") ||
    normalizedMessage.includes("not found") ||
    normalizedMessage.includes("could not find")
  ) {
    return `GitHub Copilot CLI が見つかりません。現在の解決先: ${cliPath}`;
  }

  if (
    normalizedMessage.includes("auth") ||
    normalizedMessage.includes("login") ||
    normalizedMessage.includes("401") ||
    normalizedMessage.includes("403")
  ) {
    return "GitHub Copilot の認証に失敗しました。CLI でログイン済みか確認してください。";
  }

  if (normalizedMessage.includes("timeout")) {
    return "GitHub Copilot への接続がタイムアウトしました。時間をおいて再試行してください。";
  }

  return `GitHub Copilot SDK の初期化に失敗しました: ${rawMessage}`;
}

function extractErrorMessage(caughtError: unknown): string {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  return "不明なエラー";
}

function resolveCopilotCliPath(): string {
  if (process.platform === "win32") {
    return resolveWindowsCliPath();
  }

  return "copilot";
}

function resolveWindowsCliPath(): string {
  const whereResults = runWhereCommand("copilot.exe");

  if (whereResults.length > 0) {
    return whereResults[0];
  }

  const fallbackResults = runWhereCommand("copilot");
  const executablePath = fallbackResults.find((result) => result.toLowerCase().endsWith(".exe"));

  if (executablePath) {
    return executablePath;
  }

  return "copilot.exe";
}

function runWhereCommand(commandName: string): string[] {
  try {
    const stdout = execFileSync("where.exe", [commandName], {
      encoding: "utf8",
      windowsHide: true,
    });

    return stdout
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch {
    return [];
  }
}

/**
 * アプリ全体で共有する GitHub Copilot SDK service です。
 */
export const copilotService = new CopilotService();