// VehicleAudio.js - Engine Synthesis, Loops, Tire Physics, Horns, Siren & 3D Audio
import * as THREE from 'three';

export class VehicleAudio {
  constructor(audioManager) {
    this.audio = audioManager;
    this.activeVehicleType = null;
    this.engineSource = null;
    this.tireSource = null;
    this.sirenSource = null;
    this.engineGainNode = null;
    this.tireGainNode = null;
    this.isEngineRunning = false;
    this.lastSpeed = 0;
  }

  /**
   * Start engine loop for player-controlled vehicle
   * @param {string} type - 'cng' | 'sedan' | 'bus' | 'bike' | 'rickshaw'
   */
  startEngine(type = 'cng') {
    this.stopEngine();
    this.activeVehicleType = type;
    if (type === 'rickshaw') return; // Bicycle rickshaws don't have engines

    // Play startup transient sound
    this.audio.playSound('engine_start', {
      channel: 'traffic',
      volume: 0.45
    });

    const idleKey = `engine_${type}_idle`;
    const soundKey = this.audio.hasBuffer(idleKey) ? idleKey : 'engine_sedan_idle';

    // Start looped engine playback via Web Audio buffer source
    if (this.audio.ctx && this.audio.hasBuffer(soundKey)) {
      try {
        const source = this.audio.ctx.createBufferSource();
        source.buffer = this.audio.getBuffer(soundKey);
        source.loop = true;

        const gainNode = this.audio.ctx.createGain();
        gainNode.gain.value = 0.22;

        source.connect(gainNode);
        gainNode.connect(this.audio.trafficGain);
        source.start(0);

        this.engineSource = source;
        this.engineGainNode = gainNode;
        this.isEngineRunning = true;
      } catch (e) {
        console.warn('Buffer engine loop failed, using synth fallback:', e);
        this.audio.synthesizer.startVehicleEngine(type);
        this.isEngineRunning = true;
      }
    } else {
      // Procedural synthesizer fallback
      this.audio.synthesizer.startVehicleEngine(type);
      this.isEngineRunning = true;
    }

    // Start tire rolling loop
    this.startTireRoll();
  }

  /**
   * Update engine pitch & volume based on speed ratio & acceleration input
   * @param {number} speedRatio (0.0 to 1.0)
   * @param {boolean} isAccelerating
   */
  updateEngine(speedRatio = 0, isAccelerating = false) {
    if (!this.isEngineRunning || !this.activeVehicleType) return;
    const now = this.audio.ctx ? this.audio.ctx.currentTime : 0;

    if (this.engineSource && this.engineGainNode && this.audio.ctx) {
      // Dynamic pitch playback rate: 0.9 (idle) up to 2.1 (top speed)
      const baseRate = 0.95;
      const targetRate = baseRate + speedRatio * 1.1 + (isAccelerating ? 0.2 : 0);
      this.engineSource.playbackRate.setTargetAtTime(targetRate, now, 0.08);

      // Dynamic volume
      const baseVol = this.activeVehicleType === 'bus' ? 0.35 : 0.25;
      const targetVol = baseVol + speedRatio * 0.15 + (isAccelerating ? 0.08 : 0);
      this.engineGainNode.gain.setTargetAtTime(targetVol, now, 0.08);
    } else {
      // Forward to procedural synth
      this.audio.synthesizer.updateVehicleEngine(speedRatio, isAccelerating);
    }

    // Update tire rolling volume
    this.updateTireRoll(speedRatio);
  }

  /**
   * Stop vehicle engine
   */
  stopEngine() {
    if (this.isEngineRunning) {
      this.audio.playSound('engine_stop', {
        channel: 'traffic',
        volume: 0.35
      });
    }

    if (this.engineSource) {
      try {
        this.engineSource.stop();
        this.engineSource.disconnect();
      } catch (e) {}
      this.engineSource = null;
    }
    this.engineGainNode = null;
    this.isEngineRunning = false;
    this.activeVehicleType = null;

    this.stopTireRoll();
    this.audio.synthesizer.stopVehicleEngine();
  }

  /**
   * Tire rolling friction loop
   */
  startTireRoll() {
    if (!this.audio.ctx || !this.audio.hasBuffer('tire_roll')) return;
    try {
      const source = this.audio.ctx.createBufferSource();
      source.buffer = this.audio.getBuffer('tire_roll');
      source.loop = true;

      const gainNode = this.audio.ctx.createGain();
      gainNode.gain.value = 0.001;

      source.connect(gainNode);
      gainNode.connect(this.audio.sfxGain);
      source.start(0);

      this.tireSource = source;
      this.tireGainNode = gainNode;
    } catch (e) {}
  }

  updateTireRoll(speedRatio) {
    if (!this.tireGainNode || !this.audio.ctx) return;
    const now = this.audio.ctx.currentTime;
    const vol = Math.min(0.28, speedRatio * 0.28);
    this.tireGainNode.gain.setTargetAtTime(vol, now, 0.1);
  }

  stopTireRoll() {
    if (this.tireSource) {
      try {
        this.tireSource.stop();
        this.tireSource.disconnect();
      } catch (e) {}
      this.tireSource = null;
    }
    this.tireGainNode = null;
  }

  /**
   * Play tire drift / skid screech
   */
  playTireDrift() {
    this.audio.playSound('brake_skid', {
      channel: 'sfx',
      volume: 0.38,
      detune: (Math.random() - 0.5) * 120,
      fallback: () => {
        this.audio.synthesizer.playTireDrift();
      }
    });
  }

  /**
   * Play Vehicle Horn
   * @param {string} type 
   */
  playHorn(type = 'car') {
    if (type === 'rickshaw') {
      this.playRickshawBell();
    } else if (type === 'bus') {
      this.audio.playSound('horn_bus', {
        channel: 'traffic',
        volume: 0.55,
        fallback: () => this.audio.synthesizer.playBusHorn()
      });
    } else {
      this.audio.playSound('horn_car', {
        channel: 'traffic',
        volume: 0.45,
        fallback: () => this.audio.synthesizer.playCarHorn()
      });
    }
  }

  playRickshawBell() {
    this.audio.playSound('bell_rickshaw', {
      channel: 'sfx',
      volume: 0.5,
      fallback: () => this.audio.synthesizer.playRickshawBell()
    });
  }

  playBusHorn() {
    this.playHorn('bus');
  }

  playCarHorn() {
    this.playHorn('car');
  }

  /**
   * Toggle Police Siren
   * @param {boolean} active 
   */
  togglePoliceSiren(active = true) {
    if (!active) {
      if (this.sirenSource) {
        try {
          this.sirenSource.stop();
          this.sirenSource.disconnect();
        } catch (e) {}
        this.sirenSource = null;
      }
      this.audio.synthesizer.togglePoliceSiren(false);
      return;
    }

    if (this.sirenSource) return;

    if (this.audio.ctx && this.audio.hasBuffer('police_siren')) {
      try {
        const source = this.audio.ctx.createBufferSource();
        source.buffer = this.audio.getBuffer('police_siren');
        source.loop = true;

        const gainNode = this.audio.ctx.createGain();
        gainNode.gain.value = 0.35;

        source.connect(gainNode);
        gainNode.connect(this.audio.sfxGain);
        source.start(0);

        this.sirenSource = source;
      } catch (e) {
        this.audio.synthesizer.togglePoliceSiren(true);
      }
    } else {
      this.audio.synthesizer.togglePoliceSiren(true);
    }
  }

  /**
   * Play Collision Crash Impact
   * @param {number} intensity (0.1 to 1.0)
   */
  playCrash(intensity = 0.5) {
    const vol = Math.min(0.85, 0.25 + intensity * 0.6);
    this.audio.playSound('crash', {
      channel: 'sfx',
      volume: vol,
      detune: (Math.random() - 0.5) * 80,
      fallback: () => {
        this.audio.synthesizer.playCrashSound(intensity);
      }
    });
  }

  /**
   * Attach a 3D Positional Audio source to an in-world vehicle mesh
   * @param {THREE.Object3D} mesh 
   * @param {string} soundKey 
   * @param {Object} [options]
   */
  attachPositionalAudio(mesh, soundKey, options = {}) {
    if (!mesh || !this.audio.listener) return null;

    try {
      const sound = new THREE.PositionalAudio(this.audio.listener);
      const buffer = this.audio.getBuffer(soundKey);
      if (buffer) {
        sound.setBuffer(buffer);
        sound.setRefDistance(options.refDistance || 15);
        sound.setMaxDistance(options.maxDistance || 75);
        sound.setRolloffFactor(options.rolloffFactor || 1.2);
        sound.setDistanceModel('exponential');
        sound.setVolume(options.volume || 0.4);
        if (options.loop) sound.setLoop(true);

        mesh.add(sound);
        if (options.autoPlay) sound.play();
        return sound;
      }
    } catch (e) {
      console.warn('Could not attach positional audio:', e);
    }
    return null;
  }
}
