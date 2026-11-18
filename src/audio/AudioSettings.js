// AudioSettings.js - Master Volume, Channel Volume Controls & Persistence
export class AudioSettings {
  constructor(onChangeCallback = null) {
    this.onChange = onChangeCallback;
    this.storageKey = 'dhaka_city_gangstar_audio_settings';

    // Default volume levels (0.0 to 1.0)
    this.volumes = {
      master: 0.85,
      voice: 0.90,
      music: 0.55,
      sfx: 0.80,
      traffic: 0.70,
      environment: 0.65
    };

    this.subtitlesEnabled = true;
    this.language = 'both'; // 'english' | 'bangla' | 'both'
    this.isMuted = false;
    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.volumes) {
          Object.assign(this.volumes, parsed.volumes);
        }
        if (typeof parsed.isMuted === 'boolean') {
          this.isMuted = parsed.isMuted;
        }
        if (typeof parsed.subtitlesEnabled === 'boolean') {
          this.subtitlesEnabled = parsed.subtitlesEnabled;
        }
        if (parsed.language) {
          this.language = parsed.language;
        }
      }
    } catch (e) {
      console.warn('Could not load audio settings from localStorage:', e);
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        volumes: this.volumes,
        subtitlesEnabled: this.subtitlesEnabled,
        language: this.language,
        isMuted: this.isMuted
      }));
    } catch (e) {
      console.warn('Could not save audio settings to localStorage:', e);
    }
    if (this.onChange) {
      this.onChange(this);
    }
  }

  setVolume(channel, value) {
    // value can be 0-1 or 0-100
    const normalized = value > 1 ? Math.max(0, Math.min(1, value / 100)) : Math.max(0, Math.min(1, value));
    if (this.volumes[channel] !== undefined) {
      this.volumes[channel] = normalized;
      this.save();
    }
  }

  getVolume(channel) {
    if (this.isMuted) return 0;
    return this.volumes[channel] !== undefined ? this.volumes[channel] : 0.8;
  }

  getMasterVolume() {
    return this.isMuted ? 0 : this.volumes.master;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.save();
    return this.isMuted;
  }

  setMute(mute) {
    this.isMuted = !!mute;
    this.save();
  }
}
