#!/usr/bin/env python3
import os
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
import asyncio
from collections import deque
import json
import warnings
import signal
import sys

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
import groq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Suppress FAISS GPU warning
warnings.filterwarnings("ignore", message="Failed to load GPU Faiss")

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HF_API_KEY = os.getenv("HF_API_KEY")
MONGO_CONNECTION_STRING = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "face_recognition")

if not GROQ_API_KEY or not HF_API_KEY:
    raise ValueError("Both GROQ_API_KEY and HF_API_KEY environment variables are required")

# FastAPI configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Create FastAPI app
app = FastAPI(
    title="Face Recognition RAG API",
    description="A RAG API for face recognition using Groq and Hugging Face",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class QueryRequest(BaseModel):
    message: str

class SourceDocument(BaseModel):
    content: str
    metadata: Dict[str, Any]

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceDocument] = []

class SystemMessage(BaseModel):
    type: str
    message: str

class RAGEngine:
    def __init__(self):
        logger.info("Initializing RAG engine")
        self.chat_history = deque(maxlen=10)
        self._setup_models()
        self._setup_database()

    def _setup_models(self):
        """Initialize LLM and embeddings models"""
        try:
            self.llm = groq.Client(api_key=GROQ_API_KEY)
            self.embeddings = HuggingFaceEmbeddings(
                model_name="all-MiniLM-L6-v2",
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
        except Exception as e:
            logger.error(f"Error setting up models: {str(e)}")
            raise

    def _setup_database(self):
        """Initialize MongoDB connection"""
        try:
            # Initialize MongoDB client
            self.client = AsyncIOMotorClient(MONGO_CONNECTION_STRING)
            self.db = self.client[DB_NAME]
            self.faces_collection = self.db.faces
            logger.info("Database connection established successfully")
        except Exception as e:
            logger.error(f"Error setting up database: {str(e)}")
            raise

    async def _get_faces_from_db(self):
        """Fetch faces from database"""
        try:
            cursor = self.faces_collection.find()
            faces = await cursor.to_list(length=1000)  # Limit to 1000 faces for performance
            return faces
        except Exception as e:
            logger.error(f"Error fetching faces from database: {str(e)}")
            raise

    async def _create_knowledge_base(self):
        """Create vector store from database face data"""
        try:
            # Get faces from database
            faces = await self._get_faces_from_db()
            
            # Convert faces to documents with smaller chunks
            documents = []
            for face in faces:
                try:
                    # Get registration time from either registration_time or registration_timestamp
                    registration_time = face.get('registration_time') or face.get('registration_timestamp')
                    if not registration_time:
                        logger.warning(f"Face {face.get('_id')} has no registration time, skipping...")
                        continue

                    # Create smaller, focused chunks for each face
                    # Basic info chunk - keep it minimal
                    basic_info = (
                        f"Name: {face.get('name', 'Unknown')}\n"
                        f"Registered: {registration_time}"
                    )
                    documents.append(Document(
                        page_content=basic_info,
                        metadata={
                            "id": str(face["_id"]),
                            "name": face.get('name', 'Unknown'),
                            "registration_time": registration_time,
                            "chunk_type": "basic_info"
                        }
                    ))

                    # Additional info chunk (if any) - limit to essential fields
                    additional_info = []
                    for key, value in face.items():
                        if key not in ['_id', 'name', 'registration_time', 'registration_timestamp', 'face_encoding']:
                            additional_info.append(f"{key}: {value}")
                    
                    if additional_info:
                        info_chunk = f"Additional Info for {face.get('name', 'Unknown')}:\n" + "\n".join(additional_info[:3])  # Limit to 3 additional fields
                        documents.append(Document(
                            page_content=info_chunk,
                            metadata={
                                "id": str(face["_id"]),
                                "name": face.get('name', 'Unknown'),
                                "chunk_type": "additional_info"
                            }
                        ))

                except Exception as e:
                    logger.error(f"Error processing face document: {str(e)}")
                    continue

            if not documents:
                logger.warning("No valid face documents found in the database")
                return

            # Create vector store with smaller chunks
            self.vector_store = FAISS.from_documents(
                documents, 
                self.embeddings,
                normalize_L2=True
            )
            logger.info(f"Knowledge base created successfully with {len(documents)} chunks")
        except Exception as e:
            logger.error(f"Error creating knowledge base: {str(e)}")
            raise

    async def process_query(self, query: str) -> Dict[str, Any]:
        """Process a query using the RAG system"""
        try:
            if not query.strip():
                raise ValueError("Query cannot be empty")

            # Retrieve relevant chunks with a smaller k value
            docs = self.vector_store.similarity_search(query, k=2)
            
            # Group chunks by face ID
            face_chunks = {}
            for doc in docs:
                face_id = doc.metadata.get('id')
                if face_id not in face_chunks:
                    face_chunks[face_id] = []
                face_chunks[face_id].append(doc)

            # Format context more concisely
            context_parts = []
            for face_id, chunks in face_chunks.items():
                # Combine chunks for the same face
                face_info = []
                for chunk in chunks:
                    if chunk.metadata.get('chunk_type') == 'basic_info':
                        face_info.insert(0, chunk.page_content)  # Put basic info first
                    else:
                        face_info.append(chunk.page_content)
                context_parts.append("\n".join(face_info))
            
            context = "\n---\n".join(context_parts)

            # Prepare chat history (limit to last 1 exchange)
            recent_history = list(self.chat_history)[-1:] if self.chat_history else []
            chat_history = "\n".join([f"Q: {q}\nA: {a}" for q, a in recent_history])

            # Create a more concise system prompt
            system_prompt = """You are a face recognition assistant. Answer based on the context.
Guidelines:
- Keep answers brief and focused
- Include names with timestamps
- If information is missing, say so"""

            # Create a more concise prompt
            formatted_prompt = f"""<s>[INST] {system_prompt}

Context:
{context}

Recent History:
{chat_history}

Query: {query}

Assistant: [/INST]"""

            # Get response from Groq
            logger.info(f"Sending prompt to Groq (length: {len(formatted_prompt)})")
            
            try:
                response = self.llm.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": formatted_prompt}],
                    temperature=0.1,
                    max_tokens=256  # Reduced from 512 to 256
                )
                logger.info(f"Groq API Response: {response}")
                
                # Clean up the response
                answer = response.choices[0].message.content.strip()
                # Remove any remaining instruction tokens
                answer = answer.replace("[INST]", "").replace("[/INST]", "").strip()
                logger.info(f"Cleaned response content: {answer}")

                self.chat_history.append((query, answer))

                sources = [
                    {
                        "content": doc.page_content,
                        "metadata": doc.metadata
                    }
                    for doc in docs
                ]

                return {
                    "answer": answer,
                    "sources": sources
                }
            except Exception as e:
                logger.error(f"Error from Groq API: {str(e)}")
                logger.error(f"Full error details: {e.__dict__}")
                raise
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing query: {str(e)}"
            )

# Global RAG engine instance
rag_engine = None

@app.on_event("startup")
async def startup_event():
    """Initialize RAG engine on startup"""
    global rag_engine
    try:
        rag_engine = RAGEngine()
        await rag_engine._create_knowledge_base()
        logger.info("RAG engine initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize RAG engine: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global rag_engine
    if rag_engine:
        try:
            # Cleanup any resources
            logger.info("Cleaning up RAG engine resources...")
            # Add any necessary cleanup here
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")

# Signal handlers for graceful shutdown
def handle_sigterm(signum, frame):
    logger.info("Received SIGTERM signal. Starting graceful shutdown...")
    sys.exit(0)

def handle_sigint(signum, frame):
    logger.info("Received SIGINT signal. Starting graceful shutdown...")
    sys.exit(0)

signal.signal(signal.SIGTERM, handle_sigterm)
signal.signal(signal.SIGINT, handle_sigint)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Face Recognition RAG API is running"}

@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """Process a RAG query"""
    if rag_engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG engine is not initialized"
        )
    
    result = await rag_engine.process_query(request.message)
    return QueryResponse(**result)

@app.post("/refresh")
async def refresh_data():
    """Refresh the knowledge base"""
    global rag_engine
    try:
        if rag_engine:
            await rag_engine._create_knowledge_base()
        else:
            rag_engine = RAGEngine()
            await rag_engine._create_knowledge_base()
        return {"status": "success", "message": "Knowledge base refreshed successfully"}
    except Exception as e:
        logger.error(f"Error refreshing knowledge base: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error refreshing knowledge base: {str(e)}"
        )

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected. Remaining connections: {len(self.active_connections)}")

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time chat"""
    if rag_engine is None:
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        return

    await manager.connect(websocket)
    
    try:
        await websocket.send_json({
            "type": "system",
            "message": "Connected to the Face Recognition RAG engine. How can I help you?"
        })
        
        while True:
            try:
                data = await websocket.receive_json()
                query = data.get("message", "").strip()
                
                if not query:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Please provide a valid query."
                    })
                    continue
                
                logger.info(f"WebSocket query: {query}")
                
                await websocket.send_json({
                    "type": "system",
                    "message": "Processing your query..."
                })
                
                result = await rag_engine.process_query(query)
                
                await websocket.send_json({
                    "type": "answer",
                    "message": result["answer"],
                    "sources": result["sources"]
                })
                
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format in message."
                })
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {str(e)}")
                await websocket.send_json({
                    "type": "error",
                    "message": f"Error processing message: {str(e)}"
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": f"Connection error: {str(e)}"
            })
        except:
            pass
        finally:
            manager.disconnect(websocket)

if __name__ == "__main__":
    try:
        config = uvicorn.Config(
            app=app,
            host=HOST,
            port=PORT,
            log_level="info",
            timeout_keep_alive=30,
            loop="asyncio"
        )
        server = uvicorn.Server(config)
        server.run()
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        sys.exit(1) 