import * as THREE from 'three';
import { RoadNetwork } from './RoadNetwork.js';
import { Landmarks } from './Landmarks.js';
import { Buildings } from './Buildings.js';
import { StreetProps } from './StreetProps.js';
import { MetroRail } from './MetroRail.js';
import { WeatherDayNight } from './WeatherDayNight.js';
import { DistrictManager } from './DistrictManager.js';
import { SkyEnvironment } from './SkyEnvironment.js';
import { ProceduralTextures } from './ProceduralTextures.js';

export class DhakaWorld {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.roadsideColliders = [];

    // 1. Realistic 360° Equirectangular Skybox Environment
    const isMobile = renderer ? renderer.isMobile : false;
    this.sky = new SkyEnvironment(this.scene, this.renderer, isMobile);

    // 2. Weather & Day-Night System (connected with 360° Sky)
    this.districtManager = new DistrictManager();
    this.weather = new WeatherDayNight(this.scene, this.renderer, this.sky);

    this.initGroundTerrain();

    this.roadNetwork = new RoadNetwork(this.scene);
    this.landmarks = new Landmarks(this.scene);
    this.buildings = new Buildings(this.scene);
    this.streetProps = new StreetProps(this.scene);
    this.metroRail = new MetroRail(this.scene);

    // Integrated Urban Features: Central Park, Parking Plaza, Canals & Organic Street Trees
    this.initCentralPark();
    this.initParkingLot();
    this.initBoundaryCanal();
    this.initStreetTrees();

    // 3. Centralized Roadside Colliders Collection (Physics & Raycast collision)
    this.collectAllRoadsideColliders();

    // Connect buildings reference to weather for night-mode window glow
    this.weather.buildings = this.buildings;
  }

  initGroundTerrain() {
    // Vast Rich Green Lawn Terrain Ground Plane (1200m x 1200m)
    const grassTex = ProceduralTextures.createGrassPBR();
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const uvAttr = groundGeo.attributes.uv;
    for (let i = 0; i < uvAttr.count; i++) {
      uvAttr.setXY(i, uvAttr.getX(i) * 150, uvAttr.getY(i) * 150); // Repeating every 8m
    }
    uvAttr.needsUpdate = true;

    const groundMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.84,
      metalness: 0.02
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  initCentralPark() {
    const park = new THREE.Group();
    park.name = 'DhakaCentralPark';
    const posX = -120;
    const posZ = 0;
    const size = 52;

    const grassTex = ProceduralTextures.createGrassPBR();
    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.82,
      metalness: 0.02
    });
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xd0c6a8, roughness: 0.8 });
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xc8b995, roughness: 0.8 });
    const fountainStone = new THREE.MeshStandardMaterial({ color: 0x8babae, roughness: 0.65 });
    const fountainWater = new THREE.MeshStandardMaterial({ color: 0x3e9db0, roughness: 0.15, metalness: 0.6 });

    // Grass lawn
    const lawnGeo = new THREE.PlaneGeometry(size, size);
    const lUv = lawnGeo.attributes.uv;
    for (let i = 0; i < lUv.count; i++) {
      lUv.setXY(i, lUv.getX(i) * 6, lUv.getY(i) * 6);
    }
    lUv.needsUpdate = true;

    const lawn = new THREE.Mesh(lawnGeo, grassMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(posX, 0.05, posZ);
    lawn.receiveShadow = true;
    park.add(lawn);

    // Perimeter curb borders
    const half = size / 2;
    const borderGeo = new THREE.BoxGeometry(size, 0.22, 0.6);
    const borderGeoSide = new THREE.BoxGeometry(0.6, 0.22, size);

    const bN = new THREE.Mesh(borderGeo, borderMat);
    bN.position.set(posX, 0.11, posZ - half);
    park.add(bN);

    const bS = new THREE.Mesh(borderGeo, borderMat);
    bS.position.set(posX, 0.11, posZ + half);
    park.add(bS);

    const bW = new THREE.Mesh(borderGeoSide, borderMat);
    bW.position.set(posX - half, 0.11, posZ);
    park.add(bW);

    const bE = new THREE.Mesh(borderGeoSide, borderMat);
    bE.position.set(posX + half, 0.11, posZ);
    park.add(bE);

    // Crisscrossing footpaths
    const path1 = new THREE.Mesh(new THREE.PlaneGeometry(3.6, size - 2), pathMat);
    path1.rotation.x = -Math.PI / 2;
    path1.position.set(posX, 0.065, posZ);
    path1.receiveShadow = true;
    park.add(path1);

    const path2 = new THREE.Mesh(new THREE.PlaneGeometry(size - 2, 3.6), pathMat);
    path2.rotation.x = -Math.PI / 2;
    path2.position.set(posX, 0.07, posZ);
    path2.receiveShadow = true;
    park.add(path2);

    // 3D Circular Fountain
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.5, 0.6, 32), fountainStone);
    basin.position.set(posX, 0.3, posZ);
    basin.castShadow = true;
    basin.receiveShadow = true;
    park.add(basin);
    this.fountainMesh = basin;

    const water = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.15, 32), fountainWater);
    water.position.set(posX, 0.58, posZ);
    park.add(water);

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 1.2, 16), fountainStone);
    pedestal.position.set(posX, 0.9, posZ);
    pedestal.castShadow = true;
    park.add(pedestal);

    // Fountain basin collider
    this.roadsideColliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(posX, 0.45, posZ),
        new THREE.Vector3(9.2, 1.2, 9.2)
      )
    );

    // Colorful Flowerbeds around fountain quadrants
    const flowerRed = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.7 });
    const flowerYellow = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7 });
    const flowerPink = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.7 });

    for (const qx of [-1, 1]) {
      for (const qz of [-1, 1]) {
        const bedCenter = new THREE.Vector3(posX + qx * 9.5, 0.1, posZ + qz * 9.5);
        const bedBorder = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.2, 6.5), borderMat);
        bedBorder.position.copy(bedCenter);
        park.add(bedBorder);

        const bedEarth = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 6.0), grassMat);
        bedEarth.rotation.x = -Math.PI / 2;
        bedEarth.position.set(bedCenter.x, 0.21, bedCenter.z);
        park.add(bedEarth);

        // Flower clusters inside bed
        const fMats = [flowerRed, flowerYellow, flowerPink];
        for (let fi = 0; fi < 8; fi++) {
          const fl = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 5), fMats[(fi + qx + qz) % 3]);
          const fx = bedCenter.x - 2.0 + (fi % 3) * 2.0;
          const fz = bedCenter.z - 2.0 + Math.floor(fi / 3) * 2.0;
          fl.position.set(fx, 0.38, fz);
          fl.scale.set(1.1, 0.85, 1.1);
          park.add(fl);
        }
      }
    }

    // Trees around park edges
    for (let x = posX - half + 5; x <= posX + half - 5; x += 11) {
      this.makeTree(park, x, posZ - half + 4, 0.95, 0);
      this.makeTree(park, x, posZ + half - 4, 0.95, 1);
    }
    for (let z = posZ - half + 14; z <= posZ + half - 14; z += 11) {
      this.makeTree(park, posX - half + 4, z, 0.95, 2);
      this.makeTree(park, posX + half - 4, z, 0.95, 0);
    }

    this.scene.add(park);
  }

  initParkingLot() {
    const lot = new THREE.Group();
    lot.name = 'DhakaCommercialParking';
    const posX = 120;
    const posZ = 90;
    const width = 45;
    const depth = 40;

    const lotMat = new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.8 });
    const whiteLine = new THREE.MeshStandardMaterial({ color: 0xe8e5d9, roughness: 0.4 });
    const wheelStopMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });

    // Parking asphalt surface
    const surface = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), lotMat);
    surface.rotation.x = -Math.PI / 2;
    surface.position.set(posX, 0.05, posZ);
    surface.receiveShadow = true;
    lot.add(surface);

    // Parking stall line markings
    for (let i = 0; i < 9; i++) {
      const lineX = posX - width / 2 + 5 + i * 4.2;
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.015, 22), whiteLine);
      stripe.position.set(lineX, 0.06, posZ);
      lot.add(stripe);
    }

    // Outer boundary stripes
    const frontStripe = new THREE.Mesh(new THREE.BoxGeometry(width - 4, 0.015, 0.16), whiteLine);
    frontStripe.position.set(posX, 0.06, posZ - 11);
    lot.add(frontStripe);

    const backStripe = new THREE.Mesh(new THREE.BoxGeometry(width - 4, 0.015, 0.16), whiteLine);
    backStripe.position.set(posX, 0.06, posZ + 11);
    lot.add(backStripe);

    // Parked colorful cars & Wheel stop blocks
    const carColors = [0xd84d3d, 0xe4e1d6, 0x3277a2, 0xd4ad37, 0x33383c, 0x4a8a55];
    carColors.forEach((color, i) => {
      const carX = posX - width / 2 + 7.1 + i * 4.2;
      const carZ = posZ - (i % 2 === 0 ? 3.5 : 2.0);
      const car = this.createParkedCar(color);
      car.position.set(carX, 0, carZ);
      lot.add(car);

      // Wheel stop concrete curb block
      const ws = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.14, 0.18), wheelStopMat);
      ws.position.set(carX, 0.07, posZ + 8.5);
      lot.add(ws);

      // Parked car collider
      this.roadsideColliders.push(
        new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(carX, 0.8, carZ),
          new THREE.Vector3(2.1, 1.6, 4.2)
        )
      );
    });

    this.scene.add(lot);
  }

  createParkedCar(color) {
    const car = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.3 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x385c6b, roughness: 0.22, metalness: 0.25 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x17191a, roughness: 0.8 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x252a2d, roughness: 0.7 });
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x9ba2a3, roughness: 0.45, metalness: 0.7 });
    const headlampMat = new THREE.MeshStandardMaterial({ color: 0xffe4a5, emissive: 0xffd97d, emissiveIntensity: 0.2 });
    const taillampMat = new THREE.MeshStandardMaterial({ color: 0xc83b35, emissive: 0x991b1b, emissiveIntensity: 0.2 });

    // Chassis body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.62, 3.85), paint);
    body.position.y = 0.61;
    body.castShadow = true;
    body.receiveShadow = true;
    car.add(body);

    // Cabin glass
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.62, 1.95), glass);
    cabin.position.set(0, 1.20, 0.10);
    cabin.castShadow = true;
    car.add(cabin);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 1.55), paint);
    roof.position.set(0, 1.55, 0.12);
    roof.castShadow = true;
    car.add(roof);

    // Hood & Trunk
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.16, 0.72), paint);
    hood.position.set(0, 0.99, -1.53);
    hood.castShadow = true;
    car.add(hood);

    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.16, 0.55), paint);
    trunk.position.set(0, 0.99, 1.55);
    trunk.castShadow = true;
    car.add(trunk);

    // Bumpers
    const fBump = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.20, 0.12), dark);
    fBump.position.set(0, 0.44, -1.98);
    car.add(fBump);

    const rBump = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.20, 0.12), dark);
    rBump.position.set(0, 0.44, 1.98);
    car.add(rBump);

    // Lights
    for (const sx of [-0.70, 0.70]) {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.045), headlampMat);
      hl.position.set(sx, 0.69, -1.985);
      car.add(hl);

      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.045), taillampMat);
      tl.position.set(sx, 0.69, 1.985);
      car.add(tl);
    }

    // 4 Wheels
    for (const wx of [-0.94, 0.94]) {
      for (const wz of [-1.22, 1.22]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.20, 14), tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.36, wz);
        wheel.castShadow = true;
        car.add(wheel);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.205, 12), hubMat);
        hub.rotation.z = Math.PI / 2;
        hub.position.set(wx, 0.36, wz);
        car.add(hub);
      }
    }

    return car;
  }

  initBoundaryCanal() {
    const canalMat = new THREE.MeshStandardMaterial({
      color: 0x275d73,
      roughness: 0.20,
      metalness: 0.35
    });

    // South Buriganga canal
    const canalS = new THREE.Mesh(new THREE.PlaneGeometry(600, 35), canalMat);
    canalS.rotation.x = -Math.PI / 2;
    canalS.position.set(0, 0.02, -450);
    canalS.receiveShadow = true;
    this.scene.add(canalS);

    // East Hatirjheel extension canal
    const canalE = new THREE.Mesh(new THREE.PlaneGeometry(30, 500), canalMat);
    canalE.rotation.x = -Math.PI / 2;
    canalE.position.set(380, 0.02, 50);
    canalE.receiveShadow = true;
    this.scene.add(canalE);
  }

  makeTree(parent, x, z, s = 1.0, typeIndex = 0) {
    const t = new THREE.Group();
    const barkTex = ProceduralTextures.createBarkTexture();
    const trunkMat = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.85,
      metalness: 0.05
    });

    const leafMats = [
      new THREE.MeshStandardMaterial({ color: 0x245d31, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x337841, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x489452, roughness: 0.8 })
    ];
    const redFlowerMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.65 });
    const orangeFlowerMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.65 });

    const species = Math.abs(typeIndex) % 3;

    if (species === 0) {
      // 1. Classic Dhaka Banyan / Rain Tree (Multi-branched spreading canopy)
      const baseTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32 * s, 0.48 * s, 1.2 * s, 10), trunkMat);
      baseTrunk.position.y = 0.6 * s;
      baseTrunk.castShadow = true;
      t.add(baseTrunk);

      const midTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24 * s, 0.32 * s, 1.8 * s, 8), trunkMat);
      midTrunk.position.y = 1.9 * s;
      midTrunk.castShadow = true;
      t.add(midTrunk);

      // 3 Main Branches
      for (let b = 0; b < 3; b++) {
        const ba = (b / 3) * Math.PI * 2;
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 1.4 * s, 6), trunkMat);
        branch.rotation.z = 0.55;
        branch.rotation.y = ba;
        branch.position.set(Math.cos(ba) * 0.45 * s, 2.7 * s, Math.sin(ba) * 0.45 * s);
        t.add(branch);

        const lm = leafMats[b % leafMats.length];
        const subCanopy = new THREE.Mesh(new THREE.SphereGeometry(1.25 * s, 10, 8), lm);
        subCanopy.position.set(Math.cos(ba) * 1.1 * s, 3.4 * s, Math.sin(ba) * 1.1 * s);
        subCanopy.scale.set(1.15, 0.9, 1.1);
        subCanopy.castShadow = true;
        subCanopy.receiveShadow = true;
        t.add(subCanopy);
      }

      // Central dense main dome
      const mainCrown = new THREE.Mesh(new THREE.SphereGeometry(1.6 * s, 12, 9), leafMats[1]);
      mainCrown.position.y = 3.6 * s;
      mainCrown.scale.set(1.2, 0.95, 1.2);
      mainCrown.castShadow = true;
      mainCrown.receiveShadow = true;
      t.add(mainCrown);

    } else if (species === 1) {
      // 2. Krishnachura (Royal Poinciana - Dhaka's iconic red flowering tree)
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.26 * s, 0.38 * s, 2.5 * s, 8), trunkMat);
      trunk.position.y = 1.25 * s;
      trunk.castShadow = true;
      t.add(trunk);

      // Spreading umbrella green canopy
      const umbrella = new THREE.Mesh(new THREE.CylinderGeometry(2.4 * s, 1.2 * s, 1.2 * s, 12), leafMats[0]);
      umbrella.position.y = 3.1 * s;
      umbrella.castShadow = true;
      umbrella.receiveShadow = true;
      t.add(umbrella);

      // Clusters of fiery scarlet flowers
      for (let f = 0; f < 8; f++) {
        const fa = (f / 8) * Math.PI * 2;
        const fr = (0.7 + (f % 3) * 0.5) * s;
        const fl = new THREE.Mesh(new THREE.SphereGeometry(0.38 * s, 7, 6), f % 2 === 0 ? redFlowerMat : orangeFlowerMat);
        fl.position.set(Math.cos(fa) * fr, 3.45 * s + (f % 2) * 0.2 * s, Math.sin(fa) * fr);
        t.add(fl);
      }

    } else {
      // 3. Royal Palm / Areca Palm
      const trunkH = 4.2 * s;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.28 * s, trunkH, 10), trunkMat);
      trunk.position.y = trunkH / 2;
      trunk.castShadow = true;
      t.add(trunk);

      // Crown of Arching Palm Fronds
      for (let fr = 0; fr < 8; fr++) {
        const fra = (fr / 8) * Math.PI * 2;
        const frond = new THREE.Mesh(new THREE.BoxGeometry(0.4 * s, 0.08 * s, 1.9 * s), leafMats[2]);
        frond.rotation.y = fra;
        frond.rotation.x = -0.45;
        frond.position.set(Math.cos(fra) * 0.7 * s, trunkH + 0.3 * s, Math.sin(fra) * 0.7 * s);
        frond.castShadow = true;
        t.add(frond);
      }
    }

    // Cast-iron protective root grate on sidewalk
    const grateGeo = new THREE.BoxGeometry(1.6 * s, 0.035, 1.6 * s);
    const grateMat = new THREE.MeshStandardMaterial({ color: 0x1f2429, roughness: 0.65, metalness: 0.7 });
    const grate = new THREE.Mesh(grateGeo, grateMat);
    grate.position.y = 0.02;
    t.add(grate);

    t.position.set(x, 0, z);
    parent.add(t);

    // Register tree trunk collider
    this.roadsideColliders.push(
      new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(x, 1.5 * s, z),
        new THREE.Vector3(0.9 * s, 3.0 * s, 0.9 * s)
      )
    );

    return t;
  }

  initStreetTrees() {
    const treeGroup = new THREE.Group();
    treeGroup.name = 'DhakaStreetTrees';

    // Sidewalk tree rows along major corridors
    const treeLines = [
      { x: -14, zMin: -240, zMax: 320, step: 26 },
      { x: 14, zMin: -240, zMax: 320, step: 26 },
      { x: -194, zMin: -240, zMax: 320, step: 30 },
      { x: -166, zMin: -240, zMax: 320, step: 30 },
      { x: 166, zMin: -240, zMax: 320, step: 30 },
      { x: 194, zMin: -240, zMax: 320, step: 30 }
    ];

    let tIndex = 0;
    treeLines.forEach(line => {
      for (let z = line.zMin; z <= line.zMax; z += line.step) {
        // Skip intersections
        if (Math.abs(z + 100) < 18 || Math.abs(z - 80) < 18 || Math.abs(z - 240) < 18) continue;
        const scale = 0.75 + (Math.sin(z) * 0.15);
        this.makeTree(treeGroup, line.x, z, scale, tIndex++);
      }
    });

    this.scene.add(treeGroup);
  }

  collectAllRoadsideColliders() {
    if (this.roadNetwork && this.roadNetwork.colliders) {
      this.roadsideColliders.push(...this.roadNetwork.colliders);
    }
    if (this.streetProps && this.streetProps.colliders) {
      this.roadsideColliders.push(...this.streetProps.colliders);
    }
    console.log(`[DhakaWorld] Collected ${this.roadsideColliders.length} roadside environment colliders.`);
  }

  update(delta, playerPos) {
    this.weather.update(delta, playerPos);
    this.metroRail.update(delta);
  }

  checkCollision(pos, radius = 0.8) {
    if (this.buildings && this.buildings.checkCollision(pos, radius)) return true;

    // Roadside obstacles collision (trees, poles, stalls, parked cars, benches)
    for (let i = 0; i < this.roadsideColliders.length; i++) {
      const box = this.roadsideColliders[i];
      const closestX = Math.max(box.min.x, Math.min(pos.x, box.max.x));
      const closestZ = Math.max(box.min.z, Math.min(pos.z, box.max.z));
      const dx = pos.x - closestX;
      const dz = pos.z - closestZ;
      if (dx * dx + dz * dz < radius * radius) {
        if (pos.y >= box.min.y - 0.2 && pos.y <= box.max.y + 0.2) {
          return true;
        }
      }
    }
    return false;
  }
}
