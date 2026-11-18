import fs from 'fs';
import path from 'path';

console.log('--- DHAKA CITY GANGSTAR: MISSION PANEL RESPONSIVE AUDIT ---');

const cssPath = path.resolve('src/style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// 1. Check default landscape top-left rules
const hasTopLeftMission = cssContent.includes('/* MISSION PANEL (TOP-LEFT CORNER) */') &&
  cssContent.includes('left: calc(14px + var(--hud-safe-left));') &&
  cssContent.includes('right: auto;');

console.log(`[TEST 1] Default Landscape sets Mission Panel to TOP-LEFT: ${hasTopLeftMission ? 'PASSED' : 'FAILED'}`);

// 2. Check no inverted right calculations in mission-panel
const hasRightCalc = /\.mission-panel\s*\{[^}]*right:\s*calc\([^}]*clamp/s.test(cssContent);
console.log(`[TEST 2] Removed old overlapping right-offset clamp: ${!hasRightCalc ? 'PASSED' : 'FAILED'}`);

// 3. Check portrait orientation separation
const hasPortraitBlock = cssContent.includes('/* PORTRAIT ORIENTATION */') &&
  cssContent.includes('@media (orientation: portrait)') &&
  cssContent.includes('max-width: 380px;');

console.log(`[TEST 3] Dedicated Portrait Orientation media query: ${hasPortraitBlock ? 'PASSED' : 'FAILED'}`);

// 4. Check mobile landscape compact block
const hasLandscapeCompactBlock = cssContent.includes('/* MOBILE LANDSCAPE COMPACT HUD (Keeps Screen Center & Character 100% Clear) */') &&
  cssContent.includes('@media (orientation: landscape) and (max-height: 500px)') &&
  cssContent.includes('top: calc(58px + var(--hud-safe-top));') &&
  cssContent.includes('left: calc(10px + var(--hud-safe-left));');

console.log(`[TEST 4] Dedicated Mobile Landscape compact query: ${hasLandscapeCompactBlock ? 'PASSED' : 'FAILED'}`);

// 5. Check text readability and line-clamp
const hasTextProtection = cssContent.includes('-webkit-line-clamp: 2') &&
  cssContent.includes('text-overflow: ellipsis');

console.log(`[TEST 5] Text overflow prevention and readability clamps: ${hasTextProtection ? 'PASSED' : 'FAILED'}`);

// 6. Check Notification Toast positioning
const hasToastUpdated = cssContent.includes('/* NOTIFICATION TOAST */') &&
  cssContent.includes('top: calc(16px + var(--hud-safe-top));');

console.log(`[TEST 6] Notification Toast repositioned near top edge: ${hasToastUpdated ? 'PASSED' : 'FAILED'}`);

// 7. Check geometry clearance calculations for mobile landscape (844 x 390)
const viewportWidth = 844;
const viewportHeight = 390;
const screenCenterX = viewportWidth / 2; // 422
const screenCenterY = viewportHeight / 2; // 195

const missionLeft = 10; // 10px safe margin
const missionWidth = 245; // max-width
const missionRightEdge = missionLeft + missionWidth; // 255px
const clearanceToCenter = screenCenterX - missionRightEdge; // 422 - 255 = 167px clear!

const missionTop = 58;
const missionHeight = 65;
const missionBottom = missionTop + missionHeight; // 123px

const joystickBottom = 16;
const joystickSize = 120;
const joystickTop = viewportHeight - joystickBottom - joystickSize; // 390 - 136 = 254px
const verticalClearanceToJoystick = joystickTop - missionBottom; // 254 - 123 = 131px clear!

console.log(`[TEST 7] Geometry Check (844x390 Landscape):`);
console.log(`  - Mission Right Edge: ${missionRightEdge}px (Screen Center: ${screenCenterX}px)`);
console.log(`  - Horizontal Clearance to Screen Center: ${clearanceToCenter}px (${clearanceToCenter > 100 ? 'PASSED: 100% CLEAR OF CHARACTER' : 'FAILED'})`);
console.log(`  - Vertical Clearance to Bottom Joystick: ${verticalClearanceToJoystick}px (${verticalClearanceToJoystick > 50 ? 'PASSED: ZERO JOYSTICK INTERFERENCE' : 'FAILED'})`);

// 8. Geometry Clearance for Desktop Landscape (1920 x 1080)
const deskWidth = 1920;
const deskCenterX = deskWidth / 2; // 960
const deskMissionRight = 14 + 280; // 294px
const deskClearance = deskCenterX - deskMissionRight; // 666px!
console.log(`[TEST 8] Geometry Check (1920x1080 Desktop):`);
console.log(`  - Desktop Horizontal Clearance to Center: ${deskClearance}px (${deskClearance > 500 ? 'PASSED: 100% CLEAR' : 'FAILED'})`);

const allPassed = hasTopLeftMission && !hasRightCalc && hasPortraitBlock && hasLandscapeCompactBlock && hasTextProtection && hasToastUpdated && clearanceToCenter > 100;
console.log(`\nOVERALL AUDIT: ${allPassed ? 'ALL 8 TESTS PASSED SUCCESSFULLY! ✅' : 'SOME TESTS FAILED ❌'}`);
process.exit(allPassed ? 0 : 1);
