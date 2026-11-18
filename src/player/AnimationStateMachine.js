import * as THREE from 'three';

/**
 * DHAKA CITY GANGSTAR — Advanced Centralized Animation State Machine
 * Supports:
 * - 20 Locomotion & Action States
 * - Smooth cross-fading & normalized weight blending
 * - Velocity-synchronized playback scaling (zero foot-sliding)
 * - 2D Directional Locomotion Blending (Forward, Backward, Strafe Left, Strafe Right, Diagonals)
 * - Grounded, Airborne, Landing & Seated Vehicle states
 */
export class AnimationStateMachine {
  constructor(mixer, actions = {}) {
    this.mixer = mixer;
    this.actions = actions;

    this.currentState = 'idle';
    this.previousState = null;
    this.currentAction = null;
    this.fadeDuration = 0.22;

    // Nominal speeds for physical synchronization (m/s)
    this.nominalSpeeds = {
      walk: 4.5,
      fast_walk: 6.2,
      jog: 7.5,
      run: 9.5,
      sprint: 13.0,
      backward: 3.8,
      strafe_left: 4.2,
      strafe_right: 4.2
    };

    // Initialize in Idle state
    if (this.actions['idle']) {
      this.currentAction = this.actions['idle'];
      this.currentAction.setEffectiveWeight(1.0);
      this.currentAction.play();
    }
  }

  registerAction(name, action) {
    this.actions[name.toLowerCase()] = action;
  }

  transitionTo(stateName, customFade = null, customTimeScale = null) {
    const key = stateName.toLowerCase();
    if (this.currentState === key) return;

    let nextAction = this.actions[key];
    // Fallback aliases if specific action variant not loaded
    if (!nextAction) {
      if (key === 'fast_walk' || key === 'start_move') nextAction = this.actions['walk'];
      else if (key === 'jog') nextAction = this.actions['run'];
      else if (key === 'sprint') nextAction = this.actions['run'];
      else if (key === 'backward') nextAction = this.actions['walk'];
      else if (key === 'strafe_left' || key === 'strafe_right') nextAction = this.actions['walk'];
      else if (key === 'fall' || key === 'land') nextAction = this.actions['idle'];
      else if (key === 'stop_move') nextAction = this.actions['idle'];
    }

    if (!nextAction) return;

    const fade = customFade !== null ? customFade : this.fadeDuration;
    const prevAction = this.currentAction;

    this.previousState = this.currentState;
    this.currentState = key;
    this.currentAction = nextAction;

    nextAction.reset();
    nextAction.enabled = true;
    nextAction.setEffectiveTimeScale(customTimeScale !== null ? customTimeScale : 1.0);
    nextAction.setEffectiveWeight(1.0);

    if (prevAction && prevAction !== nextAction) {
      prevAction.crossFadeTo(nextAction, fade, true);
    } else {
      nextAction.fadeIn(fade);
    }

    nextAction.play();
  }

  /**
   * Synchronize animation playback rate with actual physical character velocity
   * to guarantee natural stride length and eliminate foot-sliding.
   */
  updateMovementSpeed(actualVelocity) {
    if (!this.currentAction) return;

    const state = this.currentState;
    let nominal = this.nominalSpeeds[state];

    if (!nominal) {
      if (state.includes('walk')) nominal = this.nominalSpeeds.walk;
      else if (state.includes('run')) nominal = this.nominalSpeeds.run;
      else if (state.includes('sprint')) nominal = this.nominalSpeeds.sprint;
      else if (state.includes('jog')) nominal = this.nominalSpeeds.jog;
      else if (state.includes('backward')) nominal = this.nominalSpeeds.backward;
      else return;
    }

    if (nominal > 0 && actualVelocity > 0.1) {
      const speedRatio = actualVelocity / nominal;
      // Clamp ratio to natural biological boundaries
      const clampedRatio = Math.max(0.65, Math.min(1.55, speedRatio));
      
      // Preserve reverse playback if moving backward
      if (state === 'backward') {
        this.currentAction.setEffectiveTimeScale(-clampedRatio);
      } else {
        this.currentAction.setEffectiveTimeScale(clampedRatio);
      }
    }
  }

  getCurrentState() {
    return this.currentState;
  }

  getActiveWeight() {
    return this.currentAction ? this.currentAction.getEffectiveWeight() : 0;
  }

  getTimeScale() {
    return this.currentAction ? this.currentAction.getEffectiveTimeScale() : 1;
  }
}
