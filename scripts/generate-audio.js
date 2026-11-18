import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 44100;

function createWavHeader(numSamples, numChannels = 1, sampleRate = SAMPLE_RATE) {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const subChunk2Size = numSamples * numChannels * 2;
  const chunkSize = 36 + subChunk2Size;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // BitsPerSample (16)
  header.write('data', 36);
  header.writeUInt32LE(subChunk2Size, 40);
  return header;
}

function writeWavFile(filePath, samples, numChannels = 1) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const numSamples = samples.length;
  const header = createWavHeader(numSamples, numChannels);
  const data = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intVal = s < 0 ? s * 32768 : s * 32767;
    data.writeInt16LE(Math.floor(intVal), i * 2);
  }

  fs.writeFileSync(filePath, Buffer.concat([header, data]));
  console.log(`Generated: ${filePath} (${(numSamples / SAMPLE_RATE).toFixed(2)}s)`);
}

// Simple deterministic noise
let noiseSeed = 12345;
function rand() {
  noiseSeed = (noiseSeed * 1664525 + 1013904223) % 4294967296;
  return (noiseSeed / 4294967296) * 2 - 1;
}

// -------------------------------------------------------------
// 1. CHARACTER SOUNDS
// -------------------------------------------------------------

function generateFootstep(baseFreq, scuffFreq, duration = 0.12, surface = 'concrete') {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const env = Math.exp(-progress * 22);

    // Low thump (heel impact)
    const f = baseFreq * (1.0 - progress * 0.4);
    const thump = Math.sin(2 * Math.PI * f * t);

    // Friction scuff
    const noise = rand();
    const scuffEnv = Math.exp(-progress * 35) * (surface === 'grass' ? 0.6 : 0.25);
    const scuff = Math.sin(2 * Math.PI * scuffFreq * t) * 0.3 + noise * 0.7;

    samples[i] = (thump * 0.75 + scuff * scuffEnv) * env * 0.85;
  }
  return samples;
}

function generateJump() {
  const duration = 0.28;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const env = Math.sin(progress * Math.PI) * Math.exp(-progress * 4);

    // Rising pitch whoosh / athletic spring
    const f = 110 + progress * 240;
    const tone = Math.sin(2 * Math.PI * f * t);
    const air = rand() * 0.35;

    samples[i] = (tone * 0.65 + air) * env * 0.8;
  }
  return samples;
}

function generateLand() {
  const duration = 0.25;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const env = Math.exp(-progress * 18);

    // Heavy compression impact
    const f1 = 85 * (1.0 - progress * 0.6);
    const f2 = 55 * (1.0 - progress * 0.4);
    const thump = Math.sin(2 * Math.PI * f1 * t) * 0.6 + Math.sin(2 * Math.PI * f2 * t) * 0.4;
    const scuff = rand() * Math.exp(-progress * 30) * 0.4;

    samples[i] = (thump + scuff) * env * 0.9;
  }
  return samples;
}

function generateClothing() {
  const duration = 0.18;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const progress = i / numSamples;
    const env = Math.sin(progress * Math.PI) * Math.exp(-progress * 6);
    samples[i] = rand() * env * 0.25;
  }
  return samples;
}

// -------------------------------------------------------------
// 2. VEHICLE SOUNDS
// -------------------------------------------------------------

function generateEngineLoop(baseFreq, harmonics, duration = 1.0, rumble = 0.1) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;

    harmonics.forEach((amp, idx) => {
      const harmFreq = baseFreq * (idx + 1);
      // Slight pitch wobble for organic motor feel
      const wobble = Math.sin(2 * Math.PI * 4 * t) * 0.8;
      val += Math.sin(2 * Math.PI * (harmFreq + wobble) * t) * amp;
    });

    // Low-end cylinder pulse
    val += rand() * rumble;

    // Smooth loop boundary fade
    const fadeLen = 200;
    let fade = 1.0;
    if (i < fadeLen) fade = i / fadeLen;
    else if (i > numSamples - fadeLen) fade = (numSamples - i) / fadeLen;

    samples[i] = val * fade * 0.7;
  }
  return samples;
}

function generateEngineStart() {
  const duration = 1.2;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;

    if (t < 0.6) {
      // Starter motor chug (5-6 cycles)
      const crankPhase = (t * 8) % 1.0;
      const crankPulse = Math.sin(crankPhase * Math.PI) * Math.exp(-crankPhase * 3.5);
      val = crankPulse * Math.sin(2 * Math.PI * 180 * t) * 0.6 + rand() * 0.15;
    } else {
      // Catch & rev up
      const catchProgress = (t - 0.6) / 0.6;
      const f = 70 + Math.sin(catchProgress * Math.PI * 0.5) * 110;
      val = Math.sin(2 * Math.PI * f * t) * 0.7 + Math.sin(2 * Math.PI * (f * 2) * t) * 0.3;
      val += rand() * 0.1;
    }

    samples[i] = val * 0.8;
  }
  return samples;
}

function generateEngineStop() {
  const duration = 0.85;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const env = Math.exp(-progress * 5);
    const f = 90 * (1.0 - progress * 0.75);

    const val = Math.sin(2 * Math.PI * f * t) * 0.7 + rand() * 0.1;
    samples[i] = val * env * 0.75;
  }
  return samples;
}

function generateTireRoll(duration = 1.0) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Low bandpass filtered asphalt road noise
    const noise = rand();
    const sub = Math.sin(2 * Math.PI * 65 * t) * 0.3;
    samples[i] = (noise * 0.7 + sub) * 0.35;
  }
  return samples;
}

function generateBrakeSkid() {
  const duration = 0.45;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const env = Math.sin(progress * Math.PI) * Math.exp(-progress * 2);

    const f = 950 - progress * 420;
    const screech = Math.sin(2 * Math.PI * f * t) * 0.5 + Math.sin(2 * Math.PI * (f * 1.5) * t) * 0.3;
    const friction = rand() * 0.2;

    samples[i] = (screech + friction) * env * 0.7;
  }
  return samples;
}

function generateCarHorn() {
  const duration = 0.4;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const env = Math.min(1.0, (1.0 - progress) * 4);

    // Dual tone horn: 415Hz + 495Hz
    const val = Math.sin(2 * Math.PI * 415 * t) * 0.5 + Math.sin(2 * Math.PI * 495 * t) * 0.5;
    samples[i] = val * env * 0.75;
  }
  return samples;
}

function generateBusHorn() {
  const duration = 0.55;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const env = Math.min(1.0, (1.0 - progress) * 3);

    // Triple pneumatic air horn chords (370, 440, 554 Hz)
    const val = Math.sin(2 * Math.PI * 370 * t) * 0.4 +
                Math.sin(2 * Math.PI * 440 * t) * 0.35 +
                Math.sin(2 * Math.PI * 554 * t) * 0.25;
    samples[i] = val * env * 0.85;
  }
  return samples;
}

function generateRickshawBell() {
  const duration = 0.35;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const strike = (t, strikeT) => {
    if (t < strikeT) return 0;
    const dt = t - strikeT;
    const env = Math.exp(-dt * 26);
    return (Math.sin(2 * Math.PI * 2600 * dt) * 0.6 + Math.sin(2 * Math.PI * 3200 * dt) * 0.4) * env;
  };

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const val = strike(t, 0.0) + strike(t, 0.08) + strike(t, 0.18) + strike(t, 0.25);
    samples[i] = val * 0.75;
  }
  return samples;
}

function generatePoliceSiren(duration = 1.2) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Wailing cycle between 650Hz and 950Hz
    const cycle = (Math.sin(2 * Math.PI * 1.6 * t) + 1) * 0.5;
    const f = 650 + cycle * 300;
    const val = Math.sin(2 * Math.PI * f * t);
    samples[i] = val * 0.75;
  }
  return samples;
}

function generateCrash() {
  const duration = 0.55;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const env = Math.exp(-progress * 9);

    const metal = Math.sin(2 * Math.PI * 110 * t) * 0.5 + Math.sin(2 * Math.PI * 75 * t) * 0.3;
    const shatter = rand() * 0.6;
    samples[i] = (metal + shatter) * env * 0.95;
  }
  return samples;
}

// -------------------------------------------------------------
// 3. ENVIRONMENT & NATURE SOUNDS
// -------------------------------------------------------------

function generateCityAmbience(duration = 4.0) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Distant traffic drone + low rumble
    const drone = Math.sin(2 * Math.PI * 55 * t) * 0.25 + Math.sin(2 * Math.PI * 110 * t) * 0.15;
    const air = rand() * 0.15;
    // Occasional distant horn echo
    let hornEcho = 0;
    if (t > 1.2 && t < 1.6) {
      hornEcho = Math.sin(2 * Math.PI * 440 * t) * 0.08 * Math.sin((t - 1.2) / 0.4 * Math.PI);
    }

    samples[i] = (drone + air + hornEcho) * 0.45;
  }
  return samples;
}

function generateGardenBirds(duration = 4.0) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let bird = 0;

    // Chirp burst 1 at 0.5s
    if (t > 0.5 && t < 0.75) {
      const dt = t - 0.5;
      const f = 2800 + Math.sin(dt * 60) * 800;
      bird += Math.sin(2 * Math.PI * f * t) * Math.sin((dt / 0.25) * Math.PI) * 0.35;
    }

    // Chirp burst 2 at 1.8s
    if (t > 1.8 && t < 2.1) {
      const dt = t - 1.8;
      const f = 3400 + Math.sin(dt * 75) * 600;
      bird += Math.sin(2 * Math.PI * f * t) * Math.sin((dt / 0.3) * Math.PI) * 0.4;
    }

    // Chirp burst 3 at 3.1s
    if (t > 3.1 && t < 3.4) {
      const dt = t - 3.1;
      const f = 2400 + Math.sin(dt * 50) * 900;
      bird += Math.sin(2 * Math.PI * f * t) * Math.sin((dt / 0.3) * Math.PI) * 0.35;
    }

    // Gentle breeze in leaves
    const breeze = rand() * 0.06;

    samples[i] = (bird + breeze) * 0.6;
  }
  return samples;
}

function generateFountainWater(duration = 3.0) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Babbling water stream
    const pinkNoise = rand() * 0.35;
    const bubble = Math.sin(2 * Math.PI * (350 + Math.sin(t * 12) * 80) * t) * 0.15;
    samples[i] = (pinkNoise + bubble) * 0.45;
  }
  return samples;
}

function generateWindBreeze(duration = 3.0) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Gentle atmospheric wind swell
    const swell = (Math.sin(2 * Math.PI * 0.35 * t) + 1.2) * 0.5;
    const wind = rand() * swell * 0.25;
    samples[i] = wind * 0.5;
  }
  return samples;
}

// -------------------------------------------------------------
// 4. BACKGROUND MUSIC THEMES
// -------------------------------------------------------------

function generateMainTheme(duration = 8.0) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  // 120 BPM: 0.5s per beat, 16 beats = 8.0s
  const beatLen = 0.5;
  const chordScale = [
    [220, 261.63, 329.63], // Am
    [174.61, 220, 261.63], // F
    [261.63, 329.63, 392], // C
    [196, 246.94, 293.66]  // G
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const beatIndex = Math.floor(t / beatLen);
    const chordIndex = Math.floor(beatIndex / 4) % chordScale.length;
    const chord = chordScale[chordIndex];

    // Chords (warm synth pad)
    let chordVal = 0;
    chord.forEach(f => {
      chordVal += Math.sin(2 * Math.PI * f * t) * 0.08;
    });

    // Bass Kick on beats
    const beatPhase = (t % beatLen) / beatLen;
    const kick = Math.sin(2 * Math.PI * (120 - beatPhase * 80) * t) * Math.exp(-beatPhase * 16) * 0.35;

    // Melody note (every 2 beats)
    const melodyFreqs = [440, 523.25, 659.25, 587.33, 440, 392, 523.25, 659.25];
    const mFreq = melodyFreqs[beatIndex % melodyFreqs.length];
    const mEnv = Math.exp(-beatPhase * 4) * 0.14;
    const melody = Math.sin(2 * Math.PI * mFreq * t) * mEnv;

    samples[i] = (chordVal + kick + melody) * 0.65;
  }
  return samples;
}

function generateExplorationTheme(duration = 8.0) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  // Chill hop ambient progression (D minor - Bb - C - A)
  const roots = [146.83, 116.54, 130.81, 110.0];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const barIndex = Math.floor(t / 2.0) % roots.length;
    const root = roots[barIndex];

    // Sub bass
    const bass = Math.sin(2 * Math.PI * (root / 2) * t) * 0.22;

    // Ethereal chime
    const bellFreq = root * 3;
    const barPhase = (t % 2.0) / 2.0;
    const chime = Math.sin(2 * Math.PI * bellFreq * t) * Math.exp(-barPhase * 3.5) * 0.12;

    // Snare brush on 1.0s and 3.0s
    let snare = 0;
    const snarePhase = (t % 1.0);
    if (snarePhase < 0.2) {
      snare = rand() * Math.exp(-snarePhase * 25) * 0.15;
    }

    samples[i] = (bass + chime + snare) * 0.6;
  }
  return samples;
}

// -------------------------------------------------------------
// 5. UI SOUNDS
// -------------------------------------------------------------

function generateClick() {
  const duration = 0.05;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / numSamples;
    const env = Math.exp(-progress * 35);
    samples[i] = Math.sin(2 * Math.PI * 1800 * t) * env * 0.5;
  }
  return samples;
}

function generateReward() {
  const duration = 0.45;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  const notes = [523.25, 659.25, 783.99, 1046.50];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    notes.forEach((f, idx) => {
      const startT = idx * 0.08;
      if (t >= startT) {
        const dt = t - startT;
        val += Math.sin(2 * Math.PI * f * dt) * Math.exp(-dt * 12) * 0.25;
      }
    });
    samples[i] = val * 0.8;
  }
  return samples;
}

function generateMissionComplete() {
  const duration = 0.75;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  const chords = [
    { f: [440, 554, 659], t: 0, d: 0.2 },
    { f: [493, 622, 739], t: 0.22, d: 0.2 },
    { f: [587, 739, 880], t: 0.44, d: 0.3 }
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    chords.forEach(c => {
      if (t >= c.t && t <= c.t + c.d) {
        const dt = t - c.t;
        const env = Math.sin((dt / c.d) * Math.PI);
        c.f.forEach(freq => {
          val += Math.sin(2 * Math.PI * freq * dt) * env * 0.12;
        });
      }
    });
    samples[i] = val * 0.85;
  }
  return samples;
}

// -------------------------------------------------------------
// EXECUTE ALL ASSET GENERATIONS
// -------------------------------------------------------------

console.log('=== STARTING AUTOMATIC AUDIO ASSET GENERATION ===');

// Character
writeWavFile('public/audio/character/footstep_walk_l.wav', generateFootstep(95, 1400, 0.12, 'concrete'));
writeWavFile('public/audio/character/footstep_walk_r.wav', generateFootstep(85, 1600, 0.12, 'concrete'));
writeWavFile('public/audio/character/footstep_run_l.wav', generateFootstep(115, 1800, 0.10, 'concrete'));
writeWavFile('public/audio/character/footstep_run_r.wav', generateFootstep(105, 1950, 0.10, 'concrete'));
writeWavFile('public/audio/character/footstep_grass_l.wav', generateFootstep(70, 800, 0.14, 'grass'));
writeWavFile('public/audio/character/footstep_grass_r.wav', generateFootstep(65, 850, 0.14, 'grass'));
writeWavFile('public/audio/character/jump.wav', generateJump());
writeWavFile('public/audio/character/land.wav', generateLand());
writeWavFile('public/audio/character/clothing.wav', generateClothing());

// Vehicles
writeWavFile('public/audio/vehicles/engine_start.wav', generateEngineStart());
writeWavFile('public/audio/vehicles/engine_stop.wav', generateEngineStop());
writeWavFile('public/audio/vehicles/engine_cng_idle.wav', generateEngineLoop(65, [0.6, 0.4, 0.3, 0.2], 1.2, 0.25));
writeWavFile('public/audio/vehicles/engine_cng_accel.wav', generateEngineLoop(160, [0.5, 0.5, 0.4, 0.3], 1.0, 0.3));
writeWavFile('public/audio/vehicles/engine_sedan_idle.wav', generateEngineLoop(75, [0.7, 0.3, 0.2], 1.0, 0.1));
writeWavFile('public/audio/vehicles/engine_sedan_accel.wav', generateEngineLoop(180, [0.6, 0.4, 0.3, 0.2], 1.0, 0.15));
writeWavFile('public/audio/vehicles/engine_bus_idle.wav', generateEngineLoop(45, [0.8, 0.4, 0.3, 0.1], 1.5, 0.35));
writeWavFile('public/audio/vehicles/engine_bus_accel.wav', generateEngineLoop(110, [0.7, 0.5, 0.3, 0.2], 1.2, 0.4));
writeWavFile('public/audio/vehicles/engine_bike_idle.wav', generateEngineLoop(85, [0.6, 0.5, 0.2], 1.0, 0.2));
writeWavFile('public/audio/vehicles/engine_bike_accel.wav', generateEngineLoop(220, [0.5, 0.4, 0.4, 0.3], 1.0, 0.25));
writeWavFile('public/audio/vehicles/tire_roll.wav', generateTireRoll(1.5));
writeWavFile('public/audio/vehicles/brake_skid.wav', generateBrakeSkid());
writeWavFile('public/audio/vehicles/horn_car.wav', generateCarHorn());
writeWavFile('public/audio/vehicles/horn_bus.wav', generateBusHorn());
writeWavFile('public/audio/vehicles/bell_rickshaw.wav', generateRickshawBell());
writeWavFile('public/audio/vehicles/police_siren.wav', generatePoliceSiren(1.2));
writeWavFile('public/audio/vehicles/crash.wav', generateCrash());

// Environment
writeWavFile('public/audio/environment/city_ambience.wav', generateCityAmbience(4.0));
writeWavFile('public/audio/environment/garden_birds.wav', generateGardenBirds(4.0));
writeWavFile('public/audio/environment/fountain_water.wav', generateFountainWater(3.0));
writeWavFile('public/audio/environment/wind_breeze.wav', generateWindBreeze(3.0));

// Music
writeWavFile('public/audio/music/main_theme.wav', generateMainTheme(8.0));
writeWavFile('public/audio/music/exploration_theme.wav', generateExplorationTheme(8.0));

// UI
writeWavFile('public/audio/ui/click.wav', generateClick());
writeWavFile('public/audio/ui/reward.wav', generateReward());
writeWavFile('public/audio/ui/mission_complete.wav', generateMissionComplete());

console.log('=== ALL 33 AUDIO ASSETS GENERATED SUCCESSFULLY ===');
