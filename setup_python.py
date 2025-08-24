#!/usr/bin/env python3
"""
Simple script to check Python environment and install dependencies
"""
import subprocess
import sys
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} is not supported. Please install Python 3.8 or higher.")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_dependencies():
    """Install Python dependencies"""
    backend_dir = Path(__file__).parent / "backend"
    requirements_file = backend_dir / "requirements.txt"

    if not requirements_file.exists():
        print(f"❌ Requirements file not found: {requirements_file}")
        return False

    try:
        print("📦 Installing Python dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
        print("✅ Python dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def main():
    print("🐍 Python Environment Setup")
    print("=" * 30)

    if not check_python_version():
        sys.exit(1)

    if not install_dependencies():
        sys.exit(1)

    print("\n🎉 Python environment setup complete!")
    print("\n📝 Next steps:")
    print("1. Set up your .env file with GEMINI_API_KEY")
    print("2. Run: npm run dev:full")

if __name__ == "__main__":
    main()
