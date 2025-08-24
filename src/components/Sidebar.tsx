import React from 'react';
import {
  FiPlus,
  FiMessageSquare,
  FiTrash2,
  FiX
} from 'react-icons/fi';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { chatHistories, currentChat, createNewChat, selectChat, deleteChat } = useChat();
  const { isAuthenticated } = useAuth();

  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return messageDate.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-4 top-4 bottom-4 w-80 glass-panel transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-[110%]'
      } lg:relative lg:translate-x-0 lg:left-0 lg:top-0 lg:bottom-0 flex flex-col`}>

        {/* Header */}
        <div className="flex items-center justify-end p-6 pb-2">
          <button
            onClick={onToggle}
            className="lg:hidden glass-button p-2"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-6 pb-6">
          <button
            onClick={createNewChat}
            className="w-full glass-button text-white px-4 py-3 rounded-full flex items-center justify-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            <span className="text-sm font-medium">New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-6 space-y-3 hide-scrollbar">
          {chatHistories.length === 0 ? (
            <div className="text-center text-white/70 py-8">
              <FiMessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">
                {isAuthenticated
                  ? "Start a new chat to begin"
                  : "Sign in to save your conversations"
                }
              </p>
            </div>
          ) : (
            chatHistories.map((chat) => (
              <div
                key={chat.id}
                className={`group relative sidebar-item ${
                  currentChat?.id === chat.id ? 'active' : ''
                }`}
                onClick={() => selectChat(chat.id)}
              >
                <div className="flex items-center gap-3">
                  <FiMessageSquare className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate text-white">
                      {chat.title}
                      {chat.id.startsWith('local-') && !isAuthenticated && (
                        <span className="text-xs text-yellow-400 ml-1">(Local)</span>
                      )}
                    </h3>
                    <p className="text-xs text-white/60 mt-1">
                      {formatDate(chat.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-500/20 text-red-400 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
