// DialogueManager.js - Smart Dialogue Queue, Priority Scheduler & Subtitle Coordinator
import { VOICE_PROFILES } from './VoiceProfiles.js';
import { VOICE_ASSETS } from './VoiceAssetRegistry.js';

export class DialogueManager {
  constructor(voiceManager) {
    this.voiceManager = voiceManager;
    this.activeDialogue = null;
    this.activeSource = null;
    this.activePriority = 0;
    this.activeEndTime = 0;

    this.cooldowns = new Map();
    this.queue = [];

    // Subtitle callbacks
    this.onSubtitleShow = null;
    this.onSubtitleHide = null;

    this.subtitlesEnabled = true;
    this.currentLanguage = 'both'; // 'english' | 'bangla' | 'both'
  }

  setSubtitleCallbacks(onShow, onHide) {
    this.onSubtitleShow = onShow;
    this.onSubtitleHide = onHide;
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
  }

  setSubtitlesEnabled(enabled) {
    this.subtitlesEnabled = !!enabled;
    if (!this.subtitlesEnabled && this.onSubtitleHide) {
      this.onSubtitleHide();
    }
  }

  /**
   * Request to play a dialogue line by asset key
   * @param {string} key 
   * @param {Object} [options]
   * @param {THREE.Object3D} [options.spatialSource]
   * @param {number} [options.volume]
   * @param {boolean} [options.force]
   * @returns {boolean} Whether the dialogue was played or queued
   */
  requestDialogue(key, options = {}) {
    const asset = VOICE_ASSETS[key];
    if (!asset) {
      console.warn(`[DialogueManager] Voice asset '${key}' not found.`);
      return false;
    }

    const now = performance.now() / 1000;

    // Check cooldown
    const lastPlayed = this.cooldowns.get(key) || 0;
    if (!options.force && now - lastPlayed < (asset.cooldown || 2.0)) {
      return false; // In cooldown
    }

    const priority = options.priority !== undefined ? options.priority : asset.priority;

    // If a lower priority dialogue is currently playing, interrupt it
    if (this.activeDialogue && now < this.activeEndTime) {
      if (priority > this.activePriority) {
        this.stopActiveDialogue();
      } else {
        // Drop lower priority dialogues instead of piling up
        if (priority >= 4 && this.queue.length < 2) {
          this.queue.push({ key, options });
        }
        return false;
      }
    }

    this.executeDialogue(key, asset, options);
    this.cooldowns.set(key, now);
    return true;
  }

  executeDialogue(key, asset, options) {
    const speaker = VOICE_PROFILES[asset.speakerId] || { name: 'Unknown', bengaliName: 'অজানা' };

    // Trigger audio playback through VoiceManager
    const soundInstance = this.voiceManager.playVoiceAsset(key, asset, options);

    this.activeDialogue = key;
    this.activeSource = soundInstance;
    this.activePriority = asset.priority;

    // Approximate duration or audio buffer duration
    const estimatedDuration = soundInstance && soundInstance.buffer
      ? soundInstance.buffer.duration
      : Math.max(2.0, (asset.text.length / 14));

    this.activeEndTime = (performance.now() / 1000) + estimatedDuration;

    // Display subtitle
    if (this.subtitlesEnabled && this.onSubtitleShow) {
      this.onSubtitleShow({
        speaker: speaker.name,
        bengaliSpeaker: speaker.bengaliName,
        text: asset.text,
        bengaliText: asset.bengaliText,
        duration: estimatedDuration,
        isRadio: !!asset.isRadio
      });
    }

    // Schedule queue check at completion
    setTimeout(() => {
      if (this.activeDialogue === key) {
        this.activeDialogue = null;
        this.activeSource = null;
        this.activePriority = 0;
        if (this.onSubtitleHide) this.onSubtitleHide();
        this.checkQueue();
      }
    }, estimatedDuration * 1000);
  }

  stopActiveDialogue() {
    if (this.activeSource) {
      try {
        this.activeSource.stop();
        this.activeSource.disconnect();
      } catch (e) {}
      this.activeSource = null;
    }
    this.activeDialogue = null;
    this.activePriority = 0;
    if (this.onSubtitleHide) this.onSubtitleHide();
  }

  checkQueue() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      this.requestDialogue(next.key, next.options);
    }
  }

  clear() {
    this.stopActiveDialogue();
    this.queue = [];
  }
}
