'use client';

import { useState, useEffect } from 'react';
import ChapterDetail from '../components/ChapterDetail';
import NavigationButtons from '../components/UI/NavigationButtons';
import ProgressIndicator from '../components/UI/ProgressIndicator';
import ChatBot from '../components/chatbot';
import IntroScreen from '../components/IntroScreen';
import useThreeScene from '../hooks/useThreeScene.js';
import Crypto from '../components/cryptowidject';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const {
    mountRef,
    currentChapter,
    selectedChapter,
    isDetailVisible,
    isNavigating,
    chapters,
    goToNextChapter,
    goToPrevChapter,
    closeChapterDetail,
  } = useThreeScene();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Intro Screen */}
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}
      
      {/* 3D Scene Container */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Navigation UI - Only show when intro is done */}
      {!showIntro && (
        <>
          <NavigationButtons 
            goToPrevChapter={goToPrevChapter}
            goToNextChapter={goToNextChapter}
            currentChapter={currentChapter}
            totalChapters={chapters.length}
            isNavigating={isNavigating}
            isDetailVisible={isDetailVisible}
          />
          
          <ProgressIndicator 
            chapters={chapters} 
            currentChapter={currentChapter} 
          />
          
          {/* Chapter Detail View */}
          <ChapterDetail 
            chapter={selectedChapter} 
            onClose={closeChapterDetail}
            isVisible={isDetailVisible}
          />
          
          {/* Compact Title in top-left */}
          <div className="absolute top-8 left-8 text-white z-10 max-w-xs">
            <h1 className="text-2xl font-bold mb-1">Block Path</h1>
            <p className="text-sm opacity-70">Explore the blockchain journey</p>
          </div>

          {/* ChatBot Component */}
          <ChatBot />
          
          {/* Crypto Widget - positioned bottom-right */}
          <div className="absolute bottom-8 right-8 z-10">
            <Crypto />
          </div>
        </>
      )}
    </div>
  );
}