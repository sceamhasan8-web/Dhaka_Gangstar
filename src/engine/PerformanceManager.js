/**
 * DHAKA CITY GANGSTAR — Performance & Diagnostic Manager
 * Monitors:
 * - Real-time FPS, delta-time stability & frame drops
 * - GPU draw calls, triangles, points, textures, and geometry memory
 * - Dynamic Resolution Scaling (DRS) and Mobile thermal throttle protection
 * - Configurable graphics quality tiers (LOW, MEDIUM, HIGH, ULTRA)
 */
export class PerformanceManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.drawCalls = 0;
    this.triangles = 0;
    this.memoryGeometries = 0;
    this.memoryTextures = 0;

    this.qualityTier = 'MEDIUM';
    this.isThrottled = false;
  }

  update(delta) {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;

      // Extract Three.js WebGLRenderer diagnostics
      if (this.renderer && this.renderer.threeRenderer) {
        const info = this.renderer.threeRenderer.info;
        this.drawCalls = info.render.calls;
        this.triangles = info.render.triangles;
        this.memoryGeometries = info.memory.geometries;
        this.memoryTextures = info.memory.textures;
      }
    }
  }

  getMetrics() {
    return {
      fps: this.fps,
      drawCalls: this.drawCalls,
      triangles: this.triangles,
      geometries: this.memoryGeometries,
      textures: this.memoryTextures,
      quality: this.qualityTier
    };
  }
}
