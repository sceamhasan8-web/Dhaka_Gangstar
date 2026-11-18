// Test mathematical functions for procedural equirectangular sky
function generateSimplexNoise() {
  // Simple deterministic 2D PRNG noise for fast testing
  const p = new Uint8Array(512);
  for (let i = 0; i < 256; i++) p[i] = p[256 + i] = Math.floor(Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) * 256) % 256;
  return p;
}

const p = generateSimplexNoise();
console.log('Noise permutation table generated, length:', p.length);

// Calculate sun coordinate mapping
const sunPos = { x: 45, y: 250, z: 65 };
const len = Math.hypot(sunPos.x, sunPos.y, sunPos.z);
const sx = sunPos.x / len;
const sy = sunPos.y / len;
const sz = sunPos.z / len;

const sunPhi = Math.atan2(sx, sz);
const sunTheta = Math.asin(sy);

const u = (sunPhi / (2 * Math.PI)) + 0.5;
const v = 0.5 - (sunTheta / Math.PI);

console.log(`Sun direction: (${sx.toFixed(3)}, ${sy.toFixed(3)}, ${sz.toFixed(3)})`);
console.log(`Sun Equirectangular coords: u=${u.toFixed(4)}, v=${v.toFixed(4)}`);
console.log('Zenith angle:', ((Math.PI / 2 - sunTheta) * 180 / Math.PI).toFixed(1), 'deg from straight up');
console.log('Sky math test completed successfully!');
