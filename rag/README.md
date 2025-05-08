# Face Recognition RAG System

This component provides a Retrieval-Augmented Generation (RAG) system for the Face Recognition application. It allows users to query information about registered faces using natural language.

## Features

- Real-time querying of face registration data
- Natural language interface powered by Groq's Llama 2 70B model
- Vector similarity search for accurate information retrieval
- Integration with MongoDB for face data access
- Support for both ZeroMQ and FastAPI backends
- WebSocket support for real-time communication

## Prerequisites

- Python 3.9+ with pip
- Node.js 18+ with npm
- MongoDB database (cloud or local)
- Groq API key (https://console.groq.com/keys)

## Installation

1. Install Node.js dependencies (from the root directory):
   ```
   cd server
   npm install
   ```

2. Install Python dependencies:
   ```
   cd rag
   pip install -r requirements.txt
   ```

## Configuration

Create a `.env` file in the `rag` directory with the following settings:

```
# MongoDB Connection
MONGO_URI=mongodb+srv://FRuser:Dk12345@cluster0.kwkbmyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=face_recognition
COLLECTION_NAME=faces

# Groq API Key (Replace with your actual key)
GROQ_API_KEY=your_groq_api_key_here

# ZeroMQ Configuration (for original backend)
ZMQ_PORT=5555

# FastAPI Configuration (for new backend)
HOST=0.0.0.0
PORT=8000
```

## Running the Service

### Option 1: Using the start.js script (recommended)

The `start.js` script will launch both the Node.js server and the Python RAG service with your choice of backend:

```
cd rag
node start.js
```

The script will:
1. Check for a `.env` file and create one if not found
2. Prompt for your API key if not set
3. Ask you to choose between ZeroMQ and FastAPI backends
4. Start both the Node.js server and the Python service

### Option 2: Running components separately

#### Starting the Node.js server:

```
cd server
npm run dev
```

#### Starting the Python RAG service:

For the ZeroMQ backend:
```
cd rag
python rag_service.py
```

For the FastAPI backend:
```
cd rag
python -m uvicorn rag_fastapi:app --host 0.0.0.0 --port 8000
```

## API Documentation

### FastAPI Backend (with Groq + Llama)

The FastAPI backend provides both REST API and WebSocket interfaces:

- **REST API**: 
  - `POST /query` - Process a RAG query using the Llama model via Groq
  - `POST /refresh` - Force refresh of the knowledge base
  - `GET /` - Check if the service is running

- **WebSocket API**:
  - `ws://localhost:8000/ws` - WebSocket endpoint for real-time chat

FastAPI also provides automatic documentation at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

### ZeroMQ Backend (original implementation)

The ZeroMQ backend communicates directly with the Node.js server, which exposes a WebSocket interface to clients.

## About Groq and Llama

[Groq](https://groq.com/) is a high-performance inference engine designed for running LLMs with extremely low latency. This implementation uses Groq's API to access Llama 2 70B, a powerful open-source large language model from Meta.

Benefits of using Groq with Llama:
- Significantly faster inference speeds compared to other providers
- Lower cost compared to OpenAI's GPT models
- Access to state-of-the-art open-source models
- Simple API similar to OpenAI's API

## Troubleshooting

### Groq API Issues

If you see errors related to the Groq API:

1. **Check your API key**: Make sure you've set the correct GROQ_API_KEY in the .env file.
2. **API Rate Limits**: Groq has rate limits that might affect your usage.
3. **Model Availability**: Ensure the Llama model is available on Groq (typically it is).

### Python Module Not Found Errors

If you see "ModuleNotFoundError" messages, install the missing dependencies:

```
pip install -r requirements.txt
```

Recent changes to the LangChain library might require updating imports. If you encounter such issues, try updating to the latest versions:

```
pip install --upgrade langchain langchain-community langchain-groq langchain-text-splitters
```

## License

This project is part of the Face Recognition AI system. 