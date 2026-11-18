import * as THREE from 'three';
import { VehicleModels } from './VehicleModels.js';

export class PoliceAI {
  constructor(scene, roadNetwork, audioManager) {
    this.scene = scene;
    this.roadNetwork = roadNetwork;
    this.audioManager = audioManager;

    this.policeCruisers = [];
    this.wantedLevel = 0;
    this.evasionTimer = 0;
    this.flashTimer = 0;
  }

  setWantedLevel(level) {
    const oldLevel = this.wantedLevel;
    this.wantedLevel = Math.max(0, Math.min(5, level));

    if (this.wantedLevel > 0 && oldLevel === 0) {
      this.audioManager.togglePoliceSiren(true);
      if (this.audioManager && this.audioManager.voiceEvents) {
        this.audioManager.voiceEvents.triggerPoliceAlert();
      }
      this.spawnCruiser();
    } else if (this.wantedLevel === 0) {
      this.audioManager.togglePoliceSiren(false);
      if (oldLevel > 0 && this.audioManager && this.audioManager.voiceEvents) {
        this.audioManager.voiceEvents.triggerPoliceStandDown();
      }
      this.despawnCruisers();
    }

    if (this.wantedLevel >= 3 && this.policeCruisers.length < 2) {
      this.spawnCruiser();
    }
  }

  spawnCruiser() {
    const mesh = VehicleModels.createPolice();
    const spawnNode = this.roadNetwork.nodes[Math.floor(Math.random() * this.roadNetwork.nodes.length)];
    mesh.position.copy(spawnNode.pos);
    mesh.position.y = 0;
    this.scene.add(mesh);

    this.policeCruisers.push({
      mesh,
      speed: 26, // Fast intercept speed
      velocity: 0,
      rotationY: 0,
      target: new THREE.Vector3(),
      sirenFlash: 0
    });
  }

  despawnCruisers() {
    this.policeCruisers.forEach(c => {
      this.scene.remove(c.mesh);
    });
    this.policeCruisers = [];
  }

  update(delta, playerPos, playerInVehicle) {
    if (this.wantedLevel === 0) return;

    let closestDist = Infinity;

    this.policeCruisers.forEach(c => {
      const distToPlayer = c.mesh.position.distanceTo(playerPos);
      if (distToPlayer < closestDist) closestDist = distToPlayer;

      // Close proximity megaphone warning
      if (distToPlayer < 35 && this.audioManager && this.audioManager.voiceEvents) {
        this.audioManager.voiceEvents.triggerPoliceWarning(c.mesh);
      }

      // Intercept navigation vector
      const toPlayer = new THREE.Vector3().subVectors(playerPos, c.mesh.position);
      toPlayer.y = 0;

      if (distToPlayer > 3.0) {
        toPlayer.normalize();

        // Smooth rotate cruiser towards player
        const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
        const diff = targetAngle - c.rotationY;
        const normDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
        c.rotationY += normDiff * Math.min(1, delta * 4.5);

        // Move cruiser forward
        c.velocity = THREE.MathUtils.lerp(c.velocity, c.speed, delta * 3);
        const moveVec = new THREE.Vector3(
          Math.sin(c.rotationY) * c.velocity * delta,
          0,
          Math.cos(c.rotationY) * c.velocity * delta
        );
        c.mesh.position.add(moveVec);
        c.mesh.rotation.y = c.rotationY;

        // Spin wheels
        if (c.mesh.userData && c.mesh.userData.wheels) {
          c.mesh.userData.wheels.forEach(w => {
            w.rotation.x += (c.velocity * delta) / (0.4 * Math.PI);
          });
        }
      } else {
        // Ramming contact with player!
        c.velocity = 0;
      }

      // Emergency Lightbar Flashing
      c.sirenFlash += delta * 12;
      const redOn = Math.sin(c.sirenFlash) > 0;
      if (c.mesh.userData.redLight) c.mesh.userData.redLight.intensity = redOn ? 3.0 : 0.2;
      if (c.mesh.userData.blueLight) c.mesh.userData.blueLight.intensity = redOn ? 0.2 : 3.0;
    });

    // Evasion mechanics: if player is further than 75m, evasion countdown starts
    if (closestDist > 75) {
      this.evasionTimer += delta;
      if (this.evasionTimer > 12) {
        // Drop wanted level by 1 star
        this.setWantedLevel(this.wantedLevel - 1);
        this.evasionTimer = 0;
      }
    } else {
      this.evasionTimer = 0;
    }
  }
}

