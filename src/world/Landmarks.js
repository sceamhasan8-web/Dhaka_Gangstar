import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures.js';

export class Landmarks {
  constructor(scene) {
    this.scene = scene;
    this.landmarksList = [];
    this.initLandmarks();
  }

  initLandmarks() {
    this.createParliamentHouse(new THREE.Vector3(300, 0, 350));
    this.createHatirjheelBridge(new THREE.Vector3(0, 0, 180));
    this.createShaheedMinar(new THREE.Vector3(-220, 0, 80));
    this.createCurzonHall(new THREE.Vector3(-320, 0, -100));
    this.createShaplaChattar(new THREE.Vector3(150, 0, -200));
    this.createSadarghatLaunch(new THREE.Vector3(-150, 0, -420));
  }

  // 1. NATIONAL PARLIAMENT HOUSE (Jatiya Sangsad Bhaban)
  createParliamentHouse(pos) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // Lake surrounding the Parliament
    const lakeGeo = new THREE.PlaneGeometry(160, 160);
    const lakeMat = new THREE.MeshStandardMaterial({
      color: 0x1a4359,
      roughness: 0.1,
      metalness: 0.8
    });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.rotation.x = -Math.PI / 2;
    lake.position.y = 0.2;
    group.add(lake);

    // Monumental concrete Louis Kahn podium
    const podiumGeo = new THREE.BoxGeometry(90, 6, 90);
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0xb5b8ba,
      roughness: 0.7,
      metalness: 0.1
    });
    const podium = new THREE.Mesh(podiumGeo, concreteMat);
    podium.position.y = 3;
    group.add(podium);

    // Central Assembly Hall (Octagonal / Cylindrical tower)
    const centralGeo = new THREE.CylinderGeometry(24, 26, 38, 16);
    const central = new THREE.Mesh(centralGeo, concreteMat);
    central.position.y = 25;
    group.add(central);

    // Geometric corner blocks with iconic circular and triangular cutouts
    const cornerOffsets = [
      { x: -26, z: -26 },
      { x: 26, z: -26 },
      { x: -26, z: 26 },
      { x: 26, z: 26 }
    ];

    cornerOffsets.forEach(offset => {
      const blockGeo = new THREE.BoxGeometry(22, 28, 22);
      const block = new THREE.Mesh(blockGeo, concreteMat);
      block.position.set(offset.x, 20, offset.z);
      group.add(block);

      // Black circular portal indentation (Kahn signature)
      const circleGeo = new THREE.CylinderGeometry(5, 5, 23, 16);
      const cutoutMat = new THREE.MeshBasicMaterial({ color: 0x11161d });
      const cutout = new THREE.Mesh(circleGeo, cutoutMat);
      cutout.rotation.z = Math.PI / 2;
      cutout.position.set(offset.x, 22, offset.z);
      group.add(cutout);
    });

    // Access Bridge over water
    const bridgeGeo = new THREE.BoxGeometry(16, 2, 50);
    const bridge = new THREE.Mesh(bridgeGeo, concreteMat);
    bridge.position.set(0, 3, 60);
    group.add(bridge);

    this.scene.add(group);
    this.landmarksList.push({
      name: 'Jatiya Sangsad Bhaban',
      bengali: 'জাতীয় সংসদ ভবন',
      pos: pos,
      type: 'parliament'
    });
  }

  // 2. HATIRJHEEL CABLE-STAYED ARCH BRIDGE
  createHatirjheelBridge(pos) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // Hatirjheel Lake under the bridge
    const waterGeo = new THREE.PlaneGeometry(80, 240);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x003366,
      roughness: 0.15,
      metalness: 0.85
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.2;
    group.add(water);

    // Bridge Deck (Driveable road)
    const deckGeo = new THREE.BoxGeometry(22, 2.5, 120);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x2b2e35, roughness: 0.6 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = 5.5;
    group.add(deck);

    // Concrete approach ramps
    const rampNorthGeo = new THREE.BoxGeometry(22, 2, 40);
    const rampNorth = new THREE.Mesh(rampNorthGeo, deckMat);
    rampNorth.rotation.x = 0.12;
    rampNorth.position.set(0, 2.5, 75);
    group.add(rampNorth);

    const rampSouth = rampNorth.clone();
    rampSouth.rotation.x = -0.12;
    rampSouth.position.set(0, 2.5, -75);
    group.add(rampSouth);

    // Parabolic Tubular Steel Arch (White with night illumination)
    const archCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 5, -55),
      new THREE.Vector3(0, 42, 0),
      new THREE.Vector3(0, 5, 55)
    );
    const archGeo = new THREE.TubeGeometry(archCurve, 40, 1.4, 12, false);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.5
    });
    const archMesh = new THREE.Mesh(archGeo, archMat);
    group.add(archMesh);

    // Cable Stays (Wire stays suspending the deck)
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    for (let z = -45; z <= 45; z += 10) {
      if (Math.abs(z) < 5) continue;
      // Get point on arch
      const t = (z + 55) / 110;
      const archPoint = archCurve.getPoint(t);

      const cableGeo = new THREE.CylinderGeometry(0.12, 0.12, archPoint.y - 6);
      const cableL = new THREE.Mesh(cableGeo, cableMat);
      cableL.position.set(-9, (archPoint.y + 6) / 2, z);
      group.add(cableL);

      const cableR = new THREE.Mesh(cableGeo, cableMat);
      cableR.position.set(9, (archPoint.y + 6) / 2, z);
      group.add(cableR);
    }

    // Bridge Railings
    const railMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.3 });
    const railLGeo = new THREE.BoxGeometry(0.6, 1.2, 120);
    const railL = new THREE.Mesh(railLGeo, railMat);
    railL.position.set(-10.5, 7, 0);
    group.add(railL);

    const railR = railL.clone();
    railR.position.set(10.5, 7, 0);
    group.add(railR);

    this.scene.add(group);
    this.landmarksList.push({
      name: 'Hatirjheel Bridges',
      bengali: 'হাতিরঝিল আর্চ ব্রিজ',
      pos: pos,
      type: 'hatirjheel'
    });
  }

  // 3. CENTRAL SHAHEED MINAR
  createShaheedMinar(pos) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // Marble plaza podium with steps
    const baseGeo = new THREE.BoxGeometry(40, 2, 35);
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, marbleMat);
    base.position.y = 1;
    group.add(base);

    // Iconic Radiant Red Sun disc behind the pillars
    const sunGeo = new THREE.CylinderGeometry(9, 9, 1.2, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xf42a41,
      roughness: 0.4,
      emissive: 0xf42a41,
      emissiveIntensity: 0.4
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.rotation.x = Math.PI / 2;
    sun.position.set(0, 15, -4);
    group.add(sun);

    // Central vertical pillar structure with bent top canopy
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.4 });
    const colGeo = new THREE.BoxGeometry(1.6, 26, 1.6);

    const col1 = new THREE.Mesh(colGeo, pillarMat);
    col1.position.set(-4, 14, 0);
    group.add(col1);

    const col2 = new THREE.Mesh(colGeo, pillarMat);
    col2.position.set(4, 14, 0);
    group.add(col2);

    // Angled forward top canopy
    const topBarGeo = new THREE.BoxGeometry(10, 1.6, 8);
    const topBar = new THREE.Mesh(topBarGeo, pillarMat);
    topBar.rotation.x = -0.35;
    topBar.position.set(0, 27, 2.5);
    group.add(topBar);

    // Flanking shorter side pillars
    const sideOffsets = [-10, 10];
    sideOffsets.forEach(x => {
      const sideColGeo = new THREE.BoxGeometry(1.2, 16, 1.2);
      const sideCol = new THREE.Mesh(sideColGeo, pillarMat);
      sideCol.position.set(x, 9, 0);
      group.add(sideCol);

      const sideTop = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 4), pillarMat);
      sideTop.rotation.x = -0.3;
      sideTop.position.set(x, 17, 1);
      group.add(sideTop);
    });

    this.scene.add(group);
    this.landmarksList.push({
      name: 'Shaheed Minar',
      bengali: 'কেন্দ্রীয় শহীদ মিনার',
      pos: pos,
      type: 'shaheed_minar'
    });
  }

  // 4. CURZON HALL (Dhaka University)
  createCurzonHall(pos) {
    const group = new THREE.Group();
    group.position.copy(pos);

    const brickTex = ProceduralTextures.createBrickTexture();
    const brickMat = new THREE.MeshStandardMaterial({
      map: brickTex,
      roughness: 0.75,
      metalness: 0.1
    });

    // Main 2-story pavilion building
    const mainGeo = new THREE.BoxGeometry(60, 20, 36);
    const mainBuilding = new THREE.Mesh(mainGeo, brickMat);
    mainBuilding.position.y = 10;
    group.add(mainBuilding);

    // Central Mughal Arch Entrance
    const archPortalGeo = new THREE.BoxGeometry(18, 24, 6);
    const archPortal = new THREE.Mesh(archPortalGeo, brickMat);
    archPortal.position.set(0, 12, 18);
    group.add(archPortal);

    // Indo-Saracenic Domes & Chattris (White marble domes)
    const domeMat = new THREE.MeshStandardMaterial({ color: 0xf5f0eb, roughness: 0.3 });
    const centralDomeGeo = new THREE.SphereGeometry(6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const centralDome = new THREE.Mesh(centralDomeGeo, domeMat);
    centralDome.position.set(0, 24, 18);
    group.add(centralDome);

    // Corner Chattris (pavilions on roof)
    const corners = [
      { x: -28, z: -16 },
      { x: 28, z: -16 },
      { x: -28, z: 16 },
      { x: 28, z: 16 }
    ];

    corners.forEach(c => {
      const turretGeo = new THREE.CylinderGeometry(2, 2.4, 26, 8);
      const turret = new THREE.Mesh(turretGeo, brickMat);
      turret.position.set(c.x, 13, c.z);
      group.add(turret);

      const smallDomeGeo = new THREE.SphereGeometry(2.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const smallDome = new THREE.Mesh(smallDomeGeo, domeMat);
      smallDome.position.set(c.x, 26, c.z);
      group.add(smallDome);
    });

    this.scene.add(group);
    this.landmarksList.push({
      name: 'Curzon Hall',
      bengali: 'কার্জন হল (ঢাবি)',
      pos: pos,
      type: 'curzon_hall'
    });
  }

  // 5. SHAPLA CHATTAR (Motijheel Central Roundabout)
  createShaplaChattar(pos) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // Circular fountain pool
    const poolGeo = new THREE.CylinderGeometry(18, 20, 2, 32);
    const poolMat = new THREE.MeshStandardMaterial({ color: 0x005577, roughness: 0.2 });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.y = 1;
    group.add(pool);

    // Water surface
    const waterGeo = new THREE.CircleGeometry(17, 32);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x00a8cc, roughness: 0.1, metalness: 0.7 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 2.1;
    group.add(water);

    // Shapla (White Water Lily) central stem & petals sculpture
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    // Central bud
    const budGeo = new THREE.ConeGeometry(3.5, 14, 16);
    const bud = new THREE.Mesh(budGeo, petalMat);
    bud.position.y = 9;
    group.add(bud);

    // Surrounding blooming curved petals
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i;
      const petalGeo = new THREE.BoxGeometry(2.5, 12, 0.6);
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.rotation.x = 0.45;
      petal.rotation.y = angle;
      petal.position.set(Math.cos(angle) * 4, 7, Math.sin(angle) * 4);
      group.add(petal);
    }

    this.scene.add(group);
    this.landmarksList.push({
      name: 'Shapla Chattar',
      bengali: 'শাপলা চত্বর (মতিঝিল)',
      pos: pos,
      type: 'shapla_chattar'
    });
  }

  // 6. BURIGANGA RIVERFRONT & SADARGHAT LAUNCH
  createSadarghatLaunch(pos) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // River Water
    const riverGeo = new THREE.PlaneGeometry(350, 90);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x183040,
      roughness: 0.2,
      metalness: 0.8
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, 0.2, -20);
    group.add(river);

    // Wooden / Concrete Ghat Jetty Dock
    const dockGeo = new THREE.BoxGeometry(100, 2, 24);
    const dockMat = new THREE.MeshStandardMaterial({ color: 0x3d352e, roughness: 0.8 });
    const dock = new THREE.Mesh(dockGeo, dockMat);
    dock.position.set(0, 1.2, 10);
    group.add(dock);

    // Multi-Deck Sadarghat Passenger Launch Ship ("এম. ভি. ময়ূরপঙ্খী")
    const launchShip = new THREE.Group();
    launchShip.position.set(0, 0, -22);

    // Hull (White with blue bottom stripe)
    const hullGeo = new THREE.BoxGeometry(70, 7, 18);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xf0f3f6, roughness: 0.4 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 3.5;
    launchShip.add(hull);

    // Second Deck
    const deck2Geo = new THREE.BoxGeometry(60, 5, 16);
    const deck2 = new THREE.Mesh(deck2Geo, hullMat);
    deck2.position.set(-2, 9, 0);
    launchShip.add(deck2);

    // Bridge / Wheelhouse & VIP cabins
    const deck3Geo = new THREE.BoxGeometry(35, 4, 14);
    const deck3 = new THREE.Mesh(deck3Geo, hullMat);
    deck3.position.set(-6, 13.5, 0);
    launchShip.add(deck3);

    // Smokestack & Bangladesh Flag pole
    const funnelGeo = new THREE.CylinderGeometry(1.4, 1.4, 6, 12);
    const funnelMat = new THREE.MeshStandardMaterial({ color: 0xd62828 });
    const funnel = new THREE.Mesh(funnelGeo, funnelMat);
    funnel.position.set(5, 16, 0);
    launchShip.add(funnel);

    // Bangladesh Flag on stern
    const flagGeo = new THREE.PlaneGeometry(5, 3);
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 128;
    flagCanvas.height = 76;
    const fctx = flagCanvas.getContext('2d');
    fctx.fillStyle = '#006a4e'; // Bottle green
    fctx.fillRect(0, 0, 128, 76);
    fctx.fillStyle = '#f42a41'; // Red circle
    fctx.beginPath();
    fctx.arc(58, 38, 24, 0, Math.PI * 2);
    fctx.fill();
    const flagTex = new THREE.CanvasTexture(flagCanvas);
    const flagMat = new THREE.MeshBasicMaterial({ map: flagTex, side: THREE.DoubleSide });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(-34, 15, 0);
    launchShip.add(flag);

    group.add(launchShip);

    this.scene.add(group);
    this.landmarksList.push({
      name: 'Sadarghat Launch Terminal',
      bengali: 'সদরঘাট লঞ্চ টার্মিনাল ও বুড়িগঙ্গা',
      pos: pos,
      type: 'sadarghat'
    });
  }
}

