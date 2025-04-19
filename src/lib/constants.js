import * as THREE from 'three';

// Chapter data (hex colors are numbers)
export const CHAPTERS = [
  { position: new THREE.Vector3(0, 0, 0), title: "Chapter 1: Intro to Blockchain", color: 0x6495ED },
  { position: new THREE.Vector3(0, 5, -10), title: "Chapter 2: Cryptography Basics", color: 0xFFA500 },
  { position: new THREE.Vector3(0, 10, -20), title: "Chapter 3: Consensus Mechanisms", color: 0x9370DB },
  { position: new THREE.Vector3(0, 15, -30), title: "Chapter 4: Smart Contracts", color: 0x20B2AA },
  { position: new THREE.Vector3(0, 20, -40), title: "Chapter 5: DApps & Future", color: 0xFF6347 },
];

// Backdrop symbols for the scene
export const BACKGROUND_SYMBOLS = ['∑', '∫', '∀', '∃', '∞', '≈', '≠', '≤', '≥', '⊂', '⊃', '₿', 'Ξ', '$', '€', '¥', '⛓️', '🔑', '📄'];
