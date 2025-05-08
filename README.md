# Face Recognition Platform with Real-Time AI Q&A using RAG

A comprehensive face recognition platform that combines real-time face detection, recognition, and intelligent Q&A capabilities using RAG (Retrieval-Augmented Generation).

### Demo Video

```bash
https://www.loom.com/share/23d1dcaa2214437e8e8401fafba0fa70?sid=e17dc3cf-0a1a-4179-b8f8-cbc65f50d39c
```

## Project Overview

This platform enables users to:

- Register faces using webcam
- Perform real-time face recognition
- Query face registration data using natural language
- Get intelligent responses powered by RAG and LLM

## Important Note

The deployed version at `https://face-recognition-ai.vercel.app/` has limited functionality:

- Face recognition features work as expected
- Chatbot functionality is disabled due to CPU limitations on the deployment server
- For full functionality including the RAG-powered chatbot, please run the application locally

## Known Limitations

### Groq API Token Limits

The RAG system uses Groq's LLM API which has the following limitations:

- Token limit per request: 6000 tokens
- Current implementation may exceed this limit with large context
- Error will occur if request exceeds token limit

To handle this limitation:

1. Keep queries concise and specific
2. Avoid sending large context windows
3. Consider upgrading to Groq's Dev Tier for higher limits
4. Monitor token usage in logs

## Local Development Requirements

For optimal performance and full functionality:

- Minimum 4GB RAM
- Multi-core CPU (4+ cores recommended)
- Dedicated GPU (optional but recommended for better performance)
- Stable internet connection
- Modern web browser with WebRTC support

## Core Features

### 1. Face Registration

- Webcam integration for real-time face capture
- Face detection and encoding
- Metadata storage (name, timestamp)
- Duplicate face detection
- Multiple face registration support

### 2. Live Face Recognition

- Real-time webcam feed processing
- Multi-face detection and recognition
- Name overlay for recognized faces
- Performance-optimized frame processing

### 3. RAG-Powered Q&A Interface

- Real-time chat interface
- WebSocket-based communication
- Natural language query processing
- Intelligent response generation

## Tech Stack

### Frontend

- React.js
- WebSocket client
- Webcam integration
- Real-time video processing

### Backend

- Node.js (API & WebSocket Server)
- Python (Face Recognition & RAG)
- MongoDB (Database)
- LangChain + FAISS (Vector Store)
- OpenAI ChatGPT (LLM)
- GroqAI (LLM)

### System Architecture Diagram
```bash
+----------------------------+       +-----------------------+
|      Client (Browser)     |<----->|    React Frontend     |
| (Webcam, Chat UI, WS, UI) |       | (WebRTC, WebSocket)   |
+----------------------------+       +----------+------------+
                                               |
                                               | WebSocket/API Calls
                                               v
                                      +--------+---------+
                                      |   Node.js Server |
                                      | (WS Hub, REST API|
                                      +--------+---------+
                                               |
              +--------------------------------+--------------------+
              |                                                     |
      +-------v--------+                                  +--------v--------+
      | Python: Face    |                                  | Python: RAG Q&A |
      | Recognition API |                                  |   (LangChain)   |
      | (FastAPI + OpenCV)                                 |  + FAISS Vector |
      +-----------------+                                  |    DB + LLMs    |
              |                                             +--------+--------+
              |                                                      |
+-------------v--------------+                            +----------v----------+
| MongoDB: Face Metadata DB |                            |  OpenAI / Groq API   |
| (Encodings, Names, Time)  |                            | (ChatGPT, LLaMA, etc)|
+---------------------------+                            +----------------------+

```

## Prerequisites

- Python 3.7+
- Node.js 14+
- MongoDB
- OpenAI API Key
- Webcam access
- Modern web browser

## Installation

1. Clone the repository:

```bash
git clone https://github.com/duvarakeshss/Face-recognition-Ai
cd Face-recognition-Ai
```

2. Install Python dependencies:

```bash
cd face_recognition
pip install -r requirements.txt

cd ../rag
pip install -r requirements.txt
```

3. Install Node.js dependencies:

```bash
cd ../server
npm install
```

4. Install React dependencies:

```bash
cd ../client
npm install
```

5. Configure environment variables:

## Running the Application

1. Start the Python Face Recognition service:

```bash
cd face_recognition
uvicorn app:app --reload

cd ../rag
uvicorn app:app --reload
```

2. Start the Node.js server:

```bash
cd ../server
npm start
```

3. Start the React client:

```bash
cd ../client
npm run dev
```

4. Access the application:

- Local: `http://localhost:5173`
- Deployed: `https://face-recognition-ai.vercel.app/`

Note: The deployed version has limited functionality due to server CPU constraints. For the complete experience including the RAG-powered chatbot, please run the application locally.

## API Endpoints

### Face Recognition API

- `POST /register-face` - Register new face
- `POST /recognize-face` - Recognize faces in image

### RAG API

- `POST /query` - Process natural language queries

## WebSocket Events

### Client to Server

- `/register` - Register new face
- `/recognize` - Start face recognition

### Server to Client

- `face_detected` - Face detection event
- `recognition_result` - Face recognition result
- `chat_response` - Chat response

## Configuration

### Face Recognition

- Face similarity threshold: 0.8
- Recognition threshold: 0.85

### RAG Configuration

- Embedding dimension: 512
- Context window: 1024
- Similarity threshold: 0.75

## Assumptions

1. Webcam access is available and permitted
2. Sufficient system resources for real-time processing
3. Stable internet connection for API calls
4. Modern browser with WebSocket support
5. OpenAI API access and quota

## Hackathon Information

This project is a part of a hackathon run by https://katomaran.com

