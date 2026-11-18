import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

/**
 * DHAKA CITY GANGSTAR — Spatial Query & BVH Acceleration Manager
 * Powered by `three-mesh-bvh`
 * Provides:
 * - Ultra-fast accelerated raycasting against high-poly buildings & terrain
 * - Bounding Volume Hierarchy (BVH) generation & lifecycle management
 * - Spatial broadphase filtering for collisions, foot placement, and camera occlusion
 */
export class SpatialManager {
  constructor() {
    this.initialized = false;
    this.bvhMeshes = new Set();
    this.initBVH();
  }

  initBVH() {
    if (this.initialized) return;
    // Patch THREE.BufferGeometry and THREE.Mesh with acceleratedRaycast
    THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
    THREE.Mesh.prototype.raycast = acceleratedRaycast;
    this.initialized = true;
    console.log('[SpatialManager] three-mesh-bvh spatial query acceleration active.');
  }

  /**
   * Apply BVH acceleration tree to a mesh or model hierarchy
   */
  accelerateHierarchy(rootNode) {
    if (!rootNode) return;
    rootNode.traverse((child) => {
      if (child.isMesh && child.geometry && !child.geometry.boundsTree) {
        try {
          child.geometry.computeBoundsTree();
          this.bvhMeshes.add(child.geometry);
        } catch (e) {
          // Skip meshes with incompatible geometry topologies
        }
      }
    });
  }

  /**
   * Dispose all active BVH trees to free memory
   */
  dispose() {
    this.bvhMeshes.forEach((geo) => {
      if (geo.disposeBoundsTree) geo.disposeBoundsTree();
    });
    this.bvhMeshes.clear();
  }
}
