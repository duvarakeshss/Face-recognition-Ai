import express from 'express';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';

const router = express.Router();

// Basic multer setup for multipart form data
const upload = multer({
  storage: multer.memoryStorage() // Use memory storage to avoid file system operations
});

// Simple pass-through route for face registration
router.post('/', upload.single('image'), async (req, res) => {
  console.log('Forwarding face registration request');
  
  try {
    // Get the Python server URL
    const pythonServerUrl = 'http://localhost:8000/register-face';
    
    // Create form data using the form-data package
    const formData = new FormData();
    
    // Add all fields from the original request
    for (const key in req.body) {
      formData.append(key, req.body[key]);
    }
    
    // Add the image if present
    if (req.file) {
      // In Node.js, we can directly append the buffer
      formData.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
    }
    
    // Forward to Python server
    const response = await axios.post(pythonServerUrl, formData, {
      headers: {
        ...formData.getHeaders() // Get content-type with boundary from FormData
      }
    });
    
    // Return the response directly
    return res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Error forwarding request:', error.message);
    
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