# 🤖 Knowhere - AI Chatbot with Gemini Integration

A modern, full-stack AI chatbot application built with React, TypeScript, Tailwind CSS, and FastAPI backend with Google Gemini AI integration.

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue)
![Python](https://img.shields.io/badge/Python-3.8+-yellow)

## ✨ Features

- 🤖 **Google Gemini AI Integration**: Powered by Google's Gemini AI for intelligent conversations
- 🔐 **User Authentication**: Secure login/registration with JWT tokens and email validation
- 💬 **Real-time Chat**: Interactive chat interface with message history and markdown support
- 📝 **Chat Management**: Create, view, and delete chat sessions with auto-generated titles
- 🌙 **Dark/Light Mode**: Toggle between themes with beautiful dark mode
- 👤 **User Profiles**: Secure user management with password validation
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🛡️ **Security Features**: Email validation, strong password requirements, fake email blocking
- ⚡ **Fast and Modern**: Built with Vite for lightning-fast development
- 🎨 **Glass Morphism UI**: Modern glassmorphism design with beautiful animations

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for utility-first styling with custom glass morphism components
- **Vite** for fast development and optimized builds
- **React Icons** for consistent iconography
- **React Markdown** with syntax highlighting for message rendering
- **Context API** for state management

### Backend
- **FastAPI** for high-performance async API
- **SQLAlchemy** for database ORM with async support
- **Google Generative AI** for Gemini integration
- **JWT** for secure authentication
- **SQLite** database (easily configurable to PostgreSQL/MySQL)
- **Pydantic** for data validation and serialization

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 16 or higher)
- **Python** (version 3.8 or higher)
- **Google AI Studio API key** ([Get it here](https://makersuite.google.com/app/apikey))

### 📦 One-Click Setup

**Windows:**
```bash
setup.bat
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### 🔧 Manual Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd knowhere
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Set up Python backend:**
   ```bash
   cd backend
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # Linux/macOS
   source venv/bin/activate

   pip install -r requirements.txt
   cd ..
   ```

4. **Configure environment variables:**

   Create a `.env` file in the backend directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET_KEY=your_jwt_secret_key_here_make_it_long_and_random
   DATABASE_URL=sqlite:///./chatbot.db
   FRONTEND_URL=http://localhost:5173
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ```

5. **Start the application:**

   **Option 1: Full stack with one command**
   ```bash
   npm run dev:full
   ```

   **Option 2: Separate terminals**
   ```bash
   # Terminal 1 - Backend
   npm run backend

   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:5173` to start chatting!

## 📚 API Documentation

### 🔐 Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login user |
| `GET` | `/auth/me` | Get current user info |
| `POST` | `/auth/refresh` | Refresh access token |

### 💬 Chat Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/chat/sessions` | Get all chat sessions |
| `POST` | `/chat/sessions` | Create new chat session |
| `GET` | `/chat/sessions/{id}/messages` | Get messages for a session |
| `POST` | `/chat/sessions/{id}/messages` | Send message and get AI response |
| `DELETE` | `/chat/sessions/{id}` | Delete chat session |
| `POST` | `/chat/sessions/{id}/title` | Auto-generate chat title |

## 🔒 Security Features

### Password Requirements
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one digit
- ✅ At least one special character

### Email Validation
- ✅ Valid email format required
- ✅ Blocks common fake/temporary email domains
- ✅ Real-time validation feedback

### Authentication
- ✅ JWT-based authentication with refresh tokens
- ✅ Secure password hashing with bcrypt
- ✅ Automatic token refresh mechanism
- ✅ Protected API routes with middleware

## 📁 Project Structure

```
knowhere/
├── 🎨 Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ChatArea.tsx   # Main chat interface
│   │   │   ├── Sidebar.tsx    # Chat history sidebar
│   │   │   ├── LoginModal.tsx # Authentication modal
│   │   │   └── ThemeToggle.tsx # Dark/light mode toggle
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.tsx # Authentication state
│   │   │   ├── ChatContext.tsx # Chat state management
│   │   │   └── ThemeContext.tsx # Theme state
│   │   ├── services/          # API services
│   │   │   └── api.ts         # API client
│   │   ├── types/             # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx            # Main application
│   │   └── main.tsx           # Entry point
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # Tailwind configuration
├── 🔧 Backend (FastAPI + Python)
│   ├── app/
│   │   ├── routers/           # API routes
│   │   │   ├── auth.py        # Authentication routes
│   │   │   └── chat.py        # Chat routes
│   │   ├── services/          # Business logic
│   │   │   ├── auth_service.py # Authentication logic
│   │   │   └── gemini_service.py # Gemini AI integration
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   └── database.py        # Database configuration
│   ├── main.py                # FastAPI application
│   ├── start.py               # Startup script
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── 🛠️ Configuration
│   ├── setup.bat              # Windows setup script
│   ├── setup.sh               # Linux/macOS setup script
│   ├── vite.config.ts         # Vite configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── eslint.config.js       # ESLint configuration
└── 📚 Documentation
    └── README.md              # This file
```

## 🌟 Key Features Breakdown

### 🎨 Frontend Features
- **Glass Morphism UI**: Modern glassmorphism design with backdrop blur effects
- **Responsive Layout**: Mobile-first design that adapts to all screen sizes
- **Real-time Chat**: Smooth chat experience with typing indicators
- **Markdown Support**: Rich text rendering with syntax highlighting
- **Theme System**: Persistent dark/light mode with system preference detection
- **Context Management**: Efficient state management using React Context

### 🔧 Backend Features
- **Async FastAPI**: High-performance async API with automatic OpenAPI docs
- **Database Integration**: SQLAlchemy ORM with migration support
- **AI Integration**: Google Gemini AI with streaming responses
- **Security**: Comprehensive security with JWT, password hashing, and validation
- **Error Handling**: Robust error handling with detailed error responses
## 🔑 Getting Your Gemini API Key

1. 🌐 Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 🔐 Sign in with your Google account
3. ➕ Create a new API key
4. 📋 Copy the key and add it to your `.env` file

## 🔨 Development

### Available Scripts

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build

# Backend
npm run backend      # Start FastAPI server
npm run dev:full     # Start both frontend and backend

# Combined
npm run setup        # Run setup script
```

### 🧪 Running Tests

```bash
# Frontend tests (when implemented)
npm test

# Backend tests
cd backend
pytest

# Run with coverage
pytest --cov=app
```

### 🎨 Customization

**Colors**: Edit `tailwind.config.js` to customize the color palette:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      }
    }
  }
}
```

**Glass Effects**: Modify glass morphism styles in `src/index.css`:
```css
.glass-panel {
  @apply backdrop-blur-md bg-white/70 dark:bg-gray-800/70;
  @apply border border-white/20 dark:border-gray-700/50;
}
```

## 🚀 Deployment

### 🌐 Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

### 🖥️ Backend (Railway/Heroku/DigitalOcean)
1. Create a `Dockerfile` in the backend directory:
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]
   ```
2. Set environment variables in your hosting platform
3. Deploy using your preferred method

### 🐳 Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individually
docker build -t knowhere-frontend .
docker build -t knowhere-backend ./backend
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. 📝 **Make** your changes and test thoroughly
4. ✅ **Commit** your changes: `git commit -m 'Add amazing feature'`
5. 🚀 **Push** to the branch: `git push origin feature/amazing-feature`
6. 🔄 **Submit** a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support & Issues

If you encounter any issues or have questions:

1. 🔍 Check existing [Issues](https://github.com/your-repo/issues)
2. 🆕 Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - Error logs/screenshots
   - Environment details

## 🗺️ Roadmap

### 🔮 Upcoming Features
- [ ] 🎙️ Voice chat integration with speech-to-text
- [ ] 📎 File upload and analysis capabilities
- [ ] 📤 Chat export functionality (PDF, Markdown)
- [ ] 👥 Team collaboration features
- [ ] 🔌 Plugin system for custom AI models
- [ ] 📱 Mobile app (React Native)
- [ ] 📊 Advanced analytics dashboard
- [ ] 🌍 Multi-language support
- [ ] � Custom theme builder
- [ ] � Message editing and regeneration

### 🎯 Performance Improvements
- [ ] ⚡ Message streaming for real-time responses
- [ ] 💾 Advanced caching mechanisms
- [ ] 🗜️ Message compression for large histories
- [ ] 🔄 Offline mode capabilities

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the AI capabilities
- **FastAPI** for the excellent Python web framework
- **React Team** for the amazing frontend library
- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for the blazing fast build tool

## 📞 Contact

For questions, suggestions, or collaboration opportunities, feel free to reach out!

---

<div align="center">

**⭐ Star this repository if you find it helpful! ⭐**

Made with ❤️ and lots of ☕

</div>
