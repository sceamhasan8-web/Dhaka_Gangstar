// MusicManager.js - Theme Tracks, In-Game Radio FM, Cross-fading & Dynamic Ducking
export class MusicManager {
  constructor(audioManager) {
    this.audio = audioManager;
    this.currentTrackSource = null;
    this.currentGainNode = null;
    this.currentTrackName = null;

    this.isRadioPlaying = false;
    this.radioInterval = null;
    this.radioTrackIndex = 0;
    this.radioStations = [
      'DHAKA BEATS FM - 88.4',
      'PURAN DHAKA VIBES',
      'HATIRJHEEL CHILL HOP',
      'BANGLA ROCK DRIFT'
    ];
  }

  /**
   * Play a music track ('main_theme' | 'exploration_theme') with cross-fade
   * @param {string} trackKey 
   * @param {number} [fadeTime=1.5]
   */
  playTrack(trackKey, fadeTime = 1.5) {
    if (this.currentTrackName === trackKey && this.currentTrackSource) return;
    if (!this.audio.ctx || !this.audio.hasBuffer(trackKey)) {
      // Fallback to synthesized radio if WAV buffer isn't ready
      if (!this.isRadioPlaying) {
        this.startRadio();
      }
      return;
    }

    const now = this.audio.ctx.currentTime;

    // Fade out current track if playing
    if (this.currentGainNode && this.currentTrackSource) {
      const prevSource = this.currentTrackSource;
      const prevGain = this.currentGainNode;
      prevGain.gain.setValueAtTime(prevGain.gain.value, now);
      prevGain.gain.linearRampToValueAtTime(0.001, now + fadeTime);
      setTimeout(() => {
        try {
          prevSource.stop();
          prevSource.disconnect();
        } catch (e) {}
      }, fadeTime * 1000);
    }

    // Stop procedural radio if switching to track
    if (this.isRadioPlaying) {
      this.stopRadio();
    }

    try {
      const source = this.audio.ctx.createBufferSource();
      source.buffer = this.audio.getBuffer(trackKey);
      source.loop = true;

      const gainNode = this.audio.ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.45, now + fadeTime);

      source.connect(gainNode);
      gainNode.connect(this.audio.musicGain);
      source.start(0);

      this.currentTrackSource = source;
      this.currentGainNode = gainNode;
      this.currentTrackName = trackKey;
    } catch (e) {
      console.warn('Could not play music track:', e);
    }
  }

  stopTrack(fadeTime = 1.0) {
    if (!this.currentTrackSource || !this.currentGainNode || !this.audio.ctx) return;
    const now = this.audio.ctx.currentTime;
    const prevSource = this.currentTrackSource;
    const prevGain = this.currentGainNode;

    prevGain.gain.setValueAtTime(prevGain.gain.value, now);
    prevGain.gain.linearRampToValueAtTime(0.001, now + fadeTime);

    setTimeout(() => {
      try {
        prevSource.stop();
        prevSource.disconnect();
      } catch (e) {}
    }, fadeTime * 1000);

    this.currentTrackSource = null;
    this.currentGainNode = null;
    this.currentTrackName = null;
  }

  /**
   * Duck music temporarily (e.g. for police siren or mission fanfare)
   * @param {number} duckRatio (0.1 to 0.5)
   * @param {number} durationMs 
   */
  duck(duckRatio = 0.25, durationMs = 2500) {
    if (!this.currentGainNode || !this.audio.ctx) return;
    const now = this.audio.ctx.currentTime;
    const currentVal = this.currentGainNode.gain.value;
    const targetVal = currentVal * duckRatio;

    this.currentGainNode.gain.setTargetAtTime(targetVal, now, 0.2);
    setTimeout(() => {
      if (this.currentGainNode && this.audio.ctx) {
        this.currentGainNode.gain.setTargetAtTime(currentVal, this.audio.ctx.currentTime, 0.5);
      }
    }, durationMs);
  }

  // --- IN-GAME PROCEDURAL RADIO SYSTEM ---
  toggleRadio() {
    if (this.isRadioPlaying) {
      this.stopRadio();
      return false;
    } else {
      this.startRadio();
      return true;
    }
  }

  cycleStation() {
    this.radioTrackIndex = (this.radioTrackIndex + 1) % this.radioStations.length;
    if (!this.isRadioPlaying) {
      this.startRadio();
    }
    return this.radioStations[this.radioTrackIndex];
  }

  startRadio() {
    if (!this.audio.ctx) return;
    this.audio.resume();
    this.stopRadio();
    this.stopTrack(0.5);
    this.isRadioPlaying = true;

    // Scale notes for South Asian / Bengali melody rhythms
    const scales = [
      [220, 246.94, 277.18, 293.66, 329.63, 369.99, 415.30, 440], // Beats FM
      [196, 220, 246.94, 261.63, 293.66, 329.63, 392],           // Puran Dhaka Vibes
      [174.61, 196, 220, 261.63, 293.66, 349.23],                 // Hatirjheel Chill Hop
      [146.83, 164.81, 196, 220, 246.94, 293.66]                  // Bangla Rock
    ];
    const currentScale = scales[this.radioTrackIndex % scales.length];
    let step = 0;

    this.radioInterval = setInterval(() => {
      if (!this.isRadioPlaying || !this.audio.ctx) return;
      const now = this.audio.ctx.currentTime;

      // Bass Kick on step 0 and 2
      if (step % 2 === 0) {
        const kick = this.audio.ctx.createOscillator();
        const kgain = this.audio.ctx.createGain();
        kick.frequency.setValueAtTime(130, now);
        kick.frequency.exponentialRampToValueAtTime(38, now + 0.12);
        kgain.gain.setValueAtTime(0.25, now);
        kgain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        kick.connect(kgain);
        kgain.connect(this.audio.musicGain);
        kick.start(now);
        kick.stop(now + 0.18);
      }

      // Snare / clap on step 2
      if (step % 4 === 2) {
        this.audio.synthesizer.playNoiseBurst(0.07, 0.14, 2500);
      }

      // Melodic synth note on rhythm
      const noteFreq = currentScale[(step * 3) % currentScale.length];
      const melodyOsc = this.audio.ctx.createOscillator();
      const mgain = this.audio.ctx.createGain();
      melodyOsc.type = step % 4 === 0 ? 'triangle' : 'sine';
      melodyOsc.frequency.setValueAtTime(noteFreq, now);

      mgain.gain.setValueAtTime(0.12, now);
      mgain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      melodyOsc.connect(mgain);
      mgain.connect(this.audio.musicGain);
      melodyOsc.start(now);
      melodyOsc.stop(now + 0.25);

      step = (step + 1) % 16;
    }, 180);
  }

  stopRadio() {
    this.isRadioPlaying = false;
    if (this.radioInterval) {
      clearInterval(this.radioInterval);
      this.radioInterval = null;
    }
  }
}
