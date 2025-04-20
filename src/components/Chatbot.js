// src/components/ChatBot.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

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

  return (
    <>
      {/* Chat toggle button */}
      <motion.button
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg z-30 hover:bg-blue-700 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        aria-label="Toggle chat assistant"
      >
        <MessageSquare size={24} />
      </motion.button>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-8 right-8 w-80 md:w-96 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-30"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Chat header */}
            <div className="bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-700">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                <h3 className="font-semibold text-white">Blockchain Assistant</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleMinimize} 
                  className="text-gray-400 hover:text-white"
                  aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                >
                  {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <button 
                  onClick={toggleChat} 
                  className="text-gray-400 hover:text-white"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Chat content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Messages container */}
                  <div className="h-80 overflow-y-auto p-4 bg-opacity-50 bg-gray-900">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-100 border border-gray-700'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                  
                  {/* Message input */}
                  <form onSubmit={handleSendMessage} className="border-t border-gray-700 p-3 bg-gray-800 flex items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Ask about blockchain..."
                      className="flex-grow bg-gray-700 border border-gray-600 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 transition-colors text-white p-2 rounded-r-lg"
                      disabled={!inputText.trim()}
                      aria-label="Send message"
                    >
                      <Send size={20} />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}