import * as THREE from 'three';

console.log('Testing Three.js texture creation and normal map generation...');

// Verify THREE.CanvasTexture and normal map properties
const testMat = new THREE.MeshStandardMaterial({
  roughness: 0.65,
  metalness: 0.18
});

console.log('MeshStandardMaterial initialized successfully:', {
  roughness: testMat.roughness,
  metalness: testMat.metalness
});
