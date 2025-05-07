import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

function Registration() {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // API URL can be accessed from the environment variable
  const baseUrl = import.meta.env.VITE_API_URL||'http://face-server.duvarakesh.xyz';
  console.log('VITE_API_URL:', baseUrl);
  const apiUrl = `${baseUrl}/api/register`;

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "user"
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setIsCapturing(false);
    setRegistrationResult(null);
  }, [webcamRef]);

  const handleRegister = async () => {
    if (!capturedImage || !userName.trim()) {
      alert("Please capture an image and enter your name");
      return;
    }

    setIsLoading(true);
    setRegistrationResult(null);

    try {
      // Convert base64 image to a Blob
      const base64Data = capturedImage.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
      
      // Create FormData object to send image and name to server
      const formData = new FormData();
      formData.append('image', blob, 'face.jpg');
      formData.append('name', userName);
      
      // Add additional info (optional)
      const additionalInfo = {
        registeredFrom: 'web-client',
        timestamp: new Date().toISOString()
      };
      formData.append('additional_info', JSON.stringify(additionalInfo));
      
      // Send to server using axios - using the configured proxy URL
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Axios puts the response data in response.data
      const result = response.data;
      setRegistrationResult(result);
      
      if (result.is_duplicate) {
        console.log("Similar face found:", result);
      } else {
        console.log("Registration successful:", result);
        // Optionally clear the form after successful non-duplicate registration
        // setCapturedImage(null);
        // setUserName('');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setRegistrationResult({
        error: true,
        message: error.response?.data?.detail || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Face Registration</h1>
      
      <div className="mb-6">
        <label htmlFor="userName" className="block mb-2 font-medium">Your Name</label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
        />
      </div>
      
      <div className="mb-6">
        <div className="relative">
          {isCapturing ? (
            <div className="overflow-hidden rounded-lg border-2 border-gray-300">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full"
              />
            </div>
          ) : capturedImage ? (
            <div className="overflow-hidden rounded-lg border-2 border-gray-300">
              <img src={capturedImage} alt="Captured face" className="w-full" />
            </div>
          ) : (
            <div className="h-60 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-gray-300">
              <span className="text-gray-500">Camera preview will appear here</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex gap-4">
          {!isCapturing ? (
            <button
              onClick={() => setIsCapturing(true)}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={capture}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
            >
              Capture
            </button>
          )}
          
          {capturedImage && (
            <button
              onClick={() => {
                setCapturedImage(null);
                setIsCapturing(false);
                setRegistrationResult(null);
              }}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
            >
              Retake
            </button>
          )}
        </div>
      </div>
      
      <button
        onClick={handleRegister}
        disabled={!capturedImage || !userName.trim() || isLoading}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
          !capturedImage || !userName.trim() || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 transition'
        }`}
      >
        {isLoading ? 'Processing...' : 'Register Face'}
      </button>
      
      {registrationResult && (
        <div className={`mt-4 p-4 rounded-lg ${
          registrationResult.error || (registrationResult.is_duplicate && registrationResult.is_duplicate === true)
            ? 'bg-yellow-100 border border-yellow-400'
            : 'bg-green-100 border border-green-400'
        }`}>
          <p className="font-medium">
            {registrationResult.error 
              ? registrationResult.message 
              : registrationResult.is_duplicate 
                ? `Similar face found: ${registrationResult.name} (${Math.round(registrationResult.similarity * 100)}% match)` 
                : registrationResult.message}
          </p>
          {registrationResult.id && (
            <p className="text-sm text-gray-600 mt-1">ID: {registrationResult.id}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Registration;