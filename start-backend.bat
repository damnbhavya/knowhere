@echo off
echo 🚀 Starting AI Chatbot Backend...

cd backend

:: Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Install dependencies if requirements.txt exists
if exist "requirements.txt" (
    echo Installing Python dependencies...
    pip install -r requirements.txt
)

:: Check if .env file exists
if not exist "../.env" (
    echo ⚠️  Warning: .env file not found. Please copy .env.example to .env and configure your API keys.
    echo You can continue without it, but authentication features won't work.
    pause
)

echo Starting FastAPI server...
python start.py
