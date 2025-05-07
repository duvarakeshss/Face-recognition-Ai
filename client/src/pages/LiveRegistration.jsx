import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

function LiveRegistration() {
  const webcamRef = useRef(null);
  const containerRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [processingInterval, setProcessingInterval] = useState(2000); // 2 seconds by default
  const baseUrl = import.meta.env.VITE_API_URL;  
  // API URL can be accessed from environment variable
  const apiUrl = `${baseUrl}/api/recognize`;
  
  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "user"
  };

  useEffect(() => {
    let interval;
    if (isActive && webcamRef.current) {
      // Start face recognition loop
      interval = setInterval(() => {
        if (!isProcessing) {
          captureAndRecognize();
        }
      }, processingInterval);
    } else {
      // Clear results when stopping
      setRecognitionResults([]);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isProcessing, processingInterval]);

  const captureAndRecognize = async () => {
    if (!webcamRef.current) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setIsProcessing(false);
        return;
      }
      
      // Convert base64 image to a Blob
      const base64Data = imageSrc.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
      
      // Create FormData object to send image
      const formData = new FormData();
      formData.append('image', blob, 'face.jpg');
      
      // Add parameters for multi-face recognition
      formData.append('similarity_threshold', '0.65');
      formData.append('max_faces', '5');
      formData.append('max_results', '3');
      
      // Send to server for recognition using the configured proxy URL
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Process the multi-face recognition results
      if (response.data && response.data.faces) {
        const results = [];
        
        response.data.faces.forEach(face => {
          // Process recognition result for this face
          const bestMatch = face.matches && face.matches.length > 0 
            ? face.matches[0] 
            : null;
            
          results.push({
            faceId: face.face_id,
            position: face.position,
            recognized: bestMatch !== null,
            name: bestMatch?.name || "Unknown",
            similarity: bestMatch?.similarity || 0,
            id: bestMatch?.id || null,
            allMatches: face.matches || [],
            timestamp: new Date().toLocaleTimeString()
          });
        });
        
        // Update state with all detected faces
        setRecognitionResults(results);
      } else {
        setRecognitionResults([]);
      }
    } catch (error) {
      console.error('Error during face recognition:', error);
      
      // Check if it's a "no face detected" error
      if (error.response?.data?.detail?.includes("No face detected")) {
        setError("No face detected");
      } else {
        setError(error.response?.data?.detail || "Recognition error");
      }
      
      // Clear previous recognition result if there's an error
      setRecognitionResults([]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Live Face Recognition</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm">Processing Speed:</span>
        <select 
          value={processingInterval} 
          onChange={(e) => setProcessingInterval(Number(e.target.value))}
          className="border rounded p-1 text-sm"
        >
          <option value={3000}>Slow (3s)</option>
          <option value={2000}>Normal (2s)</option>
          <option value={1000}>Fast (1s)</option>
          <option value={500}>Very Fast (0.5s)</option>
        </select>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <div 
            ref={containerRef} 
            className="overflow-hidden rounded-lg border-2 border-gray-300"
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full"
            />
            
            {isProcessing && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                Processing...
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => {
              setIsActive(!isActive);
              if (!isActive) {
                setRecognitionResults([]);
                setError(null);
              }
            }}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
              isActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } transition`}
          >
            {isActive ? 'Stop Recognition' : 'Start Recognition'}
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-gray-100 rounded-lg">
        <h2 className="font-bold mb-2">Recognition Results:</h2>
        
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : isActive ? (
          recognitionResults.length > 0 ? (
            <div className="space-y-3">
              {recognitionResults.map((result) => (
                <div 
                  key={result.faceId} 
                  className={`p-2 rounded border ${
                    result.recognized ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">Face #{result.faceId + 1}</span>
                    <span className="text-xs bg-gray-200 px-1 rounded">{result.timestamp}</span>
                  </div>
                  
                  {result.recognized ? (
                    <>
                      <p className="font-bold text-green-700">{result.name}</p>
                      <p className="text-sm">Confidence: {Math.round(result.similarity * 100)}%</p>
                      
                      {result.allMatches.length > 1 && (
                        <div className="mt-1">
                          <p className="text-xs font-semibold">Other possible matches:</p>
                          <ul className="text-xs">
                            {result.allMatches.slice(1, 3).map((match, index) => (
                              <li key={index} className="text-gray-600">
                                {match.name} ({Math.round(match.similarity * 100)}%)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-yellow-600">Unknown person</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Waiting for faces...</p>
          )
        ) : (
          <p>Recognition inactive</p>
        )}
      </div>
    </div>
  );
}

export default LiveRegistration; 