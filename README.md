# Face Recognition System

This system consists of three components:

1. Python Face Recognition API (using FastAPI)
2. Node.js Proxy Server (using Express)
3. React Client Application (using Vite)

## Setup

### Install Dependencies

Run the following command to install all dependencies:

```bash
# Install Python dependencies
cd face_recognition
pip install -r requirements.txt
cd ..

# Install Node.js server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

Alternatively, you can use the provided script:

```bash
# On Windows
start-servers.bat

# On Linux/Mac
# chmod +x start-servers.sh
# ./start-servers.sh
```

## Starting the System

1. Start the Python Face Recognition API:

```bash
cd face_recognition
python app.py
# API will run on http://localhost:8000
```

2. Start the Node.js Proxy Server:

```bash
cd server
npm start
# Server will run on http://localhost:5000
```

3. Start the React Client:

```bash
cd client
npm run dev
# Client will run on http://localhost:5173 (or another port if 5173 is in use)
```

## Usage

1. Open the client application in your browser
2. Use the webcam to capture your face
3. Enter your name
4. Click "Register" to register your face
5. The system will detect if your face is unique or already exists in the database

## Testing

You can test the API using the included test script:

```bash
# Place a test image with a face in the server folder as "test-face.jpg"
cd server
node test-upload.js
```

## API Endpoints

### Python API

- `POST /register-face` - Register a face with the system

### Node.js Proxy Server

- `POST /api/register` - Forward face registration requests to the Python API