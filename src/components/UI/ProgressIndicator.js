'use client';

export default function ProgressIndicator({ chapters, currentChapter }) {
  return (
    <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
      <div className="bg-black bg-opacity-50 backdrop-blur-md px-6 py-3 rounded-full">
        <div className="flex space-x-2">
          {chapters.map((_, index) => (
            <div 
              key={index} 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentChapter ? 'bg-white scale-125' : 'bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}