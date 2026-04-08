import { useState, useRef, useEffect } from 'react';
import { Plus, MessageSquare, PanelLeftClose, PanelLeft, LogOut, Sun, Moon, MoreHorizontal, Pencil, Trash2, Star } from 'lucide-react';
import type { ChatSession } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { glassStyles } from '@/styles/glass';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: number | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectSession: (id: number) => void;
  onNewChat: () => void;
  onDeleteSession: (id: number) => void;
  onRenameSession: (id: number, title: string) => void;
  onToggleStar: (id: number) => void;
  isMobile?: boolean;
  mobileHidden?: boolean;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  isCollapsed,
  onToggleCollapse,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onToggleStar,
  isMobile,
  mobileHidden,
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('knowhere-theme', newTheme);
    setIsDark(!isDark);
  };

  // close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [menuOpenId]);

  // auto focus rename input
  useEffect(() => {
    if (renamingId !== null) renameInputRef.current?.focus();
  }, [renamingId]);

  const handleMenuToggle = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(prev => (prev === id ? null : id));
  };

  const handleRenameStart = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setRenamingId(session.id);
    setRenameValue(session.title);
  };

  const handleRenameSubmit = (id: number) => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed.length > 0) {
      onRenameSession(id, trimmed);
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    onDeleteSession(id);
  };

  const handleStar = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    onToggleStar(id);
  };

  const filteredSessions = showStarredOnly ? sessions.filter(s => s.is_pinned) : sessions;

  const dur = 'duration-300';
  const ease = 'ease-[cubic-bezier(0.4,0,0.2,1)]';
  const t = `transition-all ${dur} ${ease}`;

  return (
    <>
      <aside
        className={`fixed top-4 bottom-4 z-50 rounded-2xl liquid-glass-panel flex flex-col overflow-hidden transition-all ${dur} ${ease} ${
          isMobile ? 'left-4 right-4' : `left-4 ${isCollapsed ? 'w-[56px]' : 'w-72'}`
        }`}
        style={{
          ...glassStyles,
          transform: mobileHidden ? 'translateX(calc(-100% - 2rem))' : 'translateX(0)',
        }}
      >
        {/* ── Logo / Title row ── */}
        <div className={`${t} flex items-center shrink-0 overflow-hidden ${
          isCollapsed ? 'px-0 pt-0 pb-0 h-0 justify-center' : 'px-4 pt-4 pb-2 justify-start'
        }`}>
          {/* Title text – visible when expanded */}
          <h1
            className={`font-heading font-bold text-foreground text-xl whitespace-nowrap ${t} overflow-hidden ${
              isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100'
            }`}
            style={{ letterSpacing: '-0.04em' }}
          >
            Knowhere
          </h1>
        </div>

        {/* ── Action buttons row ── */}
        <div className={`${t} flex items-center shrink-0 overflow-hidden ${
          isCollapsed ? 'flex-col px-1.5 pt-3 pb-1 gap-1' : 'flex-row px-3 pb-2 gap-1.5'
        }`}>
          <button
            onClick={toggleTheme}
            className={`${t} rounded-xl flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/15 ${
              isCollapsed ? 'w-9 h-9 rounded-full bg-transparent' : 'flex-1 h-[42px] bg-white/8'
            }`}
            aria-label="Toggle theme"
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={isCollapsed ? 16 : 18} /> : <Moon size={isCollapsed ? 16 : 18} />}
          </button>
          <button
            onClick={() => setShowStarredOnly(prev => !prev)}
            className={`${t} rounded-xl flex items-center justify-center ${
              showStarredOnly
                ? 'bg-yellow-400/15 text-yellow-400'
                : 'text-foreground/50 hover:text-foreground hover:bg-white/15'
            } ${isCollapsed
              ? 'w-9 h-9 rounded-full !bg-transparent'
              : `flex-1 h-[42px] ${showStarredOnly ? '' : 'bg-white/8'}`
            }`}
            aria-label={showStarredOnly ? 'Show all chats' : 'Show starred only'}
            title={showStarredOnly ? 'Show all chats' : 'Show starred only'}
          >
            <Star size={isCollapsed ? 16 : 18} fill={showStarredOnly ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={onToggleCollapse}
            className={`${t} rounded-xl flex items-center justify-center bg-white/8 text-foreground/50 hover:text-foreground hover:bg-white/15 ${
              isCollapsed ? 'w-9 h-9 rounded-full !bg-transparent' : 'flex-1 h-[42px]'
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* ── New chat button ── */}
        <div className={`${t} shrink-0 overflow-hidden ${
          isCollapsed ? 'px-1.5 pb-1' : 'px-3 pb-3'
        }`}>
          <button
            onClick={onNewChat}
            className={`${t} liquid-glass-btn-primary flex items-center justify-center ${
              isCollapsed ? 'w-9 h-9 rounded-full mx-auto p-0' : 'w-full gap-2'
            }`}
            style={{
              ...glassStyles,
              borderRadius: isCollapsed ? '9999px' : '9999px',
              padding: isCollapsed ? '0' : '10px 20px',
            }}
            aria-label="New chat"
            title="New chat"
          >
            <Plus size={16} className="shrink-0" />
            <span className={`text-sm font-medium whitespace-nowrap ${t} overflow-hidden ${
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}>
              New Chat
            </span>
          </button>
        </div>

        {/* ── Divider (collapsed only) ── */}
        <div className={`${t} mx-auto bg-foreground/10 shrink-0 ${
          isCollapsed ? 'w-6 h-px my-0.5 opacity-100' : 'w-0 h-0 my-0 opacity-0'
        }`} />

        {/* ── Session list ── */}
        <div className={`flex-1 overflow-y-auto ${t} ${
          isCollapsed ? 'px-1.5' : 'px-2'
        }`}>
          {isCollapsed ? (
            /* Collapsed: icon-only session dots */
            <div className="flex flex-col items-center gap-0.5">
              {filteredSessions.slice(0, 20).map(session => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${t}
                    ${activeSessionId === session.id
                      ? 'bg-white/15 text-foreground'
                      : 'text-foreground/30 hover:text-foreground/60 hover:bg-white/8'
                    }`}
                  title={session.title}
                >
                  <MessageSquare size={14} />
                </button>
              ))}
            </div>
          ) : (
            /* Expanded: full session rows */
            filteredSessions.length === 0 ? (
              <div className="text-center text-foreground/30 text-xs py-8 px-4 font-body">
                {showStarredOnly ? 'No starred chats.' : 'No conversations yet.'}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredSessions.map(session => (
                  <div key={session.id} className="relative group">
                    {renamingId === session.id ? (
                      <div className="px-3 py-2">
                        <input
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={() => handleRenameSubmit(session.id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRenameSubmit(session.id);
                            if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                          }}
                          className="w-full bg-white/10 text-sm text-foreground rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 font-body"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectSession(session.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-2.5 transition-all duration-150 font-body
                          ${activeSessionId === session.id
                            ? 'bg-white/15 text-foreground font-medium'
                            : 'text-foreground/50 hover:text-foreground hover:bg-white/8'
                          }`}
                      >
                        <MessageSquare size={14} className="shrink-0 opacity-40" />
                        <span className="truncate flex-1">{session.title}</span>
                        <button
                          onClick={e => handleMenuToggle(session.id, e)}
                          className="shrink-0 p-1 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all text-foreground/40 hover:text-foreground hover:bg-white/10"
                          aria-label="Options"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </button>
                    )}

                    {menuOpenId === session.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-2 top-10 z-[60] w-36 rounded-xl py-1 liquid-glass-panel shadow-lg"
                        style={{
                          ...glassStyles,
                          background: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        }}
                      >
                        <button
                          onClick={e => handleRenameStart(session, e)}
                          className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 text-foreground/70 hover:text-foreground hover:bg-white/10 transition-colors font-body"
                        >
                          <Pencil size={13} /> Rename
                        </button>
                        <button
                          onClick={e => handleStar(session.id, e)}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 hover:bg-white/10 transition-colors font-body ${
                            session.is_pinned ? 'text-yellow-400' : 'text-foreground/70 hover:text-foreground'
                          }`}
                        >
                          <Star size={13} fill={session.is_pinned ? 'currentColor' : 'none'} /> {session.is_pinned ? 'Starred' : 'Star'}
                        </button>
                        <div className="h-px bg-foreground/10 mx-2 my-0.5" />
                        <button
                          onClick={e => handleDelete(session.id, e)}
                          className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 text-red-400 hover:bg-red-400/10 transition-colors font-body"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* ── User footer ── */}
        <div className={`${t} shrink-0 ${isCollapsed ? 'p-1.5' : 'p-3'}`}>
          <div className={`${t} flex items-center ${
            isCollapsed ? 'justify-center px-0 py-1.5' : 'gap-3 px-3 py-2.5 rounded-xl bg-white/8'
          }`}>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            {/* Name + logout – hidden when collapsed */}
            <p className={`text-sm font-medium text-foreground truncate flex-1 ${t} overflow-hidden ${
              isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
            }`}>
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <button
              onClick={signOut}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-foreground/40 hover:text-red-400 hover:bg-white/10 transition-colors shrink-0 ${
                isCollapsed ? 'hidden' : ''
              }`}
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        :root:not(.dark) aside.fixed {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(245, 245, 245, 0.9) 100%) !important;
        }
      `}</style>
    </>
  );
}
