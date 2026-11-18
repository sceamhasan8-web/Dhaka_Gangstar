# DHAKA CITY GANGSTAR — COMMAND-BASED DEVELOPMENT SYSTEM
## Standardized Autonomous Development & Maintenance Prompts

This document defines reusable, standardized development commands and execution protocols for **Dhaka City Gangstar** (`Three.js`, `Rapier 3D`, `Vite`). Each command is engineered for agentic execution with strict rules:
1. Inspect existing implementations before modifying code.
2. Modify only the relevant modules.
3. Preserve working gameplay, assets, models, and branding.
4. Execute validation and build verification before concluding.
5. Report modified files and any unresolved issues clearly.

---

### Table of Commands
- [`/audit-project`](#1-audit-project)
- [`/verify-dependencies`](#2-verify-dependencies)
- [`/setup-engine`](#3-setup-engine)
- [`/setup-physics`](#4-setup-physics)
- [`/setup-character-controller`](#5-setup-character-controller)
- [`/setup-character-animation`](#6-setup-character-animation)
- [`/setup-camera`](#7-setup-camera)
- [`/setup-collision`](#8-setup-collision)
- [`/setup-vehicle-system`](#9-setup-vehicle-system)
- [`/setup-npc-system`](#10-setup-npc-system)
- [`/setup-navigation`](#11-setup-navigation)
- [`/setup-world-optimization`](#12-setup-world-optimization)
- [`/setup-mobile-controls`](#13-setup-mobile-controls)
- [`/setup-responsive-ui`](#14-setup-responsive-ui)
- [`/setup-audio`](#15-setup-audio)
- [`/setup-graphics`](#16-setup-graphics)
- [`/setup-performance`](#17-setup-performance)
- [`/run-tests`](#18-run-tests)
- [`/full-project-audit`](#19-full-project-audit)

---

### 1. `/audit-project`
- **Purpose**: Conduct an exhaustive audit of the entire repository structure, file tree, dependencies, build setup, and runtime health.
- **Protocol**:
  1. Inspect `package.json`, `vite.config.js`, `capacitor.config.json`, and `index.html`.
  2. Verify module formats (ESM) and Three.js version compatibility.
  3. Validate all static model assets (`.glb`) in `public/models/`.
  4. Run `npm run build` to confirm zero compiler errors.
- **Reporting**: Output repository directory structure, asset catalog, dependency versions, and build status.

---

### 2. `/verify-dependencies`
- **Purpose**: Verify that all installed libraries exist in the npm registry, match required version constraints, have no peer dependency conflicts, and contain no duplicate packages.
- **Protocol**:
  1. Inspect `dependencies` and `devDependencies` in `package.json`.
  2. Verify authoritative packages: `three`, `@dimforge/rapier3d-compat`, `three-mesh-bvh`, `@recast-navigation/core`, `yuka`, `gsap`, `lil-gui`, `three-stdlib`.
  3. Run `npm ls` or check `package-lock.json` for version clashes.
  4. Ensure no competing physics or duplicate rendering libraries are active.
- **Reporting**: Tabulate package names, installed versions, repositories, and verification status.

---

### 3. `/setup-engine`
- **Purpose**: Inspect and tune the central game engine coordinator (`src/core/Game.js`, `src/engine/`).
- **Protocol**:
  1. Inspect `Game.js` state machine (`LOBBY`, `STARTING_GAME`, `PLAYING`, `PAUSED`, `GAMEOVER`).
  2. Validate centralized `requestAnimationFrame` animation loop, fixed-timestep delta clamping (`Math.min(delta, 0.1)`), and subsystem update order.
  3. Verify pause and resume lifecycles to ensure zero CPU/GPU overhead while paused.
  4. Run `npm run build` to verify engine bundling.
- **Reporting**: Report lifecycle hooks, state transitions, and modified engine files.

---

### 4. `/setup-physics`
- **Purpose**: Inspect and maintain the authoritative Rapier 3D physics simulation engine (`src/core/PhysicsWorld.js`).
- **Protocol**:
  1. Verify Rapier 3D WASM initialization (`@dimforge/rapier3d-compat`).
  2. Check static rigid bodies for city buildings, roads, and sidewalks.
  3. Validate kinematic character controller parameters: autostep (`0.38m`), ground snap (`0.35m`), max slope climb ($45^\circ$), slide angle ($30^\circ$).
  4. Ensure downward ground raycasting (`raycastGround`) operates with player self-exclusion.
  5. Test real-time wireframe debug rendering toggleable via **`F3`**.
- **Reporting**: Collider count, fixed-timestep configuration, and raycast test results.

---

### 5. `/setup-character-controller`
- **Purpose**: Maintain and upgrade the physics-driven player controller (`src/player/PlayerController.js`).
- **Protocol**:
  1. Verify physical momentum with smooth acceleration ($14.0\text{ m/s}^2$) and deceleration ($18.0\text{ m/s}^2$).
  2. Verify shortest-path angular rotation smoothing and turning angular velocity calculation.
  3. Check 2D locomotion blending (forward, backward, strafe left/right, sprint).
  4. Verify airborne gravity, air control multiplier ($0.35\times$), and landing impact absorption.
  5. Validate vehicle enter/exit offsets and instant physics teleportation syncing.
- **Reporting**: Velocity parameters, physical tuning constants, and modified files.

---

### 6. `/setup-character-animation`
- **Purpose**: Maintain the 20-state animation state machine and character skeletal rigging (`src/player/AnimationStateMachine.js`, `src/player/CharacterModel.js`).
- **Protocol**:
  1. Inspect 67-joint humanoid skeleton caching on `readyplayer.me.glb`.
  2. Verify `AnimationStateMachine` cross-fading durations ($0.18\text{s} - 0.25\text{s}$).
  3. Verify velocity-synchronized timeScale calculations to eliminate foot-sliding.
  4. Inspect synthetic keyframed animation clips for `jump`, `fall`, `land`, and `driving`.
  5. Verify procedural turn banking and acceleration pitch response.
- **Reporting**: Active animation states, playback scaling ratios, and synthetic clip definitions.

---

### 7. `/setup-camera`
- **Purpose**: Maintain the 360-degree third-person camera system (`src/core/CameraController.js`).
- **Protocol**:
  1. Verify infinite horizontal yaw rotation ($0^\circ \sim 360^\circ$ continuous, no angle wrapping lock or snap-backs).
  2. Verify vertical pitch clamping ($-0.15$ to $1.25$ radians).
  3. Verify spherical orbit calculations centered on the character's chest target.
  4. Test dynamic building obstacle raycasting and smooth spring distance reduction (minimum $1.2\text{m}$, default $5.5\text{m}$).
  5. Ensure camera controls work independently on desktop (mouse drag/pointer lock) and mobile (multi-touch right thumb drag).
- **Reporting**: Camera modes, pitch/yaw boundaries, collision spring parameters, and modified files.

---

### 8. `/setup-collision`
- **Purpose**: Inspect and optimize collision detection across buildings, vehicles, footpaths, and props (`src/world/Buildings.js`, `src/core/PhysicsWorld.js`, `src/engine/SpatialManager.js`).
- **Protocol**:
  1. Verify building bounding box registrations in `DhakaWorld` and Rapier.
  2. Activate `three-mesh-bvh` spatial queries on complex architectural models.
  3. Verify that the player cannot penetrate walls, fall through flat ground, or sink into sidewalks.
  4. Verify vehicle-to-building and vehicle-to-vehicle collision responses.
- **Reporting**: Collision pair counts, BVH tree creation logs, and collision verification metrics.

---

### 9. `/setup-vehicle-system`
- **Purpose**: Maintain and upgrade authentic Bangladesh vehicles, handling, and physics (`src/vehicles/VehicleManager.js`, `src/vehicles/VehiclePhysics.js`, `src/vehicles/VehicleModels.js`).
- **Protocol**:
  1. Inspect vehicle types: Rickshaw, CNG Auto-Rickshaw, Dhaka Local Bus, Private Sedan, Police Patrol Car, Motorcycle.
  2. Verify Raycast vehicle physics / kinematic wheel traction, steering, acceleration, and braking curves.
  3. Verify vehicle headlights toggle, horn/rickshaw bell audio, and vehicle reset/flip (`KeyR`).
  4. Test entering and exiting vehicles with HUD switching (`onfoot` $\leftrightarrow$ `vehicle`).
- **Reporting**: Vehicle types, physics constants, speed/torque tuning, and modified files.

---

### 10. `/setup-npc-system`
- **Purpose**: Maintain autonomous pedestrian NPCs and traffic simulation (`src/npcs/PedestrianSystem.js`, `src/vehicles/TrafficSystem.js`, `src/vehicles/PoliceAI.js`).
- **Protocol**:
  1. Verify `SkeletonUtils.clone` duplication for independent NPC skeletal meshes.
  2. Verify pedestrian locomotion states: `walking`, destination arrival `idle` pause, and smooth turn facing.
  3. Verify distance-based LOD tiers ($<60\text{m}$ full updates, $60-160\text{m}$ alternate frames, $>160\text{m}$ sleep).
  4. Validate authentic Bengali localized dialogues and roles (Student, Dhakaiya Uncle, Corporate Exec, Tea Stall Boy, Police).
  5. Verify Traffic AI road waypoint loops and Police chase mechanics.
- **Reporting**: Active pedestrian and traffic counts, dialogue strings, and performance LOD metrics.

---

### 11. `/setup-navigation`
- **Purpose**: Maintain road network navigation, GPS pathfinding, and autonomous AI steering (`src/world/RoadNetwork.js`, `src/engine/NavigationManager.js`).
- **Protocol**:
  1. Inspect road intersection graph and sidewalk waypoint networks.
  2. Validate `yuka` entity manager and autonomous steering behavior integrations.
  3. Validate `@recast-navigation` navmesh hooks for complex urban pathfinding.
  4. Test minimap GPS route calculation to target districts.
- **Reporting**: Navigation nodes, road segments, steering behaviors, and test route logs.

---

### 12. `/setup-world-optimization`
- **Purpose**: Optimize the 3D Dhaka city map, buildings, road infrastructure, landmarks, and metro rail (`src/world/`).
- **Protocol**:
  1. Verify shared PBR materials across architectural sectors (Motijheel, Old Dhaka, Dhanmondi, Farmgate, Tejgaon).
  2. Verify frustum culling and draw distance limits.
  3. Ensure Metro Rail train updates smoothly on its elevated track.
  4. Test Weather and Day/Night cycles (sunlight trajectory, ambient light, window emission toggle).
- **Reporting**: Mesh count, material count, draw distance configuration, and memory metrics.

---

### 13. `/setup-mobile-controls`
- **Purpose**: Maintain touch controls, virtual analog joystick, and responsive mobile HUD (`src/mobile/`).
- **Protocol**:
  1. Verify `TouchInputManager` pointer event isolation and touch identifier tracking.
  2. Test `VirtualJoystick` dynamic/static centering and deadzone handling ($0.08$).
  3. Test `CameraTouchController` multi-touch right thumb drag without interfering with the joystick.
  4. Validate on-foot buttons (Sprint, Jump, Enter Vehicle, Action/Horn) and vehicle buttons (Gas, Brake, Handbrake, Horn, Headlights, Exit).
  5. Verify touch control customization in `MobileSettings` (scale, opacity, positions).
- **Reporting**: Touch zones, button layouts, pointer capture tests, and modified files.

---

### 14. `/setup-responsive-ui`
- **Purpose**: Maintain UI responsiveness, layout scaling, and safe-area adaptivity across devices (`src/ui/UIManager.js`, `src/core/ViewportManager.js`, `src/style.css`, `src/mobile/MobileHUD.css`).
- **Protocol**:
  1. Verify CSS `100dvh` viewport configuration and notch safe-area insets (`env(safe-area-inset-*)`).
  2. Check main menu lobby screen with live camera orbit and zero HUD leakage.
  3. Verify modals: District GPS Map, Garage Vehicle Selector, Settings, Controls, Pause, Game Over.
  4. Test orientation change handling between portrait and landscape modes.
- **Reporting**: Screen resolutions tested, modal statuses, CSS rules updated, and modified files.

---

### 15. `/setup-audio`
- **Purpose**: Maintain 3D positional audio, vehicle engine sounds, ambient city atmosphere, and Dhaka radio stations (`src/core/AudioManager.js`).
- **Protocol**:
  1. Verify Web Audio API context unlock on user interaction.
  2. Test procedural engine sounds, tire squeals, horn, and rickshaw bells.
  3. Verify Dhaka FM radio stations (Dhaka Beats, Old Dhaka Classic, Bangla Hip Hop, Traffic Wave).
  4. Validate volume sliders for Master, SFX, Traffic, and Music in Settings.
- **Reporting**: Audio buses, synthesized sound effects, radio channels, and modified files.

---

### 16. `/setup-graphics`
- **Purpose**: Maintain rendering pipeline, lighting, shadows, and post-processing quality (`src/core/Renderer.js`, `src/core/PostProcessing.js`).
- **Protocol**:
  1. Verify WebGL2 renderer settings: `powerPreference: 'high-performance'`, `antialias: true`, `toneMapping: THREE.ACESFilmicToneMapping`.
  2. Validate 4 graphics quality tiers:
     - **LOW**: Mobile 60 FPS target, no shadows, no postprocessing, DPR capped at `1.0`.
     - **MEDIUM**: Balanced shadows, bloom, DPR capped at `1.25`.
     - **HIGH**: HD directional shadows, UnrealBloom, color correction, DPR capped at `1.5`.
     - **ULTRA**: Maximum resolution, high-res shadows, ACES tone mapping, full post-processing stack.
  3. Verify shadow map disposal and resize when switching quality presets.
- **Reporting**: Active preset parameters, shadow resolutions, postprocessing passes, and test results.

---

### 17. `/setup-performance`
- **Purpose**: Benchmark and profile game performance, memory, and frame rates (`src/engine/PerformanceManager.js`).
- **Protocol**:
  1. Inspect real-time FPS, draw calls, triangles, and geometry count.
  2. Check for memory leaks in texture and geometry disposal.
  3. Verify fixed-timestep physics updates independent of render framerates.
  4. Test mobile thermal protection and dynamic resolution downscaling when framerate drops below target.
- **Reporting**: FPS benchmarks, draw call count, memory usage, and bottleneck analysis.

---

### 18. `/run-tests`
- **Purpose**: Execute all automated verification scripts to validate physics, animations, camera, and game systems.
- **Protocol**:
  1. Run physics ground query and character controller movement tests.
  2. Run animation state machine transition and timeScale speed synchronization tests.
  3. Run production build: `npm run build`.
  4. Check HTTP endpoint responsiveness on localhost and remote tunnel.
- **Reporting**: Test suite execution logs, pass/fail counts, and build verification output.

---

### 19. `/full-project-audit`
- **Purpose**: Complete end-to-end master audit combining all 18 commands.
- **Protocol**:
  1. Run `/audit-project` and `/verify-dependencies`.
  2. Verify physics, character locomotion, camera, vehicles, world, NPCs, and mobile controls.
  3. Execute `/run-tests` and compile production bundle.
  4. Output the comprehensive master engineering report.
- **Reporting**: Complete technical audit report covering architecture, libraries, tests, and recommendations.
