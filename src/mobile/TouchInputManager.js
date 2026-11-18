/**
 * DHAKA CITY GANGSTAR — Multi-Touch Input Engine
 * Clean PointerEvents API implementation supporting:
 * - Simultaneous Movement Joystick + Camera Drag + Action Buttons + Pedals
 * - Pointer capture & lifecycle (down, move, up, cancel, blur)
 * - Dead-zone & smoothing
 * - Safe touch-action and multi-touch isolation
 */
export class TouchInputManager {
  constructor() {
    this.pointers = new Map();

    // Virtual axes (-1.0 to +1.0)
    this.axes = {
      moveX: 0,
      moveY: 0,
      lookDX: 0,
      lookDY: 0,
      steer: 0
    };

    // Digital action states (true/false)
    this.actions = {
      jump: false,
      sprint: false,
      primaryAction: false,
      interact: false,
      enterVehicle: false,
      exitVehicle: false,
      gas: false,
      brake: false,
      handbrake: false,
      horn: false,
      camera: false,
      pause: false
    };

    // Custom configuration
    this.config = {
      joystickDeadzone: 0.12,
      cameraSensitivity: 1.15,
      cameraInvertY: false,
      holdToRun: true,
      hapticFeedback: true
    };

    this._bindLifecycleEvents();
  }

  _bindLifecycleEvents() {
    window.addEventListener('blur', () => this.resetAll());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.resetAll();
    });
  }

  registerPointer(pointerId, type, meta = {}) {
    this.pointers.set(pointerId, { type, ...meta, startX: meta.x, startY: meta.y });
  }

  updatePointer(pointerId, x, y) {
    const p = this.pointers.get(pointerId);
    if (!p) return null;
    p.currentX = x;
    p.currentY = y;
    return p;
  }

  releasePointer(pointerId) {
    const p = this.pointers.get(pointerId);
    this.pointers.delete(pointerId);
    return p;
  }

  setAction(name, val) {
    if (this.actions[name] !== undefined) {
      this.actions[name] = !!val;
    }
  }

  resetAll() {
    this.pointers.clear();
    this.axes.moveX = 0;
    this.axes.moveY = 0;
    this.axes.lookDX = 0;
    this.axes.lookDY = 0;
    this.axes.steer = 0;
    for (const k in this.actions) {
      this.actions[k] = false;
    }
  }

  triggerHaptic(type = 'light') {
    if (!this.config.hapticFeedback) return;
    if (navigator.vibrate) {
      const durations = { light: 15, medium: 35, heavy: 60 };
      navigator.vibrate(durations[type] || 20);
    }
  }
}

