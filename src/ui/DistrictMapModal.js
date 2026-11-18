// Full-Screen Dhaka Metropolitan City Map Modal

export class DistrictMapModal {
  constructor(roadNetwork, districtManager, landmarks, onSelectWaypoint) {
    this.roadNetwork = roadNetwork;
    this.districtManager = districtManager;
    this.landmarks = landmarks;
    this.onSelectWaypoint = onSelectWaypoint;

    this.canvas = document.getElementById('fullscreen-map-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.districtListEl = document.getElementById('district-list');

    this.initList();
    this.initCanvasClick();
  }

  initList() {
    if (!this.districtListEl) return;
    this.districtListEl.innerHTML = '';

    this.districtManager.districts.forEach(d => {
      const item = document.createElement('div');
      item.className = 'district-item';
      item.innerHTML = `
        <div>
          <span style="color:#00ff88;">${d.bengali}</span> • <span>${d.name}</span>
        </div>
        <span style="font-size:0.75rem; color:#888;">GPS ➔</span>
      `;

      item.addEventListener('click', () => {
        this.districtManager.setGPSWaypoint(d.id);
        if (this.onSelectWaypoint) this.onSelectWaypoint(d);
        this.renderMap();
      });

      this.districtListEl.appendChild(item);
    });
  }

  initCanvasClick() {
    if (!this.canvas) return;
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Transform canvas coord to world coord
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;
      const scale = 0.9;

      const worldX = (clickX - cx) / scale;
      const worldZ = (clickY - cy) / scale;

      // Find closest district
      const closest = this.districtManager.getCurrentDistrict({ x: worldX, z: worldZ });
      if (closest) {
        this.districtManager.setGPSWaypoint(closest.id);
        if (this.onSelectWaypoint) this.onSelectWaypoint(closest);
        this.renderMap();
      }
    });
  }

  renderMap(playerPos) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 0.9; // World to canvas scale

    ctx.fillStyle = '#0a0f18';
    ctx.fillRect(0, 0, w, h);

    // City grid background lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(cx, cy);

    // Draw Water Bodies (Hatirjheel & Buriganga)
    ctx.fillStyle = 'rgba(0, 168, 204, 0.25)';
    // Hatirjheel Lake
    ctx.beginPath();
    ctx.ellipse(0 * scale, 180 * scale, 70 * scale, 30 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Buriganga River (South)
    ctx.beginPath();
    ctx.rect(-280 * scale, -420 * scale, 380 * scale, 45 * scale);
    ctx.fill();

    // Draw Roads
    ctx.strokeStyle = '#243447';
    ctx.lineWidth = 10 * scale;
    ctx.lineCap = 'round';

    this.roadNetwork.roads.forEach(r => {
      ctx.beginPath();
      ctx.moveTo(r.start.x * scale, r.start.z * scale);
      ctx.lineTo(r.end.x * scale, r.end.z * scale);
      ctx.stroke();
    });

    // Yellow Dividers
    ctx.strokeStyle = 'rgba(255, 184, 0, 0.6)';
    ctx.lineWidth = 2 * scale;
    this.roadNetwork.roads.forEach(r => {
      ctx.beginPath();
      ctx.moveTo(r.start.x * scale, r.start.z * scale);
      ctx.lineTo(r.end.x * scale, r.end.z * scale);
      ctx.stroke();
    });

    // Draw Districts
    this.districtManager.districts.forEach(d => {
      const dx = d.x * scale;
      const dz = d.z * scale;

      // Zone boundary ring
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(dx, dz, d.radius * 0.45 * scale, 0, Math.PI * 2);
      ctx.stroke();

      // District Center point
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(dx, dz, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Bengali Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Tiro Bangla", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.bengali, dx, dz - 8);

      // English Name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px "Rajdhani", sans-serif';
      ctx.fillText(d.name, dx, dz + 16);
    });

    // Draw Active GPS Waypoint
    if (this.districtManager.activeGPSWaypoint) {
      const gx = this.districtManager.activeGPSWaypoint.x * scale;
      const gz = this.districtManager.activeGPSWaypoint.z * scale;

      ctx.fillStyle = '#ffb800';
      ctx.beginPath();
      ctx.arc(gx, gz, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffb800';
      ctx.font = 'bold 12px "Orbitron", sans-serif';
      ctx.fillText('TARGET GPS', gx, gz - 12);
    }

    // Draw Player Location Blip
    if (playerPos) {
      const px = playerPos.x * scale;
      const pz = playerPos.z * scale;

      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(px, pz, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 12px "Rajdhani", sans-serif';
      ctx.fillText('YOU ARE HERE', px, pz + 18);
    }

    ctx.restore();
  }
}

