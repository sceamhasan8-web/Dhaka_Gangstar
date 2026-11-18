/**
 * DHAKA CITY GANGSTAR — Mobile Touch Controls
 * Virtual joystick (left = movement), camera swipe (right), action buttons
 * Fully overlaid on the game canvas for Capacitor Android
 */
export class TouchControls {
  constructor(inputManager) {
    this.input = inputManager;
    this.enabled = false;

    // Touch state
    this.leftTouch = null;   // Movement joystick
    this.rightTouch = null;  // Camera / Look joystick
    this.leftOrigin = { x: 0, y: 0 };
    this.rightOrigin = { x: 0, y: 0 };
    this.moveVector = { x: 0, y: 0 };   // -1..1 for each axis
    this.lookDelta = { dx: 0, dy: 0 };

    this.maxRadius = 55; // pixels

    this.isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      || (window.innerWidth <= 900 && 'ontouchstart' in window);

    if (this.isMobile) {
      this._buildUI();
      this._bindEvents();
      this.enabled = true;
    }
  }

  _buildUI() {
    // ── Container ────────────────────────────────────────────────────────────
    this.container = document.createElement('div');
    this.container.id = 'touch-controls';
    this.container.style.cssText = `
      position: fixed; inset: 0; z-index: 900;
      pointer-events: none; display: flex;
      touch-action: none; user-select: none;
    `;

    // ── LEFT JOYSTICK ────────────────────────────────────────────────────────
    this.leftZone = this._makeZone('left');
    this.leftBase = this._makeBase();
    this.leftKnob = this._makeKnob();
    this.leftBase.appendChild(this.leftKnob);
    this.leftBase.style.display = 'none';
    this.leftZone.appendChild(this.leftBase);

    // ── RIGHT JOYSTICK (camera) ───────────────────────────────────────────────
    this.rightZone = this._makeZone('right');
    this.rightBase = this._makeBase();
    this.rightKnob = this._makeKnob('rgba(255,200,50,0.3)');
    this.rightBase.appendChild(this.rightKnob);
    this.rightBase.style.display = 'none';
    this.rightZone.appendChild(this.rightBase);

    // ── ACTION BUTTONS (bottom right) ────────────────────────────────────────
    this.btnPanel = document.createElement('div');
    this.btnPanel.style.cssText = `
      position: absolute; right: 20px; bottom: 100px;
      display: flex; flex-direction: column; gap: 12px;
      pointer-events: all;
    `;

    const btnDefs = [
      { id: 'btn-touch-e',    label: 'E',    color: '#22c55e', action: 'enterVehicle' },
      { id: 'btn-touch-f',    label: 'F',    color: '#3b82f6', action: 'horn' },
      { id: 'btn-touch-run',  label: '⚡',   color: '#f59e0b', action: 'sprint' },
      { id: 'btn-touch-jump', label: '↑',    color: '#8b5cf6', action: 'jump' },
    ];

    this.actionBtns = {};
    btnDefs.forEach(def => {
      const btn = document.createElement('button');
      btn.id = def.id;
      btn.textContent = def.label;
      btn.style.cssText = `
        width: 58px; height: 58px; border-radius: 50%;
        background: ${def.color}55; border: 2px solid ${def.color};
        color: white; font-size: 20px; font-weight: bold;
        display: flex; align-items: center; justify-content: center;
        pointer-events: all; cursor: pointer; -webkit-tap-highlight-color: transparent;
      `;
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); this._onActionStart(def.action); }, { passive: false });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); this._onActionEnd(def.action); }, { passive: false });
      this.btnPanel.appendChild(btn);
      this.actionBtns[def.action] = btn;
    });

    // ── CAMERA BUTTON (minimap expand) ───────────────────────────────────────
    this.btnCamera = document.createElement('button');
    this.btnCamera.textContent = '📷';
    this.btnCamera.style.cssText = `
      position: absolute; right: 20px; top: 20px;
      width: 48px; height: 48px; border-radius: 50%;
      background: rgba(0,0,0,0.5); border: 1px solid #fff4;
      color: white; font-size: 20px; pointer-events: all; cursor: pointer;
    `;
    this.btnCamera.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.input.onToggleCamera) this.input.onToggleCamera();
    }, { passive: false });

    this.container.appendChild(this.leftZone);
    this.container.appendChild(this.rightZone);
    this.container.appendChild(this.btnPanel);
    this.container.appendChild(this.btnCamera);

    // Insert after game HUD
    document.getElementById('game-container').appendChild(this.container);
  }

  _makeZone(side) {
    const zone = document.createElement('div');
    zone.style.cssText = `
      flex: 1; height: 100%; pointer-events: all;
      position: relative; touch-action: none;
    `;
    return zone;
  }

  _makeBase() {
    const base = document.createElement('div');
    base.style.cssText = `
      position: absolute; width: 110px; height: 110px;
      border-radius: 50%; background: rgba(255,255,255,0.08);
      border: 2px solid rgba(255,255,255,0.25);
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;
    return base;
  }

  _makeKnob(color = 'rgba(255,255,255,0.5)') {
    const knob = document.createElement('div');
    knob.style.cssText = `
      position: absolute; width: 44px; height: 44px;
      border-radius: 50%; background: ${color};
      border: 2px solid rgba(255,255,255,0.7);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;
    return knob;
  }

  _bindEvents() {
    document.addEventListener('touchstart', this._onTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove',  this._onTouchMove.bind(this),  { passive: false });
    document.addEventListener('touchend',   this._onTouchEnd.bind(this),   { passive: false });
  }

  _onTouchStart(e) {
    // Skip if game HUD modal is open
    if (!this.enabled) return;
    Array.from(e.changedTouches).forEach(touch => {
      const x = touch.clientX;
      const y = touch.clientY;
      const halfW = window.innerWidth / 2;

      if (x < halfW && !this.leftTouch) {
        this.leftTouch = touch.identifier;
        this.leftOrigin = { x, y };
        this.leftBase.style.display = 'block';
        this.leftBase.style.left = x + 'px';
        this.leftBase.style.top = y + 'px';
      } else if (x >= halfW && !this.rightTouch) {
        this.rightTouch = touch.identifier;
        this.rightOrigin = { x, y };
        this.rightBase.style.display = 'block';
        this.rightBase.style.left = x + 'px';
        this.rightBase.style.top = y + 'px';
      }
    });
    e.preventDefault();
  }

  _onTouchMove(e) {
    if (!this.enabled) return;
    Array.from(e.changedTouches).forEach(touch => {
      const id = touch.identifier;
      if (id === this.leftTouch) {
        const dx = touch.clientX - this.leftOrigin.x;
        const dy = touch.clientY - this.leftOrigin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clamp = Math.min(dist, this.maxRadius);
        const nx = (dx / dist || 0) * clamp;
        const ny = (dy / dist || 0) * clamp;

        this.leftKnob.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
        this.moveVector.x = nx / this.maxRadius;
        this.moveVector.y = ny / this.maxRadius;
        this._pushMovement();
      }

      if (id === this.rightTouch) {
        const dx = touch.clientX - this.rightOrigin.x;
        const dy = touch.clientY - this.rightOrigin.y;
        const clampX = Math.max(-this.maxRadius, Math.min(this.maxRadius, dx));
        const clampY = Math.max(-this.maxRadius, Math.min(this.maxRadius, dy));
        this.rightKnob.style.transform = `translate(calc(-50% + ${clampX}px), calc(-50% + ${clampY}px))`;
        // Feed into camera controller's mouse delta
        this.lookDelta.dx = dx * 0.4;
        this.lookDelta.dy = dy * 0.3;
        if (this.input._pushLookDelta) {
          this.input._pushLookDelta(this.lookDelta.dx, this.lookDelta.dy);
        }
        // Reset origin so it's relative each frame
        this.rightOrigin.x = touch.clientX;
        this.rightOrigin.y = touch.clientY;
      }
    });
    e.preventDefault();
  }

  _onTouchEnd(e) {
    if (!this.enabled) return;
    Array.from(e.changedTouches).forEach(touch => {
      if (touch.identifier === this.leftTouch) {
        this.leftTouch = null;
        this.moveVector = { x: 0, y: 0 };
        this.leftKnob.style.transform = 'translate(-50%, -50%)';
        this.leftBase.style.display = 'none';
        this._pushMovement();
      }
      if (touch.identifier === this.rightTouch) {
        this.rightTouch = null;
        this.lookDelta = { dx: 0, dy: 0 };
        this.rightKnob.style.transform = 'translate(-50%, -50%)';
        this.rightBase.style.display = 'none';
      }
    });
    e.preventDefault();
  }

  _pushMovement() {
    // Translate joystick vector into InputManager synthetic movement
    if (!this.input) return;
    const fwd = -this.moveVector.y; // Up = forward
    const turn = this.moveVector.x;
    this.input._touchForward = fwd;
    this.input._touchTurn = turn;
  }

  _onActionStart(action) {
    switch (action) {
      case 'enterVehicle': if (this.input.onEnterVehicle) this.input.onEnterVehicle(); break;
      case 'horn':         if (this.input.onHorn) this.input.onHorn(); break;
      case 'jump':         this.input._touchJump = true; break;
      case 'sprint':       this.input._touchSprint = true; break;
    }
  }

  _onActionEnd(action) {
    if (action === 'jump')   this.input._touchJump = false;
    if (action === 'sprint') this.input._touchSprint = false;
  }

  show() {
    this.enabled = true;
    if (this.container) this.container.style.display = 'flex';
  }

  hide() {
    this.enabled = false;
    if (this.container) this.container.style.display = 'none';
  }
}

