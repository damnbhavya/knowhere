import { useState, useEffect, useCallback } from 'react';
import {
  getChatSessions,
  createChatSession,
  deleteChatSession,
  updateChatSessionTitle,
  togglePinSession,
  type ChatSession,
} from '@/lib/supabase';

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getChatSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const addSession = useCallback(async (title: string): Promise<ChatSession> => {
    const session = await createChatSession(title);
    setSessions(prev => [session, ...prev]);
    return session;
  }, []);

  const removeSession = useCallback(async (id: number) => {
    await deleteChatSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const renameSession = useCallback(async (id: number, title: string) => {
    await updateChatSessionTitle(id, title);
    setSessions(prev =>
      prev.map(s => s.id === id ? { ...s, title, updated_at: new Date().toISOString() } : s)
    );
  }, []);

  const togglePin = useCallback(async (id: number) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    const newPinned = !session.is_pinned;
    setSessions(prev =>
      prev.map(s => s.id === id ? { ...s, is_pinned: newPinned } : s)
    );
    await togglePinSession(id, newPinned);
  }, [sessions]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    addSession,
    removeSession,
    renameSession,
    togglePin,
  };
}
