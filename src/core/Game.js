import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { CameraController } from './CameraController.js';
import { InputManager } from './InputManager.js';
import { AudioManager } from './AudioManager.js';
import { PhysicsWorld } from './PhysicsWorld.js';
import { DhakaWorld } from '../world/DhakaWorld.js';
import { PlayerController } from '../player/PlayerController.js';
import { VehicleManager } from '../vehicles/VehicleManager.js';
import { TrafficSystem } from '../vehicles/TrafficSystem.js';
import { PedestrianSystem } from '../npcs/PedestrianSystem.js';
import { PoliceAI } from '../vehicles/PoliceAI.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { StreetInteraction } from '../world/StreetInteraction.js';
import { MissionManager } from '../missions/MissionManager.js';
import { UIManager } from '../ui/UIManager.js';
import { SaveManager } from '../save/SaveManager.js';
import { MobileHUD } from '../mobile/MobileHUD.js';
import { MobileSettings } from '../mobile/MobileSettings.js';
import { ViewportManager } from './ViewportManager.js';
import { SpatialManager } from '../engine/SpatialManager.js';
import { PerformanceManager } from '../engine/PerformanceManager.js';

export class Game {
  constructor() {
    this.state = 'INITIALIZING'; // 'INITIALIZING' | 'MAIN_MENU' | 'PLAYING' | 'PAUSED'
    this.canvas = document.getElementById('webgl-canvas');
    this.scene = new THREE.Scene();

    const isPortrait = window.innerHeight > window.innerWidth;
    this.camera = new THREE.PerspectiveCamera(isPortrait ? 78 : 62, window.innerWidth / window.innerHeight, 0.1, 1200);
    this.renderer = new Renderer(this.canvas);
    this.viewport = new ViewportManager(this);
    this.clock = new THREE.Clock();

    this.audioManager = new AudioManager();
    this.audioManager.attachCamera(this.camera);
    this.input = new InputManager();
    this.cameraController = new CameraController(this.camera);

    // 1. Initialize Physics Engine (Rapier 3D)
    this.physics = new PhysicsWorld(this.scene);

    // 2. World & Environment
    this.world = new DhakaWorld(this.scene, this.renderer);
    if (this.world.fountainMesh) {
      this.audioManager.environment.attachFountainAudio(this.world.fountainMesh);
    }
    this.spatial = new SpatialManager();
    this.performance = new PerformanceManager(this.renderer);
    if (this.world.buildings && this.world.buildings.buildingGroup) {
      this.spatial.accelerateHierarchy(this.world.buildings.buildingGroup);
    }

    // 3. Player & Vehicles
    this.player = new PlayerController(this.scene, this.audioManager, this.world, this.physics);
    this.vehicleManager = new VehicleManager(this.scene, this.world, this.audioManager);
    this.traffic = new TrafficSystem(this.scene, this.world.roadNetwork, this.audioManager);
    this.pedestrians = new PedestrianSystem(this.scene, this.world.roadNetwork, this.audioManager);

    // 4. Police AI, Particles & Interactions
    this.police = new PoliceAI(this.scene, this.world.roadNetwork, this.audioManager);
    this.particles = new ParticleSystem(this.scene);

    // 5. Missions & UI
    this.missionManager = new MissionManager(
      this.scene,
      this.audioManager,
      (mission, timeRemaining, dist) => {
        if (this.ui) this.ui.updateMissionUI(mission, timeRemaining, dist);
      }
    );

    this.ui = new UIManager(this);
    this.saveManager = new SaveManager(this);
    this.streetInteraction = new StreetInteraction(this.scene, this.audioManager, this.player, this.ui);

    // ── Professional Mobile Touch HUD ─────────────────────────────────────────
    this.mobileHUD = new MobileHUD(this, this.input);
    this.mobileSettings = new MobileSettings(this.mobileHUD);

    this.isPlaying = false;
    this.state = 'LOBBY'; // 'LOBBY' | 'STARTING_GAME' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
    this.mobileHUD.setMode('lobby');

    this.initPhysicsWorld();
    this.bindInputEvents();

    // ── Post-processing + IBL environment (after scene is built) ─────────────
    this.renderer.initPostProcessing(this.scene, this.camera);
    this.renderer.generateEnvironmentMap(this.scene);

    // Start centralized game animation loop
    this.animate();
  }

  async initPhysicsWorld() {
    try {
      await this.physics.init();
      this.physics.registerBuildingColliders(this.world.buildings.colliders);
      if (this.world.roadsideColliders && this.world.roadsideColliders.length > 0) {
        this.physics.registerRoadsideColliders(this.world.roadsideColliders);
      }
      const allCameraObstacles = [
        ...(this.world.buildings.colliders || []),
        ...(this.world.roadsideColliders || [])
      ];
      this.cameraController.setBuildingColliders(allCameraObstacles);
      if (this.player && this.player.position) {
        this.physics.teleportPlayer(this.player.position.x, this.player.position.y, this.player.position.z);
      }
      console.log('[Game] Rapier physics colliders and camera dynamic spring synchronized with roadside environment.');
    } catch (e) {
      console.warn('[Game] Physics initialization warning:', e);
    }
  }

  bindInputEvents() {
    // E Key / Touch: Enter / Exit Vehicle
    this.input.onEnterVehicle = () => {
      if (this.player.isInVehicle) {
        this.vehicleManager.exitVehicle(this.player);
        this.ui.showToast('EXITED VEHICLE');
        if (this.mobileHUD) this.mobileHUD.setMode('onfoot');
      } else {
        const nearestV = this.vehicleManager.getNearestVehicle(this.player.position, 4.0);
        if (nearestV) {
          this.vehicleManager.enterVehicle(nearestV, this.player);
          this.ui.showToast(`DRIVING ${nearestV.type.toUpperCase()}`);
          if (this.mobileHUD) this.mobileHUD.setMode('vehicle');
        }
      }
    };

    // F Key: Horn / Rickshaw Bell or Talk to NPC / Drink Tea
    this.input.onHorn = () => {
      if (this.player.isInVehicle && this.player.currentVehicle) {
        const type = this.player.currentVehicle.type;
        if (type === 'rickshaw') this.audioManager.playRickshawBell();
        else if (type === 'bus') this.audioManager.playBusHorn();
        else this.audioManager.playCarHorn();
      } else {
        const interaction = this.streetInteraction.checkInteractions(this.player.position);
        if (interaction) {
          this.streetInteraction.executeInteraction(interaction);
          return;
        }

        const nearestPed = this.pedestrians.getNearestPedestrian(this.player.position, 3.5);
        if (nearestPed) {
          this.ui.showToast(`🗣️ ${nearestPed.role}: "${nearestPed.dialogue}"`);
        }
      }
    };

    // C Key: Switch Camera View
    this.input.onToggleCamera = () => {
      const mode = this.cameraController.cycleCameraMode();
      this.ui.showToast(`CAMERA: ${mode.toUpperCase().replace(/_/g, ' ')}`);
    };

    // M Key: Open/Close Full Map
    this.input.onToggleMap = () => {
      this.ui.toggleMapModal();
    };

    // H Key: Toggle Headlights
    this.input.onToggleHeadlights = () => {
      if (this.player.isInVehicle && this.player.currentVehicle) {
        const state = this.player.currentVehicle.toggleHeadlights();
        this.ui.showToast(`HEADLIGHTS: ${state ? 'ON' : 'OFF'}`);
      }
    };

    // R Key: Reset / Flip Vehicle
    this.input.onResetVehicle = () => {
      if (this.player.isInVehicle && this.player.currentVehicle) {
        this.player.currentVehicle.resetVehicle();
        this.ui.showToast('VEHICLE FLIPPED & RESET 🔄');
      }
    };

    // G Key: Open Garage
    this.input.onToggleGarage = () => {
      this.ui.garageModal.open();
    };

    // Escape Key / Pause Button
    this.input.onTogglePause = () => {
      if (this.mobileHUD) this.mobileHUD.togglePause();
    };

    // F3 Key: Toggle Developer Physics & Character Telemetry Debug Mode
    window.addEventListener('keydown', (e) => {
      if (e.code === 'F3') {
        const state = this.physics.toggleDebug();
        if (this.ui) {
          this.ui.toggleDeveloperDebug(state);
          this.ui.showToast(`DEV DEBUG: ${state ? 'ENABLED' : 'DISABLED'}`);
        }
      }
    });

    const btnSave = document.getElementById('btn-save-game');
    if (btnSave) btnSave.addEventListener('click', () => this.saveManager.saveGame());

    const btnReset = document.getElementById('btn-reset-game');
    if (btnReset) btnReset.addEventListener('click', () => this.saveManager.resetProgress());
  }

  startWithTransition() {
    if (this.state === 'STARTING_GAME' || this.state === 'PLAYING') return;
    this.state = 'STARTING_GAME';
    this.isPlaying = false;

    // Initialize audio
    this.audioManager.init();
    this.audioManager.attachCamera(this.camera);
    this.audioManager.environment.start();
    this.audioManager.music.playTrack('exploration_theme');
    if (this.audioManager.voiceEvents) {
      setTimeout(() => this.audioManager.voiceEvents.triggerTutorialWelcome(), 1200);
    }

    // Fade out main menu overlay
    const mainMenuEl = document.getElementById('main-menu');
    if (mainMenuEl) {
      mainMenuEl.classList.remove('active');
      mainMenuEl.classList.add('hidden');
    }

    // Ensure HUD is hidden during transition
    const hudEl = document.getElementById('game-hud');
    if (hudEl) hudEl.classList.add('hidden');

    if (this.mobileHUD) {
      this.mobileHUD.setMode('hidden');
    }

    // Store starting camera transform
    const startPos = this.camera.position.clone();
    
    // Target camera transform: third-person view right behind player
    const playerPos = this.player.position;
    const targetLookAt = new THREE.Vector3(playerPos.x, playerPos.y + 1.4, playerPos.z);
    const targetCamPos = new THREE.Vector3(
      playerPos.x - Math.sin(this.cameraController.yaw) * 5.5,
      playerPos.y + 2.2,
      playerPos.z - Math.cos(this.cameraController.yaw) * 5.5
    );

    const duration = 1.2; // seconds
    let startTime = performance.now();

    const stepTransition = (now) => {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(1, elapsed / duration);
      // Smooth cubic easeInOut
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.lerpVectors(startPos, targetCamPos, ease);
      const curLookAt = new THREE.Vector3().lerpVectors(new THREE.Vector3(0, 10, 140), targetLookAt, ease);
      this.camera.lookAt(curLookAt);

      if (t < 1) {
        requestAnimationFrame(stepTransition);
      } else {
        // Transition finished -> enter active PLAYING state
        this.cameraController.currentCamPos.copy(this.camera.position);
        this.start();
        if (this.ui) this.ui.showToast('WELCOME TO DHAKA CITY GANGSTAR! 🇧🇩');
      }
    };

    requestAnimationFrame(stepTransition);
  }

  start() {
    this.state = 'PLAYING';
    this.isPlaying = true;
    this.audioManager.init();
    this.audioManager.attachCamera(this.camera);
    this.audioManager.environment.start();
    this.audioManager.music.playTrack('exploration_theme');
    if (this.audioManager.voiceEvents) {
      setTimeout(() => this.audioManager.voiceEvents.triggerTutorialWelcome(), 1200);
    }
    const hudEl = document.getElementById('game-hud');
    if (hudEl) hudEl.classList.remove('hidden');
    const mainMenuEl = document.getElementById('main-menu');
    if (mainMenuEl) {
      mainMenuEl.classList.remove('active');
      mainMenuEl.classList.add('hidden');
    }
    if (this.mobileHUD) {
      this.mobileHUD.setMode(this.player.isInVehicle ? 'vehicle' : 'onfoot');
    }
    console.log('[Game] State: PLAYING');
  }

  pause() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.isPlaying = false;
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) pauseModal.classList.remove('hidden');
    if (this.mobileHUD) this.mobileHUD.setMode('paused');
    console.log('[Game] State: PAUSED');
  }

  resume() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.isPlaying = true;
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) pauseModal.classList.add('hidden');
    if (this.mobileHUD) {
      this.mobileHUD.setMode(this.player.isInVehicle ? 'vehicle' : 'onfoot');
    }
    console.log('[Game] State: PLAYING (Resumed)');
  }

  restart() {
    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) pauseModal.classList.add('hidden');
    const gameOverModal = document.getElementById('game-over-modal');
    if (gameOverModal) gameOverModal.classList.add('hidden');

    if (this.player.isInVehicle) {
      this.vehicleManager.exitVehicle(this.player);
    }
    this.player.position.set(0, 0, 140);
    this.player.velocity.set(0, 0, 0);
    this.player.verticalVelocity = 0;
    this.player.health = 100;
    this.player.stamina = 100;
    this.player.wantedLevel = 0;
    if (this.physics) {
      this.physics.teleportPlayer(0, 0, 140);
    }
    this.cameraController.yaw = 0;
    this.cameraController.pitch = 0.28;
    this.start();
    if (this.ui) this.ui.showToast('RESPAWNED IN DHAKA! 🇧🇩');
  }

  returnToLobby() {
    this.state = 'LOBBY';
    this.isPlaying = false;

    // Hide HUD & Modals
    const hudEl = document.getElementById('game-hud');
    if (hudEl) hudEl.classList.add('hidden');

    const pauseModal = document.getElementById('pause-modal');
    if (pauseModal) pauseModal.classList.add('hidden');

    const gameOverModal = document.getElementById('game-over-modal');
    if (gameOverModal) gameOverModal.classList.add('hidden');

    if (this.ui) this.ui.closeAllModals();

    // Reset player transform
    if (this.player.isInVehicle) {
      this.vehicleManager.exitVehicle(this.player);
    }
    this.player.position.set(0, 0, 140);
    this.player.velocity.set(0, 0, 0);
    this.player.verticalVelocity = 0;
    this.player.health = 100;
    this.player.stamina = 100;
    this.player.wantedLevel = 0;
    if (this.physics) {
      this.physics.teleportPlayer(0, 0, 140);
    }

    // Show Main Menu Lobby
    const mainMenuEl = document.getElementById('main-menu');
    if (mainMenuEl) {
      mainMenuEl.classList.remove('hidden');
      mainMenuEl.classList.add('active');
    }

    if (this.mobileHUD) {
      this.mobileHUD.setMode('lobby');
    }

    console.log('[Game] Returned to LOBBY');
  }

  gameOver() {
    if (this.state === 'GAMEOVER') return;
    this.state = 'GAMEOVER';
    this.isPlaying = false;
    const hudEl = document.getElementById('game-hud');
    if (hudEl) hudEl.classList.add('hidden');
    if (this.mobileHUD) this.mobileHUD.setMode('hidden');
    const gameOverModal = document.getElementById('game-over-modal');
    if (gameOverModal) gameOverModal.classList.remove('hidden');
    console.log('[Game] State: GAMEOVER');
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);
    if (this.performance) this.performance.update(delta);

    if (this.isPlaying) {
      // Check player health
      if (this.player.health <= 0) {
        this.gameOver();
        this.renderer.render(this.scene, this.camera);
        return;
      }

      // 1. Step Physics
      this.physics.step(delta);

      // 2. Mouse / Touch delta for camera orbiting
      const { dx, dy } = this.input.consumeMouseDelta();
      this.cameraController.handleMouseDelta(dx, dy);

      // 3. Update Player & Vehicles
      this.player.update(delta, this.input, this.cameraController.yaw);
      this.vehicleManager.update(delta, this.input);

      // 4. Update Camera Follow
      const targetTransform = this.player.isInVehicle && this.player.currentVehicle
        ? { position: this.player.currentVehicle.position, rotationY: this.player.currentVehicle.rotationY }
        : { position: this.player.position, rotationY: this.player.rotationY };

      this.cameraController.update(delta, targetTransform, this.player.isInVehicle);

      // 5. Update World, Traffic, Pedestrians, Police AI, Particles
      this.world.update(delta, this.player.position);
      this.traffic.update(delta, this.player.position);
      this.pedestrians.update(delta, this.player.position);
      this.police.update(delta, this.player.position, this.player.isInVehicle);
      this.particles.update(delta);
      this.streetInteraction.update(delta, this.player.position);
      this.missionManager.update(delta, this.player.position, this.player);
      if (this.audioManager && this.audioManager.environment) {
        this.audioManager.environment.update(this.player.position);
      }

      // 6. Contextual Interaction Prompt Check
      this.checkInteractionPrompts();

      // 7. Update HUD
      this.ui.updateHUD(delta);
      if (this.mobileHUD) this.mobileHUD.update(delta);
    } else if (this.state === 'LOBBY') {
      // Cinematic live main menu camera orbit
      const t = Date.now() * 0.00025;
      const camRadius = 140;
      this.camera.position.set(Math.sin(t) * camRadius, 36, Math.cos(t) * camRadius + 140);
      this.camera.lookAt(0, 8, 140);

      // Live animated background: Dhaka city life (traffic, Metro Rail, weather) continues!
      const lobbyFocus = new THREE.Vector3(0, 0, 140);
      this.world.update(delta, lobbyFocus);
      this.traffic.update(delta, lobbyFocus);
      this.pedestrians.update(delta, lobbyFocus);
    }

    // Render WebGL frame
    this.renderer.render(this.scene, this.camera);
  };

  checkInteractionPrompts() {
    if (this.player.isInVehicle) {
      this.ui.showPrompt('E', `EXIT ${this.player.currentVehicle.type.toUpperCase()}`);
      if (this.mobileHUD) this.mobileHUD.updateContextualPrompt(null);
      return;
    }

    const interaction = this.streetInteraction.checkInteractions(this.player.position);
    if (interaction) {
      this.ui.showPrompt('F', interaction.text);
      if (this.mobileHUD) this.mobileHUD.updateContextualPrompt('interact', 'DRINK TEA');
      return;
    }

    const nearestV = this.vehicleManager.getNearestVehicle(this.player.position, 4.0);
    if (nearestV) {
      this.ui.showPrompt('E', `DRIVE ${nearestV.type.toUpperCase()}`);
      if (this.mobileHUD) this.mobileHUD.updateContextualPrompt('vehicle', `DRIVE ${nearestV.type.toUpperCase()}`);
      return;
    }

    const nearestPed = this.pedestrians.getNearestPedestrian(this.player.position, 3.5);
    if (nearestPed) {
      this.ui.showPrompt('F', `TALK TO ${nearestPed.role.toUpperCase()}`);
      if (this.mobileHUD) this.mobileHUD.updateContextualPrompt('interact', 'TALK');
      return;
    }

    this.ui.hidePrompt();
    if (this.mobileHUD) this.mobileHUD.updateContextualPrompt(null);
  }
}
