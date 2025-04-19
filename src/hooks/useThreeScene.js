'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import SceneManager from '../lib/three/SceneManager';
import { CHAPTERS } from '../lib/constants';

export default function useThreeScene() {
  const mountRef = useRef(null);
  const sceneManagerRef = useRef(null);
  const currentChapterRef = useRef(0);
  
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Initialize scene
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Create scene manager
    sceneManagerRef.current = new SceneManager(mountRef.current, CHAPTERS);
    
    // Set up raycasting with callback
    sceneManagerRef.current.setupRaycasting(handleMarkerClick);
    
    // Go to initial chapter
    goToChapter(0, true);
    
    // Cleanup
    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
      }
    };
  }, []);
  
  // Chapter navigation functions
  const goToNextChapter = useCallback(() => {
    if (currentChapterRef.current >= CHAPTERS.length - 1 || isNavigating) return;
    currentChapterRef.current++;
    goToChapter(currentChapterRef.current);
  }, [isNavigating]);
  
  const goToPrevChapter = useCallback(() => {
    if (currentChapterRef.current <= 0 || isNavigating) return;
    currentChapterRef.current--;
    goToChapter(currentChapterRef.current);
  }, [isNavigating]);
  
  const goToChapter = useCallback((index, immediate = false) => {
    if (!sceneManagerRef.current) return;
    
    setIsNavigating(true);
    
    // Reset any selections
    if (sceneManagerRef.current.outlinePass) {
      sceneManagerRef.current.outlinePass.selectedObjects = [];
    }
    
    if (mountRef.current) {
      mountRef.current.style.cursor = 'default';
    }
    
    currentChapterRef.current = index;
    
    // Use scene manager to move camera
    const promise = sceneManagerRef.current.goToChapter(index, immediate);
    
    if (immediate) {
      setIsNavigating(false);
    } else {
      promise.then(() => {
        setIsNavigating(false);
      });
    }
  }, []);
  
  // Detail view handling
  const handleMarkerClick = useCallback((index) => {
    if (isNavigating || isDetailVisible) return;
    openChapterDetail(index);
  }, [isNavigating, isDetailVisible]);
  
  const openChapterDetail = useCallback((index) => {
    const chapter = CHAPTERS[index];
    setSelectedChapter(chapter);
    setIsDetailVisible(true);
    
    // Highlight the marker
    if (sceneManagerRef.current && sceneManagerRef.current.markerMeshes) {
      const marker = sceneManagerRef.current.markerMeshes.find(m => m.userData.chapterIndex === index);
      if (marker && sceneManagerRef.current.outlinePass) {
        sceneManagerRef.current.outlinePass.selectedObjects = [marker];
      }
    }
  }, []);
  
  const closeChapterDetail = useCallback(() => {
    setIsDetailVisible(false);
    setTimeout(() => setSelectedChapter(null), 500); // Clear after animation completes
  }, []);
  
  return {
    mountRef,
    currentChapter: currentChapterRef.current,
    selectedChapter,
    isDetailVisible,
    isNavigating,
    chapters: CHAPTERS,
    goToNextChapter,
    goToPrevChapter,
    openChapterDetail,
    closeChapterDetail,
  };
}