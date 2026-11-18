import * as THREE from 'three';

// Cinematic Environment Lighting, Atmospheric Sky & Dynamic Monsoon Weather

export class WeatherDayNight {
  constructor(scene, renderer, sky = null) {
    this.scene = scene;
    this.renderer = renderer;
    this.sky = sky;
    this.buildings = null; // Injected by DhakaWorld after buildings are created

    this.timeOfDay = 'afternoon';
    this.timeValue = 14.0; // 24-hr clock
    this.weatherType = 'clear';

    this.rainParticles = null;
    this.rainGeo = null;
    this.sunLight = null;
    this.hemiLight = null;

    this.initLighting();
    this.initRainSystem();
    this.applyTimePreset('afternoon');
  }

  initLighting() {
    // 1. Natural Hemisphere Bounce Ambient Light
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.85);
    this.hemiLight.position.set(0, 150, 0);
    this.scene.add(this.hemiLight);

    // 2. High-Quality Directional Sunlight with High-Res Cascaded Shadows
    this.sunLight = new THREE.DirectionalLight(0xfff7e6, 1.8);
    this.sunLight.position.set(140, 220, 110);
    this.sunLight.castShadow = true;

    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 650;

    const d = 260;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.normalBias = 0.04;

    this.scene.add(this.sunLight);

    // 3. Dhaka Atmospheric Distance Fog
    this.scene.fog = new THREE.FogExp2(0x94a3b8, 0.0016);
  }

  initRainSystem() {
    const count = 4800;
    this.rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 320;
      positions[i * 3 + 1] = Math.random() * 85;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 320;
    }

    this.rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.8,
      transparent: true,
      opacity: 0.7
    });

    this.rainParticles = new THREE.Points(this.rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  applyTimePreset(preset) {
    this.timeOfDay = preset;

    if (preset === 'morning') {
      this.timeValue = 8.0;
      this.sunLight.position.set(220, 95, 75);
      this.sunLight.color.setHex(0xffe2b8);
      this.sunLight.intensity = 1.6;
      this.hemiLight.color.setHex(0xbfdbfe);
      this.hemiLight.groundColor.setHex(0x334155);
      if (this.sky) {
        this.sky.applyPreset('morning');
      } else {
        this.scene.background = new THREE.Color(0xa5c4e0);
      }
      this.scene.fog.color.setHex(0xa5c4e0);
    } else if (preset === 'afternoon') {
      this.timeValue = 13.5;
      this.sunLight.position.set(45, 250, 65);
      this.sunLight.color.setHex(0xffffff);
      this.sunLight.intensity = 1.8;
      this.hemiLight.color.setHex(0xf8fafc);
      this.hemiLight.groundColor.setHex(0x475569);
      if (this.sky) {
        this.sky.applyPreset('afternoon');
      } else {
        this.scene.background = new THREE.Color(0x7dd3fc);
      }
      this.scene.fog.color.setHex(0x93c5fd);
    } else if (preset === 'sunset') {
      // Golden Hour Sunset
      this.timeValue = 18.2;
      this.sunLight.position.set(-220, 38, 45);
      this.sunLight.color.setHex(0xff6b35);
      this.sunLight.intensity = 2.2;
      this.hemiLight.color.setHex(0xfb923c);
      this.hemiLight.groundColor.setHex(0x1e1b4b);
      if (this.sky) {
        this.sky.applyPreset('sunset');
      } else {
        this.scene.background = new THREE.Color(0xc2410c);
      }
      this.scene.fog.color.setHex(0x9a3412);
    } else if (preset === 'night') {
      // Deep Indigo Dhaka Midnight
      this.timeValue = 22.5;
      this.sunLight.position.set(-60, 130, -90);
      this.sunLight.color.setHex(0x38bdf8); // Cool moonlight
      this.sunLight.intensity = 0.35;
      this.hemiLight.color.setHex(0x0f172a);
      this.hemiLight.groundColor.setHex(0x020617);
      if (this.sky) {
        this.sky.applyPreset('night');
      } else {
        this.scene.background = new THREE.Color(0x050811);
      }
      this.scene.fog.color.setHex(0x050811);
    }

    // Toggle building window & neon glow at night
    const isNight = preset === 'night';
    if (this.buildings) this.buildings.setNightMode(isNight);
  }

  setWeather(weather) {
    this.weatherType = weather;
    if (weather === 'rain' || weather === 'heavyRain') {
      this.rainParticles.visible = true;
      this.scene.fog.density = weather === 'heavyRain' ? 0.0038 : 0.0026;
      if (this.timeOfDay !== 'night') {
        this.scene.background = new THREE.Color(0x334155);
        this.scene.fog.color.setHex(0x334155);
        this.sunLight.intensity *= 0.45;
      }
    } else {
      this.rainParticles.visible = false;
      this.scene.fog.density = 0.0016;
      this.applyTimePreset(this.timeOfDay);
    }
  }

  update(delta, playerPos) {
    // Follow rain particle volume over player
    if (this.rainParticles && this.rainParticles.visible && playerPos) {
      this.rainParticles.position.x = playerPos.x;
      this.rainParticles.position.z = playerPos.z;

      const positions = this.rainGeo.attributes.position.array;
      const speed = this.weatherType === 'heavyRain' ? 65 : 42;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= speed * delta;
        if (positions[i] < 0) {
          positions[i] = 80 + Math.random() * 10;
        }
      }
      this.rainGeo.attributes.position.needsUpdate = true;
    }

    // Dynamic shadow camera center
    if (playerPos && this.sunLight) {
      this.sunLight.target.position.set(playerPos.x, 0, playerPos.z);
      this.sunLight.target.updateMatrixWorld();
    }
  }

  getTimeFormatted() {
    const hours = Math.floor(this.timeValue);
    const mins = Math.floor((this.timeValue % 1) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayH = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    const strH = displayH < 10 ? '0' + displayH : displayH;
    const strM = mins < 10 ? '0' + mins : mins;
    return `${strH}:${strM} ${period}`;
  }
}
