#!/usr/bin/env python3
"""
Simple HTTP server to serve the Library Management Dashboard
Run this in the frontend_new directory to serve the dashboard
"""

import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

if __name__ == "__main__":
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"✅ Frontend server running at http://localhost:{PORT}")
            print(f"📂 Serving files from: {DIRECTORY}")
            print(f"🚀 Open dashboard: http://localhost:{PORT}/dashboard.html")
            print(f"\n⚠️  Make sure backend is running at http://127.0.0.1:5000")
            print(f"Press CTRL+C to stop")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✅ Server stopped")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {PORT} is already in use.")
            print(f"Try killing the process or using a different port.")
        else:
            print(f"❌ Error: {e}")
