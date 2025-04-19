'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // You'll need to install framer-motion

// Sub-components
import ConceptCard from './ConceptCard';
import QuizCard from './QuizCard';

export default function ChapterDetail({ chapter, onClose, isVisible }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  
  // Mock data for chapter sections - in a real app, this would come from your backend
  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'concepts', label: 'Key Concepts' },
    { id: 'quiz', label: 'Knowledge Check' },
    { id: 'resources', label: 'Further Learning' }
  ];
  
  // Reset active section when changing chapters
  useEffect(() => {
    if (chapter) {
      setActiveSection('overview');
      setProgress(0);
    }
  }, [chapter]);
  
  if (!chapter) return null;

  const updateProgress = (completed) => {
    if (completed && progress < 100) {
      setProgress(prev => Math.min(prev + 25, 100));
    }
  };

  // Stylistic elements for chapter color theme
  const bgColorStyle = {
    backgroundColor: `#${chapter.color.toString(16)}15`, // Very light transparency
    borderColor: `#${chapter.color.toString(16)}`,
  };
  
  const accentColor = `#${chapter.color.toString(16)}`;
  
  // Example quiz questions for this chapter
  const quizQuestions = [
    {
      question: `What is a key feature of ${chapter.title.split(':')[1].trim()}?`,
      options: [
        'Centralized control',
        'Immutable ledger',
        'Single point of failure',
        'Unlimited transaction speed'
      ],
      answer: 1 // Index of correct answer
    },
    {
      question: 'Which technology is fundamental to blockchain?',
      options: [
        'Artificial Intelligence',
        'Virtual Reality',
        'Cryptography',
        'Quantum Computing'
      ],
      answer: 2
    },
    {
      question: 'Who typically validates transactions in a blockchain network?',
      options: [
        'Government regulators',
        'Network nodes',
        'Bank officials',
        'Software developers'
      ],
      answer: 1
    }
  ];
  
  // Mock concept cards
  const conceptCards = [
    {
      title: 'Distributed Ledger',
      content: 'A system of recording information that is replicated across multiple nodes.',
      icon: '📊'
    },
    {
      title: 'Consensus Mechanism',
      content: 'The process by which a network of nodes reaches agreement on the state of the ledger.',
      icon: '🔄'
    },
    {
      title: 'Cryptographic Hash',
      content: 'A mathematical algorithm that maps data of any size to a fixed-size output.',
      icon: '🔐'
    }
  ];
  
  // Content for the different sections
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6 p-4">
            <motion.h3 
              className="text-2xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ color: accentColor }}
            >
              {chapter.title}
            </motion.h3>
            
            <motion.div
              className="p-6 rounded-lg bg-gray-800 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-lg leading-relaxed">
                Welcome to {chapter.title}. This section explores the fundamental concepts 
                and applications within the blockchain ecosystem. Navigate through the tabs
                to discover key ideas, test your knowledge, and find resources for deeper learning.
              </p>
              
              <div className="mt-4 flex justify-end">
                <button 
                  className="px-4 py-2 rounded-full text-white font-medium transition-all"
                  style={{ backgroundColor: accentColor }}
                  onClick={() => setActiveSection('concepts')}
                >
                  Explore Concepts →
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              className="p-5 rounded-lg border border-gray-700 bg-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-xl font-semibold mb-3">Chapter Progress</h4>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%`, backgroundColor: accentColor }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                {progress < 100 
                  ? `${progress}% complete. Continue exploring to make progress.` 
                  : 'Chapter completed! Well done.'}
              </p>
            </motion.div>
          </div>
        );
        
      case 'concepts':
        return (
          <div className="p-4">
            <motion.h3 
              className="text-2xl font-bold mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: accentColor }}
            >
              Key Concepts
            </motion.h3>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {conceptCards.map((card, index) => (
                <ConceptCard 
                  key={index}
                  card={card}
                  index={index}
                  accentColor={accentColor}
                />
              ))}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                className="px-4 py-2 rounded-full text-white font-medium bg-gray-700 hover:bg-gray-600 transition-all"
                onClick={() => {
                  setActiveSection('overview');
                  updateProgress(true);
                }}
              >
                ← Back to Overview
              </button>
              <button 
                className="px-4 py-2 rounded-full text-white font-medium transition-all"
                style={{ backgroundColor: accentColor }}
                onClick={() => {
                  setActiveSection('quiz');
                  updateProgress(true);
                }}
              >
                Test Your Knowledge →
              </button>
            </div>
          </div>
        );
        
      case 'quiz':
        return (
          <div className="p-4">
            <motion.h3 
              className="text-2xl font-bold mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: accentColor }}
            >
              Knowledge Check
            </motion.h3>
            
            <QuizCard 
              questions={quizQuestions}
              accentColor={accentColor}
              onComplete={() => updateProgress(true)}
            />
            
            <div className="mt-8 flex justify-between">
              <button 
                className="px-4 py-2 rounded-full text-white font-medium bg-gray-700 hover:bg-gray-600 transition-all"
                onClick={() => setActiveSection('concepts')}
              >
                ← Review Concepts
              </button>
              <button 
                className="px-4 py-2 rounded-full text-white font-medium transition-all"
                style={{ backgroundColor: accentColor }}
                onClick={() => {
                  setActiveSection('resources');
                  updateProgress(true);
                }}
              >
                Explore Resources →
              </button>
            </div>
          </div>
        );
        
      case 'resources':
        return (
          <div className="p-4">
            <motion.h3 
              className="text-2xl font-bold mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: accentColor }}
            >
              Further Learning
            </motion.h3>
            
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((item) => (
                <motion.div 
                  key={item}
                  className="p-5 rounded-lg bg-gray-800 hover:bg-gray-750 transition-all cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: item * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center">
                    <div className="rounded-full p-3 mr-4" style={{ backgroundColor: `${accentColor}30` }}>
                      {item === 1 ? '📚' : item === 2 ? '🎬' : '🔗'}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">
                        {item === 1 
                          ? 'Recommended Reading' 
                          : item === 2 
                            ? 'Video Tutorials' 
                            : 'Interactive Tools'}
                      </h4>
                      <p className="text-gray-400">
                        {item === 1 
                          ? 'Books and articles that dive deeper into the concepts.' 
                          : item === 2 
                            ? 'Visual explanations and demonstrations.' 
                            : 'Hands-on platforms to practice what you\'ve learned.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                className="px-4 py-2 rounded-full text-white font-medium bg-gray-700 hover:bg-gray-600 transition-all"
                onClick={() => setActiveSection('quiz')}
              >
                ← Back to Quiz
              </button>
              <button 
                className="px-4 py-2 rounded-full text-white font-medium transition-all"
                style={{ backgroundColor: accentColor }}
                onClick={() => {
                  setActiveSection('overview');
                  updateProgress(true);
                }}
              >
                Complete Chapter
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div
      className={`absolute inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-20 transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <motion.div
        ref={containerRef}
        className="w-11/12 max-w-5xl h-4/5 bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border-2"
        style={bgColorStyle}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Header with close button and tabs */}
        <div className="bg-gray-800 px-6 py-4 flex flex-col md:flex-row justify-between border-b border-gray-700">
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-3" 
              style={{ backgroundColor: accentColor }}
            ></div>
            <h2 className="text-xl font-bold text-white">
              {chapter.title.split(':')[0]}
            </h2>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex mt-4 md:mt-0 space-x-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeSection === section.id 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                style={activeSection === section.id ? { backgroundColor: accentColor } : {}}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
            
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-all"
              aria-label="Close chapter details"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="text-white h-[calc(100%-76px)] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderSectionContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}