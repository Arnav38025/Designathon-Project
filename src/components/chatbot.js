'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

const predefinedAnswers = {
  greetings: [
    "Hello! I'm your Blockchain Learning Assistant. How can I help you today?",
    "Hi there! Have questions about blockchain? I'm here to help!",
    "Welcome to the Blockchain Learning Path! What would you like to know?"
  ],
  
  blockchain: [
    "Blockchain is a distributed, decentralized ledger that records transactions across many computers. This ensures no single record can be altered retroactively without altering all subsequent blocks.",
    "Think of blockchain as a chain of blocks containing information. Each block contains data, a hash (like a fingerprint), and the hash of the previous block, creating an immutable chain."
  ],
  
  bitcoin: [
    "Bitcoin is the first and most well-known cryptocurrency, created in 2009 by an unknown person or group using the pseudonym Satoshi Nakamoto.",
    "Bitcoin uses blockchain technology to operate with no central authority or banks, managing transactions and issuing bitcoins through a peer-to-peer network."
  ],
  
  ethereum: [
    "Ethereum is a decentralized platform that runs smart contracts: applications that run exactly as programmed without possibility of downtime, censorship, fraud, or third-party interference.",
    "Unlike Bitcoin, Ethereum allows developers to build and deploy decentralized applications (dApps) on its blockchain."
  ],
  
  smartcontracts: [
    "Smart contracts are self-executing contracts with the terms of the agreement directly written into code. They automatically execute when predefined conditions are met.",
    "Think of smart contracts as digital vending machines: input the right data and conditions, and it automatically executes the programmed outcome."
  ],
  
  consensus: [
    "Consensus mechanisms are protocols that ensure all nodes in a blockchain network agree on the current state of the blockchain. Common types include Proof of Work (PoW) and Proof of Stake (PoS).",
    "These mechanisms prevent double-spending and ensure the security and integrity of the blockchain without requiring a central authority."
  ],
  
  mining: [
    "Mining is the process by which transactions are verified and added to the blockchain. Miners use computational power to solve complex mathematical problems, securing the network.",
    "In Proof of Work systems like Bitcoin, miners compete to solve puzzles. The first to solve it gets to add the next block and receives newly minted cryptocurrency as a reward."
  ],
  
  help: [
    "I can help you with basic blockchain concepts, navigate through the learning platform, or explain specific topics like Bitcoin, Ethereum, smart contracts, and more. Just ask!",
    "Try asking me about blockchain fundamentals, specific cryptocurrencies, or how to navigate through the different chapters in this learning path."
  ],
  
  chapters: [
    "This learning platform has multiple chapters covering different blockchain topics. You can navigate between them using the buttons at the bottom of the screen or by clicking directly on the spheres in the 3D view.",
    "Each chapter contains an overview, key concepts, a knowledge check quiz, and further learning resources. Click on any sphere to explore its content in detail."
  ],
  
  default: [
    "I don't have specific information about that yet, but I'm learning! Try asking about blockchain basics, Bitcoin, Ethereum, or how to navigate this platform.",
    "That's a great question! While I don't have a detailed answer right now, you might find more information in the chapter materials.",
    "I'm not sure about that specific topic. Would you like to know about blockchain fundamentals, cryptocurrencies, or how to use this learning platform instead?"
  ]
};

// Helper function to find the best matching topic
const findBestMatch = (input) => {
  const text = input.toLowerCase();
  
  if (/\b(hi|hello|hey|greetings)\b/.test(text)) return 'greetings';
  if (/\b(blockchain|chain|ledger|distributed ledger)\b/.test(text)) return 'blockchain';
  if (/\b(bitcoin|btc|satoshi)\b/.test(text)) return 'bitcoin';
  if (/\b(ethereum|eth|vitalik|buterin)\b/.test(text)) return 'ethereum';
  if (/\b(smart contract|contract|code|automated)\b/.test(text)) return 'smartcontracts';
  if (/\b(consensus|pow|pos|proof of|validator)\b/.test(text)) return 'consensus';
  if (/\b(mining|miner|hash|block reward)\b/.test(text)) return 'mining';
  if (/\b(help|assist|guide|support)\b/.test(text)) return 'help';
  if (/\b(chapter|section|navigate|platform|interface)\b/.test(text)) return 'chapters';
  
  return 'default';
};

// Get random response from topic
const getRandomResponse = (topic) => {
  const responses = predefinedAnswers[topic] || predefinedAnswers.default;
  return responses[Math.floor(Math.random() * responses.length)];
};

export default function ChatBot() {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your Blockchain Learning Assistant. How can I help you today?", 
      sender: 'bot' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isFullScreen && !isMinimized) {
      setIsFullScreen(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [messages, isMinimized]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot thinking
    setTimeout(() => {
      const topic = findBestMatch(inputText);
      const botResponse = {
        id: Date.now() + 1,
        text: getRandomResponse(topic),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 600);
  };

  // Enhanced visual elements for the 3D/blockchain aesthetic
  const BlockchainDecorations = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-75">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 animate-pulse"></div>
      
      {/* Hexagonal grid background with animation */}
      <div className="absolute inset-0 bg-[radial-gradient(#2463EB22_1px,transparent_1px)] bg-[size:10px_10px]">
        <div className="absolute inset-0 bg-[radial-gradient(#8B5CF622_2px,transparent_2px)] bg-[size:14px_14px] animate-[spin_240s_linear_infinite]"></div>
      </div>
      
      {/* Flowing particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500/30"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100 - Math.random() * 300],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0.1, 0.8, 0.1],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Floating blockchain cubes with more varied animations */}
      <motion.div 
        className="absolute top-10 right-24 w-6 h-6 bg-blue-500 bg-opacity-20 border border-blue-400 rounded shadow-lg shadow-blue-500/20"
        animate={{ 
          y: [0, -20, 0], 
          rotateZ: [0, 45, 0],
          rotateY: [0, 180, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute top-32 right-10 w-8 h-8 bg-purple-500 bg-opacity-20 border border-purple-400 rounded shadow-lg shadow-purple-500/20"
        animate={{ 
          y: [0, 20, 0], 
          rotateZ: [0, -30, 0],
          rotateX: [0, 180, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />
      
      <motion.div 
        className="absolute bottom-20 right-20 w-4 h-4 bg-green-500 bg-opacity-20 border border-green-400 rounded shadow-lg shadow-green-500/20"
        animate={{ 
          y: [0, -15, 0], 
          rotateZ: [0, 90, 0],
          rotateY: [0, -180, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ 
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />

      <motion.div 
        className="absolute top-48 right-32 w-5 h-5 bg-cyan-500 bg-opacity-20 border border-cyan-400 rounded shadow-lg shadow-cyan-500/20"
        animate={{ 
          y: [0, 25, 0], 
          rotateZ: [0, 60, 0],
          rotateX: [0, 90, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      <motion.div 
        className="absolute bottom-40 right-12 w-7 h-7 bg-indigo-500 bg-opacity-20 border border-indigo-400 rounded shadow-lg shadow-indigo-500/20"
        animate={{ 
          y: [0, -30, 0], 
          rotateZ: [0, -45, 0],
          rotateY: [0, 120, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />
      
      {/* Connecting lines representing blockchain - more paths with varied animations */}
      <svg className="absolute inset-0 w-full h-full">
        <motion.path 
          d="M330,50 Q350,100 330,150 T330,250" 
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="1" 
          fill="transparent"
          animate={{ 
            strokeDasharray: [100, 200],
            strokeDashoffset: [0, -300]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.path 
          d="M340,80 Q380,180 340,280" 
          stroke="rgba(139, 92, 246, 0.3)" 
          strokeWidth="1" 
          fill="transparent"
          animate={{ 
            strokeDasharray: [150, 250],
            strokeDashoffset: [0, -400]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        />

        <motion.path 
          d="M320,30 Q290,150 320,300" 
          stroke="rgba(16, 185, 129, 0.3)" 
          strokeWidth="1" 
          fill="transparent"
          animate={{ 
            strokeDasharray: [120, 220],
            strokeDashoffset: [0, -350]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
        />

        <motion.path 
          d="M300,60 Q350,150 300,240" 
          stroke="rgba(125, 211, 252, 0.3)" 
          strokeWidth="1.5" 
          fill="transparent"
          animate={{ 
            strokeDasharray: [80, 180],
            strokeDashoffset: [0, -250]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 3
          }}
        />

        <motion.path 
          d="M360,20 Q330,160 360,320" 
          stroke="rgba(167, 139, 250, 0.3)" 
          strokeWidth="1" 
          fill="transparent"
          animate={{ 
            strokeDasharray: [130, 230],
            strokeDashoffset: [0, -370]
          }}
          transition={{ 
            duration: 17,
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }}
        />
      </svg>
    </div>
  );

  // Adding light glow effect to emphasize floating appearance
  const glowColor = isMinimized ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.5)';
  const containerStyle = {
    boxShadow: `0 0 20px ${glowColor}, 0 0 30px rgba(59, 130, 246, 0.2)`,
  };

  return (
    <motion.div 
      className={`fixed bottom-4 right-4 z-30 ${
        isFullScreen 
          ? 'left-4 top-4' 
          : isMinimized 
            ? 'w-64 h-12' 
            : 'w-70 h-96'
      }`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Container with improved glassmorphism effect and rounded corners */}
      <div 
        className={`h-full flex flex-col bg-gray-900 bg-opacity-50 backdrop-blur-md border border-blue-500 border-opacity-30 relative overflow-hidden ${
          isMinimized ? 'rounded-full' : 'rounded-2xl'
        }`}
        style={containerStyle}
      >
        {/* Enhanced decorative elements */}
        <BlockchainDecorations />
        
        {/* Chat header with subtle gradient */}
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 px-4 py-3 flex justify-between items-center border-b border-blue-500/40 z-10 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
            <h3 className="font-semibold text-white">Blockchain Assistant</h3>
          </div>
          <div className="flex space-x-2">
            {!isMinimized && (
              <button 
                onClick={toggleFullScreen} 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            )}
            <button 
              onClick={toggleMinimize} 
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
            >
              {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
        
        {/* Chat content */}
        <AnimatePresence mode="wait">
          {!isMinimized ? (
            <motion.div
              className="flex-grow flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Messages container */}
              <div className="flex-grow overflow-y-auto p-4 scrollbar-hide z-10">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg shadow-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 bg-opacity-90 text-white shadow-blue-600/20'
                            : 'bg-gray-800 bg-opacity-90 text-gray-100 border border-gray-700 shadow-gray-900/30'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Message input with subtle animation */}
              <motion.form 
                onSubmit={handleSendMessage} 
                className="border-t border-blue-500/30 p-3 bg-gradient-to-r from-gray-800/90 to-gray-900/90 flex items-center z-10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about blockchain..."
                  className="flex-grow bg-gray-700/80 border border-gray-600 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 transition-colors text-white p-2 rounded-r-lg shadow-md disabled:opacity-50"
                  disabled={!inputText.trim()}
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </motion.form>
            </motion.div>
          ) : (
            <motion.div 
              className="flex-grow flex items-center justify-center bg-gradient-to-r from-blue-900/20 to-blue-700/10 backdrop-blur-sm text-blue-300 font-medium text-sm z-10 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleMinimize}
              whileHover={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
            >
              <p className="px-4 py-2 text-center">Ask about blockchain</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
