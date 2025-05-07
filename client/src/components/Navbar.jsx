import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="bg-blue-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">Face Recognition System</h1>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive 
                  ? "text-white font-medium border-b-2 border-white px-3 py-2" 
                  : "text-blue-100 hover:text-white px-3 py-2"
              }
              end
            >
              Home
            </NavLink>
            <NavLink 
              to="/register" 
              className={({ isActive }) => 
                isActive 
                  ? "text-white font-medium border-b-2 border-white px-3 py-2" 
                  : "text-blue-100 hover:text-white px-3 py-2"
              }
            >
              Register
            </NavLink>
            <NavLink 
              to="/live-recognition" 
              className={({ isActive }) => 
                isActive 
                  ? "text-white font-medium border-b-2 border-white px-3 py-2" 
                  : "text-blue-100 hover:text-white px-3 py-2"
              }
            >
              Live Recognition
            </NavLink>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive 
                  ? "bg-blue-800 text-white block px-3 py-2 rounded-md text-base font-medium"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              }
              end
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/register" 
              className={({ isActive }) => 
                isActive 
                  ? "bg-blue-800 text-white block px-3 py-2 rounded-md text-base font-medium"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Register
            </NavLink>
            <NavLink 
              to="/live-recognition" 
              className={({ isActive }) => 
                isActive 
                  ? "bg-blue-800 text-white block px-3 py-2 rounded-md text-base font-medium"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Live Recognition
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
