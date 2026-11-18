import * as THREE from 'three';

/**
 * DHAKA CITY GANGSTAR — Professional 360-Degree Third-Person Orbit & Sky Camera
 * Features:
 * - Unlimited continuous 360-degree horizontal yaw rotation (never locks or snaps).
 * - Full vertical viewing range (-72° downward to +86° straight upward into the sky).
 * - Positive pitch = looking upward toward the sky, clouds, and sun.
 * - Negative pitch = looking downward toward the ground, streets, and vehicles.
 * - Ground clearance protection: prevents camera from clipping underground when looking straight up.
 * - Real-time Obstacle & Building Collision Detection: smoothly springs in to prevent
 *   clipping inside walls, and restores desired distance when unobstructed.
 * - Jitter-free smoothed target tracking.
 * - Multiple camera modes (Normal, Close, Far, First-Person, Cinematic).
 */
export class CameraController {
  constructor(camera) {
    this.camera = camera;

    this.modes = ['third_person', 'third_person_close', 'third_person_far', 'first_person', 'cinematic'];
    this.modeIndex = 0;

    // Free continuous horizontal yaw and vertical pitch
    this.yaw = 0.0;
    this.pitch = 0.18; // Comfortable forward viewing tilt

    // Full vertical viewing angles
    // 0 rad = horizontal, positive = looking UP at sky, negative = looking DOWN at ground
    this.minPitch = -1.25; // -71.6° looking downward
    this.maxPitch = 1.50;  // +85.9° looking almost vertically upward into the zenith
    this.pitchSensitivity = 0.0030;
    this.yawSensitivity = 0.0032;

    // Target positions & smoothing
    this.targetPos = new THREE.Vector3(0, 1.45, 140);
    this.currentCamPos = new THREE.Vector3(0, 2.5, 134.8);
    this.currentLookAt = new THREE.Vector3(0, 1.45, 140);

    // Dynamic distance tracking for collision resolution
    this.baseDist = 5.2;
    this.currentDist = 5.2;

    // Static building colliders for camera occlusion raycast
    this.buildingBoxes = [];
    this._ray = new THREE.Ray();
    this._hitPoint = new THREE.Vector3();
  }

  setBuildingColliders(boxes) {
    this.buildingBoxes = Array.isArray(boxes) ? boxes : [];
  }

  cycleCameraMode() {
    this.modeIndex = (this.modeIndex + 1) % this.modes.length;
    return this.modes[this.modeIndex];
  }

  handleMouseDelta(dx, dy) {
    // 1. Free 360 horizontal rotation (infinite continuous yaw)
    this.yaw -= dx * this.yawSensitivity;

    // 2. Vertical pitch:
    // Drag upward (dy < 0) -> pitch increases -> look UP toward sky
    // Drag downward (dy > 0) -> pitch decreases -> look DOWN toward ground
    this.pitch -= dy * this.pitchSensitivity;

    // 3. Clamp pitch between minPitch (-71.6°) and maxPitch (+85.9°)
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
  }

  update(delta, targetTransform, isVehicle = false) {
    const mode = this.modes[this.modeIndex];

    // Smoothly track target center (chest/head height on-foot, car roof in-vehicle)
    const desiredTargetY = targetTransform.position.y + (isVehicle ? 1.2 : 1.45);
    const desiredTarget = new THREE.Vector3(
      targetTransform.position.x,
      desiredTargetY,
      targetTransform.position.z
    );
    this.targetPos.lerp(desiredTarget, Math.min(1, delta * 25));

    // ── Mode 1: Cinematic Orbit ───────────────────────────────────────────────
    if (mode === 'cinematic') {
      this.yaw += delta * 0.35;
      const dist = isVehicle ? 11.0 : 6.8;
      const camX = this.targetPos.x + Math.sin(this.yaw) * dist;
      const camZ = this.targetPos.z + Math.cos(this.yaw) * dist;
      const camY = this.targetPos.y + (isVehicle ? 3.8 : 2.4);

      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(this.targetPos);
      return;
    }

    // ── Mode 2: First-Person ──────────────────────────────────────────────────
    if (mode === 'first_person') {
      const eyeOffset = new THREE.Vector3(0, isVehicle ? 0.8 : 0.35, isVehicle ? 1.2 : 0.1);
      eyeOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), targetTransform.rotationY || 0);

      const eyePos = this.targetPos.clone().add(eyeOffset);
      this.camera.position.copy(eyePos);

      // Forward line-of-sight based on (yaw, pitch)
      const lookDir = new THREE.Vector3(
        Math.sin(this.yaw) * Math.cos(this.pitch),
        Math.sin(this.pitch),
        Math.cos(this.yaw) * Math.cos(this.pitch)
      );
      const lookTarget = eyePos.clone().add(lookDir.multiplyScalar(50.0));
      this.camera.lookAt(lookTarget);
      return;
    }

    // ── Mode 3: Third-Person Variants (Normal, Close, Far) ───────────────────
    let baseDist = isVehicle ? 8.5 : 5.2;

    if (mode === 'third_person_close') {
      baseDist *= 0.65;
    } else if (mode === 'third_person_far') {
      baseDist *= 1.45;
    }

    this.baseDist = baseDist;

    // 1. Compute Unit View Direction Vector based on yaw and pitch
    // pitch > 0: looking UP toward the sky
    // pitch < 0: looking DOWN toward the ground
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);

    const fwdX = Math.sin(this.yaw) * cosPitch;
    const fwdY = sinPitch;
    const fwdZ = Math.cos(this.yaw) * cosPitch;
    const forwardDir = new THREE.Vector3(fwdX, fwdY, fwdZ).normalize();

    // Horizontal right vector for over-the-shoulder framing
    const rightDir = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();

    // 2. Camera Pivot Point (Over-the-shoulder offset on-foot)
    const shoulderOffset = rightDir.clone().multiplyScalar(isVehicle ? 0 : 0.35);
    shoulderOffset.y += isVehicle ? 0.2 : 0.12;
    const pivot = this.targetPos.clone().add(shoulderOffset);

    // 3. Camera Collision Detection (Raycast from pivot backward to camera)
    let resolvedDist = this.baseDist;
    const backwardRayDir = forwardDir.clone().negate();

    if (this.buildingBoxes.length > 0) {
      this._ray.origin.copy(pivot);
      this._ray.direction.copy(backwardRayDir);

      const checkDist = this.baseDist + 0.4;
      for (let i = 0; i < this.buildingBoxes.length; i++) {
        const box = this.buildingBoxes[i];
        if (box.distanceToPoint(pivot) > checkDist + 10) continue;

        if (this._ray.intersectBox(box, this._hitPoint)) {
          const hitDist = pivot.distanceTo(this._hitPoint);
          if (hitDist < resolvedDist) {
            resolvedDist = Math.max(1.2, hitDist - 0.35);
          }
        }
      }
    }

    // Smooth spring arm interpolation
    this.currentDist = THREE.MathUtils.lerp(
      this.currentDist,
      resolvedDist,
      Math.min(1, delta * (resolvedDist < this.currentDist ? 22 : 12))
    );

    // 4. Ideal Camera Position (behind pivot along backwardRayDir)
    const desiredCamPos = pivot.clone().addScaledVector(backwardRayDir, this.currentDist);

    // 5. Ground Clearance Protection:
    // When looking straight up, the camera position lowers behind the character.
    // Ensure the camera never sinks underground below the terrain surface.
    const groundMinY = (targetTransform.position.y || 0) + 0.35;
    if (desiredCamPos.y < groundMinY) {
      desiredCamPos.y = groundMinY;
    }

    // 6. Smooth Camera Position Tracking
    this.currentCamPos.lerp(desiredCamPos, Math.min(1, delta * 24));
    this.camera.position.copy(this.currentCamPos);

    // 7. Look-At Target (aiming along forwardDir into the distance)
    const targetLook = this.currentCamPos.clone().addScaledVector(forwardDir, 60.0);
    this.currentLookAt.lerp(targetLook, Math.min(1, delta * 25));
    this.camera.lookAt(this.currentLookAt);
  }

  /**
   * Telemetry export for Developer Debug HUD & verification
   */
  getDebugTelemetry() {
    return {
      yawDeg: (this.yaw * (180 / Math.PI)).toFixed(1),
      pitchDeg: (this.pitch * (180 / Math.PI)).toFixed(1),
      maxUpwardDeg: (this.maxPitch * (180 / Math.PI)).toFixed(1),
      maxDownwardDeg: (this.minPitch * (180 / Math.PI)).toFixed(1),
      posX: this.camera.position.x.toFixed(2),
      posY: this.camera.position.y.toFixed(2),
      posZ: this.camera.position.z.toFixed(2),
      targetX: this.currentLookAt.x.toFixed(2),
      targetY: this.currentLookAt.y.toFixed(2),
      targetZ: this.currentLookAt.z.toFixed(2),
      distance: this.currentDist.toFixed(2),
      mode: this.modes[this.modeIndex]
    };
  }
}
