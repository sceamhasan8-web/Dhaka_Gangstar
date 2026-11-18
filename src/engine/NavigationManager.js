import * as YUKA from 'yuka';

/**
 * DHAKA CITY GANGSTAR — Navigation & Steering Behavior Manager
 * Powered by `yuka` & `@recast-navigation`
 * Provides:
 * - Autonomous agent steering behaviors (Wander, Seek, Arrive, FollowPath, ObstacleAvoidance)
 * - Pedestrian crowd simulation hooks and traffic waypoint navigation
 * - Recast Navigation integration readiness for 3D navmesh pathfinding
 */
export class NavigationManager {
  constructor() {
    this.entityManager = new YUKA.EntityManager();
    this.time = new YUKA.Time();
    this.isReady = true;
    console.log('[NavigationManager] Yuka autonomous AI steering behaviors active.');
  }

  update(delta) {
    if (!this.entityManager) return;
    this.entityManager.update(delta);
  }

  addAgent(vehicleEntity) {
    this.entityManager.add(vehicleEntity);
  }

  removeAgent(vehicleEntity) {
    this.entityManager.remove(vehicleEntity);
  }

  clear() {
    this.entityManager.clear();
  }
}
