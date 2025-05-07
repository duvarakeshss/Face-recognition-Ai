import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Path to a test image that contains a face
const testImagePath = path.join(process.cwd(), 'test-face.jpg');

async function testFaceUpload() {
  console.log('Testing face upload API...');
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('name', 'Test Person');
    
    // Read and append the test image
    if (fs.existsSync(testImagePath)) {
      console.log('Using test image:', testImagePath);
      formData.append('image', fs.createReadStream(testImagePath));
    } else {
      console.error('Test image not found at', testImagePath);
      console.log('Please place a test image named "test-face.jpg" in the server folder');
      return;
    }
    
    // Add additional info
    formData.append('additional_info', JSON.stringify({
      test: true,
      timestamp: new Date().toISOString()
    }));
    
    // Send request to local server
    console.log('Sending request to server...');
    const response = await axios.post('http://localhost:5000/api/register', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed!');
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testFaceUpload(); 