import { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('Connecting to Socket.IO server at:', baseUrl);
    
    const newSocket = io(baseUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server with ID:', newSocket.id);
      setIsConnected(true);
      setConnectError(null);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
      setConnectError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server, reason:', reason);
      setIsConnected(false);
    });

    newSocket.on('message', (message) => {
      console.log('Received message:', message);
      if (message.type === 'system' && message.message.includes('Processing')) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            text: message.message, 
            sender: message.type === 'system' ? 'system' : 'ai',
            sources: message.sources || []
          }
        ]);
      }
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up Socket.IO connection');
      newSocket.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || !socket || !isConnected) return;
    
    // Add user message to chat
    const userMessage = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Send message to server via socket
    socket.emit('sendMessage', { message: input });
    
    setInput('');
  };

  // Toggle chat widget
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat toggle button */}
      <button 
        onClick={toggleChat}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg shadow-xl overflow-hidden flex flex-col h-[500px]">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="font-medium">Face Recognition Assistant</h3>
              <div className={`ml-2 w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Messages container */}
          <div className="flex-1 p-4 overflow-y-auto">
            {connectError && (
              <div className="text-center text-red-500 mb-4 bg-red-50 p-2 rounded-lg border border-red-200">
                <p>{connectError}</p>
                <p className="text-sm mt-1">Please check your connection to the server.</p>
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>Ask me about your registered faces!</p>
                <p className="text-sm mt-2">Examples:</p>
                <ul className="text-sm mt-1 space-y-1">
                  <li className="bg-gray-200 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-300"
                    onClick={() => setInput("Who was the last person registered?")}>
                    Who was the last person registered?
                  </li>
                  <li className="bg-gray-200 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-300"
                    onClick={() => setInput("How many people are registered?")}>
                    How many people are registered?
                  </li>
                  <li className="bg-gray-200 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-300"
                    onClick={() => setInput("When was John registered?")}>
                    When was John registered?
                  </li>
                </ul>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-4 ${
                    message.sender === 'user' 
                      ? 'text-right' 
                      : message.sender === 'system'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  <div 
                    className={`inline-block p-3 rounded-2xl shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                        : message.sender === 'system'
                        ? 'bg-gray-200 text-gray-700 text-sm py-1 px-2'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                    }`}
                  >
                    {message.text}
                  </div>
                  
                  {/* Display sources if available */}
                  {message.sender === 'ai' && message.sources && message.sources.length > 0 && (
                    <div className="mt-1 text-left">
                      <details className="text-xs text-gray-500">
                        <summary className="cursor-pointer hover:text-blue-500">Sources</summary>
                        <ul className="mt-1 space-y-2 pl-2 border-l-2 border-gray-200">
                          {message.sources.map((source, idx) => (
                            <li key={idx} className="bg-gray-50 p-2 rounded text-gray-700">
                              {source.content}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-2xl bg-white text-gray-800 rounded-bl-none border border-gray-100 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input form */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 bg-white">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={isConnected ? "Ask about registered faces..." : "Connecting to server..."}
                disabled={!isConnected}
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
              />
              <button
                type="submit"
                disabled={isLoading || !isConnected || !input.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-r-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" transform="rotate(90, 10, 10)" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;