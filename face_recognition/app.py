from fastapi import FastAPI
from db import create_indices

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    # Create database indices on startup
    await create_indices()

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Face Recognition API is running",
        "version": "1.0.0",
        "environment": "development"
    }
    