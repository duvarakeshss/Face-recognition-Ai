# Vercel Deployment Guide for Face Recognition API

## Size Limitations

Vercel has a 250MB size limit for serverless functions after unzipping, which poses a challenge for deploying the full Face Recognition API due to large dependencies like OpenCV and face recognition libraries.

## Current Solution

We've implemented a "light version" of the API that can be deployed to Vercel for demonstration and basic functionality:

1. `app_light.py` - A lightweight version without the heavy dependencies
2. `requirements-light.txt` - Minimal requirements for the light version
3. `vercel.json` - Configuration for the light version deployment

## What Works in the Light Version

The light version provides:
- API health check endpoints
- Documentation about the API capabilities
- Information about endpoints

## Full Functionality Options

For the full functionality of the Face Recognition API, you have several options:

### 1. Deploy with Docker (Recommended)

Deploy the full application using Docker on:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Railway.app
- Fly.io

### 2. Deploy to a VPS or Dedicated Server

Set up the application on:
- DigitalOcean Droplet
- AWS EC2
- Linode
- Vultr

### 3. Use Specialized ML Hosting

Consider ML-focused platforms:
- AWS SageMaker
- Google Vertex AI
- Azure ML

## Connecting the Components

1. Deploy the light version to Vercel
2. Deploy the full API elsewhere (Docker, VPS, etc.)
3. Update the Node.js proxy server to route requests to the appropriate backend

### Example Configuration

```javascript
// server/routes/recognitionRoutes.js
const pythonServerUrl = process.env.NODE_ENV === 'production' 
  ? 'https://your-full-api-endpoint.com/recognize-face'
  : 'http://localhost:8000/recognize-face';
```

## Local Development

For local development, you can still use the full app.py with all features:

```bash
cd face_recognition
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
``` 