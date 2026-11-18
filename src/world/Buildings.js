import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures.js';

// Realistic 3D Architectural Building System for Dhaka City
// Features multi-story facades, 3D window frames, balconies, railings, AC units, shopfronts, and rooftop tanks

export class Buildings {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.buildingColliders = [];
    this.buildingGroup = new THREE.Group();
    this.shopSigns = ProceduralTextures.createShopSignTextures();
    this.brickTex = ProceduralTextures.createBrickTexture();

    this.sharedMaterials = this.initPBRMaterials();
    this.initArchitecturalSectors();
    this.scene.add(this.buildingGroup);
  }

  initPBRMaterials() {
    const whiteConcretePBR = ProceduralTextures.createWhiteSuburbanConcretePBR();
    const drivewayPBR = ProceduralTextures.createDrivewayConcretePBR();

    return {
      concretePlaster: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85, metalness: 0.05 }),
      weatheredBrick: new THREE.MeshStandardMaterial({ map: this.brickTex, roughness: 0.8, metalness: 0.05 }),
      tintedGlass: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85, envMapIntensity: 1.5 }),
      windowLit: new THREE.MeshStandardMaterial({ color: 0xffe899, emissive: new THREE.Color(0xffe044), emissiveIntensity: 0.0, roughness: 0.9 }),
      frameMetal: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.7 }),
      railingMetal: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.8 }),
      waterTankMat: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }),
      acUnitMat: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6, metalness: 0.3 }),
      shopShutterMat: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.5 }),
      plinthMat: new THREE.MeshStandardMaterial({ color: 0x938f85, roughness: 0.85 }),
      roofMat: new THREE.MeshStandardMaterial({ color: 0x777b7c, roughness: 0.85 }),

      // --- USA Suburban Neighborhood HD PBR Materials ---
      whiteSidingMat: new THREE.MeshStandardMaterial({
        map: ProceduralTextures.createHouseSidingTexture('#f8fafc', '#94a3b8'),
        roughness: 0.65,
        metalness: 0.02
      }),
      creamSidingMat: new THREE.MeshStandardMaterial({
        map: ProceduralTextures.createHouseSidingTexture('#f1f5f9', '#64748b'),
        roughness: 0.65,
        metalness: 0.02
      }),
      roofShingleMat: new THREE.MeshStandardMaterial({
        map: ProceduralTextures.createHouseShinglePBR(),
        roughness: 0.82,
        metalness: 0.03
      }),
      garageDoorMat: new THREE.MeshStandardMaterial({
        map: ProceduralTextures.createGarageDoorTexture(),
        roughness: 0.55,
        metalness: 0.05
      }),
      drivewayMat: new THREE.MeshStandardMaterial({
        map: drivewayPBR.diffuse,
        roughnessMap: drivewayPBR.roughness,
        normalMap: drivewayPBR.normal,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.68,
        metalness: 0.03
      }),
      walkwayMat: new THREE.MeshStandardMaterial({
        map: whiteConcretePBR.diffuse,
        roughnessMap: whiteConcretePBR.roughness,
        normalMap: whiteConcretePBR.normal,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.62,
        metalness: 0.03
      }),
      lawnGrassMat: new THREE.MeshStandardMaterial({
        map: ProceduralTextures.createGrassPBR(),
        roughness: 0.82,
        metalness: 0.02
      }),
      mulchBedMat: new THREE.MeshStandardMaterial({ color: 0x2b1d14, roughness: 0.92 }),
      shutterBlackMat: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45 }),
      shutterNavyMat: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.45 }),
      frontDoorBurgundy: new THREE.MeshStandardMaterial({ color: 0x831843, roughness: 0.4 }),
      frontDoorOak: new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 }),
      porchTrimMat: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }),
      porchColumnMat: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 }),
      boxwoodBushMat: new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.8 }),
      flowerRed: new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.65 }),
      flowerPink: new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.65 }),
      flowerYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.65 }),
      flowerWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 }),
      mailboxMat: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.2 }),
      mailboxPostMat: new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.85 })
    };
  }

  /** Called by WeatherDayNight to toggle window and neon glow at night */
  setNightMode(isNight) {
    const strength = isNight ? 1.2 : 0.0;
    if (this.sharedMaterials.windowLit) {
      this.sharedMaterials.windowLit.emissiveIntensity = strength;
      this.sharedMaterials.windowLit.needsUpdate = true;
    }
    // Neon sign emissive
    this.buildingGroup.traverse(child => {
      if (child.isMesh && child.userData.isNeonSign) {
        child.material.emissiveIntensity = isNight ? 1.8 : 0.0;
      }
    });
  }

  initArchitecturalSectors() {
    const sectors = [
      // Motijheel Commercial Sector (Skyscrapers & Bank HQs)
      { xRange: [60, 240], zRange: [-240, -40], type: 'commercial', minF: 7, maxF: 16 },

      // Old Dhaka Heritage Sector (Dense heritage brick & balconies)
      { xRange: [-280, -40], zRange: [-380, -240], type: 'oldDhaka', minF: 3, maxF: 6 },

      // Dhanmondi / Farmgate (USA Suburban Residential Neighborhood with White Concrete Driveways & Lawns)
      { xRange: [-280, -40], zRange: [-80, 60], type: 'suburban' },

      // Tejgaon & Karwan Bazar (Media offices & commercial towers)
      { xRange: [40, 240], zRange: [20, 160], type: 'commercial', minF: 5, maxF: 11 },

      // Gulshan & Banani (Glass curtain corporate towers)
      { xRange: [40, 260], zRange: [220, 340], type: 'commercial', minF: 6, maxF: 14 },

      // Mirpur & Mohammadpur (USA Suburban Residential Neighborhood with White Concrete Driveways & Lawns)
      { xRange: [-280, -60], zRange: [220, 340], type: 'suburban' }
    ];

    sectors.forEach(sec => this.populateSector(sec));
  }

  populateSector(sec) {
    if (sec.type === 'suburban') {
      this.populateSuburbanNeighborhood(sec);
      return;
    }

    const stepX = sec.type === 'oldDhaka' ? 26 : 36;
    const stepZ = sec.type === 'oldDhaka' ? 26 : 36;

    for (let x = sec.xRange[0]; x < sec.xRange[1]; x += stepX) {
      for (let z = sec.zRange[0]; z < sec.zRange[1]; z += stepZ) {
        // Road corridor clearance
        if (Math.abs(x) < 22 || Math.abs(x + 180) < 20 || Math.abs(x - 180) < 20) continue;
        if (Math.abs(z + 100) < 20 || Math.abs(z - 80) < 20 || Math.abs(z - 240) < 20) continue;

        // Reserve open city blocks for Central Park & Commercial Parking Plaza
        if (Math.abs(x + 120) < 28 && Math.abs(z) < 28) continue; // Central Park
        if (Math.abs(x - 120) < 28 && Math.abs(z - 90) < 28) continue; // Parking Lot

        const w = (stepX - 8) + (Math.random() * 4 - 2);
        const d = (stepZ - 8) + (Math.random() * 4 - 2);
        const floors = Math.floor(sec.minF + Math.random() * (sec.maxF - sec.minF + 1));

        this.buildArchitecturalStructure(x, z, w, d, floors, sec.type);
      }
    }
  }

  buildArchitecturalStructure(x, z, width, depth, floors, type) {
    const floorH = 3.6;
    const totalH = floors * floorH;
    const mats = this.sharedMaterials;

    const building = new THREE.Group();
    building.position.set(x, 0, z);

    // 1. Core Structural Body
    const coreMat = type === 'oldDhaka' ? mats.weatheredBrick : mats.concretePlaster;
    const coreMesh = new THREE.Mesh(new THREE.BoxGeometry(width, totalH, depth), coreMat);
    coreMesh.position.y = totalH / 2;
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    building.add(coreMesh);

    // Physics Bounding Box Collider
    this.colliders.push(new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(x, totalH / 2, z),
      new THREE.Vector3(width, totalH, depth)
    ));
    this.buildingColliders.push({
      minX: x - (width + 0.42) / 2,
      maxX: x + (width + 0.42) / 2,
      minZ: z - (depth + 0.42) / 2,
      maxZ: z + (depth + 0.42) / 2,
      minY: 0,
      maxY: totalH + 1.35
    });

    // Continuous foundation / plinth and roof cap
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(width + 0.42, 0.35, depth + 0.42), mats.plinthMat);
    plinth.position.y = 0.175;
    building.add(plinth);

    const roofCap = new THREE.Mesh(new THREE.BoxGeometry(width + 0.35, 0.35, depth + 0.35), mats.roofMat);
    roofCap.position.y = totalH + 0.175;
    building.add(roofCap);

    // 2. Ground Floor Commercial Storefront Arcade
    this.addGroundStorefront(building, width, depth, mats);

    // 3. Facade Window Details & Horizontal Floor Spandrels
    for (let f = 1; f < floors; f++) {
      const floorY = f * floorH;

      // Concrete Floor Lintel / Spandrel Band
      const spandrel = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.4, depth + 0.3), mats.concretePlaster);
      spandrel.position.y = floorY;
      building.add(spandrel);

      // 3D Recessed Windows with Frames & Glass
      this.addFloorWindows(building, f, floorY, width, depth, type, mats);

      // Balconies with Railings (Residential & Old Dhaka)
      if ((type === 'residential' || type === 'oldDhaka') && f % 2 === 1) {
        this.addBalcony(building, floorY, width, depth, mats);
      }

      // Wall-mounted AC Compressor Units
      if (Math.random() > 0.4) {
        this.addACCompressor(building, floorY, width, depth, mats);
      }
    }

    // 4. Rooftop Details (Parapet, Water Tanks, Elevator Shaft)
    this.addRooftopDetails(building, totalH, width, depth, mats);

    this.buildingGroup.add(building);
  }

  addGroundStorefront(building, width, depth, mats) {
    const groundH = 3.6;

    // Recessed storefront entrance
    const frameGeo = new THREE.BoxGeometry(width * 0.85, 2.6, 0.4);
    const frame = new THREE.Mesh(frameGeo, mats.frameMetal);
    frame.position.set(0, 1.4, depth / 2 + 0.1);
    building.add(frame);

    // Glass display / Rolling security shutter
    const isShutter = Math.random() > 0.5;
    const frontMat = isShutter ? mats.shopShutterMat : mats.tintedGlass;
    const frontPanel = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.8, 2.4), frontMat);
    frontPanel.position.set(0, 1.4, depth / 2 + 0.32);
    building.add(frontPanel);

    // Authentic Bengali Commercial Signboard
    const signTex = this.shopSigns[Math.floor(Math.random() * this.shopSigns.length)];
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(0xff5500),
      emissiveIntensity: 0.0  // lit at night via setNightMode
    });
    const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(width * 0.75, 11), 1.8), signMat);
    signBoard.position.set(0, 3.2, depth / 2 + 0.35);
    signBoard.userData.isNeonSign = true;
    building.add(signBoard);
  }

  addFloorWindows(building, floorIdx, floorY, width, depth, type, mats) {
    const winW = 1.6;
    const winH = 2.0;
    const winCount = Math.floor(width / 3.2);

    for (let i = -winCount / 2; i <= winCount / 2; i++) {
      if (Math.abs(i) < 0.2) continue;
      const wx = i * 2.8;

      // 3D Metal Window Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.18), mats.frameMetal);
      frame.position.set(wx, floorY + 1.6, depth / 2 + 0.08);
      building.add(frame);

      // Glass pane (Mix of reflective tinted glass and lit night interior)
      const isLit = Math.random() > 0.65;
      const glassMat = isLit ? mats.windowLit : mats.tintedGlass;
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(winW - 0.2, winH - 0.2), glassMat);
      glass.position.set(wx, floorY + 1.6, depth / 2 + 0.18);
      building.add(glass);
    }
  }

  addBalcony(building, floorY, width, depth, mats) {
    const balcW = width * 0.55;
    const balcDepth = 1.4;

    // Concrete Balcony Slab
    const slab = new THREE.Mesh(new THREE.BoxGeometry(balcW, 0.3, balcDepth), mats.concretePlaster);
    slab.position.set(0, floorY + 0.15, depth / 2 + balcDepth / 2);
    building.add(slab);

    // Front Railing
    const railFront = new THREE.Mesh(new THREE.BoxGeometry(balcW, 1.0, 0.08), mats.railingMetal);
    railFront.position.set(0, floorY + 0.8, depth / 2 + balcDepth);
    building.add(railFront);

    // Side Railings
    const railSideGeo = new THREE.BoxGeometry(0.08, 1.0, balcDepth);
    const railL = new THREE.Mesh(railSideGeo, mats.railingMetal);
    railL.position.set(-balcW / 2, floorY + 0.8, depth / 2 + balcDepth / 2);
    building.add(railL);

    const railR = new THREE.Mesh(railSideGeo, mats.railingMetal);
    railR.position.set(balcW / 2, floorY + 0.8, depth / 2 + balcDepth / 2);
    building.add(railR);
  }

  addACCompressor(building, floorY, width, depth, mats) {
    const ac = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.5), mats.acUnitMat);
    const sideX = (width / 2 - 1.2) * (Math.random() > 0.5 ? 1 : -1);
    ac.position.set(sideX, floorY + 1.0, depth / 2 + 0.28);
    building.add(ac);
  }

  addRooftopDetails(building, totalH, width, depth, mats) {
    // Rooftop Parapet Wall (Safety barrier around roof edge)
    const parapetH = 1.1;
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(width, parapetH, depth), mats.concretePlaster);
    parapet.position.y = totalH + parapetH / 2;
    building.add(parapet);

    // Rooftop Elevator Shaft Machine Room
    const liftH = 3.2;
    const liftRoom = new THREE.Mesh(new THREE.BoxGeometry(width * 0.35, liftH, depth * 0.35), mats.concretePlaster);
    liftRoom.position.set(-width * 0.15, totalH + liftH / 2, -depth * 0.15);
    building.add(liftRoom);

    // Overhead Water Storage Tanks (Every Dhaka building has these)
    const tankGeo = new THREE.CylinderGeometry(1.4, 1.4, 2.2, 16);
    const tank1 = new THREE.Mesh(tankGeo, mats.waterTankMat);
    tank1.position.set(width * 0.2, totalH + 1.1, depth * 0.2);
    building.add(tank1);

    if (width > 22) {
      const tank2 = new THREE.Mesh(tankGeo, mats.waterTankMat);
      tank2.position.set(width * 0.25, totalH + 1.1, -depth * 0.2);
      building.add(tank2);
    }
  }

  populateSuburbanNeighborhood(sec) {
    const stepX = 30;
    const stepZ = 32;
    let variantIdx = 0;

    for (let x = sec.xRange[0] + 16; x < sec.xRange[1] - 16; x += stepX) {
      for (let z = sec.zRange[0] + 16; z < sec.zRange[1] - 16; z += stepZ) {
        // Clearance from major road corridors
        if (Math.abs(x) < 22 || Math.abs(x + 180) < 20 || Math.abs(x - 180) < 20 || Math.abs(x + 320) < 20) continue;
        if (Math.abs(z + 100) < 20 || Math.abs(z - 80) < 20 || Math.abs(z - 240) < 20 || Math.abs(z - 360) < 20) continue;

        // Reserve open park & parking blocks
        if (Math.abs(x + 120) < 32 && Math.abs(z) < 32) continue; // Central Park
        if (Math.abs(x - 120) < 32 && Math.abs(z - 90) < 32) continue; // Parking Lot

        // Determine facing orientation toward nearest road
        let facingAngle = 0;
        const dWest = Math.abs(x - (-180));
        const dEast = Math.abs(x - 0);
        const dNorth = Math.abs(z - 80);
        const dSouth = Math.abs(z - (-100));
        const minD = Math.min(dWest, dEast, dNorth, dSouth);

        if (minD === dWest) {
          facingAngle = (x > -180) ? -Math.PI / 2 : Math.PI / 2;
        } else if (minD === dEast) {
          facingAngle = (x > 0) ? -Math.PI / 2 : Math.PI / 2;
        } else if (minD === dNorth) {
          facingAngle = (z > 80) ? Math.PI : 0;
        } else {
          facingAngle = (z > -100) ? Math.PI : 0;
        }

        const lotW = stepX - 4; // ~26m
        const lotD = stepZ - 4; // ~28m

        this.buildSuburbanHouseProperty(x, z, lotW, lotD, facingAngle, variantIdx++);
      }
    }
  }

  buildSuburbanHouseProperty(x, z, lotW, lotD, facingAngle, variant) {
    const mats = this.sharedMaterials;
    const lotGroup = new THREE.Group();
    lotGroup.position.set(x, 0, z);
    lotGroup.rotation.y = facingAngle;

    const driveSide = (variant % 2 === 0) ? 1 : -1;
    const driveX = driveSide * (lotW * 0.25);
    const houseX = -driveSide * 2.2;
    const houseZ = -lotD / 4 - 2.5;

    // 1. LUSH GREEN FRONT LAWN (3D Grass Geometry & Accents)
    const lawnW = lotW - 0.4;
    const lawnD = (lotD / 2) + 3.8;
    const lawnGeo = new THREE.BoxGeometry(lawnW, 0.14, lawnD);
    const lUv = lawnGeo.attributes.uv;
    for (let i = 0; i < lUv.count; i++) {
      lUv.setXY(i, lUv.getX(i) * (lawnW / 2.5), lUv.getY(i) * (lawnD / 2.5));
    }
    lUv.needsUpdate = true;

    const lawn = new THREE.Mesh(lawnGeo, mats.lawnGrassMat);
    lawn.position.set(0, 0.07, (lotD / 4) - 0.6);
    lawn.receiveShadow = true;
    lotGroup.add(lawn);

    // 3D Organic Grass Tufts across the front lawn
    const tuftMat = mats.lawnGrassMat;
    const tuftGeo = new THREE.PlaneGeometry(0.35, 0.22);
    for (let g = 0; g < 14; g++) {
      const gx = (Math.random() - 0.5) * (lawnW - 2);
      if (Math.abs(gx - driveX) < 2.8) continue;
      const gz = (lotD / 4) - 0.6 + (Math.random() - 0.5) * (lawnD - 2);

      const tuft1 = new THREE.Mesh(tuftGeo, tuftMat);
      tuft1.position.set(gx, 0.14 + 0.11, gz);
      tuft1.rotation.y = Math.random() * Math.PI;
      lotGroup.add(tuft1);

      const tuft2 = new THREE.Mesh(tuftGeo, tuftMat);
      tuft2.position.set(gx, 0.14 + 0.11, gz);
      tuft2.rotation.y = tuft1.rotation.y + Math.PI / 2;
      lotGroup.add(tuft2);
    }

    // 2. WHITE CONCRETE HOUSE DRIVEWAY (Separate 3D Surface with Expansion Joints)
    const driveW = 4.6;
    const driveL = lawnD + 0.6;
    const driveGeo = new THREE.BoxGeometry(driveW, 0.15, driveL);
    const dUv = driveGeo.attributes.uv;
    for (let i = 0; i < dUv.count; i++) {
      dUv.setXY(i, dUv.getX(i) * (driveW / 2.5), dUv.getY(i) * (driveL / 2.5));
    }
    dUv.needsUpdate = true;

    const drive = new THREE.Mesh(driveGeo, mats.drivewayMat);
    drive.position.set(driveX, 0.075, (lotD / 4) - 0.35);
    drive.receiveShadow = true;
    lotGroup.add(drive);

    // Driveway white concrete side bevel borders
    const borderL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.17, driveL), mats.walkwayMat);
    borderL.position.set(driveX - driveW / 2 - 0.07, 0.085, (lotD / 4) - 0.35);
    lotGroup.add(borderL);

    const borderR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.17, driveL), mats.walkwayMat);
    borderR.position.set(driveX + driveW / 2 + 0.07, 0.085, (lotD / 4) - 0.35);
    lotGroup.add(borderR);

    // Dropped curb cut / driveway apron at street entrance
    const apron = new THREE.Mesh(new THREE.BoxGeometry(driveW + 0.3, 0.06, 1.2), mats.walkwayMat);
    apron.position.set(driveX, 0.03, (lotD / 4) - 0.35 + driveL / 2 + 0.6);
    lotGroup.add(apron);

    // 3. WHITE CONCRETE PEDESTRIAN WALKWAY
    const walkSpan = Math.abs(driveX) - 1.2;
    if (walkSpan > 1.0) {
      const walkway = new THREE.Mesh(new THREE.BoxGeometry(walkSpan, 0.15, 1.3), mats.walkwayMat);
      walkway.position.set(driveSide * (walkSpan / 2 + 0.6), 0.075, 1.2);
      walkway.receiveShadow = true;
      lotGroup.add(walkway);
    }
    const porchWalk = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.15, 3.2), mats.walkwayMat);
    porchWalk.position.set(0, 0.075, -0.4);
    porchWalk.receiveShadow = true;
    lotGroup.add(porchWalk);

    // 4. SUBURBAN HOUSE ARCHITECTURE
    const houseW = 10.8;
    const houseD = 8.5;
    const houseH = 6.2;
    const sidingMat = (variant % 2 === 0) ? mats.whiteSidingMat : mats.creamSidingMat;

    // Main 2-story house body
    const houseMesh = new THREE.Mesh(new THREE.BoxGeometry(houseW, houseH, houseD), sidingMat);
    houseMesh.position.set(houseX, 3.1, houseZ);
    houseMesh.castShadow = true;
    houseMesh.receiveShadow = true;
    lotGroup.add(houseMesh);

    // Foundation Brick / Stone Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(houseW + 0.2, 0.65, houseD + 0.2), mats.weatheredBrick);
    plinth.position.set(houseX, 0.325, houseZ);
    lotGroup.add(plinth);

    // Pitched Gable Shingle Roof
    const roofOverhang = 0.5;
    const roofL = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.18, houseD + roofOverhang * 2), mats.roofShingleMat);
    roofL.position.set(houseX - 2.7, houseH + 1.15, houseZ);
    roofL.rotation.z = 0.42;
    roofL.castShadow = true;
    lotGroup.add(roofL);

    const roofR = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.18, houseD + roofOverhang * 2), mats.roofShingleMat);
    roofR.position.set(houseX + 2.7, houseH + 1.15, houseZ);
    roofR.rotation.z = -0.42;
    roofR.castShadow = true;
    lotGroup.add(roofR);

    // White fascia board along eaves
    const fasciaL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, houseD + roofOverhang * 2), mats.porchTrimMat);
    fasciaL.position.set(houseX - 5.4, houseH + 0.05, houseZ);
    lotGroup.add(fasciaL);

    const fasciaR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, houseD + roofOverhang * 2), mats.porchTrimMat);
    fasciaR.position.set(houseX + 5.4, houseH + 0.05, houseZ);
    lotGroup.add(fasciaR);

    // 5. ATTACHED 2-CAR GARAGE
    const garageW = 5.2;
    const garageH = 3.3;
    const garageD = 6.4;
    const garageMesh = new THREE.Mesh(new THREE.BoxGeometry(garageW, garageH, garageD), sidingMat);
    garageMesh.position.set(driveX, 1.65, -2.8);
    garageMesh.castShadow = true;
    garageMesh.receiveShadow = true;
    lotGroup.add(garageMesh);

    // Raised-panel Carriage House Garage Door
    const garageDoor = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.5), mats.garageDoorMat);
    garageDoor.position.set(driveX, 1.35, 0.42);
    lotGroup.add(garageDoor);

    // Garage gabled roof
    const gRoofL = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, garageD + 0.8), mats.roofShingleMat);
    gRoofL.position.set(driveX - 1.4, garageH + 0.65, -2.8);
    gRoofL.rotation.z = 0.42;
    lotGroup.add(gRoofL);

    const gRoofR = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, garageD + 0.8), mats.roofShingleMat);
    gRoofR.position.set(driveX + 1.4, garageH + 0.65, -2.8);
    gRoofR.rotation.z = -0.42;
    lotGroup.add(gRoofR);

    // Sconce lights flanking garage door
    const sconceGeo = new THREE.BoxGeometry(0.15, 0.28, 0.15);
    const sconceMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    for (const sx of [-2.4, 2.4]) {
      const sconce = new THREE.Mesh(sconceGeo, sconceMat);
      sconce.position.set(driveX + sx, 2.2, 0.45);
      lotGroup.add(sconce);
    }

    // 6. FRONT COVERED PORCH / PORTICO
    const porchW = 3.8;
    const porchD = 2.0;
    const porchH = 0.35;
    const porchSlab = new THREE.Mesh(new THREE.BoxGeometry(porchW, porchH, porchD), mats.walkwayMat);
    porchSlab.position.set(0, porchH / 2, -1.0);
    porchSlab.receiveShadow = true;
    lotGroup.add(porchSlab);

    // 2 Front Steps
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.16, 0.4), mats.walkwayMat);
    step1.position.set(0, 0.08, 0.1);
    lotGroup.add(step1);

    // White Porch Columns
    const colGeo = new THREE.BoxGeometry(0.22, 2.8, 0.22);
    const colL = new THREE.Mesh(colGeo, mats.porchColumnMat);
    colL.position.set(-porchW / 2 + 0.25, 1.55, -0.2);
    colL.castShadow = true;
    lotGroup.add(colL);

    const colR = new THREE.Mesh(colGeo, mats.porchColumnMat);
    colR.position.set(porchW / 2 - 0.25, 1.55, -0.2);
    colR.castShadow = true;
    lotGroup.add(colR);

    // Porch Gabled Roof / Pediment
    const pRoof = new THREE.Mesh(new THREE.BoxGeometry(porchW + 0.4, 0.2, porchD + 0.4), mats.roofShingleMat);
    pRoof.position.set(0, 3.05, -1.0);
    pRoof.castShadow = true;
    lotGroup.add(pRoof);

    // Front Entry Door
    const doorMat = (variant % 2 === 0) ? mats.frontDoorBurgundy : mats.frontDoorOak;
    const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 0.08), doorMat);
    frontDoor.position.set(0, 1.25, -1.95);
    lotGroup.add(frontDoor);

    // 7. 3D GLAZED WINDOWS & DECORATIVE SHUTTERS
    const shutterMat = (variant % 2 === 0) ? mats.shutterBlackMat : mats.shutterNavyMat;
    const winGeo = new THREE.PlaneGeometry(1.4, 1.8);
    const shutterGeo = new THREE.BoxGeometry(0.42, 1.8, 0.06);

    const winOffsets = [
      { x: houseX - 3.2, y: 1.6 },
      { x: houseX + 3.2, y: 1.6 },
      { x: houseX - 3.2, y: 4.5 },
      { x: houseX + 3.2, y: 4.5 }
    ];

    winOffsets.forEach(wo => {
      // Glazed glass pane
      const glass = new THREE.Mesh(winGeo, mats.tintedGlass);
      glass.position.set(wo.x, wo.y, houseZ + houseD / 2 + 0.05);
      lotGroup.add(glass);

      // Shutters left and right
      const shL = new THREE.Mesh(shutterGeo, shutterMat);
      shL.position.set(wo.x - 0.95, wo.y, houseZ + houseD / 2 + 0.08);
      lotGroup.add(shL);

      const shR = new THREE.Mesh(shutterGeo, shutterMat);
      shR.position.set(wo.x + 0.95, wo.y, houseZ + houseD / 2 + 0.08);
      lotGroup.add(shR);
    });

    // 8. BRICK CHIMNEY
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8.4, 1.0), mats.weatheredBrick);
    chimney.position.set(houseX - houseW / 2 - 0.5, 4.2, houseZ);
    chimney.castShadow = true;
    lotGroup.add(chimney);

    // 9. LANDSCAPED GARDEN BEDS, BUSHES & FLOWERS
    const bedGeo = new THREE.BoxGeometry(6.2, 0.16, 1.6);
    const bed = new THREE.Mesh(bedGeo, mats.mulchBedMat);
    bed.position.set(houseX, 0.08, -1.0);
    lotGroup.add(bed);

    // Trimmed Boxwood Evergreen Shrubs
    for (let bi = 0; bi < 4; bi++) {
      const bx = houseX - 2.2 + bi * 1.5;
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.52, 8, 7), mats.boxwoodBushMat);
      bush.position.set(bx, 0.45, -1.0);
      bush.scale.set(1.15, 0.9, 1.15);
      bush.castShadow = true;
      lotGroup.add(bush);

      // Flower accents on shrubs
      const flowerMats = [mats.flowerRed, mats.flowerPink, mats.flowerYellow, mats.flowerWhite];
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 5), flowerMats[(bi + variant) % flowerMats.length]);
      fl.position.set(bx + 0.2, 0.72, -0.85);
      lotGroup.add(fl);
    }

    // 10. FRONT YARD ORNAMENTAL SHADE TREE
    const treeX = -driveSide * (lotW * 0.28);
    const treeZ = (lotD / 4) + 0.5;

    // Dark mulch ring
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.1, 16), mats.mulchBedMat);
    ring.position.set(treeX, 0.05, treeZ);
    lotGroup.add(ring);

    // Ornamental Tree Trunk & Canopy
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.85 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 3.2, 8), trunkMat);
    trunk.position.set(treeX, 1.6, treeZ);
    trunk.castShadow = true;
    lotGroup.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({
      color: (variant % 3 === 0) ? 0x2e7d32 : ((variant % 3 === 1) ? 0x388e3c : 0x1b5e20),
      roughness: 0.8
    });
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 10, 8), foliageMat);
    crown.position.set(treeX, 3.8, treeZ);
    crown.scale.set(1.2, 0.95, 1.2);
    crown.castShadow = true;
    lotGroup.add(crown);

    // 11. AMERICAN ROADSIDE MAILBOX ON WOODEN POST
    const mbX = driveX + driveSide * 2.6;
    const mbZ = (lotD / 4) - 0.35 + driveL / 2;
    const mbPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), mats.mailboxPostMat);
    mbPost.position.set(mbX, 0.55, mbZ);
    lotGroup.add(mbPost);

    const mbBox = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.55, 12), mats.mailboxMat);
    mbBox.rotation.x = Math.PI / 2;
    mbBox.position.set(mbX, 1.15, mbZ);
    lotGroup.add(mbBox);

    const mbFlag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.08), new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4 }));
    mbFlag.position.set(mbX + 0.16, 1.20, mbZ);
    lotGroup.add(mbFlag);

    // 12. PARKED SUBURBAN CAR ON DRIVEWAY (on select houses)
    if (variant % 3 !== 1) {
      const carColors = [0x1e3a8a, 0xd32f2f, 0x334155, 0xe2e8f0, 0x166534, 0xb45309];
      const car = this.createParkedSuburbanCar(carColors[variant % carColors.length]);
      car.position.set(driveX, 0, (lotD / 4) - 1.2);
      lotGroup.add(car);
    }

    this.buildingGroup.add(lotGroup);

    // 13. REGISTER 3D COLLIDERS (Rapier Physics & Camera Raycast)
    const hPos = new THREE.Vector3(houseX, 3.1, houseZ).applyAxisAngle(new THREE.Vector3(0, 1, 0), facingAngle).add(new THREE.Vector3(x, 0, z));
    this.colliders.push(new THREE.Box3().setFromCenterAndSize(
      hPos,
      new THREE.Vector3(houseW, houseH, houseD)
    ));
    this.buildingColliders.push({
      minX: hPos.x - houseW / 2,
      maxX: hPos.x + houseW / 2,
      minZ: hPos.z - houseD / 2,
      maxZ: hPos.z + houseD / 2,
      minY: 0,
      maxY: houseH + 2.0
    });

    const gPos = new THREE.Vector3(driveX, 1.65, -2.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), facingAngle).add(new THREE.Vector3(x, 0, z));
    this.colliders.push(new THREE.Box3().setFromCenterAndSize(
      gPos,
      new THREE.Vector3(garageW, garageH, garageD)
    ));
    this.buildingColliders.push({
      minX: gPos.x - garageW / 2,
      maxX: gPos.x + garageW / 2,
      minZ: gPos.z - garageD / 2,
      maxZ: gPos.z + garageD / 2,
      minY: 0,
      maxY: garageH + 1.0
    });

    const tPos = new THREE.Vector3(treeX, 1.6, treeZ).applyAxisAngle(new THREE.Vector3(0, 1, 0), facingAngle).add(new THREE.Vector3(x, 0, z));
    this.colliders.push(new THREE.Box3().setFromCenterAndSize(
      tPos,
      new THREE.Vector3(0.8, 3.2, 0.8)
    ));
  }

  createParkedSuburbanCar(color) {
    const car = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.5 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.85, transparent: true, opacity: 0.85 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x181a1b, roughness: 0.7 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111315, roughness: 0.85 });
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff3cc, emissive: 0xffe680, emissiveIntensity: 0.3 });
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, emissive: 0xb71c1c, emissiveIntensity: 0.3 });

    const bodyW = 1.9;
    const bodyH = 0.7;
    const bodyL = 4.2;

    const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyL), paint);
    body.position.y = 0.4 + bodyH / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    car.add(body);

    const cabinW = 1.7;
    const cabinH = 0.65;
    const cabinL = 2.2;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabinW, cabinH, cabinL), glass);
    cabin.position.set(0, body.position.y + bodyH / 2 + cabinH / 2, 0.1);
    cabin.castShadow = true;
    car.add(cabin);

    // Bumpers
    const fBump = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.05, 0.22, 0.14), darkMat);
    fBump.position.set(0, 0.44, -bodyL / 2 - 0.07);
    car.add(fBump);

    const rBump = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.05, 0.22, 0.14), darkMat);
    rBump.position.set(0, 0.44, bodyL / 2 + 0.07);
    car.add(rBump);

    // Wheels
    for (const wx of [-bodyW / 2 - 0.05, bodyW / 2 + 0.05]) {
      for (const wz of [-bodyL / 3, bodyL / 3]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.22, 12), tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.34, wz);
        wheel.castShadow = true;
        car.add(wheel);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.23, 10), hubMat);
        hub.rotation.z = Math.PI / 2;
        hub.position.set(wx, 0.34, wz);
        car.add(hub);
      }
    }

    // Lights
    for (const sx of [-0.65, 0.65]) {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.05), lampMat);
      hl.position.set(sx, 0.65, -bodyL / 2 - 0.08);
      car.add(hl);

      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.05), tailMat);
      tl.position.set(sx, 0.65, bodyL / 2 + 0.08);
      car.add(tl);
    }

    return car;
  }

  checkCollision(pos, radius = 0.58) {
    const px = pos.x;
    const pz = pos.z;
    const py = pos.y || 0;
    const pTop = py + 2.15;

    for (let i = 0; i < this.buildingColliders.length; i++) {
      const b = this.buildingColliders[i];
      if (pTop <= b.minY || py >= b.maxY) continue;
      const closestX = THREE.MathUtils.clamp(px, b.minX, b.maxX);
      const closestZ = THREE.MathUtils.clamp(pz, b.minZ, b.maxZ);
      const dx = px - closestX;
      const dz = pz - closestZ;
      if (dx * dx + dz * dz < radius * radius) {
        return true;
      }
    }
    return false;
  }
}
