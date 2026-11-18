// 2D Circular Radar Minimap Renderer for Dhaka City

export class MiniMap {
  constructor(canvasId, roadNetwork, districtManager) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.roadNetwork = roadNetwork;
    this.districtManager = districtManager;
    this.zoom = 0.55; // Pixels per world meter
  }

  render(playerPos, playerHeading, missionTarget, vehicles) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear background (Dark Dhaka map)
    ctx.fillStyle = '#0d131e';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    // Clip circular minimap
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.clip();

    // Map Center on Player
    ctx.translate(cx, cy);

    // Draw Roads
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 9 * this.zoom;
    ctx.lineCap = 'round';

    this.roadNetwork.roads.forEach(r => {
      const sx = (r.start.x - playerPos.x) * this.zoom;
      const sy = (r.start.z - playerPos.z) * this.zoom;
      const ex = (r.end.x - playerPos.x) * this.zoom;
      const ey = (r.end.z - playerPos.z) * this.zoom;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    });

    // Draw Yellow Center Road Lines
    ctx.strokeStyle = 'rgba(255, 184, 0, 0.4)';
    ctx.lineWidth = 2 * this.zoom;
    this.roadNetwork.roads.forEach(r => {
      const sx = (r.start.x - playerPos.x) * this.zoom;
      const sy = (r.start.z - playerPos.z) * this.zoom;
      const ex = (r.end.x - playerPos.x) * this.zoom;
      const ey = (r.end.z - playerPos.z) * this.zoom;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    });

    // Draw GPS Navigation Route line if active
    const target = this.districtManager.activeGPSWaypoint || missionTarget;
    if (target) {
      const tx = (target.x - playerPos.x) * this.zoom;
      const ty = (target.z - playerPos.z) * this.zoom;

      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 4 * this.zoom;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      // Destination Objective Blip
      ctx.fillStyle = '#ff2a41';
      ctx.beginPath();
      ctx.arc(tx, ty, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw Nearby Vehicles
    if (vehicles) {
      ctx.fillStyle = '#ffb800';
      vehicles.forEach(v => {
        const vx = (v.position.x - playerPos.x) * this.zoom;
        const vy = (v.position.z - playerPos.z) * this.zoom;
        if (Math.hypot(vx, vy) < cx) {
          ctx.beginPath();
          ctx.arc(vx, vy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Player Blip & Direction Cone
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // View cone
    ctx.fillStyle = 'rgba(0, 255, 136, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const coneAngle = playerHeading || 0;
    ctx.arc(0, 0, 22, coneAngle - 0.5, coneAngle + 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Subtle Grid ring overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, cx * 0.5, 0, Math.PI * 2);
    ctx.arc(cx, cy, cx * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }
}

