import express from 'express';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';

const router = express.Router();

// Basic multer setup for multipart form data
const upload = multer({
  storage: multer.memoryStorage() // Use memory storage to avoid file system operations
});

// Face recognition endpoint
router.post('/', upload.single('image'), async (req, res) => {
  console.log('Forwarding face recognition request');
  
  try {
    // Get the Python server URL for face recognition
    const pythonServerUrl = 'http://localhost:8000/recognize-face';
    
    // Create form data from the memory buffer using form-data package
    const formData = new FormData();
    
    // Add all fields from the original request
    for (const key in req.body) {
      formData.append(key, req.body[key]);
    }
    
    // Add the image if present
    if (req.file) {
      // In Node.js, we can directly append the buffer
      formData.append('image', req.file.buffer, {
        filename: req.file.originalname || 'image.jpg',
        contentType: req.file.mimetype || 'image/jpeg'
      });
    } else {
      return res.status(400).json({
        error: true,
        message: 'No image provided for recognition'
      });
    }
    
    // Default settings for face recognition
    if (!req.body.max_faces) {
      formData.append('max_faces', '5'); // Process up to 5 faces by default
    }
    
    if (!req.body.similarity_threshold) {
      formData.append('similarity_threshold', '0.65'); // Default threshold
    }
    
    // Forward to Python server
    console.log('Sending request to Python server for face recognition...');
    const response = await axios.post(pythonServerUrl, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000 // 30 second timeout for processing multiple faces
    });
    
    console.log(`Received response: ${response.data.total_faces_detected} faces detected`);
    
    // Return the response directly
    return res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Error forwarding recognition request:', error.message);
    
    // Send error response
    if (error.response) {
      // If we got a response from the Python server, forward it
      return res.status(error.response.status).json(error.response.data);
    } else {
      // Otherwise send a generic error
      return res.status(500).json({
        error: true,
        message: 'Error connecting to face recognition service'
      });
    }
  }
});

export default router; 