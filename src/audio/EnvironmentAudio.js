// EnvironmentAudio.js - Open-World Ambience, Dynamic Zones, Birds, Wind & Positional Fountains
import * as THREE from 'three';

export class EnvironmentAudio {
  constructor(audioManager) {
    this.audio = audioManager;
    this.citySource = null;
    this.birdsSource = null;
    this.windSource = null;
    this.fountainSound = null;

    this.cityGainNode = null;
    this.birdsGainNode = null;
    this.windGainNode = null;

    this.isPlaying = false;
  }

  /**
   * Start ambient environment background sounds
   */
  start() {
    if (this.isPlaying || !this.audio.ctx) return;
    this.isPlaying = true;

    // 1. City traffic rumble loop
    this.citySource = this.createAmbientLoop('city_ambience', 0.25, (gainNode) => {
      this.cityGainNode = gainNode;
    });

    // 2. Nature & garden birds loop
    this.birdsSource = this.createAmbientLoop('garden_birds', 0.18, (gainNode) => {
      this.birdsGainNode = gainNode;
    });

    // 3. Wind breeze loop
    this.windSource = this.createAmbientLoop('wind_breeze', 0.12, (gainNode) => {
      this.windGainNode = gainNode;
    });
  }

  createAmbientLoop(key, defaultGain, onGainCreated) {
    if (!this.audio.ctx || !this.audio.hasBuffer(key)) return null;

    try {
      const source = this.audio.ctx.createBufferSource();
      source.buffer = this.audio.getBuffer(key);
      source.loop = true;

      const gainNode = this.audio.ctx.createGain();
      gainNode.gain.value = defaultGain;
      if (onGainCreated) onGainCreated(gainNode);

      source.connect(gainNode);
      gainNode.connect(this.audio.envGain);
      source.start(0);

      return source;
    } catch (e) {
      console.warn(`Could not start ambient loop ${key}:`, e);
      return null;
    }
  }

  /**
   * Dynamically adjust ambience levels based on player position in the world
   * @param {THREE.Vector3|{x: number, y: number, z: number}} playerPos 
   */
  update(playerPos) {
    if (!this.isPlaying || !this.audio.ctx || !playerPos) return;
    const now = this.audio.ctx.currentTime;

    // Check if player is in Central Park or Suburban Garden Zone
    // Central Park: [-90, 90] x [-90, 90]
    const inCentralPark = (
      playerPos.x >= -90 && playerPos.x <= 90 &&
      playerPos.z >= -90 && playerPos.z <= 90
    );

    // Suburban residential area: outside core [-120, 120]
    const inSuburbs = (Math.abs(playerPos.x) > 120 || Math.abs(playerPos.z) > 120);

    let targetCityVol = 0.28;
    let targetBirdsVol = 0.12;
    let targetWindVol = 0.10;

    if (inCentralPark) {
      targetCityVol = 0.08;   // Muffled distant city rumble
      targetBirdsVol = 0.35;  // Loud lush park birds
      targetWindVol = 0.18;   // Gentle breeze through park trees
    } else if (inSuburbs) {
      targetCityVol = 0.14;   // Light suburban traffic
      targetBirdsVol = 0.30;  // Suburban lawn birds
      targetWindVol = 0.15;   // Open residential breeze
    }

    if (this.cityGainNode) {
      this.cityGainNode.gain.setTargetAtTime(targetCityVol, now, 0.4);
    }
    if (this.birdsGainNode) {
      this.birdsGainNode.gain.setTargetAtTime(targetBirdsVol, now, 0.4);
    }
    if (this.windGainNode) {
      this.windGainNode.gain.setTargetAtTime(targetWindVol, now, 0.4);
    }
  }

  /**
   * Setup 3D Positional Audio for Central Park Fountain
   * @param {THREE.Object3D} fountainMesh 
   */
  attachFountainAudio(fountainMesh) {
    if (!fountainMesh || !this.audio.listener || !this.audio.hasBuffer('fountain_water')) return;

    try {
      const sound = new THREE.PositionalAudio(this.audio.listener);
      sound.setBuffer(this.audio.getBuffer('fountain_water'));
      sound.setRefDistance(8);
      sound.setMaxDistance(45);
      sound.setRolloffFactor(1.5);
      sound.setDistanceModel('exponential');
      sound.setVolume(0.45);
      sound.setLoop(true);

      fountainMesh.add(sound);
      sound.play();
      this.fountainSound = sound;
    } catch (e) {
      console.warn('Could not attach fountain positional audio:', e);
    }
  }

  /**
   * Stop all environmental loops
   */
  stop() {
    this.isPlaying = false;
    const stopSource = (src) => {
      if (src) {
        try {
          src.stop();
          src.disconnect();
        } catch (e) {}
      }
    };

    stopSource(this.citySource);
    stopSource(this.birdsSource);
    stopSource(this.windSource);

    this.citySource = null;
    this.birdsSource = null;
    this.windSource = null;
    this.cityGainNode = null;
    this.birdsGainNode = null;
    this.windGainNode = null;

    if (this.fountainSound) {
      try {
        this.fountainSound.stop();
      } catch (e) {}
      this.fountainSound = null;
    }
  }
}
