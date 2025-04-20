import { useState, useEffect } from 'react';

export default function IntroScreen({ onComplete }) {
  const [opacity, setOpacity] = useState(1);
  const [titleScale, setTitleScale] = useState(0.95);

  useEffect(() => {
    // Initial animation - scale up
    setTimeout(() => {
      setTitleScale(1);
    }, 100);

    // Display for 1.5 seconds before starting fade
    const displayTimer = setTimeout(() => {
      // Start fade out
      setOpacity(0);
      setTitleScale(1.05); // Slightly scale up during fade

      // Call onComplete after fade animation finishes
      const fadeTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000); // 800ms for fade out animation

      return () => clearTimeout(fadeTimer);
    }, 1500);

    return () => clearTimeout(displayTimer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ 
        opacity, 
        transition: 'opacity 800ms ease-out, transform 800ms ease-out',
        background: 'radial-gradient(circle, rgba(0,0,0,0.9) 0%, rgba(0,0,0,1) 100%)'
      }}
    >
      <div 
        className="text-center px-6"
        style={{
          transform: `scale(${titleScale})`,
          transition: 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-6xl tracking-tight">
          Block Path
        </h1>
        <p className="text-white text-xl mt-4 opacity-80 tracking-wide">
          A Virtual Experience
        </p>
      </div>
    </div>
  );
}