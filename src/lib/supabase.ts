import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



export interface ChatSession {
  id: number;
  user_id: string;
  title: string;
  is_archived: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  chat_session_id: number;
  user_id: string;
  content: string;
  is_user_message: boolean;
  timestamp: string;
}

export async function getChatSessions(): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getChatSessionMessages(chatSessionId: number): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_session_id', chatSessionId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createChatSession(title: string): Promise<ChatSession> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: user.id, title })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateChatSessionTitle(id: number, title: string): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteChatSession(id: number): Promise<void> {
  // cascade: nuke messages first
  const { error: msgError } = await supabase
    .from('messages')
    .delete()
    .eq('chat_session_id', id);

  if (msgError) throw msgError;

  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function togglePinSession(id: number, isPinned: boolean): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ is_pinned: isPinned })
    .eq('id', id);

  if (error) throw error;
}

export async function saveMessage(
  chatSessionId: number,
  content: string,
  isUserMessage: boolean,
): Promise<Message> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_session_id: chatSessionId,
      user_id: user.id,
      content,
      is_user_message: isUserMessage,
    })
    .select()
    .single();

  if (error) throw error;

  // bump the session's updated_at so it floats to the top
  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatSessionId);

  return data;
}
