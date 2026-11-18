import * as THREE from 'three';

// Dhaka Metro Rail (MRT Line 6) Elevated Viaduct & Animated Train

export class MetroRail {
  constructor(scene) {
    this.scene = scene;
    this.viaductGroup = new THREE.Group();
    this.trainGroup = new THREE.Group();
    this.trainZ = -240;
    this.trainSpeed = 22; // m/s
    this.trainDirection = 1;

    this.initViaduct();
    this.initTrain();
  }

  initViaduct() {
    const viaductHeight = 14;
    const viaductWidth = 10;
    const startZ = -260;
    const endZ = 360;
    const length = endZ - startZ;
    const posX = -180; // Runs along Mirpur Road corridor

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.8,
      metalness: 0.1
    });

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x374151,
      roughness: 0.4,
      metalness: 0.8
    });

    // Main Deck Box Girder
    const deckGeo = new THREE.BoxGeometry(viaductWidth, 2.2, length);
    const deck = new THREE.Mesh(deckGeo, concreteMat);
    deck.position.set(posX, viaductHeight, (startZ + endZ) / 2);
    this.viaductGroup.add(deck);

    // Parapet safety walls on sides
    const wallGeo = new THREE.BoxGeometry(0.5, 1.4, length);
    const wallL = new THREE.Mesh(wallGeo, concreteMat);
    wallL.position.set(posX - viaductWidth / 2 + 0.25, viaductHeight + 1.2, (startZ + endZ) / 2);
    this.viaductGroup.add(wallL);

    const wallR = new THREE.Mesh(wallGeo, concreteMat);
    wallR.position.set(posX + viaductWidth / 2 - 0.25, viaductHeight + 1.2, (startZ + endZ) / 2);
    this.viaductGroup.add(wallR);

    // Steel Rails (2 tracks: up and down)
    const steelGeo = new THREE.BoxGeometry(0.3, 0.4, length);
    const trackOffsets = [-2.8, -1.8, 1.8, 2.8];
    trackOffsets.forEach(ox => {
      const rail = new THREE.Mesh(steelGeo, railMat);
      rail.position.set(posX + ox, viaductHeight + 1.2, (startZ + endZ) / 2);
      this.viaductGroup.add(rail);
    });

    // Giant Cylindrical Concrete Piers (every 30m)
    for (let z = startZ + 15; z <= endZ; z += 30) {
      const pierGeo = new THREE.CylinderGeometry(1.8, 2.0, viaductHeight, 16);
      const pier = new THREE.Mesh(pierGeo, concreteMat);
      pier.position.set(posX, viaductHeight / 2, z);
      this.viaductGroup.add(pier);

      // Pier Hammerhead Cap
      const capGeo = new THREE.BoxGeometry(viaductWidth + 1, 1.6, 3.5);
      const cap = new THREE.Mesh(capGeo, concreteMat);
      cap.position.set(posX, viaductHeight - 1, z);
      this.viaductGroup.add(cap);
    }

    // Elevated Metro Station Structure (Farmgate / Mirpur Station)
    this.createStation(posX, viaductHeight, 80);

    this.scene.add(this.viaductGroup);
  }

  createStation(x, y, z) {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(x, y, z);

    // Platform roof canopy & glass walls
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x008751, // Green MRT roof
      roughness: 0.4,
      metalness: 0.3
    });

    const roofGeo = new THREE.BoxGeometry(18, 1.2, 70);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 8;
    stationGroup.add(roof);

    // Station pillars
    const colMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for (let sz = -30; sz <= 30; sz += 15) {
      const cGeo = new THREE.CylinderGeometry(0.4, 0.4, 8);
      const cL = new THREE.Mesh(cGeo, colMat);
      cL.position.set(-8, 4, sz);
      stationGroup.add(cL);

      const cR = new THREE.Mesh(cGeo, colMat);
      cR.position.set(8, 4, sz);
      stationGroup.add(cR);
    }

    // Station Name Signboard Canvas
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#008751';
    sctx.fillRect(0, 0, 512, 128);
    sctx.strokeStyle = '#f42a41';
    sctx.lineWidth = 8;
    sctx.strokeRect(4, 4, 504, 120);

    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 44px "Tiro Bangla", sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('ফার্মগেট মেট্রো স্টেশন', 256, 55);

    sctx.fillStyle = '#ffbe00';
    sctx.font = 'bold 22px "Rajdhani", sans-serif';
    sctx.fillText('MRT LINE 6 • FARMGATE METRO STATION', 256, 95);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 4), signMat);
    signMesh.position.set(-9.1, 4.5, 0);
    signMesh.rotation.y = -Math.PI / 2;
    stationGroup.add(signMesh);

    this.viaductGroup.add(stationGroup);
  }

  initTrain() {
    // 4-Car MRT Train with Green & Red Livery
    const carLength = 22;
    const carWidth = 3.2;
    const carHeight = 3.4;
    const viaductHeight = 14;
    const posX = -180 + 2.3; // Right track

    const trainBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.3,
      metalness: 0.6
    });

    const greenStripeMat = new THREE.MeshStandardMaterial({
      color: 0x008751,
      roughness: 0.4
    });

    const redStripeMat = new THREE.MeshStandardMaterial({
      color: 0xf42a41,
      roughness: 0.4
    });

    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.1,
      metalness: 0.9
    });

    this.trainGroup.position.set(posX, viaductHeight + 1.2 + carHeight / 2, this.trainZ);

    for (let c = 0; c < 4; c++) {
      const carGroup = new THREE.Group();
      carGroup.position.z = c * (carLength + 0.6);

      // Car Shell
      const body = new THREE.Mesh(new THREE.BoxGeometry(carWidth, carHeight, carLength), trainBodyMat);
      carGroup.add(body);

      // MRT Line 6 Green Side Stripe
      const gStripe = new THREE.Mesh(new THREE.BoxGeometry(carWidth + 0.05, 0.6, carLength), greenStripeMat);
      gStripe.position.y = -0.4;
      carGroup.add(gStripe);

      // Red accent stripe
      const rStripe = new THREE.Mesh(new THREE.BoxGeometry(carWidth + 0.05, 0.2, carLength), redStripeMat);
      rStripe.position.y = -0.85;
      carGroup.add(rStripe);

      // Passenger Tinted Windows
      const winGeo = new THREE.BoxGeometry(carWidth + 0.1, 1.1, carLength - 3);
      const win = new THREE.Mesh(winGeo, windowMat);
      win.position.y = 0.5;
      carGroup.add(win);

      this.trainGroup.add(carGroup);
    }

    // Train Headlight
    const light = new THREE.PointLight(0xfff3d1, 2, 40);
    light.position.set(0, 0, -carLength / 2 - 1);
    this.trainGroup.add(light);

    this.scene.add(this.trainGroup);
  }

  update(delta) {
    // Train movement
    this.trainZ += this.trainSpeed * this.trainDirection * delta;

    if (this.trainZ > 340) {
      this.trainDirection = -1;
      this.trainGroup.rotation.y = Math.PI;
    } else if (this.trainZ < -240) {
      this.trainDirection = 1;
      this.trainGroup.rotation.y = 0;
    }

    this.trainGroup.position.z = this.trainZ;
  }
}

