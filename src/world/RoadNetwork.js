import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures.js';

// Realistic 3D Road, Footpath, Markings & Urban Infrastructure Network

export class RoadNetwork {
  constructor(scene) {
    this.scene = scene;
    this.roads = [];
    this.nodes = [];
    this.roadMeshes = [];
    this.sidewalkMeshes = [];
    this.curbMeshes = [];
    this.colliders = [];

    this.initRoadLayout();
    this.buildRealisticRoadGeometry();
  }

  initRoadLayout() {
    this.roads = [
      // Central Spine (Shahbagh - Farmgate - Mohakhali)
      { id: 'central_spine', start: new THREE.Vector3(0, 0, -260), end: new THREE.Vector3(0, 0, 360), width: 16, lanes: 4, name: 'Kazi Nazrul Islam Ave' },

      // West Artery (Dhanmondi - Mirpur Road)
      { id: 'mirpur_rd', start: new THREE.Vector3(-180, 0, -260), end: new THREE.Vector3(-180, 0, 360), width: 14, lanes: 4, name: 'Mirpur Road' },

      // East Artery (Tejgaon - Gulshan / Banani - Airport Rd)
      { id: 'airport_rd', start: new THREE.Vector3(180, 0, -260), end: new THREE.Vector3(180, 0, 360), width: 16, lanes: 4, name: 'Airport & Gulshan Ave' },

      // Far West Artery (Mohammadpur bypass)
      { id: 'mohammadpur_bypass', start: new THREE.Vector3(-320, 0, -260), end: new THREE.Vector3(-320, 0, 200), width: 12, lanes: 2, name: 'Mohammadpur Ring' },

      // East Extension (Badda / Rampura bypass)
      { id: 'badda_rd', start: new THREE.Vector3(300, 0, -100), end: new THREE.Vector3(300, 0, 360), width: 12, lanes: 2, name: 'Pragati Sarani / Badda' },

      // East-West Connectors
      { id: 'shahbagh_cross', start: new THREE.Vector3(-320, 0, -100), end: new THREE.Vector3(300, 0, -100), width: 14, lanes: 4, name: 'Shahbagh - Motijheel Cross' },
      { id: 'farmgate_cross', start: new THREE.Vector3(-320, 0, 80), end: new THREE.Vector3(300, 0, 80), width: 14, lanes: 4, name: 'Farmgate - Tejgaon Cross' },
      { id: 'mohakhali_cross', start: new THREE.Vector3(-180, 0, 240), end: new THREE.Vector3(300, 0, 240), width: 14, lanes: 4, name: 'Mohakhali - Gulshan Link' },
      { id: 'north_cross', start: new THREE.Vector3(-180, 0, 360), end: new THREE.Vector3(300, 0, 360), width: 14, lanes: 4, name: 'Uttara & Airport Connector' },

      // Old Dhaka Winding Labyrinth Streets (South Zone)
      { id: 'old_dhaka_main', start: new THREE.Vector3(-150, 0, -260), end: new THREE.Vector3(-150, 0, -420), width: 10, lanes: 2, name: 'Nazimuddin Road' },
      { id: 'sadarghat_lane', start: new THREE.Vector3(-260, 0, -360), end: new THREE.Vector3(0, 0, -360), width: 10, lanes: 2, name: 'Chowk Bazaar - Sadarghat' },
      { id: 'riverfront_rd', start: new THREE.Vector3(-280, 0, -420), end: new THREE.Vector3(100, 0, -420), width: 12, lanes: 2, name: 'Buriganga Riverfront Road' },

      // Motijheel Commercial Circle Links
      { id: 'motijheel_ring', start: new THREE.Vector3(150, 0, -260), end: new THREE.Vector3(150, 0, -100), width: 14, lanes: 4, name: 'Dilkusha Commercial St' },
      { id: 'gulistan_link', start: new THREE.Vector3(0, 0, -200), end: new THREE.Vector3(150, 0, -200), width: 14, lanes: 4, name: 'Gulistan Flyover Ramp' }
    ];

    this.buildNodes();
  }

  buildNodes() {
    const roadIntersections = [
      new THREE.Vector3(0, 0, -200),
      new THREE.Vector3(0, 0, -100),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 80),
      new THREE.Vector3(0, 0, 180),
      new THREE.Vector3(0, 0, 240),
      new THREE.Vector3(0, 0, 360),

      new THREE.Vector3(-180, 0, -200),
      new THREE.Vector3(-180, 0, -100),
      new THREE.Vector3(-180, 0, 0),
      new THREE.Vector3(-180, 0, 80),
      new THREE.Vector3(-180, 0, 240),
      new THREE.Vector3(-180, 0, 360),

      new THREE.Vector3(180, 0, -200),
      new THREE.Vector3(180, 0, -100),
      new THREE.Vector3(180, 0, 80),
      new THREE.Vector3(180, 0, 180),
      new THREE.Vector3(180, 0, 240),
      new THREE.Vector3(180, 0, 360),

      new THREE.Vector3(-150, 0, -300),
      new THREE.Vector3(-150, 0, -360),
      new THREE.Vector3(-150, 0, -420),
      new THREE.Vector3(0, 0, -360),
      new THREE.Vector3(-260, 0, -360),

      new THREE.Vector3(150, 0, -200),
      new THREE.Vector3(150, 0, -100)
    ];

    this.nodes = roadIntersections.map((pt, id) => ({
      id,
      pos: pt,
      connected: []
    }));

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const d = this.nodes[i].pos.distanceTo(this.nodes[j].pos);
        if (d < 170) {
          this.nodes[i].connected.push(this.nodes[j].id);
          this.nodes[j].connected.push(this.nodes[i].id);
        }
      }
    }
  }

  buildRealisticRoadGeometry() {
    const { diffuse: asphaltDiff, roughness: asphaltRough, normal: asphaltNorm } = ProceduralTextures.createAsphaltPBR();
    const { diffuse: paverDiff, roughness: paverRough, normal: paverNorm } = ProceduralTextures.createPaverTilePBR();
    const tactileTex = ProceduralTextures.createTactilePaverPBR();
    const curbTex = ProceduralTextures.createCurbTexture();
    const drainTex = ProceduralTextures.createDrainGrateTexture();
    const grassTex = ProceduralTextures.createGrassPBR();

    // High-Quality Asphalt PBR Material (UNTOUCHED - STRICT ROAD GRAPHICS PRESERVATION)
    const asphaltMat = new THREE.MeshStandardMaterial({
      map: asphaltDiff,
      roughnessMap: asphaltRough,
      normalMap: asphaltNorm,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughness: 0.65,
      metalness: 0.16,
      envMapIntensity: 1.4
    });

    // High-Definition USA Suburban White Concrete Sidewalk PBR Material
    const { diffuse: whiteConcreteDiff, roughness: whiteConcreteRough, normal: whiteConcreteNorm } = ProceduralTextures.createWhiteSuburbanConcretePBR();
    const whiteCurbTex = ProceduralTextures.createWhiteSuburbanCurbPBR();

    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: whiteConcreteDiff,
      roughnessMap: whiteConcreteRough,
      normalMap: whiteConcreteNorm,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughness: 0.62,
      metalness: 0.03,
      envMapIntensity: 1.3
    });

    // High-Visibility Yellow Tactile Hazard Paving Material
    const tactileMat = new THREE.MeshStandardMaterial({
      map: tactileTex,
      roughness: 0.52,
      metalness: 0.1,
      envMapIntensity: 1.1
    });

    // Roadside Lush Grass Planter Material
    const roadsideGrassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.84,
      metalness: 0.02
    });

    // USA Suburban Clean White Poured Concrete Curb Material
    const curbMat = new THREE.MeshStandardMaterial({
      map: whiteCurbTex,
      roughness: 0.60,
      metalness: 0.04,
      envMapIntensity: 1.2
    });

    // Planter curb stone (Matching Clean White Concrete Curb)
    const planterCurbMat = curbMat;

    // Tropical Flowering Shrubs & Bougainvillea Materials
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x2e6b36, roughness: 0.8 });
    const flowerPink = new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.7 });
    const flowerRed = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.7 });
    const flowerYellow = new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.7 });

    // Stainless steel safety bollard material
    const bollardMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.25, metalness: 0.85 });
    const bollardStripeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });

    // Parking Bay Materials
    const parkingLineMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4, metalness: 0.05 });
    const wheelStopMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });

    // Road Markings Materials with PBR retroreflective sheen
    const yellowLineMat = new THREE.MeshStandardMaterial({
      color: 0xffb700,
      roughness: 0.38,
      metalness: 0.08,
      emissive: 0x221800
    });
    const whiteLineMat = new THREE.MeshStandardMaterial({
      color: 0xf0f3f6,
      roughness: 0.35,
      metalness: 0.08,
      emissive: 0x181a1c
    });
    const drainMat = new THREE.MeshStandardMaterial({ map: drainTex, roughness: 0.45, metalness: 0.85 });

    // Retroreflective Cat-Eye Stud Material (Highway Pavement Markers)
    const studMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      emissive: 0xff9900,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.85
    });
    const studGeo = new THREE.BoxGeometry(0.18, 0.035, 0.2);

    this.roads.forEach(road => {
      const dir = new THREE.Vector3().subVectors(road.end, road.start);
      const len = dir.length();
      const center = new THREE.Vector3().addVectors(road.start, road.end).multiplyScalar(0.5);
      const angle = Math.atan2(dir.x, dir.z);
      const perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

      // 1. Asphalt Roadbed Mesh with High-Density UV Tiling (~4m x 4m per repeat)
      const roadGeo = new THREE.PlaneGeometry(road.width, len);
      const uvAttr = roadGeo.attributes.uv;
      const uRepeat = road.width / 4.0;
      const vRepeat = len / 4.0;
      for (let i = 0; i < uvAttr.count; i++) {
        uvAttr.setXY(i, uvAttr.getX(i) * uRepeat, uvAttr.getY(i) * vRepeat);
      }
      uvAttr.needsUpdate = true;

      const roadMesh = new THREE.Mesh(roadGeo, asphaltMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.rotation.z = -angle;
      roadMesh.position.set(center.x, 0.04, center.z);
      roadMesh.receiveShadow = true;
      this.scene.add(roadMesh);
      this.roadMeshes.push(roadMesh);

      // 2. Physical 3D Road Markings (Double Yellow Divider & White Borders)
      const markingHeight = 0.055; // Sits flush on asphalt, no z-fighting
      const yellowDivGeo = new THREE.BoxGeometry(0.22, 0.012, len);

      // Left yellow divider line
      const yDiv1 = new THREE.Mesh(yellowDivGeo, yellowLineMat);
      yDiv1.position.copy(center).add(perp.clone().multiplyScalar(0.18));
      yDiv1.position.y = markingHeight;
      yDiv1.rotation.y = angle;
      this.scene.add(yDiv1);

      // Right yellow divider line
      const yDiv2 = new THREE.Mesh(yellowDivGeo, yellowLineMat);
      yDiv2.position.copy(center).add(perp.clone().multiplyScalar(-0.18));
      yDiv2.position.y = markingHeight;
      yDiv2.rotation.y = angle;
      this.scene.add(yDiv2);

      // Cat-Eye retroreflective studs along center double yellow line
      const studInterval = 12; // Every 12m
      for (let s = -len / 2 + 10; s < len / 2 - 10; s += studInterval) {
        const stud = new THREE.Mesh(studGeo, studMat);
        const studPos = center.clone().add(dir.clone().normalize().multiplyScalar(s));
        stud.position.set(studPos.x, markingHeight + 0.012, studPos.z);
        stud.rotation.y = angle;
        this.scene.add(stud);
      }

      // White outer lane boundary strips
      const whiteBorderGeo = new THREE.BoxGeometry(0.3, 0.012, len);
      const wbLeft = new THREE.Mesh(whiteBorderGeo, whiteLineMat);
      wbLeft.position.copy(center).add(perp.clone().multiplyScalar(road.width / 2 - 0.4));
      wbLeft.position.y = markingHeight;
      wbLeft.rotation.y = angle;
      this.scene.add(wbLeft);

      const wbRight = new THREE.Mesh(whiteBorderGeo, whiteLineMat);
      wbRight.position.copy(center).add(perp.clone().multiplyScalar(-road.width / 2 + 0.4));
      wbRight.position.y = markingHeight;
      wbRight.rotation.y = angle;
      this.scene.add(wbRight);

      // Dashed lane divider lines for 4-lane roads
      if (road.lanes === 4) {
        const laneOffset = road.width / 4;
        const dashLen = 3.0;
        const gapLen = 4.5;
        const cycleLen = dashLen + gapLen;
        const dashGeo = new THREE.BoxGeometry(0.2, 0.012, dashLen);

        for (let d = -len / 2 + 14; d < len / 2 - 14; d += cycleLen) {
          // Right lane divider
          const dashR = new THREE.Mesh(dashGeo, whiteLineMat);
          const posR = center.clone()
            .add(dir.clone().normalize().multiplyScalar(d))
            .add(perp.clone().multiplyScalar(laneOffset));
          dashR.position.set(posR.x, markingHeight, posR.z);
          dashR.rotation.y = angle;
          this.scene.add(dashR);

          // Left lane divider
          const dashL = new THREE.Mesh(dashGeo, whiteLineMat);
          const posL = center.clone()
            .add(dir.clone().normalize().multiplyScalar(d))
            .add(perp.clone().multiplyScalar(-laneOffset));
          dashL.position.set(posL.x, markingHeight, posL.z);
          dashL.rotation.y = angle;
          this.scene.add(dashL);
        }
      }

      // 3. Raised White Concrete Sidewalks (Left and Right - Large 1.5m Slabs)
      const swWidth = 3.6;
      const swHeight = 0.28;
      const swGeo = new THREE.BoxGeometry(swWidth, swHeight, len);
      const swUvAttr = swGeo.attributes.uv;
      const swURepeat = swWidth / 1.5;
      const swVRepeat = len / 1.5;
      for (let i = 0; i < swUvAttr.count; i++) {
        swUvAttr.setXY(i, swUvAttr.getX(i) * swURepeat, swUvAttr.getY(i) * swVRepeat);
      }
      swUvAttr.needsUpdate = true;

      const swOffset = (road.width / 2) + (swWidth / 2);

      // Left Sidewalk
      const swLeft = new THREE.Mesh(swGeo, sidewalkMat);
      const leftPos = center.clone().add(perp.clone().multiplyScalar(swOffset));
      swLeft.position.set(leftPos.x, swHeight / 2, leftPos.z);
      swLeft.rotation.y = angle;
      swLeft.receiveShadow = true;
      this.scene.add(swLeft);
      this.sidewalkMeshes.push(swLeft);

      // Right Sidewalk
      const swRight = new THREE.Mesh(swGeo, sidewalkMat);
      const rightPos = center.clone().add(perp.clone().multiplyScalar(-swOffset));
      swRight.position.set(rightPos.x, swHeight / 2, rightPos.z);
      swRight.rotation.y = angle;
      swRight.receiveShadow = true;
      this.scene.add(swRight);
      this.sidewalkMeshes.push(swRight);

      // 4. Clean White Concrete Curbs with Expansion Joints
      const curbGeo = new THREE.BoxGeometry(0.35, swHeight + 0.04, len);
      const curbUvAttr = curbGeo.attributes.uv;
      const curbVRepeat = len / 3.0; // Expansion joint every 3m
      for (let i = 0; i < curbUvAttr.count; i++) {
        curbUvAttr.setXY(i, curbUvAttr.getX(i), curbUvAttr.getY(i) * curbVRepeat);
      }
      curbUvAttr.needsUpdate = true;

      const curbL = new THREE.Mesh(curbGeo, curbMat);
      const curbLPos = center.clone().add(perp.clone().multiplyScalar(road.width / 2));
      curbL.position.set(curbLPos.x, (swHeight + 0.04) / 2, curbLPos.z);
      curbL.rotation.y = angle;
      this.scene.add(curbL);
      this.curbMeshes.push(curbL);

      const curbR = new THREE.Mesh(curbGeo, curbMat);
      const curbRPos = center.clone().add(perp.clone().multiplyScalar(-road.width / 2));
      curbR.position.set(curbRPos.x, (swHeight + 0.04) / 2, curbRPos.z);
      curbR.rotation.y = angle;
      this.scene.add(curbR);
      this.curbMeshes.push(curbR);

      // 5. Roadside Linear Landscaped Planter Beds (Grass & Flowering Tropical Shrubs)
      const planterW = 1.8;
      const planterH = 0.22;
      const planterLen = Math.max(10, len - 36);
      const planterOffset = swOffset + (swWidth / 2) + (planterW / 2);

      const planterGeo = new THREE.BoxGeometry(planterW, planterH, planterLen);
      const plUv = planterGeo.attributes.uv;
      for (let i = 0; i < plUv.count; i++) {
        plUv.setXY(i, plUv.getX(i) * (planterW / 1.5), plUv.getY(i) * (planterLen / 1.5));
      }
      plUv.needsUpdate = true;

      for (const side of [1, -1]) {
        const plMesh = new THREE.Mesh(planterGeo, roadsideGrassMat);
        const plPos = center.clone().add(perp.clone().multiplyScalar(side * planterOffset));
        plMesh.position.set(plPos.x, planterH / 2, plPos.z);
        plMesh.rotation.y = angle;
        plMesh.receiveShadow = true;
        this.scene.add(plMesh);

        // Raised Curb Edge for Garden Planter
        const plCurbGeo = new THREE.BoxGeometry(0.18, planterH + 0.06, planterLen);
        const plCurb = new THREE.Mesh(plCurbGeo, planterCurbMat);
        const plCurbPos = center.clone().add(perp.clone().multiplyScalar(side * (planterOffset - planterW / 2)));
        plCurb.position.set(plCurbPos.x, (planterH + 0.06) / 2, plCurbPos.z);
        plCurb.rotation.y = angle;
        this.scene.add(plCurb);

        // Flowering Tropical Shrubs (Bougainvillea & Allamanda bushes)
        const bushSpacing = 16;
        for (let b = -planterLen / 2 + 8; b < planterLen / 2 - 8; b += bushSpacing) {
          const bushGroup = new THREE.Group();
          const bushDome = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 7), bushMat);
          bushDome.position.y = 0.65;
          bushDome.scale.set(1.2, 0.85, 1.1);
          bushDome.castShadow = true;
          bushGroup.add(bushDome);

          // Flower clusters on bush
          const flowerMats = [flowerPink, flowerRed, flowerYellow];
          const fMat = flowerMats[Math.floor(Math.abs(b + side * 5)) % flowerMats.length];
          for (let f = 0; f < 6; f++) {
            const fl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), fMat);
            const fa = (f / 6) * Math.PI * 2;
            fl.position.set(Math.cos(fa) * 0.55, 0.72 + (f % 2) * 0.18, Math.sin(fa) * 0.55);
            bushGroup.add(fl);
          }

          const bPos = plPos.clone().add(dir.clone().normalize().multiplyScalar(b));
          bushGroup.position.set(bPos.x, planterH, bPos.z);
          bushGroup.rotation.y = Math.random() * Math.PI;
          this.scene.add(bushGroup);
        }
      }

      // 6. Gutter Storm Drainage Grates (placed every 40m along road shoulders)
      const drainSpacing = 40;
      for (let s = -len / 2 + 15; s < len / 2 - 10; s += drainSpacing) {
        const drainGeo = new THREE.PlaneGeometry(1.2, 0.8);

        const dMeshL = new THREE.Mesh(drainGeo, drainMat);
        dMeshL.rotation.x = -Math.PI / 2;
        dMeshL.rotation.z = -angle;
        const dPosL = center.clone()
          .add(dir.clone().normalize().multiplyScalar(s))
          .add(perp.clone().multiplyScalar(road.width / 2 - 0.7));
        dMeshL.position.set(dPosL.x, 0.048, dPosL.z);
        this.scene.add(dMeshL);

        const dMeshR = new THREE.Mesh(drainGeo, drainMat);
        dMeshR.rotation.x = -Math.PI / 2;
        dMeshR.rotation.z = -angle;
        const dPosR = center.clone()
          .add(dir.clone().normalize().multiplyScalar(s))
          .add(perp.clone().multiplyScalar(-road.width / 2 + 0.7));
        dMeshR.position.set(dPosR.x, 0.048, dPosR.z);
        this.scene.add(dMeshR);
      }

      // 7. 3D Zebra Pedestrian Crossings with Tactile Warning Strips & Safety Bollards
      for (const endSign of [1, -1]) {
        const crossOffset = endSign * (len / 2 - 14);
        this.buildZebraCrossing(center, dir, perp, road.width, crossOffset, angle, whiteLineMat);

        // Tactile Hazard Paving Pads (Yellow blister dots) on both sidewalks
        const tactilePadGeo = new THREE.BoxGeometry(2.4, 0.012, 1.2);
        for (const swSide of [1, -1]) {
          const tMesh = new THREE.Mesh(tactilePadGeo, tactileMat);
          const tPos = center.clone()
            .add(dir.clone().normalize().multiplyScalar(crossOffset))
            .add(perp.clone().multiplyScalar(swSide * (road.width / 2 + 0.8)));
          tMesh.position.set(tPos.x, swHeight + 0.006, tPos.z);
          tMesh.rotation.y = angle;
          this.scene.add(tMesh);

          // Stainless Steel Safety Bollards on sidewalk curb corners
          for (let bo = -0.9; bo <= 0.9; bo += 0.9) {
            const bollard = new THREE.Group();
            const bPost = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.88, 12), bollardMat);
            bPost.position.y = 0.44;
            bPost.castShadow = true;
            bollard.add(bPost);

            const bBand = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.12, 12), bollardStripeMat);
            bBand.position.y = 0.72;
            bollard.add(bBand);

            const boPos = center.clone()
              .add(dir.clone().normalize().multiplyScalar(crossOffset + (endSign * 1.5)))
              .add(perp.clone().multiplyScalar(swSide * (road.width / 2 + 0.45) + (bo * 0.8)));
            bollard.position.set(boPos.x, swHeight, boPos.z);
            this.scene.add(bollard);

            // Register bollard collider
            this.colliders.push(
              new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3(boPos.x, swHeight + 0.44, boPos.z),
                new THREE.Vector3(0.35, 0.9, 0.35)
              )
            );
          }
        }
      }

      // 8. Roadside Parking Bays (on 4-lane wide avenues)
      if (road.lanes === 4 && len > 140) {
        this.buildRoadsideParkingBay(center, dir, perp, road.width, len, angle, parkingLineMat, wheelStopMat);
      }
    });

    // Elevated Flyover Expressway Ramps
    this.createElevatedFlyover();
  }

  buildZebraCrossing(center, dir, perp, roadW, offsetDist, angle, mat) {
    const crossPos = center.clone().add(dir.clone().normalize().multiplyScalar(offsetDist));
    const stripeW = 0.6;
    const stripeL = 4.2;
    const count = Math.floor(roadW / 1.4);

    for (let i = -count / 2; i <= count / 2; i++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(stripeW, 0.015, stripeL), mat);
      const sPos = crossPos.clone().add(perp.clone().multiplyScalar(i * 1.3));
      stripe.position.set(sPos.x, 0.052, sPos.z);
      stripe.rotation.y = angle;
      this.scene.add(stripe);
    }

    // Transversal Stop Line Bar before pedestrian crossing
    const stopDir = offsetDist > 0 ? -1 : 1;
    const stopPos = crossPos.clone().add(dir.clone().normalize().multiplyScalar(stopDir * 3.2));
    const stopLineGeo = new THREE.BoxGeometry(roadW - 1.2, 0.015, 0.45);
    const stopLine = new THREE.Mesh(stopLineGeo, mat);
    stopLine.position.set(stopPos.x, 0.053, stopPos.z);
    stopLine.rotation.y = angle;
    this.scene.add(stopLine);
  }

  buildRoadsideParkingBay(center, dir, perp, roadW, len, angle, lineMat, wheelStopMat) {
    const bayLen = 32;
    const bayWidth = 2.6;
    const normDir = dir.clone().normalize();
    const bayCenter = center.clone().add(perp.clone().multiplyScalar(roadW / 2 + bayWidth / 2));

    // Ground tarmac marking for parking bay
    const bayGeo = new THREE.PlaneGeometry(bayWidth, bayLen);
    const bayMesh = new THREE.Mesh(bayGeo, new THREE.MeshStandardMaterial({ color: 0x181a1f, roughness: 0.8 }));
    bayMesh.rotation.x = -Math.PI / 2;
    bayMesh.rotation.z = -angle;
    bayMesh.position.set(bayCenter.x, 0.045, bayCenter.z);
    this.scene.add(bayMesh);

    // Stalls and Cars
    const stallCount = 5;
    const stallSpacing = bayLen / stallCount;
    const carColors = [0xd84d3d, 0x1e3a8a, 0xe2e8f0, 0x334155, 0xd97706];

    for (let i = 0; i < stallCount; i++) {
      const stallOffset = -bayLen / 2 + (i + 0.5) * stallSpacing;
      const stallPos = bayCenter.clone().add(normDir.clone().multiplyScalar(stallOffset));

      // White parking stall divider line
      const lineMesh = new THREE.Mesh(new THREE.BoxGeometry(bayWidth - 0.2, 0.015, 0.12), lineMat);
      const linePos = bayCenter.clone().add(normDir.clone().multiplyScalar(-bayLen / 2 + i * stallSpacing));
      lineMesh.position.set(linePos.x, 0.05, linePos.z);
      lineMesh.rotation.y = angle;
      this.scene.add(lineMesh);

      // Concrete wheel stop curb block at head of stall
      const wheelStop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 1.8), wheelStopMat);
      const wsPos = stallPos.clone().add(perp.clone().multiplyScalar(bayWidth / 2 - 0.2));
      wheelStop.position.set(wsPos.x, 0.07, wsPos.z);
      wheelStop.rotation.y = angle;
      this.scene.add(wheelStop);

      // 3D Parked Car in selected stalls (skip 1 stall for open space realism)
      if (i % 2 === 0 || i === 1) {
        const car = this.createRoadsideParkedCar(carColors[i % carColors.length], i === 0 ? 'microbus' : 'sedan');
        car.position.set(stallPos.x, 0, stallPos.z);
        car.rotation.y = angle;
        this.scene.add(car);

        // Register collider
        this.colliders.push(
          new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(stallPos.x, 0.8, stallPos.z),
            new THREE.Vector3(2.0, 1.6, 4.4)
          )
        );
      }
    }
  }

  createRoadsideParkedCar(color, type = 'sedan') {
    const car = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.5 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.85, transparent: true, opacity: 0.85 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x181a1b, roughness: 0.7 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111315, roughness: 0.85 });
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff3cc, emissive: 0xffe680, emissiveIntensity: 0.3 });
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, emissive: 0xb71c1c, emissiveIntensity: 0.3 });

    const isVan = type === 'microbus';
    const bodyW = 1.9;
    const bodyH = isVan ? 0.95 : 0.65;
    const bodyL = isVan ? 4.4 : 4.0;

    const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyL), paint);
    body.position.y = 0.4 + bodyH / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    car.add(body);

    const cabinW = 1.7;
    const cabinH = isVan ? 0.85 : 0.62;
    const cabinL = isVan ? 3.2 : 2.1;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabinW, cabinH, cabinL), glass);
    cabin.position.set(0, body.position.y + bodyH / 2 + cabinH / 2, isVan ? 0.2 : 0.1);
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

    // Headlamps & Taillights
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

  createElevatedFlyover() {
    const flyoverGroup = new THREE.Group();
    const length = 280;
    const width = 14;
    const height = 12;

    const flyoverMat = new THREE.MeshStandardMaterial({ color: 0x333842, roughness: 0.7 });
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.8 });

    // Elevated Deck
    const deckGeo = new THREE.BoxGeometry(width, 1.8, length);
    const deck = new THREE.Mesh(deckGeo, flyoverMat);
    deck.position.set(0, height, 100);
    flyoverGroup.add(deck);

    // Guard rails with green glow
    const railMat = new THREE.MeshStandardMaterial({ color: 0x008751, roughness: 0.4 });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, length), railMat);
    railL.position.set(-width / 2 + 0.3, height + 1.2, 100);
    flyoverGroup.add(railL);

    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, length), railMat);
    railR.position.set(width / 2 - 0.3, height + 1.2, 100);
    flyoverGroup.add(railR);

    // Support Pillars every 35m
    for (let z = 100 - length / 2 + 20; z < 100 + length / 2 - 10; z += 35) {
      const colGeo = new THREE.CylinderGeometry(1.6, 1.8, height, 16);
      const col = new THREE.Mesh(colGeo, pillarMat);
      col.position.set(0, height / 2, z);
      flyoverGroup.add(col);
    }

    // Ascent Ramp (South)
    const rampLen = 80;
    const rampGeo = new THREE.BoxGeometry(width, 1.6, rampLen);
    const rampS = new THREE.Mesh(rampGeo, flyoverMat);
    rampS.rotation.x = -Math.atan2(height, rampLen);
    rampS.position.set(0, height / 2, 100 - length / 2 - rampLen / 2 + 5);
    flyoverGroup.add(rampS);

    // Descent Ramp (North)
    const rampN = new THREE.Mesh(rampGeo, flyoverMat);
    rampN.rotation.x = Math.atan2(height, rampLen);
    rampN.position.set(0, height / 2, 100 + length / 2 + rampLen / 2 - 5);
    flyoverGroup.add(rampN);

    this.scene.add(flyoverGroup);
  }

  getNearestNode(pos) {
    let nearest = this.nodes[0];
    let minDist = Infinity;
    this.nodes.forEach(node => {
      const d = pos.distanceTo(node.pos);
      if (d < minDist) {
        minDist = d;
        nearest = node;
      }
    });
    return nearest;
  }

  findPath(startPos, targetPos) {
    const startNode = this.getNearestNode(startPos);
    const targetNode = this.getNearestNode(targetPos);

    if (startNode.id === targetNode.id) {
      return [startPos, targetPos];
    }

    const queue = [[startNode.id]];
    const visited = new Set([startNode.id]);

    while (queue.length > 0) {
      const path = queue.shift();
      const currentId = path[path.length - 1];

      if (currentId === targetNode.id) {
        return [startPos, ...path.map(id => this.nodes[id].pos), targetPos];
      }

      const currNode = this.nodes[currentId];
      for (const neighborId of currNode.connected) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([...path, neighborId]);
        }
      }
    }

    return [startPos, startNode.pos, targetNode.pos, targetPos];
  }
}
