import * as THREE from 'three';
import { CharacterModel } from './CharacterModel.js';

/**
 * DHAKA CITY GANGSTAR — Advanced Realistic Physics-Driven Character Controller
 * Features:
 * - Authoritative Rapier 3D Kinematic Character Controller integration
 * - Realistic physical momentum, acceleration & deceleration
 * - Smooth shortest-path angular rotation & turning angular velocity
 * - Directional 2D locomotion blending (Forward, Backward, Strafing, Sprint)
 * - Airborne ballistic physics, air control multiplier & landing impact absorption
 * - Foot Placement & Ground Alignment Inverse Kinematics (detects curbs and elevation)
 * - Procedural turn banking and acceleration pitch
 * - Audio-synchronized footstep cadence with speed-ratio tracking
 * - Complete vehicle boarding & driving transitions
 */
export class PlayerController {
  constructor(scene, audioManager, world, physics) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.world = world;
    this.physics = physics;

    // Load Character Model (Dual-pipeline: Instant Procedural + GLTF Skeletal Rig)
    this.model = new CharacterModel(scene, {
      jacketColor: 0x1f2937,
      jeansColor: 0x334155,
      scale: 1.05
    });

    // Initial spawn location (Kazi Nazrul Islam Ave, Farmgate / Hatirjheel loop)
    this.position = new THREE.Vector3(0, 0, 140);
    this.velocity = new THREE.Vector3();
    this.currentHorizVelocity = new THREE.Vector3();
    this.rotationY = 0;
    this.angularVelocity = 0;

    // Speeds in m/s
    this.crouchSpeed = 2.4;
    this.walkSpeed = 4.5;
    this.jogSpeed = 7.2;
    this.runSpeed = 9.5;
    this.sprintSpeed = 13.0;
    this.jumpForce = 8.5;
    this.gravity = -24.0;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.wasGrounded = true;

    // Crouch & Vaulting States
    this.isCrouched = false;
    this.nearVaultableObstacle = false;
    this.vaultCooldown = 0;

    // Acceleration & Inertia tuning
    this.accelerationRate = 14.0; // m/s^2 ramping up
    this.decelerationRate = 18.0; // m/s^2 friction braking
    this.airControl = 0.35;        // reduced steering influence while airborne

    this.health = 100;
    this.stamina = 100;
    this.wantedLevel = 0;
    this.money = 15000;

    this.isInVehicle = false;
    this.currentVehicle = null;

    this.footstepTimer = 0;
    this.landTimer = 0;
    this.currentAnimState = 'idle';

    // Foot IK telemetry
    this.leftFootGroundY = 0;
    this.rightFootGroundY = 0;

    // Sync initial model position
    this.model.group.position.copy(this.position);
  }

  update(delta, input, cameraAngleY) {
    if (this.isInVehicle) {
      if (this.currentVehicle) {
        this.position.copy(this.currentVehicle.position);
        this.model.group.position.copy(this.currentVehicle.position);
        this.model.group.position.y += 0.2;
        this.model.group.rotation.y = this.currentVehicle.rotationY;
        this.currentAnimState = 'driving';
        this.model.playAnimation('driving', 0.2);
        this.model.update(delta, false, 0, true, true);
      }
      return;
    }

    const { forward, turn, isRunning, isJumping, isCrouched, isVaulting, locomotionMode } = input.getMovement();
    const isMoving = Math.abs(forward) > 0.05 || Math.abs(turn) > 0.05;

    // 0. Crouch & Stand Overhead Clearance Check
    if (this.isCrouched && !isCrouched) {
      if (this.checkOverheadBlocked()) {
        input.isCrouched = true; // Blocked overhead, force crouch posture
      } else {
        this.isCrouched = false;
      }
    } else {
      this.isCrouched = !!isCrouched;
    }

    // Forward Obstacle Vault Check & Trigger
    if (this.vaultCooldown > 0) this.vaultCooldown -= delta;
    this.nearVaultableObstacle = this.checkForwardVaultObstacle();

    if (isVaulting && this.nearVaultableObstacle && this.vaultCooldown <= 0) {
      this.verticalVelocity = 5.2; // Vault leap upward
      this.isGrounded = false;
      this.vaultCooldown = 0.8;
      const fwdX = Math.sin(this.rotationY);
      const fwdZ = Math.cos(this.rotationY);
      this.currentHorizVelocity.x = fwdX * 5.0;
      this.currentHorizVelocity.z = fwdZ * 5.0;
      if (this.audioManager) this.audioManager.playJumpSound();
    }

    // 1. Stamina & Speed Mode Computation
    let targetSpeed = this.walkSpeed;
    let targetAnim = 'idle';

    if (this.isCrouched) {
      targetSpeed = this.crouchSpeed;
      targetAnim = isMoving ? 'crouch_walk' : 'crouch_idle';
      this.stamina = Math.min(100, this.stamina + delta * 12);
    } else if (isMoving) {
      if (isRunning && this.stamina > 5) {
        targetSpeed = this.stamina > 30 ? this.sprintSpeed : this.runSpeed;
        targetAnim = this.stamina > 30 ? 'sprint' : 'run';
        this.stamina = Math.max(0, this.stamina - delta * 18);
      } else {
        targetSpeed = this.walkSpeed;
        targetAnim = 'walk';
        this.stamina = Math.min(100, this.stamina + delta * 14);
      }
    } else {
      this.stamina = Math.min(100, this.stamina + delta * 20);
    }

    // 2. Camera-Relative Screen-Direction Movement Math
    // Horizontal camera line-of-sight forward and right unit vectors
    // Note: In Three.js right-handed coordinates, when looking along +Z, camera right is (-1, 0, 0)
    const camForward = new THREE.Vector3(Math.sin(cameraAngleY), 0, Math.cos(cameraAngleY)).normalize();
    const camRight = new THREE.Vector3(-Math.cos(cameraAngleY), 0, Math.sin(cameraAngleY)).normalize();

    const targetMoveDir = new THREE.Vector3();
    if (isMoving) {
      targetMoveDir.addScaledVector(camForward, forward);
      targetMoveDir.addScaledVector(camRight, turn);
      if (targetMoveDir.lengthSq() > 0.0001) {
        targetMoveDir.normalize();
      }
    }

    if (locomotionMode === 'strafe') {
      // Mode B: Strafe Mode (PUBG/Free Fire combat orientation) - Always face camera line-of-sight
      const diff = Math.atan2(Math.sin(cameraAngleY - this.rotationY), Math.cos(cameraAngleY - this.rotationY));
      const turnStep = diff * Math.min(1.0, delta * 15.0);
      this.rotationY += turnStep;
      this.angularVelocity = turnStep / Math.max(0.001, delta);

      if (isMoving && !this.isCrouched) {
        if (forward < -0.35 && Math.abs(turn) < 0.6) {
          targetAnim = 'backward';
        } else if (turn > 0.35 && Math.abs(forward) < 0.6) {
          targetAnim = 'strafe_right';
        } else if (turn < -0.35 && Math.abs(forward) < 0.6) {
          targetAnim = 'strafe_left';
        }
      }
    } else {
      // Mode A: Movement-Facing (Default) - Character rotates smoothly to face targetMoveDir
      if (isMoving) {
        const moveAngle = Math.atan2(targetMoveDir.x, targetMoveDir.z);
        const diff = Math.atan2(Math.sin(moveAngle - this.rotationY), Math.cos(moveAngle - this.rotationY));
        const turnStep = diff * Math.min(1.0, delta * 13.0);
        this.rotationY += turnStep;
        this.angularVelocity = turnStep / Math.max(0.001, delta);
      } else {
        this.angularVelocity = THREE.MathUtils.lerp(this.angularVelocity, 0, delta * 8.0);
      }
    }

    // 3. Physical Momentum: Smooth Acceleration & Deceleration
    const targetHorizVel = targetMoveDir.clone().multiplyScalar(isMoving ? targetSpeed : 0);
    const accelRate = isMoving ? this.accelerationRate : this.decelerationRate;
    const effectiveRate = this.isGrounded ? accelRate : accelRate * this.airControl;

    this.currentHorizVelocity.lerp(targetHorizVel, Math.min(1.0, delta * effectiveRate));
    this.velocity.x = this.currentHorizVelocity.x;
    this.velocity.z = this.currentHorizVelocity.z;

    const currentHorizSpeed = Math.hypot(this.velocity.x, this.velocity.z);

    // 4. Jumping & Airborne Gravity State Machine
    if (this.isGrounded) {
      if (isJumping && this.stamina > 10 && this.landTimer <= 0) {
        this.verticalVelocity = this.jumpForce;
        this.isGrounded = false;
        this.stamina -= 10;
        targetAnim = 'jump';
        if (this.audioManager) {
          this.audioManager.playJumpSound();
          if (this.audioManager.voiceEvents) this.audioManager.voiceEvents.triggerPlayerJump(this.isFemale);
        }
      } else {
        this.verticalVelocity = -1.0; // slight downward bias for continuous slope adherence
      }
    } else {
      this.verticalVelocity += this.gravity * delta;
      targetAnim = this.verticalVelocity < -1.5 ? 'fall' : 'jump';
    }

    // Landing impact detection
    if (!this.wasGrounded && this.isGrounded) {
      this.landTimer = 0.22; // brief impact absorption
      targetAnim = 'land';
      if (this.audioManager) {
        const surface = this.audioManager.character ? this.audioManager.character.detectSurface(this.position) : 'concrete';
        this.audioManager.playLandSound(Math.abs(this.verticalVelocity || 5), surface);
        if (this.audioManager.voiceEvents) this.audioManager.voiceEvents.triggerPlayerLand(this.isFemale, Math.abs(this.verticalVelocity || 5));
      }
    }
    this.wasGrounded = this.isGrounded;

    if (this.landTimer > 0) {
      this.landTimer -= delta;
      if (currentHorizSpeed < 0.5) targetAnim = 'land';
    }

    // If standing still and grounded, default to idle
    if (this.isGrounded && this.landTimer <= 0 && currentHorizSpeed < 0.15) {
      targetAnim = 'idle';
    }

    this.currentAnimState = targetAnim;

    // 5. Authoritative Physics Movement via Rapier 3D Kinematic Character Controller
    const horizontalStep = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
    let movedViaPhysics = false;

    if (this.physics && this.physics.isReady) {
      const result = this.physics.movePlayer(delta, horizontalStep, this.verticalVelocity);
      if (result) {
        this.position.copy(result.position);
        this.isGrounded = result.isGrounded;
        if (this.isGrounded && this.verticalVelocity < 0) {
          this.verticalVelocity = -1.0;
        }
        movedViaPhysics = true;
      }
    }

    // High-Precision Substep Collision Resolution with Smooth Wall-Sliding
    if (!movedViaPhysics) {
      const deltaX = this.velocity.x * delta;
      const deltaZ = this.velocity.z * delta;

      // Small substeps prevent fast sprint movement from tunneling through walls
      const steps = Math.max(1, Math.ceil(Math.max(Math.abs(deltaX), Math.abs(deltaZ)) / 0.18));
      const stepX = deltaX / steps;
      const stepZ = deltaZ / steps;

      for (let i = 0; i < steps; i++) {
        const tryX = this.position.x + stepX;
        if (!this.world.checkCollision({ x: tryX, y: this.position.y, z: this.position.z }, 0.58)) {
          this.position.x = tryX;
        }
        const tryZ = this.position.z + stepZ;
        if (!this.world.checkCollision({ x: this.position.x, y: this.position.y, z: tryZ }, 0.58)) {
          this.position.z = tryZ;
        }
      }

      this.position.y += this.verticalVelocity * delta;
      if (this.position.y <= 0) {
        this.position.y = 0;
        this.isGrounded = true;
        this.verticalVelocity = 0;
      } else {
        this.isGrounded = false;
      }
    }

    // 6. Foot Placement & Ground Alignment Inverse Kinematics
    if (this.isGrounded && this.physics && this.physics.raycastGround) {
      // Calculate world coordinates for left and right feet (shoulder width 0.18m)
      const perpX = Math.cos(this.rotationY) * 0.18;
      const perpZ = -Math.sin(this.rotationY) * 0.18;

      const leftX = this.position.x - perpX;
      const leftZ = this.position.z - perpZ;
      const rightX = this.position.x + perpX;
      const rightZ = this.position.z + perpZ;

      this.leftFootGroundY = this.physics.raycastGround(leftX, leftZ, this.position.y + 1.5, 4.0);
      this.rightFootGroundY = this.physics.raycastGround(rightX, rightZ, this.position.y + 1.5, 4.0);

      this.model.applyFootPlacementIK(delta, this.leftFootGroundY, this.rightFootGroundY, this.position.y);
    } else {
      // While airborne or without ground raycast, smoothly reset foot IK offsets
      this.model.applyFootPlacementIK(delta, this.position.y, this.position.y, this.position.y);
    }

    // 7. Procedural Body Response (Turn Banking & Acceleration Pitch)
    const accelMag = isMoving ? this.accelerationRate : -this.decelerationRate;
    this.model.applyProceduralBodyResponse(delta, this.angularVelocity, currentHorizSpeed, accelMag);

    // 8. Update Model Transform
    this.model.group.position.copy(this.position);
    if (this.isCrouched) {
      this.model.group.position.y -= 0.28;
    }
    this.model.group.rotation.y = this.rotationY;

    // 9. Drive Animation Machine with Velocity Scaling
    this.model.playAnimation(targetAnim, 0.18);
    this.model.updateMovementSpeed(currentHorizSpeed);
    this.model.update(delta, isMoving, currentHorizSpeed, this.isGrounded, false, this.isCrouched, targetAnim);

    // 10. Footstep Audio with Speed-Synchronized Cadence & Surface Detection
    if (this.isGrounded && currentHorizSpeed > 0.3) {
      const isRunning = currentHorizSpeed > this.walkSpeed * 1.25;
      const cadenceFactor = THREE.MathUtils.clamp(currentHorizSpeed / this.walkSpeed, 0.8, 2.0);
      this.footstepTimer += delta * cadenceFactor;
      if (this.footstepTimer > 0.42) {
        this.footstepTimer = 0;
        if (this.audioManager) {
          const surface = this.audioManager.character ? this.audioManager.character.detectSurface(this.position) : 'concrete';
          this.audioManager.playFootstep({
            surface,
            isRunning
          });
        }
      }
    } else {
      this.footstepTimer = 0.35; // Ready to step immediately on move start
    }
  }

  enterVehicle(vehicle) {
    this.isInVehicle = true;
    this.currentVehicle = vehicle;
    this.velocity.set(0, 0, 0);
    this.currentHorizVelocity.set(0, 0, 0);
    this.verticalVelocity = 0;
    if (this.audioManager && this.audioManager.voiceEvents) {
      this.audioManager.voiceEvents.triggerPlayerEnterVehicle(this.isFemale);
    }
  }

  exitVehicle() {
    if (!this.isInVehicle) return;
    const v = this.currentVehicle;
    this.isInVehicle = false;
    this.currentVehicle = null;
    if (v) {
      // Step out to the side of the vehicle
      const exitOffset = new THREE.Vector3(1.8, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.rotationY);
      this.position.copy(v.position).add(exitOffset);
      this.position.y = 0;
      this.model.group.position.copy(this.position);
      if (this.physics) {
        this.physics.teleportPlayer(this.position.x, this.position.y, this.position.z);
      }
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this.health <= 0;
  }

  heal(amount) {
    this.health = Math.min(100, this.health + amount);
  }

  checkOverheadBlocked() {
    if (this.physics && this.physics.isReady && this.physics.checkOverhead) {
      return this.physics.checkOverhead(this.position.x, this.position.y, this.position.z, 1.85);
    }
    return false;
  }

  checkForwardVaultObstacle() {
    const fwdX = Math.sin(this.rotationY);
    const fwdZ = Math.cos(this.rotationY);
    if (this.physics && this.physics.isReady && this.physics.checkForwardObstacle) {
      return this.physics.checkForwardObstacle(this.position.x, this.position.y, this.position.z, fwdX, fwdZ, 1.3);
    }
    if (this.world && this.world.checkCollision) {
      const probe = new THREE.Vector3(this.position.x + fwdX * 0.9, this.position.y + 0.4, this.position.z + fwdZ * 0.9);
      return this.world.checkCollision(probe, 0.5);
    }
    return false;
  }

  /**
   * Telemetry export for Developer Debug HUD
   */
  getDebugTelemetry() {
    return {
      speed: Math.hypot(this.velocity.x, this.velocity.z).toFixed(2),
      vx: this.velocity.x.toFixed(2),
      vy: this.velocity.y.toFixed(2),
      vz: this.velocity.z.toFixed(2),
      isGrounded: this.isGrounded,
      animState: this.currentAnimState,
      rotationY: (this.rotationY * (180 / Math.PI)).toFixed(1),
      leftFootY: this.leftFootGroundY.toFixed(2),
      rightFootY: this.rightFootGroundY.toFixed(2),
      angularVelocity: this.angularVelocity.toFixed(2)
    };
  }
}
