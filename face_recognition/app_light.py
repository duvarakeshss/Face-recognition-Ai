import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Optional
from datetime import datetime
import json

# Create a minimal version of the app for Vercel deployment
app = FastAPI(title="Face Recognition API - Light Version")

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Root endpoint for health checks
@app.get("/")
async def root():
    """Root endpoint for testing the API deployment"""
    return {
        "status": "ok",
        "message": "Face Recognition API (Light Version) is running on Vercel",
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

@app.get("/api-info")
async def api_info():
    """Information about the API deployment"""
    return {
        "name": "Face Recognition API",
        "version": "1.0.0",
        "deployment": "Vercel Serverless",
        "status": "Light version only - size constraints",
        "message": "This is a lightweight version deployed on Vercel. For full functionality, please use the main API endpoint or deploy with Docker.",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/endpoints")
async def list_endpoints():
    """List available endpoints in this light version"""
    return {
        "available_endpoints": [
            {
                "path": "/",
                "method": "GET",
                "description": "Root endpoint with basic API information"
            },
            {
                "path": "/health",
                "method": "GET",
                "description": "Health check endpoint"
            },
            {
                "path": "/api-info",
                "method": "GET",
                "description": "Detailed API information"
            },
            {
                "path": "/endpoints",
                "method": "GET",
                "description": "List of available endpoints"
            }
        ],
        "note": "This is a lightweight version for Vercel deployment. Full functionality is available on the main API."
    }

@app.get("/register-face")
async def register_face_info():
    """Information about the register-face endpoint (not functional in light version)"""
    return {
        "endpoint": "/register-face",
        "status": "Not available in light version",
        "message": "Due to Vercel's size limitations, this endpoint is not available in the light version. Please use the main API endpoint."
    }

@app.get("/recognize-face")
async def recognize_face_info():
    """Information about the recognize-face endpoint (not functional in light version)"""
    return {
        "endpoint": "/recognize-face",
        "status": "Not available in light version",
        "message": "Due to Vercel's size limitations, this endpoint is not available in the light version. Please use the main API endpoint."
    }

# Handler function for Vercel
def handler(request, context):
    return app 