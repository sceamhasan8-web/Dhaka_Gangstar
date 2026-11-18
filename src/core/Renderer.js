import * as THREE from 'three';
import { PostProcessing } from './PostProcessing.js';

/**
 * DHAKA CITY GANGSTAR — Upgraded Cinematic WebGL Renderer
 * Optimized for Mobile Web, Android WebViews, and Desktop.
 * - Dynamic Device Detection & Adaptive Presets
 * - WebGL Context-Loss Recovery
 * - Mobile pixel ratio clamping to prevent out-of-memory GPU crash
 * - Responsive dynamic viewport alignment
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this._scene = null;
    this._camera = null;
    this.postProcessing = null;

    // Detect mobile or low-power hardware
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent) || 
                    (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

    // Clamp device pixel ratio safely
    const maxPixelRatio = this.isMobile ? 1.25 : 2.0;
    const initialDPR = Math.min(window.devicePixelRatio || 1, maxPixelRatio);

    this.threeRenderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile, // Disable on mobile to save GPU cycles & fill-rate
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
      preserveDrawingBuffer: false
    });

    this.threeRenderer.setPixelRatio(initialDPR);
    this.updateViewportSize();

    // ── Cinematic Color Pipeline ──────────────────────────────────────────────
    this.threeRenderer.outputColorSpace = THREE.SRGBColorSpace;
    this.threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.threeRenderer.toneMappingExposure = this.isMobile ? 1.10 : 1.18;

    // ── Soft Shadows (Disabled or 512px on Mobile by default) ──────────────────
    this.threeRenderer.shadowMap.enabled = !this.isMobile;
    this.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.initContextLossHandling();
  }

  updateViewportSize() {
    const w = window.visualViewport ? Math.floor(window.visualViewport.width) : window.innerWidth;
    const h = window.visualViewport ? Math.floor(window.visualViewport.height) : window.innerHeight;
    this.threeRenderer.setSize(w, h, false);
    if (this.postProcessing) this.postProcessing.resize(w, h);
    return { w, h };
  }

  initContextLossHandling() {
    this.canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.warn('[Renderer] WebGL Context Lost! Freezing rendering loop...');
      if (window.dhakaGame) window.dhakaGame.isContextLost = true;
    }, false);

    this.canvas.addEventListener('webglcontextrestored', () => {
      console.log('[Renderer] WebGL Context Restored! Reinitializing shaders & assets...');
      if (window.dhakaGame) {
        window.dhakaGame.isContextLost = false;
        if (this._scene && this._camera) {
          this.initPostProcessing(this._scene, this._camera);
        }
      }
    }, false);
  }

  initPostProcessing(scene, camera) {
    this._scene = scene;
    this._camera = camera;

    // Do not enable heavy SSAO EffectComposer by default on mobile phones
    if (this.isMobile) {
      console.log('[Renderer] Mobile device detected: Direct WebGL rendering enabled for max 60FPS performance.');
      this.postProcessing = null;
      return;
    }

    try {
      this.postProcessing = new PostProcessing(this.threeRenderer, scene, camera);
      console.log('[Renderer] Post-processing pipeline ACTIVE: SSAO → UnrealBloom → FXAA');
    } catch (err) {
      console.warn('[Renderer] Post-processing unavailable, falling back to raw render:', err);
      this.postProcessing = null;
    }
  }

  async generateEnvironmentMap(scene) {
    try {
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      const pmrem = new THREE.PMREMGenerator(this.threeRenderer);
      pmrem.compileEquirectangularShader();
      const rt = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = rt.texture;
      pmrem.dispose();
      console.log('[Renderer] IBL environment map applied to scene.');
    } catch (e) {
      console.warn('[Renderer] IBL environment map failed:', e);
    }
  }

  applyGraphicsPreset(preset, sun) {
    if (this.postProcessing) this.postProcessing.applyPreset(preset);

    switch (preset) {
      case 'LOW':
        this.threeRenderer.setPixelRatio(1);
        this.threeRenderer.shadowMap.enabled = false;
        this.threeRenderer.toneMappingExposure = 1.0;
        break;
      case 'MEDIUM':
        this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
        this.threeRenderer.shadowMap.enabled = true;
        if (sun) { 
          sun.shadow.mapSize.set(512, 512); 
          sun.shadow.map?.dispose(); 
          sun.shadow.map = null; 
        }
        this.threeRenderer.toneMappingExposure = 1.1;
        break;
      case 'HIGH':
        this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        this.threeRenderer.shadowMap.enabled = true;
        if (sun) { 
          sun.shadow.mapSize.set(1024, 1024); 
          sun.shadow.map?.dispose(); 
          sun.shadow.map = null; 
        }
        this.threeRenderer.toneMappingExposure = 1.18;
        break;
      case 'ULTRA':
        this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
        this.threeRenderer.shadowMap.enabled = true;
        if (sun) { 
          sun.shadow.mapSize.set(2048, 2048); 
          sun.shadow.map?.dispose(); 
          sun.shadow.map = null; 
        }
        this.threeRenderer.toneMappingExposure = 1.25;
        break;
    }
    console.log(`[Renderer] Applied graphics preset: ${preset}`);
  }

  render(scene, camera) {
    if (window.dhakaGame && window.dhakaGame.isContextLost) return;

    if (this.postProcessing) {
      this.postProcessing.render(scene, camera);
    } else {
      this.threeRenderer.render(scene, camera);
    }
  }
}
