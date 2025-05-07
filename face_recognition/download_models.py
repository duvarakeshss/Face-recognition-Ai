import os
import urllib.request
import zipfile
import shutil

# Create the models directory if it doesn't exist
models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
os.makedirs(models_dir, exist_ok=True)

print(f"Downloading face detection models to {models_dir}...")

# URLs for the face detection model files
prototxt_url = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt"
model_url = "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"

# Download paths
prototxt_path = os.path.join(models_dir, "deploy.prototxt")
model_path = os.path.join(models_dir, "res10_300x300_ssd_iter_140000.caffemodel")

# Download the files
try:
    print("Downloading prototxt file...")
    urllib.request.urlretrieve(prototxt_url, prototxt_path)
    print(f"Downloaded {prototxt_path}")
    
    print("Downloading model file (this may take a few minutes)...")
    urllib.request.urlretrieve(model_url, model_path)
    print(f"Downloaded {model_path}")
    
    print("Face detection models downloaded successfully!")
except Exception as e:
    print(f"Error downloading models: {e}")
    print("You can still use the system with Haar cascade face detection.")

print("\nTo use the models, restart the Face Recognition API server.") 