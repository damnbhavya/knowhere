#!/bin/bash

# AI Chatbot Setup Script

echo "🤖 Setting up AI Chatbot project..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "🐍 Setting up Python virtual environment..."
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment based on OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "📦 Installing backend dependencies..."
pip install -r requirements.txt

cd ..

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the project:"
echo "1. Set up your .env file with your Gemini API key"
echo "2. Run: npm run dev:full"
echo ""
echo "🔧 Environment setup:"
echo "- Copy the .env file and add your GEMINI_API_KEY"
echo "- The frontend will run on http://localhost:5173"
echo "- The backend will run on http://localhost:8000"
