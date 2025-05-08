import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-800 shadow-md">
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
                  : "text-blue-100 px-3 py-2 relative overflow-hidden transition-all duration-300 hover:text-white before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white before:origin-left before:scale-x-0 before:transition-transform before:duration-300 hover:before:scale-x-100"
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
                  : "text-blue-100 px-3 py-2 relative overflow-hidden transition-all duration-300 hover:text-white before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white before:origin-left before:scale-x-0 before:transition-transform before:duration-300 hover:before:scale-x-100"
              }
            >
              Register
            </NavLink>
            <NavLink 
              to="/live-recognition" 
              className={({ isActive }) => 
                isActive 
                  ? "text-white font-medium border-b-2 border-white px-3 py-2" 
                  : "text-blue-100 px-3 py-2 relative overflow-hidden transition-all duration-300 hover:text-white before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white before:origin-left before:scale-x-0 before:transition-transform before:duration-300 hover:before:scale-x-100"
              }
            >
              Live Recognition
            </NavLink>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white transition-transform duration-300 hover:text-blue-200 hover:scale-110 focus:outline-none"
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
        <div className="md:hidden bg-gradient-to-b from-blue-800 to-blue-900">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive 
                  ? "bg-blue-800 text-white block px-3 py-2 rounded-md text-base font-medium shadow-inner"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 hover:shadow-inner"
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
                  ? "bg-blue-800 text-white block px-3 py-2 rounded-md text-base font-medium shadow-inner"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 hover:shadow-inner"
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Register
            </NavLink>
            <NavLink 
              to="/live-recognition" 
              className={({ isActive }) => 
                isActive 
                  ? "bg-blue-800 text-white block px-3 py-2 rounded-md text-base font-medium shadow-inner"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 hover:shadow-inner"
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
