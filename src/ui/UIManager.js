import { MiniMap } from './MiniMap.js';
import { DistrictMapModal } from './DistrictMapModal.js';
import { GarageModal } from './GarageModal.js';
import { getIconSVG, renderIcon } from './icons/GameIcons.js';

export class UIManager {
  constructor(game) {
    this.game = game;

    // HUD Elements
    this.hudEl = document.getElementById('game-hud');
    this.mainMenuEl = document.getElementById('main-menu');
    this.healthFill = document.getElementById('health-fill');
    this.healthVal = document.getElementById('health-val');
    this.staminaFill = document.getElementById('stamina-fill');
    this.moneyEl = document.getElementById('hud-money');
    this.clockEl = document.getElementById('hud-clock');
    this.weatherIcon = document.getElementById('hud-weather-icon');
    this.weatherName = document.getElementById('hud-weather-name');
    this.districtName = document.getElementById('hud-district-name');
    this.radioTitle = document.getElementById('radio-title');
    this.toastEl = document.getElementById('notification-toast');
    this.toastText = document.getElementById('toast-text');
    this.promptEl = document.getElementById('interaction-prompt');
    this.promptKey = document.getElementById('prompt-key');
    this.promptText = document.getElementById('prompt-text');

    // Speedometer
    this.speedGauge = document.getElementById('speed-gauge-fill');
    this.speedNumber = document.getElementById('speed-number');
    this.gearIndicator = document.getElementById('gear-indicator');
    this.vehicleName = document.getElementById('vehicle-name');
    this.headlightIndicator = document.getElementById('headlight-indicator');
    this.speedCluster = document.getElementById('speedometer-cluster');

    // Mission HUD
    this.missionTitle = document.getElementById('mission-title');
    this.missionType = document.getElementById('mission-type');
    this.missionDesc = document.getElementById('mission-desc');
    this.missionDist = document.getElementById('mission-dist');
    this.missionTimer = document.getElementById('mission-timer');
    this.missionReward = document.getElementById('mission-reward');

    // Modals
    this.mapModalEl = document.getElementById('map-modal');
    this.characterModalEl = document.getElementById('character-modal');
    this.settingsModalEl = document.getElementById('settings-modal');
    this.controlsModalEl = document.getElementById('controls-modal');
    this.pauseModalEl = document.getElementById('pause-modal');
    this.gameOverModalEl = document.getElementById('game-over-modal');

    this.miniMap = new MiniMap('minimap-canvas', game.world.roadNetwork, game.world.districtManager);

    this.districtMapModal = new DistrictMapModal(
      game.world.roadNetwork,
      game.world.districtManager,
      game.world.landmarks,
      (district) => {
        this.showToast(`GPS ROUTE SET: ${district.bengali} (${district.name})`);
        this.closeAllModals();
      }
    );

    this.garageModal = new GarageModal(
      game.vehicleManager,
      game.player,
      game.audioManager,
      (type, color) => {
        game.vehicleManager.spawnCustomVehicle(type, color, game.player.position);
        this.showToast(`SPAWNED VEHICLE: ${type.toUpperCase()}`);
      }
    );

    this.initDeveloperDebug();

    this.initMainMenu();
    this.initLobbyTopBar();
    this.initPauseAndGameOverModals();
    this.initModalTriggers();
    this.initRadioTrigger();
    this.initSettings();
    this.initCharacterSelect();
  }

  initMainMenu() {
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        this.game.startWithTransition();
      });
    }

    const btnGarageMenu = document.getElementById('btn-garage-menu');
    if (btnGarageMenu) btnGarageMenu.addEventListener('click', () => this.garageModal.open());

    const btnCharMenu = document.getElementById('btn-character');
    if (btnCharMenu) btnCharMenu.addEventListener('click', () => this.openModal(this.characterModalEl));

    const btnSettingsMenu = document.getElementById('btn-settings-menu');
    if (btnSettingsMenu) btnSettingsMenu.addEventListener('click', () => this.openModal(this.settingsModalEl));

    const btnControlsMenu = document.getElementById('btn-controls-menu');
    if (btnControlsMenu) btnControlsMenu.addEventListener('click', () => this.openModal(this.controlsModalEl));
  }

  initLobbyTopBar() {
    const btnSound = document.getElementById('btn-lobby-sound');
    if (btnSound) {
      let isMuted = false;
      const updateSoundUI = () => {
        btnSound.innerHTML = isMuted
          ? `${getIconSVG('MUTE', { size: 16 })} <span class="btn-text">AUDIO: OFF</span>`
          : `${getIconSVG('SOUND', { size: 16 })} <span class="btn-text">AUDIO: ON</span>`;
        btnSound.style.borderColor = isMuted ? '#f87171' : 'rgba(0, 240, 255, 0.4)';
      };
      btnSound.addEventListener('click', () => {
        isMuted = !isMuted;
        this.game.audioManager.setMasterMute(isMuted);
        updateSoundUI();
      });
      updateSoundUI();
    }

    const btnFullscreen = document.getElementById('btn-lobby-fullscreen');
    if (btnFullscreen) {
      const updateFullscreenUI = () => {
        const isFull = !!document.fullscreenElement;
        btnFullscreen.innerHTML = isFull
          ? `${getIconSVG('EXIT_FULLSCREEN', { size: 16 })} <span class="btn-text">EXIT FULL</span>`
          : `${getIconSVG('FULLSCREEN', { size: 16 })} <span class="btn-text">FULLSCREEN</span>`;
      };
      btnFullscreen.addEventListener('click', () => {
        this.game.viewport.toggleFullscreen();
      });
      document.addEventListener('fullscreenchange', updateFullscreenUI);
      updateFullscreenUI();
    }
  }

  initPauseAndGameOverModals() {
    // Pause Modal Buttons
    const btnPauseResume = document.getElementById('btn-pause-resume');
    if (btnPauseResume) {
      btnPauseResume.addEventListener('click', () => {
        this.game.resume();
      });
    }

    const btnPauseRestart = document.getElementById('btn-pause-restart');
    if (btnPauseRestart) {
      btnPauseRestart.addEventListener('click', () => {
        if (this.pauseModalEl) this.pauseModalEl.classList.add('hidden');
        this.game.restart();
      });
    }

    const btnPauseSettings = document.getElementById('btn-pause-settings');
    if (btnPauseSettings) {
      btnPauseSettings.addEventListener('click', () => {
        if (this.pauseModalEl) this.pauseModalEl.classList.add('hidden');
        this.openModal(this.settingsModalEl);
      });
    }

    const btnPauseLobby = document.getElementById('btn-pause-lobby');
    if (btnPauseLobby) {
      btnPauseLobby.addEventListener('click', () => {
        this.game.returnToLobby();
      });
    }

    // Game Over / Wasted Modal Buttons
    const btnRespawn = document.getElementById('btn-gameover-respawn');
    if (btnRespawn) {
      btnRespawn.addEventListener('click', () => {
        if (this.gameOverModalEl) this.gameOverModalEl.classList.add('hidden');
        this.game.restart();
      });
    }

    const btnGameOverLobby = document.getElementById('btn-gameover-lobby');
    if (btnGameOverLobby) {
      btnGameOverLobby.addEventListener('click', () => {
        this.game.returnToLobby();
      });
    }
  }

  initModalTriggers() {
    const btnExpandMap = document.getElementById('btn-expand-map');
    if (btnExpandMap) {
      btnExpandMap.addEventListener('click', () => {
        this.toggleMapModal();
      });
    }

    const bindClose = (btnId, modalEl) => {
      const btn = document.getElementById(btnId);
      if (btn) btn.addEventListener('click', () => modalEl.classList.add('hidden'));
    };

    bindClose('btn-close-map', this.mapModalEl);
    bindClose('btn-close-char', this.characterModalEl);
    bindClose('btn-close-settings', this.settingsModalEl);
    bindClose('btn-close-controls', this.controlsModalEl);
  }

  initRadioTrigger() {
    const radioPill = document.getElementById('radio-pill');
    if (radioPill) {
      radioPill.addEventListener('click', () => {
        const station = this.game.audioManager.cycleRadioStation();
        this.radioTitle.innerText = station;
        this.showToast(`TUNED TO: ${station} 📻`);
      });
    }
  }

  initSettings() {
    // 4 Graphics Presets (LOW, MEDIUM, HIGH, ULTRA)
    const presetBtns = document.querySelectorAll('#graphics-preset-group .t-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyGraphicsPreset(btn.dataset.preset);
      });
    });

    // Time Presets
    const timeBtns = document.querySelectorAll('#time-preset-group .t-btn');
    timeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        timeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.game.world.weather.applyTimePreset(btn.dataset.time);
        this.showToast(`TIME SET TO: ${btn.dataset.time.toUpperCase()}`);
      });
    });

    // Weather Presets
    const weatherBtns = document.querySelectorAll('#weather-preset-group .t-btn');
    weatherBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        weatherBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.game.world.weather.setWeather(btn.dataset.weather);
        this.showToast(`WEATHER SET TO: ${btn.dataset.weather.toUpperCase()}`);
      });
    });

    // Volume Sliders
    const volMaster = document.getElementById('vol-master');
    if (volMaster) {
      volMaster.value = Math.round(this.game.audioManager.settings.getMasterVolume() * 100);
      volMaster.addEventListener('input', (e) => this.game.audioManager.setVolume('master', e.target.value));
    }

    const volVoice = document.getElementById('vol-voice');
    if (volVoice) {
      volVoice.value = Math.round(this.game.audioManager.settings.getVolume('voice') * 100);
      volVoice.addEventListener('input', (e) => this.game.audioManager.setVolume('voice', e.target.value));
    }

    const volSfx = document.getElementById('vol-sfx');
    if (volSfx) {
      volSfx.value = Math.round(this.game.audioManager.settings.getVolume('sfx') * 100);
      volSfx.addEventListener('input', (e) => this.game.audioManager.setVolume('sfx', e.target.value));
    }

    const volTraffic = document.getElementById('vol-traffic');
    if (volTraffic) {
      volTraffic.value = Math.round(this.game.audioManager.settings.getVolume('traffic') * 100);
      volTraffic.addEventListener('input', (e) => this.game.audioManager.setVolume('traffic', e.target.value));
    }

    const volEnv = document.getElementById('vol-env');
    if (volEnv) {
      volEnv.value = Math.round(this.game.audioManager.settings.getVolume('environment') * 100);
      volEnv.addEventListener('input', (e) => this.game.audioManager.setVolume('environment', e.target.value));
    }

    const volMusic = document.getElementById('vol-music');
    if (volMusic) {
      volMusic.value = Math.round(this.game.audioManager.settings.getVolume('music') * 100);
      volMusic.addEventListener('input', (e) => this.game.audioManager.setVolume('music', e.target.value));
    }

    const btnMute = document.getElementById('btn-toggle-mute');
    if (btnMute) {
      const updateMuteBtnText = () => {
        btnMute.textContent = this.game.audioManager.settings.isMuted ? '🔇 Audio is Muted (Click to Unmute)' : '🔊 Audio Active (Click to Mute)';
      };
      updateMuteBtnText();
      btnMute.addEventListener('click', () => {
        const isMuted = this.game.audioManager.settings.toggleMute();
        updateMuteBtnText();
        this.showToast(isMuted ? 'AUDIO MUTED' : 'AUDIO UNMUTED');
      });
    }

    // Voice Dialogue Subtitle & Language Controls
    const chkSubtitles = document.getElementById('chk-subtitles');
    if (chkSubtitles) {
      chkSubtitles.checked = this.game.audioManager.settings.subtitlesEnabled;
      chkSubtitles.addEventListener('change', (e) => {
        this.game.audioManager.settings.subtitlesEnabled = e.target.checked;
        this.game.audioManager.settings.save();
        this.showToast(e.target.checked ? 'SUBTITLES: ON' : 'SUBTITLES: OFF');
      });
    }

    const selectVoiceLang = document.getElementById('select-voice-lang');
    if (selectVoiceLang) {
      selectVoiceLang.value = this.game.audioManager.settings.language || 'both';
      selectVoiceLang.addEventListener('change', (e) => {
        this.game.audioManager.settings.language = e.target.value;
        this.game.audioManager.settings.save();
        this.showToast(`LANGUAGE: ${e.target.value.toUpperCase()}`);
      });
    }

    // Setup Subtitle UI Presenter
    this.initSubtitlePresenter();
  }

  initSubtitlePresenter() {
    const subContainer = document.getElementById('subtitle-container');
    const subSpeaker = document.getElementById('subtitle-speaker');
    const subText = document.getElementById('subtitle-text');
    const subBengali = document.getElementById('subtitle-bengali');
    let subTimer = null;

    if (!subContainer || !this.game.audioManager.voice || !this.game.audioManager.voice.dialogue) return;

    this.game.audioManager.voice.dialogue.setSubtitleCallbacks(
      (data) => {
        const lang = this.game.audioManager.settings.language || 'both';
        if (subSpeaker) {
          subSpeaker.textContent = (lang === 'bangla' && data.bengaliSpeaker) ? data.bengaliSpeaker : data.speaker;
        }
        if (subText) {
          subText.textContent = `"${data.text}"`;
          subText.style.display = lang === 'bangla' ? 'none' : 'block';
        }
        if (subBengali) {
          subBengali.textContent = `"${data.bengaliText}"`;
          subBengali.style.display = lang === 'english' ? 'none' : 'block';
        }

        subContainer.classList.remove('hidden');
        if (subTimer) clearTimeout(subTimer);
        subTimer = setTimeout(() => {
          subContainer.classList.add('hidden');
        }, (data.duration || 3) * 1000);
      },
      () => {
        if (subContainer) subContainer.classList.add('hidden');
      }
    );
  }

  applyGraphicsPreset(preset) {
    const sun = this.game.world.weather ? this.game.world.weather.sunLight : null;
    // Delegate to upgraded Renderer which handles PostProcessing + shadow resize
    this.game.renderer.applyGraphicsPreset(preset.toUpperCase(), sun);

    const labels = { low: 'LOW (60FPS Mobile)', medium: 'MEDIUM (Balanced)', high: 'HIGH (Cinematic HD)', ultra: 'ULTRA (Max PBR)' };
    this.showToast(`GRAPHICS: ${labels[preset.toLowerCase()] || preset.toUpperCase()}`);
  }

  initCharacterSelect() {
    const cards = document.querySelectorAll('.char-card');
    let selectedChar = 'aslam';

    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedChar = card.dataset.char;
      });
    });

    const btnConfirm = document.getElementById('btn-confirm-char');
    if (btnConfirm) {
      btnConfirm.addEventListener('click', () => {
        const charConfigs = {
          aslam: { name: 'ASLAM BHAI', color: 0x1f2937, avatar: '🧔🏽‍♂️' },
          rahim: { name: 'RAHIM', color: 0xd63031, avatar: '🏃🏽‍♂️' },
          shanto: { name: 'SHANTO', color: 0x0984e3, avatar: '🕶️' },
          maya: { name: 'MAYA', color: 0x6c5ce7, avatar: '👩🏽' }
        };

        const config = charConfigs[selectedChar] || charConfigs.aslam;
        this.game.player.isFemale = (selectedChar === 'maya');
        this.game.player.model.setOutfitColor(config.color);
        const nameEl = document.getElementById('hud-player-name');
        const avatarEl = document.getElementById('hud-avatar');
        if (nameEl) nameEl.innerText = config.name;
        if (avatarEl) avatarEl.innerText = config.avatar;

        this.showToast(`CHARACTER SELECTED: ${config.name}`);
        this.characterModalEl.classList.add('hidden');
      });
    }
  }

  toggleMapModal() {
    if (this.mapModalEl.classList.contains('hidden')) {
      this.mapModalEl.classList.remove('hidden');
      this.districtMapModal.renderMap(this.game.player.position);
    } else {
      this.mapModalEl.classList.add('hidden');
    }
  }

  openModal(modal) {
    this.closeAllModals();
    if (modal) modal.classList.remove('hidden');
  }

  closeAllModals() {
    [
      this.mapModalEl,
      this.characterModalEl,
      this.settingsModalEl,
      this.controlsModalEl,
      this.pauseModalEl,
      this.gameOverModalEl
    ].forEach(m => {
      if (m) m.classList.add('hidden');
    });
    this.garageModal.close();
  }

  showToast(text) {
    if (!this.toastEl || !this.toastText) return;
    this.toastText.innerText = text;
    this.toastEl.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 3200);
  }

  showPrompt(key, text) {
    if (!this.promptEl) return;
    this.promptKey.innerText = key;
    this.promptText.innerText = text;
    this.promptEl.classList.add('visible');
  }

  hidePrompt() {
    if (!this.promptEl) return;
    this.promptEl.classList.remove('visible');
  }

  updateHUD(delta) {
    const player = this.game.player;
    const world = this.game.world;

    // Player Status
    if (this.healthFill) this.healthFill.style.width = player.health + '%';
    if (this.healthVal) this.healthVal.innerText = Math.round(player.health);
    if (this.staminaFill) this.staminaFill.style.width = player.stamina + '%';
    if (this.moneyEl) this.moneyEl.innerText = player.money.toLocaleString();

    // Clock & Weather
    if (this.clockEl) this.clockEl.innerText = world.weather.getTimeFormatted();
    if (this.weatherName) this.weatherName.innerText = world.weather.weatherType.toUpperCase();

    // District Tag
    const curDistrict = world.districtManager.getCurrentDistrict(player.position);
    if (this.districtName && curDistrict) {
      this.districtName.innerText = `${curDistrict.bengali} • ${curDistrict.name}`;
    }

    // Vehicle HUD (Speedometer)
    if (player.isInVehicle && player.currentVehicle) {
      this.speedCluster.classList.remove('hidden');
      const speed = player.currentVehicle.getSpeedKmh();
      if (this.speedNumber) this.speedNumber.innerText = speed;

      const maxSpeed = 120;
      const pct = Math.min(1, speed / maxSpeed);
      const offset = 408 - (408 * 0.75 * pct);
      if (this.speedGauge) this.speedGauge.style.strokeDashoffset = offset;

      if (this.gearIndicator) {
        if (player.currentVehicle.velocity < -0.5) this.gearIndicator.innerText = 'R';
        else if (Math.abs(player.currentVehicle.velocity) < 0.2) this.gearIndicator.innerText = 'N';
        else this.gearIndicator.innerText = 'D';
      }

      if (this.vehicleName) this.vehicleName.innerText = player.currentVehicle.type.toUpperCase();
      if (this.headlightIndicator) {
        this.headlightIndicator.innerText = player.currentVehicle.headlightsOn ? '💡 ON' : '💡 OFF';
      }
    } else {
      this.speedCluster.classList.add('hidden');
    }

    // Minimap update
    const heading = player.isInVehicle && player.currentVehicle
      ? player.currentVehicle.rotationY
      : player.rotationY;

    const missionTarget = this.game.missionManager ? this.game.missionManager.activeMission?.destPos : null;

    this.miniMap.render(
      player.position,
      heading,
      missionTarget,
      this.game.vehicleManager.vehicles
    );

    // Update Developer Character & Physics Telemetry
    if (this.isDebugVisible && player.getDebugTelemetry) {
      const t = player.getDebugTelemetry();
      const elAnim = document.getElementById('dbg-anim');
      if (elAnim) elAnim.innerText = t.animState.toUpperCase();
      const elGround = document.getElementById('dbg-ground');
      if (elGround) {
        elGround.innerText = t.isGrounded ? 'GROUNDED' : 'AIRBORNE';
        elGround.style.color = t.isGrounded ? '#4ade80' : '#f87171';
      }
      const elSpeed = document.getElementById('dbg-speed');
      if (elSpeed) elSpeed.innerText = `${t.speed} m/s`;
      const elVel = document.getElementById('dbg-vel');
      if (elVel) elVel.innerText = `${t.vx}, ${t.vy}, ${t.vz}`;
      const elIK = document.getElementById('dbg-ik');
      if (elIK) elIK.innerText = `${t.leftFootY}m / ${t.rightFootY}m`;
      const elAng = document.getElementById('dbg-ang');
      if (elAng) elAng.innerText = `${t.angularVelocity} rad/s`;
      const elHead = document.getElementById('dbg-heading');
      if (elHead) elHead.innerText = `${t.rotationY}°`;

      // Camera & 360° Sky Telemetry
      if (this.game.cameraController && this.game.cameraController.getDebugTelemetry) {
        const c = this.game.cameraController.getDebugTelemetry();
        const elYaw = document.getElementById('dbg-cam-yaw');
        if (elYaw) elYaw.innerText = `${c.yawDeg}°`;
        const elPitch = document.getElementById('dbg-cam-pitch');
        if (elPitch) elPitch.innerText = `${c.pitchDeg}° (${parseFloat(c.pitchDeg) > 0 ? 'LOOKING UP' : 'LOOKING DOWN'})`;
        const elPos = document.getElementById('dbg-cam-pos');
        if (elPos) elPos.innerText = `${c.posX}, ${c.posY}, ${c.posZ}`;
        const elTarget = document.getElementById('dbg-cam-target');
        if (elTarget) elTarget.innerText = `${c.targetX}, ${c.targetY}, ${c.targetZ}`;
        const elDist = document.getElementById('dbg-cam-dist');
        if (elDist) elDist.innerText = `${c.distance}m [${c.mode.toUpperCase()}]`;
        const elSky = document.getElementById('dbg-sky-status');
        if (elSky && this.game.world && this.game.world.sky) {
          elSky.innerText = this.game.world.sky.isLoaded ? `LOADED (360° ${this.game.world.sky.currentPreset.toUpperCase()})` : 'LOADING...';
          elSky.style.color = this.game.world.sky.isLoaded ? '#4ade80' : '#f59e0b';
        }
      }
    }
  }

  initDeveloperDebug() {
    this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'developer-debug-panel';
    this.debugPanel.style.cssText = `
      position: fixed;
      top: 14px;
      left: 14px;
      background: rgba(10, 15, 29, 0.92);
      border: 1px solid #00ff88;
      border-radius: 8px;
      padding: 10px 14px;
      color: #e2e8f0;
      font-family: monospace;
      font-size: 11px;
      line-height: 1.5;
      z-index: 99999;
      pointer-events: none;
      display: none;
      backdrop-filter: blur(6px);
      box-shadow: 0 4px 16px rgba(0, 255, 136, 0.25);
    `;
    this.debugPanel.innerHTML = `
      <div style="font-weight:bold; color:#00ff88; margin-bottom:6px; letter-spacing:0.5px;">⚙️ DHAKA ENGINE — GAMEPLAY TELEMETRY (F3)</div>
      <div>Animation State: <b id="dbg-anim" style="color:#38bdf8;">IDLE</b></div>
      <div>Ground Contact: <b id="dbg-ground" style="color:#4ade80;">GROUNDED</b></div>
      <div>Horizontal Speed: <b id="dbg-speed" style="color:#fbbf24;">0.00 m/s</b></div>
      <div>Velocity (Vx, Vy, Vz): <b id="dbg-vel" style="color:#f87171;">0.00, 0.00, 0.00</b></div>
      <div>Foot IK Elevation (L/R): <b id="dbg-ik" style="color:#a78bfa;">0.00m / 0.00m</b></div>
      <div>Angular Velocity: <b id="dbg-ang" style="color:#e2e8f0;">0.00 rad/s</b></div>
      <div>Facing Heading: <b id="dbg-heading" style="color:#e2e8f0;">0.0°</b></div>
      <div>Rapier Kinematic Capsule: <b style="color:#00ff88;">ACTIVE (Autostep: 0.38m)</b></div>
      <div style="margin-top:8px; border-top:1px solid rgba(0,255,136,0.3); padding-top:6px; font-weight:bold; color:#38bdf8;">🎥 CAMERA & 360° SKY ENVIRONMENT</div>
      <div>Current Yaw: <b id="dbg-cam-yaw" style="color:#e2e8f0;">0.0°</b> (Continuous 360°)</div>
      <div>Current Pitch: <b id="dbg-cam-pitch" style="color:#facc15;">0.0°</b></div>
      <div>Vertical Range: <b style="color:#38bdf8;">Min: -71.6° (Down) | Max: +85.9° (Up)</b></div>
      <div>Camera Position: <b id="dbg-cam-pos" style="color:#e2e8f0;">0.0, 0.0, 0.0</b></div>
      <div>Look Target: <b id="dbg-cam-target" style="color:#e2e8f0;">0.0, 0.0, 0.0</b></div>
      <div>Camera Distance: <b id="dbg-cam-dist" style="color:#a78bfa;">5.2m</b></div>
      <div>Skybox Status: <b id="dbg-sky-status" style="color:#4ade80;">LOADED (360° Equirectangular)</b></div>
    `;
    document.body.appendChild(this.debugPanel);
    this.isDebugVisible = false;
  }

  toggleDeveloperDebug(overrideState = null) {
    this.isDebugVisible = overrideState !== null ? overrideState : !this.isDebugVisible;
    if (this.debugPanel) {
      this.debugPanel.style.display = this.isDebugVisible ? 'block' : 'none';
    }
    return this.isDebugVisible;
  }

  updateMissionUI(mission, timeRemaining, dist) {
    if (!mission) return;

    if (mission.completed) {
      this.showToast(`🎉 MISSION COMPLETE! REWARD: ৳ ${mission.reward.toLocaleString()}`);
      if (this.missionDesc) this.missionDesc.innerText = 'MISSION COMPLETED! Proceeding to next objective...';
      return;
    }

    if (mission.failed) {
      this.showToast('❌ MISSION FAILED! TIME EXPIRED.');
      if (this.missionDesc) this.missionDesc.innerText = 'Time ran out! Retrying mission...';
      return;
    }

    if (this.missionTitle) this.missionTitle.innerText = mission.title;
    if (this.missionType) this.missionType.innerText = mission.type;
    if (this.missionDesc) this.missionDesc.innerText = mission.desc;
    if (this.missionDist && dist !== undefined) this.missionDist.innerText = `${dist} m`;
    if (this.missionReward) this.missionReward.innerText = `৳ ${mission.reward.toLocaleString()}`;

    if (this.missionTimer && timeRemaining !== undefined) {
      const mins = Math.floor(timeRemaining / 60);
      const secs = Math.floor(timeRemaining % 60);
      this.missionTimer.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  }
}
