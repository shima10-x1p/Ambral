import { useCallback, useState } from "react";
import { messageRoles, type ChatMessage } from "@shared/types";
import { chatService } from "../services/chatService";
import type { ChatViewMessage } from "../types/chat";

interface UseChatResult {
  error: string | null;
  isLoading: boolean;
  messages: ChatViewMessage[];
  sendMessage(content: string): Promise<void>;
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
      const response = await chatService.sendMessage(trimmedContent);

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
  }, []);

  return {
    error,
    isLoading,
    messages,
    sendMessage,
  };
}

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

function extractErrorMessage(caughtError: unknown): string {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  return "メッセージ送信中に予期しないエラーが発生しました。";
}
