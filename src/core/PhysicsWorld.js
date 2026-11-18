import * as THREE from 'three';

/**
 * DHAKA CITY GANGSTAR — Rapier 3D Physics World
 * Professional physics engine integration featuring:
 * - Kinematic Capsule Character Controller with Autostep (climbs curbs & stairs)
 * - Ground snapping & slope slide angles
 * - Static cuboid colliders for Dhaka City buildings & road boundaries
 * - Infinite ground plane collision
 * - Live F3 debug wireframe visualizer
 */
export class PhysicsWorld {
  constructor(scene) {
    this.scene = scene;
    this.isReady = false;
    this.debugEnabled = false;

    this.world = null;
    this.RAPIER = null;

    this.characterCollider = null;
    this.characterController = null;
    this.playerBody = null;

    // Capsule geometry: radius 0.38m, half-height 0.55m -> Total height ~1.86m
    this.capsuleRadius = 0.38;
    this.capsuleHalfHeight = 0.55;
    this.capsuleCenterOffset = this.capsuleHalfHeight + this.capsuleRadius; // 0.93m above feet

    this.debugMesh = null;
  }

  async init() {
    try {
      const rapierModule = await import('@dimforge/rapier3d-compat');
      this.RAPIER = rapierModule.default || rapierModule;
      await this.RAPIER.init();

      const gravity = { x: 0.0, y: -24.0, z: 0.0 }; // Authentic responsive game gravity
      this.world = new this.RAPIER.World(gravity);

      // 1. Static Ground Plane Collider (1200m x 1200m)
      const groundDesc = this.RAPIER.RigidBodyDesc.fixed();
      const groundBody = this.world.createRigidBody(groundDesc);
      const groundColliderDesc = this.RAPIER.ColliderDesc.cuboid(600, 1.0, 600);
      groundColliderDesc.setTranslation(0, -1.0, 0); // Top of ground plane is at y = 0
      this.world.createCollider(groundColliderDesc, groundBody);

      // 2. Kinematic Capsule Character Controller for Aslam Bhai
      this.initPlayerController({ x: 0, y: 0, z: 140 });

      // 3. F3 Physics Debug Visualizer
      this.initDebugVisualizer();

      this.isReady = true;
      console.log('[PhysicsWorld] Rapier 3D Physics Engine Initialized.');
    } catch (err) {
      console.warn('[PhysicsWorld] Rapier physics init deferred or unavailable; fallback kinematics active:', err);
    }
  }

  initPlayerController(spawnPos = { x: 0, y: 0, z: 140 }) {
    if (!this.RAPIER || !this.world) return;
    // Kinematic Position-Based RigidBody for responsive game character controls
    const bodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(spawnPos.x, spawnPos.y + this.capsuleCenterOffset, spawnPos.z);
    this.playerBody = this.world.createRigidBody(bodyDesc);

    // Capsule Collider
    const capsuleDesc = this.RAPIER.ColliderDesc.capsule(this.capsuleHalfHeight, this.capsuleRadius);
    this.characterCollider = this.world.createCollider(capsuleDesc, this.playerBody);

    // Kinematic Character Controller with autostep, slope sliding, and ground snapping
    const skinOffset = 0.04;
    this.characterController = this.world.createCharacterController(skinOffset);
    this.characterController.enableAutostep(0.38, 0.20, true); // Climbs curbs up to 0.38m
    this.characterController.enableSnapToGround(0.35); // Snaps to descending stairs/curbs
    this.characterController.setMaxSlopeClimbAngle((45 * Math.PI) / 180);
    this.characterController.setMinSlopeSlideAngle((30 * Math.PI) / 180);
    this.characterController.setSlideEnabled(true);
  }

  // Register Building Static Colliders
  registerBuildingColliders(buildingBoxes) {
    if (!this.isReady || !this.world || !this.RAPIER || !buildingBoxes) return;
    let count = 0;
    buildingBoxes.forEach(box => {
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      if (size.x > 0.2 && size.y > 0.2 && size.z > 0.2) {
        const bodyDesc = this.RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
        const body = this.world.createRigidBody(bodyDesc);
        const colDesc = this.RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2);
        this.world.createCollider(colDesc, body);
        count++;
      }
    });
    console.log(`[PhysicsWorld] Registered ${count} static building colliders.`);
  }

  // Register Roadside Static Colliders (Trees, street lamps, parked cars, benches, utility boxes, bollards)
  registerRoadsideColliders(obstacleBoxes) {
    if (!this.isReady || !this.world || !this.RAPIER || !obstacleBoxes) return;
    let count = 0;
    obstacleBoxes.forEach(box => {
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      if (size.x > 0.1 && size.y > 0.1 && size.z > 0.1) {
        const bodyDesc = this.RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
        const body = this.world.createRigidBody(bodyDesc);
        const colDesc = this.RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2);
        this.world.createCollider(colDesc, body);
        count++;
      }
    });
    console.log(`[PhysicsWorld] Registered ${count} static roadside obstacle colliders.`);
  }

  // Authoritative Character Movement via Rapier Character Controller
  movePlayer(delta, horizontalVelocity, verticalVelocity) {
    if (!this.isReady || !this.characterController || !this.characterCollider || !this.playerBody) {
      return null;
    }

    const currentPos = this.playerBody.translation();

    // Desired translation vector for this physics step
    const translation = new this.RAPIER.Vector3(
      horizontalVelocity.x * delta,
      verticalVelocity * delta,
      horizontalVelocity.z * delta
    );

    // Compute collision resolution against static world
    this.characterController.computeColliderMovement(this.characterCollider, translation);
    const corrected = this.characterController.computedMovement();

    // Target position after collision sliding
    const nextPos = {
      x: currentPos.x + corrected.x,
      y: currentPos.y + corrected.y,
      z: currentPos.z + corrected.z
    };

    // Apply next position to kinematic body
    this.playerBody.setNextKinematicTranslation(nextPos);

    // Check if feet are on ground
    const isGrounded = this.characterController.computedGrounded() || nextPos.y <= this.capsuleCenterOffset + 0.02;

    return {
      // Return feet position (capsule center minus capsuleCenterOffset)
      position: new THREE.Vector3(nextPos.x, Math.max(0, nextPos.y - this.capsuleCenterOffset), nextPos.z),
      isGrounded: isGrounded,
      actualDelta: corrected
    };
  }

  // Teleport player kinematic body directly (for respawns, restarts, and vehicle boarding)
  teleportPlayer(x, y, z) {
    if (!this.isReady || !this.playerBody) return;
    const targetY = y + this.capsuleCenterOffset;
    this.playerBody.setTranslation({ x, y: targetY, z }, true);
  }

  // Raycast downward to detect ground, curb, or obstacle surface elevation
  raycastGround(x, z, startY = 3.0, maxDist = 6.0) {
    if (!this.isReady || !this.world || !this.RAPIER) return 0;
    try {
      const ray = new this.RAPIER.Ray({ x, y: startY, z }, { x: 0, y: -1, z });
      const hit = this.world.castRay(ray, maxDist, true, undefined, undefined, this.characterCollider);
      if (hit && hit.timeOfImpact !== undefined) {
        return Math.max(0, startY - hit.timeOfImpact);
      }
    } catch (e) {
      // Fallback to ground plane
    }
    return 0;
  }

  // Check if overhead space is blocked (prevents standing under low obstacles)
  checkOverhead(x, y, z, maxHeight = 1.85) {
    if (!this.isReady || !this.world || !this.RAPIER) return false;
    try {
      const startY = y + 0.5;
      const checkDist = maxHeight - 0.5;
      const ray = new this.RAPIER.Ray({ x, y: startY, z }, { x: 0, y: 1, z });
      const hit = this.world.castRay(ray, checkDist, true, undefined, undefined, this.characterCollider);
      return !!hit && hit.timeOfImpact < checkDist;
    } catch (e) {
      return false;
    }
  }

  // Detect forward low obstacles (height 0.25m - 1.1m) for vaulting/climbing
  checkForwardObstacle(x, y, z, fwdX, fwdZ, maxDist = 1.3) {
    if (!this.isReady || !this.world || !this.RAPIER) return false;
    try {
      const dirLen = Math.hypot(fwdX, fwdZ);
      if (dirLen < 0.001) return false;
      const nx = fwdX / dirLen;
      const nz = fwdZ / dirLen;

      // Low ray at waist height (0.4m)
      const lowRay = new this.RAPIER.Ray({ x, y: y + 0.4, z }, { x: nx, y: 0, z: nz });
      const lowHit = this.world.castRay(lowRay, maxDist, true, undefined, undefined, this.characterCollider);

      if (lowHit && lowHit.timeOfImpact <= maxDist) {
        // High ray at headroom height (1.6m) to verify head clearance
        const highRay = new this.RAPIER.Ray({ x, y: y + 1.6, z }, { x: nx, y: 0, z: nz });
        const highHit = this.world.castRay(highRay, maxDist, true, undefined, undefined, this.characterCollider);
        // If low is blocked but high is clear, obstacle is vaultable
        return !highHit || highHit.timeOfImpact > lowHit.timeOfImpact + 0.5;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  isPlayerGrounded() {
    if (!this.isReady || !this.characterController) return true;
    return this.characterController.computedGrounded();
  }

  initDebugVisualizer() {
    const debugMat = new THREE.LineBasicMaterial({ color: 0x00ff88, vertexColors: true });
    this.debugGeo = new THREE.BufferGeometry();
    this.debugMesh = new THREE.LineSegments(this.debugGeo, debugMat);
    this.debugMesh.visible = false;
    this.scene.add(this.debugMesh);
  }

  toggleDebug() {
    this.debugEnabled = !this.debugEnabled;
    if (this.debugMesh) {
      this.debugMesh.visible = this.debugEnabled;
    }
    return this.debugEnabled;
  }

  step(delta) {
    if (!this.isReady || !this.world) return;

    // Step physics world simulation
    this.world.step();

    // Render debug wireframes if F3 is enabled
    if (this.debugEnabled && this.debugMesh) {
      const { vertices, colors } = this.world.debugRender();
      this.debugGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      this.debugGeo.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    }
  }
}
