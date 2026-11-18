/**
 * DHAKA CITY GANGSTAR — CENTRALIZED VECTOR ICON SYSTEM
 * Based on Lucide Icons (24x24 viewBox, stroke-width 2, round linecap/linejoin).
 * 100% Offline, zero external network dependency, bundled locally.
 */

export const RAW_ICONS = {
  // Locomotion & Actions
  RUN: `<circle cx="15" cy="4" r="2"/><path d="M14 6.5 10 11.5"/><path d="m12.5 8.5 3.5 1.5 2-2"/><path d="m12.5 8.5-3.5 1.5-3-1.5"/><path d="m10 11.5 3 3.5-1 5"/><path d="m10 11.5-3 2.5-3 1"/>`,
  WALK: `<circle cx="13" cy="4" r="2"/><path d="M13 6v6"/><path d="m10 9 3 1.5 3-1.5"/><path d="m13 12-3 8"/><path d="m13 12 3 8"/>`,
  JUMP: `<circle cx="12" cy="4" r="2"/><path d="M12 6.5v6"/><path d="m12 8-4-3-2 2"/><path d="m12 8 4-3 2 2"/><path d="m12 12.5-3 3.5 2 4"/><path d="m12 12.5 3 3.5-2 4"/>`,
  CROUCH: `<circle cx="9" cy="6" r="2"/><path d="M9 8.5v4.5"/><path d="m9 13 4 2-1 5"/><path d="M5 19h4"/><path d="m9 10 3 1.5v3"/>`,
  STAND: `<circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>`,
  PRONE: `<circle cx="5" cy="14" r="2"/><path d="M7 15h10l3 3"/><path d="M10 15v3h4"/>`,
  VAULT: `<path d="M3 20h18"/><circle cx="14" cy="5" r="2"/><path d="m7 19 4-6 4 1 3-3"/><path d="m11 13 3-2 2 3"/>`,
  ATTACK: `<path d="M11 7.5a1.5 1.5 0 0 1 3 0V11a1.5 1.5 0 0 1-3 0z"/><path d="M8 8a1.5 1.5 0 0 1 3 0v4a1.5 1.5 0 0 1-3 0z"/><path d="M5 9.5a1.5 1.5 0 0 1 3 0V13a1.5 1.5 0 0 1-3 0z"/><path d="M14 8.5a1.5 1.5 0 0 1 3 0V12a1.5 1.5 0 0 1-3 0z"/><path d="M17 11.5a1.5 1.5 0 0 1 3 0V13c0 4-3 7-7 7h-2c-3.5 0-6-2.5-6-6v-3"/><path d="M8 17h6"/>`,

  // Vehicles
  VEHICLE: `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>`,
  ENTER_VEHICLE: `<path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.64 5H8.36a2 2 0 0 0-1.86 1.3L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/>`,
  EXIT_VEHICLE: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>`,
  GAS: `<path d="m18 15-6-6-6 6"/><path d="m18 9-6-6-6 6"/>`,
  BRAKE: `<path d="m6 9 6 6 6-6"/><path d="m6 15 6 6 6-6"/>`,
  DRIFT: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  HORN: `<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 5.636a9 9 0 0 1 0 12.728"/>`,
  LIGHTS: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`,
  RESET_VEHICLE: `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>`,

  // Camera & System
  CAMERA: `<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>`,
  CAMERA_RESET: `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>`,
  PAUSE: `<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>`,
  RESUME: `<polygon points="6 3 20 12 6 21 6 3"/>`,
  PLAY: `<polygon points="6 3 20 12 6 21 6 3"/>`,
  SETTINGS: `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`,
  FULLSCREEN: `<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>`,
  EXIT_FULLSCREEN: `<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>`,
  CLOSE: `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`,
  MAP: `<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15"/><path d="M15 6v15"/>`,
  INVENTORY: `<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/><path d="M8 10h8"/><path d="M9 14h6"/>`,
  MISSION: `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>`,
  SOUND: `<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 5.636a9 9 0 0 1 0 12.728"/>`,
  MUTE: `<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>`,
  INTERACT: `<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v4"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>`,
  TALK: `<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>`,
  PICKUP: `<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v4"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>`,
  CONTROLS: `<circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/>`,
  RADIO: `<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19.1"/>`
};

/**
 * Builds an SVG element string with consistent Lucide styling.
 * @param {string} iconName
 * @param {object} options
 * @returns {string} SVG HTML string
 */
export function getIconSVG(iconName, options = {}) {
  const {
    size = '100%',
    strokeWidth = 2,
    color = 'currentColor',
    className = 'game-icon'
  } = options;

  const key = (iconName || '').toUpperCase().trim();
  const innerPaths = RAW_ICONS[key] || RAW_ICONS.CONTROLS;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="${className}">${innerPaths}</svg>`;
}

/**
 * Injects or updates an icon into a target DOM element safely.
 * @param {HTMLElement} element
 * @param {string} iconName
 * @param {object} options
 */
export function renderIcon(element, iconName, options = {}) {
  if (!element) return;
  element.innerHTML = getIconSVG(iconName, options);
}
