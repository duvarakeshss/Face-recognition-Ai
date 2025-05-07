"""
Adapter file for integrating FastAPI with Vercel serverless functions.
This file helps convert between Vercel's expected format and FastAPI's ASGI interface.
"""

import json
from app import app as fastapi_app
from fastapi import Request

async def app(scope, receive, send):
    """
    ASGI application for FastAPI - Vercel integration
    This is needed to properly handle the ASGI protocol when deployed on Vercel
    """
    await fastapi_app(scope, receive, send)

def handler(request):
    """
    Handle direct function calls from Vercel
    This is a fallback in case the ASGI integration doesn't work
    """
    # For simple GET requests
    if request.get('method', '').upper() == 'GET':
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "status": "ok",
                "message": "Face Recognition API is running",
                "path": request.get('path', '/'),
                "version": "1.0"
            })
        }
    
    # Return a 405 Method Not Allowed for other methods to simplify debugging
    return {
        "statusCode": 405,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "error": "Method not allowed",
            "message": "This endpoint only supports GET requests for debugging",
            "method": request.get('method', 'UNKNOWN')
        })
    } 