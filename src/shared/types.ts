/**
 * main / preload / renderer が共有する型と選択肢定義をまとめた契約モジュールです。
 * UI 表示名と内部 ID を同じ場所で管理し、プロセス境界をまたいでも値のズレを防ぎます。
 */
const MESSAGE_ROLES = {
  User: "user",
  Assistant: "assistant",
} as const;

const AVAILABLE_MODELS = [
  { id: "gpt-5.4", displayName: "GPT-5.4", premiumMultiplier: "1x" },
  { id: "gpt-5.3-codex", displayName: "GPT-5.3-Codex", premiumMultiplier: "1x" },
  { id: "gpt-5.2-codex", displayName: "GPT-5.2-Codex", premiumMultiplier: "1x" },
  { id: "gpt-5.2", displayName: "GPT-5.2", premiumMultiplier: "1x" },
  { id: "gpt-5.1-codex-max", displayName: "GPT-5.1-Codex-Max", premiumMultiplier: "1x" },
  { id: "gpt-5.1-codex", displayName: "GPT-5.1-Codex", premiumMultiplier: "1x" },
  { id: "gpt-5.1", displayName: "GPT-5.1", premiumMultiplier: "1x" },
  {
    id: "gpt-5.1-codex-mini",
    displayName: "GPT-5.1-Codex-Mini (Preview)",
    premiumMultiplier: "0.33x",
  },
  { id: "gpt-5-mini", displayName: "GPT-5 mini", premiumMultiplier: "0x" },
  { id: "gpt-4.1", displayName: "GPT-4.1", premiumMultiplier: "0x" },
  { id: "claude-sonnet-4.6", displayName: "Claude Sonnet 4.6", premiumMultiplier: "1x" },
  { id: "claude-sonnet-4.5", displayName: "Claude Sonnet 4.5", premiumMultiplier: "1x" },
  {
    id: "claude-haiku-4.5",
    displayName: "Claude Haiku 4.5",
    premiumMultiplier: "0.33x",
  },
  { id: "claude-opus-4.6", displayName: "Claude Opus 4.6", premiumMultiplier: "3x" },
  {
    id: "claude-opus-4.6-fast",
    displayName: "Claude Opus 4.6 (fast mode)",
    premiumMultiplier: "30x",
  },
  { id: "claude-opus-4.5", displayName: "Claude Opus 4.5", premiumMultiplier: "3x" },
  { id: "claude-sonnet-4", displayName: "Claude Sonnet 4", premiumMultiplier: "1x" },
  { id: "gemini-3-pro", displayName: "Gemini 3 Pro (Preview)", premiumMultiplier: "1x" },
] as const;

const REASONING_EFFORTS = [
  {
    id: "low",
    label: "Low",
    description: "応答速度を優先する軽い推論です。",
  },
  {
    id: "medium",
    label: "Medium",
    description: "速度と考察量のバランスを取る標準設定です。",
  },
  {
    id: "high",
    label: "High",
    description: "時間をかけて丁寧に考える高い推論量です。",
  },
] as const;

/**
 * チャットメッセージの送信者種別を表します。
 */
export type MessageRole = typeof MESSAGE_ROLES[keyof typeof MESSAGE_ROLES];

/**
 * 利用可能なモデル設定を表します。
 */
export interface ModelOption {
  id: string;
  displayName: string;
  premiumMultiplier: string;
}

/**
 * モデル選択 UI に表示する候補一覧です。
 *
 * @remarks
 * renderer / preload / main のすべてで同じ定義を参照し、
 * モデル名と内部 ID のズレを防ぎます。
 */
export const availableModels = AVAILABLE_MODELS satisfies readonly ModelOption[];

/**
 * 送信時に指定できるモデル ID です。
 */
export type ModelId = (typeof availableModels)[number]["id"];

/**
 * 推論量の選択肢を表します。
 */
export interface ReasoningEffortOption {
  id: string;
  label: string;
  description: string;
}

/**
 * Reasoning Effort の候補一覧です。
 * renderer の select と main の受け口が同一ソースを参照します。
 */
export const reasoningEfforts = REASONING_EFFORTS satisfies readonly ReasoningEffortOption[];

/**
 * 送信時に指定できる推論量です。
 */
export type ReasoningEffort = (typeof reasoningEfforts)[number]["id"];

/**
 * アプリ起動直後に使う既定のモデルです。
 */
export const DEFAULT_MODEL_ID: ModelId = "gpt-5.4";

/**
 * アプリ起動直後に使う既定の推論量です。
 */
export const DEFAULT_REASONING_EFFORT: ReasoningEffort = "medium";

/**
 * チャットメッセージを表します。
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

/**
 * 利用可能なメッセージ種別の一覧です。
 */
export const messageRoles = MESSAGE_ROLES;
