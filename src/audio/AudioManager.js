// AudioManager.js - Central AAA Audio Architecture for Dhaka City Gangstar
import * as THREE from 'three';
import { AudioSettings } from './AudioSettings.js';
import { CharacterAudio } from './CharacterAudio.js';
import { VehicleAudio } from './VehicleAudio.js';
import { EnvironmentAudio } from './EnvironmentAudio.js';
import { MusicManager } from './MusicManager.js';
import { VoiceManager } from './VoiceManager.js';
import { VoiceEventSystem } from './VoiceEventSystem.js';

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.listener = null;
    this.initialized = false;

    // Audio node channels
    this.masterGain = null;
    this.sfxGain = null;
    this.trafficGain = null;
    this.envGain = null;
    this.musicGain = null;

    // Buffer store for decoded audio files
    this.buffers = new Map();
    this.loadingPromises = new Map();

    // Settings
    this.settings = new AudioSettings((settings) => this.applySettings(settings));

    // Procedural Synthesizer fallback engine
    this.synthesizer = new ProceduralAudioSynthesizer(this);

    // Audio subsystems
    this.character = new CharacterAudio(this);
    this.vehicles = new VehicleAudio(this);
    this.environment = new EnvironmentAudio(this);
    this.music = new MusicManager(this);
    this.voice = new VoiceManager(this);
    this.voiceEvents = new VoiceEventSystem(this.voice);

    // Manifest of audio assets to load
    this.assetManifest = {
      // Character
      'footstep_walk_l': '/audio/character/footstep_walk_l.wav',
      'footstep_walk_r': '/audio/character/footstep_walk_r.wav',
      'footstep_run_l': '/audio/character/footstep_run_l.wav',
      'footstep_run_r': '/audio/character/footstep_run_r.wav',
      'footstep_grass_l': '/audio/character/footstep_grass_l.wav',
      'footstep_grass_r': '/audio/character/footstep_grass_r.wav',
      'jump': '/audio/character/jump.wav',
      'land': '/audio/character/land.wav',
      'clothing': '/audio/character/clothing.wav',

      // Vehicles
      'engine_start': '/audio/vehicles/engine_start.wav',
      'engine_stop': '/audio/vehicles/engine_stop.wav',
      'engine_cng_idle': '/audio/vehicles/engine_cng_idle.wav',
      'engine_cng_accel': '/audio/vehicles/engine_cng_accel.wav',
      'engine_sedan_idle': '/audio/vehicles/engine_sedan_idle.wav',
      'engine_sedan_accel': '/audio/vehicles/engine_sedan_accel.wav',
      'engine_bus_idle': '/audio/vehicles/engine_bus_idle.wav',
      'engine_bus_accel': '/audio/vehicles/engine_bus_accel.wav',
      'engine_bike_idle': '/audio/vehicles/engine_bike_idle.wav',
      'engine_bike_accel': '/audio/vehicles/engine_bike_accel.wav',
      'tire_roll': '/audio/vehicles/tire_roll.wav',
      'brake_skid': '/audio/vehicles/brake_skid.wav',
      'horn_car': '/audio/vehicles/horn_car.wav',
      'horn_bus': '/audio/vehicles/horn_bus.wav',
      'bell_rickshaw': '/audio/vehicles/bell_rickshaw.wav',
      'police_siren': '/audio/vehicles/police_siren.wav',
      'crash': '/audio/vehicles/crash.wav',

      // Environment
      'city_ambience': '/audio/environment/city_ambience.wav',
      'garden_birds': '/audio/environment/garden_birds.wav',
      'fountain_water': '/audio/environment/fountain_water.wav',
      'wind_breeze': '/audio/environment/wind_breeze.wav',

      // Music
      'main_theme': '/audio/music/main_theme.wav',
      'exploration_theme': '/audio/music/exploration_theme.wav',

      // UI
      'click': '/audio/ui/click.wav',
      'reward': '/audio/ui/reward.wav',
      'mission_complete': '/audio/ui/mission_complete.wav'
    };

    // Auto-bind user interaction listeners to resume audio
    this.bindUserGestureUnlock();
  }

  /**
   * Bind global pointerdown / keydown to immediately resume audio context
   */
  bindUserGestureUnlock() {
    const unlock = () => {
      this.init();
      this.resume();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true, once: false });
    window.addEventListener('touchstart', unlock, { passive: true, once: false });
    window.addEventListener('keydown', unlock, { passive: true, once: false });
  }

  /**
   * Initialize Web Audio Context and audio graph
   */
  init() {
    if (this.initialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('Web Audio API not supported on this browser.');
        return;
      }

      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.settings.getMasterVolume();
      this.masterGain.connect(this.ctx.destination);

      // SFX Channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.settings.getVolume('sfx');
      this.sfxGain.connect(this.masterGain);

      // Traffic & Vehicle Channel
      this.trafficGain = this.ctx.createGain();
      this.trafficGain.gain.value = this.settings.getVolume('traffic');
      this.trafficGain.connect(this.masterGain);

      // Environmental Ambience Channel
      this.envGain = this.ctx.createGain();
      this.envGain.gain.value = this.settings.getVolume('environment');
      this.envGain.connect(this.masterGain);

      // Music Channel
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.settings.getVolume('music');
      this.musicGain.connect(this.masterGain);

      // Three.js AudioListener for 3D positional audio
      this.listener = new THREE.AudioListener();

      this.initialized = true;
      console.log('Dhaka City Gangstar Pro Audio System Initialized.');

      // Begin preloading sound assets in background
      this.preloadCommonSounds();
    } catch (e) {
      console.warn('Audio system initialization error:', e);
    }
  }

  /**
   * Attach listener to the Three.js gameplay camera
   * @param {THREE.Camera} camera 
   */
  attachCamera(camera) {
    if (!camera) return;
    this.init();
    if (this.listener && camera) {
      // Remove from any prior parent if necessary
      if (this.listener.parent) {
        this.listener.parent.remove(this.listener);
      }
      camera.add(this.listener);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Preload critical audio buffers
   */
  async preloadCommonSounds() {
    const keys = Object.keys(this.assetManifest);
    for (const key of keys) {
      this.loadSound(key).catch(() => {});
    }
  }

  /**
   * Load audio file buffer
   * @param {string} key 
   */
  async loadSound(key) {
    if (this.buffers.has(key)) return this.buffers.get(key);
    if (this.loadingPromises.has(key)) return this.loadingPromises.get(key);

    const url = this.assetManifest[key];
    if (!url) return null;

    const promise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        if (!this.ctx) this.init();
        if (!this.ctx) return null;

        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(key, audioBuffer);
        return audioBuffer;
      } catch (err) {
        // Fallback gracefully to procedural sound if fetch fails
        return null;
      } finally {
        this.loadingPromises.delete(key);
      }
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  hasBuffer(key) {
    return this.buffers.has(key);
  }

  getBuffer(key) {
    return this.buffers.get(key);
  }

  /**
   * Play single one-shot sound
   * @param {string} key 
   * @param {Object} options 
   */
  playSound(key, options = {}) {
    this.resume();
    const buffer = this.buffers.get(key);

    if (buffer && this.ctx) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        if (options.detune) {
          source.detune.value = options.detune;
        }

        const gainNode = this.ctx.createGain();
        gainNode.gain.value = options.volume !== undefined ? options.volume : 0.5;

        source.connect(gainNode);

        // Connect to destination channel
        const channel = options.channel || 'sfx';
        if (channel === 'traffic') gainNode.connect(this.trafficGain);
        else if (channel === 'environment') gainNode.connect(this.envGain);
        else if (channel === 'music') gainNode.connect(this.musicGain);
        else gainNode.connect(this.sfxGain);

        source.start(0);
        return source;
      } catch (e) {
        if (options.fallback) options.fallback();
      }
    } else {
      // Trigger lazy background load for next time
      this.loadSound(key);
      // Run procedural synthesizer fallback
      if (options.fallback) {
        options.fallback();
      }
    }
    return null;
  }

  applySettings(settings) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(settings.getMasterVolume(), now, 0.05);
    }
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(settings.getVolume('sfx'), now, 0.05);
    }
    if (this.trafficGain) {
      this.trafficGain.gain.setTargetAtTime(settings.getVolume('traffic'), now, 0.05);
    }
    if (this.envGain) {
      this.envGain.gain.setTargetAtTime(settings.getVolume('environment'), now, 0.05);
    }
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(settings.getVolume('music'), now, 0.05);
    }
    if (this.voice) {
      this.voice.setVolume(settings.getVolume('voice'));
      if (this.voice.dialogue) {
        this.voice.dialogue.setSubtitlesEnabled(settings.subtitlesEnabled);
        this.voice.dialogue.setLanguage(settings.language);
      }
    }
  }

  setVolume(channel, percent) {
    this.settings.setVolume(channel, percent);
  }

  setMasterMute(isMuted) {
    this.settings.setMute(isMuted);
  }

  // ==========================================
  // BACKWARD-COMPATIBLE API PASS-THROUGHS
  // ==========================================
  playRickshawBell() {
    this.vehicles.playRickshawBell();
  }

  playBusHorn() {
    this.vehicles.playBusHorn();
  }

  playCarHorn() {
    this.vehicles.playCarHorn();
  }

  startVehicleEngine(type = 'cng') {
    this.vehicles.startEngine(type);
  }

  updateVehicleEngine(speedRatio = 0, isAccelerating = false) {
    this.vehicles.updateEngine(speedRatio, isAccelerating);
  }

  stopVehicleEngine() {
    this.vehicles.stopEngine();
  }

  playTireDrift() {
    this.vehicles.playTireDrift();
  }

  playCrashSound(intensity = 0.5) {
    this.vehicles.playCrash(intensity);
  }

  togglePoliceSiren(active = true) {
    this.vehicles.togglePoliceSiren(active);
  }

  playFootstep(surface = 'concrete', isRunning = false) {
    if (typeof surface === 'object') {
      this.character.playFootstep(surface);
    } else {
      this.character.playFootstep({ surface, isRunning });
    }
  }

  playJumpSound() {
    this.character.playJump();
  }

  playLandSound(intensity = 5, surface = 'concrete') {
    this.character.playLand(intensity, surface);
  }

  playCashReward() {
    this.playSound('reward', {
      channel: 'sfx',
      volume: 0.5,
      fallback: () => this.synthesizer.playCashReward()
    });
  }

  playMissionComplete() {
    this.playSound('mission_complete', {
      channel: 'sfx',
      volume: 0.65,
      fallback: () => this.synthesizer.playMissionComplete()
    });
  }

  playClick() {
    this.playSound('click', {
      channel: 'sfx',
      volume: 0.35,
      fallback: () => this.synthesizer.playClick()
    });
  }

  toggleRadio() {
    return this.music.toggleRadio();
  }

  cycleRadioStation() {
    return this.music.cycleStation();
  }

  startRadio() {
    this.music.startRadio();
  }

  stopRadio() {
    this.music.stopRadio();
  }

  playTrack(trackKey) {
    this.music.playTrack(trackKey);
  }

  stopTrack() {
    this.music.stopTrack();
  }
}

/**
 * Procedural Web Audio API Synthesizer (Zero-latency fallback & authentic synth generation)
 */
class ProceduralAudioSynthesizer {
  constructor(audioManager) {
    this.audio = audioManager;
    this.engineOsc = null;
    this.engineGain = null;
    this.activeVehicleType = null;

    this.sirenOsc = null;
    this.sirenGain = null;
    this.sirenTimer = null;
  }

  get ctx() {
    return this.audio.ctx;
  }

  playRickshawBell() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chime = (timeOffset, freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, timeOffset);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, timeOffset + 0.15);

      gain.gain.setValueAtTime(0.4, timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, timeOffset + 0.18);

      osc.connect(gain);
      gain.connect(this.audio.sfxGain);
      osc.start(timeOffset);
      osc.stop(timeOffset + 0.2);
    };

    chime(now, 2600);
    chime(now + 0.04, 3200);
    chime(now + 0.12, 2600);
    chime(now + 0.16, 3200);
  }

  playBusHorn() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const tones = [370, 440, 554];

    tones.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq + (idx * 2), now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
      gain.gain.setValueAtTime(0.35, now + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audio.trafficGain);

      osc.start(now);
      osc.stop(now + 0.65);
    });
  }

  playCarHorn() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [415, 495];

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.setValueAtTime(0.25, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.audio.trafficGain);

      osc.start(now);
      osc.stop(now + 0.38);
    });
  }

  startVehicleEngine(type = 'cng') {
    if (!this.ctx) return;
    this.stopVehicleEngine();
    this.activeVehicleType = type;
    if (type === 'rickshaw') return;

    const now = this.ctx.currentTime;
    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();

    if (type === 'cng') {
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(65, now);
      this.engineGain.gain.setValueAtTime(0.12, now);
    } else if (type === 'bus') {
      this.engineOsc.type = 'triangle';
      this.engineOsc.frequency.setValueAtTime(45, now);
      this.engineGain.gain.setValueAtTime(0.2, now);
    } else {
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(75, now);
      this.engineGain.gain.setValueAtTime(0.1, now);
    }

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'bus' ? 350 : 700, now);

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.audio.sfxGain);

    this.engineOsc.start(now);
  }

  updateVehicleEngine(speedRatio = 0, isAccelerating = false) {
    if (!this.engineOsc || !this.engineGain || !this.activeVehicleType || !this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = this.activeVehicleType === 'bus' ? 45 : (this.activeVehicleType === 'cng' ? 65 : 75);
    const maxFreq = this.activeVehicleType === 'bus' ? 140 : (this.activeVehicleType === 'cng' ? 220 : 280);

    const targetFreq = baseFreq + (maxFreq - baseFreq) * speedRatio + (isAccelerating ? 25 : 0);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);

    const baseVol = this.activeVehicleType === 'bus' ? 0.22 : 0.14;
    const targetVol = baseVol + (speedRatio * 0.1) + (isAccelerating ? 0.05 : 0);
    this.engineGain.gain.setTargetAtTime(targetVol, now, 0.1);
  }

  stopVehicleEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch (e) {}
      this.engineOsc = null;
    }
    this.activeVehicleType = null;
  }

  playTireDrift() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.3);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(3, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audio.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playCrashSound(intensity = 0.5) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

    gain.gain.setValueAtTime(0.4 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.audio.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  togglePoliceSiren(active = true) {
    if (!active) {
      if (this.sirenOsc) {
        try {
          this.sirenOsc.stop();
          this.sirenOsc.disconnect();
        } catch (e) {}
        this.sirenOsc = null;
      }
      if (this.sirenTimer) clearInterval(this.sirenTimer);
      return;
    }

    if (this.sirenOsc || !this.ctx) return;
    const now = this.ctx.currentTime;

    this.sirenOsc = this.ctx.createOscillator();
    this.sirenGain = this.ctx.createGain();
    this.sirenOsc.type = 'sine';
    this.sirenOsc.frequency.setValueAtTime(650, now);
    this.sirenGain.gain.setValueAtTime(0.18, now);

    this.sirenOsc.connect(this.sirenGain);
    this.sirenGain.connect(this.audio.sfxGain);
    this.sirenOsc.start(now);

    let high = false;
    this.sirenTimer = setInterval(() => {
      if (!this.sirenOsc || !this.ctx) return;
      const t = this.ctx.currentTime;
      high = !high;
      this.sirenOsc.frequency.linearRampToValueAtTime(high ? 920 : 620, t + 0.35);
    }, 400);
  }

  playCashReward() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.audio.sfxGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }

  playMissionComplete() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chords = [
      { f: [440, 554, 659], t: 0, d: 0.2 },
      { f: [493, 622, 739], t: 0.22, d: 0.2 },
      { f: [587, 739, 880], t: 0.45, d: 0.5 }
    ];

    chords.forEach(c => {
      c.f.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + c.t);
        gain.gain.setValueAtTime(0.2, now + c.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + c.t + c.d);

        osc.connect(gain);
        gain.connect(this.audio.sfxGain);
        osc.start(now + c.t);
        osc.stop(now + c.t + c.d + 0.05);
      });
    });
  }

  playFootstep(options = {}) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const isGrass = options.surface === 'grass';
    const isRunning = options.isRunning;

    osc.type = isGrass ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(isGrass ? 65 : (isRunning ? 110 : 85), now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    gain.gain.setValueAtTime(isRunning ? 0.16 : 0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.audio.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playJumpSound() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.audio.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playLandSound(vol = 0.3) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.15);

    gain.gain.setValueAtTime(vol * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.audio.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  playClick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.audio.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playNoiseBurst(duration = 0.08, volume = 0.1, filterFreq = 1500) {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audio.sfxGain);

    noise.start();
  }
}
