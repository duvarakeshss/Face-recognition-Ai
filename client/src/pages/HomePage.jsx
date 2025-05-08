import React from 'react';
import { Link } from 'react-router-dom';

function Homepage() {
  return (
    <div className="py-8 relative">
      {/* Hero Section */}
      <div className="text-center py-12 px-4 bg-blue-50 rounded-lg shadow-md mb-8 transition-all duration-300 hover:shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Face Recognition System</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Secure, fast, and accurate facial recognition system for seamless identity verification
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            to="/register" 
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-md hover:-translate-y-1"
          >
            Register Your Face
          </Link>
          <Link 
            to="/live-recognition" 
            className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg transition-all duration-300 hover:bg-gray-900 hover:shadow-md hover:-translate-y-1"
          >
            Try Live Recognition
          </Link>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto transition-all duration-300 hover:bg-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Secure Authentication</h3>
            <p className="text-gray-600 text-center">
              Biometric security using advanced facial recognition algorithms
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto transition-all duration-300 hover:bg-green-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Real-time Recognition</h3>
            <p className="text-gray-600 text-center">
              Instant face detection and recognition with live video feed
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto transition-all duration-300 hover:bg-purple-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Privacy Focused</h3>
            <p className="text-gray-600 text-center">
              Your biometric data is encrypted and stored securely
            </p>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="bg-gray-50 p-8 rounded-lg shadow-md mb-12 transition-all duration-300 hover:shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col items-center group">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-700">1</div>
            <h3 className="text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-blue-600">Register</h3>
            <p className="text-gray-600 text-center">
              Create your profile by registering your face using our secure camera system
            </p>
          </div>
          
          <div className="flex-1 flex flex-col items-center group">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-700">2</div>
            <h3 className="text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-blue-600">Process</h3>
            <p className="text-gray-600 text-center">
              Our system processes and stores your facial data with advanced encryption
            </p>
          </div>
          
          <div className="flex-1 flex flex-col items-center group">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-700">3</div>
            <h3 className="text-xl font-semibold mb-2 transition-all duration-300 group-hover:text-blue-600">Recognize</h3>
            <p className="text-gray-600 text-center">
              Use the live recognition feature to quickly authenticate yourself
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-lg shadow-md text-center transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-6 max-w-2xl mx-auto">
          Register your face today and experience the future of secure authentication
        </p>
        <Link 
          to="/register" 
          className="inline-block px-6 py-3 bg-white text-blue-600 font-medium rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md hover:-translate-y-1"
        >
          Register Now
        </Link>
      </div>
    </div>
  );
}

export default Homepage;

