from app import handler

def vercel_handler(event, context):
    """
    Vercel serverless function handler
    This is the entry point for the Vercel serverless function
    """
    return handler(event, context) 