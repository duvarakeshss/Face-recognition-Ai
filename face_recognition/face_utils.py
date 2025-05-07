import cv2
import numpy as np
import os
import base64
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional

# Load face detection cascade classifier
face_cascade_path = os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml')
face_cascade = cv2.CascadeClassifier(face_cascade_path)

# Try to load a more accurate model if available
try:
    # Load pre-trained deep learning model for face detection (if available)
    prototxt_path = os.path.join('models', 'deploy.prototxt')
    caffemodel_path = os.path.join('models', 'res10_300x300_ssd_iter_140000.caffemodel')
    
    if os.path.exists(prototxt_path) and os.path.exists(caffemodel_path):
        print("Using DNN face detector for better accuracy")
        net = cv2.dnn.readNetFromCaffe(prototxt_path, caffemodel_path)
        use_dnn = True
    else:
        print("Using Haar cascade for face detection - consider installing DNN models for better results")
        use_dnn = False
except Exception as e:
    print(f"Could not load DNN face detector: {e}. Using Haar cascade instead.")
    use_dnn = False

def detect_faces(image_np):
    """
    Detect faces in an image using Haar cascades or DNN
    
    Args:
        image_np: Image as numpy array
        
    Returns:
        List of face coordinates (x, y, w, h)
    """
    # Try DNN face detection first if available (more accurate)
    if 'use_dnn' in globals() and use_dnn:
        try:
            return detect_faces_dnn(image_np)
        except Exception as e:
            print(f"DNN face detection failed: {e}. Falling back to Haar cascade.")
    
    # Convert to grayscale for face detection
    gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )
    
    # Apply a margin to each face for better visibility
    enhanced_faces = []
    for (x, y, w, h) in faces:
        # Add a small margin around the face (10%)
        margin_x = int(w * 0.1)
        margin_y = int(h * 0.1)
        
        # Make sure we don't go out of image bounds
        x = max(0, x - margin_x)
        y = max(0, y - margin_y)
        w = min(image_np.shape[1] - x, w + 2 * margin_x)
        h = min(image_np.shape[0] - y, h + 2 * margin_y)
        
        enhanced_faces.append((x, y, w, h))
    
    return enhanced_faces

def detect_faces_dnn(image_np):
    """
    Detect faces using DNN for better accuracy
    
    Args:
        image_np: Image as numpy array
        
    Returns:
        List of face coordinates (x, y, w, h)
    """
    (h, w) = image_np.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(image_np, (300, 300)), 1.0,
        (300, 300), (104.0, 177.0, 123.0))
    
    net.setInput(blob)
    detections = net.forward()
    
    faces = []
    
    # Extract face coordinates with confidence threshold
    for i in range(0, detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        
        # Filter out weak detections
        if confidence > 0.5:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (startX, startY, endX, endY) = box.astype("int")
            
            # Convert to x, y, w, h format
            x = startX
            y = startY
            width = endX - startX
            height = endY - startY
            
            # Add a small margin around the face (10%)
            margin_x = int(width * 0.1)
            margin_y = int(height * 0.1)
            
            # Make sure we don't go out of image bounds
            x = max(0, x - margin_x)
            y = max(0, y - margin_y)
            width = min(w - x, width + 2 * margin_x)
            height = min(h - y, height + 2 * margin_y)
            
            faces.append((x, y, width, height))
    
    return faces

def extract_face_encoding(face_image):
    """
    Extract face encoding features using texture-based features
    
    Args:
        face_image: Face image as numpy array
        
    Returns:
        Feature vector as list of floats
    """
    # Resize face to standard size
    face_resized = cv2.resize(face_image, (100, 100))
    
    # Convert to grayscale
    gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
    
    # Extract the feature vector
    feature_vector = []
    step_size = 5
    for y in range(0, gray.shape[0], step_size):
        for x in range(0, gray.shape[1], step_size):
            window = gray[y:y+step_size, x:x+step_size]
            if window.size > 0:
                # Calculate mean and standard deviation as features
                feature_vector.append(float(np.mean(window)))
                feature_vector.append(float(np.std(window)))
    
    return feature_vector

def compare_face_encodings(known_encoding, unknown_encoding):
    """
    Compare two face encodings using cosine similarity
    
    Args:
        known_encoding: First face encoding
        unknown_encoding: Second face encoding
        
    Returns:
        Similarity score (0.0 to 1.0, higher is more similar)
    """
    if len(known_encoding) != len(unknown_encoding):
        # Pad the shorter vector if necessary
        max_len = max(len(known_encoding), len(unknown_encoding))
        known_encoding = known_encoding + [0] * (max_len - len(known_encoding))
        unknown_encoding = unknown_encoding + [0] * (max_len - len(unknown_encoding))
    
    # Convert to numpy arrays
    known_array = np.array(known_encoding)
    unknown_array = np.array(unknown_encoding)
    
    # Calculate cosine similarity
    dot_product = np.dot(known_array, unknown_array)
    norm_known = np.linalg.norm(known_array)
    norm_unknown = np.linalg.norm(unknown_array)
    
    if norm_known == 0 or norm_unknown == 0:
        return 0.0
    
    similarity = dot_product / (norm_known * norm_unknown)
    return float(similarity)

def encode_image(image, format="jpeg", quality=95):
    """
    Encode an image to a specific format
    
    Args:
        image: Image as numpy array
        format: Output format (jpeg/png)
        quality: Compression quality (0-100)
        
    Returns:
        Tuple of (encoded_bytes, media_type)
    """
    if format.lower() == "png":
        encode_param = [int(cv2.IMWRITE_PNG_COMPRESSION), min(9, quality // 10)]
        _, encoded_img = cv2.imencode('.png', image, encode_param)
        media_type = "image/png"
    else:
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        _, encoded_img = cv2.imencode('.jpg', image, encode_param)
        media_type = "image/jpeg"
        
    return encoded_img, media_type

def image_to_base64(image, format="jpeg", quality=95):
    """
    Convert image to base64 string
    
    Args:
        image: Image as numpy array
        format: Output format (jpeg/png)
        quality: Compression quality (0-100)
        
    Returns:
        Tuple of (base64_string, media_type)
    """
    encoded_img, media_type = encode_image(image, format, quality)
    base64_str = base64.b64encode(encoded_img).decode('utf-8')
    return base64_str, media_type

def create_face_document(name, face_img, face_encoding, additional_info=None):
    """
    Create a document for MongoDB face storage
    
    Args:
        name: Name of the person
        face_img: Face image as numpy array
        face_encoding: Face feature vector
        additional_info: Any additional metadata
        
    Returns:
        Dictionary ready for MongoDB storage
    """
    # Compress the face image for storage
    face_image_base64, _ = image_to_base64(face_img, "jpeg", 90)
    
    # Create face document
    return {
        "name": name,
        "face_encoding": face_encoding,
        "face_image_base64": face_image_base64,
        "additional_info": additional_info if additional_info else {},
        "registration_timestamp": datetime.now()
    }

def draw_face_rectangles(image, faces, color=(0, 255, 0), thickness=2):
    """
    Draw rectangles around detected faces
    
    Args:
        image: Image as numpy array
        faces: List of face coordinates (x, y, w, h)
        color: Rectangle color (B,G,R)
        thickness: Line thickness
        
    Returns:
        Image with rectangles drawn around faces and list of face regions
    """
    img_with_faces = image.copy()
    face_regions = []
    
    for i, (x, y, w, h) in enumerate(faces):
        cv2.rectangle(img_with_faces, (x, y), (x+w, y+h), color, thickness)
        cv2.putText(img_with_faces, f"Face {i+1}", (x, y-10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, thickness)
        
        face_regions.append({
            "face_id": i,
            "position": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}
        })
    
    return img_with_faces, face_regions

def process_base64_image(base64_str):
    """
    Process base64 encoded image to numpy array
    
    Args:
        base64_str: Base64 encoded image string
        
    Returns:
        Image as numpy array
    """
    image_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img 