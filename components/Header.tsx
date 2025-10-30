
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mr-3" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" />
          <path fillRule="evenodd" d="M5 12v2a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2H7a2 2 0 00-2 2zm10-6H5a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2z" clipRule="evenodd" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">AI Clothing Customizer</h1>
      </div>
    </header>
  );
};
