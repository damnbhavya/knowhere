import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Image, X } from 'lucide-react';
import { glassStyles } from '@/styles/glass';

interface InputBarProps {
  onSend: (message: string, imageMode?: boolean) => void;
  disabled: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [input, setInput] = useState('');
  const [imageMode, setImageMode] = useState(false);
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
    onSend(input.trim(), imageMode);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const toggleImageMode = () => {
    setImageMode(prev => !prev);
    textareaRef.current?.focus();
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
          className="rounded-2xl flex items-end gap-3 px-4 p-3 border transition-colors"
          style={{
            ...glassStyles,
            background: 'var(--input-bar-bg)',
            borderColor: imageMode ? 'var(--brand-red)' : 'var(--input-bar-border)',
          }}
        >
          <button
            onClick={toggleImageMode}
            disabled={disabled}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              imageMode
                ? 'bg-[var(--brand-red)] text-white'
                : 'text-foreground/30 hover:text-primary hover:bg-white/8'
            } disabled:opacity-20`}
            aria-label={imageMode ? 'Exit image mode' : 'Image mode'}
            title={imageMode ? 'Exit image mode' : 'Generate image'}
          >
            {imageMode ? <X size={14} /> : <Image size={16} />}
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={imageMode ? 'Describe an image to generate...' : 'Ask anything...'}
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder-foreground/30 focus:outline-none disabled:opacity-50 font-body min-h-[24px] py-1"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
              imageMode
                ? 'bg-[var(--brand-red)] text-white disabled:opacity-30'
                : 'bg-foreground text-background disabled:opacity-20'
            } disabled:cursor-not-allowed hover:opacity-80`}
            aria-label={imageMode ? 'Generate image' : 'Send message'}
          >
            {imageMode ? (
              <Image size={14} />
            ) : (
              <ArrowUp size={16} strokeWidth={2.5} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-foreground/20 text-center mt-2 font-body">
          {imageMode
            ? 'Image mode — powered by FLUX.1'
            : 'Knowhere can make mistakes. Verify important information.'}
        </p>
      </div>
    </div>
  );
}
