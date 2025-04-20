// src/components/BlockchainExplorer3D.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Clock, Layers, ArrowRight, Check, FileText, Users, DollarSign } from 'lucide-react';

export default function BlockchainExplorer3D() {
  const [blocks, setBlocks] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [journeySteps, setJourneySteps] = useState([
    { id: 1, name: 'Blockchain Basics', completed: true },
    { id: 2, name: 'Smart Contracts', completed: true },
    { id: 3, name: 'DeFi Fundamentals', completed: false },
    { id: 4, name: 'NFT Markets', completed: false },
    { id: 5, name: 'DAO Governance', completed: false }
  ]);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Mock function to fetch recent blocks
  const fetchRecentBlocks = async () => {
    setLoading(true);
    
    try {
      // Simulate API fetch delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock block data
      const mockBlocks = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() - (i * 15000), // Block IDs decreasing
        hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`,
        timestamp: new Date(Date.now() - i * 15000),
        transactionCount: Math.floor(Math.random() * 200) + 50,
        size: Math.floor(Math.random() * 2000) + 500,
        miner: `0x${Math.random().toString(16).substring(2, 42)}`,
        gasUsed: Math.floor(Math.random() * 1000000) + 500000,
        difficulty: Math.floor(Math.random() * 1000) + 500,
      }));
      
      setBlocks(mockBlocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate journey progress based on completed steps
  useEffect(() => {
    const completedSteps = journeySteps.filter(step => step.completed).length;
    setJourneyProgress(completedSteps / journeySteps.length);
  }, [journeySteps]);

  useEffect(() => {
    fetchRecentBlocks();
    
    // Refresh blocks every 30 seconds
    const interval = setInterval(() => {
      fetchRecentBlocks();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Draw 3D blockchain visualization
  useEffect(() => {
    if (!isExpanded || !canvasRef.current || blocks.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    let angle = 0;
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Parameters for the 3D chain
      const blockWidth = 50;
      const blockHeight = 30;
      const blockDepth = 15;
      const spacing = 20;
      const chainLength = blocks.length;
      
      // Calculate complete chain width for centering
      const totalWidth = chainLength * (blockWidth + spacing);
      const startX = (canvas.width - totalWidth) / 2;
      const centerY = canvas.height / 2;
      
      // Journey progress indicator
      const progressX = startX + journeyProgress * totalWidth;
      
      // Draw progress path
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 10;
      ctx.moveTo(startX, centerY);
      ctx.lineTo(startX + totalWidth, centerY);
      ctx.stroke();
      
      // Draw completed progress
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 10;
      ctx.moveTo(startX, centerY);
      ctx.lineTo(progressX, centerY);
      ctx.stroke();
      
      // Draw journey markers
      journeySteps.forEach((step, index) => {
        const markerX = startX + (totalWidth * (index / (journeySteps.length - 1)));
        const markerY = centerY;
        
        // Draw marker circle
        ctx.beginPath();
        ctx.arc(markerX, markerY, 8, 0, Math.PI * 2);
        ctx.fillStyle = step.completed ? 'rgba(59, 130, 246, 1)' : 'rgba(156, 163, 175, 0.5)';
        ctx.fill();
        
        // Draw marker label
        ctx.font = '10px sans-serif';
        ctx.fillStyle = step.completed ? 'rgba(255, 255, 255, 0.9)' : 'rgba(156, 163, 175, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(step.name, markerX, markerY + 25);
        
        // Add checkmark for completed steps
        if (step.completed) {
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = 'white';
          ctx.fillText('✓', markerX, markerY + 3);
        }
      });
      
      // Draw 3D blocks
      blocks.forEach((block, index) => {
        const progress = index / (chainLength - 1);
        const x = startX + progress * totalWidth;
        const y = centerY - blockHeight / 2;
        
        // Apply wave animation to blocks
        const waveY = Math.sin(angle + index * 0.5) * 5;
        
        // Selected block effect
        const isSelected = selectedBlock && selectedBlock.id === block.id;
        const highlight = isSelected ? 1.2 : 1;
        const blockScale = isSelected ? 1.2 : 1;
        
        // Calculate 3D block vertices
        const vertices = {
          // Front face
          frontTopLeft: [x, y + waveY],
          frontTopRight: [x + blockWidth * blockScale, y + waveY],
          frontBottomRight: [x + blockWidth * blockScale, y + blockHeight * blockScale + waveY],
          frontBottomLeft: [x, y + blockHeight * blockScale + waveY],
          
          // Back face
          backTopLeft: [x + blockDepth, y - blockDepth + waveY],
          backTopRight: [x + blockWidth * blockScale + blockDepth, y - blockDepth + waveY],
          backBottomRight: [x + blockWidth * blockScale + blockDepth, y + blockHeight * blockScale - blockDepth + waveY],
          backBottomLeft: [x + blockDepth, y + blockHeight * blockScale - blockDepth + waveY]
        };
        
        // Draw block connections (chains)
        if (index < chainLength - 1) {
          const nextX = startX + ((index + 1) / (chainLength - 1)) * totalWidth;
          const nextWaveY = Math.sin(angle + (index + 1) * 0.5) * 5;
          
          // Connection line with gradient
          const gradient = ctx.createLinearGradient(
            vertices.frontTopRight[0], 
            vertices.frontTopRight[1], 
            nextX, 
            centerY - blockHeight / 2 + nextWaveY
          );
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.4)');
          
          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 3;
          ctx.moveTo(vertices.frontTopRight[0], vertices.frontTopRight[1] + blockHeight * blockScale / 2);
          ctx.lineTo(nextX, centerY - blockHeight / 2 + nextWaveY + blockHeight / 2);
          ctx.stroke();
          
          // Draw small connecting nodes
          ctx.beginPath();
          ctx.arc(
            vertices.frontTopRight[0] - 3, 
            vertices.frontTopRight[1] + blockHeight * blockScale / 2, 
            3, 
            0, 
            Math.PI * 2
          );
          ctx.fillStyle = 'rgba(59, 130, 246, 1)';
          ctx.fill();
        }
        
        // Draw 3D block
        // Draw top face
        ctx.beginPath();
        ctx.moveTo(...vertices.frontTopLeft);
        ctx.lineTo(...vertices.frontTopRight);
        ctx.lineTo(...vertices.backTopRight);
        ctx.lineTo(...vertices.backTopLeft);
        ctx.closePath();
        ctx.fillStyle = isSelected ? 
          'rgba(59, 130, 246, 0.8)' : 
          `rgba(${30 + index * 5}, ${41 + index * 5}, ${59 + index * 5}, 0.9)`;
        ctx.fill();
        
        // Draw right face
        ctx.beginPath();
        ctx.moveTo(...vertices.frontTopRight);
        ctx.lineTo(...vertices.frontBottomRight);
        ctx.lineTo(...vertices.backBottomRight);
        ctx.lineTo(...vertices.backTopRight);
        ctx.closePath();
        ctx.fillStyle = isSelected ? 
          'rgba(37, 99, 235, 0.8)' : 
          `rgba(${20 + index * 5}, ${31 + index * 5}, ${49 + index * 5}, 0.9)`;
        ctx.fill();
        
        // Draw front face
        ctx.beginPath();
        ctx.moveTo(...vertices.frontTopLeft);
        ctx.lineTo(...vertices.frontTopRight);
        ctx.lineTo(...vertices.frontBottomRight);
        ctx.lineTo(...vertices.frontBottomLeft);
        ctx.closePath();
        ctx.fillStyle = isSelected ? 
          'rgba(96, 165, 250, 0.9)' : 
          `rgba(${40 + index * 5}, ${51 + index * 5}, ${69 + index * 5}, 1)`;
        ctx.fill();

        // Add block number
        ctx.font = `${isSelected ? 'bold ' : ''}11px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.fillText(
          `#${blocks.length - index}`, 
          vertices.frontTopLeft[0] + blockWidth * blockScale / 2, 
          vertices.frontTopLeft[1] + blockHeight * blockScale / 2 + 4
        );
        
        // Add interaction hitbox
        if (isSelected) {
          // Glowing effect for selected block
          ctx.beginPath();
          const glowGradient = ctx.createRadialGradient(
            x + blockWidth * blockScale / 2, 
            y + blockHeight * blockScale / 2 + waveY,
            0,
            x + blockWidth * blockScale / 2, 
            y + blockHeight * blockScale / 2 + waveY,
            blockWidth
          );
          glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
          glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          
          ctx.fillStyle = glowGradient;
          ctx.arc(
            x + blockWidth * blockScale / 2, 
            y + blockHeight * blockScale / 2 + waveY, 
            blockWidth, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
        }
      });
      
      // Animate wave
      angle += 0.03;
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [blocks, isExpanded, selectedBlock, journeyProgress, journeySteps]);
  
  // Handle canvas clicks to select blocks
  const handleCanvasClick = (e) => {
    if (!canvasRef.current || blocks.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Parameters for the 3D chain (must match drawing parameters)
    const blockWidth = 50;
    const blockHeight = 30;
    const spacing = 20;
    const chainLength = blocks.length;
    
    const totalWidth = chainLength * (blockWidth + spacing);
    const startX = (canvas.width - totalWidth) / 2;
    const centerY = canvas.height / 2;
    
    // Check if click is near any blocks
    for (let i = 0; i < blocks.length; i++) {
      const progress = i / (chainLength - 1);
      const blockX = startX + progress * totalWidth;
      const blockY = centerY - blockHeight / 2;
      
      // Simple rectangular hit testing
      if (
        x >= blockX && 
        x <= blockX + blockWidth && 
        y >= blockY && 
        y <= blockY + blockHeight
      ) {
        setSelectedBlock(blocks[i]);
        return;
      }
    }
    
    // Check if click is on journey steps
    for (let i = 0; i < journeySteps.length; i++) {
      const markerX = startX + (totalWidth * (i / (journeySteps.length - 1)));
      const markerY = centerY;
      
      // Circle hit testing
      const dx = x - markerX;
      const dy = y - markerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 15) { // Slightly larger than marker radius for easier clicks
        // Toggle step completion for demo purposes
        const updatedSteps = [...journeySteps];
        
        // Ensure sequential completion/incompletion
        if (!updatedSteps[i].completed) {
          // Can only complete if all previous steps are completed
          if (i === 0 || updatedSteps[i-1].completed) {
            updatedSteps[i].completed = true;
          }
        } else {
          // Can only uncomplete if all later steps are uncompleted
          if (i === updatedSteps.length - 1 || !updatedSteps[i+1].completed) {
            updatedSteps[i].completed = false;
          }
        }
        
        setJourneySteps(updatedSteps);
        return;
      }
    }
    
    // If clicked elsewhere, deselect
    setSelectedBlock(null);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format hash for display
  const formatHash = (hash) => {
    if (!hash) return '';
    return hash.length > 15 ? `${hash.substring(0, 10)}...` : hash;
  };

  return (
    <motion.div
      className="fixed top-8 left-8 z-20 w-64 bg-gray-900 rounded-lg shadow-lg border border-gray-700 overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        transform: 'perspective(1000px)',
        transformStyle: 'preserve-3d',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.2)'
      }}
    >
      {/* Header Bar */}
      <motion.div 
        className="bg-gray-800 p-3 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ 
          scale: 1.01,
          backgroundColor: 'rgba(31, 41, 55, 1)'
        }}
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(31, 41, 55, 1), rgba(17, 24, 39, 1))',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="flex items-center">
          <Layers size={20} className="mr-2 text-blue-400" />
          <h3 className="font-semibold text-white">Blockchain Journey</h3>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-400 mr-2">{Math.round(journeyProgress * 100)}%</span>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </motion.div>

      {/* Progress bar (visible even when collapsed) */}
      <div className="bg-gray-800 px-3 py-2">
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
            initial={{ width: '0%' }}
            animate={{ width: `${journeyProgress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* 3D Blockchain Visualization */}
            <div className="p-3">
              <div className="bg-gray-800 rounded-lg p-2 overflow-hidden mb-3">
                <div 
                  className="relative"
                  style={{
                    height: '180px',
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-pointer"
                    onClick={handleCanvasClick}
                  />
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-center text-gray-400 mt-2">
                  {selectedBlock ? 'Click a block for details • Click journey markers to track progress' : 'Click a block to view details'}
                </div>
              </div>
              
              {/* Selected block details */}
              <AnimatePresence>
                {selectedBlock && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-3"
                  >
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-white">Block #{blocks.length - blocks.findIndex(b => b.id === selectedBlock.id)}</h4>
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock size={12} className="mr-1" /> {formatTime(selectedBlock.timestamp)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Hash:</span>
                          <span className="text-gray-200">{formatHash(selectedBlock.hash)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Transactions:</span>
                          <span className="text-gray-200">{selectedBlock.transactionCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Size:</span>
                          <span className="text-gray-200">{selectedBlock.size} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gas Used:</span>
                          <span className="text-gray-200">{(selectedBlock.gasUsed / 1000000).toFixed(2)} M</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Learning Journey Status */}
              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2">Your Blockchain Journey</h4>
                
                <div className="space-y-2">
                  {journeySteps.map((step) => (
                    <motion.div 
                      key={step.id}
                      className={`flex items-center p-2 rounded ${
                        step.completed ? 'bg-blue-900 bg-opacity-30' : 'bg-gray-800'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          step.completed ? 'bg-blue-500' : 'bg-gray-700'
                        }`}
                      >
                        {step.completed ? (
                          <Check size={14} className="text-white" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-white">{step.name}</div>
                      </div>
                      <div>
                        {step.completed ? (
                          <span className="text-xs text-blue-400">Completed</span>
                        ) : (
                          <span className="text-xs text-gray-400">Pending</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Journey progress summary */}
                <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    {Math.round(journeyProgress * 100)}% Complete
                  </div>
                  <div className="flex space-x-2">
                    {/* Learning resource buttons */}
                    <motion.button
                      className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Resources"
                    >
                      <FileText size={14} />
                    </motion.button>
                    <motion.button
                      className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Community"
                    >
                      <Users size={14} />
                    </motion.button>
                    <motion.button
                      className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Rewards"
                    >
                      <DollarSign size={14} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div 
              className="bg-gray-800 px-3 py-2 text-xs text-gray-400 flex justify-between items-center"
              style={{
                background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 1))',
                borderTop: '1px solid rgba(55, 65, 81, 0.3)',
              }}
            >
              <span>Recent Blocks</span>
              <span className="flex items-center">
                <ArrowRight size={12} className="ml-1" />
                <span className="ml-1">Explorer</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChevronDown(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronUp(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}