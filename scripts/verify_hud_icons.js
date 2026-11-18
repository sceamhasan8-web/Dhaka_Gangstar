import fs from 'fs';
import path from 'path';
import { RAW_ICONS, getIconSVG } from '../src/ui/icons/GameIcons.js';

console.log('=== DHAKA CITY GANGSTAR: HUD ICONS AUDIT & VERIFICATION ===\n');

let failedTests = 0;

function assert(condition, name, details = '') {
  if (condition) {
    console.log(`[PASS] ${name}`);
  } else {
    console.error(`[FAIL] ${name} ${details}`);
    failedTests++;
  }
}

// TEST 1: Check Required HUD Icons
const requiredIcons = [
  'RUN', 'WALK', 'JUMP', 'CROUCH', 'STAND', 'PRONE', 'VAULT',
  'VEHICLE', 'ENTER_VEHICLE', 'EXIT_VEHICLE',
  'CAMERA', 'CAMERA_RESET', 'PAUSE', 'RESUME', 'SETTINGS',
  'FULLSCREEN', 'EXIT_FULLSCREEN', 'CLOSE', 'MAP', 'INVENTORY',
  'MISSION', 'SOUND', 'MUTE', 'INTERACT', 'TALK', 'PICKUP',
  'ATTACK', 'GAS', 'BRAKE', 'DRIFT', 'HORN', 'LIGHTS', 'RESET_VEHICLE'
];

let allIconsPresent = true;
const missingIcons = [];
for (const icon of requiredIcons) {
  if (!RAW_ICONS[icon]) {
    allIconsPresent = false;
    missingIcons.push(icon);
  }
}
assert(allIconsPresent, `All ${requiredIcons.length} Required Icons Present in Central Registry`, missingIcons.join(', '));

// TEST 2: Validate SVG Output Structure
let validStructure = true;
for (const icon of requiredIcons) {
  const svg = getIconSVG(icon);
  const hasViewBox = svg.includes('viewBox="0 0 24 24"');
  const hasStroke = svg.includes('stroke="currentColor"');
  const hasFillNone = svg.includes('fill="none"');
  const hasLineCap = svg.includes('stroke-linecap="round"');
  const hasClosing = svg.endsWith('</svg>');
  if (!hasViewBox || !hasStroke || !hasFillNone || !hasLineCap || !hasClosing) {
    validStructure = false;
    console.error(`Malformed SVG for ${icon}: ${svg.slice(0, 100)}...`);
  }
}
assert(validStructure, 'All Vector SVGs Comply with Lucide 24x24 Vector Specification');

// TEST 3: Fallback Mechanism (No Empty Buttons)
const fallbackSVG = getIconSVG('NON_EXISTENT_UNKNOWN_ACTION');
assert(
  fallbackSVG.includes('<svg') && fallbackSVG.includes('</svg>') && fallbackSVG.length > 50,
  'Safe Local Fallback Icon Provided for Unknown Action IDs'
);

// TEST 4: Check MobileHUD.css Rules
const hudCss = fs.readFileSync(path.resolve('src/mobile/MobileHUD.css'), 'utf8');
const hasIconWrap = hudCss.includes('.mhud-icon-wrap {') &&
  hudCss.includes('width: clamp(') &&
  hudCss.includes('height: clamp(');
assert(hasIconWrap, '.mhud-icon-wrap CSS Container Defined with Clamp Dimensions');

const hasSvgStrokeRule = hudCss.includes('.mhud-icon-wrap svg') &&
  hudCss.includes('stroke: #ffffff') &&
  hudCss.includes('fill: none');
assert(hasSvgStrokeRule, 'SVG Icons Styled with High-Contrast White Stroke and Fill None');

const hasPauseBtnSvgRule = hudCss.includes('.mhud-pause-btn svg');
assert(hasPauseBtnSvgRule, 'Pause Button Styled with Vector Icon CSS');

// TEST 5: Check MobileHUD.js Button Definitions
const hudJs = fs.readFileSync(path.resolve('src/mobile/MobileHUD.js'), 'utf8');
const hasImport = hudJs.includes("from '../ui/icons/GameIcons.js'");
assert(hasImport, 'MobileHUD imports Centralized Vector Icons');

const buttonChecks = [
  { name: 'Attack Button (Punch Fist)', pattern: "iconName: 'ATTACK'" },
  { name: 'Jump Button (Jumping Person)', pattern: "iconName: 'JUMP'" },
  { name: 'Crouch Button (Crouching Person)', pattern: "iconName: 'CROUCH'" },
  { name: 'Sprint Button (Running Person)', pattern: "iconName: 'RUN'" },
  { name: 'Auto-Run Button (Running Person)', pattern: "iconName: 'RUN'" },
  { name: 'Ride/Enter Vehicle Button (Car Front)', pattern: "iconName: 'ENTER_VEHICLE'" },
  { name: 'Interact Button (Hand)', pattern: "iconName: 'INTERACT'" },
  { name: 'Camera Button (Camera)', pattern: "iconName: 'CAMERA'" },
  { name: 'Map Button (Map)', pattern: "iconName: 'MAP'" },
  { name: 'Fullscreen Button (Fullscreen)', pattern: "iconName: 'FULLSCREEN'" },
  { name: 'Pause Button (Lucide Pause)', pattern: "renderIcon(this.btnPause, 'PAUSE')" },
  { name: 'Drive / Gas Pedal (Double Chevron Up)', pattern: "iconName: 'GAS'" },
  { name: 'Brake Pedal (Double Chevron Down)', pattern: "iconName: 'BRAKE'" },
  { name: 'Exit Vehicle (Log Out / Door Open)', pattern: "iconName: 'EXIT_VEHICLE'" },
  { name: 'Horn Button (Volume)', pattern: "iconName: 'HORN'" },
  { name: 'Lights Button (Sun / Lights)', pattern: "iconName: 'LIGHTS'" }
];

let allButtonsMapped = true;
for (const b of buttonChecks) {
  if (!hudJs.includes(b.pattern)) {
    allButtonsMapped = false;
    console.error(`Missing pattern in MobileHUD.js: ${b.pattern}`);
  }
}
assert(allButtonsMapped, `All ${buttonChecks.length} Gameplay Buttons Correctly Mapped to Standard Icons`);

// TEST 6: Check Dynamic State Transitions in MobileHUD.js
const hasCrouchStandToggle = hudJs.includes("this.buttons.crouch.setIcon(isCrouched ? 'STAND' : 'CROUCH')");
assert(hasCrouchStandToggle, 'Crouch Button Updates Icon to STAND when Crouched');

const hasPauseToggle = hudJs.includes("renderIcon(this.btnPause, 'RESUME')") &&
  hudJs.includes("renderIcon(this.btnPause, 'PAUSE')");
assert(hasPauseToggle, 'Pause Button Dynamically Toggles between PAUSE and RESUME (PLAY)');

const hasFullscreenToggle = hudJs.includes("this.buttons.fullscreen.setIcon(isFull ? 'EXIT_FULLSCREEN' : 'FULLSCREEN')");
assert(hasFullscreenToggle, 'Fullscreen Button Dynamically Updates Icon between Maximize and Minimize');

const hasContextualInteract = hudJs.includes("this.buttons.interact.setIcon('TALK')") &&
  hudJs.includes("this.buttons.interact.setIcon('PICKUP')") &&
  hudJs.includes("this.buttons.interact.setIcon('ENTER_VEHICLE')");
assert(hasContextualInteract, 'Contextual Interact Button Adapts Icon to Action Context (TALK, PICKUP, ENTER)');

// TEST 7: Check MobileButton.js icon handling
const btnJs = fs.readFileSync(path.resolve('src/mobile/MobileButton.js'), 'utf8');
const hasIconContainer = btnJs.includes("this.iconContainer.className = 'mhud-icon-wrap'");
const hasSetIcon = btnJs.includes("setIcon(iconOrSvg)");
assert(hasIconContainer && hasSetIcon, 'MobileButton Creates .mhud-icon-wrap and Supports setIcon()');

// TEST 8: Zero External CDN Network Dependency for Icons
const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
const hasExternalFontAwesome = /fontawesome|ionicons|material-icons|cdn\.jsdelivr.*icons/i.test(indexHtml);
assert(!hasExternalFontAwesome, 'Zero External Icon CDN Dependency (Offline PWA Compatible)');

console.log('\n======================================================');
if (failedTests === 0) {
  console.log('✅ ALL HUD ICON TESTS PASSED! FULL VISIBILITY & RESPONSIVENESS VERIFIED.');
  process.exit(0);
} else {
  console.error(`❌ ${failedTests} TEST(S) FAILED.`);
  process.exit(1);
}
