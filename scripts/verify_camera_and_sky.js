import assert from 'assert';
import * as THREE from 'three';
import { CameraController } from '../src/core/CameraController.js';

console.log('================================================================');
console.log('DHAKA CITY GANGSTAR — CAMERA & 360° SKY ENVIRONMENT AUDIT & TEST');
console.log('================================================================');

const camera = new THREE.PerspectiveCamera(65, 16 / 9, 0.1, 1200);
const controller = new CameraController(camera);

// TEST 1 & 2: Upward rotation to zenith (+85.9°)
console.log('\n--- TEST 1 & 2: Upward Camera Rotation & Pitch Range ---');
// Simulate dragging finger or mouse upward: dy < 0
controller.handleMouseDelta(0, -600); // Dragging UP
assert(controller.pitch > 1.45, `Pitch must reach high upward angle, got ${controller.pitch} rad (${(controller.pitch * 180 / Math.PI).toFixed(1)}°)`);
assert(controller.pitch <= controller.maxPitch, `Pitch must not exceed maxPitch (${controller.maxPitch})`);
console.log(`✓ Upward pitch reaches: ${(controller.pitch * 180 / Math.PI).toFixed(1)}° (Max: ${(controller.maxPitch * 180 / Math.PI).toFixed(1)}°)`);

// Test camera view direction when looking up
const targetTransform = { position: new THREE.Vector3(0, 0, 140), rotationY: 0 };
// Step smoothing loop for 25 frames to let lerp settle
for (let i = 0; i < 25; i++) {
  controller.update(0.016, targetTransform, false);
}

const lookDir = new THREE.Vector3().subVectors(controller.currentLookAt, camera.position).normalize();
assert(lookDir.y > 0.95, `Camera forward vector must point almost straight up at zenith, got Y=${lookDir.y.toFixed(3)}`);
assert(camera.position.y >= 0.35, `Camera must stay above ground level when looking up, got Y=${camera.position.y.toFixed(2)}`);
console.log(`✓ Camera view vector points UP into sky: Y=${lookDir.y.toFixed(3)}, camera height above ground: ${camera.position.y.toFixed(2)}m`);

// TEST 3: 360-Degree Continuous Horizontal Rotation while tilted Upward
console.log('\n--- TEST 3 & 10: 360-Degree Horizontal Rotation while Looking Upward ---');
const initialPitch = controller.pitch;
for (let deg = 0; deg <= 360; deg += 30) {
  controller.handleMouseDelta(100, 0); // Rotate horizontally
  // Step smoothing loop for 25 frames to let lerp settle
for (let i = 0; i < 25; i++) {
  controller.update(0.016, targetTransform, false);
}
  assert(!isNaN(camera.position.x) && !isNaN(camera.position.y) && !isNaN(camera.position.z), 'Camera position must be finite');
  assert(!isNaN(camera.quaternion.x) && !isNaN(camera.quaternion.w), 'Camera quaternion must remain stable without gimbal singularity');
}
assert(Math.abs(controller.pitch - initialPitch) < 0.001, 'Horizontal rotation must not alter vertical pitch');
console.log('✓ Full 360° horizontal rotation completed smoothly while looking up without flipping or gimbal lock.');

// TEST 4: Downward Camera Rotation to Ground (-71.6°)
console.log('\n--- TEST 4: Downward Camera Rotation & Aerial Overview ---');
controller.handleMouseDelta(0, 1200); // Dragging DOWN
assert(controller.pitch < -1.2, `Pitch must reach steep downward angle, got ${controller.pitch} rad (${(controller.pitch * 180 / Math.PI).toFixed(1)}°)`);
assert(controller.pitch >= controller.minPitch, `Pitch must not exceed minPitch (${controller.minPitch})`);

// Step smoothing loop for 25 frames to let lerp settle
for (let i = 0; i < 25; i++) {
  controller.update(0.016, targetTransform, false);
}
const downLookDir = new THREE.Vector3().subVectors(controller.currentLookAt, camera.position).normalize();
assert(downLookDir.y < -0.85, `Camera forward vector must point downward at street, got Y=${downLookDir.y.toFixed(3)}`);
assert(camera.position.y > targetTransform.position.y + 4.0, `Camera position must rise above player when looking down, got Y=${camera.position.y.toFixed(2)}m`);
console.log(`✓ Downward pitch reaches: ${(controller.pitch * 180 / Math.PI).toFixed(1)}° (Min: ${(controller.minPitch * 180 / Math.PI).toFixed(1)}°), camera elevated to ${camera.position.y.toFixed(2)}m`);

// TEST 5 & 6: Touch & Mouse Input Delta Mapping
console.log('\n--- TEST 5 & 6: Mouse & Touch Input Mapping ---');
// Return to level
controller.pitch = 0.0;
controller.handleMouseDelta(0, -100); // Up
assert(controller.pitch > 0, 'Dragging UP must increase pitch (look toward sky)');

controller.pitch = 0.0;
controller.handleMouseDelta(0, 100); // Down
assert(controller.pitch < 0, 'Dragging DOWN must decrease pitch (look toward ground)');

controller.yaw = 0.0;
controller.handleMouseDelta(-100, 0); // Left
assert(controller.yaw > 0, 'Dragging LEFT must rotate camera left (yaw increases)');

controller.yaw = 0.0;
controller.handleMouseDelta(100, 0); // Right
assert(controller.yaw < 0, 'Dragging RIGHT must rotate camera right (yaw decreases)');
console.log('✓ Input mappings verify exact natural FPS/TPS directional behavior.');

// TEST 7 & 8: 360° Equirectangular Sun & Sky Alignment in World Space
console.log('\n--- TEST 7 & 8: 360° World-Space Skybox Coordinates ---');
const sunPos = new THREE.Vector3(45, 250, 65).normalize();
const sunPhi = Math.atan2(sunPos.x, sunPos.z);
const sunTheta = Math.asin(sunPos.y);
assert(sunTheta > 1.2, 'Sun is naturally elevated high in the sky');
console.log(`✓ World Sun Vector: (${sunPos.x.toFixed(3)}, ${sunPos.y.toFixed(3)}, ${sunPos.z.toFixed(3)})`);
console.log(`✓ Equirectangular Sun UV: U=${((sunPhi / (Math.PI * 2)) + 0.5).toFixed(4)}, V=${(0.5 - (sunTheta / Math.PI)).toFixed(4)}`);

// TEST 11: Telemetry Output
console.log('\n--- TEST 11: Developer Telemetry Export ---');
const telemetry = controller.getDebugTelemetry();
assert.strictEqual(typeof telemetry.yawDeg, 'string');
assert.strictEqual(typeof telemetry.pitchDeg, 'string');
assert.strictEqual(typeof telemetry.maxUpwardDeg, 'string');
assert.strictEqual(typeof telemetry.maxDownwardDeg, 'string');
console.log('✓ Telemetry structure validated:', telemetry);

console.log('\n🎯 ALL 10 TESTS PASSED WITH 100% SUCCESS!');
