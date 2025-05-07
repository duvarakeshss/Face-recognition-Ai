from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import numpy as np
import base64
import cv2
from datetime import datetime

from db import create_indices, insert_face, find_all_faces_for_comparison
from face_utils import detect_faces, extract_face_encoding, compare_face_encodings, create_face_document

app = FastAPI(title="Face Recognition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await create_indices()

@app.get("/")
async def root():
    return {"status": "ok", "message": "Face Recognition API is running", "version": "1.0.0"}

@app.post("/register-face")
async def register_face(
    name: str = Form(...),
    image: UploadFile = File(...),
    similarity_threshold: Optional[float] = Form(0.8)
):
    try:
        contents = await image.read()
        img = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image")

        faces = detect_faces(img)
        if len(faces) != 1:
            raise HTTPException(status_code=400, detail="Please upload an image with exactly one face")

        x, y, w, h = faces[0]
        face_img = img[y:y+h, x:x+w]
        new_encoding = extract_face_encoding(face_img)
        if new_encoding is None:
            raise HTTPException(status_code=400, detail="Face encoding failed")

        existing_faces = await find_all_faces_for_comparison()
        for face in existing_faces:
            similarity = compare_face_encodings(face["face_encoding"], new_encoding)
            if similarity >= similarity_threshold:
                return {
                    "status": "duplicate",
                    "id": str(face["_id"]),
                    "name": face["name"],
                    "similarity": similarity,
                    "timestamp": datetime.now().isoformat()
                }

        doc = create_face_document(name, face_img, new_encoding)
        face_id = await insert_face(doc)
        return {
            "status": "success",
            "id": face_id,
            "name": name,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recognize-face")
async def recognize_face(
    image: UploadFile = File(...),
    similarity_threshold: Optional[float] = Form(0.65),
    max_results: Optional[int] = Form(5),
    max_faces: Optional[int] = Form(5)
):
    try:
        contents = await image.read()
        img = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image")

        faces = detect_faces(img)[:max_faces]
        if not faces:
            raise HTTPException(status_code=400, detail="No faces detected")

        all_db_faces = await find_all_faces_for_comparison()
        results = []

        for i, (x, y, w, h) in enumerate(faces):
            face_img = img[y:y+h, x:x+w]
            encoding = extract_face_encoding(face_img)
            if encoding is None:
                continue

            matches = []
            for db_face in all_db_faces:
                similarity = compare_face_encodings(encoding, db_face["face_encoding"])
                if similarity >= similarity_threshold:
                    matches.append({
                        "id": str(db_face["_id"]),
                        "name": db_face["name"],
                        "similarity": similarity
                    })

            matches.sort(key=lambda x: x["similarity"], reverse=True)
            matches = matches[:max_results]

            _, buffer = cv2.imencode(".jpg", face_img)
            face_b64 = base64.b64encode(buffer).decode("utf-8")

            results.append({
                "face_id": i,
                "position": {"x": x, "y": y, "width": w, "height": h},
                "image_base64": face_b64,
                "matches": matches
            })

        return {"status": "success", "total_faces_detected": len(faces), "results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
