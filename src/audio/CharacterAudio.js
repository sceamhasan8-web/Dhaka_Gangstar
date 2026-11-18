// CharacterAudio.js - Surface-aware Footsteps, Jump, Land, and Movement Sounds
export class CharacterAudio {
  constructor(audioManager) {
    this.audio = audioManager;
    this.footstepStep = 0; // 0 = Left, 1 = Right
    this.lastFootstepTime = 0;
  }

  /**
   * Determine surface material from world coordinates
   * @param {THREE.Vector3|{x: number, y: number, z: number}} pos 
   * @returns {'concrete'|'grass'}
   */
  detectSurface(pos) {
    if (!pos) return 'concrete';
    const x = pos.x;
    const z = pos.z;

    // Central park area: X: [-90, 90], Z: [-90, 90]
    if (x >= -90 && x <= 90 && z >= -90 && z <= 90) {
      // Fountain plaza center is concrete
      const distToCenter = Math.hypot(x, z);
      if (distToCenter < 14) return 'concrete';
      return 'grass';
    }

    // Suburban residential area: X: [-240, -100] or [100, 240]
    // If not close to street grid lines (approx every 80m width 14m), it's grass lawn
    const roadHalfWidth = 7;
    const nearRoadX = Math.abs(x % 80) < roadHalfWidth;
    const nearRoadZ = Math.abs(z % 80) < roadHalfWidth;
    const nearSidewalkX = Math.abs(x % 80) < roadHalfWidth + 3;
    const nearSidewalkZ = Math.abs(z % 80) < roadHalfWidth + 3;

    if (nearRoadX || nearRoadZ || nearSidewalkX || nearSidewalkZ) {
      return 'concrete';
    }

    // Default outside roads & sidewalks is grass lawn
    return 'grass';
  }

  /**
   * Play surface-aware alternating footstep
   * @param {Object} options 
   * @param {'concrete'|'grass'} [options.surface]
   * @param {boolean} [options.isRunning]
   * @param {boolean} [options.isLeft]
   * @param {number} [options.volume]
   */
  playFootstep(options = {}) {
    const isLeft = options.isLeft !== undefined ? options.isLeft : (this.footstepStep % 2 === 0);
    this.footstepStep++;
    const isRunning = !!options.isRunning;
    const surface = options.surface || 'concrete';
    const side = isLeft ? 'l' : 'r';

    let soundKey = '';
    if (surface === 'grass') {
      soundKey = `footstep_grass_${side}`;
    } else if (isRunning) {
      soundKey = `footstep_run_${side}`;
    } else {
      soundKey = `footstep_walk_${side}`;
    }

    // Play buffered audio or fallback to synth
    const volume = (options.volume || (isRunning ? 0.35 : 0.22));
    this.audio.playSound(soundKey, {
      channel: 'sfx',
      volume,
      detune: (Math.random() - 0.5) * 80, // Natural slight pitch variation
      fallback: () => {
        this.audio.synthesizer.playFootstep({
          surface,
          isRunning,
          isLeft
        });
      }
    });

    // Subtle clothing rustle on fast runs
    if (isRunning && Math.random() < 0.45) {
      this.playClothingRustle(0.12);
    }
  }

  /**
   * Play Jump takeoff sound
   */
  playJump() {
    this.audio.playSound('jump', {
      channel: 'sfx',
      volume: 0.35,
      fallback: () => {
        this.audio.synthesizer.playJumpSound();
      }
    });
    this.playClothingRustle(0.18);
  }

  /**
   * Play Landing impact sound
   * @param {number} impactVelocity 
   * @param {'concrete'|'grass'} surface 
   */
  playLand(impactVelocity = 5, surface = 'concrete') {
    const vol = Math.min(0.6, 0.25 + (impactVelocity / 20) * 0.35);
    this.audio.playSound('land', {
      channel: 'sfx',
      volume: vol,
      detune: surface === 'grass' ? -150 : 0,
      fallback: () => {
        this.audio.synthesizer.playLandSound(vol);
      }
    });
    this.playClothingRustle(0.25);
  }

  /**
   * Play subtle clothing rustle
   * @param {number} volume 
   */
  playClothingRustle(volume = 0.15) {
    this.audio.playSound('clothing', {
      channel: 'sfx',
      volume,
      detune: (Math.random() - 0.5) * 100,
      fallback: () => {
        // Soft noise pulse
        this.audio.synthesizer.playNoiseBurst(0.08, volume * 0.5, 1200);
      }
    });
  }
}
