import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import registerRoutes from './routes/registerRoutes.js';
import recognitionRoutes from './routes/recognitionRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL || 'https://face-reg-ai.vercel.app']
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/register', registerRoutes);
app.use('/api/recognize', recognitionRoutes);

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Face Recognition API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless function
export default app; 