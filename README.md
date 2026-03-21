# Knowhere

An AI chat application with a glass-morphic interface, real-time streaming responses, and built-in image generation.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)

---

## What is this?

Knowhere is a full-stack AI chatbot that lets you have conversations with Gemini and generate images using Stable Diffusion — all inside a single, clean interface. It's not a wrapper around a chat API with a text box slapped on top. Every part of it — the streaming, the session management, the image pipeline, the auth — was built from scratch.

## Features

### Chat
- **Streaming responses** — text comes in token-by-token via SSE (server-sent events), not dumped all at once. You see the AI "typing" in real time.
- **Markdown rendering** — responses render full markdown: headings, bold/italic, lists, tables, links. Code blocks get proper syntax highlighting with a dark theme.
- **Multi-key rotation** — the backend rotates through multiple Gemini API keys automatically. If one hits a rate limit, it moves to the next. No downtime from quota issues.
- **Chat history** — conversations persist in a Postgres database. Come back tomorrow and your chats are still there.
- **Session management** — rename chats, star/pin the ones you want to keep, delete the rest. Starred chats float to the top.
- **Copy to clipboard** — hover over any AI message to reveal a copy button.

### Image Generation
- **FLUX.1-schnell** — powered by HuggingFace's inference API, using Black Forest Labs' FLUX.1-schnell model. Fast, good quality, free tier friendly.
- **Toggle mode** — click the camera icon to switch the input bar into image mode. The border turns red, placeholder text changes, and whatever you type becomes an image prompt instead of a chat message.
- **Inline results** — generated images appear as AI message bubbles in the chat, not in a separate modal. You can keep chatting in the same conversation after generating an image.
- **Download button** — every generated image has a download link right below it.
- **Persistence** — images are stored as base64 in the database. Refresh the page, come back later — the image is still there in your chat history.

### UI & Design
- **Glassmorphism** — the entire UI uses a frosted-glass design language. Semi-transparent panels with backdrop blur, subtle borders, and layered depth. It looks good in both light and dark mode.
- **Animated grid background** — a subtle dot grid sits behind everything, giving the interface some texture without being distracting.
- **Dark / Light mode** — toggle from the sidebar. Your preference is saved to localStorage.
- **Custom typography** — uses Zalando Sans Expanded for headings (tight letter-spacing, bold weight) and the system font stack for body text.
- **Animated favicon** — the browser tab icon alternates between two halves of the Knowhere logo.
- **Time-aware greetings** — the empty chat screen greets you differently based on the time of day. "Good morning" at 9am, "Still up?" at 2am. The greeting and suggestion pills are randomized each visit.

### Auth
- **Google OAuth** — sign in with your Google account via Supabase Auth. No passwords, no email verification flows.
- **Profile display** — your Google avatar and name show up in the sidebar. On mobile, your avatar sits in the top-right corner.
- **Protected routes** — every page except the login screen requires authentication. Unauthenticated users get redirected.

### Mobile
- **Fully responsive** — the layout adapts to any screen size.
- **Slide-out sidebar** — on mobile, the sidebar hides behind a hamburger menu in the top-left. It slides in from the left with a smooth animation and a blurred backdrop overlay.
- **Auto-close** — picking a chat or creating a new one automatically closes the sidebar on mobile so you're not tapping extra buttons.
- **No suggestion pills** — the suggestion buttons on the empty state are hidden on mobile to save space.

### Sidebar
- **Collapsible** — click the collapse button to shrink the sidebar to a slim icon column. All your chats are still accessible as icon buttons.
- **Rename** — double-click or use the context menu to rename any chat.
- **Star / Pin** — star important conversations to keep them at the top.
- **Delete** — remove conversations you no longer need.
- **Context menu** — right-click (or tap the `•••` icon) on any chat for rename, star, and delete options.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 5.9, Vite 8 |
| **Styling** | Tailwind CSS 4, custom CSS variables, glassmorphism utilities |
| **Routing** | React Router v7 |
| **AI (Text)** | Google Gemini API (via Supabase Edge Functions, SSE streaming) |
| **AI (Images)** | HuggingFace Inference API — FLUX.1-schnell model |
| **Auth** | Supabase Auth (Google OAuth) |
| **Database** | Supabase (PostgreSQL) — chat sessions, messages, user data |
| **Edge Functions** | Deno-based Supabase Edge Functions for `chat` and `generate-image` |
| **Markdown** | react-markdown + remark-gfm for GFM support |
| **Syntax Highlighting** | react-syntax-highlighter with a custom theme |
| **Icons** | Lucide React |

---

## Project Structure

```
knowhere/
├── public/
│   ├── iconL.svg          # Favicon
│   └── iconR.svg          # Favicon
├── src/
│   ├── components/
│   │   ├── AuthGuard.tsx   # Route protection wrapper
│   │   ├── ChatWindow.tsx  # Message list + scroll container
│   │   ├── InputBar.tsx    # Text input + image mode toggle
│   │   ├── MessageBubble.tsx # Individual message with markdown
│   │   ├── Sidebar.tsx     # Session list, collapse, context menus
│   │   └── StaticGrid.tsx  # Animated dot grid background
│   ├── hooks/
│   │   ├── useAuth.ts      # Auth state + Google sign-in
│   │   ├── useChat.ts      # Message state, streaming, send logic
│   │   └── useChatSessions.ts # Session CRUD operations
│   ├── lib/
│   │   ├── chat.ts         # SSE streaming client for the chat edge function
│   │   └── supabase.ts     # Supabase client + TypeScript types
│   ├── pages/
│   │   ├── Chat.tsx        # Main chat page (empty state, chat view, image gen)
│   │   └── SignIn.tsx      # Login page
│   ├── styles/
│   │   └── glass.ts        # Shared glassmorphism style constants
│   ├── index.css           # Global styles, CSS variables, theme tokens
│   ├── App.tsx             # Router setup
│   └── main.tsx            # Entry point
├── supabase/
│   └── functions/
│       └── generate-image/
│           └── index.ts    # HuggingFace image gen edge function
└── index.html              # HTML shell + favicon animation script
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A Google Cloud project with OAuth credentials (for Google sign-in)
- At least one [Gemini API key](https://aistudio.google.com/apikey)
- A [HuggingFace API token](https://huggingface.co/settings/tokens) (for image generation)

### 1. Clone and install

```bash
git clone https://github.com/your-username/knowhere.git
cd knowhere
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set up Supabase

You'll need two tables in your Supabase database:

**`chat_sessions`**
| Column | Type | Notes |
|--------|------|-------|
| id | int8 (PK, auto) | |
| user_id | uuid | references auth.users |
| title | text | |
| is_pinned | boolean | default false |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**`messages`**
| Column | Type | Notes |
|--------|------|-------|
| id | int8 (PK, auto) | |
| chat_session_id | int8 | references chat_sessions |
| user_id | uuid | references auth.users |
| content | text | |
| is_user_message | boolean | |
| timestamp | timestamptz | default now() |

Enable Row Level Security on both tables and add policies so users can only access their own data.

### 4. Set up Edge Functions

Add the following secrets to your Supabase project (Dashboard → Settings → Edge Functions → Secrets):

- `GEMINI_API_KEY` — your primary Gemini API key
- `GEMINI_API_KEY_2` (optional) — a second key for rotation
- `HF_TOKEN` — your HuggingFace API token

Deploy the edge functions:

```bash
npx supabase functions deploy chat --project-ref your-project-ref
npx supabase functions deploy generate-image --project-ref your-project-ref
```

### 5. Configure Google OAuth

1. Go to your Supabase Dashboard → Authentication → Providers → Google
2. Enable it and add your Google OAuth client ID and secret
3. Set your site URL and redirect URLs in Authentication → URL Configuration

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 7. Build for production

```bash
npm run build
```

The output goes to `dist/`. Deploy it anywhere that serves static files — Vercel, Netlify, Cloudflare Pages, whatever you like.

---

## Edge Functions

### `chat`
Handles AI conversations. Receives a message and optional session ID, streams the response back via SSE. Creates a new session if one doesn't exist. Rotates through API keys if rate-limited, and sanitizes all user input before passing it to the model.

### `generate-image`
Takes a text prompt, sends it to the FLUX.1-schnell model on HuggingFace, and returns the generated image as base64. Validates the auth token, sanitizes the prompt, and handles model loading gracefully (503 → "try again in 20 seconds").

---

## License

MIT
