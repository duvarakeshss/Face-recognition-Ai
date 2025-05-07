import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import registerRoutes from './routes/registerRoutes.js';
import recognitionRoutes from './routes/recognitionRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "100mb" }));
app.use(
  cors({
    origin: ["https://face-recognition-ai.vercel.app","http://localhost:5173"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);
// Routes
app.use('/api/register', registerRoutes);
app.use('/api/recognize', recognitionRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});