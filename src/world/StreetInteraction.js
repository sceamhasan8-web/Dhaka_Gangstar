import * as THREE from 'three';

export class StreetInteraction {
  constructor(scene, audioManager, player, ui) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.player = player;
    this.ui = ui;

    this.teaStalls = [
      { pos: new THREE.Vector3(-12, 0, -50), name: 'Shahbagh Tong', cost: 10 },
      { pos: new THREE.Vector3(12, 0, 45), name: 'Karwan Bazar Tong', cost: 10 },
      { pos: new THREE.Vector3(-142, 0, -320), name: 'Puran Dhaka Lal Cha', cost: 10 },
      { pos: new THREE.Vector3(12, 0, 210), name: 'Gulshan Lakeside Tong', cost: 15 }
    ];

    this.biryaniStalls = [
      { pos: new THREE.Vector3(-150, 0, -320), name: 'Haji Biryani Old Dhaka', cost: 220 },
      { pos: new THREE.Vector3(150, 0, -180), name: 'Dilkusha Kacchi Ghar', cost: 250 }
    ];

    this.cashPickups = [];
    this.initCashPickups();
  }

  initCashPickups() {
    // Hidden cash briefcases / money bundles across Dhaka alleys
    const pickupLocations = [
      new THREE.Vector3(-160, 0.4, -340), // Old Dhaka alley
      new THREE.Vector3(-145, 0.4, -415), // Sadarghat jetty
      new THREE.Vector3(5, 0.4, 185),     // Hatirjheel bridge promenade
      new THREE.Vector3(160, 0.4, -150),  // Motijheel bank plaza
      new THREE.Vector3(-225, 0.4, 75),   // Shaheed Minar garden
      new THREE.Vector3(-315, 0.4, -95)   // Curzon Hall corridor
    ];

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0xffb800,
      emissiveIntensity: 0.3
    });

    pickupLocations.forEach(pos => {
      // Golden ৳ Currency Briefcase
      const geo = new THREE.BoxGeometry(0.8, 0.5, 0.3);
      const mesh = new THREE.Mesh(geo, goldMat);
      mesh.position.copy(pos);
      this.scene.add(mesh);

      this.cashPickups.push({
        mesh,
        amount: Math.floor(500 + Math.random() * 1000),
        collected: false
      });
    });
  }

  checkInteractions(pos) {
    // 1. Check near tea stalls
    for (const stall of this.teaStalls) {
      if (pos.distanceTo(stall.pos) < 3.2) {
        return {
          type: 'tea',
          data: stall,
          text: `DRINK LAL CHA (৳ ${stall.cost}) - RESTORE HP & STAMINA`
        };
      }
    }

    // 2. Check near biryani stalls
    for (const b of this.biryaniStalls) {
      if (pos.distanceTo(b.pos) < 3.5) {
        return {
          type: 'biryani',
          data: b,
          text: `EAT KACCHI BIRYANI (৳ ${b.cost}) - SPEED NITRO BUFF`
        };
      }
    }

    return null;
  }

  executeInteraction(interaction) {
    if (!interaction) return;

    if (interaction.type === 'tea') {
      const stall = interaction.data;
      if (this.player.money >= stall.cost) {
        this.player.money -= stall.cost;
        this.player.health = Math.min(100, this.player.health + 35);
        this.player.stamina = 100;
        this.audioManager.playCashReward();
        if (this.audioManager && this.audioManager.voiceEvents) {
          this.audioManager.voiceEvents.triggerVendorTea();
        }
        this.ui.showToast(`☕ গরম ধোঁয়া ওঠা লাল চা! (${stall.name}) স্বাস্থ্য ও স্ট্যামিনা পূর্ণ!`);
      } else {
        this.ui.showToast('টাকা নেই! চা খাওয়ার মতো টাকা দরকার।');
      }
    } else if (interaction.type === 'biryani') {
      const stall = interaction.data;
      if (this.player.money >= stall.cost) {
        this.player.money -= stall.cost;
        this.player.health = 100;
        this.player.stamina = 100;
        this.audioManager.playCashReward();
        if (this.audioManager && this.audioManager.voiceEvents) {
          this.audioManager.voiceEvents.triggerVendorBiryani();
        }
        this.ui.showToast(`🍛 গরম কাচ্চি বিরিয়ানি! (${stall.name}) সুপার স্পিড সক্রিয়!`);
      }
    }
  }

  update(delta, playerPos) {
    // Animate and check cash pickups
    this.cashPickups.forEach(p => {
      if (p.collected) return;

      p.mesh.rotation.y += delta * 2.5;
      p.mesh.position.y = 0.4 + Math.sin(Date.now() * 0.005) * 0.12;

      if (playerPos.distanceTo(p.mesh.position) < 1.8) {
        p.collected = true;
        this.scene.remove(p.mesh);
        this.player.money += p.amount;
        this.audioManager.playCashReward();
        this.ui.showToast(`💰 লুকানো টাকা উদ্ধার! +৳ ${p.amount.toLocaleString()}`);
      }
    });
  }
}

