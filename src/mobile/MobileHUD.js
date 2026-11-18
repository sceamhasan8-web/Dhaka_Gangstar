import { VirtualJoystick } from './VirtualJoystick.js';
import { CameraTouchController } from './CameraTouchController.js';
import { MobileButton } from './MobileButton.js';
import { TouchInputManager } from './TouchInputManager.js';
import { getIconSVG, renderIcon } from '../ui/icons/GameIcons.js';
import './MobileHUD.css';

/**
 * DHAKA CITY GANGSTAR — MASTER TOUCH & MOUSE HUD
 * Comprehensive touch/mouse action controls inspired by PUBG Mobile & Free Fire:
 * - Movement Joystick (Left Thumb)
 * - Free Camera Orbit (Right Half Screen)
 * - Auto-Run (Toggle with active glow indicator)
 * - Crouch / Stand (Toggle with posture indicator)
 * - Vault / Climb (Contextual hurdle leap)
 * - Locomotion Mode (Movement-Facing vs Strafe toggle)
 * - Primary Attack, Sprint, Jump, Ride/Enter, Interact
 * - Top bar: Pause, Fullscreen, Full Map, Camera Angle
 * - In-vehicle pedals, drift, horn, lights, reset, and exit
 */
export class MobileHUD {
  constructor(game, inputManager) {
    this.game = game;
    this.input = inputManager;
    this.touchManager = new TouchInputManager();

    this.mode = 'lobby'; // 'lobby' | 'onfoot' | 'vehicle' | 'paused' | 'hidden'
    this.buttons = {};

    this._buildRoot();
    this._buildOnFootHUD();
    this._buildVehicleHUD();
    this._buildTopBar();

    this._bridgeToInputManager();
    this.setMode('lobby');
  }

  _buildRoot() {
    // Remove old root if exists
    const old = document.getElementById('mobile-hud-root');
    if (old) old.remove();

    this.root = document.createElement('div');
    this.root.id = 'mobile-hud-root';
    document.getElementById('game-container').appendChild(this.root);

    // Left Movement Joystick (Analog 360)
    this.joystick = new VirtualJoystick(this.root, this.touchManager);

    // Right Camera Drag Zone (Full right half orbit)
    this.cameraController = new CameraTouchController(this.root, this.touchManager, this.input);
  }

  _buildOnFootHUD() {
    this.onFootCluster = document.createElement('div');
    this.onFootCluster.id = 'mhud-onfoot-cluster';
    this.root.appendChild(this.onFootCluster);

    // 1. Primary Action (Punch / Strike / Fire) - Large Right Anchor Button
    this.buttons.primary = new MobileButton(this.onFootCluster, {
      id: 'mhud-btn-primary',
      className: 'mhud-btn-primary-action',
      label: 'ATTACK',
      iconName: 'ATTACK',
      onTrigger: (down) => {
        this.input.mobileActions.primaryAction = down;
        if (down && this.input.onHorn) this.input.onHorn();
      }
    });

    // 2. Dedicated Jump Button
    this.buttons.jump = new MobileButton(this.onFootCluster, {
      id: 'mhud-btn-jump',
      className: 'mhud-btn-jump',
      label: 'JUMP',
      iconName: 'JUMP',
      onTrigger: (down) => {
        this.input.mobileActions.jump = down;
        if (down) this.touchManager.triggerHaptic('medium');
      }
    });

    // 3. Crouch / Stand Toggle Button
    this.buttons.crouch = new MobileButton(this.onFootCluster, {
      id: 'mhud-btn-crouch',
      className: 'mhud-btn-crouch',
      label: 'CROUCH',
      iconName: 'CROUCH',
      onTrigger: (down) => {
        if (down) {
          const isCrouched = this.input.toggleCrouch();
          this.buttons.crouch.setActive(isCrouched);
          this.buttons.crouch.setLabel(isCrouched ? 'STAND' : 'CROUCH');
          this.buttons.crouch.setIcon(isCrouched ? 'STAND' : 'CROUCH');
          this.touchManager.triggerHaptic('light');
        }
      }
    });

    // 4. Vault / Climb Low Obstacle Button
    this.buttons.vault = new MobileButton(this.onFootCluster, {
      id: 'mhud-btn-vault',
      className: 'mhud-btn-vault is-disabled',
      label: 'VAULT',
      iconName: 'VAULT',
      onTrigger: (down) => {
        if (down) {
          this.input.triggerVault();
          this.touchManager.triggerHaptic('heavy');
        }
      }
    });

    // 5. Sprint Button (Hold or tap to run)
    this.buttons.sprint = new MobileButton(this.onFootCluster, {
      id: 'mhud-btn-sprint',
      className: 'mhud-btn-sprint',
      label: 'RUN',
      iconName: 'RUN',
      onTrigger: (down) => {
        this.input.mobileActions.sprint = down;
      }
    });

    // 6. Auto-Run Toggle Button (Hands-free running)
    this.buttons.autoRun = new MobileButton(this.onFootCluster, {
      id: 'mhud-btn-autorun',
      className: 'mhud-btn-autorun',
      label: 'AUTO RUN',
      iconName: 'RUN',
      onTrigger: (down) => {
        if (down) {
          const autoState = this.input.toggleAutoRun();
          this.buttons.autoRun.setActive(autoState);
          this.touchManager.triggerHaptic('medium');
          if (this.game.ui) {
            this.game.ui.showToast(`AUTO RUN: ${autoState ? 'ON' : 'OFF'}`);
          }
        }
      }
    });

    // 7. Locomotion Mode Toggle (Mode A: Movement-Facing vs Mode B: Strafe)
    this.buttons.mode = new MobileButton(this.onFootCluster, {
      id: 'mhud-btn-mode',
      className: 'mhud-btn-mode',
      label: 'FACING',
      iconName: 'WALK',
      onTrigger: (down) => {
        if (down) {
          const newMode = this.input.toggleLocomotionMode();
          const isStrafe = newMode === 'strafe';
          this.buttons.mode.setActive(isStrafe);
          this.buttons.mode.setLabel(isStrafe ? 'STRAFE' : 'FACING');
          this.touchManager.triggerHaptic('light');
          if (this.game.ui) {
            this.game.ui.showToast(`MODE: ${newMode.toUpperCase()}`);
          }
        }
      }
    });

    // 8. Enter / Ride Vehicle Button
    this.buttons.enter = new MobileButton(this.onFootCluster, {
      id: 'mhud-btn-enter',
      className: 'mhud-btn-enter',
      label: 'RIDE',
      iconName: 'ENTER_VEHICLE',
      onTrigger: (down) => {
        if (down) {
          if (this.input.onEnterVehicle) this.input.onEnterVehicle();
          this.touchManager.triggerHaptic('heavy');
        }
      }
    });

    // 9. Contextual Dynamic Interact Button (Talk, Drink Tea, Shop)
    this.buttons.interact = new MobileButton(this.onFootCluster, {
      id: 'mhud-btn-interact',
      className: 'mhud-btn-interact',
      label: 'INTERACT',
      iconName: 'INTERACT',
      onTrigger: (down) => {
        if (down) {
          if (this.input.onInteract) this.input.onInteract();
          this.touchManager.triggerHaptic('light');
        }
      }
    });
  }

  _buildVehicleHUD() {
    this.vehicleCluster = document.createElement('div');
    this.vehicleCluster.id = 'mhud-vehicle-cluster';
    this.vehicleCluster.className = 'hidden';
    this.root.appendChild(this.vehicleCluster);

    // 1. Accelerator / Gas Pedal
    this.buttons.gas = new MobileButton(this.vehicleCluster, {
      id: 'mhud-btn-gas',
      className: 'mhud-btn-gas',
      label: 'DRIVE',
      iconName: 'GAS',
      onTrigger: (down) => {
        this.input.mobileActions.gas = down;
      }
    });

    // 2. Brake / Reverse Pedal
    this.buttons.brake = new MobileButton(this.vehicleCluster, {
      id: 'mhud-btn-brake',
      className: 'mhud-btn-brake',
      label: 'BRAKE',
      iconName: 'BRAKE',
      onTrigger: (down) => {
        this.input.mobileActions.brake = down;
      }
    });

    // 3. Handbrake / Drift
    this.buttons.handbrake = new MobileButton(this.vehicleCluster, {
      id: 'mhud-btn-handbrake',
      className: 'mhud-btn-handbrake',
      label: 'DRIFT',
      iconName: 'DRIFT',
      onTrigger: (down) => {
        this.input.mobileActions.handbrake = down;
        if (down) this.touchManager.triggerHaptic('medium');
      }
    });

    // 4. Exit Vehicle
    this.buttons.exitVehicle = new MobileButton(this.vehicleCluster, {
      id: 'mhud-btn-exit-veh',
      className: 'mhud-btn-exit-veh',
      label: 'EXIT',
      iconName: 'EXIT_VEHICLE',
      onTrigger: (down) => {
        if (down) {
          if (this.input.onEnterVehicle) this.input.onEnterVehicle();
          this.touchManager.triggerHaptic('heavy');
        }
      }
    });

    // 5. Hydraulic Horn / Rickshaw Bell
    this.buttons.vehHorn = new MobileButton(this.vehicleCluster, {
      id: 'mhud-btn-horn',
      className: 'mhud-btn-horn',
      label: 'HORN',
      iconName: 'HORN',
      onTrigger: (down) => {
        if (down && this.input.onHorn) {
          this.input.onHorn();
          this.touchManager.triggerHaptic('heavy');
        }
      }
    });

    // 6. Toggle Headlights
    this.buttons.lights = new MobileButton(this.vehicleCluster, {
      id: 'mhud-btn-lights',
      className: 'mhud-btn-lights',
      label: 'LIGHTS',
      iconName: 'LIGHTS',
      onTrigger: (down) => {
        if (down && this.input.onToggleHeadlights) {
          this.input.onToggleHeadlights();
          this.touchManager.triggerHaptic('light');
        }
      }
    });

    // 7. Reset Vehicle Upright
    this.buttons.resetVeh = new MobileButton(this.vehicleCluster, {
      id: 'mhud-btn-reset-veh',
      className: 'mhud-btn-reset-veh',
      label: 'RESET',
      iconName: 'RESET_VEHICLE',
      onTrigger: (down) => {
        if (down) {
          if (this.game.player && this.game.player.currentVehicle) {
            const v = this.game.player.currentVehicle;
            v.rotationY = 0;
            v.position.y = 0.5;
            v.velocity.set(0, 0, 0);
            v.speed = 0;
            if (this.game.ui) this.game.ui.showToast('VEHICLE FLIPPED UPRIGHT');
          }
          this.touchManager.triggerHaptic('heavy');
        }
      }
    });
  }

  _buildTopBar() {
    // 1. Center Pause Button (with Lucide Pause vector icon)
    this.btnPause = document.createElement('div');
    this.btnPause.className = 'mhud-pause-btn';
    renderIcon(this.btnPause, 'PAUSE');
    this.btnPause.title = 'Pause Game';
    this.btnPause.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.togglePause();
    });
    this.root.appendChild(this.btnPause);

    // 2. Camera View Mode Switcher
    this.buttons.camera = new MobileButton(this.root, {
      id: 'mhud-btn-camera',
      className: 'mhud-btn-camera',
      label: 'CAM',
      iconName: 'CAMERA',
      onTrigger: (down) => {
        if (down && this.input.onToggleCamera) {
          this.input.onToggleCamera();
          this.touchManager.triggerHaptic('light');
        }
      }
    });

    // 3. Full Map Opener
    this.buttons.map = new MobileButton(this.root, {
      id: 'mhud-btn-map',
      className: 'mhud-btn-map',
      label: 'MAP',
      iconName: 'MAP',
      onTrigger: (down) => {
        if (down && this.input.onToggleMap) {
          this.input.onToggleMap();
          this.touchManager.triggerHaptic('light');
        }
      }
    });

    // 4. Fullscreen Button
    this.buttons.fullscreen = new MobileButton(this.root, {
      id: 'mhud-btn-fullscreen',
      className: 'mhud-btn-fullscreen',
      label: 'FULL',
      iconName: 'FULLSCREEN',
      onTrigger: (down) => {
        if (down) {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          this.touchManager.triggerHaptic('light');
        }
      }
    });
  }

  togglePause() {
    if (this.game.state === 'PLAYING') {
      this.game.pause();
      if (this.btnPause) renderIcon(this.btnPause, 'RESUME');
    } else if (this.game.state === 'PAUSED') {
      this.game.resume();
      if (this.btnPause) renderIcon(this.btnPause, 'PAUSE');
    }
  }

  setMode(newMode) {
    this.mode = newMode;
    if (newMode === 'lobby' || newMode === 'hidden') {
      this.root.classList.add('hidden');
      this.root.style.display = 'none';
      if (this.joystick) this.joystick.setVisible(false);
      this.touchManager.resetAll();
      this.input.reset();
    } else if (newMode === 'onfoot') {
      this.root.classList.remove('hidden');
      this.root.style.display = 'block';
      this.onFootCluster.style.display = 'block';
      this.joystick.setVisible(true);
      this.vehicleCluster.classList.add('hidden');
      if (this.btnPause) renderIcon(this.btnPause, 'PAUSE');
    } else if (newMode === 'vehicle') {
      this.root.classList.remove('hidden');
      this.root.style.display = 'block';
      this.onFootCluster.style.display = 'none';
      this.joystick.setVisible(true);
      this.vehicleCluster.classList.remove('hidden');
      if (this.btnPause) renderIcon(this.btnPause, 'PAUSE');
    } else if (newMode === 'paused') {
      this.root.classList.add('hidden');
      this.root.style.display = 'none';
      if (this.joystick) this.joystick.setVisible(false);
      this.touchManager.resetAll();
      this.input.reset();
    }
  }

  update(delta) {
    if (this.mode === 'onfoot') {
      // 1. Sync Auto-Run active state
      if (this.buttons.autoRun) {
        this.buttons.autoRun.setActive(this.input.autoRun);
      }
      // 2. Sync Crouch visual state, label & icon
      if (this.buttons.crouch) {
        const isCrouched = !!this.input.isCrouched;
        this.buttons.crouch.setActive(isCrouched);
        this.buttons.crouch.setLabel(isCrouched ? 'STAND' : 'CROUCH');
        this.buttons.crouch.setIcon(isCrouched ? 'STAND' : 'CROUCH');
      }
      // 3. Sync Locomotion mode label and icon
      if (this.buttons.mode) {
        const isStrafe = this.input.locomotionMode === 'strafe';
        this.buttons.mode.setActive(isStrafe);
        this.buttons.mode.setLabel(isStrafe ? 'STRAFE' : 'FACING');
        this.buttons.mode.setIcon(isStrafe ? 'WALK' : 'STAND');
      }
      // 4. Sync contextual vault obstacle readiness
      if (this.buttons.vault && this.game.player) {
        const canVault = !!this.game.player.nearVaultableObstacle;
        this.buttons.vault.setDisabled(!canVault);
        if (canVault) {
          this.buttons.vault.el.classList.add('can-vault');
        } else {
          this.buttons.vault.el.classList.remove('can-vault');
        }
      }
    }

    // Sync fullscreen button icon
    if (this.buttons.fullscreen) {
      const isFull = !!document.fullscreenElement;
      this.buttons.fullscreen.setIcon(isFull ? 'EXIT_FULLSCREEN' : 'FULLSCREEN');
      this.buttons.fullscreen.setLabel(isFull ? 'EXIT' : 'FULL');
    }
  }

  updateContextualPrompt(type, label) {
    if (!type || this.mode === 'vehicle') {
      if (this.buttons.interact) this.buttons.interact.el.classList.remove('visible');
    } else {
      if (this.buttons.interact) {
        this.buttons.interact.setLabel(label || 'INTERACT');
        if (type === 'talk' || type === 'greet') {
          this.buttons.interact.setIcon('TALK');
        } else if (type === 'pickup') {
          this.buttons.interact.setIcon('PICKUP');
        } else if (type === 'enter') {
          this.buttons.interact.setIcon('ENTER_VEHICLE');
        } else {
          this.buttons.interact.setIcon('INTERACT');
        }
        this.buttons.interact.el.classList.add('visible');
      }
    }
  }

  _bridgeToInputManager() {
    // Continuously bridge touch manager joystick axes directly into input manager
    const origGetMovement = this.input.getMovement.bind(this.input);
    this.input.getMovement = () => {
      this.input.mobileAxes.moveX = this.touchManager.axes.moveX;
      this.input.mobileAxes.moveY = this.touchManager.axes.moveY;
      this.input.mobileAxes.steer = this.touchManager.axes.steer;
      return origGetMovement();
    };
  }
}
