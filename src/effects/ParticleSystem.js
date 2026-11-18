import * as THREE from 'three';

// High-performance pooled particle system for Nitro boost flames, drift tire smoke, and crash sparks

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;

    this.maxParticles = 600;
    this.particles = [];

    // Shared geometry and materials
    const smokeCanvas = this.createSmokeTexture();
    const smokeTex = new THREE.CanvasTexture(smokeCanvas);

    this.smokeMat = new THREE.PointsMaterial({
      map: smokeTex,
      size: 1.8,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.nitroMat = new THREE.PointsMaterial({
      size: 1.2,
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.sparkMat = new THREE.PointsMaterial({
      size: 0.6,
      color: 0xffaa00,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    // Particle pool BufferGeometries
    this.smokeGeo = new THREE.BufferGeometry();
    this.nitroGeo = new THREE.BufferGeometry();
    this.sparkGeo = new THREE.BufferGeometry();

    this.smokePositions = new Float32Array(this.maxParticles * 3);
    this.nitroPositions = new Float32Array(this.maxParticles * 3);
    this.sparkPositions = new Float32Array(this.maxParticles * 3);

    this.smokeGeo.setAttribute('position', new THREE.BufferAttribute(this.smokePositions, 3));
    this.nitroGeo.setAttribute('position', new THREE.BufferAttribute(this.nitroPositions, 3));
    this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3));

    this.smokeMesh = new THREE.Points(this.smokeGeo, this.smokeMat);
    this.nitroMesh = new THREE.Points(this.nitroGeo, this.nitroMat);
    this.sparkMesh = new THREE.Points(this.sparkGeo, this.sparkMat);

    this.scene.add(this.smokeMesh);
    this.scene.add(this.nitroMesh);
    this.scene.add(this.sparkMesh);

    // Active particle descriptors
    this.activeParticles = [];
  }

  createSmokeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(220, 225, 230, 0.8)');
    grad.addColorStop(0.5, 'rgba(160, 170, 180, 0.3)');
    grad.addColorStop(1, 'rgba(100, 110, 120, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return canvas;
  }

  emitDriftSmoke(pos, count = 2) {
    for (let i = 0; i < count; i++) {
      if (this.activeParticles.length >= this.maxParticles) break;
      this.activeParticles.push({
        type: 'smoke',
        pos: new THREE.Vector3(
          pos.x + (Math.random() - 0.5) * 0.6,
          pos.y + 0.15,
          pos.z + (Math.random() - 0.5) * 0.6
        ),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.8,
          0.8 + Math.random() * 0.8,
          (Math.random() - 0.5) * 0.8
        ),
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2
      });
    }
  }

  emitNitroBoost(pos, dir, count = 3) {
    for (let i = 0; i < count; i++) {
      if (this.activeParticles.length >= this.maxParticles) break;
      this.activeParticles.push({
        type: 'nitro',
        pos: new THREE.Vector3(
          pos.x + (Math.random() - 0.5) * 0.3,
          pos.y + 0.3,
          pos.z + (Math.random() - 0.5) * 0.3
        ),
        vel: new THREE.Vector3(
          -dir.x * (12 + Math.random() * 6),
          (Math.random() - 0.5) * 1.5,
          -dir.z * (12 + Math.random() * 6)
        ),
        life: 0.35,
        maxLife: 0.35
      });
    }
  }

  emitSparks(pos, count = 8) {
    for (let i = 0; i < count; i++) {
      if (this.activeParticles.length >= this.maxParticles) break;
      this.activeParticles.push({
        type: 'spark',
        pos: pos.clone(),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          2 + Math.random() * 5,
          (Math.random() - 0.5) * 8
        ),
        life: 0.45,
        maxLife: 0.45
      });
    }
  }

  update(delta) {
    let smokeIdx = 0;
    let nitroIdx = 0;
    let sparkIdx = 0;

    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.activeParticles.splice(i, 1);
        continue;
      }

      // Physics integration
      p.pos.addScaledVector(p.vel, delta);
      if (p.type === 'spark') {
        p.vel.y -= 18 * delta; // Gravity on sparks
      }

      // Populate attribute arrays
      if (p.type === 'smoke' && smokeIdx < this.maxParticles * 3) {
        this.smokePositions[smokeIdx++] = p.pos.x;
        this.smokePositions[smokeIdx++] = p.pos.y;
        this.smokePositions[smokeIdx++] = p.pos.z;
      } else if (p.type === 'nitro' && nitroIdx < this.maxParticles * 3) {
        this.nitroPositions[nitroIdx++] = p.pos.x;
        this.nitroPositions[nitroIdx++] = p.pos.y;
        this.nitroPositions[nitroIdx++] = p.pos.z;
      } else if (p.type === 'spark' && sparkIdx < this.maxParticles * 3) {
        this.sparkPositions[sparkIdx++] = p.pos.x;
        this.sparkPositions[sparkIdx++] = p.pos.y;
        this.sparkPositions[sparkIdx++] = p.pos.z;
      }
    }

    // Zero out unused entries
    for (let i = smokeIdx; i < this.maxParticles * 3; i++) this.smokePositions[i] = -9999;
    for (let i = nitroIdx; i < this.maxParticles * 3; i++) this.nitroPositions[i] = -9999;
    for (let i = sparkIdx; i < this.maxParticles * 3; i++) this.sparkPositions[i] = -9999;

    this.smokeGeo.attributes.position.needsUpdate = true;
    this.nitroGeo.attributes.position.needsUpdate = true;
    this.sparkGeo.attributes.position.needsUpdate = true;
  }
}

