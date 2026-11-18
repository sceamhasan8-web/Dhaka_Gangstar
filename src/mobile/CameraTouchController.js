/**
 * DHAKA CITY GANGSTAR — Touchscreen Camera Orbit Controller
 * Allows free dragging across the right side of the screen to rotate 360 yaw and pitch.
 * Filters out touches that land directly on action buttons and uses Pointer Capture.
 */
export class CameraTouchController {
  constructor(container, touchManager, inputManager) {
    this.container = container;
    this.touchManager = touchManager;
    this.input = inputManager;

    this.pointerId = null;
    this.lastX = 0;
    this.lastY = 0;
    this.isActive = false;

    this._buildElements();
    this._bindEvents();
  }

  _buildElements() {
    this.zone = document.createElement('div');
    this.zone.className = 'mhud-camera-zone';
    this.zone.style.touchAction = 'none';
    this.container.appendChild(this.zone);
  }

  _bindEvents() {
    this.zone.addEventListener('pointerdown', (e) => this._onDown(e), { passive: false });
    this.zone.addEventListener('pointermove', (e) => this._onMove(e), { passive: false });
    this.zone.addEventListener('pointerup', (e) => this._onUp(e), { passive: false });
    this.zone.addEventListener('pointercancel', (e) => this._onUp(e), { passive: false });

    window.addEventListener('pointermove', (e) => {
      if (this.isActive && e.pointerId === this.pointerId) {
        this._handleDrag(e.clientX, e.clientY);
      }
    }, { passive: false });

    window.addEventListener('pointerup', (e) => {
      if (this.isActive && e.pointerId === this.pointerId) {
        this._onUp(e);
      }
    }, { passive: false });
  }

  _onDown(e) {
    // If click targeted an action button or modal, do not intercept
    if (e.target.closest('.mhud-btn, .mhud-pause-btn, .ui-screen, .modal-card')) return;
    if (this.pointerId !== null) return;

    this.pointerId = e.pointerId;
    this.isActive = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;

    try {
      this.zone.setPointerCapture(e.pointerId);
    } catch (_) {}

    this.touchManager.registerPointer(e.pointerId, 'camera', { x: e.clientX, y: e.clientY });
    e.preventDefault();
    e.stopPropagation();
  }

  _onMove(e) {
    if (e.pointerId !== this.pointerId) return;
    this._handleDrag(e.clientX, e.clientY);
    e.preventDefault();
    e.stopPropagation();
  }

  _handleDrag(clientX, clientY) {
    const dx = clientX - this.lastX;
    const dy = clientY - this.lastY;

    this.lastX = clientX;
    this.lastY = clientY;

    // Filter wild touch jumps
    if (Math.abs(dx) > 150 || Math.abs(dy) > 150) return;

    const sens = this.touchManager ? this.touchManager.config.cameraSensitivity : 1.15;
    const invert = (this.touchManager && this.touchManager.config.cameraInvertY) ? -1 : 1;

    // Directly push look deltas into inputManager for immediate frame consumption
    if (this.input) {
      this.input.addLookDelta(dx * sens, dy * sens * invert);
    }
  }

  _onUp(e) {
    if (e.pointerId !== this.pointerId) return;

    try {
      this.zone.releasePointerCapture(e.pointerId);
    } catch (_) {}

    this.pointerId = null;
    this.isActive = false;
    this.touchManager.releasePointer(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  }
}
