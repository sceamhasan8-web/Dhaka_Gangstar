// Dhaka Mod Garage & Showroom UI Controller

export class GarageModal {
  constructor(vehicleManager, player, audioManager, onSpawnVehicle) {
    this.vehicleManager = vehicleManager;
    this.player = player;
    this.audioManager = audioManager;
    this.onSpawnVehicle = onSpawnVehicle;

    this.selectedType = 'cng';
    this.selectedColor = 0x008751;
    this.selectedNeon = null;

    this.colors = [
      { name: 'Dhaka Emerald', hex: 0x008751, css: '#008751' },
      { name: 'Rickshaw Art Gold', hex: 0xffbe00, css: '#ffbe00' },
      { name: 'Buriganga Crimson', hex: 0xd62828, css: '#d62828' },
      { name: 'Cyber Neon Cyan', hex: 0x00e5ff, css: '#00e5ff' },
      { name: 'Motijheel Midnight', hex: 0x111827, css: '#111827' },
      { name: 'Gulshan Pearl White', hex: 0xf3f4f6, css: '#f3f4f6' },
      { name: 'Sunset Orange', hex: 0xff7700, css: '#ff7700' }
    ];

    this.initTabs();
    this.initColorSwatches();
    this.initPerformanceUpgrades();
    this.initSpawnButton();
  }

  initTabs() {
    const tabs = document.querySelectorAll('.v-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.selectedType = tab.dataset.v;
        this.updateStatsDisplay();
      });
    });
  }

  initColorSwatches() {
    const palette = document.getElementById('paint-palette');
    if (!palette) return;
    palette.innerHTML = '';

    this.colors.forEach((c, idx) => {
      const swatch = document.createElement('div');
      swatch.className = `swatch ${idx === 0 ? 'active' : ''}`;
      swatch.style.backgroundColor = c.css;
      swatch.title = c.name;

      swatch.addEventListener('click', () => {
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.selectedColor = c.hex;
      });

      palette.appendChild(swatch);
    });
  }

  initPerformanceUpgrades() {
    const btnSpeed = document.getElementById('btn-upgrade-speed');
    const btnBrakes = document.getElementById('btn-upgrade-brakes');
    const btnHorn = document.getElementById('btn-upgrade-horn');

    const handleUpgrade = (btn, cost, name) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        if (this.player.money >= cost) {
          this.player.money -= cost;
          this.audioManager.playCashReward();
          btn.innerText = 'INSTALLED ✓';
          btn.disabled = true;
          btn.style.borderColor = '#00ff88';
          btn.style.color = '#00ff88';
        }
      });
    };

    handleUpgrade(btnSpeed, 2000, 'Speed Kit');
    handleUpgrade(btnBrakes, 1500, 'Brake Kit');
    handleUpgrade(btnHorn, 800, 'Dual Horn');
  }

  initSpawnButton() {
    const btnSpawn = document.getElementById('btn-spawn-vehicle');
    if (!btnSpawn) return;

    btnSpawn.addEventListener('click', () => {
      if (this.onSpawnVehicle) {
        this.onSpawnVehicle(this.selectedType, this.selectedColor);
      }
      this.close();
    });
  }

  updateStatsDisplay() {
    const titleEl = document.getElementById('garage-v-title');
    const sSpeed = document.getElementById('stat-speed');
    const sAccel = document.getElementById('stat-accel');
    const sHandle = document.getElementById('stat-handle');
    const sArmor = document.getElementById('stat-armor');

    const stats = {
      cng: { name: 'CNG AUTO-RICKSHAW', spd: 55, acc: 65, han: 92, arm: 45 },
      rickshaw: { name: 'TRADITIONAL PEDAL RICKSHAW', spd: 25, acc: 35, han: 96, arm: 30 },
      bus: { name: 'DHAKA LOCAL BUS ("MURIR TIN")', spd: 50, acc: 35, han: 40, arm: 95 },
      sedan: { name: 'COROLLA SEDAN (DHAKA TAXI)', spd: 85, acc: 80, han: 75, arm: 65 },
      bike: { name: 'METRO SPEED MOTORCYCLE', spd: 80, acc: 90, han: 90, arm: 35 },
      police: { name: 'DHAKA POLICE PATROL PICKUP', spd: 90, acc: 85, han: 80, arm: 85 }
    };

    const s = stats[this.selectedType] || stats.cng;
    if (titleEl) titleEl.innerText = s.name;
    if (sSpeed) sSpeed.style.width = s.spd + '%';
    if (sAccel) sAccel.style.width = s.acc + '%';
    if (sHandle) sHandle.style.width = s.han + '%';
    if (sArmor) sArmor.style.width = s.arm + '%';
  }

  open() {
    const modal = document.getElementById('garage-modal');
    if (modal) modal.classList.remove('hidden');
    const moneyEl = document.getElementById('garage-money');
    if (moneyEl) moneyEl.innerText = this.player.money.toLocaleString();
    this.updateStatsDisplay();
  }

  close() {
    const modal = document.getElementById('garage-modal');
    if (modal) modal.classList.add('hidden');
  }
}

