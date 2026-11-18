import * as THREE from 'three';

// Ultra High-Definition PBR Procedural Texture Engine for Dhaka City Streets & Architecture

export class ProceduralTextures {
  // 1. ADVANCED SHARP ASPHALT PBR TEXTURES (Diffuse, Roughness, Normal)
  static createAsphaltPBR() {
    const size = 1024;

    // --- A. DIFFUSE TEXTURE (Richer, deeper charcoal asphalt with high-contrast aggregate & tire paths) ---
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = size;
    diffCanvas.height = size;
    const ctx = diffCanvas.getContext('2d');

    // Base rich, deep asphalt tone (saturated dark slate bitumen)
    ctx.fillStyle = '#171a1f';
    ctx.fillRect(0, 0, size, size);

    // Subtle macro variations in asphalt age
    const macroGrad = ctx.createLinearGradient(0, 0, size, size);
    macroGrad.addColorStop(0, 'rgba(28, 33, 40, 0.4)');
    macroGrad.addColorStop(0.5, 'rgba(18, 21, 26, 0.2)');
    macroGrad.addColorStop(1, 'rgba(25, 30, 36, 0.45)');
    ctx.fillStyle = macroGrad;
    ctx.fillRect(0, 0, size, size);

    // Realistic vehicle wheel path wear tracks (darker compacted asphalt along driving lines)
    const tireGrad1 = ctx.createLinearGradient(160, 0, 380, 0);
    tireGrad1.addColorStop(0, 'rgba(12, 14, 18, 0)');
    tireGrad1.addColorStop(0.5, 'rgba(10, 12, 15, 0.55)');
    tireGrad1.addColorStop(1, 'rgba(12, 14, 18, 0)');
    ctx.fillStyle = tireGrad1;
    ctx.fillRect(160, 0, 220, size);

    const tireGrad2 = ctx.createLinearGradient(640, 0, 860, 0);
    tireGrad2.addColorStop(0, 'rgba(12, 14, 18, 0)');
    tireGrad2.addColorStop(0.5, 'rgba(10, 12, 15, 0.55)');
    tireGrad2.addColorStop(1, 'rgba(12, 14, 18, 0)');
    ctx.fillStyle = tireGrad2;
    ctx.fillRect(640, 0, 220, size);

    // High-density sharp aggregate mineral stone grains (75,000 multi-tone specks)
    const stoneTones = [
      '#282e38', '#343b47', '#424c5b', '#566375', '#6b7a90',
      '#3f382e', '#4f473b', '#20242b', '#131518'
    ];
    for (let i = 0; i < 75000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const s = Math.random() < 0.85 ? 1.5 : (Math.random() < 0.95 ? 2.5 : 3.5);
      ctx.fillStyle = stoneTones[Math.floor(Math.random() * stoneTones.length)];
      ctx.fillRect(x, y, s, s);
    }

    // Road repair asphalt tar patches (rich dark glossy mastic repairs)
    ctx.fillStyle = '#0f1115';
    ctx.beginPath();
    ctx.ellipse(310, 460, 95, 50, 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(760, 240, 80, 42, -0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(490, 810, 110, 55, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Asphalt spiderweb crack networks with black sealant
    ctx.strokeStyle = '#0a0b0e';
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(110, 170);
    ctx.lineTo(155, 215);
    ctx.lineTo(205, 195);
    ctx.lineTo(265, 265);
    ctx.lineTo(290, 255);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(710, 680);
    ctx.lineTo(755, 715);
    ctx.lineTo(820, 690);
    ctx.lineTo(870, 750);
    ctx.stroke();

    const diffuse = new THREE.CanvasTexture(diffCanvas);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.repeat.set(1, 1);
    diffuse.anisotropy = 16;
    diffuse.colorSpace = THREE.SRGBColorSpace;

    // --- B. ROUGHNESS MAP (Vivid PBR contrast: Matte aggregate vs glossy tar & wheel paths) ---
    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = size;
    roughCanvas.height = size;
    const rctx = roughCanvas.getContext('2d');

    // Base aggregate roughness (matte, diffuse light scattering)
    rctx.fillStyle = '#bfbfbf'; // ~0.75
    rctx.fillRect(0, 0, size, size);

    // Smoother wheel paths (subtle road sheen)
    rctx.fillStyle = 'rgba(80, 80, 80, 0.4)';
    rctx.fillRect(160, 0, 220, size);
    rctx.fillRect(640, 0, 220, size);

    // Aggregate micro-roughness variations
    for (let i = 0; i < 30000; i++) {
      const rx = Math.random() * size;
      const ry = Math.random() * size;
      const v = Math.random() > 0.5 ? '#e0e0e0' : '#888888';
      rctx.fillStyle = v;
      rctx.fillRect(rx, ry, 2, 2);
    }

    // Glossy tar repair patches (low roughness -> sharp specular reflections)
    rctx.fillStyle = '#2d2d2d'; // ~0.18 roughness (very glossy)
    rctx.beginPath();
    rctx.ellipse(310, 460, 95, 50, 0.35, 0, Math.PI * 2);
    rctx.fill();
    rctx.beginPath();
    rctx.ellipse(760, 240, 80, 42, -0.28, 0, Math.PI * 2);
    rctx.fill();
    rctx.beginPath();
    rctx.ellipse(490, 810, 110, 55, 0.15, 0, Math.PI * 2);
    rctx.fill();

    // Glossy tar sealant crack lines
    rctx.strokeStyle = '#222222';
    rctx.lineWidth = 3.5;
    rctx.beginPath();
    rctx.moveTo(110, 170);
    rctx.lineTo(155, 215);
    rctx.lineTo(205, 195);
    rctx.lineTo(265, 265);
    rctx.lineTo(290, 255);
    rctx.stroke();

    rctx.beginPath();
    rctx.moveTo(710, 680);
    rctx.lineTo(755, 715);
    rctx.lineTo(820, 690);
    rctx.lineTo(870, 750);
    rctx.stroke();

    const roughness = new THREE.CanvasTexture(roughCanvas);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(1, 1);
    roughness.anisotropy = 16;

    // --- C. NORMAL MAP (True Tangent-Space Normal Map for 3D Micro-Depth) ---
    const normCanvas = document.createElement('canvas');
    normCanvas.width = size;
    normCanvas.height = size;
    const nctx = normCanvas.getContext('2d');

    // Flat normal vector (0, 0, 1) in RGB space: rgb(128, 128, 255)
    nctx.fillStyle = 'rgb(128, 128, 255)';
    nctx.fillRect(0, 0, size, size);

    // Generate normal perturbations for aggregate bumps
    for (let i = 0; i < 40000; i++) {
      const nx = Math.random() * size;
      const ny = Math.random() * size;
      const dx = Math.floor(128 + (Math.random() - 0.5) * 60);
      const dy = Math.floor(128 + (Math.random() - 0.5) * 60);
      nctx.fillStyle = `rgb(${dx}, ${dy}, 240)`;
      nctx.fillRect(nx, ny, 2, 2);
    }

    // Tar patch beveled edges in normal map
    nctx.strokeStyle = 'rgb(105, 145, 230)';
    nctx.lineWidth = 4;
    nctx.beginPath();
    nctx.ellipse(310, 460, 95, 50, 0.35, 0, Math.PI * 2);
    nctx.stroke();

    nctx.beginPath();
    nctx.ellipse(760, 240, 80, 42, -0.28, 0, Math.PI * 2);
    nctx.stroke();

    // Crack indentations
    nctx.strokeStyle = 'rgb(145, 110, 220)';
    nctx.lineWidth = 2.5;
    nctx.beginPath();
    nctx.moveTo(110, 170);
    nctx.lineTo(155, 215);
    nctx.lineTo(205, 195);
    nctx.lineTo(265, 265);
    nctx.lineTo(290, 255);
    nctx.stroke();

    const normal = new THREE.CanvasTexture(normCanvas);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(1, 1);
    normal.anisotropy = 16;

    return { diffuse, roughness, normal };
  }

  // 2. ULTRA-REALISTIC INTERLOCKING PAVER TILE SIDEWALK (Full PBR: Diffuse, Roughness, Normal)
  static createPaverTilePBR() {
    const size = 1024;

    // --- A. DIFFUSE TEXTURE (Warm granite concrete, multi-stone tone variation, sharp bevels) ---
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = size;
    diffCanvas.height = size;
    const ctx = diffCanvas.getContext('2d');

    // Base concrete bedding foundation
    ctx.fillStyle = '#9aa5b4';
    ctx.fillRect(0, 0, size, size);

    // Individual rectangular paving stone tiles (128x64 pixels -> ~0.4m x 0.2m realistic scale)
    const tileW = 128;
    const tileH = 64;

    // Palette of natural urban concrete paver tones (warm buff, pearl gray, sandstone, limestone)
    const paverTones = [
      { r: 205, g: 212, b: 220 }, // Pearl concrete
      { r: 218, g: 215, b: 204 }, // Warm buff limestone
      { r: 194, g: 202, b: 210 }, // Neutral urban granite
      { r: 210, g: 206, b: 198 }, // Weathered sand
      { r: 186, g: 196, b: 206 }, // Cool slate gray
      { r: 222, g: 218, b: 210 }  // Fresh cast concrete
    ];

    for (let y = 0; y < size; y += tileH) {
      const row = Math.floor(y / tileH);
      const offsetX = (row % 2) * (tileW / 2);

      for (let x = -tileW; x < size + tileW; x += tileW) {
        const tone = paverTones[Math.floor(Math.random() * paverTones.length)];
        const tint = Math.floor((Math.random() - 0.5) * 18);
        const r = Math.max(160, Math.min(240, tone.r + tint));
        const g = Math.max(160, Math.min(240, tone.g + tint));
        const b = Math.max(160, Math.min(240, tone.b + tint));

        const px = x + offsetX + 3;
        const py = y + 3;
        const pw = tileW - 6;
        const ph = tileH - 6;

        // Paver body
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(px, py, pw, ph);

        // Top and Left beveled sun highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.fillRect(px, py, pw, 3.5);
        ctx.fillRect(px, py, 3.5, ph);

        // Bottom and Right beveled cast shadow
        ctx.fillStyle = 'rgba(20, 24, 30, 0.32)';
        ctx.fillRect(px, py + ph - 3.5, pw, 3.5);
        ctx.fillRect(px + pw - 3.5, py, 3.5, ph);

        // Fine mineral aggregate specks across paver face
        for (let p = 0; p < 65; p++) {
          const sx = px + 4 + Math.random() * (pw - 8);
          const sy = py + 4 + Math.random() * (ph - 8);
          ctx.fillStyle = Math.random() > 0.45 ? 'rgba(30,35,42,0.18)' : 'rgba(255,255,255,0.28)';
          ctx.fillRect(sx, sy, 1.8, 1.8);
        }
      }
    }

    // Deep, crisp recessed expansion joints between pavers
    ctx.strokeStyle = '#1a1f26';
    ctx.lineWidth = 4.0;
    for (let y = 0; y <= size; y += tileH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    for (let y = 0; y < size; y += tileH) {
      const row = Math.floor(y / tileH);
      const offsetX = (row % 2) * (tileW / 2);
      for (let x = -tileW; x <= size + tileW; x += tileW) {
        ctx.beginPath();
        ctx.moveTo(x + offsetX, y);
        ctx.lineTo(x + offsetX, y + tileH);
        ctx.stroke();
      }
    }

    const diffuse = new THREE.CanvasTexture(diffCanvas);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.repeat.set(1, 1);
    diffuse.anisotropy = 16;
    diffuse.colorSpace = THREE.SRGBColorSpace;

    // --- B. ROUGHNESS MAP (Vivid specular contrast: smooth stone vs matte grout) ---
    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = size;
    roughCanvas.height = size;
    const rctx = roughCanvas.getContext('2d');

    // Stone face roughness (~0.68)
    rctx.fillStyle = '#ababab';
    rctx.fillRect(0, 0, size, size);

    // Tile micro-roughness variations
    for (let i = 0; i < 25000; i++) {
      const rx = Math.random() * size;
      const ry = Math.random() * size;
      rctx.fillStyle = Math.random() > 0.5 ? '#c0c0c0' : '#909090';
      rctx.fillRect(rx, ry, 2.5, 2.5);
    }

    // Deep rough grout lines (~0.95 non-reflective)
    rctx.strokeStyle = '#f2f2f2';
    rctx.lineWidth = 5.0;
    for (let y = 0; y <= size; y += tileH) {
      rctx.beginPath();
      rctx.moveTo(0, y);
      rctx.lineTo(size, y);
      rctx.stroke();
    }
    for (let y = 0; y < size; y += tileH) {
      const row = Math.floor(y / tileH);
      const offsetX = (row % 2) * (tileW / 2);
      for (let x = -tileW; x <= size + tileW; x += tileW) {
        rctx.beginPath();
        rctx.moveTo(x + offsetX, y);
        rctx.lineTo(x + offsetX, y + tileH);
        rctx.stroke();
      }
    }

    const roughness = new THREE.CanvasTexture(roughCanvas);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(1, 1);
    roughness.anisotropy = 16;

    // --- C. NORMAL MAP (True Tangent-Space Normal for 3D Beveled Pavers) ---
    const normCanvas = document.createElement('canvas');
    normCanvas.width = size;
    normCanvas.height = size;
    const nctx = normCanvas.getContext('2d');

    // Flat normal (0, 0, 1) in RGB -> rgb(128, 128, 255)
    nctx.fillStyle = 'rgb(128, 128, 255)';
    nctx.fillRect(0, 0, size, size);

    // Bevel normal perturbations
    for (let y = 0; y < size; y += tileH) {
      const row = Math.floor(y / tileH);
      const offsetX = (row % 2) * (tileW / 2);

      for (let x = -tileW; x < size + tileW; x += tileW) {
        const px = x + offsetX + 3;
        const py = y + 3;
        const pw = tileW - 6;
        const ph = tileH - 6;

        // Top bevel slope (facing up +Y)
        nctx.fillStyle = 'rgb(128, 185, 230)';
        nctx.fillRect(px, py, pw, 3.5);

        // Left bevel slope (facing left -X)
        nctx.fillStyle = 'rgb(75, 128, 230)';
        nctx.fillRect(px, py, 3.5, ph);

        // Bottom bevel slope (facing down -Y)
        nctx.fillStyle = 'rgb(128, 70, 230)';
        nctx.fillRect(px, py + ph - 3.5, pw, 3.5);

        // Right bevel slope (facing right +X)
        nctx.fillStyle = 'rgb(180, 128, 230)';
        nctx.fillRect(px + pw - 3.5, py, 3.5, ph);
      }
    }

    // Micro surface bump perturbations
    for (let i = 0; i < 20000; i++) {
      const nx = Math.random() * size;
      const ny = Math.random() * size;
      const dx = Math.floor(128 + (Math.random() - 0.5) * 45);
      const dy = Math.floor(128 + (Math.random() - 0.5) * 45);
      nctx.fillStyle = `rgb(${dx}, ${dy}, 245)`;
      nctx.fillRect(nx, ny, 2, 2);
    }

    const normal = new THREE.CanvasTexture(normCanvas);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(1, 1);
    normal.anisotropy = 16;

    return { diffuse, roughness, normal };
  }

  // 2B. TACTILE WARNING PAVING TILES (Yellow Blister Studs for Crossings & Bus Stops)
  static createTactilePaverPBR() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Rich safety yellow base
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, size, size);

    // Blister studs grid (raised warning dots)
    const spacing = 32;
    const radius = 8.5;

    for (let y = spacing / 2; y < size; y += spacing) {
      for (let x = spacing / 2; x < size; x += spacing) {
        // Base shadow
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(x + 1.5, y + 1.5, radius, 0, Math.PI * 2);
        ctx.fill();

        // Dome top
        const grad = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, radius);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.65, '#f59e0b');
        grad.addColorStop(1, '#d97706');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Tile perimeter grout seam
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(2, 2, size - 4, size - 4);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // 2C. LUSH TROPICAL ROADSIDE GRASS (Rich chlorophyll emerald with blade striations)
  static createGrassPBR() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Deep rich tropical turf foundation
    ctx.fillStyle = '#1e3a1e';
    ctx.fillRect(0, 0, size, size);

    // Multi-tone green grass tufts & blade layers
    const grassColors = [
      '#2d6a2e', '#3b873e', '#4da150', '#255826',
      '#56b35a', '#347837', '#1b4d1c', '#68c46c'
    ];

    for (let i = 0; i < 45000; i++) {
      const gx = Math.random() * size;
      const gy = Math.random() * size;
      const len = 3 + Math.random() * 5;
      const c = grassColors[Math.floor(Math.random() * grassColors.length)];

      ctx.strokeStyle = c;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + (Math.random() - 0.5) * 3, gy - len);
      ctx.stroke();
    }

    // Micro flower specks (white and yellow clover accents)
    for (let f = 0; f < 350; f++) {
      const fx = Math.random() * size;
      const fy = Math.random() * size;
      ctx.fillStyle = Math.random() > 0.3 ? '#fef08a' : '#ffffff';
      ctx.fillRect(fx, fy, 2.5, 2.5);
    }

    const diffuse = new THREE.CanvasTexture(canvas);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.repeat.set(1, 1);
    diffuse.anisotropy = 16;
    diffuse.colorSpace = THREE.SRGBColorSpace;
    return diffuse;
  }

  // 2D. TROPICAL TREE BARK TEXTURE (Vertical fissured bark for Dhaka trees)
  static createBarkTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep aged wood foundation
    ctx.fillStyle = '#3a291e';
    ctx.fillRect(0, 0, 256, 512);

    // Vertical fissured bark grain
    const barkTones = ['#4d3728', '#5c4332', '#2d1f16', '#6a4d3a', '#22170f'];
    for (let i = 0; i < 18000; i++) {
      const bx = Math.random() * 256;
      const by = Math.random() * 512;
      const h = 8 + Math.random() * 28;
      ctx.fillStyle = barkTones[Math.floor(Math.random() * barkTones.length)];
      ctx.fillRect(bx, by, 1.8, h);
    }

    // Deep bark fissure grooves
    ctx.strokeStyle = '#18110b';
    ctx.lineWidth = 2.5;
    for (let x = 12; x < 256; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x + (Math.random() - 0.5) * 6, 0);
      for (let y = 30; y < 512; y += 40) {
        ctx.lineTo(x + (Math.random() - 0.5) * 10, y);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 2);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // 3. DHAKA BEVELED KERBSTONE CURB (High-Contrast Saturated Yellow & Black)
  static createCurbTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Alternating Vibrant Yellow and Deep Black segments (Dhaka road safety curbs)
    const segW = 64;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#ffb300' : '#111418';
      ctx.fillRect(i * segW, 0, segW, 64);

      // Micro-texture concrete scuffs
      for (let s = 0; s < 140; s++) {
        const sx = i * segW + Math.random() * segW;
        const sy = Math.random() * 64;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)';
        ctx.fillRect(sx, sy, 2, 2.5);
      }
    }

    // Top curb bevel highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(0, 0, 256, 6);

    // Bottom shadow line
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 58, 256, 6);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // 4. CAST-IRON STORM DRAINAGE GRATES & MANHOLES
  static createDrainGrateTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Cast iron dark base
    ctx.fillStyle = '#1e2126';
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = '#3d4450';
    ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, 122, 122);

    // Metallic highlight rim
    ctx.strokeStyle = '#626d80';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 6, 116, 116);

    // Deep slotted gutter grates
    ctx.fillStyle = '#060709';
    for (let y = 14; y < 114; y += 14) {
      ctx.fillRect(10, y, 108, 7);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  static createShopSignTextures() {
    const signs = [
      { bg: '#008751', text: 'হাজী বিরিয়ানি', sub: 'HAJI BIRYANI • PURAN DHAKA', accent: '#ffb800' },
      { bg: '#b31217', text: 'ভাই ভাই হোটেল', sub: 'BHAI BHAI HOTEL & RESTAURANT', accent: '#ffffff' },
      { bg: '#104e8b', text: 'আল-মদিনা ডিপার্টমেন্টাল স্টোর', sub: 'AL-MADINA SUPER STORE', accent: '#ffcc00' },
      { bg: '#e65100', text: 'মায়ের দোয়া ওয়ার্কশপ', sub: 'MAYER DUA AUTO PARTS & TUNING', accent: '#ffff00' },
      { bg: '#4a148c', text: 'ঢাকা ডায়াগনস্টিক', sub: 'DHAKA MEDICAL & PHARMACY', accent: '#00e5ff' },
      { bg: '#1b5e20', text: 'বাপের রাস্তা নয়!', sub: 'DRIVE SAFELY • TRAFFIC POLICE', accent: '#ff3d00' }
    ];

    return signs.map(item => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 512, 128);
      grad.addColorStop(0, item.bg);
      grad.addColorStop(1, '#0c1017');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 128);

      ctx.strokeStyle = item.accent;
      ctx.lineWidth = 6;
      ctx.strokeRect(4, 4, 504, 120);

      ctx.fillStyle = item.accent;
      ctx.font = 'bold 42px "Tiro Bangla", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = item.accent;
      ctx.shadowBlur = 10;
      ctx.fillText(item.text, 256, 48);

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Rajdhani", sans-serif';
      ctx.fillText(item.sub, 256, 92);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      return tex;
    });
  }

  static createRickshawArtTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffbe00';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#d62246';
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 244, 244);

    ctx.strokeStyle = '#008751';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, 224, 224);

    ctx.fillStyle = '#008751';
    ctx.beginPath();
    ctx.arc(128, 140, 50, 0, Math.PI, true);
    ctx.fill();

    const colors = ['#d62246', '#00b4d8', '#ff007f', '#48cae4', '#7209b7'];
    for (let i = 0; i < 9; i++) {
      const angle = (Math.PI / 10) * (i + 1);
      const x = 128 + Math.cos(angle + Math.PI) * 70;
      const y = 140 + Math.sin(angle + Math.PI) * 70;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#0077b6';
    ctx.beginPath();
    ctx.ellipse(128, 115, 14, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(128, 85, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 24px "Tiro Bangla", sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText('ঢাকা মেট্রো', 128, 220);
    ctx.fillText('ঢাকা মেট্রো', 128, 220);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  static createBrickTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8f382a';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#c9b79c';
    ctx.lineWidth = 3;

    const rowH = 16;
    const brickW = 32;

    for (let y = 0; y < 256; y += rowH) {
      const offset = (Math.floor(y / rowH) % 2) * (brickW / 2);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();

      for (let x = -brickW; x < 256 + brickW; x += brickW) {
        ctx.beginPath();
        ctx.moveTo(x + offset, y);
        ctx.lineTo(x + offset, y + rowH);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // 5. USA SUBURBAN WHITE CONCRETE SIDEWALK (Full PBR: Diffuse, Roughness, Normal)
  static createWhiteSuburbanConcretePBR() {
    const size = 1024;
    const slabSize = 256; // 4x4 large square concrete slabs (1.5m x 1.5m scale)

    // --- A. DIFFUSE TEXTURE ---
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = size;
    diffCanvas.height = size;
    const ctx = diffCanvas.getContext('2d');

    // Bedding tone
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, size, size);

    // Natural white concrete slab palette
    const slabTones = [
      { r: 246, g: 248, b: 250 }, // Fresh white concrete
      { r: 241, g: 245, b: 249 }, // Light pearl
      { r: 248, g: 250, b: 252 }, // Bright limestone
      { r: 236, g: 240, b: 246 }, // Warm white cast
      { r: 244, g: 246, b: 248 }, // Clean poured slab
      { r: 238, g: 242, b: 247 }  // Subtle slate-white
    ];

    for (let y = 0; y < size; y += slabSize) {
      for (let x = 0; x < size; x += slabSize) {
        const tone = slabTones[Math.floor(Math.random() * slabTones.length)];
        const tint = Math.floor((Math.random() - 0.5) * 6);
        const r = Math.min(255, Math.max(225, tone.r + tint));
        const g = Math.min(255, Math.max(225, tone.g + tint));
        const b = Math.min(255, Math.max(225, tone.b + tint));

        const px = x + 2.5;
        const py = y + 2.5;
        const pw = slabSize - 5;
        const ph = slabSize - 5;

        // Slab body
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(px, py, pw, ph);

        // Chamfered / tooled top & left sun bevel highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fillRect(px, py, pw, 3.0);
        ctx.fillRect(px, py, 3.0, ph);

        // Bottom & right edge shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
        ctx.fillRect(px, py + ph - 3.0, pw, 3.0);
        ctx.fillRect(px + pw - 3.0, py, 3.0, ph);

        // Fine broom-finish transverse micro-striations (anti-slip broom texture)
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.08)';
        ctx.lineWidth = 1.0;
        for (let s = py + 4; s < py + ph - 4; s += 3.5) {
          ctx.beginPath();
          ctx.moveTo(px + 4, s);
          ctx.lineTo(px + pw - 4, s);
          ctx.stroke();
        }

        // Quartz sand aggregate specks
        for (let p = 0; p < 75; p++) {
          const sx = px + 4 + Math.random() * (pw - 8);
          const sy = py + 4 + Math.random() * (ph - 8);
          ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255,255,255,0.45)' : 'rgba(30,41,59,0.12)';
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
      }
    }

    // Crisp tooled expansion control joints
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4.0;
    for (let i = 0; i <= size; i += slabSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
    }

    const diffuse = new THREE.CanvasTexture(diffCanvas);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.repeat.set(1, 1);
    diffuse.anisotropy = 16;
    diffuse.colorSpace = THREE.SRGBColorSpace;

    // --- B. ROUGHNESS MAP ---
    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = size;
    roughCanvas.height = size;
    const rctx = roughCanvas.getContext('2d');

    rctx.fillStyle = '#b0b5bd'; // ~0.70 roughness (matte broom concrete)
    rctx.fillRect(0, 0, size, size);

    // Micro roughness noise
    for (let i = 0; i < 20000; i++) {
      const rx = Math.random() * size;
      const ry = Math.random() * size;
      rctx.fillStyle = Math.random() > 0.5 ? '#c5cad2' : '#9ca3af';
      rctx.fillRect(rx, ry, 2, 2);
    }

    // High roughness in joint grooves (~0.94)
    rctx.strokeStyle = '#f1f5f9';
    rctx.lineWidth = 5.0;
    for (let i = 0; i <= size; i += slabSize) {
      rctx.beginPath();
      rctx.moveTo(0, i);
      rctx.lineTo(size, i);
      rctx.stroke();

      rctx.beginPath();
      rctx.moveTo(i, 0);
      rctx.lineTo(i, size);
      rctx.stroke();
    }

    const roughness = new THREE.CanvasTexture(roughCanvas);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(1, 1);
    roughness.anisotropy = 16;

    // --- C. NORMAL MAP ---
    const normCanvas = document.createElement('canvas');
    normCanvas.width = size;
    normCanvas.height = size;
    const nctx = normCanvas.getContext('2d');

    nctx.fillStyle = 'rgb(128, 128, 255)';
    nctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += slabSize) {
      for (let x = 0; x < size; x += slabSize) {
        const px = x + 2.5;
        const py = y + 2.5;
        const pw = slabSize - 5;
        const ph = slabSize - 5;

        // Top bevel (+Y)
        nctx.fillStyle = 'rgb(128, 185, 230)';
        nctx.fillRect(px, py, pw, 3.0);
        // Left bevel (-X)
        nctx.fillStyle = 'rgb(75, 128, 230)';
        nctx.fillRect(px, py, 3.0, ph);
        // Bottom bevel (-Y)
        nctx.fillStyle = 'rgb(128, 70, 230)';
        nctx.fillRect(px, py + ph - 3.0, pw, 3.0);
        // Right bevel (+X)
        nctx.fillStyle = 'rgb(180, 128, 230)';
        nctx.fillRect(px + pw - 3.0, py, 3.0, ph);
      }
    }

    // Micro surface bump perturbations
    for (let i = 0; i < 20000; i++) {
      const nx = Math.random() * size;
      const ny = Math.random() * size;
      const dx = Math.floor(128 + (Math.random() - 0.5) * 35);
      const dy = Math.floor(128 + (Math.random() - 0.5) * 35);
      nctx.fillStyle = `rgb(${dx}, ${dy}, 248)`;
      nctx.fillRect(nx, ny, 2, 2);
    }

    const normal = new THREE.CanvasTexture(normCanvas);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(1, 1);
    normal.anisotropy = 16;

    return { diffuse, roughness, normal };
  }

  // 6. USA RESIDENTIAL DRIVEWAY CONCRETE (Full PBR: Diffuse, Roughness, Normal)
  static createDrivewayConcretePBR() {
    const size = 1024;
    const panelSize = 512; // 2x2 large driveway panels (~3m x 3m scale)

    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = size;
    diffCanvas.height = size;
    const ctx = diffCanvas.getContext('2d');

    // Crisp white-pearl base
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += panelSize) {
      for (let x = 0; x < size; x += panelSize) {
        const px = x + 3;
        const py = y + 3;
        const pw = panelSize - 6;
        const ph = panelSize - 6;

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(px, py, pw, ph);

        // Smooth troweled edge border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);

        // Faint broom-finish striations
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        ctx.lineWidth = 1;
        for (let s = py + 8; s < py + ph - 8; s += 4) {
          ctx.beginPath();
          ctx.moveTo(px + 8, s);
          ctx.lineTo(px + pw - 8, s);
          ctx.stroke();
        }

        // Faint vehicle tire track sheen
        ctx.fillStyle = 'rgba(100, 116, 139, 0.04)';
        ctx.fillRect(px + pw * 0.18, py, pw * 0.22, ph);
        ctx.fillRect(px + pw * 0.60, py, pw * 0.22, ph);
      }
    }

    // Deep control joints
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4.5;
    for (let i = 0; i <= size; i += panelSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
    }

    const diffuse = new THREE.CanvasTexture(diffCanvas);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.repeat.set(1, 1);
    diffuse.anisotropy = 16;
    diffuse.colorSpace = THREE.SRGBColorSpace;

    // Roughness
    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = size;
    roughCanvas.height = size;
    const rctx = roughCanvas.getContext('2d');
    rctx.fillStyle = '#a8b0b8'; // ~0.67
    rctx.fillRect(0, 0, size, size);

    // Smoother tire tracks
    rctx.fillStyle = 'rgba(80, 80, 80, 0.25)';
    for (let y = 0; y < size; y += panelSize) {
      for (let x = 0; x < size; x += panelSize) {
        rctx.fillRect(x + panelSize * 0.18, y, panelSize * 0.22, panelSize);
        rctx.fillRect(x + panelSize * 0.60, y, panelSize * 0.22, panelSize);
      }
    }

    // Joints rough
    rctx.strokeStyle = '#f1f5f9';
    rctx.lineWidth = 5;
    for (let i = 0; i <= size; i += panelSize) {
      rctx.beginPath();
      rctx.moveTo(0, i);
      rctx.lineTo(size, i);
      rctx.stroke();
      rctx.beginPath();
      rctx.moveTo(i, 0);
      rctx.lineTo(i, size);
      rctx.stroke();
    }

    const roughness = new THREE.CanvasTexture(roughCanvas);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(1, 1);
    roughness.anisotropy = 16;

    // Normal
    const normCanvas = document.createElement('canvas');
    normCanvas.width = size;
    normCanvas.height = size;
    const nctx = normCanvas.getContext('2d');
    nctx.fillStyle = 'rgb(128, 128, 255)';
    nctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += panelSize) {
      for (let x = 0; x < size; x += panelSize) {
        const px = x + 3;
        const py = y + 3;
        const pw = panelSize - 6;
        const ph = panelSize - 6;
        nctx.fillStyle = 'rgb(128, 185, 230)';
        nctx.fillRect(px, py, pw, 3.5);
        nctx.fillStyle = 'rgb(75, 128, 230)';
        nctx.fillRect(px, py, 3.5, ph);
        nctx.fillStyle = 'rgb(128, 70, 230)';
        nctx.fillRect(px, py + ph - 3.5, pw, 3.5);
        nctx.fillStyle = 'rgb(180, 128, 230)';
        nctx.fillRect(px + pw - 3.5, py, 3.5, ph);
      }
    }

    const normal = new THREE.CanvasTexture(normCanvas);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(1, 1);
    normal.anisotropy = 16;

    return { diffuse, roughness, normal };
  }

  // 7. CLEAN WHITE SUBURBAN CURB
  static createWhiteSuburbanCurbPBR() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Clean bright white/light-pearl concrete
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 512, 64);

    // Subtle concrete texture
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 64;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.4)' : 'rgba(148,163,184,0.12)';
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // Top bullnose curb bevel highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillRect(0, 0, 512, 7);

    // Bottom gutter shadow line
    ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
    ctx.fillRect(0, 57, 512, 7);

    // Expansion joints every 128px (represents ~3m)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3.5;
    for (let x = 128; x < 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 64);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // 8. USA SUBURBAN HOUSE SIDING (Horizontal Lap Siding / Weatherboard)
  static createHouseSidingTexture(baseColor = '#f8fafc', shadowColor = '#94a3b8') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    const plankH = 32; // 16 horizontal siding boards
    for (let y = 0; y < 512; y += plankH) {
      // Board top highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fillRect(0, y, 512, 2.5);

      // Board bottom shadow groove
      ctx.fillStyle = shadowColor;
      ctx.fillRect(0, y + plankH - 3.5, 512, 3.5);

      // Fine wood grain micro-striations
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
      ctx.lineWidth = 1;
      for (let s = y + 4; s < y + plankH - 4; s += 5) {
        ctx.beginPath();
        ctx.moveTo(0, s);
        ctx.lineTo(512, s);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // 9. ARCHITECTURAL ROOF SHINGLES (Dark Charcoal / Slate Dimensional Shingles)
  static createHouseShinglePBR() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dark slate base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 512);

    const rowH = 24;
    const tabW = 48;
    const shingleTones = ['#0f172a', '#1e293b', '#334155', '#1a2233', '#253347'];

    for (let y = 0; y < 512; y += rowH) {
      const row = Math.floor(y / rowH);
      const offsetX = (row % 2) * (tabW / 2);

      // Course drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, y, 512, 4.0);

      for (let x = -tabW; x < 512 + tabW; x += tabW) {
        const tone = shingleTones[Math.floor(Math.random() * shingleTones.length)];
        ctx.fillStyle = tone;
        ctx.fillRect(x + offsetX + 1.5, y + 3, tabW - 3, rowH - 4);

        // Granule texture
        for (let g = 0; g < 15; g++) {
          const gx = x + offsetX + 2 + Math.random() * (tabW - 5);
          const gy = y + 4 + Math.random() * (rowH - 7);
          ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.3)';
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 6);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // 10. RAISED-PANEL CARRIAGE HOUSE GARAGE DOOR
  static createGarageDoorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');

    // Clean white door
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 384);

    // Frame border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 506, 378);

    // 4 Horizontal Tiers
    const tierH = 384 / 4;
    const panelW = 512 / 4;

    for (let row = 0; row < 4; row++) {
      const y = row * tierH;

      // Tier horizontal seam
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();

      for (let col = 0; col < 4; col++) {
        const x = col * panelW;
        const px = x + 8;
        const py = y + 8;
        const pw = panelW - 16;
        const ph = tierH - 16;

        if (row === 0) {
          // Top row: Glazed decorative windows with dark mullions
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(px, py, pw, ph);

          // Glass pane
          ctx.fillStyle = '#475569';
          ctx.fillRect(px + 3, py + 3, pw - 6, ph - 6);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(px + 5, py + 5, (pw - 14) / 2, ph - 10);
          ctx.fillRect(px + pw / 2 + 2, py + 5, (pw - 14) / 2, ph - 10);

          // Highlight
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fillRect(px + 6, py + 6, (pw - 14) / 2 - 4, 6);
        } else {
          // Raised rectangular panels
          // Outer shadow bevel
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(px, py, pw, ph);

          // Inner raised field
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 4, py + 4, pw - 8, ph - 8);

          // Top & left bevel highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(px + 4, py + 4, pw - 8, 3);
          ctx.fillRect(px + 4, py + 4, 3, ph - 8);

          // Bottom & right bevel shadow
          ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.fillRect(px + 4, py + ph - 7, pw - 8, 3);
          ctx.fillRect(px + pw - 7, py + 4, 3, ph - 8);
        }
      }
    }

    // Carriage house hardware (handles in center tier)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(256 - 4, 2 * tierH + 30, 8, 36);
    ctx.fillRect(256 + 12, 2 * tierH + 30, 8, 36);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    return texture;
  }
}
