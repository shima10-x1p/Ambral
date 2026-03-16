/**
 * チャット画面の状態をまとめて管理する ViewModel です。
 * 入力中のモデル設定とメッセージ履歴を一箇所に集約し、画面側を薄く保ちます。
 */
import { useCallback, useState } from "react";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_REASONING_EFFORT,
  messageRoles,
  type ChatMessage,
  type ModelId,
  type ReasoningEffort,
} from "@shared/types";
import { chatService } from "../services/chatService";
import type { ChatViewMessage } from "../types/chat";

interface UseChatResult {
  error: string | null;
  isLoading: boolean;
  model: ModelId;
  messages: ChatViewMessage[];
  reasoningEffort: ReasoningEffort;
  sendMessage(content: string): Promise<void>;
  setModel(model: ModelId): void;
  setReasoningEffort(reasoningEffort: ReasoningEffort): void;
}

/**
 * チャット画面の状態管理と送信処理を提供します。
 *
 * @returns チャット画面で必要な状態と操作です。
 */
export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<ChatViewMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL_ID);
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>(
    DEFAULT_REASONING_EFFORT,
  );

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    setError(null);
    setMessages((currentMessages) => [
      ...currentMessages,
      createMessage(messageRoles.User, trimmedContent),
    ]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(trimmedContent, model, reasoningEffort);

      if ("error" in response) {
        setError(response.error);
        setMessages((currentMessages) => [
          ...currentMessages,
          createMessage(messageRoles.Assistant, response.error, true),
        ]);
        return;
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage(messageRoles.Assistant, response.content),
      ]);
    } catch (caughtError: unknown) {
      const errorMessage = extractErrorMessage(caughtError);
      setError(errorMessage);
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage(messageRoles.Assistant, errorMessage, true),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [model, reasoningEffort]);

  return {
    error,
    isLoading,
    model,
    messages,
    reasoningEffort,
    sendMessage,
    setModel,
    setReasoningEffort,
  };
}

/**
 * 描画用のメッセージ DTO を生成します。
 * 送受信履歴はモデル変更時も維持し、見た目だけでエラーも区別します。
 */
function createMessage(
  role: ChatMessage["role"],
  content: string,
  isError = false,
): ChatViewMessage {
  return {
    id: crypto.randomUUID(),
    isError,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 例外の種類に依存しない表示用メッセージへ正規化します。
 */
function extractErrorMessage(caughtError: unknown): string {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  return "メッセージ送信中に予期しないエラーが発生しました。";
}
