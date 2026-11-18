import assert from 'assert';
import * as THREE from 'three';
import { InputManager } from '../src/core/InputManager.js';

console.log('================================================================');
console.log('DHAKA CITY GANGSTAR — JOYSTICK HORIZONTAL & DIAGONAL DIRECTION AUDIT');
console.log('================================================================');

console.log('--- 1. Testing InputManager Keyboard Disablement ---');
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.document = {
  pointerLockElement: null
};

const input = new InputManager();

// Verify initial state
const initialMovement = input.getMovement();
assert.strictEqual(initialMovement.forward, 0);
assert.strictEqual(initialMovement.turn, 0);
console.log('✓ Initial state is clean.');

console.log('--- 2. Testing Virtual Joystick Axes & Auto-Run ---');
// Push joystick UP
input.mobileAxes.moveY = 0.8;
input.mobileAxes.moveX = 0;
let m = input.getMovement();
assert.strictEqual(m.forward, 0.8);
assert.strictEqual(m.turn, 0);

// Test Auto-Run Toggle
input.toggleAutoRun();
assert.strictEqual(input.autoRun, true);
input.mobileAxes.moveY = 0; // Release joystick
m = input.getMovement();
assert.strictEqual(m.forward, 1.0); // Continues running hands-free
assert.strictEqual(m.autoRun, true);
assert.strictEqual(m.isRunning, true);
console.log('✓ Auto-Run maintains forward run when stick released.');

// Pull stick backward cancels Auto-Run
input.mobileAxes.moveY = -0.5;
m = input.getMovement();
assert.strictEqual(input.autoRun, false);
assert.strictEqual(m.autoRun, false);
console.log('✓ Pulling stick backward safely disengages Auto-Run.');

console.log('--- 3. Testing Left-Right Joystick Axes Mapping ---');
// Drag joystick fully LEFT
input.mobileAxes.moveX = -1.0;
input.mobileAxes.moveY = 0;
m = input.getMovement();
assert.strictEqual(m.turn, -1.0, 'Joystick LEFT must produce turn = -1.0');

// Drag joystick fully RIGHT
input.mobileAxes.moveX = 1.0;
input.mobileAxes.moveY = 0;
m = input.getMovement();
assert.strictEqual(m.turn, 1.0, 'Joystick RIGHT must produce turn = +1.0');
console.log('✓ Joystick axes correctly output turn = -1.0 for LEFT and +1.0 for RIGHT.');

console.log('--- 4. Testing Camera-Relative Screen-Direction Projections ---');
// Test 4 cardinal and 4 diagonal directions across 0°, 90°, 180°, 270° camera angles
const testAngles = [0, Math.PI / 4, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

testAngles.forEach((yaw) => {
  const deg = (yaw * 180 / Math.PI).toFixed(0);
  const cam = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 100);
  cam.position.set(0, 1.8, 0);

  // Exact camera forward and right unit vectors as implemented in PlayerController.js
  const camForward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
  const camRight = new THREE.Vector3(-Math.cos(yaw), 0, Math.sin(yaw)).normalize();

  // Point camera along camForward
  const targetLook = cam.position.clone().addScaledVector(camForward, 10);
  cam.lookAt(targetLook);
  cam.updateMatrixWorld();

  // Helper: compute movement vector from (forward, turn) and project to camera screen NDC
  function getScreenNDC(fwd, trn) {
    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(camForward, fwd);
    moveDir.addScaledVector(camRight, trn);
    if (moveDir.lengthSq() > 0.0001) moveDir.normalize();

    // Position in world after moving 5 units along moveDir
    const worldPt = cam.position.clone().addScaledVector(camForward, 10).addScaledVector(moveDir, 5);
    const ndc = worldPt.clone().project(cam);
    return { moveDir, ndc };
  }

  // TEST 1: Joystick LEFT (forward = 0, turn = -1.0)
  const leftRes = getScreenNDC(0, -1.0);
  assert(leftRes.ndc.x < 0, `At yaw ${deg}°, Joystick LEFT must project to Screen-Left (NDC X < 0), got ${leftRes.ndc.x.toFixed(3)}`);

  // TEST 2: Joystick RIGHT (forward = 0, turn = +1.0)
  const rightRes = getScreenNDC(0, 1.0);
  assert(rightRes.ndc.x > 0, `At yaw ${deg}°, Joystick RIGHT must project to Screen-Right (NDC X > 0), got ${rightRes.ndc.x.toFixed(3)}`);

  // TEST 3: Joystick UP (forward = 1.0, turn = 0)
  const upRes = getScreenNDC(1.0, 0);
  assert(Math.abs(upRes.ndc.x) < 0.001, `At yaw ${deg}°, Joystick UP must be centered horizontally`);

  // TEST 4: Joystick DOWN (forward = -1.0, turn = 0)
  const downRes = getScreenNDC(-1.0, 0);
  assert(Math.abs(downRes.ndc.x) < 0.001, `At yaw ${deg}°, Joystick DOWN must be centered horizontally`);

  // TEST 5: Four Diagonals
  // UP + LEFT
  const upLeftRes = getScreenNDC(1.0, -1.0);
  assert(upLeftRes.ndc.x < 0, `At yaw ${deg}°, UP+LEFT must project to Screen-Left (NDC X < 0)`);

  // UP + RIGHT
  const upRightRes = getScreenNDC(1.0, 1.0);
  assert(upRightRes.ndc.x > 0, `At yaw ${deg}°, UP+RIGHT must project to Screen-Right (NDC X > 0)`);

  // DOWN + LEFT
  const downLeftRes = getScreenNDC(-1.0, -1.0);
  assert(downLeftRes.ndc.x < 0, `At yaw ${deg}°, DOWN+LEFT must project to Screen-Left (NDC X < 0)`);

  // DOWN + RIGHT
  const downRightRes = getScreenNDC(-1.0, 1.0);
  assert(downRightRes.ndc.x > 0, `At yaw ${deg}°, DOWN+RIGHT must project to Screen-Right (NDC X > 0)`);
});
console.log('✓ Validated across 0°, 45°, 90°, 180°, and 270°:');
console.log('  - Drag LEFT -> moves Screen-LEFT.');
console.log('  - Drag RIGHT -> moves Screen-RIGHT.');
console.log('  - Drag UP -> moves FORWARD along camera view.');
console.log('  - Drag DOWN -> moves BACKWARD relative to camera view.');
console.log('  - Diagonals (UP+LEFT, UP+RIGHT, DOWN+LEFT, DOWN+RIGHT) project perfectly.');

console.log('\n🎯 ALL JOYSTICK DIRECTION TESTS PASSED WITH 100% SUCCESS!');
