/**
 * DHAKA CITY GANGSTAR — Touch & Mouse Authoritative Input Engine
 * Completely disables gameplay keyboard dependencies (WASD, Arrows, Space, Shift).
 * All player actions are driven through responsive on-screen virtual joystick and action buttons.
 * Supports:
 * - Camera-relative screen-direction virtual joystick (multi-touch & mouse drag)
 * - Automatic Run toggle mode
 * - Mode A (Movement-Facing) vs Mode B (Strafe)
 * - Crouch / Stand toggle
 * - Vault / Climb trigger
 * - Full vehicle gas, brake, steering, and drift controls
 */
export class InputManager {
  constructor() {
    this.mouse = {
      isDragging: false,
      deltaX: 0,
      deltaY: 0,
      lastX: 0,
      lastY: 0
    };

    // Mobile & Mouse Virtual Axes (-1.0 to +1.0)
    this.mobileAxes = {
      moveX: 0,
      moveY: 0,
      lookDX: 0,
      lookDY: 0,
      steer: 0
    };

    // Action States
    this.mobileActions = {
      jump: false,
      sprint: false,
      primaryAction: false,
      gas: false,
      brake: false,
      handbrake: false
    };

    // Gameplay States
    this.autoRun = false;
    this.locomotionMode = 'facing'; // 'facing' (Mode A) | 'strafe' (Mode B)
    this.isCrouched = false;
    this.isVaulting = false;

    // Single-trigger action callbacks (bound by Game / MobileHUD)
    this.onEnterVehicle = null;
    this.onInteract = null;
    this.onHorn = null;
    this.onToggleCamera = null;
    this.onToggleMap = null;
    this.onToggleHeadlights = null;
    this.onResetVehicle = null;
    this.onToggleGarage = null;
    this.onTogglePause = null;
    this.onRecenterCamera = null;

    this.initAccessibilityKeys();
    this.initMouseLook();
  }

  /**
   * Only browser window accessibility & developer keys are retained.
   * ALL gameplay keyboard bindings (WASD, Space, Shift, E, F, etc.) are strictly disabled.
   */
  initAccessibilityKeys() {
    window.addEventListener('keydown', (e) => {
      // Escape key toggles pause
      if (e.code === 'Escape' && this.onTogglePause) {
        this.onTogglePause();
      }
    });
  }

  initMouseLook() {
    window.addEventListener('mousedown', (e) => {
      // Ignore clicks on UI elements, modals, or mobile HUD controls
      if (e.target.closest('.ui-screen.active, .modal-card, .btn, .radio-pill, .btn-minimap-expand, .mhud-btn, .mhud-pause-btn, .mhud-joystick-zone, #developer-debug-panel')) {
        return;
      }
      this.mouse.isDragging = true;
      this.mouse.lastX = e.clientX;
      this.mouse.lastY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.mouse.deltaX += e.movementX;
        this.mouse.deltaY += e.movementY;
        return;
      }

      if (!this.mouse.isDragging) return;
      const dx = e.clientX - this.mouse.lastX;
      const dy = e.clientY - this.mouse.lastY;
      this.mouse.lastX = e.clientX;
      this.mouse.lastY = e.clientY;

      this.mouse.deltaX += dx;
      this.mouse.deltaY += dy;
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isDragging = false;
    });
  }

  addLookDelta(dx, dy) {
    this.mobileAxes.lookDX += dx;
    this.mobileAxes.lookDY += dy;
  }

  consumeMouseDelta() {
    const totalDX = this.mouse.deltaX + this.mobileAxes.lookDX;
    const totalDY = this.mouse.deltaY + this.mobileAxes.lookDY;

    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    this.mobileAxes.lookDX = 0;
    this.mobileAxes.lookDY = 0;

    return { dx: totalDX, dy: totalDY };
  }

  toggleAutoRun() {
    this.autoRun = !this.autoRun;
    return this.autoRun;
  }

  setAutoRun(enabled) {
    this.autoRun = enabled;
  }

  toggleLocomotionMode() {
    this.locomotionMode = this.locomotionMode === 'facing' ? 'strafe' : 'facing';
    return this.locomotionMode;
  }

  toggleCrouch() {
    this.isCrouched = !this.isCrouched;
    if (this.isCrouched) {
      this.autoRun = false; // Crouching disengages auto-run
    }
    return this.isCrouched;
  }

  triggerVault() {
    this.isVaulting = true;
  }

  /**
   * Poll movement state — strictly driven by on-screen virtual controls
   */
  getMovement() {
    let forward = 0;
    let turn = 0;

    // 1. Virtual Joystick input
    if (Math.abs(this.mobileAxes.moveY) > 0.05) {
      forward += this.mobileAxes.moveY;
    }
    if (Math.abs(this.mobileAxes.moveX) > 0.05) {
      turn += this.mobileAxes.moveX;
    }

    // 2. Auto-Run mode handling
    if (this.autoRun) {
      // Pulling backward cancels auto-run safely
      if (this.mobileAxes.moveY < -0.35) {
        this.autoRun = false;
      } else {
        forward = Math.max(forward, 1.0);
      }
    }

    // 3. Vehicle pedals
    if (this.mobileActions.gas) forward += 1.0;
    if (this.mobileActions.brake) forward -= 1.0;
    if (Math.abs(this.mobileAxes.steer) > 0.05) {
      turn += this.mobileAxes.steer;
    }

    forward = Math.max(-1.0, Math.min(1.0, forward));
    turn = Math.max(-1.0, Math.min(1.0, turn));

    const isRunning = this.autoRun || !!this.mobileActions.sprint;
    const isJumping = !!this.mobileActions.jump;
    const handbrake = !!this.mobileActions.handbrake;
    const isCrouched = this.isCrouched;
    const isVaulting = this.isVaulting;

    // Reset single-frame vault trigger
    this.isVaulting = false;

    return {
      forward,
      turn,
      isRunning,
      isJumping,
      handbrake,
      isCrouched,
      isVaulting,
      locomotionMode: this.locomotionMode,
      autoRun: this.autoRun
    };
  }

  reset() {
    this.mouse.isDragging = false;
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    this.mobileAxes.moveX = 0;
    this.mobileAxes.moveY = 0;
    this.mobileAxes.lookDX = 0;
    this.mobileAxes.lookDY = 0;
    this.mobileAxes.steer = 0;
    this.autoRun = false;
    this.isCrouched = false;
    this.isVaulting = false;
    for (const k in this.mobileActions) {
      this.mobileActions[k] = false;
    }
  }
}
