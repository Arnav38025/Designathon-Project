'use client';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { BACKGROUND_SYMBOLS } from '../constants';

export default class SceneManager {
  constructor(mountElement, chapters) {
    this.mountElement = mountElement;
    this.chapters = chapters;
    
    // Refs
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.composer = null;
    this.outlinePass = null;
    this.animationId = null;
    
    // Scene objects
    this.markerMeshes = [];
    this.backgroundSymbols = [];
    this.textMeshes = [];

    // Setup
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Initialize
    this.init();
  }

  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupPostProcessing();
    this.setupLighting();
    this.setupControls();
    
    // Create scene elements
    this.createPath();
    this.markerMeshes = this.createChapterPlatforms();
    this.createBackgroundSymbols();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start animation loop
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);
    this.scene.fog = new THREE.Fog(0x111111, 1, 100);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 10);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.mountElement.appendChild(this.renderer.domElement);
  }

  setupPostProcessing() {
    // Create composer
    this.composer = new EffectComposer(this.renderer);
    
    // Add render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Add outline pass
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );
    this.outlinePass.edgeStrength = 3.5;
    this.outlinePass.edgeGlow = 0.7;
    this.outlinePass.edgeThickness = 1.2;
    this.outlinePass.pulsePeriod = 0;
    this.outlinePass.visibleEdgeColor.set('#ffffff');
    this.outlinePass.hiddenEdgeColor.set('#190a0a');
    this.composer.addPass(this.outlinePass);
    
    // Add FXAA pass
    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    this.composer.addPass(effectFXAA);
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
    
    // Directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.bias = -0.0001;
    this.scene.add(directionalLight);
    
    // Blue point light for atmosphere
    const blueLight = new THREE.PointLight(0x3677ac, 1, 50);
    blueLight.position.set(-15, 10, 0);
    this.scene.add(blueLight);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enabled = false;
  }

  setupEventListeners() {
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    
    // Update FXAA uniforms
    const fxaaPass = this.composer.passes.find(pass => pass.material && pass.material.uniforms && pass.material.uniforms.resolution);
    if (fxaaPass) {
      fxaaPass.material.uniforms.resolution.value.set(1 / width, 1 / height);
    }
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // Update controls
    this.controls.update();
    
    // Animate background symbols
    const deltaTime = 0.016; // Approximately 60fps
    this.backgroundSymbols.forEach(symbol => {
      symbol.position.y += deltaTime * 0.5;
      symbol.rotation.z += deltaTime * 0.1 * symbol.userData.rotationSpeed;
      if (symbol.position.y > 30) {
        symbol.position.y = -30;
        symbol.position.x = Math.random() * 80 - 40;
        symbol.position.z = Math.random() * 80 - 40;
      }
    });
    
    // Update text billboarding - make text always face camera
    this.textMeshes.forEach(textMesh => {
      textMesh.lookAt(this.camera.position);
    });
    
    // Render scene
    if (this.composer) {
      this.composer.render(deltaTime);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  createPath() {
    const pathGeometry = new THREE.BufferGeometry();
    const points = this.chapters.map(ch => ch.position);
    
    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(200);
    
    pathGeometry.setFromPoints(curvePoints);
    
    // Path material
    const pathMaterial = new THREE.LineBasicMaterial({
      color: 0x8da9ff,
      linewidth: 2,
      opacity: 0.8,
      transparent: true
    });
    
    const path = new THREE.Line(pathGeometry, pathMaterial);
    this.scene.add(path);
    
    // Add railings and floor
    this.createRailingsAndFloor(curvePoints);
  }

  createRailingsAndFloor(curvePoints) {
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
      
      // Add railings (cylinders) every 10 points
      if (i % 10 === 0) {
        const railGeometry = new THREE.CylinderGeometry(0.05, 0.05, startLeft.distanceTo(endLeft), 8);
        railGeometry.rotateX(Math.PI / 2);
        
        const leftRail = new THREE.Mesh(railGeometry, railingMaterial);
        const midpoint = new THREE.Vector3().addVectors(startLeft, endLeft).multiplyScalar(0.5);
        leftRail.position.copy(midpoint);
        leftRail.lookAt(endLeft);
        this.scene.add(leftRail);
        
        const rightRail = leftRail.clone();
        const rightMidpoint = new THREE.Vector3().addVectors(startRight, endRight).multiplyScalar(0.5);
        rightRail.position.copy(rightMidpoint);
        rightRail.lookAt(endRight);
        this.scene.add(rightRail);
      }
      
      // Add floor panels every 5 points
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
        this.scene.add(floor);
      }
    }
  }

  createChapterPlatforms() {
    const markers = [];
    
    this.chapters.forEach((chapter, index) => {
      // Platform (circle)
      const platformGeometry = new THREE.CircleGeometry(3, 64);
      const platformMaterial = new THREE.MeshStandardMaterial({
        color: chapter.color,
        roughness: 0.3,
        metalness: 0.7,
        emissive: chapter.color,
        emissiveIntensity: 0.2,
      });
      
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.copy(chapter.position);
      platform.rotation.x = -Math.PI / 2;
      platform.receiveShadow = true;
      this.scene.add(platform);
      
      // Ring around platform
      const ringGeometry = new THREE.RingGeometry(3, 3.2, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: chapter.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(platform.position);
      ring.position.y += 0.01;
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);
      
      // Chapter title text
      this.createChapterText(chapter, index);
      
      // Chapter marker (sphere)
      const marker = this.createChapterMarker(chapter, index);
      markers.push(marker);
      
      // Point light at marker
      const pointLight = new THREE.PointLight(chapter.color, 1, 5);
      pointLight.position.copy(marker.position);
      this.scene.add(pointLight);
    });
    
    return markers;
  }

  createChapterText(chapter) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const canvasWidth = 1024;
    const canvasHeight = 256;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Gradient background
    const gradient = context.createLinearGradient(0, 0, canvasWidth, 0);
    gradient.addColorStop(0, `rgba(0, 0, 0, 0.7)`);
    gradient.addColorStop(0.5, `rgba(${(chapter.color >> 16) & 255}, ${(chapter.color >> 8) & 255}, ${chapter.color & 255}, 0.8)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, 0.7)`);
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Text with shadow
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
    texture.anisotropy = 16;
    texture.needsUpdate = true;
    
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    const textMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 1.25),
      textMaterial
    );
    
    textMesh.position.set(
      chapter.position.x,
      chapter.position.y + 2.2,
      chapter.position.z
    );
    
    this.scene.add(textMesh);
    this.textMeshes.push(textMesh);
    
    return textMesh;
  }

  createChapterMarker(chapter, index) {
    const markerGeometry = new THREE.SphereGeometry(0.65, 128, 128);
    
    const markerMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: chapter.color,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
      envMapIntensity: 1.0
    });
    
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(
      chapter.position.x,
      chapter.position.y + 1,
      chapter.position.z
    );
    marker.castShadow = true;
    marker.userData = { chapterIndex: index, isMarker: true };
    this.scene.add(marker);
    
    return marker;
  }

  createBackgroundSymbols() {
    const symbolCount = 150;
    const spread = 80;
    
    for (let i = 0; i < symbolCount; i++) {
      const symbolChar = BACKGROUND_SYMBOLS[Math.floor(Math.random() * BACKGROUND_SYMBOLS.length)];
      
      // Create canvas for symbol
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const size = 128;
      canvas.width = size;
      canvas.height = size;
      
      // Draw glow effect
      const gradientColor = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}`;
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
      texture.anisotropy = 8;
      
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      
      const geometry = new THREE.PlaneGeometry(1.2, 1.2);
      const symbolMesh = new THREE.Mesh(geometry, material);
      
      // Random position
      symbolMesh.position.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      );
      
      // Ensure symbols are not too close to the path
      if (Math.abs(symbolMesh.position.x) < 10 && 
          Math.abs(symbolMesh.position.z) < 50 && 
          symbolMesh.position.y < 25 && 
          symbolMesh.position.y > -5) {
        symbolMesh.position.y += Math.random() > 0.5 ? 20 : -20;
      }
      
      symbolMesh.userData = { rotationSpeed: (Math.random() - 0.5) * 0.5 };
      
      this.scene.add(symbolMesh);
      this.backgroundSymbols.push(symbolMesh);
    }
  }

  // Mouse interaction methods
  setupRaycasting(onMarkerClick) {
    this.onMarkerClick = onMarkerClick;
    
    this.mountElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.mountElement.addEventListener('click', this.handleMouseClick.bind(this));
    
    return () => {
      this.mountElement.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      this.mountElement.removeEventListener('click', this.handleMouseClick.bind(this));
    };
  }
  
  handleMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.markerMeshes);
    
    if (intersects.length > 0) {
      const firstIntersectedObject = intersects[0].object;
      this.outlinePass.selectedObjects = [firstIntersectedObject];
      this.mountElement.style.cursor = 'pointer';
    } else {
      this.outlinePass.selectedObjects = [];
      this.mountElement.style.cursor = 'default';
    }
  }
  
  handleMouseClick(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.markerMeshes);
    
    if (intersects.length > 0 && this.onMarkerClick) {
      const clickedObject = intersects[0].object;
      const chapterIndex = clickedObject.userData.chapterIndex;
      this.onMarkerClick(chapterIndex);
    }
  }
  
  // Camera movement methods
  goToChapter(index, immediate = false) {
    const chapter = this.chapters[index];
    
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
      this.camera.position.copy(targetPosition);
      this.camera.lookAt(lookAtPosition);
      return Promise.resolve();
    } else {
      return this.animateCamera(targetPosition, lookAtPosition);
    }
  }
  
  animateCamera(targetPos, lookAtPos) {
    return new Promise((resolve) => {
      const startPos = this.camera.position.clone();
      const startQuaternion = this.camera.quaternion.clone();
      
      const tempCam = this.camera.clone();
      tempCam.position.copy(targetPos);
      tempCam.lookAt(lookAtPos);
      const endQuaternion = tempCam.quaternion.clone();
      
      const duration = 1500;
      const startTime = Date.now();
      
      if (this.cameraAnimationId) {
        cancelAnimationFrame(this.cameraAnimationId);
      }
      
      const animateStep = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        let progress = Math.min(elapsed / duration, 1);
        
        // Smoother easing function
        progress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        this.camera.quaternion.copy(startQuaternion).slerp(endQuaternion, progress);
        this.camera.position.lerpVectors(startPos, targetPos, progress);
        
        if (progress < 1) {
          this.cameraAnimationId = requestAnimationFrame(animateStep);
        } else {
          this.camera.position.copy(targetPos);
          this.camera.quaternion.copy(endQuaternion);
          this.cameraAnimationId = null;
          resolve();
        }
      };
      
      animateStep();
    });
  }
  
  // Cleanup method
  dispose() {
    cancelAnimationFrame(this.animationId);
    if (this.cameraAnimationId) {
      cancelAnimationFrame(this.cameraAnimationId);
    }
    
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.mountElement.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.mountElement.removeEventListener('click', this.handleMouseClick.bind(this));
    
    if (this.mountElement && this.renderer.domElement) {
      this.mountElement.removeChild(this.renderer.domElement);
      this.mountElement.style.cursor = 'default';
    }
    
    // Clear references to meshes
    this.markerMeshes = [];
    this.backgroundSymbols = [];
    this.textMeshes = [];
    
    // Dispose of geometries and materials
    this.scene.traverse(object => {
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
    
    this.scene.clear();
  }
}
