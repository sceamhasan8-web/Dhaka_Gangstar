import { getIconSVG } from '../ui/icons/GameIcons.js';

/**
 * DHAKA CITY GANGSTAR — Reusable Touch & Mouse Circular Button
 * Features: SVG vector icons, touch active animations, hold-to-run / toggle modes,
 * active indicator glow, disabled states, haptic vibration, and pointer capture.
 */
export class MobileButton {
  constructor(parent, config = {}) {
    this.parent = parent;
    this.config = Object.assign({
      id: '',
      className: '',
      label: '',
      iconName: '',
      svgIcon: '',
      actionName: '',
      isToggle: false,
      onTrigger: null
    }, config);

    if (this.config.iconName && !this.config.svgIcon) {
      this.config.svgIcon = getIconSVG(this.config.iconName);
    }

    this.isDown = false;
    this.isActive = false;
    this.isDisabled = false;
    this.pointerId = null;

    this._build();
    this._bind();
  }

  _build() {
    this.el = document.createElement('div');
    this.el.id = this.config.id;
    this.el.className = `mhud-btn ${this.config.className}`;
    this.el.style.touchAction = 'none';

    this.iconContainer = document.createElement('div');
    this.iconContainer.className = 'mhud-icon-wrap';
    if (this.config.svgIcon) {
      this.iconContainer.innerHTML = this.config.svgIcon;
    } else if (this.config.iconName) {
      this.iconContainer.innerHTML = getIconSVG(this.config.iconName);
    }
    this.el.appendChild(this.iconContainer);

    if (this.config.label) {
      this.lbl = document.createElement('span');
      this.lbl.className = 'mhud-label';
      this.lbl.textContent = this.config.label;
      this.el.appendChild(this.lbl);
    }

    this.parent.appendChild(this.el);
  }

  _bind() {
    this.el.addEventListener('pointerdown', (e) => {
      if (this.isDisabled) return;
      this.pointerId = e.pointerId;
      try {
        this.el.setPointerCapture(e.pointerId);
      } catch (_) {}
      this.setDown(true);
      if (this.config.onTrigger) this.config.onTrigger(true);
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });

    this.el.addEventListener('pointerup', (e) => {
      if (e.pointerId === this.pointerId) {
        try {
          this.el.releasePointerCapture(e.pointerId);
        } catch (_) {}
        this.pointerId = null;
        this.setDown(false);
        if (this.config.onTrigger) this.config.onTrigger(false);
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });

    this.el.addEventListener('pointercancel', (e) => {
      if (e.pointerId === this.pointerId) {
        this.pointerId = null;
        this.setDown(false);
        if (this.config.onTrigger) this.config.onTrigger(false);
      }
    }, { passive: false });

    // Global backup in case pointer leaves or capture is broken
    window.addEventListener('pointerup', (e) => {
      if (e.pointerId === this.pointerId) {
        this.pointerId = null;
        this.setDown(false);
        if (this.config.onTrigger) this.config.onTrigger(false);
      }
    }, { passive: false });
  }

  setDown(isDown) {
    this.isDown = isDown;
    if (isDown) {
      this.el.classList.add('is-down');
    } else {
      this.el.classList.remove('is-down');
    }
  }

  setActive(isActive) {
    this.isActive = isActive;
    if (isActive) {
      this.el.classList.add('is-active');
    } else {
      this.el.classList.remove('is-active');
    }
  }

  setDisabled(isDisabled) {
    this.isDisabled = isDisabled;
    if (isDisabled) {
      this.el.classList.add('is-disabled');
      this.el.style.opacity = '0.38';
      this.el.style.pointerEvents = 'none';
    } else {
      this.el.classList.remove('is-disabled');
      this.el.style.opacity = '1.0';
      this.el.style.pointerEvents = 'auto';
    }
  }

  setLabel(text) {
    if (this.lbl) this.lbl.textContent = text;
  }

  setIcon(iconOrSvg) {
    if (!this.iconContainer) return;
    if (typeof iconOrSvg === 'string') {
      if (iconOrSvg.trim().startsWith('<svg')) {
        this.iconContainer.innerHTML = iconOrSvg;
      } else {
        this.iconContainer.innerHTML = getIconSVG(iconOrSvg);
      }
    }
  }

  setVisible(visible) {
    this.el.style.display = visible ? 'flex' : 'none';
  }
}
