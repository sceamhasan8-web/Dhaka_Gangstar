// VoiceManager.js - Central Voice Playback Engine, 3D Spatial Audio & Radio DSP
import * as THREE from 'three';
import { VOICE_ASSETS } from './VoiceAssetRegistry.js';
import { DialogueManager } from './DialogueManager.js';

export class VoiceManager {
  constructor(audioManager) {
    this.audio = audioManager;
    this.dialogue = new DialogueManager(this);

    // Audio buffers cache
    this.voiceBuffers = new Map();
    this.loadPromises = new Map();

    // Dedicated Voice Gain Bus
    this.voiceGain = null;
    this.initVoiceBus();

    // Preload essential voice assets
    this.preloadEssentialVoices();
  }

  initVoiceBus() {
    if (this.audio.ctx && !this.voiceGain) {
      this.voiceGain = this.audio.ctx.createGain();
      this.voiceGain.gain.value = 0.9;
      this.voiceGain.connect(this.audio.masterGain);
    }
  }

  setVolume(volumePercent) {
    if (!this.voiceGain || !this.audio.ctx) return;
    const val = Math.max(0, Math.min(1, volumePercent > 1 ? volumePercent / 100 : volumePercent));
    this.voiceGain.gain.setTargetAtTime(val, this.audio.ctx.currentTime, 0.05);
  }

  async preloadEssentialVoices() {
    const essentialKeys = [
      'tutorial_welcome',
      'mission_start_biryani',
      'mission_complete_voice',
      'police_dispatch_alert',
      'player_victory_male',
      'ped_greet_1',
      'vendor_tea_stall'
    ];
    for (const k of essentialKeys) {
      this.loadVoiceBuffer(k).catch(() => {});
    }
  }

  async loadVoiceBuffer(key) {
    if (this.voiceBuffers.has(key)) return this.voiceBuffers.get(key);
    if (this.loadPromises.has(key)) return this.loadPromises.get(key);

    const asset = VOICE_ASSETS[key];
    if (!asset || !asset.url) return null;

    const promise = (async () => {
      try {
        const res = await fetch(asset.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ab = await res.arrayBuffer();

        if (!this.audio.ctx) this.audio.init();
        this.initVoiceBus();
        if (!this.audio.ctx) return null;

        const buffer = await this.audio.ctx.decodeAudioData(ab);
        this.voiceBuffers.set(key, buffer);
        return buffer;
      } catch (e) {
        return null;
      } finally {
        this.loadPromises.delete(key);
      }
    })();

    this.loadPromises.set(key, promise);
    return promise;
  }

  /**
   * Play a voice asset (called by DialogueManager)
   */
  playVoiceAsset(key, asset, options = {}) {
    this.audio.resume();
    this.initVoiceBus();

    const buffer = this.voiceBuffers.get(key);

    // If spatial mesh source is provided and listener is available
    if (options.spatialSource && this.audio.listener && buffer) {
      return this.playSpatialVoice(buffer, options.spatialSource, asset, options);
    }

    // 2D Non-positional voice (Missions, HQ, Player, Radio)
    if (buffer && this.audio.ctx) {
      try {
        const source = this.audio.ctx.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.audio.ctx.createGain();
        gainNode.gain.value = options.volume !== undefined ? options.volume : 0.85;

        // Apply walkie-talkie / police radio DSP filter if flagged
        if (asset.isRadio) {
          const radioFilter = this.createRadioFilterNode();
          source.connect(radioFilter.input);
          radioFilter.output.connect(gainNode);
        } else {
          source.connect(gainNode);
        }

        gainNode.connect(this.voiceGain || this.audio.masterGain);
        source.start(0);
        return source;
      } catch (e) {
        console.warn(`[VoiceManager] Buffer playback error for ${key}:`, e);
      }
    } else {
      // Lazy load for next time
      this.loadVoiceBuffer(key);

      // Web Speech API client synthesis fallback
      this.playSpeechSynthesisFallback(asset);
    }
    return null;
  }

  playSpatialVoice(buffer, mesh, asset, options = {}) {
    try {
      const sound = new THREE.PositionalAudio(this.audio.listener);
      sound.setBuffer(buffer);
      sound.setRefDistance(options.refDistance || 10);
      sound.setMaxDistance(options.maxDistance || 55);
      sound.setRolloffFactor(options.rolloffFactor || 1.3);
      sound.setDistanceModel('exponential');
      sound.setVolume(options.volume || 0.85);

      if (asset.isRadio) {
        const filter = this.createRadioFilterNode();
        sound.setFilter(filter.input);
      }

      mesh.add(sound);
      sound.play();

      // Automatically clean up when done
      const dur = buffer.duration || 3.0;
      setTimeout(() => {
        try {
          if (mesh && sound.parent === mesh) {
            mesh.remove(sound);
          }
        } catch (e) {}
      }, (dur + 0.5) * 1000);

      return sound;
    } catch (e) {
      console.warn('[VoiceManager] Spatial voice error:', e);
      return null;
    }
  }

  /**
   * Radio / Walkie-talkie DSP Effect: Bandpass (300Hz - 3400Hz telephone bandwidth) + distortion
   */
  createRadioFilterNode() {
    if (!this.audio.ctx) return { input: null, output: null };

    const ctx = this.audio.ctx;
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 450; // Cut low rumble

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3200; // Cut piercing highs

    const waveShaper = ctx.createWaveShaper();
    waveShaper.curve = this.makeDistortionCurve(18);

    highpass.connect(lowpass);
    lowpass.connect(waveShaper);

    return {
      input: highpass,
      output: waveShaper
    };
  }

  makeDistortionCurve(amount = 20) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /**
   * Web Speech API fallback for browsers
   */
  playSpeechSynthesisFallback(asset) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const textToSpeak = this.dialogue.currentLanguage === 'bangla' && asset.bengaliText
          ? asset.bengaliText
          : asset.text;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.05;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
  }
}
