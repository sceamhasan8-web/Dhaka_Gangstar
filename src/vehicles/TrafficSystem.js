import * as THREE from 'three';
import { VehicleModels } from './VehicleModels.js';

export class TrafficSystem {
  constructor(scene, roadNetwork, audioManager) {
    this.scene = scene;
    this.roadNetwork = roadNetwork;
    this.audioManager = audioManager;

    this.trafficVehicles = [];
    this.maxTraffic = 18; // Balanced performance
    this.spawnTimer = 0;

    this.initTraffic();
  }

  initTraffic() {
    // Populate roads with initial AI traffic
    for (let i = 0; i < this.maxTraffic; i++) {
      this.spawnAIVehicle();
    }
  }

  spawnAIVehicle() {
    if (this.roadNetwork.roads.length === 0) return;

    // Pick a random road segment
    const road = this.roadNetwork.roads[Math.floor(Math.random() * this.roadNetwork.roads.length)];
    const types = ['cng', 'rickshaw', 'bus', 'sedan'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    let mesh;
    let speed;
    if (chosenType === 'cng') {
      mesh = VehicleModels.createCNG(Math.random() > 0.5 ? 0x008751 : 0x005533);
      speed = 10 + Math.random() * 5;
    } else if (chosenType === 'rickshaw') {
      mesh = VehicleModels.createRickshaw(0xffbe00);
      speed = 5 + Math.random() * 3;
    } else if (chosenType === 'bus') {
      mesh = VehicleModels.createBus(0x008751);
      speed = 8 + Math.random() * 4;
    } else {
      mesh = VehicleModels.createSedan(0xd62828);
      speed = 14 + Math.random() * 6;
    }

    // Direction along road
    const forward = Math.random() > 0.5;
    const startPt = forward ? road.start : road.end;
    const endPt = forward ? road.end : road.start;

    // Lane offset (Left vs Right of divider)
    const dir = new THREE.Vector3().subVectors(endPt, startPt).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    const laneOffset = 3.5; // Offset from centerline

    const pos = new THREE.Vector3().lerpVectors(startPt, endPt, Math.random());
    pos.add(perp.clone().multiplyScalar(laneOffset));
    pos.y = 0;

    mesh.position.copy(pos);
    mesh.rotation.y = Math.atan2(dir.x, dir.z);

    this.scene.add(mesh);

    this.trafficVehicles.push({
      mesh,
      type: chosenType,
      speed,
      target: endPt.clone().add(perp.clone().multiplyScalar(laneOffset)),
      road,
      forward,
      laneOffset,
      honkCooldown: Math.random() * 15
    });
  }

  update(delta, playerPos) {
    this.trafficVehicles.forEach((tv, idx) => {
      // Distance check to player for LOD streaming
      const distToPlayer = playerPos ? tv.mesh.position.distanceTo(playerPos) : 0;

      // Move vehicle towards target
      const toTarget = new THREE.Vector3().subVectors(tv.target, tv.mesh.position);
      const distToTarget = toTarget.length();

      if (distToTarget < 6) {
        // Reached end of road, pick next connected road or reverse
        tv.forward = !tv.forward;
        const startPt = tv.forward ? tv.road.start : tv.road.end;
        const endPt = tv.forward ? tv.road.end : tv.road.start;

        const dir = new THREE.Vector3().subVectors(endPt, startPt).normalize();
        const perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

        tv.target = endPt.clone().add(perp.clone().multiplyScalar(tv.laneOffset));
        tv.mesh.rotation.y = Math.atan2(dir.x, dir.z);
      } else {
        toTarget.normalize();
        tv.mesh.position.add(toTarget.multiplyScalar(tv.speed * delta));
        tv.mesh.rotation.y = Math.atan2(toTarget.x, toTarget.z);

        // Spin wheels
        if (tv.mesh.userData && tv.mesh.userData.wheels) {
          tv.mesh.userData.wheels.forEach(w => {
            w.rotation.x += (tv.speed * delta) / (0.4 * Math.PI);
          });
        }
      }

      // Random authentic Dhaka traffic honk when near player!
      tv.honkCooldown -= delta;
      if (tv.honkCooldown <= 0) {
        tv.honkCooldown = 12 + Math.random() * 20;
        if (distToPlayer < 40) {
          if (tv.type === 'rickshaw') this.audioManager.playRickshawBell();
          else if (tv.type === 'bus') this.audioManager.playBusHorn();
          else this.audioManager.playCarHorn();
        }
      }
    });
  }
}

