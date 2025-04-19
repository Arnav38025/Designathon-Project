'use client';

import { useState, useEffect } from 'react';
import ChapterDetail from '../components/ChapterDetail';
import NavigationButtons from '../components/UI/NavigationButtons';
import ProgressIndicator from '../components/UI/ProgressIndicator';
import useThreeScene from '../hooks/useThreeScene.js';

export default function Home() {
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
      {/* 3D Scene Container */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Navigation UI */}
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
      
      {/* Title and Instructions */}
      <div className="absolute top-8 left-8 text-white z-10">
        <h1 className="text-3xl font-bold mb-2">Blockchain Learning Path</h1>
        <p className="opacity-70">Click on spheres to explore chapters or use navigation buttons</p>
      </div>
    </div>
  );
}