from http.server import BaseHTTPRequestHandler
import sys
import os
import json
import importlib.util

# Add the parent directory to the path so we can import app.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app from app.py
try:
    from app import app as fastapi_app
    from fastapi.applications import get_asgi_application
    import uvicorn
except ImportError as e:
    print(f"Error importing FastAPI app: {e}")
    raise

# Simple HTTP handler for debugging
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = {
            "status": "ok",
            "message": "Face Recognition API is running on Vercel",
            "version": "1.0.0",
            "path": self.path,
            "origin": "Vercel serverless"
        }
        
        self.wfile.write(json.dumps(response).encode())
        return

    def do_POST(self):
        content_len = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_len) if content_len > 0 else b''
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = {
            "message": "POST request received",
            "path": self.path,
            "body_length": content_len
        }
        
        self.wfile.write(json.dumps(response).encode())
        return

# Standard handler function for Vercel Python serverless
def handler(request):
    """
    Simple handler for Vercel Python serverless functions
    """
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": '{"status": "ok", "message": "Face Recognition API is running"}'
    }

# This is necessary for local development
if __name__ == '__main__':
    uvicorn.run(fastapi_app, host="0.0.0.0", port=8000) 