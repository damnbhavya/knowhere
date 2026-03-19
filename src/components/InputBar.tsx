import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { glassStyles } from '@/styles/glass';

interface InputBarProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto">
        <div
          className="rounded-full flex items-end gap-3 px-4 p-3 border transition-colors"
          style={{
            ...glassStyles,
            background: 'var(--input-bar-bg)',
            borderColor: 'var(--input-bar-border)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder-foreground/30 focus:outline-none disabled:opacity-50 font-body min-h-[24px] py-1"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:opacity-80"
            aria-label="Send message"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-[10px] text-foreground/20 text-center mt-2 font-body">
          Knowhere can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
