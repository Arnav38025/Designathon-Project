'use client';

export default function NavigationButtons({ 
  goToPrevChapter, 
  goToNextChapter, 
  currentChapter, 
  totalChapters, 
  isNavigating, 
  isDetailVisible 
}) {
  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-10 z-10">
      <button
        onClick={goToPrevChapter}
        disabled={currentChapter <= 0 || isNavigating || isDetailVisible}
        className={`px-8 py-4 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
          currentChapter <= 0 || isNavigating || isDetailVisible
            ? 'opacity-30 cursor-not-allowed'
            : 'opacity-80 hover:opacity-100 hover:scale-105'
        }`}
        style={{ 
          backgroundColor: 'rgba(25, 25, 35, 0.5)', 
          border: '1px solid rgba(150, 150, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
        aria-label="Previous chapter"
      >
        <span className="text-white font-semibold text-lg mr-2">←</span>
        <span className="text-white font-semibold">Previous Chapter</span>
      </button>
      
      <button
        onClick={goToNextChapter}
        disabled={currentChapter >= totalChapters - 1 || isNavigating || isDetailVisible}
        className={`px-8 py-4 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
          currentChapter >= totalChapters - 1 || isNavigating || isDetailVisible
            ? 'opacity-30 cursor-not-allowed'
            : 'opacity-80 hover:opacity-100 hover:scale-105'
        }`}
        style={{ 
          backgroundColor: 'rgba(25, 25, 35, 0.5)', 
          border: '1px solid rgba(150, 150, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
        aria-label="Next chapter"
      >
        <span className="text-white font-semibold">Next Chapter</span>
        <span className="text-white font-semibold text-lg ml-2">→</span>
      </button>
    </div>
  );
}
