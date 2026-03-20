import { useCallback, useState, useMemo } from 'react';
import { supabase, type Message } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import InputBar from '@/components/InputBar';
import StaticGrid from '@/components/StaticGrid';
import { useChat } from '@/hooks/useChat';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useAuth } from '@/hooks/useAuth';
import { glassStyles } from '@/styles/glass';

// time-aware greetings
function getGreeting(name: string): { before: string; name: string; after: string } {
  const hour = new Date().getHours();
  const firstName = name.split(' ')[0] || name;

  const lateNight = [
    { before: 'Still up, ', after: '?' },
    { before: 'Burning the midnight oil, ', after: '' },
    { before: 'The night is young, ', after: '' },
    { before: "Can't sleep, ", after: '?' },
  ];
  const morning = [
    { before: 'Good morning, ', after: '' },
    { before: 'Rise and shine, ', after: '' },
    { before: 'Morning, ', after: "! What's on your mind?" },
    { before: 'Hey ', after: ', fresh start today' },
  ];
  const afternoon = [
    { before: 'Good afternoon, ', after: '' },
    { before: 'Hey ', after: ", what's up?" },
    { before: 'Afternoon, ', after: '! Need a hand?' },
    { before: "What's cooking, ", after: '?' },
  ];
  const evening = [
    { before: 'Good evening, ', after: '' },
    { before: 'Hey ', after: ', how was your day?' },
    { before: 'Evening, ', after: '! What can I help with?' },
    { before: 'Winding down, ', after: '?' },
  ];

  type Part = { before: string; after: string };
  const pick = (arr: Part[]) => arr[Math.floor(Math.random() * arr.length)];

  let chosen: Part;
  if (hour >= 0 && hour < 5) chosen = pick(lateNight);
  else if (hour >= 5 && hour < 12) chosen = pick(morning);
  else if (hour >= 12 && hour < 17) chosen = pick(afternoon);
  else if (hour >= 17 && hour < 21) chosen = pick(evening);
  else chosen = pick(lateNight);

  return { before: chosen.before, name: firstName, after: chosen.after };
}

const ALL_SUGGESTIONS = [
  "What can you do?",
  "Explain quantum computing",
  "Help me write a poem",
  "Debug my code",
  "Tell me a fun fact",
  "Summarize a topic for me",
  "Help me brainstorm ideas",
  "What's trending in tech?",
  "Write me a short story",
  "Explain blockchain simply",
  "Help me plan my day",
  "Give me a coding challenge",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function Chat() {
  const { sessions, removeSession, renameSession, togglePin, fetchSessions } = useChatSessions();
  const {
    messages, streamingContent, isStreaming, error,
    activeChatSessionId, setActiveChatSessionId, loadMessages, sendMessage, clearChat, setError, addMessage,
  } = useChat();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleSelectSession = useCallback(async (id: number) => {
    await loadMessages(id);
  }, [loadMessages]);

  const handleNewChat = useCallback(() => {
    clearChat();
  }, [clearChat]);

  const handleDeleteSession = useCallback(async (id: number) => {
    await removeSession(id);
    if (activeChatSessionId === id) clearChat();
  }, [removeSession, activeChatSessionId, clearChat]);

  const handleRenameSession = useCallback(async (id: number, title: string) => {
    await renameSession(id, title);
  }, [renameSession]);

  const handleToggleStar = useCallback(async (id: number) => {
    await togglePin(id);
  }, [togglePin]);

  const handleSend = useCallback(async (content: string, imageMode?: boolean) => {
    if (imageMode) {
      handleImageGen(content);
      return;
    }
    await sendMessage(content, async () => {
      await fetchSessions();
    });
  }, [sendMessage, fetchSessions]);

  const handleImageGen = async (prompt: string) => {
    setIsGeneratingImage(true);

    const userMsg: Message = {
      id: Date.now(),
      chat_session_id: activeChatSessionId ?? 0,
      user_id: '',
      content: prompt,
      is_user_message: true,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        setIsGeneratingImage(false);
        return;
      }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setError(data.error || 'Image generation failed');
        setIsGeneratingImage(false);
        return;
      }

      // store as data URI — works in DB and renders after refresh
      const dataUri = `data:${data.mimeType || 'image/jpeg'};base64,${data.image}`;
      const imageContent = `[IMG]${dataUri}[/IMG]`;

      const aiMsg: Message = {
        id: Date.now() + 1,
        chat_session_id: activeChatSessionId ?? 0,
        user_id: '',
        content: imageContent,
        is_user_message: false,
        timestamp: new Date().toISOString(),
      };
      addMessage(aiMsg);
      setIsGeneratingImage(false);

      // persist to DB (runs in background, skeleton is already gone)
      let sessionId = activeChatSessionId;
      if (!sessionId) {
        const title = `🎨 ${prompt.slice(0, 50)}`;
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({ user_id: session.user.id, title })
          .select()
          .single();
        if (newSession) {
          sessionId = newSession.id;
          setActiveChatSessionId(newSession.id);
        }
        await fetchSessions();
      }

      if (sessionId) {
        await supabase.from('messages').insert([
          { chat_session_id: sessionId, user_id: session.user.id, content: prompt, is_user_message: true },
          { chat_session_id: sessionId, user_id: session.user.id, content: imageContent, is_user_message: false },
        ]);
        await supabase.from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sessionId);
      }
    } catch (err) {
      setIsGeneratingImage(false);
      setError(err instanceof Error ? err.message : 'Image generation failed');
    }
  };

  const isEmptyState = messages.length === 0 && !isStreaming && !isGeneratingImage;
  const contentMarginLeft = sidebarCollapsed ? 'calc(56px + 2rem)' : 'calc(288px + 2rem)';

  return (
    <div className="h-screen overflow-hidden relative">
      <StaticGrid />
      <Sidebar
        sessions={sessions}
        activeSessionId={activeChatSessionId}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onToggleStar={handleToggleStar}
      />

      <main
        className="h-full flex flex-col transition-all duration-200 ease-out"
        style={{ marginLeft: contentMarginLeft }}
      >
        {isEmptyState ? (
          <EmptyState
            error={error}
            onDismissError={() => setError(null)}
            onSend={handleSend}
            isStreaming={isStreaming}
          />
        ) : (
          <>
            <ChatWindow
              messages={messages}
              streamingContent={streamingContent}
              isStreaming={isStreaming}
              isGeneratingImage={isGeneratingImage}
              error={error}
              onDismissError={() => setError(null)}
            />
            <InputBar onSend={handleSend} disabled={isStreaming || isGeneratingImage} />
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({
  error, onDismissError, onSend, isStreaming,
}: {
  error: string | null;
  onDismissError: () => void;
  onSend: (msg: string) => void;
  isStreaming: boolean;
}) {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || 'there';

  // keep greeting + suggestions stable across re-renders
  const greeting = useMemo(() => getGreeting(name), [name]);
  const suggestions = useMemo(() => pickRandom(ALL_SUGGESTIONS, 4), []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <h2
          className="font-heading font-bold text-foreground/80 text-center mb-8"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', letterSpacing: '-0.04em' }}
        >
          {greeting.before}<span style={{ color: 'var(--brand-red)' }}>{greeting.name}</span>{greeting.after}
        </h2>

        <InputBar onSend={onSend} disabled={isStreaming} />

        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => onSend(s)}
              className="text-xs px-4 py-2 rounded-full liquid-glass-panel text-foreground/50 hover:text-foreground/80 transition-colors cursor-pointer font-body"
              style={glassStyles}
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 liquid-glass-panel rounded-2xl px-4 py-3 text-sm text-destructive flex items-center justify-between" style={glassStyles}>
            <span>{error}</span>
            <button onClick={onDismissError} className="ml-2 text-destructive/60 hover:text-destructive">✕</button>
          </div>
        )}
      </div>
    </div>
  );
}
