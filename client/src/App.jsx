import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './pages/HomePage'
import Registration from './pages/Registration'
import LiveRegistration from './pages/LiveRegistration'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/live-recognition" element={<LiveRegistration />} />
          </Routes>
        </div>
        
        {/* Chatbot Widget */}
                  <Chatbot />
      </div>
    </BrowserRouter>
  )
}

export default App