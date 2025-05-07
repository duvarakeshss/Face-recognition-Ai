@echo off
echo Installing dependencies...

echo Installing Python dependencies...
cd face_recognition
pip install -r requirements.txt
cd ..

echo Installing Node.js server dependencies...
cd server
npm install
cd ..

echo Installing client dependencies...
cd client
npm install
cd ..

echo Starting servers...
start cmd /k "cd face_recognition && python app.py"
start cmd /k "cd server && npm start"
start cmd /k "cd client && npm run dev"

echo Servers started!
echo Python server running on http://localhost:8000
echo Node.js server running on http://localhost:5000
echo Client running on http://localhost:5173 (or check the terminal output) 