import * as THREE from 'three';
import { VehicleModels } from './VehicleModels.js';
import { VehiclePhysics } from './VehiclePhysics.js';

export class VehicleManager {
  constructor(scene, world, audioManager) {
    this.scene = scene;
    this.world = world;
    this.audioManager = audioManager;

    this.vehicles = [];
    this.playerVehicle = null;

    this.spawnInitialVehicles();
  }

  spawnInitialVehicles() {
    // Spawn player's default CNG Auto right near starting position (Hatirjheel loop)
    const cngMesh = VehicleModels.createCNG(0x008751);
    cngMesh.position.set(4, 0, 140);
    cngMesh.rotation.y = 0;
    this.scene.add(cngMesh);

    const cngPhys = new VehiclePhysics(cngMesh, 'cng', this.world, this.audioManager);
    this.vehicles.push(cngPhys);

    // Spawn a traditional Pedal Rickshaw parked by the tea stall
    const rickshawMesh = VehicleModels.createRickshaw(0xffbe00);
    rickshawMesh.position.set(-6, 0, 145);
    this.scene.add(rickshawMesh);
    const rickshawPhys = new VehiclePhysics(rickshawMesh, 'rickshaw', this.world, this.audioManager);
    this.vehicles.push(rickshawPhys);

    // Spawn a Dhaka Bus parked at Farmgate
    const busMesh = VehicleModels.createBus(0x008751);
    busMesh.position.set(8, 0, 80);
    this.scene.add(busMesh);
    const busPhys = new VehiclePhysics(busMesh, 'bus', this.world, this.audioManager);
    this.vehicles.push(busPhys);

    // Spawn a Sedan in Motijheel
    const sedanMesh = VehicleModels.createSedan(0xd62828);
    sedanMesh.position.set(155, 0, -180);
    this.scene.add(sedanMesh);
    const sedanPhys = new VehiclePhysics(sedanMesh, 'sedan', this.world, this.audioManager);
    this.vehicles.push(sedanPhys);
  }

  spawnCustomVehicle(type, color = 0x008751, playerPos) {
    let mesh;
    if (type === 'rickshaw') mesh = VehicleModels.createRickshaw(color);
    else if (type === 'bus') mesh = VehicleModels.createBus(color);
    else if (type === 'sedan') mesh = VehicleModels.createSedan(color);
    else if (type === 'bike') mesh = VehicleModels.createBike(color);
    else if (type === 'police') mesh = VehicleModels.createPolice();
    else mesh = VehicleModels.createCNG(color);

    // Spawn 3 meters in front of player
    mesh.position.set(playerPos.x + 3, 0, playerPos.z + 3);
    this.scene.add(mesh);

    const phys = new VehiclePhysics(mesh, type, this.world, this.audioManager);
    this.vehicles.push(phys);
    return phys;
  }

  getNearestVehicle(pos, maxDist = 4.0) {
    let nearest = null;
    let minDist = maxDist;

    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      const dist = pos.distanceTo(v.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = v;
      }
    }
    return nearest;
  }

  enterVehicle(vehicle, player) {
    this.playerVehicle = vehicle;
    player.enterVehicle(vehicle);
    this.audioManager.startVehicleEngine(vehicle.type);
    if (vehicle.type === 'police') {
      this.audioManager.togglePoliceSiren(true);
    }
  }

  exitVehicle(player) {
    if (!this.playerVehicle) return;
    const v = this.playerVehicle;
    this.audioManager.stopVehicleEngine();
    if (v.type === 'police') {
      this.audioManager.togglePoliceSiren(false);
    }
    this.playerVehicle = null;
    player.exitVehicle();
  }

  update(delta, input) {
    if (this.playerVehicle) {
      const { forward, turn, handbrake } = input.getMovement();
      this.playerVehicle.update(delta, forward, turn, handbrake);
    }
  }
}

