#!/usr/bin/env python3
"""
Simple health check script to test if the backend is running correctly
"""
import requests
import json
import sys

def test_backend_health():
    """Test if backend is accessible"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is healthy: {data}")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_frontend():
    """Test if frontend is accessible"""
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to frontend. Make sure it's running on http://localhost:5173")
        return False
    except Exception as e:
        print(f"❌ Frontend check error: {e}")
        return False

def main():
    print("🏥 Health Check")
    print("=" * 20)

    backend_ok = test_backend_health()
    frontend_ok = test_frontend()

    if backend_ok and frontend_ok:
        print("\n🎉 All services are running correctly!")
        print("🌐 Frontend: http://localhost:5173")
        print("🔧 Backend API: http://localhost:8000")
        print("📚 API Docs: http://localhost:8000/docs")
    else:
        print("\n❌ Some services are not running properly")
        print("Make sure to:")
        print("1. Run 'npm run dev:full' to start both services")
        print("2. Check your .env configuration")
        print("3. Ensure all dependencies are installed")
        sys.exit(1)

if __name__ == "__main__":
    main()
