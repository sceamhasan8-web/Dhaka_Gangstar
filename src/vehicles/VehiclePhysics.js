import * as THREE from 'three';

export class VehiclePhysics {
  constructor(mesh, type, world, audioManager) {
    this.mesh = mesh;
    this.type = type;
    this.world = world;
    this.audioManager = audioManager;

    this.position = new THREE.Vector3().copy(mesh.position);
    this.velocity = 0; // Forward velocity in m/s
    this.rotationY = mesh.rotation.y;
    this.steerAngle = 0;
    this.lateralDrift = 0;

    // Vehicle specific physics profiles
    const profiles = {
      cng: { maxSpeed: 22, accel: 14, brake: 22, reverseMax: -8, turnRate: 2.2, mass: 650, tilt: 0.12 },
      rickshaw: { maxSpeed: 10, accel: 6, brake: 16, reverseMax: -4, turnRate: 2.6, mass: 120, tilt: 0.05 },
      bus: { maxSpeed: 20, accel: 7, brake: 12, reverseMax: -6, turnRate: 1.1, mass: 9000, tilt: 0.08 },
      sedan: { maxSpeed: 38, accel: 19, brake: 28, reverseMax: -12, turnRate: 2.0, mass: 1400, tilt: 0.06 },
      bike: { maxSpeed: 34, accel: 22, brake: 26, reverseMax: -6, turnRate: 2.8, mass: 180, tilt: 0.35 },
      police: { maxSpeed: 42, accel: 24, brake: 32, reverseMax: -14, turnRate: 2.2, mass: 1800, tilt: 0.07 }
    };

    this.profile = profiles[type] || profiles.cng;

    this.isBraking = false;
    this.isDrifting = false;
    this.headlightsOn = true;

    // Siren timer for police
    this.sirenFlashTime = 0;
  }

  update(delta, forwardInput, turnInput, handbrake) {
    const p = this.profile;

    // 1. Acceleration / Braking
    if (forwardInput > 0) {
      if (this.velocity < 0) {
        // Braking while in reverse
        this.velocity += p.brake * delta;
      } else {
        this.velocity += p.accel * forwardInput * delta;
        if (this.velocity > p.maxSpeed) this.velocity = p.maxSpeed;
      }
    } else if (forwardInput < 0) {
      if (this.velocity > 0) {
        // Braking while going forward
        this.velocity -= p.brake * delta;
      } else {
        // Reverse
        this.velocity -= (p.accel * 0.6) * delta;
        if (this.velocity < p.reverseMax) this.velocity = p.reverseMax;
      }
    } else {
      // Natural rolling resistance friction
      if (this.velocity > 0) {
        this.velocity = Math.max(0, this.velocity - 6.0 * delta);
      } else if (this.velocity < 0) {
        this.velocity = Math.min(0, this.velocity + 6.0 * delta);
      }
    }

    // Handbrake / Drift
    if (handbrake) {
      this.isBraking = true;
      if (this.velocity > 0) {
        this.velocity = Math.max(0, this.velocity - (p.brake * 1.5) * delta);
      }
      if (Math.abs(this.velocity) > 12 && Math.abs(turnInput) > 0.3) {
        this.isDrifting = true;
        this.audioManager.playTireDrift();
      } else {
        this.isDrifting = false;
      }
    } else {
      this.isBraking = false;
      this.isDrifting = false;
    }

    // 2. Steering & Turning (positive turnInput steers right, negative steers left)
    if (Math.abs(this.velocity) > 0.1) {
      const speedFactor = Math.min(1.0, Math.abs(this.velocity) / (p.maxSpeed * 0.6));
      const steerAmount = turnInput * p.turnRate * delta * (this.velocity >= 0 ? 1 : -1) * speedFactor;
      this.rotationY -= steerAmount;
    }

    // 3. Movement vector and Collision Detection
    const moveVector = new THREE.Vector3(
      Math.sin(this.rotationY) * this.velocity * delta,
      0,
      Math.cos(this.rotationY) * this.velocity * delta
    );

    const proposedPos = this.position.clone().add(moveVector);

    // Collision against buildings and road borders
    const colRadius = this.type === 'bus' ? 2.5 : 1.4;
    if (!this.world.checkCollision(proposedPos, colRadius)) {
      this.position.copy(proposedPos);
    } else {
      // Crash impact!
      if (Math.abs(this.velocity) > 4) {
        this.audioManager.playCrashSound(Math.min(1, Math.abs(this.velocity) / 20));
      }
      this.velocity = -this.velocity * 0.3; // Bounce back
    }

    // Ground level clamp
    this.position.y = 0;

    // 4. Update 3D Mesh Transform
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY;

    // Dynamic Body Tilt on sharp turns (leaning into turns)
    const turnTilt = -turnInput * (Math.abs(this.velocity) / p.maxSpeed) * p.tilt;
    this.mesh.rotation.z = turnTilt;

    // Subtle pitch on acceleration/braking
    const pitch = (this.isBraking ? 0.04 : (forwardInput > 0 ? -0.02 : 0));
    this.mesh.rotation.x = pitch;

    // 5. Spin wheels
    if (this.mesh.userData && this.mesh.userData.wheels) {
      const wheelCircumference = 0.5 * Math.PI;
      const spinAngle = (this.velocity * delta) / wheelCircumference;
      this.mesh.userData.wheels.forEach(w => {
        w.rotation.x += spinAngle;
      });
    }

    // 6. Police flashing lightbars
    if (this.type === 'police' && this.mesh.userData.redLight) {
      this.sirenFlashTime += delta * 10;
      const redOn = Math.sin(this.sirenFlashTime) > 0;
      this.mesh.userData.redLight.intensity = redOn ? 2.5 : 0;
      this.mesh.userData.blueLight.intensity = redOn ? 0 : 2.5;
    }

    // 7. Update Engine Sound Audio
    const speedRatio = Math.abs(this.velocity) / p.maxSpeed;
    this.audioManager.updateVehicleEngine(speedRatio, forwardInput !== 0);
  }

  toggleHeadlights() {
    this.headlightsOn = !this.headlightsOn;
    if (this.mesh.userData && this.mesh.userData.headlightSpot) {
      this.mesh.userData.headlightSpot.visible = this.headlightsOn;
    }
    return this.headlightsOn;
  }

  resetVehicle() {
    this.position.y = 1.0;
    this.mesh.rotation.set(0, this.rotationY, 0);
    this.velocity = 0;
  }

  getSpeedKmh() {
    return Math.round(Math.abs(this.velocity) * 3.6);
  }
}

