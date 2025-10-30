
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} AI Clothing Customizer. Built with React, Fabric.js, and Gemini API.</p>
      </div>
    </footer>
  );
};
