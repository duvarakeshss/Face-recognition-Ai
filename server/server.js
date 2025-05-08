import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fetch from 'node-fetch';
import registerRoutes from './routes/registerRoutes.js';
import recognitionRoutes from './routes/recognitionRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://face-recognition-ai.vercel.app",
      "http://localhost:5173",
      "https://face-recognition.duvarakesh.xyz",
      "https://face-server.duvarakesh.xyz"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Configuration for RAG service
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
console.log(`Using RAG service at ${FASTAPI_URL}`);

// Middleware
app.use(express.json({ limit: "100mb" }));
app.use(
  cors({
    origin: [
      "https://face-recognition-ai.vercel.app",
      "http://localhost:5173",
      "https://face-recognition.duvarakesh.xyz",
      "https://face-server.duvarakesh.xyz"
    ],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.use('/register', registerRoutes);
app.use('/recognize', recognitionRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Function to process query with FastAPI backend
const processQueryWithFastAPI = async (query) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: query }),
    });
    
    if (!response.ok) {
      throw new Error(`FastAPI service responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error communicating with FastAPI service:', error);
    throw error;
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Send welcome message
  socket.emit('message', {
    type: 'system',
    message: 'Connected to the Face Recognition assistant. How can I help you?'
  });
  
  // Handle chat messages
  socket.on('sendMessage', async (data) => {
    const query = data.message;
    console.log(`Query from client ${socket.id}: ${query}`);
    
    // Send processing message
    socket.emit('message', {
      type: 'system',
      message: 'Processing your query...'
    });
    
    try {
      const response = await processQueryWithFastAPI(query);
      
      // Send response back to client
      socket.emit('message', {
        type: 'answer',
        message: response.answer,
        sources: response.sources || []
      });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('message', {
        type: 'error',
        message: `An error occurred while processing your query: ${error.message}`
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`RAG service URL: ${FASTAPI_URL}`);
  });
}

export default app;