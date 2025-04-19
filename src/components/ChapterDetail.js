'use client';

import { useEffect } from 'react';

export default function ChapterDetail({ chapter, onClose, isVisible }) {
  if (!chapter) return null;

  const bgColorStyle = {
    backgroundColor: `#${chapter.color.toString(16)}33`, // Add alpha transparency
    borderColor: `#${chapter.color.toString(16)}`,
  };

  return (
    <div
      className={`absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-20 transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose} // Close on background click
    >
      <div
        className="w-3/4 max-w-4xl h-3/4 bg-gray-900 rounded-lg shadow-xl p-8 overflow-y-auto border-2 text-white"
        style={bgColorStyle}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the box
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold" style={{ color: `#${chapter.color.toString(16)}` }}>
            {chapter.title}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-400 text-2xl font-bold"
            aria-label="Close chapter details"
          >
            &times; {/* Close icon */}
          </button>
        </div>

        {/* Placeholder Content */}
        <div className="space-y-4">
          <p className="text-lg">
            Welcome to {chapter.title}. This section delves into the core concepts of [Topic related to the chapter]. Blockchain technology provides a decentralized and secure way to record transactions...
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-xl font-semibold mb-2">Key Concept 1</h3>
              <p>Detailed explanation of the first key concept goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <img src={`/api/placeholder/300/200?text=Concept+Image+1`} alt="Placeholder Concept 1" className="mt-4 rounded"/>
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-xl font-semibold mb-2">Key Concept 2</h3>
              <p>Further details about another important aspect. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <img src={`/api/placeholder/300/200?text=Concept+Image+2`} alt="Placeholder Concept 2" className="mt-4 rounded"/>
            </div>
          </div>
          <p>
            Interactive elements or further reading links could be placed here. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </div>
    </div>
  );
}
