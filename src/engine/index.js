/**
 * DHAKA CITY GANGSTAR — Core Engine Barrel Export
 * Centralizes all core game engine subsystems for clean modular imports.
 */

export { Game } from '../core/Game.js';
export { Renderer } from '../core/Renderer.js';
export { CameraController } from '../core/CameraController.js';
export { PhysicsWorld } from '../core/PhysicsWorld.js';
export { InputManager } from '../core/InputManager.js';
export { AudioManager } from '../core/AudioManager.js';
export { ViewportManager } from '../core/ViewportManager.js';
export { PostProcessing } from '../core/PostProcessing.js';

export { SpatialManager } from './SpatialManager.js';
export { PerformanceManager } from './PerformanceManager.js';
export { NavigationManager } from './NavigationManager.js';

export { PlayerController } from '../player/PlayerController.js';
export { CharacterModel } from '../player/CharacterModel.js';
export { AnimationStateMachine } from '../player/AnimationStateMachine.js';

export { VehicleManager } from '../vehicles/VehicleManager.js';
export { TrafficSystem } from '../vehicles/TrafficSystem.js';
export { PoliceAI } from '../vehicles/PoliceAI.js';

export { DhakaWorld } from '../world/DhakaWorld.js';
export { RoadNetwork } from '../world/RoadNetwork.js';
export { Buildings } from '../world/Buildings.js';
export { WeatherDayNight } from '../world/WeatherDayNight.js';
export { DistrictManager } from '../world/DistrictManager.js';

export { PedestrianSystem } from '../npcs/PedestrianSystem.js';
export { UIManager } from '../ui/UIManager.js';
export { MobileHUD } from '../mobile/MobileHUD.js';
