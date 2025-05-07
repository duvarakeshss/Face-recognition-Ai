import os
from fastapi import FastAPI, HTTPException, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import base64
from typing import Dict, Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId
from json import JSONEncoder

# Import utility modules
from face_utils import (
    detect_faces, 
    extract_face_encoding, 
    create_face_document,
    compare_face_encodings
)

# Import database module
import db

# Custom JSON encoder for ObjectId
class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return JSONEncoder.default(self, obj)

# Custom field for ObjectId
class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
        
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(ObjectId(v))
    
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema, **kwargs):
        field_schema.update(type="string")

app = FastAPI(title="Face Recognition API")

@app.on_event("startup")
async def startup_db_client():
    try:
        await db.create_indices()
    except Exception as e:
        print(f"Database connection error (this is normal on Vercel): {str(e)}")

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Add a root endpoint for Vercel deployment testing
@app.get("/")
async def root():
    """Root endpoint for testing the API deployment"""
    return {
        "status": "ok",
        "message": "Face Recognition API is running",
        "version": "1.0.0",
        "environment": os.environ.get("VERCEL_ENV", "development")
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for the API"""
    return {
        "status": "healthy",
        "message": "Face Recognition API is operational"
    }

@app.post("/register-face")
async def process_face(
    name: str = Form(...),
    image: UploadFile = File(...),
    additional_info: Optional[str] = Form(None),
    similarity_threshold: Optional[float] = Form(0.8)
):
    """
    Process a face: recognize, encode, and save to database if unique
    
    - **name**: Name of the person
    - **image**: Image file containing a face
    - **additional_info**: Any additional information about the person as JSON string
    - **similarity_threshold**: Threshold for face similarity (0.0 to 1.0, higher is more strict)
    
    Returns:
        - Face ID
        - Name
        - Status message
        - Timestamp
        - Is duplicate (boolean)
    """
    try:
        # Read the image
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        import cv2
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Could not decode image")
        
        # Process additional info
        additional_info_dict = {}
        if additional_info:
            import json
            try:
                additional_info_dict = json.loads(additional_info)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON in additional_info")
        
        # Detect faces
        faces = detect_faces(img)
        
        if len(faces) == 0:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        
        if len(faces) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected. Please provide an image with a single face")
        
        # Extract the face region
        x, y, w, h = faces[0]
        face_img = img[y:y+h, x:x+w]
        
        # Extract face encoding
        new_face_encoding = extract_face_encoding(face_img)
        
        # Check for duplicate faces
        all_faces = await db.find_all_faces_for_comparison()
        
        # Look for similar faces
        duplicate_face = None
        highest_similarity = 0.0
        
        for face in all_faces:
            known_face_encoding = face["face_encoding"]
            similarity = compare_face_encodings(known_face_encoding, new_face_encoding)
            
            if similarity > highest_similarity:
                highest_similarity = similarity
                
            if similarity >= similarity_threshold:
                duplicate_face = face
                break
        
        # If a duplicate face is found, return information about it
        if duplicate_face:
            return {
                "id": str(duplicate_face["_id"]),
                "name": duplicate_face["name"],
                "message": "Similar face already exists in the database",
                "timestamp": datetime.now().isoformat(),
                "is_duplicate": True,
                "similarity": highest_similarity
            }
        
        # If no duplicate, create and store the new face
        face_document = create_face_document(
            name,
            face_img,
            new_face_encoding,
            additional_info_dict
        )
        
        # Store in database
        face_id = await db.insert_face(face_document)
        
        return {
            "id": face_id,
            "name": name,
            "message": "Face processed and saved successfully",
            "timestamp": datetime.now().isoformat(),
            "is_duplicate": False,
            "similarity": highest_similarity
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing face: {str(e)}")

@app.post("/recognize-face")
async def recognize_face(
    image: UploadFile = File(...),
    similarity_threshold: Optional[float] = Form(0.65),
    max_results: Optional[int] = Form(5),
    max_faces: Optional[int] = Form(5)
):
    """
    Recognize multiple faces from an uploaded image
    
    - **image**: Image file containing faces to recognize
    - **similarity_threshold**: Threshold for face similarity (0.0 to 1.0)
    - **max_results**: Maximum number of matching results to return per face
    - **max_faces**: Maximum number of faces to detect and process
    
    Returns:
        - List of detected faces with their positions
        - Matching results for each detected face
    """
    try:
        # Read the image
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        import cv2
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Could not decode image")
        
        # Detect faces
        faces = detect_faces(img)
        
        if len(faces) == 0:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        
        # Limit the number of faces to process
        faces = faces[:max_faces]
        
        # Get all faces from database for comparison
        all_faces = await db.find_all_faces_for_comparison()
        
        # Process each detected face
        face_results = []
        for i, (x, y, w, h) in enumerate(faces):
            face_img = img[y:y+h, x:x+w]
            
            # Extract face encoding
            face_encoding = extract_face_encoding(face_img)
            
            # Compare with all faces in the database
            matches = []
            for db_face in all_faces:
                known_face_encoding = db_face["face_encoding"]
                similarity = compare_face_encodings(known_face_encoding, face_encoding)
                
                if similarity >= similarity_threshold:
                    matches.append({
                        "id": str(db_face["_id"]),
                        "name": db_face["name"],
                        "similarity": similarity,
                        "registration_timestamp": db_face["registration_timestamp"]
                    })
            
            # Sort matches by similarity (highest first)
            matches.sort(key=lambda x: x["similarity"], reverse=True)
            
            # Limit results
            matches = matches[:max_results]
            
            # Encode the face image for response
            _, buffer = cv2.imencode('.jpg', face_img)
            face_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Add this face to results
            face_results.append({
                "face_id": i,
                "position": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                "image_base64": face_base64,
                "matches": matches,
                "total_matches": len(matches)
            })
        
        return {
            "total_faces_detected": len(faces),
            "faces": face_results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recognizing faces: {str(e)}")

# Add handler for Vercel serverless deployment
def handler(request, context):
    """Handler function for Vercel serverless deployment"""
    return app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

