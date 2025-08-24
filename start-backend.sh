#!/bin/bash

echo "🚀 Starting AI Chatbot Backend..."

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Check if .env file exists
if [ ! -f "../.env" ]; then
    echo "⚠️  Warning: .env file not found. Please copy .env.example to .env and configure your API keys."
    echo "You can continue without it, but authentication features won't work."
    read -p "Press Enter to continue..."
fi

echo "Starting FastAPI server..."
python start.py
