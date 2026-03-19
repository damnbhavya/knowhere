import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/chat`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function streamChat(
  messages: ChatMessage[],
  chatSessionId: number | null,
  onChunk: (text: string) => void,
  onDone: (fullResponse: string, newSessionId?: number) => void,
  onError: (error: string) => void,
): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      onError('Not authenticated');
      return;
    }

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ messages, chatSessionId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      onError(`Error: ${response.status} — ${errorText}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response stream');
      return;
    }

    const decoder = new TextDecoder();
    let fullResponse = '';
    let newSessionId: number | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'text') {
              fullResponse += parsed.content;
              onChunk(fullResponse);
            } else if (parsed.type === 'session_id') {
              newSessionId = parsed.id;
            } else if (parsed.type === 'error') {
              onError(parsed.content);
              return;
            }
          } catch {
            fullResponse += data;
            onChunk(fullResponse);
          }
        }
      }
    }

    onDone(fullResponse, newSessionId);
  } catch (err) {
    onError(err instanceof Error ? err.message : 'An unknown error occurred');
  }
}
