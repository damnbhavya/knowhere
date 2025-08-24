export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface ChatContextType {
  currentChat: ChatHistory | null;
  chatHistories: ChatHistory[];
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  sendMessage: (content: string, mood?: string) => void;
  deleteChat: (chatId: string) => void;
  isLoading?: boolean;
}
