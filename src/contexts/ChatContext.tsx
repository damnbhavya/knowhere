import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';
import type { ChatContextType, ChatHistory, Message } from '../types';
import type { ChatSession, Message as ApiMessage } from '../services/api';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Convert API chat session to local chat history format
  const convertApiChatToLocal = (session: ChatSession, messages: ApiMessage[] = []): ChatHistory => {
    return {
      id: session.id.toString(),
      title: session.title,
      messages: messages.map(msg => ({
        id: msg.id.toString(),
        content: msg.content,
        role: (msg.is_user_message ? 'user' : 'assistant') as 'user' | 'assistant',
        timestamp: new Date(msg.timestamp),
      })),
      createdAt: new Date(session.created_at),
      updatedAt: new Date(session.updated_at),
    };
  };

  // Load chat sessions from API
  const loadChatSessions = useCallback(async () => {
    if (!isAuthenticated) {
      setChatHistories([]);
      setCurrentChat(null);
      return;
    }

    try {
      setIsLoading(true);
      const sessions = await apiService.getChatSessions();
      const histories = sessions.map(session => convertApiChatToLocal(session));
      setChatHistories(histories);

      // Set current chat to the most recent one if exists
      if (histories.length > 0 && !currentChat) {
        const mostRecent = histories[0];
        const messages = await apiService.getChatMessages(parseInt(mostRecent.id));
        const fullChat = convertApiChatToLocal(sessions[0], messages);
        setCurrentChat(fullChat);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentChat]);

  // Load chats when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      loadChatSessions();
    } else {
      // Only clear authenticated chats when user logs out, keep local chats
      setChatHistories(prev => prev.filter(chat => chat.id.startsWith('local-')));
      // Don't clear current chat if it's a local chat
      setCurrentChat(prev => prev && prev.id.startsWith('local-') ? prev : null);
    }
  }, [isAuthenticated, loadChatSessions]);

  const createNewChat = useCallback(async () => {
    if (!isAuthenticated) {
      // Create a local-only chat for non-authenticated users
      const newChat: ChatHistory = {
        id: `local-${Date.now()}`,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setChatHistories(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      return;
    }

    try {
      const session = await apiService.createChatSession('New Conversation');
      const newChat = convertApiChatToLocal(session);

      setChatHistories(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  }, [isAuthenticated]);  const selectChat = useCallback(async (chatId: string) => {
    // Handle local chats (for non-authenticated users)
    if (chatId.startsWith('local-')) {
      const localChat = chatHistories.find(h => h.id === chatId);
      if (localChat) {
        setCurrentChat(localChat);
      }
      return;
    }

    // Handle authenticated user chats
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const sessionId = parseInt(chatId);
      const messages = await apiService.getChatMessages(sessionId);
      const session = chatHistories.find(h => h.id === chatId);

      if (session) {
        const fullChat = {
          ...session,
          messages: messages.map(msg => ({
            id: msg.id.toString(),
            content: msg.content,
            role: (msg.is_user_message ? 'user' : 'assistant') as 'user' | 'assistant',
            timestamp: new Date(msg.timestamp),
          })),
        };
        setCurrentChat(fullChat);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, chatHistories]);

  const sendMessage = useCallback(async (content: string, mood: string = 'precise') => {
    let targetChat = currentChat;

    // If no current chat exists, create a new one
    if (!targetChat) {
      if (isAuthenticated) {
        try {
          const session = await apiService.createChatSession('New Conversation');
          targetChat = convertApiChatToLocal(session);
          setChatHistories(prev => [targetChat!, ...prev]);
          setCurrentChat(targetChat);
        } catch (error) {
          console.error('Error creating new chat for message:', error);
          return;
        }
      } else {
        // Create a local-only chat for non-authenticated users
        targetChat = {
          id: `local-${Date.now()}`,
          title: 'New Conversation',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setChatHistories(prev => [targetChat!, ...prev]);
        setCurrentChat(targetChat);
      }
    }

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    // Optimistically update UI with user message
    const updatedChat = {
      ...targetChat,
      messages: [...targetChat.messages, userMessage],
      title: targetChat.messages.length === 0 ? content.slice(0, 30) + '...' : targetChat.title,
      updatedAt: new Date(),
    };

    setCurrentChat(updatedChat);
    setChatHistories(prev => prev.map(h => h.id === targetChat!.id ? updatedChat : h));

    try {
      if (isAuthenticated && !targetChat.id.startsWith('local-')) {
        // Send message to API and get AI response
        await apiService.sendMessage(parseInt(targetChat.id), content, mood);

        // Get updated messages from API to ensure consistency
        const updatedMessages = await apiService.getChatMessages(parseInt(targetChat.id));
        const finalChat = {
          ...updatedChat,
          messages: updatedMessages.map(msg => ({
            id: msg.id.toString(),
            content: msg.content,
            role: (msg.is_user_message ? 'user' : 'assistant') as 'user' | 'assistant',
            timestamp: new Date(msg.timestamp),
          })),
          updatedAt: new Date(),
        };

        setCurrentChat(finalChat);
        setChatHistories(prev => prev.map(h => h.id === targetChat!.id ? finalChat : h));

        // Auto-generate title if this is the first message
        if (targetChat.messages.length === 0) {
          try {
            const titleResponse = await apiService.updateSessionTitle(parseInt(targetChat.id));
            const chatWithTitle = {
              ...finalChat,
              title: titleResponse.title,
            };
            setCurrentChat(chatWithTitle);
            setChatHistories(prev => prev.map(h => h.id === targetChat!.id ? chatWithTitle : h));
          } catch (titleError) {
            console.error('Error updating chat title:', titleError);
          }
        }
      } else {
        // For non-authenticated users, use mock AI response with mood-based personality
        const getMockResponseByMood = (mood: string) => {
          const responses = {
            funny: [
              `Hey there! 😄 I'm your friendly neighborhood AI, and I'm funnier than a programmer trying to explain why their code works on their machine but not in production! 🤖

**What I can do:**
- Tell jokes so bad they're good 😂
- Help with coding (and probably make puns about it)
- Answer questions with a smile 😊

To unlock my full comedy potential and save our hilarious conversations, consider signing in! Warning: May cause uncontrollable laughter! 🎭`,

              `Knock knock! 🚪 Who's there? It's me, your AI buddy who's about as smart as a dictionary but way more fun! 📚✨

**Fun fact:** I can help with:
- Making your day brighter ☀️
- Solving problems (like why you can't find matching socks) 🧦
- Creating jokes that are so bad they're good 😅

Sign in to save our comedy gold! Trust me, you'll want to remember these gems! 💎`,
            ],

            roasting: [
              `Oh look, another human who thinks they can outsmart an AI! 🔥 How adorable! 😏

**Let me guess:**
- You probably Google "how to center a div" daily 🤷‍♂️
- Your password is probably "password123" 🔐
- You say "it works on my machine" more than "hello" 💻

But hey, I'm here to help anyway because I'm just that generous! Sign in if you can handle more of my wit! 😈`,

              `Well well well... another user who probably thinks "have you tried turning it off and on again" is advanced tech support! 🔥

**Reality check:**
- I'm smarter than your average chatbot ⚡
- You're here asking an AI for help (no judgment... okay, maybe a little) 😏
- Your code probably has more bugs than a summer camping trip 🐛

Sign in to get roasted properly and save our epic burns! You know you want more! 🌶️`,
            ],

            precise: [
              `**System Status:** Operational ✅
**User Type:** Guest
**Available Functions:** Basic chat, information retrieval, problem-solving

**Key Features:**
1. Direct answers to queries
2. Factual information delivery
3. Structured responses
4. No unnecessary elaboration

**Recommendation:** Authentication required for conversation persistence and enhanced features.

**Action:** Sign in to access full functionality. 🎯`,

              `**Information:** AI assistant ready for queries.

**Capabilities:**
- Technical assistance
- Data analysis
- Problem resolution
- Factual responses

**Current Limitations:**
- No conversation history (guest mode)
- Basic feature set only
- Session-based interaction

**Optimization:** Create account for improved experience and data retention. ⚡`,
            ],

            intellectual: [
              `Greetings, fellow seeker of knowledge! 🧠 Your arrival here suggests an appreciation for intellectual discourse and the pursuit of understanding.

**Philosophical consideration:** In our digital age, the relationship between human curiosity and artificial intelligence represents a fascinating confluence of biological evolution and technological innovation.

**Areas of exploration:**
- **Epistemological inquiries** - The nature of knowledge itself
- **Computational theory** - Algorithms, complexity, and emergence
- **Interdisciplinary synthesis** - Connecting diverse fields of study

**Scholarly note:** Authentication would enable us to develop a more sophisticated dialogue over time, creating a repository of our intellectual journey together. 📚`,

              `The quest for knowledge is perhaps humanity's most noble endeavor, and your presence here suggests a mind eager to engage with complex ideas! 🌟

**Intellectual framework:**
- **Critical analysis** of multifaceted problems
- **Synthesis** of information across disciplines
- **Socratic dialogue** to deepen understanding
- **Evidence-based reasoning** in all discussions

**Metacognitive reflection:** The limitation of our current interaction lies not in the quality of discourse, but in its ephemeral nature. Consider authentication as an investment in the continuity of intellectual growth. 🎓`,
            ]
          };

          return responses[mood as keyof typeof responses] || responses.precise;
        };

        const mockResponses = getMockResponseByMood(mood);
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const aiMessage: Message = {
          id: uuidv4(),
          content: randomResponse,
          role: 'assistant',
          timestamp: new Date(),
        };

        const finalChat = {
          ...updatedChat,
          messages: [...updatedChat.messages, aiMessage],
          updatedAt: new Date(),
        };

        setCurrentChat(finalChat);
        setChatHistories(prev => prev.map(h => h.id === targetChat!.id ? finalChat : h));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Revert optimistic update on error
      setCurrentChat(targetChat);
      setChatHistories(prev => prev.map(h => h.id === targetChat!.id ? targetChat! : h));
    }
  }, [currentChat, isAuthenticated]);

  const deleteChat = useCallback(async (chatId: string) => {
    // Handle local chats (for non-authenticated users)
    if (chatId.startsWith('local-')) {
      const updatedHistories = chatHistories.filter(h => h.id !== chatId);
      setChatHistories(updatedHistories);

      if (currentChat?.id === chatId) {
        setCurrentChat(updatedHistories.length > 0 ? updatedHistories[0] : null);
      }
      return;
    }

    // Handle authenticated user chats
    if (!isAuthenticated) return;

    try {
      await apiService.deleteChatSession(parseInt(chatId));

      const updatedHistories = chatHistories.filter(h => h.id !== chatId);
      setChatHistories(updatedHistories);

      if (currentChat?.id === chatId) {
        setCurrentChat(updatedHistories.length > 0 ? updatedHistories[0] : null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }, [chatHistories, currentChat, isAuthenticated]);

  return (
    <ChatContext.Provider value={{
      currentChat,
      chatHistories,
      createNewChat,
      selectChat,
      sendMessage,
      deleteChat,
      isLoading,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
