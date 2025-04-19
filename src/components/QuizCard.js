import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizCard({ questions, accentColor, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    if (answerIndex === questions[currentQuestion].answer) {
      setScore(prev => prev + 1);
    }
  };
  
  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
      onComplete();
    }
  };
  
  if (completed) {
    return (
      <motion.div
        className="bg-gray-800 rounded-2xl p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-6xl mb-6">🎉</div>
        <h3 className="text-2xl font-bold mb-4">Quiz Completed!</h3>
        <p className="text-xl mb-6">
          You scored <span className="font-bold" style={{ color: accentColor }}>{score}</span> out of {questions.length}
        </p>
        
        <div className="w-full bg-gray-700 rounded-full h-4 mb-8">
          <div 
            className="h-4 rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${(score / questions.length) * 100}%`, 
              backgroundColor: accentColor 
            }}
          ></div>
        </div>
        
        <motion.button 
          className="px-6 py-3 rounded-full text-white font-medium transition-all"
          style={{ backgroundColor: accentColor }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setCurrentQuestion(0);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setScore(0);
            setCompleted(false);
          }}
        >
          Restart Quiz
        </motion.button>
      </motion.div>
    );
  }
  
  const currentQ = questions[currentQuestion];
  
  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">
          Question {currentQuestion + 1} of {questions.length}
        </p>
        <div className="w-48 bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all"
            style={{ 
              width: `${((currentQuestion) / questions.length) * 100}%`, 
              backgroundColor: accentColor 
            }}
          ></div>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-8"
        >
          <h4 className="text-xl font-bold mb-4">{currentQ.question}</h4>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <motion.div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAnswer === index
                    ? isAnswered && index === currentQ.answer
                      ? 'border-green-500 bg-green-500 bg-opacity-20'
                      : isAnswered
                        ? 'border-red-500 bg-red-500 bg-opacity-20'
                        : `border-${accentColor} bg-${accentColor} bg-opacity-20`
                    : 'border-gray-700 hover:border-gray-500'
                }`}
                whileHover={{ x: 5 }}
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                      selectedAnswer === index 
                        ? isAnswered && index === currentQ.answer
                          ? 'bg-green-500 text-white'
                          : isAnswered 
                            ? 'bg-red-500 text-white'
                            : `bg-${accentColor} text-white`
                        : 'border border-gray-500'
                    }`}
                  >
                    {selectedAnswer === index && isAnswered && (
                      index === currentQ.answer ? '✓' : '✗'
                    )}
                  </div>
                  <p>{option}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <p className={`p-4 rounded-lg mb-4 ${
            selectedAnswer === currentQ.answer 
              ? 'bg-green-500 bg-opacity-20 text-green-300'
              : 'bg-red-500 bg-opacity-20 text-red-300'
          }`}>
            {selectedAnswer === currentQ.answer 
              ? 'Correct! Well done.' 
              : `Incorrect. The correct answer is: ${currentQ.options[currentQ.answer]}`
            }
          </p>
          
          <button
            className="px-6 py-3 rounded-full text-white font-medium transition-all"
            style={{ backgroundColor: accentColor }}
            onClick={goToNextQuestion}
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
          </button>
        </motion.div>
      )}
    </div>
  );
}

// Add these CSS classes to your global.css or tailwind.config.js
/*
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.transform-rotate-y-180 {
  transform: rotateY(180deg);
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
*/