from app import handler

# This is the function that Vercel will call
def vercel_handler(event, context):
    """
    Vercel serverless function handler
    This is the entry point for the Vercel serverless function
    """
    return handler(event, context) 