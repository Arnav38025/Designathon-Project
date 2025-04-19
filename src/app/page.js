'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

// --- Chapter Detail Component ---
function ChapterDetail({ chapter, onClose, isVisible }) {
  if (!chapter) return null;

  const bgColorStyle = {
    backgroundColor: `#${chapter.color.toString(16)}33`, // Add alpha transparency
    borderColor: `#${chapter.color.toString(16)}`,
  };

  return (
    <div
      className={`absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-20 transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose} // Close on background click
    >
      <div
        className="w-3/4 max-w-4xl h-3/4 bg-gray-900 rounded-lg shadow-xl p-8 overflow-y-auto border-2 text-white"
        style={bgColorStyle}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the box
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold" style={{ color: `#${chapter.color.toString(16)}` }}>
            {chapter.title}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-400 text-2xl font-bold"
            aria-label="Close chapter details"
          >
            &times; {/* Close icon */}
          </button>
        </div>

        {/* Placeholder Content */}
        <div className="space-y-4">
          <p className="text-lg">
            Welcome to {chapter.title}. This section delves into the core concepts of [Topic related to the chapter]. Blockchain technology provides a decentralized and secure way to record transactions...
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-xl font-semibold mb-2">Key Concept 1</h3>
              <p>Detailed explanation of the first key concept goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <img src={`/api/placeholder/300/200?text=Concept+Image+1`} alt="Placeholder Concept 1" className="mt-4 rounded"/>
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-xl font-semibold mb-2">Key Concept 2</h3>
              <p>Further details about another important aspect. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <img src={`/api/placeholder/300/200?text=Concept+Image+2`} alt="Placeholder Concept 2" className="mt-4 rounded"/>
            </div>
          </div>
          <p>
            Interactive elements or further reading links could be placed here. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function Home() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const composerRef = useRef(null);
  const outlinePassRef = useRef(null);
  const animationRef = useRef(null);
  const cameraAnimationIdRef = useRef(null);
  const currentChapterRef = useRef(0);
  const markerMeshesRef = useRef([]);
  const backgroundSymbolsRef = useRef([]);
  const textMeshesRef = useRef([]);

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Chapter data (hex colors are numbers)
  const chapters = [
    { position: new THREE.Vector3(0, 0, 0), title: "Chapter 1: Intro to Blockchain", color: 0x6495ED },
    { position: new THREE.Vector3(0, 5, -10), title: "Chapter 2: Cryptography Basics", color: 0xFFA500 },
    { position: new THREE.Vector3(0, 10, -20), title: "Chapter 3: Consensus Mechanisms", color: 0x9370DB },
    { position: new THREE.Vector3(0, 15, -30), title: "Chapter 4: Smart Contracts", color: 0x20B2AA },
    { position: new THREE.Vector3(0, 20, -40), title: "Chapter 5: DApps & Future", color: 0xFF6347 },
  ];

  // --- Initialization Effect ---
  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0x111111, 1, 100);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 10);
    cameraRef.current = camera;

    // Renderer setup - HIGHER RESOLUTION
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5)); // Higher resolution but capped for performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Improved color rendering
    renderer.toneMappingExposure = 1.2; // Slightly brighter
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Post-processing Composer & Passes with HIGHER QUALITY
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera
    );
    outlinePass.edgeStrength = 3.5;
    outlinePass.edgeGlow = 0.7;
    outlinePass.edgeThickness = 1.2;
    outlinePass.pulsePeriod = 0;
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#190a0a');
    composer.addPass(outlinePass);
    outlinePassRef.current = outlinePass;

    // FXAA Pass for smoother edges/outlines
    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(effectFXAA);

    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096; // Much higher shadow resolution
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.bias = -0.0001; // Reduce shadow acne
    scene.add(directionalLight);

    // Add a subtle colored light for atmosphere
    const blueLight = new THREE.PointLight(0x3677ac, 1, 50);
    blueLight.position.set(-15, 10, 0);
    scene.add(blueLight);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enabled = false;
    controlsRef.current = controls;

    // Create scene elements
    createPath();
    markerMeshesRef.current = createChapterPlatforms();
    createBackgroundSymbols(scene);

    // --- Event Listeners ---
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      composer.setSize(width, height);
      effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);
    };

    const handleMouseMove = (event) => {
      if (isDetailVisible || isNavigating) return;

      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(markerMeshesRef.current);

      if (intersects.length > 0) {
        const firstIntersectedObject = intersects[0].object;
        outlinePassRef.current.selectedObjects = [firstIntersectedObject];
        currentMount.style.cursor = 'pointer';
      } else {
        outlinePassRef.current.selectedObjects = [];
        currentMount.style.cursor = 'default';
      }
    };

    const handleClick = (event) => {
      if (isDetailVisible || isNavigating) return;

      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(markerMeshesRef.current);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const chapterIndex = clickedObject.userData.chapterIndex;
        openChapterDetail(chapterIndex);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      const deltaTime = clock.getDelta();

      controls.update();

      // Animate background symbols
      backgroundSymbolsRef.current.forEach(symbol => {
        symbol.position.y += deltaTime * 0.5;
        symbol.rotation.z += deltaTime * 0.1 * symbol.userData.rotationSpeed;
        if (symbol.position.y > 30) {
          symbol.position.y = -30;
          symbol.position.x = Math.random() * 80 - 40;
          symbol.position.z = Math.random() * 80 - 40;
        }
      });

      // Update text billboarding - make text always face camera
      if (cameraRef.current) {
        textMeshesRef.current.forEach(textMesh => {
          textMesh.lookAt(cameraRef.current.position);
        });
      }

      if (composerRef.current) {
        composerRef.current.render(deltaTime);
      } else {
        renderer.render(scene, camera);
      }
    };

    // Start animation loop
    goToChapter(0, true);
    animate();

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationRef.current);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
        currentMount.style.cursor = 'default';
      }
      markerMeshesRef.current = [];
      backgroundSymbolsRef.current = [];
      textMeshesRef.current = [];
      scene.traverse(object => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      scene.clear();
    };
  }, []);

  // --- Helper Functions ---
  const createPath = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    
    const pathGeometry = new THREE.BufferGeometry();
    const points = chapters.map(ch => ch.position);

    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(200); // More points for smoother curve

    pathGeometry.setFromPoints(curvePoints);

    // Enhanced path material
    const pathMaterial = new THREE.LineBasicMaterial({
      color: 0x8da9ff,
      linewidth: 2,
      opacity: 0.8,
      transparent: true
    });

    const path = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(path);

    // Improved railings and floor
    const railingWidth = 1.2;
    const railingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xababab, 
      roughness: 0.5,
      metalness: 0.7
    });
    
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.7,
      metalness: 0.3,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < curvePoints.length - 1; i++) {
      const startPoint = curvePoints[i];
      const endPoint = curvePoints[i + 1];

      const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const perpendicular = new THREE.Vector3().crossVectors(direction, up).normalize();
      if (perpendicular.lengthSq() < 0.1) {
        perpendicular.set(1, 0, 0);
      }

      const startLeft = new THREE.Vector3().addVectors(startPoint, perpendicular.clone().multiplyScalar(railingWidth));
      const startRight = new THREE.Vector3().subVectors(startPoint, perpendicular.clone().multiplyScalar(railingWidth));
      const endLeft = new THREE.Vector3().addVectors(endPoint, perpendicular.clone().multiplyScalar(railingWidth));
      const endRight = new THREE.Vector3().subVectors(endPoint, perpendicular.clone().multiplyScalar(railingWidth));

      // Improved railings - using cylindrical geometry instead of lines
      if (i % 10 === 0) { // Place railings less frequently for performance
        const railGeometry = new THREE.CylinderGeometry(0.05, 0.05, startLeft.distanceTo(endLeft), 8);
        railGeometry.rotateX(Math.PI / 2);
        
        const leftRail = new THREE.Mesh(railGeometry, railingMaterial);
        const midpoint = new THREE.Vector3().addVectors(startLeft, endLeft).multiplyScalar(0.5);
        leftRail.position.copy(midpoint);
        leftRail.lookAt(endLeft);
        scene.add(leftRail);

        const rightRail = leftRail.clone();
        const rightMidpoint = new THREE.Vector3().addVectors(startRight, endRight).multiplyScalar(0.5);
        rightRail.position.copy(rightMidpoint);
        rightRail.lookAt(endRight);
        scene.add(rightRail);
      }

      // Floor Panels with improved spacing/material
      if (i % 5 === 0) {
        const floorGeometry = new THREE.BufferGeometry();
        const vertices = [
          startLeft.x, startLeft.y, startLeft.z,
          startRight.x, startRight.y, startRight.z,
          endRight.x, endRight.y, endRight.z,

          endRight.x, endRight.y, endRight.z,
          endLeft.x, endLeft.y, endLeft.z,
          startLeft.x, startLeft.y, startLeft.z
        ];
        floorGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        floorGeometry.computeVertexNormals();

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.receiveShadow = true;
        scene.add(floor);
      }
    }
  };

  const createChapterPlatforms = () => {
    const markers = [];
    const scene = sceneRef.current;
    if (!scene) return markers;

    textMeshesRef.current = []; // Reset text meshes array

    chapters.forEach((chapter, index) => {
      // Enhanced platform with glow effect
      const platformGeometry = new THREE.CircleGeometry(3, 64); // More segments for smoother circle
      const platformMaterial = new THREE.MeshStandardMaterial({
        color: chapter.color,
        roughness: 0.3,
        metalness: 0.7,
        emissive: chapter.color,
        emissiveIntensity: 0.2, // Subtle glow
      });
      
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.copy(chapter.position);
      platform.rotation.x = -Math.PI / 2;
      platform.receiveShadow = true;
      scene.add(platform);

      // Create a ring around the platform
      const ringGeometry = new THREE.RingGeometry(3, 3.2, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: chapter.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(platform.position);
      ring.position.y += 0.01; // Slightly above platform to prevent z-fighting
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);

      // IMPROVED TEXT RENDERING - Create chapter title using TextureLoader for higher quality
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const canvasWidth = 1024; // Much higher resolution for text
      const canvasHeight = 256;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Create gradient background
      const gradient = context.createLinearGradient(0, 0, canvasWidth, 0);
      gradient.addColorStop(0, `rgba(0, 0, 0, 0.7)`);
      gradient.addColorStop(0.5, `rgba(${(chapter.color >> 16) & 255}, ${(chapter.color >> 8) & 255}, ${chapter.color & 255}, 0.8)`);
      gradient.addColorStop(1, `rgba(0, 0, 0, 0.7)`);
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Add text with shadow for better readability
      context.shadowColor = 'rgba(0, 0, 0, 0.7)';
      context.shadowBlur = 15;
      context.shadowOffsetX = 4;
      context.shadowOffsetY = 4;
      context.font = 'bold 72px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(chapter.title, canvasWidth / 2, canvasHeight / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 16; // Increase sharpness at angles
      texture.needsUpdate = true;

      const textMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      
      const textMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 1.25), // Wider for better text display
        textMaterial
      );

      textMesh.position.set(chapter.position.x, chapter.position.y + 2.2, chapter.position.z);
      // Will be updated in animation loop for billboarding
      
      scene.add(textMesh);
      textMeshesRef.current.push(textMesh); // Store reference for billboarding

      // Enhanced chapter marker (the "ball")
      const markerGeometry = new THREE.SphereGeometry(0.65, 128, 128); // Higher res sphere
      
      // Create a more visually appealing material with subsurface effect
      const markerMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        emissive: chapter.color,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.9,
        clearcoat: 1.0, // Add clearcoat layer
        clearcoatRoughness: 0.1,
        reflectivity: 1.0,
        envMapIntensity: 1.0
      });
      
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(chapter.position.x, chapter.position.y + 1, chapter.position.z);
      marker.castShadow = true;
      marker.userData = { chapterIndex: index, isMarker: true };
      scene.add(marker);
      markers.push(marker);
      
      // Add a point light at the marker for local illumination
      const pointLight = new THREE.PointLight(chapter.color, 1, 5);
      pointLight.position.copy(marker.position);
      scene.add(pointLight);
    });
    return markers;
  };

  // Function to create background symbols
  const createBackgroundSymbols = (scene) => {
    const symbols = ['∑', '∫', '∀', '∃', '∞', '≈', '≠', '≤', '≥', '⊂', '⊃', '₿', 'Ξ', '$', '€', '¥', '⛓️', '🔑', '📄'];
    const symbolCount = 150;
    const spread = 80;

    for (let i = 0; i < symbolCount; i++) {
      const symbolChar = symbols[Math.floor(Math.random() * symbols.length)];

      // Create higher resolution canvas for each symbol
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const size = 128; // Increased from 64
      canvas.width = size;
      canvas.height = size;

      // Create a subtle glow effect
      const gradientColor = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}`;
      
      // Draw subtle glow
      const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      gradient.addColorStop(0, `${gradientColor}, ${Math.random() * 0.1 + 0.05})`);
      gradient.addColorStop(1, `${gradientColor}, 0)`);
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);

      // Draw symbol
      context.font = `bold ${size * 0.8}px Arial`;
      context.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(symbolChar, size / 2, size / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 8; // Sharper rendering at angles
      
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending // Adds glow effect
      });

      const geometry = new THREE.PlaneGeometry(1.2, 1.2);
      const symbolMesh = new THREE.Mesh(geometry, material);

      // Random position within the spread
      symbolMesh.position.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      );

      // Ensure symbols are not too close to the path
      if (Math.abs(symbolMesh.position.x) < 10 && Math.abs(symbolMesh.position.z) < 50 && symbolMesh.position.y < 25 && symbolMesh.position.y > -5) {
        symbolMesh.position.y += Math.random() > 0.5 ? 20 : -20;
      }

      symbolMesh.userData = { rotationSpeed: (Math.random() - 0.5) * 0.5 };

      scene.add(symbolMesh);
      backgroundSymbolsRef.current.push(symbolMesh);
    }
  };

  // --- Navigation Functions ---
  const goToNextChapter = useCallback(() => {
    if (currentChapterRef.current >= chapters.length - 1 || isNavigating) return;
    currentChapterRef.current++;
    goToChapter(currentChapterRef.current);
  }, [isNavigating]);

  const goToPrevChapter = useCallback(() => {
    if (currentChapterRef.current <= 0 || isNavigating) return;
    currentChapterRef.current--;
    goToChapter(currentChapterRef.current);
  }, [isNavigating]);

  const goToChapter = useCallback((index, immediate = false) => {
    if (!cameraRef.current) return;
    setIsNavigating(true);
    outlinePassRef.current.selectedObjects = [];
    if (mountRef.current) mountRef.current.style.cursor = 'default';

    const chapter = chapters[index];
    currentChapterRef.current = index;

    const targetPosition = new THREE.Vector3(
      chapter.position.x,
      chapter.position.y + 3,
      chapter.position.z + 6
    );

    const lookAtPosition = new THREE.Vector3(
      chapter.position.x,
      chapter.position.y + 1,
      chapter.position.z
    );

    if (immediate) {
      cameraRef.current.position.copy(targetPosition);
      cameraRef.current.lookAt(lookAtPosition);
      setIsNavigating(false);
    } else {
      animateCamera(targetPosition, lookAtPosition);
    }
  }, []);

  const animateCamera = useCallback((targetPos, lookAtPos) => {
    const camera = cameraRef.current;
    if (!camera) {
      setIsNavigating(false);
      return;
    }

    const startPos = camera.position.clone();
    const startQuaternion = camera.quaternion.clone();

    const tempCam = camera.clone();
    tempCam.position.copy(targetPos);
    tempCam.lookAt(lookAtPos);
    const endQuaternion = tempCam.quaternion.clone();

    const duration = 1500;
    const startTime = Date.now();

    if (cameraAnimationIdRef.current) {
      cancelAnimationFrame(cameraAnimationIdRef.current);
    }

    const animateStep = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      let progress = Math.min(elapsed / duration, 1);

      // Smoother easing function
      progress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.quaternion.copy(startQuaternion).slerp(endQuaternion, progress);
      camera.position.lerpVectors(startPos, targetPos, progress);

      if (progress < 1) {
        cameraAnimationIdRef.current = requestAnimationFrame(animateStep);
      } else {
        camera.position.copy(targetPos);
        camera.quaternion.copy(endQuaternion);
        cameraAnimationIdRef.current = null;
        setIsNavigating(false);
      }
    };

    animateStep();
  }, []);

  // --- Detail View Handling ---
  // Put this above your useEffect (or wherever you define your other callbacks)
  const openChapterDetail = useCallback((index) => {
    // 1) Grab the data, 2) show the panel, 3) highlight the marker
    const chapter = chapters[index];
    setSelectedChapter(chapter);
    setIsDetailVisible(true);

    const marker = markerMeshesRef.current.find(m => m.userData.chapterIndex === index);
    if (marker && outlinePassRef.current) {
      outlinePassRef.current.selectedObjects = [marker];
    }
  }, [chapters]);

  
    const closeChapterDetail = useCallback(() => {
      setIsDetailVisible(false);
      setTimeout(() => setSelectedChapter(null), 500); // Clear after animation completes
    }, []);
  
    // --- Improved Navigation Buttons ---
    const renderNavigationButtons = () => {
      return (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-10 z-10">
          <button
            onClick={goToPrevChapter}
            disabled={currentChapterRef.current <= 0 || isNavigating || isDetailVisible}
            className={`px-8 py-4 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
              currentChapterRef.current <= 0 || isNavigating || isDetailVisible
                ? 'opacity-30 cursor-not-allowed'
                : 'opacity-80 hover:opacity-100 hover:scale-105'
            }`}
            style={{ 
              backgroundColor: 'rgba(25, 25, 35, 0.5)', 
              border: '1px solid rgba(150, 150, 255, 0.3)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            aria-label="Previous chapter"
          >
            <span className="text-white font-semibold text-lg mr-2">←</span>
            <span className="text-white font-semibold">Previous Chapter</span>
          </button>
          
          <button
            onClick={goToNextChapter}
            disabled={currentChapterRef.current >= chapters.length - 1 || isNavigating || isDetailVisible}
            className={`px-8 py-4 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
              currentChapterRef.current >= chapters.length - 1 || isNavigating || isDetailVisible
                ? 'opacity-30 cursor-not-allowed'
                : 'opacity-80 hover:opacity-100 hover:scale-105'
            }`}
            style={{ 
              backgroundColor: 'rgba(25, 25, 35, 0.5)', 
              border: '1px solid rgba(150, 150, 255, 0.3)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            aria-label="Next chapter"
          >
            <span className="text-white font-semibold">Next Chapter</span>
            <span className="text-white font-semibold text-lg ml-2">→</span>
          </button>
        </div>
      );
    };
  
    // --- Progress Indicator ---
    const renderProgressIndicator = () => {
      return (
        <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
          <div className="bg-black bg-opacity-50 backdrop-blur-md px-6 py-3 rounded-full">
            <div className="flex space-x-2">
              {chapters.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentChapterRef.current ? 'bg-white scale-125' : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      );
    };
  
    return (
      <div className="relative w-full h-screen overflow-hidden">
        {/* 3D Scene Container */}
        <div ref={mountRef} className="w-full h-full" />
        
        {/* Navigation UI */}
        {renderNavigationButtons()}
        {renderProgressIndicator()}
        
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