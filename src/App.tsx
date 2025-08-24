import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { useViewportHeight } from './hooks/useViewportHeight';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const viewportHeight = useViewportHeight();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div 
      className="text-gray-900 dark:text-white overflow-hidden"
      style={{ height: `${viewportHeight}px` }}
    >
      <div className="flex h-full p-2 sm:p-4 gap-2 sm:gap-4">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Area - now takes full height */}
          <div className="flex-1 min-h-0 glass-panel">
            <ChatArea onToggleSidebar={toggleSidebar} />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
