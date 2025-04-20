// src/components/CryptoPriceTracker3D.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Coins, ArrowUp, ArrowDown, RefreshCw, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CryptoPriceTracker3D() {
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [priceHistory, setPriceHistory] = useState({});
  const chartRef = useRef(null);

  const cryptos = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot'];

  const fetchPrices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptos.join(',')}&order=market_cap_desc&per_page=5&page=1&sparkline=false`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrency data');
      }
      
      const data = await response.json();
      setPrices(data);
      
      // Update price history for chart data
      const newPriceHistory = { ...priceHistory };
      data.forEach(crypto => {
        if (!newPriceHistory[crypto.id]) {
          newPriceHistory[crypto.id] = [];
        }
        
        // Keep only last 24 data points (representing 24 hours if updated every hour)
        if (newPriceHistory[crypto.id].length >= 24) {
          newPriceHistory[crypto.id].shift();
        }
        
        newPriceHistory[crypto.id].push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: crypto.current_price
        });
      });
      
      setPriceHistory(newPriceHistory);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError('Failed to load prices. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showChart && selectedCrypto && chartRef.current) {
      renderChart();
    }
  }, [showChart, selectedCrypto, priceHistory]);

  const renderChart = () => {
    if (!chartRef.current || !selectedCrypto || !priceHistory[selectedCrypto]) return;
    
    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const data = priceHistory[selectedCrypto];
    if (data.length < 2) return;
    
    const prices = data.map(d => d.price);
    const times = data.map(d => d.time);
    
    const maxPrice = Math.max(...prices) * 1.05;
    const minPrice = Math.min(...prices) * 0.95;
    const priceRange = maxPrice - minPrice;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    
    ctx.save();
    
    // Apply 3D perspective transformation
    ctx.translate(width / 2, height / 2);
    ctx.transform(1, 0.1, 0.3, 0.9, 0, 0); // Perspective transform
    ctx.translate(-width / 2, -height / 2);
    
    // Draw 3D chart background
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(width - padding, padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();
    
    // Grid lines with 3D depth
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (price levels)
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - 2 * padding) * (i / 4);
      
      // Main grid line
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      // 3D depth lines
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding - 8, y + 4);
      ctx.stroke();
    }
    
    // Price labels with 3D shadow
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 1)';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 4; i++) {
      const price = maxPrice - (priceRange * (i / 4));
      const y = padding + (height - 2 * padding) * (i / 4);
      
      // Price label
      ctx.fillText(formatPrice(price), padding - 10, y + 3);
    }
    
    // Time labels with 3D effect
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(148, 163, 184, 1)';
    
    const timeStep = Math.ceil(times.length / 5);
    for (let i = 0; i < times.length; i += timeStep) {
      const x = padding + (width - 2 * padding) * (i / (times.length - 1));
      
      // 3D shadow effect for text
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.fillText(times[i], x + 1, height - padding + 16);
      
      ctx.fillStyle = 'rgba(148, 163, 184, 1)';
      ctx.fillText(times[i], x, height - padding + 15);
    }
    
    // Draw the price line with 3D shadow
    if (data.length > 1) {
      // Shadow line
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
      
      for (let i = 0; i < data.length; i++) {
        const x = padding + (width - 2 * padding) * (i / (data.length - 1));
        const y = height - padding - ((data[i].price - minPrice) / priceRange) * (height - 2 * padding);
        
        if (i === 0) {
          ctx.moveTo(x, y + 3); // Shadow offset
        } else {
          ctx.lineTo(x, y + 3); // Shadow offset
        }
      }
      ctx.stroke();
      
      // Main line
      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 1)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 1)');
      
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      
      for (let i = 0; i < data.length; i++) {
        const x = padding + (width - 2 * padding) * (i / (data.length - 1));
        const y = height - padding - ((data[i].price - minPrice) / priceRange) * (height - 2 * padding);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      // Area under the curve with 3D gradient
      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = padding + (width - 2 * padding) * (i / (data.length - 1));
        const y = height - padding - ((data[i].price - minPrice) / priceRange) * (height - 2 * padding);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      // Close the path to the bottom
      ctx.lineTo(width - padding, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.closePath();
      
      const areaGradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      areaGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      areaGradient.addColorStop(1, 'rgba(37, 99, 235, 0.05)');
      ctx.fillStyle = areaGradient;
      ctx.fill();
    }
    
    ctx.restore();
    
    // Draw data points with 3D glowing effect
    ctx.save();
    for (let i = 0; i < data.length; i++) {
      const x = padding + (width - 2 * padding) * (i / (data.length - 1));
      const y = height - padding - ((data[i].price - minPrice) / priceRange) * (height - 2 * padding);
      
      // Glow effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 10);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Actual point
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    // Title with 3D text effect
    ctx.save();
    ctx.font = 'bold 14px sans-serif';
    
    // Shadow
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillText(`${selectedCrypto.toUpperCase()} Price History`, width / 2 + 2, padding - 15 + 2);
    
    // Main text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(`${selectedCrypto.toUpperCase()} Price History`, width / 2, padding - 15);
    ctx.restore();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatPercent = (percent) => {
    return percent.toFixed(2) + '%';
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCryptoClick = (cryptoId) => {
    if (selectedCrypto === cryptoId) {
      setShowChart(!showChart);
    } else {
      setSelectedCrypto(cryptoId);
      setShowChart(true);
    }
  };

  return (
    <motion.div
      className="fixed top-8 right-8 z-20 w-64 bg-gray-900 rounded-lg shadow-lg border border-gray-700 overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
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
          <Coins size={20} className="mr-2 text-blue-400" />
          <h3 className="font-semibold text-white">Crypto Prices</h3>
        </div>
        <div className="flex items-center">
          <motion.button 
            onClick={(e) => {
              e.stopPropagation();
              fetchPrices();
            }}
            className="mr-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Refresh prices"
            whileTap={{ scale: 0.9 }}
            whileHover={{ 
              backgroundColor: 'rgba(55, 65, 81, 1)',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
            }}
          >
            <RefreshCw 
              size={16} 
              className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} 
            />
          </motion.button>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </motion.div>

      {/* Prices Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {error ? (
              <div className="p-4 text-center text-red-400">
                <p>{error}</p>
                <motion.button 
                  onClick={fetchPrices}
                  className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </motion.button>
              </div>
            ) : isLoading && prices.length === 0 ? (
              <div className="p-4 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="px-3 py-2 space-y-2">
                  {prices.map((crypto) => (
                    <motion.div 
                      key={crypto.id}
                      className="flex justify-between items-center p-2 rounded-md cursor-pointer"
                      onClick={() => handleCryptoClick(crypto.id)}
                      whileHover={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.8)',
                        translateZ: '10px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                        transition: 'all 0.2s ease',
                        background: selectedCrypto === crypto.id ? 
                          'linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9))' : 
                          'transparent'
                      }}
                    >
                      <div className="flex items-center">
                        <motion.img 
                          src={crypto.image} 
                          alt={crypto.name} 
                          className="w-6 h-6 mr-2"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/api/placeholder/24/24";
                          }}
                          style={{
                            filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3))'
                          }}
                          whileHover={{
                            scale: 1.15,
                            rotate: 5
                          }}
                        />
                        <span className="font-medium text-white">{crypto.symbol.toUpperCase()}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-white">{formatPrice(crypto.current_price)}</span>
                        <motion.span 
                          className={`text-xs flex items-center ${
                            crypto.price_change_percentage_24h >= 0 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}
                          initial={{ opacity: 0.8 }}
                          whileHover={{ 
                            scale: 1.1, 
                            opacity: 1,
                            textShadow: crypto.price_change_percentage_24h >= 0 ?
                              '0 0 8px rgba(74, 222, 128, 0.6)' :
                              '0 0 8px rgba(248, 113, 113, 0.6)'
                          }}
                        >
                          {crypto.price_change_percentage_24h >= 0 ? (
                            <ArrowUp size={12} className="mr-1" />
                          ) : (
                            <ArrowDown size={12} className="mr-1" />
                          )}
                          {formatPercent(Math.abs(crypto.price_change_percentage_24h))}
                        </motion.span>
                      </div>
                      {selectedCrypto === crypto.id && (
                        <motion.div 
                          className="absolute right-2 top-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <BarChart2 size={12} className="text-blue-400" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                {/* 3D Chart Section */}
                <AnimatePresence>
                  {showChart && selectedCrypto && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-3 pb-3"
                    >
                      <motion.div
                        className="bg-gray-800 rounded-lg p-2 overflow-hidden"
                        style={{
                          perspective: '1000px',
                          transformStyle: 'preserve-3d',
                          boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)'
                        }}
                        initial={{ rotateX: 30 }}
                        animate={{ rotateX: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <canvas 
                          ref={chartRef} 
                          width={220} 
                          height={180} 
                          className="w-full h-auto"
                        ></canvas>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div 
                  className="bg-gray-800 px-3 py-2 text-xs text-gray-400 flex justify-between"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 1))',
                    borderTop: '1px solid rgba(55, 65, 81, 0.3)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <span>Last updated: {formatTime(lastUpdated)}</span>
                  <span>via CoinGecko</span>
                </div>
              </>
            )}
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