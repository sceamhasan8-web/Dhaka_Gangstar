import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures.js';

export class StreetProps {
  constructor(scene) {
    this.scene = scene;
    this.propsGroup = new THREE.Group();
    this.propsGroup.name = 'DhakaStreetProps';
    this.streetLights = [];
    this.trafficLights = [];
    this.colliders = [];

    this.initElectricPolesAndWires();
    this.initStreetLamps();
    this.initTeaStalls();
    this.initStreetFoodCarts();
    this.initBusStops();
    this.initTrafficSignals();
    this.initStreetBenches();
    this.initWasteBins();
    this.initRoadsideCabinets();
    this.initFireHydrants();
    this.initPedestrianGuardrails();

    this.scene.add(this.propsGroup);
  }

  // 1. CONCRETE UTILITY ELECTRIC POLES & OVERHEAD WIRES
  initElectricPolesAndWires() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x8a929a, roughness: 0.9 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x111111, linewidth: 2 });

    const polePositions = [
      new THREE.Vector3(-10, 0, -180),
      new THREE.Vector3(-10, 0, -80),
      new THREE.Vector3(-10, 0, 20),
      new THREE.Vector3(-10, 0, 120),
      new THREE.Vector3(-10, 0, 220),

      new THREE.Vector3(10, 0, -140),
      new THREE.Vector3(10, 0, -40),
      new THREE.Vector3(10, 0, 60),
      new THREE.Vector3(10, 0, 160),

      // Old Dhaka dense wire cluster
      new THREE.Vector3(-140, 0, -280),
      new THREE.Vector3(-140, 0, -340),
      new THREE.Vector3(-140, 0, -400)
    ];

    const poleTops = [];

    polePositions.forEach(pos => {
      // Concrete Post
      const poleGeo = new THREE.CylinderGeometry(0.3, 0.4, 9, 8);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(pos.x, 4.5, pos.z);
      this.propsGroup.add(pole);

      // Horizontal Crossarms with ceramic insulators
      const crossGeo = new THREE.BoxGeometry(2.4, 0.2, 0.2);
      const cross = new THREE.Mesh(crossGeo, poleMat);
      cross.position.set(pos.x, 8.2, pos.z);
      this.propsGroup.add(cross);

      // Transformer cylinder on some poles
      if (Math.random() > 0.6) {
        const trGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.4, 8);
        const trMat = new THREE.MeshStandardMaterial({ color: 0x5a626a });
        const tr = new THREE.Mesh(trGeo, trMat);
        tr.position.set(pos.x + 0.6, 6.5, pos.z);
        this.propsGroup.add(tr);
      }

      poleTops.push(new THREE.Vector3(pos.x, 8.2, pos.z));
      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(pos.x, 4.5, pos.z),
          new THREE.Vector3(0.8, 9.0, 0.8)
        )
      );
    });

    // Sagging tangled overhead cables connecting poles
    for (let i = 0; i < poleTops.length - 1; i++) {
      const p1 = poleTops[i];
      const p2 = poleTops[i + 1];
      if (p1.distanceTo(p2) > 120) continue;

      // Create catenary curved drooping wires
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y -= 1.8; // Droop sag

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const pts = curve.getPoints(12);
      const wireGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const wireLine = new THREE.Line(wireGeo, wireMat);
      this.propsGroup.add(wireLine);

      // Second wire with slight offset
      const mid2 = mid.clone();
      mid2.y -= 0.5;
      mid2.x += 0.3;
      const curve2 = new THREE.QuadraticBezierCurve3(p1, mid2, p2);
      const pts2 = curve2.getPoints(12);
      const wireGeo2 = new THREE.BufferGeometry().setFromPoints(pts2);
      const wireLine2 = new THREE.Line(wireGeo2, wireMat);
      this.propsGroup.add(wireLine2);
    }
  }

  // 2. STREET LAMPS WITH LIGHT ILLUMINATION
  initStreetLamps() {
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.6 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff2cc });

    const lampPositions = [
      new THREE.Vector3(9.5, 0, -220),
      new THREE.Vector3(9.5, 0, -120),
      new THREE.Vector3(9.5, 0, -20),
      new THREE.Vector3(9.5, 0, 80),
      new THREE.Vector3(9.5, 0, 180),
      new THREE.Vector3(9.5, 0, 280),

      new THREE.Vector3(-9.5, 0, -170),
      new THREE.Vector3(-9.5, 0, -70),
      new THREE.Vector3(-9.5, 0, 30),
      new THREE.Vector3(-9.5, 0, 130),
      new THREE.Vector3(-9.5, 0, 230)
    ];

    lampPositions.forEach(pos => {
      const lampGroup = new THREE.Group();
      lampGroup.position.copy(pos);

      // Pole
      const poleGeo = new THREE.CylinderGeometry(0.18, 0.25, 8, 8);
      const pole = new THREE.Mesh(poleGeo, lampMat);
      pole.position.y = 4;
      lampGroup.add(pole);

      // Curved arm over the road
      const armGeo = new THREE.BoxGeometry(2.2, 0.15, 0.15);
      const arm = new THREE.Mesh(armGeo, lampMat);
      arm.position.set(-pos.x > 0 ? 1.0 : -1.0, 7.8, 0);
      lampGroup.add(arm);

      // Fixture
      const bulbGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(-pos.x > 0 ? 1.8 : -1.8, 7.6, 0);
      lampGroup.add(bulb);

      // Point Light for night illumination
      const light = new THREE.PointLight(0xffeaad, 1.2, 28);
      light.position.set(-pos.x > 0 ? 1.8 : -1.8, 7.2, 0);
      lampGroup.add(light);
      this.streetLights.push(light);

      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(pos.x, 4.0, pos.z),
          new THREE.Vector3(0.6, 8.0, 0.6)
        )
      );

      this.propsGroup.add(lampGroup);
    });
  }

  // 3. ROADSIDE TEA STALLS ("TONG-ER DOKAN")
  initTeaStalls() {
    const stallPositions = [
      new THREE.Vector3(-12, 0, -50),
      new THREE.Vector3(12, 0, 45),
      new THREE.Vector3(-142, 0, -320), // Old Dhaka
      new THREE.Vector3(12, 0, 210)
    ];

    stallPositions.forEach(pos => {
      const stall = new THREE.Group();
      stall.position.copy(pos);

      // Blue tarpaulin roof / awning (Classic Dhaka roadside tong)
      const tarpGeo = new THREE.BoxGeometry(4.5, 0.1, 3.2);
      const tarpMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.9 });
      const tarp = new THREE.Mesh(tarpGeo, tarpMat);
      tarp.rotation.z = 0.08;
      tarp.position.y = 2.7;
      stall.add(tarp);

      // Bamboo support posts
      const bambooMat = new THREE.MeshStandardMaterial({ color: 0xb58a57 });
      const bOffsets = [
        { x: -2, z: -1.4 }, { x: 2, z: -1.4 },
        { x: -2, z: 1.4 }, { x: 2, z: 1.4 }
      ];
      bOffsets.forEach(bo => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.7), bambooMat);
        post.position.set(bo.x, 1.35, bo.z);
        stall.add(post);
      });

      // Wooden counter table
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });
      const counter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.0, 1.4), woodMat);
      counter.position.set(0, 0.5, 0);
      stall.add(counter);

      // Brass Tea Kettle (Dhakaiya aluminium kettle)
      const kettleGeo = new THREE.CylinderGeometry(0.25, 0.35, 0.5, 10);
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
      const kettle = new THREE.Mesh(kettleGeo, brassMat);
      kettle.position.set(-0.6, 1.25, 0);
      stall.add(kettle);

      // Red plastic tea cups (Lal Cha)
      const cupMat = new THREE.MeshBasicMaterial({ color: 0xd32f2f });
      for (let c = 0; c < 3; c++) {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.14), cupMat);
        cup.position.set(0.1 + c * 0.22, 1.07, 0.1);
        stall.add(cup);
      }

      // Wooden bench for customers
      const bench = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.45, 0.6), woodMat);
      bench.position.set(0, 0.25, 1.8);
      stall.add(bench);

      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(pos.x, 1.4, pos.z),
          new THREE.Vector3(4.8, 2.8, 3.6)
        )
      );

      this.propsGroup.add(stall);
    });
  }

  // 4. STREET FOOD CARTS (FUCHKA / CHOTPOTI & THELAGARI)
  initStreetFoodCarts() {
    const cartPositions = [
      new THREE.Vector3(12, 0, -110),
      new THREE.Vector3(-12, 0, 110),
      new THREE.Vector3(-142, 0, -360)
    ];

    cartPositions.forEach(pos => {
      const cart = new THREE.Group();
      cart.position.copy(pos);

      // 4-wheel wooden cart base (Thelagari)
      const baseGeo = new THREE.BoxGeometry(2.4, 0.2, 1.4);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x825a38 });
      const base = new THREE.Mesh(baseGeo, woodMat);
      base.position.y = 0.8;
      cart.add(base);

      // Glass cabinet for crisp fuchkas
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1
      });
      const glassCase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.1), glassMat);
      glassCase.position.set(-0.3, 1.35, 0);
      cart.add(glassCase);

      // Golden fried fuchka balls inside
      const fuchkaMat = new THREE.MeshStandardMaterial({ color: 0xe6a13b, roughness: 0.7 });
      for (let f = 0; f < 8; f++) {
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), fuchkaMat);
        ball.position.set(-0.6 + (f % 3) * 0.25, 1.05 + Math.floor(f / 3) * 0.2, (f % 2) * 0.2 - 0.1);
        cart.add(ball);
      }

      // Traditional 2 large spoked bicycle-style wheels
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      const wL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 12), wheelMat);
      wL.rotation.z = Math.PI / 2;
      wL.position.set(-0.7, 0.4, 0.7);
      cart.add(wL);

      const wR = wL.clone();
      wR.position.set(-0.7, 0.4, -0.7);
      cart.add(wR);

      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(pos.x, 1.0, pos.z),
          new THREE.Vector3(2.6, 2.0, 1.6)
        )
      );

      this.propsGroup.add(cart);
    });
  }

  // 5. BUS STOP SHELTERS
  initBusStops() {
    const stops = [
      { pos: new THREE.Vector3(12, 0, -80), rot: 0, title: 'শাহবাগ বাস স্টপ' },
      { pos: new THREE.Vector3(12, 0, 140), rot: 0, title: 'কারওয়ান বাজার মোড়' },
      { pos: new THREE.Vector3(-192, 0, 20), rot: Math.PI, title: 'ধানমন্ডি ২৭ বাস স্ট্যান্ড' }
    ];

    stops.forEach(s => {
      const stopGroup = new THREE.Group();
      stopGroup.position.copy(s.pos);
      stopGroup.rotation.y = s.rot;

      // Canopy roof
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x008751 });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 2.5), roofMat);
      roof.position.set(0, 3.2, 0);
      stopGroup.add(roof);

      // Steel posts
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2), steelMat);
      p1.position.set(-2.6, 1.6, -1);
      stopGroup.add(p1);

      const p2 = p1.clone();
      p2.position.set(2.6, 1.6, -1);
      stopGroup.add(p2);

      // Back advertisement glass panel
      const adCanvas = document.createElement('canvas');
      adCanvas.width = 512;
      adCanvas.height = 256;
      const actx = adCanvas.getContext('2d');
      actx.fillStyle = '#0f172a';
      actx.fillRect(0, 0, 512, 256);
      actx.fillStyle = '#ffbe00';
      actx.font = 'bold 36px "Tiro Bangla", sans-serif';
      actx.textAlign = 'center';
      actx.fillText(s.title, 256, 110);
      actx.fillStyle = '#00ff88';
      actx.font = 'bold 20px "Rajdhani", sans-serif';
      actx.fillText('DHAKA METROPOLITAN BUS SERVICE', 256, 160);

      const adTex = new THREE.CanvasTexture(adCanvas);
      const adMat = new THREE.MeshBasicMaterial({ map: adTex, side: THREE.DoubleSide });
      const adBoard = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.2), adMat);
      adBoard.position.set(0, 1.7, -1);
      stopGroup.add(adBoard);

      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(s.pos.x, 1.6, s.pos.z),
          new THREE.Vector3(6.2, 3.2, 2.8)
        )
      );

      this.propsGroup.add(stopGroup);
    });
  }

  // 6. TRAFFIC SIGNALS
  initTrafficSignals() {
    const intersections = [
      new THREE.Vector3(10, 0, -100),
      new THREE.Vector3(-10, 0, 80),
      new THREE.Vector3(10, 0, 240)
    ];

    intersections.forEach(pos => {
      const sigGroup = new THREE.Group();
      sigGroup.position.copy(pos);

      // Pole
      const poleGeo = new THREE.CylinderGeometry(0.18, 0.22, 6.5, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 3.25;
      sigGroup.add(pole);

      // Light housing box
      const boxGeo = new THREE.BoxGeometry(0.7, 1.8, 0.7);
      const box = new THREE.Mesh(boxGeo, poleMat);
      box.position.set(0, 6.2, 0);
      sigGroup.add(box);

      // Red, Yellow, Green lens spheres
      const redMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
      const yellowMat = new THREE.MeshBasicMaterial({ color: 0x332200 }); // Dim
      const greenMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });

      const redLens = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), redMat);
      redLens.position.set(0, 6.7, 0.36);
      sigGroup.add(redLens);

      const yelLens = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), yellowMat);
      yelLens.position.set(0, 6.2, 0.36);
      sigGroup.add(yelLens);

      const grnLens = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), greenMat);
      grnLens.position.set(0, 5.7, 0.36);
      sigGroup.add(grnLens);

      this.trafficLights.push({ red: redLens, yellow: yelLens, green: grnLens, state: 'green' });

      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(pos.x, 3.5, pos.z),
          new THREE.Vector3(0.8, 7.0, 0.8)
        )
      );

      this.propsGroup.add(sigGroup);
    });
  }

  // 7. MODERN ROADSIDE PARK & SIDEWALK BENCHES
  initStreetBenches() {
    const benchPositions = [
      { pos: new THREE.Vector3(11.8, 0.28, -60), rot: Math.PI / 2 },
      { pos: new THREE.Vector3(-11.8, 0.28, 40), rot: -Math.PI / 2 },
      { pos: new THREE.Vector3(11.8, 0.28, 160), rot: Math.PI / 2 },
      { pos: new THREE.Vector3(-171.5, 0.28, -40), rot: -Math.PI / 2 },
      { pos: new THREE.Vector3(171.5, 0.28, 100), rot: Math.PI / 2 },
      { pos: new THREE.Vector3(-11.8, 0.28, 220), rot: -Math.PI / 2 }
    ];

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3d28, roughness: 0.65 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.8 });

    benchPositions.forEach(b => {
      const bench = new THREE.Group();
      bench.position.copy(b.pos);
      bench.rotation.y = b.rot;

      // Cast iron legs
      for (const lx of [-0.85, 0.85]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.55), ironMat);
        leg.position.set(lx, 0.22, 0);
        bench.add(leg);

        const backPost = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.08), ironMat);
        backPost.position.set(lx, 0.55, -0.24);
        bench.add(backPost);
      }

      // Slatted wooden seat
      for (let s = -0.2; s <= 0.2; s += 0.1) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.035, 0.075), woodMat);
        slat.position.set(0, 0.45, s);
        bench.add(slat);
      }

      // Backrest slats
      for (let br = 0.52; br <= 0.72; br += 0.1) {
        const bSlat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.075, 0.035), woodMat);
        bSlat.position.set(0, br, -0.25);
        bench.add(bSlat);
      }

      this.propsGroup.add(bench);

      // Bench collider
      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(b.pos.x, b.pos.y + 0.45, b.pos.z),
          new THREE.Vector3(1.2, 0.9, 1.2)
        )
      );
    });
  }

  // 8. DUAL-COMPARTMENT RECYCLING & WASTE BINS
  initWasteBins() {
    const binPositions = [
      new THREE.Vector3(11.2, 0.28, -75),
      new THREE.Vector3(-11.2, 0.28, -20),
      new THREE.Vector3(11.2, 0.28, 55),
      new THREE.Vector3(11.2, 0.28, 148),
      new THREE.Vector3(-191.5, 0.28, 15),
      new THREE.Vector3(171.2, 0.28, 75)
    ];

    const postMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const greenBinMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const darkBinMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });

    binPositions.forEach(pos => {
      const binGroup = new THREE.Group();
      binGroup.position.copy(pos);

      // Support Post
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.95), postMat);
      post.position.y = 0.475;
      binGroup.add(post);

      // Green Recycle Bin
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.55, 12), greenBinMat);
      b1.position.set(-0.24, 0.52, 0);
      binGroup.add(b1);

      // Charcoal Waste Bin
      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.55, 12), darkBinMat);
      b2.position.set(0.24, 0.52, 0);
      binGroup.add(b2);

      this.propsGroup.add(binGroup);

      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(pos.x, pos.y + 0.5, pos.z),
          new THREE.Vector3(0.75, 1.0, 0.5)
        )
      );
    });
  }

  // 9. ROADSIDE UTILITY & TRANSFORMER CABINETS
  initRoadsideCabinets() {
    const cabinetPositions = [
      new THREE.Vector3(-13.0, 0, -150),
      new THREE.Vector3(13.0, 0, 70),
      new THREE.Vector3(172.5, 0, -90),
      new THREE.Vector3(-192.5, 0, 110)
    ];

    const cabMat = new THREE.MeshStandardMaterial({ color: 0x2e4033, roughness: 0.7, metalness: 0.2 });
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
    const warningMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    cabinetPositions.forEach(pos => {
      const cab = new THREE.Group();
      cab.position.copy(pos);

      // Concrete plinth
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 0.95), plinthMat);
      plinth.position.y = 0.15;
      cab.add(plinth);

      // Main transformer cabinet
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.45, 0.8), cabMat);
      body.position.y = 1.025;
      body.castShadow = true;
      cab.add(body);

      // Yellow danger triangle
      const tri = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.02), warningMat);
      tri.position.set(0, 1.25, 0.41);
      cab.add(tri);

      this.propsGroup.add(cab);

      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(pos.x, 0.9, pos.z),
          new THREE.Vector3(1.6, 1.8, 1.0)
        )
      );
    });
  }

  // 10. CAST-IRON FIRE HYDRANTS
  initFireHydrants() {
    const hydrantPositions = [
      new THREE.Vector3(9.2, 0, -95),
      new THREE.Vector3(-9.2, 0, 95),
      new THREE.Vector3(9.2, 0, 205),
      new THREE.Vector3(169.5, 0, -60)
    ];

    const redMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5, metalness: 0.3 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.85 });

    hydrantPositions.forEach(pos => {
      const hyd = new THREE.Group();
      hyd.position.copy(pos);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.85, 12), redMat);
      barrel.position.y = 0.425;
      barrel.castShadow = true;
      hyd.add(barrel);

      const bonnet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), redMat);
      bonnet.position.y = 0.85;
      hyd.add(bonnet);

      // Side nozzle ports
      for (const nx of [-0.18, 0.18]) {
        const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8), chromeMat);
        nozzle.rotation.z = Math.PI / 2;
        nozzle.position.set(nx, 0.52, 0);
        hyd.add(nozzle);
      }

      this.propsGroup.add(hyd);

      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(pos.x, 0.45, pos.z),
          new THREE.Vector3(0.45, 0.9, 0.45)
        )
      );
    });
  }

  // 11. GALVANIZED PEDESTRIAN CURB GUARDRAILS
  initPedestrianGuardrails() {
    const railPositions = [
      { pos: new THREE.Vector3(9.2, 0, -70), len: 14, rot: 0 },
      { pos: new THREE.Vector3(9.2, 0, 150), len: 14, rot: 0 },
      { pos: new THREE.Vector3(-9.2, 0, 10), len: 16, rot: 0 }
    ];

    const railMat = new THREE.MeshStandardMaterial({ color: 0x008751, roughness: 0.4, metalness: 0.6 });

    railPositions.forEach(r => {
      const railGroup = new THREE.Group();
      railGroup.position.copy(r.pos);
      railGroup.rotation.y = r.rot;

      // Top rail
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, r.len), railMat);
      top.position.y = 0.95;
      railGroup.add(top);

      // Mid rail
      const mid = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, r.len), railMat);
      mid.position.y = 0.52;
      railGroup.add(mid);

      // Vertical Stanchions every 2m
      for (let z = -r.len / 2; z <= r.len / 2; z += 2.0) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.95), railMat);
        post.position.set(0, 0.475, z);
        railGroup.add(post);
      }

      this.propsGroup.add(railGroup);

      this.colliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(r.pos.x, 0.5, r.pos.z),
          new THREE.Vector3(0.3, 1.0, r.len)
        )
      );
    });
  }

  setNightMode(isNight) {
    this.streetLights.forEach(light => {
      light.intensity = isNight ? 1.6 : 0.05;
    });
  }
}

