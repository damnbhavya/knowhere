import { useState, useCallback } from 'react';
import { getChatSessionMessages, type Message } from '@/lib/supabase';
import { streamChat, type ChatMessage } from '@/lib/chat';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChatSessionId, setActiveChatSessionId] = useState<number | null>(null);

  const loadMessages = useCallback(async (chatSessionId: number) => {
    try {
      const data = await getChatSessionMessages(chatSessionId);
      setMessages(data);
      setActiveChatSessionId(chatSessionId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setActiveChatSessionId(null);
    setStreamingContent('');
    setError(null);
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    onNewSession?: (sessionId: number, title: string) => void,
  ) => {
    if (!content.trim() || isStreaming) return;

    setIsStreaming(true);
    setError(null);
    setStreamingContent('');

    // build up the conversation history for the api
    const chatHistory: ChatMessage[] = messages.map(m => ({
      role: m.is_user_message ? 'user' as const : 'assistant' as const,
      content: m.content,
    }));
    chatHistory.push({ role: 'user', content });

    // show the user's message right away (optimistic)
    const optimisticUserMessage: Message = {
      id: Date.now(),
      chat_session_id: activeChatSessionId ?? 0,
      user_id: '',
      content,
      is_user_message: true,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticUserMessage]);

    await streamChat(
      chatHistory,
      activeChatSessionId,
      (fullText) => {
        setStreamingContent(fullText);
      },
      async (fullResponse, newSessionId) => {
        setIsStreaming(false);
        setStreamingContent('');

        // edge function creates the session, so just sync the sidebar
        if (newSessionId && !activeChatSessionId) {
          setActiveChatSessionId(newSessionId);
          const title = content.slice(0, 60);
          onNewSession?.(newSessionId, title);
        }

        // the edge function already persisted these, we just need local state
        const assistantMsg: Message = {
          id: Date.now() + 1,
          chat_session_id: activeChatSessionId ?? newSessionId ?? 0,
          user_id: '',
          content: fullResponse,
          is_user_message: false,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      },
      (errorMsg) => {
        setIsStreaming(false);
        setStreamingContent('');
        setError(errorMsg);
      },
    );
  }, [messages, isStreaming, activeChatSessionId]);

  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  return {
    messages,
    streamingContent,
    isStreaming,
    error,
    activeChatSessionId,
    setActiveChatSessionId,
    loadMessages,
    sendMessage,
    clearChat,
    setError,
    addMessage,
  };
}
