import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ConceptCard({ card, index, accentColor }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <motion.div
      className="h-64 perspective-1000 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full transform-style-3d transition-transform duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front of Card */}
        <div 
          className="absolute w-full h-full backface-hidden rounded-2xl p-6 flex flex-col justify-between"
          style={{ 
            backgroundColor: `${accentColor}20`,
            border: `2px solid ${accentColor}40`
          }}
        >
          <div className="text-4xl mb-4">{card.icon}</div>
          <div>
            <h4 className="text-xl font-bold mb-2">{card.title}</h4>
            <p className="text-sm text-gray-300">Click to learn more</p>
          </div>
        </div>
        
        {/* Back of Card - Added overflow-auto to prevent text overlap */}
        <div 
          className="absolute w-full h-full backface-hidden rounded-2xl p-6 transform-rotate-y-180 flex flex-col"
          style={{ 
            backgroundColor: `${accentColor}20`,
            border: `2px solid ${accentColor}40`
          }}
        >
          <h4 className="text-xl font-bold mb-4">{card.title}</h4>
          <div className="overflow-auto flex-grow">
            <p className="text-gray-200">{card.content}</p>
          </div>
          <p className="text-sm text-gray-300 mt-4">Click to flip back</p>
        </div>
      </motion.div>
    </motion.div>
  );
}