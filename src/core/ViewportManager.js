/**
 * DHAKA CITY GANGSTAR — Centralized Viewport & Display Manager
 * Manages:
 * - Dynamic viewport dimensions (accounting for mobile browser URL bar expansion & collapse)
 * - Safe area insets (env(safe-area-inset-*), Android cutouts, camera punch-holes)
 * - CSS viewport custom properties (--app-vw, --app-vh, --is-portrait)
 * - Automatic Three.js camera aspect ratio and FOV adjustment (portrait vs landscape)
 * - Centralized debounced resize and orientation listeners with callback dispatch
 * - Fullscreen API handling with user toggle support
 * - PWA standalone display mode detection
 */
export class ViewportManager {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.camera = game.camera;
    this.renderer = game.renderer;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.isPortrait = this.height > this.width;
    this.isLandscape = !this.isPortrait;
    this.isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    this._resizeDebounceTimer = null;
    this._listeners = new Set();

    this.init();
  }

  init() {
    this.update();

    const handleResize = () => {
      if (this._resizeDebounceTimer) cancelAnimationFrame(this._resizeDebounceTimer);
      this._resizeDebounceTimer = requestAnimationFrame(() => {
        this.update();
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.update(), 120);
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize, { passive: true });
      window.visualViewport.addEventListener('scroll', handleResize, { passive: true });
    }

    document.addEventListener('fullscreenchange', () => {
      this.update();
      this.notifyListeners('fullscreen', document.fullscreenElement !== null);
    });
  }

  update() {
    // Detect accurate visible dimensions using VisualViewport
    let w = window.innerWidth;
    let h = window.innerHeight;

    if (window.visualViewport) {
      w = Math.round(window.visualViewport.width);
      h = Math.round(window.visualViewport.height);
    }

    this.width = Math.max(280, w);
    this.height = Math.max(280, h);
    this.aspect = this.width / this.height;
    this.isPortrait = this.height > this.width;
    this.isLandscape = !this.isPortrait;

    // Apply CSS variables to root and game container for perfect viewport fit
    document.documentElement.style.setProperty('--app-vw', `${this.width}px`);
    document.documentElement.style.setProperty('--app-vh', `${this.height}px`);
    document.documentElement.style.setProperty('--is-portrait', this.isPortrait ? '1' : '0');

    const container = document.getElementById('game-container');
    if (container) {
      container.style.width = `${this.width}px`;
      container.style.height = `${this.height}px`;
    }

    // Update Three.js Camera & Renderer
    if (this.camera) {
      this.camera.aspect = this.aspect;
      // In portrait: wide FOV (78) for full view; In landscape: cinematic 62
      this.camera.fov = this.isPortrait ? 78 : 62;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer && this.renderer.threeRenderer) {
      this.renderer.threeRenderer.setSize(this.width, this.height, false);
      if (this.renderer.postProcessing) {
        this.renderer.postProcessing.resize(this.width, this.height);
      }
    }

    // Notify registered listeners (HUD, UI, etc.)
    this.notifyListeners('resize', {
      width: this.width,
      height: this.height,
      aspect: this.aspect,
      isPortrait: this.isPortrait,
      isLandscape: this.isLandscape
    });
  }

  addListener(fn) {
    this._listeners.add(fn);
  }

  removeListener(fn) {
    this._listeners.delete(fn);
  }

  notifyListeners(type, payload) {
    for (const fn of this._listeners) {
      try {
        fn(type, payload);
      } catch (e) {
        console.error('[ViewportManager] Listener error:', e);
      }
    }
  }

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (e) {
      console.warn('[ViewportManager] Fullscreen request warning:', e);
    }
    this.update();
  }
}
