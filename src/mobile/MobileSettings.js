/**
 * DHAKA CITY GANGSTAR — Mobile HUD Layout & Settings Manager
 * Provides user customization: Sensitivity, Inversion, Left-Handed Mode, Presets,
 * and Drag-to-Position HUD editor.
 */
export class MobileSettings {
  constructor(mobileHUD) {
    this.mobileHUD = mobileHUD;
    this.storageKey = 'dhaka_mobile_hud_settings';

    this.settings = {
      preset: 'default', // 'default' | 'leftHanded' | 'compact' | 'custom'
      joystickSensitivity: 1.0,
      cameraSensitivity: 1.15,
      cameraInvertY: false,
      holdToRun: true,
      hapticFeedback: true,
      buttonScale: 1.0,
      hudOpacity: 0.85,
      leftHanded: false
    };

    this.load();
    this.apply();
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        Object.assign(this.settings, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load mobile settings:', e);
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save mobile settings:', e);
    }
  }

  apply() {
    const root = this.mobileHUD.root;
    if (!root) return;

    // Left-handed swap class
    if (this.settings.leftHanded) {
      root.classList.add('left-handed');
    } else {
      root.classList.remove('left-handed');
    }

    // Touch Manager configs
    this.mobileHUD.touchManager.config.cameraSensitivity = this.settings.cameraSensitivity;
    this.mobileHUD.touchManager.config.cameraInvertY = this.settings.cameraInvertY;
    this.mobileHUD.touchManager.config.hapticFeedback = this.settings.hapticFeedback;
    this.mobileHUD.touchManager.config.holdToRun = this.settings.holdToRun;

    // Apply root opacity
    root.style.opacity = this.settings.hudOpacity;
  }

  setPreset(name) {
    this.settings.preset = name;
    if (name === 'leftHanded') {
      this.settings.leftHanded = true;
    } else if (name === 'default') {
      this.settings.leftHanded = false;
      this.settings.buttonScale = 1.0;
    } else if (name === 'compact') {
      this.settings.leftHanded = false;
      this.settings.buttonScale = 0.85;
    }
    this.apply();
    this.save();
  }
}

