import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiUser, FiMessageCircle, FiLogIn, FiLogOut, FiChevronDown, FiMenu } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { useViewportHeight } from '../hooks/useViewportHeight';
import LoginModal from './LoginModal';
import type { Message } from '../types';
import 'highlight.js/styles/github-dark.css';

// Mood configurations
const AI_MOODS = {
  default: {
    name: 'Default',
    icon: '⚡',
    emoji: '⚡',
    description: 'Balanced and helpful responses'
  },
  funny: {
    name: 'Funny',
    icon: '😄',
    emoji: '😄',
    description: 'Humorous and witty responses'
  },
  roasting: {
    name: 'Roasting',
    icon: '🔥',
    emoji: '🔥',
    description: 'Playful roasts and sarcastic humor'
  },
  precise: {
    name: 'Precise',
    icon: '🎯',
    emoji: '🎯',
    description: 'Direct and to-the-point answers'
  },
  intellectual: {
    name: 'Intellectual',
    icon: '🧠',
    emoji: '🧠',
    description: 'Deep, thoughtful, and analytical'
  }
} as const;

type MoodType = keyof typeof AI_MOODS;

// Component to render message content with markdown support
const MessageContent: React.FC<{ content: string; role: 'user' | 'assistant' }> = ({ content, role }) => {
  if (role === 'user') {
    // Render user messages as plain text with line breaks preserved
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  // Render AI messages with markdown support
  return (
    <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom styling for markdown elements
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono break-all">{children}</code>
            ) : (
              <code className={className}>{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-black/20 border border-white/10 rounded-lg p-3 overflow-x-auto my-2 max-w-full">
              {children}
            </pre>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-white/30 pl-3 italic my-2">{children}</blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-200 underline"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="border-collapse border border-white/20 rounded">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-white/20 px-2 py-1 bg-white/10 font-semibold text-xs">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-white/20 px-2 py-1 text-xs">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface ChatAreaProps {
  onToggleSidebar?: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ onToggleSidebar }) => {
  const { currentChat, sendMessage } = useChat();
  const { isAuthenticated, user, logout } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType>('default');
  const [moodDropdownOpen, setMoodDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const moodDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const viewportHeight = useViewportHeight();

  const handleInputFocus = () => {
    // Prevent automatic scrolling - let the dynamic height adjustment handle positioning
    // The ChatArea height will adjust automatically when keyboard appears
  };

  const handleInputBlur = () => {
    // Input blur handler - can be used for cleanup if needed
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setLoginModalOpen(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      await sendMessage(message, selectedMood);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      // Use smaller max height on mobile
      const maxHeight = window.innerWidth < 640 ? 100 : 150;
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
    }
  };

  // Handle viewport height changes (keyboard showing/hiding)
  useEffect(() => {
    const updateChatAreaHeight = () => {
      if (chatAreaRef.current) {
        // Store current scroll position to prevent unwanted scrolling
        const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;

        // Calculate available height more precisely
        const windowHeight = window.visualViewport?.height || window.innerHeight;

        // Get the App container padding (8px on mobile, 16px on larger screens)
        const appPadding = window.innerWidth < 640 ? 16 : 32; // p-2 = 8px each side, p-4 = 16px each side

        // Calculate the available height for the chat area
        const availableHeight = windowHeight - appPadding;

        // Set the height directly without triggering scroll
        chatAreaRef.current.style.height = `${availableHeight}px`;
        chatAreaRef.current.style.maxHeight = `${availableHeight}px`;

        // Restore scroll position to prevent unwanted scrolling
        if (currentScrollTop !== 0) {
          window.scrollTo(0, currentScrollTop);
        }
      }
    };

    updateChatAreaHeight();

    // Listen for viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateChatAreaHeight);
      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', updateChatAreaHeight);
        }
      };
    }
  }, [viewportHeight]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Prevent page from scrolling on mobile
  useEffect(() => {
    const preventScroll = () => {
      if (window.innerWidth < 768) {
        window.scrollTo(0, 0);
      }
    };

    // Reset scroll position
    preventScroll();

    // Listen for any scroll attempts and reset them
    window.addEventListener('scroll', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('scroll', preventScroll);
    };
  }, []);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moodDropdownRef.current && !moodDropdownRef.current.contains(event.target as Node)) {
        setMoodDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    setMoodDropdownOpen(false);
  };

  return (
    <div
      ref={chatAreaRef}
      className="flex flex-col overflow-hidden chat-container"
      style={{ height: '100%', maxHeight: '100%' }}
    >
      {/* Chat Header with Hamburger Menu and Sign In Button */}
      <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Menu */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden glass-button p-2 rounded-full hover:bg-white/10"
            title="Toggle Menu"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white app-name">
            Knowhere
          </h2>
        </div>

        {/* Auth Button */}
        <div className="flex items-center relative">
          {isAuthenticated ? (
            <>
              {/* Desktop: Show username + logout button */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-white">
                  <FiUser className="w-4 h-4" />
                  <span>{user?.username || user?.email}</span>
                </div>
                <button
                  onClick={handleAuthAction}
                  className="glass-button p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Logout"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile: Show profile icon with dropdown */}
              <div className="sm:hidden relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="glass-button p-2 rounded-full hover:bg-white/10"
                  title="Profile"
                >
                  <FiUser className="w-5 h-5" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 rounded-2xl p-2 min-w-48 z-50"
                       style={{
                         background: 'rgba(0, 0, 0, 0.85)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)',
                         border: '1px solid rgba(255, 255, 255, 0.2)',
                         boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                       }}>
                    {/* Add a pseudo-element for better blur support */}
                    <div className="absolute inset-0 rounded-2xl"
                         style={{
                           background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                           backdropFilter: 'blur(20px)',
                           WebkitBackdropFilter: 'blur(20px)',
                           zIndex: -1,
                         }}></div>
                    <div className="p-3 border-b border-white/10 relative">
                      <div className="text-sm font-medium text-white">
                        {user?.username || user?.email}
                      </div>
                    </div>
                    <button
                      onClick={handleAuthAction}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/15 transition-all duration-200 relative"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span className="text-sm text-white">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={handleAuthAction}
              className="flex items-center gap-2 bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-xl border border-blue-400/30 shadow-2xl shadow-blue-500/25 text-white p-2 sm:px-6 sm:py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40 text-sm sm:text-base"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
              title="Sign In"
            >
              <FiLogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 space-y-4 sm:space-y-6 hide-scrollbar min-h-0">
        {!currentChat ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FiMessageCircle className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-white/40" />
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                Welcome to Knowhere
              </h3>
              <p className="text-sm sm:text-base text-white/60 mb-4">
                {isAuthenticated
                  ? "Start a new conversation or select an existing one from the sidebar"
                  : "Sign in to start chatting with our AI assistant and save your conversations"
                }
              </p>
              {!isAuthenticated && (
                <p className="text-white/40 text-xs sm:text-sm">
                  You can still send messages without signing in, but they won't be saved.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {currentChat.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FiMessageCircle className="w-12 h-12 mx-auto mb-3 text-white/40" />
                  <p className="text-white/60">
                    Start the conversation by typing a message below
                  </p>
                </div>
              </div>
            ) : (
              currentChat.messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-500/30 text-white backdrop-blur-lg border border-blue-400/30'
                      : 'bg-white/20 text-white backdrop-blur-lg border border-white/20'
                  }`}>
                    {message.role === 'user' ? <FiUser className="w-5 h-5" /> : <FiMessageCircle className="w-5 h-5" />}
                  </div>
                  <div className={`chat-message ${message.role}`}>
                    <MessageContent content={message.content} role={message.role} />
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/20 flex items-center justify-center">
                  <FiMessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="chat-message assistant">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-white/70">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-3 sm:p-6">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 relative flex items-center">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Type your message..."
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 glass-input text-sm sm:text-base text-white placeholder-white/50 resize-none rounded-full overflow-hidden flex items-center"
              rows={1}
              style={{
                minHeight: '40px',
                maxHeight: '100px', // Reduced for mobile
                lineHeight: '1.4',
                display: 'flex',
                alignItems: 'center'
              }}
              disabled={isLoading}
            />
          </div>

          {/* Mood Selector Button */}
          <div className="relative" ref={moodDropdownRef}>
            <button
              type="button"
              onClick={() => setMoodDropdownOpen(!moodDropdownOpen)}
              className="px-2 py-2 sm:px-3 sm:py-3 glass-button hover:bg-white/10 rounded-full h-10 sm:h-12 flex items-center justify-center gap-1 sm:gap-2 transition-all duration-300 group min-w-[3rem] sm:min-w-[4rem]"
              title={`Current mood: ${AI_MOODS[selectedMood].name}`}
            >
              <span className="text-sm sm:text-lg group-hover:scale-110 transition-transform duration-300">
                {AI_MOODS[selectedMood].icon}
              </span>
              <FiChevronDown
                className={`w-3 h-3 sm:w-4 sm:h-4 text-white/70 transition-transform duration-300 flex-shrink-0 ${
                  moodDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Mood Dropdown */}
            {moodDropdownOpen && (
              <div className="absolute bottom-full right-0 mb-2 rounded-2xl p-2 min-w-48 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200"
                   style={{
                     background: 'rgba(0, 0, 0, 0.85)',
                     backdropFilter: 'blur(20px)',
                     WebkitBackdropFilter: 'blur(20px)',
                     border: '1px solid rgba(255, 255, 255, 0.2)',
                     boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                   }}>
                {/* Add a pseudo-element for better blur support */}
                <div className="absolute inset-0 rounded-2xl"
                     style={{
                       background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                       backdropFilter: 'blur(20px)',
                       WebkitBackdropFilter: 'blur(20px)',
                       zIndex: -1,
                     }}></div>
                <div className="space-y-1 relative">
                  {Object.entries(AI_MOODS).map(([key, mood]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleMoodSelect(key as MoodType)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        selectedMood === key
                          ? 'bg-white/25 shadow-lg'
                          : 'hover:bg-white/15'
                      }`}
                    >
                      <span className="text-lg">{mood.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-white">{mood.name}</div>
                        <div className="text-xs text-white/60">{mood.description}</div>
                      </div>
                      {selectedMood === key && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <div className="flex-shrink-0 flex items-center">
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 sm:p-3 primary-glass-button disabled:opacity-50 disabled:cursor-not-allowed rounded-full h-10 sm:h-12 w-10 sm:w-12 flex items-center justify-center"
            >
              <FiSend className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
};

export default ChatArea;
