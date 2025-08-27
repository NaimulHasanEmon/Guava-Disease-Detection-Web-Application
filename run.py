#!/usr/bin/env python3
"""
Startup script for Guava Disease Detection Website
Run this file to start the Flask application
"""

import os
import sys
import subprocess

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import tensorflow
        import PIL
        import numpy
        print("✅ All dependencies are installed!")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_model():
    """Check if the model file exists"""
    model_path = os.path.join('Model Info', 'best_guava_model.h5')
    if os.path.exists(model_path):
        print("✅ Model file found!")
        return True
    else:
        print("❌ Model file not found!")
        print(f"Expected path: {model_path}")
        print("Please ensure the model file is in the correct location.")
        return False

def main():
    """Main startup function"""
    print("🥭 Guava Disease Detection Website")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check model
    if not check_model():
        sys.exit(1)
    
    print("\n🚀 Starting the application...")
    print("📱 Open your browser and go to: http://localhost:5000")
    print("⏹️  Press Ctrl+C to stop the application")
    print("-" * 40)
    
    try:
        # Import and run the Flask app
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 Application stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting application: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
