import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Face Recognition API")

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
async def root():
    """Root endpoint for testing the API deployment"""
    return {
        "status": "ok",
        "message": "Face Recognition API is running",
        "version": "1.0.0",
        "environment": os.environ.get("VERCEL_ENV", "development")
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for the API"""
    return {
        "status": "healthy",
        "message": "Face Recognition API is operational"
    }

# Simplified handler for Vercel
def handler(event, context):
    """
    Simplified handler for Vercel
    """
    path = event.get('path', '/')
    
    # Match the path and return static responses for testing
    if path == '/' or path == '':
        return {
            'statusCode': 200,
            'body': '{"status":"ok","message":"Face Recognition API is running","version":"1.0.0"}'
        }
    elif path == '/health':
        return {
            'statusCode': 200,
            'body': '{"status":"healthy","message":"Face Recognition API is operational"}'
        }
    else:
        return {
            'statusCode': 404,
            'body': '{"error":"Not found"}'
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

