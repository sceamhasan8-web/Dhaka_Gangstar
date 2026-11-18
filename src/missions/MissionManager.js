import * as THREE from 'three';
import { MISSION_DATABASE } from './MissionDatabase.js';

export class MissionManager {
  constructor(scene, audioManager, onMissionUpdate) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.onMissionUpdate = onMissionUpdate; // Callback to update HUD

    this.missions = MISSION_DATABASE;
    this.currentMissionIndex = 0;
    this.activeMission = null;
    this.timeRemaining = 0;
    this.isMissionActive = false;

    this.beaconGroup = new THREE.Group();
    this.initBeaconMesh();
    this.scene.add(this.beaconGroup);

    // Start with the first mission
    this.startMission(this.currentMissionIndex);
  }

  initBeaconMesh() {
    // Golden vertical beam of light
    const beamGeo = new THREE.CylinderGeometry(0.5, 3.5, 70, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffb800,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 35;
    this.beaconGroup.add(beam);

    // Floating pulsing ring marker
    const ringGeo = new THREE.RingGeometry(3.5, 4.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff416c,
      side: THREE.DoubleSide
    });
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.x = Math.PI / 2;
    this.ringMesh.position.y = 0.4;
    this.beaconGroup.add(this.ringMesh);
  }

  startMission(index) {
    if (index >= this.missions.length) {
      index = 0; // Loop or complete all
    }

    this.currentMissionIndex = index;
    this.activeMission = this.missions[index];
    this.timeRemaining = this.activeMission.timeLimit;
    this.isMissionActive = true;
    this.warned30Sec = false;

    // Place beacon at destination
    this.beaconGroup.position.copy(this.activeMission.destPos);
    this.beaconGroup.visible = true;

    if (this.audioManager && this.audioManager.voiceEvents) {
      this.audioManager.voiceEvents.triggerMissionStart(this.activeMission.id);
    }

    if (this.onMissionUpdate) {
      this.onMissionUpdate(this.activeMission, this.timeRemaining);
    }
  }

  update(delta, playerPos, player) {
    if (!this.isMissionActive || !this.activeMission) return;

    // Countdown timer
    this.timeRemaining -= delta;
    if (this.timeRemaining <= 30 && !this.warned30Sec) {
      this.warned30Sec = true;
      if (this.audioManager && this.audioManager.voiceEvents) {
        this.audioManager.voiceEvents.triggerMissionTimeWarning();
      }
    }
    if (this.timeRemaining <= 0) {
      this.failMission();
      return;
    }

    // Animate beacon ring pulse
    if (this.ringMesh) {
      this.ringMesh.rotation.z += delta * 2;
      const s = 1.0 + Math.sin(Date.now() * 0.005) * 0.2;
      this.ringMesh.scale.set(s, s, s);
    }

    // Check distance to destination
    const dist = playerPos.distanceTo(this.activeMission.destPos);

    if (this.onMissionUpdate) {
      this.onMissionUpdate(this.activeMission, this.timeRemaining, Math.round(dist));
    }

    // Completion condition (within 7 meters of beacon)
    if (dist < 7.0) {
      this.completeMission(player);
    }
  }

  completeMission(player) {
    this.isMissionActive = false;
    this.beaconGroup.visible = false;

    // Give reward
    player.money += this.activeMission.reward;
    this.audioManager.playMissionComplete();
    this.audioManager.playCashReward();
    if (this.audioManager && this.audioManager.voiceEvents) {
      this.audioManager.voiceEvents.triggerMissionComplete();
    }

    if (this.onMissionUpdate) {
      this.onMissionUpdate({
        ...this.activeMission,
        completed: true
      }, 0, 0);
    }

    // Advance to next mission after 4 seconds
    setTimeout(() => {
      this.startMission(this.currentMissionIndex + 1);
    }, 4000);
  }

  failMission() {
    this.isMissionActive = false;
    this.beaconGroup.visible = false;
    if (this.audioManager && this.audioManager.voiceEvents) {
      this.audioManager.voiceEvents.triggerMissionFailed();
    }

    if (this.onMissionUpdate) {
      this.onMissionUpdate({
        ...this.activeMission,
        failed: true
      }, 0, 0);
    }

    // Retry after 4 seconds
    setTimeout(() => {
      this.startMission(this.currentMissionIndex);
    }, 4000);
  }
}

