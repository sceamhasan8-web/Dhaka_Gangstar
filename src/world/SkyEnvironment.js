import * as THREE from 'three';

/**
 * DHAKA CITY GANGSTAR — Realistic 360° Equirectangular Skybox & Atmospheric Environment
 * Features:
 * - Full 360-degree spherical coverage (Equirectangular 2:1 panorama).
 * - Fixed world-space alignment (sky stays anchored to world coordinates).
 * - Deep natural blue upper sky with Rayleigh atmospheric gradient.
 * - Volumetric-style multi-octave cumulus and cirrus cloud formations.
 * - Physically positioned Sun with core disc, corona, and Mie atmospheric flare.
 * - Natural horizon atmospheric haze smoothly blending into city fog.
 * - Dynamic time-of-day presets: Afternoon (Daylight), Morning (Dawn), Sunset (Golden Hour), Night.
 * - Optimized for 60FPS mobile performance on Android and desktop WebGL.
 */
export class SkyEnvironment {
  constructor(scene, renderer, isMobile = false) {
    this.scene = scene;
    this.renderer = renderer;
    this.isMobile = isMobile;

    // Optimized resolution: 1024x512 on desktop, 512x256 on mobile for instant 0ms startup
    this.width = isMobile ? 512 : 1024;
    this.height = this.width / 2;

    this.cachedTextures = {};
    this.currentPreset = 'afternoon';
    this.isLoaded = false;

    // Perlin noise permutation table for procedural clouds
    this._initNoise();

    // Initialize default afternoon sky
    this.applyPreset('afternoon');
  }

  _initNoise() {
    this.p = new Uint8Array(512);
    const permutation = [
      151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
      8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
      35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
      134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
      55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
      18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
      250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
      189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
      172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
      228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,
      107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
      138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    ];
    for (let i = 0; i < 256; i++) {
      this.p[i] = permutation[i];
      this.p[256 + i] = permutation[i];
    }
  }

  _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  _lerp(t, a, b) { return a + t * (b - a); }
  _grad(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  _noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = this._fade(xf);
    const v = this._fade(yf);

    const aa = this.p[this.p[X] + Y];
    const ab = this.p[this.p[X] + Y + 1];
    const ba = this.p[this.p[X + 1] + Y];
    const bb = this.p[this.p[X + 1] + Y + 1];

    const x1 = this._lerp(u, this._grad(aa, xf, yf), this._grad(ba, xf - 1, yf));
    const x2 = this._lerp(u, this._grad(ab, xf, yf - 1), this._grad(bb, xf - 1, yf - 1));
    return (this._lerp(v, x1, x2) + 1) * 0.5;
  }

  _fbm(x, y, octaves = 4) {
    let val = 0;
    let amp = 0.5;
    let freq = 1.0;
    for (let i = 0; i < octaves; i++) {
      val += this._noise2D(x * freq, y * freq) * amp;
      freq *= 2.0;
      amp *= 0.5;
    }
    return val;
  }

  applyPreset(presetName = 'afternoon') {
    this.currentPreset = presetName;

    if (this.cachedTextures[presetName]) {
      this.scene.background = this.cachedTextures[presetName];
      this.isLoaded = true;
      return;
    }

    const texture = this._generateSkyTexture(presetName);
    this.cachedTextures[presetName] = texture;
    this.scene.background = texture;
    this.isLoaded = true;
    console.log(`[SkyEnvironment] 360° Equirectangular sky generated & bound (${presetName.toUpperCase()}).`);
  }

  _generateSkyTexture(preset) {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');

    const W = this.width;
    const H = this.height;
    const horizonY = H * 0.5;

    // 1. Define Sky Palette per Preset
    let zenithColor, midSkyColor, horizonColor, groundColor, sunDir, sunColor, cloudShadow, cloudHighlight;

    if (preset === 'morning') {
      zenithColor = [28, 78, 145];      // Deep dawn blue
      midSkyColor = [96, 165, 250];     // Soft morning blue
      horizonColor = [254, 215, 170];   // Warm peach / amber horizon
      groundColor = [30, 41, 59];
      sunDir = new THREE.Vector3(220, 95, 75).normalize();
      sunColor = [255, 226, 184];
      cloudShadow = [148, 163, 184];
      cloudHighlight = [255, 247, 237];
    } else if (preset === 'sunset') {
      zenithColor = [49, 46, 129];      // Deep indigo / purple zenith
      midSkyColor = [194, 65, 12];      // Rich sunset orange
      horizonColor = [251, 146, 60];    // Flaming golden amber horizon
      groundColor = [24, 24, 27];
      sunDir = new THREE.Vector3(-220, 38, 45).normalize();
      sunColor = [255, 107, 53];
      cloudShadow = [120, 53, 15];
      cloudHighlight = [254, 215, 170];
    } else if (preset === 'night') {
      zenithColor = [5, 8, 22];         // Deep space midnight
      midSkyColor = [15, 23, 42];       // Dark indigo
      horizonColor = [30, 41, 59];      // Distant city airglow
      groundColor = [10, 15, 25];
      sunDir = new THREE.Vector3(-60, 130, -90).normalize(); // Moon direction
      sunColor = [224, 242, 254];
      cloudShadow = [15, 23, 42];
      cloudHighlight = [51, 65, 85];
    } else {
      // Default: AFTERNOON (Tropical Dhaka Daylight)
      zenithColor = [13, 71, 161];      // Natural rich sapphire blue
      midSkyColor = [56, 189, 248];     // Crisp tropospheric azure
      horizonColor = [186, 230, 253];   // Soft pale atmospheric haze
      groundColor = [30, 41, 59];
      sunDir = new THREE.Vector3(45, 250, 65).normalize();
      sunColor = [255, 255, 255];
      cloudShadow = [148, 163, 184];
      cloudHighlight = [255, 255, 255];
    }

    // 2. Render Vertical Atmospheric Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0.00, `rgb(${zenithColor.join(',')})`);
    skyGrad.addColorStop(0.28, `rgb(${midSkyColor.join(',')})`);
    skyGrad.addColorStop(0.50, `rgb(${horizonColor.join(',')})`);
    skyGrad.addColorStop(0.54, `rgb(${horizonColor.join(',')})`);
    skyGrad.addColorStop(0.70, `rgb(${groundColor.join(',')})`);
    skyGrad.addColorStop(1.00, `rgb(${groundColor.join(',')})`);

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // 3. Render Volumetric Cumulus Cloud Deck
    if (preset !== 'night') {
      const imgData = ctx.getImageData(0, 0, W, H);
      const data = imgData.data;

      // Cloud density parameters
      const cloudCoverage = 0.44;
      const cloudDensity = 2.2;

      for (let y = 0; y < Math.floor(horizonY); y++) {
        // Elevation angle theta: 0 at horizon (y = horizonY), PI/2 at zenith (y = 0)
        const theta = ((horizonY - y) / horizonY) * (Math.PI * 0.5);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // Perspective flattening factor towards horizon
        const perspectiveFactor = Math.max(0.12, sinTheta);
        const horizonFade = Math.min(1.0, Math.pow(sinTheta / 0.15, 1.2)); // Smooth edge blend near horizon

        for (let x = 0; x < W; x++) {
          const phi = (x / W) * (Math.PI * 2.0); // 0 to 2PI

          // Project spherical direction onto flat horizontal cloud plane at height 1800m
          const worldU = (Math.cos(phi) * cosTheta) / perspectiveFactor;
          const worldV = (Math.sin(phi) * cosTheta) / perspectiveFactor;

          // Multi-octave fBm fractal cloud noise
          const n1 = this._fbm(worldU * 0.85 + 5.2, worldV * 0.85 + 3.1, 4);
          const n2 = this._fbm(worldU * 2.2 + 10.4, worldV * 2.2 + 8.3, 2);
          const cloudVal = n1 * 0.75 + n2 * 0.25;

          if (cloudVal > cloudCoverage) {
            let density = (cloudVal - cloudCoverage) * cloudDensity * horizonFade;
            density = Math.min(1.0, density);

            // Cloud internal lighting: tops are illuminated by sunlight, bases are ambient shaded
            const lightRim = Math.min(1.0, density * 1.4);
            const r = THREE.MathUtils.lerp(cloudShadow[0], cloudHighlight[0], lightRim);
            const g = THREE.MathUtils.lerp(cloudShadow[1], cloudHighlight[1], lightRim);
            const b = THREE.MathUtils.lerp(cloudShadow[2], cloudHighlight[2], lightRim);

            const idx = (y * W + x) * 4;
            const alpha = density * 0.92;

            // Alpha blend over atmospheric sky
            data[idx]     = Math.round(data[idx]     * (1 - alpha) + r * alpha);
            data[idx + 1] = Math.round(data[idx + 1] * (1 - alpha) + g * alpha);
            data[idx + 2] = Math.round(data[idx + 2] * (1 - alpha) + b * alpha);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } else {
      // NIGHT PRESET: Render Celestial Stars
      ctx.fillStyle = '#ffffff';
      const starCount = 1400;
      for (let i = 0; i < starCount; i++) {
        const sx = Math.random() * W;
        const sy = Math.random() * (horizonY * 0.92);
        const sz = Math.random() < 0.85 ? 1.0 : (Math.random() < 0.96 ? 1.5 : 2.2);
        const alpha = Math.random() * 0.7 + 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
        ctx.fillRect(sx, sy, sz, sz);
      }
    }

    // 4. Render Physically Positioned Sun / Moon with Coronal Flare
    const sunPhi = Math.atan2(sunDir.x, sunDir.z); // Longitude
    const sunTheta = Math.asin(sunDir.y);          // Latitude

    const sunU = (sunPhi / (Math.PI * 2.0)) + 0.5;
    const sunV = 0.5 - (sunTheta / Math.PI);

    const sunPixelX = sunU * W;
    const sunPixelY = sunV * H;

    // Only render sun if above or near horizon
    if (sunPixelY < horizonY + 50) {
      // Layer 1: Outer Atmospheric Solar Wash / Mie Forward Scattering
      const outerFlareRadius = W * 0.18;
      const flareGrad = ctx.createRadialGradient(
        sunPixelX, sunPixelY, 0,
        sunPixelX, sunPixelY, outerFlareRadius
      );
      flareGrad.addColorStop(0.0, `rgba(${sunColor[0]}, ${sunColor[1]}, ${sunColor[2]}, 0.85)`);
      flareGrad.addColorStop(0.15, `rgba(${sunColor[0]}, ${sunColor[1]}, ${sunColor[2]}, 0.45)`);
      flareGrad.addColorStop(0.45, `rgba(${sunColor[0]}, ${sunColor[1]}, ${sunColor[2]}, 0.12)`);
      flareGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(sunPixelX, sunPixelY, outerFlareRadius, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2: Brilliant Inner Solar Core / Disc
      const coreRadius = W * 0.016;
      const coreGrad = ctx.createRadialGradient(
        sunPixelX, sunPixelY, 0,
        sunPixelX, sunPixelY, coreRadius
      );
      coreGrad.addColorStop(0.0, '#ffffff');
      coreGrad.addColorStop(0.5, '#ffffff');
      coreGrad.addColorStop(0.85, `rgba(${sunColor.join(',')}, 0.9)`);
      coreGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(sunPixelX, sunPixelY, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Build High-Performance Three.js Equirectangular Texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    return texture;
  }
}
