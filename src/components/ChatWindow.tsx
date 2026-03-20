import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { glassStyles } from '@/styles/glass';
import type { Message } from '@/lib/supabase';

interface ChatWindowProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  isGeneratingImage?: boolean;
  error: string | null;
  onDismissError: () => void;
}

export default function ChatWindow({
  messages,
  streamingContent,
  isStreaming,
  isGeneratingImage,
  error,
  onDismissError,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, isGeneratingImage]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-6 space-y-1">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            isUser={msg.is_user_message}
            timestamp={msg.timestamp}
          />
        ))}

        {isStreaming && streamingContent && (
          <MessageBubble content={streamingContent} isUser={false} isStreaming={true} />
        )}

        {isStreaming && !streamingContent && (
          <div className="flex px-4 py-2">
            <div className="liquid-glass-panel rounded-2xl rounded-bl-md px-4 py-3" style={glassStyles}>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
              </div>
            </div>
          </div>
        )}

        {/* image generation skeleton */}
        {isGeneratingImage && (
          <div className="flex px-4 py-2">
            <div className="liquid-glass-panel rounded-2xl rounded-bl-md px-4 py-4" style={glassStyles}>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-foreground/40 font-body">
                  <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                  Generating image...
                </div>
                <div className="w-64 h-48 rounded-xl bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4">
            <div className="liquid-glass-panel rounded-2xl px-4 py-3 text-sm text-destructive flex items-center justify-between" style={glassStyles}>
              <span>{error}</span>
              <button onClick={onDismissError} className="ml-2 text-destructive/60 hover:text-destructive">✕</button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
