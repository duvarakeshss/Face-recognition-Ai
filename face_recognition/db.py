import motor.motor_asyncio
from bson import ObjectId
from datetime import datetime
from typing import List, Dict, Any, Optional
import asyncio
import dotenv
import os
dotenv.load_dotenv()

# MongoDB Atlas connection
MONGO_CONNECTION_STRING = os.getenv("MONGO_URL")

# Initialize MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_CONNECTION_STRING)
db = client.face_recognition  # Database name
face_collection = db.faces  # Single collection for all face data

async def create_indices():
    """Create database indices for better performance"""
    await face_collection.create_index("name")
    await face_collection.create_index("registration_timestamp")

async def insert_face(face_document: Dict[str, Any]) -> str:
    """
    Insert a face document into the database
    
    Args:
        face_document: Dictionary with face data
        
    Returns:
        ID of the inserted document
    """
    result = await face_collection.insert_one(face_document)
    return str(result.inserted_id)

async def find_all_faces(skip: int = 0, limit: int = 10) -> Dict[str, Any]:
    """
    Retrieve all faces with pagination
    
    Args:
        skip: Number of documents to skip
        limit: Maximum number of documents to return
        
    Returns:
        Dictionary with total count and face documents
    """
    # Get total count
    total = await face_collection.count_documents({})
    
    # Retrieve faces with pagination
    cursor = face_collection.find().sort("registration_timestamp", -1).skip(skip).limit(limit)
    faces = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string for JSON response
    for face in faces:
        face["_id"] = str(face["_id"])
    
    return {
        "total": total,
        "faces": faces,
        "skip": skip,
        "limit": limit
    }

async def find_face_by_id(face_id: str) -> Optional[Dict[str, Any]]:
   
    if not ObjectId.is_valid(face_id):
        return None
    
    face = await face_collection.find_one({"_id": ObjectId(face_id)})
    
    if face:
        face["_id"] = str(face["_id"])
    
    return face

async def delete_face_by_id(face_id: str) -> bool:
    
    if not ObjectId.is_valid(face_id):
        return False
    
    result = await face_collection.delete_one({"_id": ObjectId(face_id)})
    return result.deleted_count > 0

async def search_faces_by_name(name: str, limit: int = 10) -> Dict[str, Any]:
   
    # Create a case-insensitive regex search
    query = {"name": {"$regex": name, "$options": "i"}}
    
    # Count matching documents
    total = await face_collection.count_documents(query)
    
    # Get matching faces
    cursor = face_collection.find(query).limit(limit)
    faces = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for face in faces:
        face["_id"] = str(face["_id"])
    
    return {
        "total": total,
        "faces": faces,
        "query": name
    }

async def find_all_faces_for_comparison() -> List[Dict[str, Any]]:
   
    cursor = face_collection.find()
    faces = await cursor.to_list(length=1000)  # Limit to 1000 faces for performance
    
    return faces 