import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Copy, Check } from 'lucide-react';
import { glassStyles } from '@/styles/glass';

// syntax highlighting colors (loosely based on github dark)
const codeTheme: Record<string, React.CSSProperties> = {
  'pre[class*="language-"]': {
    background: 'rgba(10, 10, 15, 0.85)',
    color: '#e2e8f0',
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    fontSize: '0.825rem',
    lineHeight: '1.6',
    padding: '1.25rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'auto',
    margin: '0.5em 0',
  },
  'code[class*="language-"]': {
    background: 'none',
    color: '#e2e8f0',
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    fontSize: '0.825rem',
  },
  comment: { color: '#636e7b', fontStyle: 'italic' },
  prolog: { color: '#636e7b' },
  doctype: { color: '#636e7b' },
  cdata: { color: '#636e7b' },
  punctuation: { color: '#8b949e' },
  property: { color: '#79c0ff' },
  tag: { color: '#7ee787' },
  boolean: { color: '#ff7b72' },
  number: { color: '#ff7b72' },
  constant: { color: '#ff7b72' },
  symbol: { color: '#ff7b72' },
  deleted: { color: '#ff7b72' },
  selector: { color: '#7ee787' },
  'attr-name': { color: '#79c0ff' },
  string: { color: '#a5d6ff' },
  char: { color: '#a5d6ff' },
  builtin: { color: '#ffa657' },
  inserted: { color: '#7ee787' },
  operator: { color: '#ff7b72' },
  entity: { color: '#ffa657' },
  url: { color: '#a5d6ff' },
  variable: { color: '#ffa657' },
  atrule: { color: '#d2a8ff' },
  'attr-value': { color: '#a5d6ff' },
  function: { color: '#d2a8ff' },
  'class-name': { color: '#ffa657' },
  keyword: { color: '#ff7b72' },
  regex: { color: '#a5d6ff' },
  important: { color: '#ff7b72', fontWeight: 'bold' },
};

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  isStreaming?: boolean;
}

function MessageBubbleInner({ content, isUser, timestamp, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="flex flex-col items-end max-w-[90%]">
          <div
            className="liquid-glass-btn-primary rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed font-body"
            style={{ ...glassStyles, cursor: 'default' }}
          >
            {content}
          </div>
          {timestamp && (
            <span className="text-[10px] text-foreground/30 mt-1 mr-1">
              {formatTime(timestamp)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // check if this is a generated image message
  const imageMatch = content.match(/^\[IMG\](data:[^[]+)\[\/IMG\]$/);

  return (
    <div className="flex px-4 py-2 group">
      <div className="flex flex-col max-w-[95%]">
        <div
          className="liquid-glass-panel rounded-2xl rounded-bl-md px-4 py-2.5 text-foreground"
          style={glassStyles}
        >
          {imageMatch ? (
            <div>
              <img
                src={imageMatch[1]}
                alt="Generated image"
                className="rounded-xl max-w-full my-1"
                style={{ maxHeight: '512px', objectFit: 'contain' }}
              />
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imageMatch[1];
                  link.download = `knowhere-${Date.now()}.png`;
                  link.click();
                }}
                className="text-xs text-foreground/30 hover:text-foreground/60 mt-1 transition-colors"
              >
                ↓ Download
              </button>
            </div>
          ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img({ src, alt, ...props }) {
                  return (
                    <img
                      src={src}
                      alt={alt || 'Generated image'}
                      className="rounded-xl max-w-full my-2"
                      style={{ maxHeight: '512px', objectFit: 'contain' }}
                      loading="lazy"
                      {...props}
                    />
                  );
                },
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const code = String(children).replace(/\n$/, '');

                  if (match) {
                    return (
                      <SyntaxHighlighter
                        style={codeTheme}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: '0.5em 0',
                          borderRadius: '0.75rem',
                          fontSize: '0.825rem',
                        }}
                      >
                        {code}
                      </SyntaxHighlighter>
                    );
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          )}
          {isStreaming && (
            <span className="inline-flex items-center gap-0.5 ml-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 ml-1">
          {timestamp && !isStreaming && (
            <span className="text-[10px] text-foreground/30">
              {formatTime(timestamp)}
            </span>
          )}
          {!isStreaming && content && (
            <button
              onClick={handleCopy}
              className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all text-foreground/30 hover:text-foreground"
              aria-label="Copy message"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const MessageBubble = memo(MessageBubbleInner);
export default MessageBubble;
