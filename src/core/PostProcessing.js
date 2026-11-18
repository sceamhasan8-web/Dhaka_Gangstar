import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

/**
 * DHAKA CITY GANGSTAR — Cinematic Post-Processing Pipeline
 * Layers: RenderPass → SSAO → UnrealBloom → FXAA → GammaCorrection
 */
export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;
    this.isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

    this.composer = new EffectComposer(renderer);
    this._buildPipeline();
  }

  _buildPipeline() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // ── Pass 1: Base scene render ────────────────────────────────────────────
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // ── Pass 2: SSAO (skip on mobile to save performance) ───────────────────
    if (!this.isMobile) {
      this.ssaoPass = new SSAOPass(this.scene, this.camera, w, h);
      this.ssaoPass.kernelRadius = 12;
      this.ssaoPass.minDistance = 0.001;
      this.ssaoPass.maxDistance = 0.08;
      this.composer.addPass(this.ssaoPass);
    }

    // ── Pass 3: Unreal Bloom (neon signs, streetlamps, headlights) ───────────
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      this.isMobile ? 0.3 : 0.55,  // strength
      0.5,                           // radius
      0.82                           // threshold
    );
    this.composer.addPass(this.bloomPass);

    // ── Pass 4: FXAA Anti-Aliasing ───────────────────────────────────────────
    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (w * Math.min(window.devicePixelRatio, 2));
    this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (h * Math.min(window.devicePixelRatio, 2));
    this.composer.addPass(this.fxaaPass);

    // ── Pass 5: Gamma correction (output) ────────────────────────────────────
    this.gammaPass = new ShaderPass(GammaCorrectionShader);
    this.composer.addPass(this.gammaPass);
  }

  resize(w, h) {
    this.composer.setSize(w, h);
    if (this.fxaaPass) {
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (w * Math.min(window.devicePixelRatio, 2));
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (h * Math.min(window.devicePixelRatio, 2));
    }
  }

  setBloomStrength(val) {
    if (this.bloomPass) this.bloomPass.strength = val;
  }

  setSSAO(enabled) {
    if (this.ssaoPass) this.ssaoPass.enabled = enabled;
  }

  /**
   * Apply a graphics quality preset
   * @param {'LOW'|'MEDIUM'|'HIGH'|'ULTRA'} preset
   */
  applyPreset(preset) {
    switch (preset) {
      case 'LOW':
        if (this.ssaoPass) this.ssaoPass.enabled = false;
        if (this.bloomPass) { this.bloomPass.strength = 0.1; this.bloomPass.enabled = false; }
        this.renderer.shadowMap.enabled = false;
        break;
      case 'MEDIUM':
        if (this.ssaoPass) this.ssaoPass.enabled = false;
        if (this.bloomPass) { this.bloomPass.strength = 0.25; this.bloomPass.enabled = true; }
        this.renderer.shadowMap.enabled = true;
        break;
      case 'HIGH':
        if (this.ssaoPass) this.ssaoPass.enabled = !this.isMobile;
        if (this.bloomPass) { this.bloomPass.strength = 0.45; this.bloomPass.enabled = true; }
        this.renderer.shadowMap.enabled = true;
        break;
      case 'ULTRA':
        if (this.ssaoPass) this.ssaoPass.enabled = true;
        if (this.bloomPass) { this.bloomPass.strength = 0.65; this.bloomPass.enabled = true; }
        this.renderer.shadowMap.enabled = true;
        break;
    }
  }

  render(scene, camera) {
    if (this.enabled) {
      // Update render pass camera if changed
      this.renderPass.scene = scene;
      this.renderPass.camera = camera;
      this.composer.render();
    } else {
      this.renderer.render(scene, camera);
    }
  }

  dispose() {
    this.composer.dispose();
  }
}

