/**
 * DHAKA CITY GANGSTAR — Virtual Movement Joystick (Left)
 * Analog 360-degree floating or fixed joystick with smooth normalization,
 * dead-zone filter, camera-relative directional mapping, and Pointer Capture.
 */
export class VirtualJoystick {
  constructor(container, touchManager, options = {}) {
    this.container = container;
    this.touchManager = touchManager;

    this.options = Object.assign({
      radius: 60,
      deadzone: 0.10,
      floating: false
    }, options);

    this.pointerId = null;
    this.origin = { x: 0, y: 0 };
    this.current = { x: 0, y: 0 };
    this.isActive = false;

    this._buildElements();
    this._bindEvents();
  }

  _buildElements() {
    this.zone = document.createElement('div');
    this.zone.className = 'mhud-joystick-zone';
    this.zone.style.touchAction = 'none';

    this.base = document.createElement('div');
    this.base.className = 'mhud-joystick-base';

    this.crosshair = document.createElement('div');
    this.crosshair.className = 'mhud-joystick-crosshair';
    this.base.appendChild(this.crosshair);

    this.knob = document.createElement('div');
    this.knob.className = 'mhud-joystick-knob';
    this.base.appendChild(this.knob);

    const lbl = document.createElement('div');
    lbl.className = 'mhud-joystick-label';
    lbl.textContent = 'MOVE';
    this.zone.appendChild(lbl);

    this.zone.appendChild(this.base);
    this.container.appendChild(this.zone);
  }

  _bindEvents() {
    this.zone.addEventListener('pointerdown', (e) => this._onDown(e), { passive: false });
    this.zone.addEventListener('pointermove', (e) => this._onMove(e), { passive: false });
    this.zone.addEventListener('pointerup', (e) => this._onUp(e), { passive: false });
    this.zone.addEventListener('pointercancel', (e) => this._onUp(e), { passive: false });

    // Backup window listener if pointer moves outside zone before capture settles
    window.addEventListener('pointermove', (e) => {
      if (this.isActive && e.pointerId === this.pointerId) {
        this._updateKnob(e.clientX, e.clientY);
      }
    }, { passive: false });

    window.addEventListener('pointerup', (e) => {
      if (this.isActive && e.pointerId === this.pointerId) {
        this._onUp(e);
      }
    }, { passive: false });
  }

  _onDown(e) {
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    this.isActive = true;

    try {
      this.zone.setPointerCapture(e.pointerId);
    } catch (_) { }

    const rect = this.base.getBoundingClientRect();
    this.origin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    if (this.options.floating) {
      this.origin = { x: e.clientX, y: e.clientY };
      this.base.style.left = `${e.clientX}px`;
      this.base.style.top = `${e.clientY}px`;
    }

    this.knob.classList.add('active');
    this.touchManager.registerPointer(e.pointerId, 'joystick', { x: e.clientX, y: e.clientY });
    this.touchManager.triggerHaptic('light');

    this._updateKnob(e.clientX, e.clientY);
    e.preventDefault();
    e.stopPropagation();
  }

  _onMove(e) {
    if (e.pointerId !== this.pointerId) return;
    this._updateKnob(e.clientX, e.clientY);
    e.preventDefault();
    e.stopPropagation();
  }

  _onUp(e) {
    if (e.pointerId !== this.pointerId) return;

    try {
      this.zone.releasePointerCapture(e.pointerId);
    } catch (_) { }

    this.pointerId = null;
    this.isActive = false;

    this.knob.classList.remove('active');
    this.knob.style.transform = 'translate(-50%, -50%)';

    this.touchManager.axes.moveX = 0;
    this.touchManager.axes.moveY = 0;
    this.touchManager.releasePointer(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  }

  _updateKnob(clientX, clientY) {
    const dx = clientX - this.origin.x;
    const dy = clientY - this.origin.y;
    const dist = Math.hypot(dx, dy);

    // Dynamically compute travel radius based on actual base element size
    const baseRadius = this.base && this.base.offsetWidth ? (this.base.offsetWidth * 0.40) : this.options.radius;
    const maxR = baseRadius;
    const clampedDist = Math.min(dist, maxR);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    this.knob.style.transform = `translate(calc(-50% + ${knobX.toFixed(1)}px), calc(-50% + ${knobY.toFixed(1)}px))`;

    // Deadzone and normalized analog values (-1 to +1)
    const normalizedDist = clampedDist / maxR;
    if (normalizedDist < this.options.deadzone) {
      this.touchManager.axes.moveX = 0;
      this.touchManager.axes.moveY = 0;
    } else {
      const rescaled = (normalizedDist - this.options.deadzone) / (1.0 - this.options.deadzone);
      // moveX: +1 right, -1 left
      this.touchManager.axes.moveX = Math.cos(angle) * rescaled;
      // moveY: In games, forward is screen-up (-dy in screen space = +1 forward)
      this.touchManager.axes.moveY = -Math.sin(angle) * rescaled;
    }
  }

  setVisible(visible) {
    this.zone.style.display = visible ? 'block' : 'none';
    if (!visible && this.isActive) {
      this.touchManager.axes.moveX = 0;
      this.touchManager.axes.moveY = 0;
      this.isActive = false;
      this.pointerId = null;
    }
  }
}
