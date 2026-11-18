import * as THREE from 'three';
import { ProceduralTextures } from '../world/ProceduralTextures.js';

export class VehicleModels {
  // 1. GREEN CNG AUTO-RICKSHAW
  static createCNG(customColor = 0x008751) {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: customColor, roughness: 0.4, metalness: 0.3 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffbe00, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.4, roughness: 0.1 });

    // Lower Cabin Chassis
    const chassisGeo = new THREE.BoxGeometry(1.5, 0.7, 2.6);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.65;
    group.add(chassis);

    // Front Nose / Cowling (tapered front)
    const noseGeo = new THREE.ConeGeometry(0.8, 0.9, 4);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.rotation.y = Math.PI / 4;
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.65, 1.4);
    group.add(nose);

    // Yellow Roof Canopy
    const roofGeo = new THREE.BoxGeometry(1.45, 0.15, 2.3);
    const roof = new THREE.Mesh(roofGeo, yellowMat);
    roof.position.set(0, 1.75, -0.1);
    group.add(roof);

    // Characteristic Iron Safety Mesh / Grille (Sides of Dhaka CNG)
    const grilleMat = new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: true });
    const grilleL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), grilleMat);
    grilleL.position.set(-0.76, 1.25, -0.2);
    grilleL.rotation.y = Math.PI / 2;
    group.add(grilleL);

    const grilleR = grilleL.clone();
    grilleR.position.x = 0.76;
    grilleR.rotation.y = -Math.PI / 2;
    group.add(grilleR);

    // Windshield
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.7), glassMat);
    windshield.position.set(0, 1.35, 0.95);
    windshield.rotation.x = -0.2;
    group.add(windshield);

    // Spare Tire mounted on back
    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.18, 16);
    const spare = new THREE.Mesh(tireGeo, blackMat);
    spare.rotation.x = Math.PI / 2;
    spare.position.set(0, 0.95, -1.35);
    group.add(spare);

    // Wheels (3 wheels: 1 front, 2 rear)
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16);

    const wFront = new THREE.Mesh(wheelGeo, blackMat);
    wFront.rotation.z = Math.PI / 2;
    wFront.position.set(0, 0.28, 1.15);
    group.add(wFront);
    wheels.push(wFront);

    const wRearL = new THREE.Mesh(wheelGeo, blackMat);
    wRearL.rotation.z = Math.PI / 2;
    wRearL.position.set(-0.7, 0.28, -0.85);
    group.add(wRearL);
    wheels.push(wRearL);

    const wRearR = new THREE.Mesh(wheelGeo, blackMat);
    wRearR.rotation.z = Math.PI / 2;
    wRearR.position.set(0.7, 0.28, -0.85);
    group.add(wRearR);
    wheels.push(wRearR);

    // Headlight
    const hlGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xfff9d6 });
    const headlight = new THREE.Mesh(hlGeo, hlMat);
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 0.65, 1.75);
    group.add(headlight);

    // Spotlights for driving at night
    const spot = new THREE.SpotLight(0xfff5cc, 2.5, 45, Math.PI / 6, 0.4);
    spot.position.set(0, 0.65, 1.8);
    spot.target.position.set(0, 0.2, 25);
    group.add(spot);
    group.add(spot.target);

    group.userData = { wheels, headlightSpot: spot, type: 'cng' };
    return group;
  }

  // 2. TRADITIONAL DHAKA PEDAL RICKSHAW
  static createRickshaw(customColor = 0xffbe00) {
    const group = new THREE.Group();

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x008751, roughness: 0.8 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.5 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 });

    // Rickshaw Frame (Triangular tubular steel chassis)
    const frameGeo = new THREE.BoxGeometry(0.1, 0.1, 1.8);
    const frame = new THREE.Mesh(frameGeo, metalMat);
    frame.position.set(0, 0.4, 0);
    group.add(frame);

    // High Passenger Bench Seat
    const seatGeo = new THREE.BoxGeometry(1.1, 0.35, 0.55);
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 0.75, -0.4);
    group.add(seat);

    // Decorative Rickshaw Folding Hood Canopy
    const hoodGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.15, 16, 1, false, 0, Math.PI);
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.rotation.z = Math.PI / 2;
    hood.position.set(0, 1.35, -0.45);
    group.add(hood);

    // Hand-Painted Rickshaw Artwork Plate on Back
    const artTex = ProceduralTextures.createRickshawArtTexture();
    const artMat = new THREE.MeshBasicMaterial({ map: artTex, side: THREE.DoubleSide });
    const artPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.65), artMat);
    artPlate.position.set(0, 0.8, -0.72);
    group.add(artPlate);

    // Driver Seat & Handlebars
    const dSeat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.3), metalMat);
    dSeat.position.set(0, 0.85, 0.4);
    group.add(dSeat);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 0.06), chromeMat);
    handle.position.set(0, 1.1, 0.9);
    group.add(handle);

    // Brass Bell on handlebar
    const bellMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), bellMat);
    bell.position.set(0.25, 1.15, 0.9);
    group.add(bell);

    // Bicycle Spoke Wheels (1 Front, 2 Rear)
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 16);

    const wFront = new THREE.Mesh(wheelGeo, metalMat);
    wFront.rotation.z = Math.PI / 2;
    wFront.position.set(0, 0.42, 1.1);
    group.add(wFront);
    wheels.push(wFront);

    const wRearL = new THREE.Mesh(wheelGeo, metalMat);
    wRearL.rotation.z = Math.PI / 2;
    wRearL.position.set(-0.6, 0.42, -0.45);
    group.add(wRearL);
    wheels.push(wRearL);

    const wRearR = new THREE.Mesh(wheelGeo, metalMat);
    wRearR.rotation.z = Math.PI / 2;
    wRearR.position.set(0.6, 0.42, -0.45);
    group.add(wRearR);
    wheels.push(wRearR);

    // Rickshaw lantern
    const spot = new THREE.SpotLight(0xfff5cc, 1.5, 30, Math.PI / 5, 0.5);
    spot.position.set(0, 0.6, 1.2);
    spot.target.position.set(0, 0.2, 15);
    group.add(spot);
    group.add(spot.target);

    group.userData = { wheels, headlightSpot: spot, type: 'rickshaw' };
    return group;
  }

  // 3. COLORFUL DHAKA LOCAL BUS ("MURIR TIN")
  static createBus(customColor = 0x008751) {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: customColor, roughness: 0.5 });
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffbe00, roughness: 0.5 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.1, metalness: 0.8 });

    // Main Bus Body
    const busGeo = new THREE.BoxGeometry(2.7, 2.6, 8.5);
    const bus = new THREE.Mesh(busGeo, bodyMat);
    bus.position.y = 1.8;
    group.add(bus);

    // Lower Stripe
    const stripeGeo = new THREE.BoxGeometry(2.72, 0.5, 8.5);
    const stripe = new THREE.Mesh(stripeGeo, yellowMat);
    stripe.position.y = 1.1;
    group.add(stripe);

    // Route Signboard Board on front roof ("মিরপুর ১০ - ফার্মগেট - মতিঝিল")
    const routeCanvas = document.createElement('canvas');
    routeCanvas.width = 512;
    routeCanvas.height = 96;
    const rctx = routeCanvas.getContext('2d');
    rctx.fillStyle = '#f42a41';
    rctx.fillRect(0, 0, 512, 96);
    rctx.fillStyle = '#ffffff';
    rctx.font = 'bold 38px "Tiro Bangla", sans-serif';
    rctx.textAlign = 'center';
    rctx.fillText('মিরপুর ১০ • মতিঝিল • সদরঘাট', 256, 45);
    rctx.fillStyle = '#ffff00';
    rctx.font = 'bold 18px "Rajdhani", sans-serif';
    rctx.fillText('DHAKA METRO BUS SERVICE', 256, 78);

    const routeTex = new THREE.CanvasTexture(routeCanvas);
    const routeMat = new THREE.MeshBasicMaterial({ map: routeTex });
    const routeBoard = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.5), routeMat);
    routeBoard.position.set(0, 3.1, 4.26);
    group.add(routeBoard);

    // Bus Windows
    const winGeo = new THREE.BoxGeometry(2.74, 0.9, 7.2);
    const win = new THREE.Mesh(winGeo, glassMat);
    win.position.y = 2.2;
    group.add(win);

    // Roof Luggage Carrier Rack & Back Ladder
    const rackGeo = new THREE.BoxGeometry(2.2, 0.25, 5.5);
    const rack = new THREE.Mesh(rackGeo, blackMat);
    rack.position.set(0, 3.2, -0.6);
    group.add(rack);

    // Wheels (6 wheels: 2 front, 4 rear duals)
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 16);

    const wFL = new THREE.Mesh(wheelGeo, blackMat);
    wFL.rotation.z = Math.PI / 2;
    wFL.position.set(-1.3, 0.55, 2.6);
    group.add(wFL);
    wheels.push(wFL);

    const wFR = new THREE.Mesh(wheelGeo, blackMat);
    wFR.rotation.z = Math.PI / 2;
    wFR.position.set(1.3, 0.55, 2.6);
    group.add(wFR);
    wheels.push(wFR);

    const wRL = new THREE.Mesh(wheelGeo, blackMat);
    wRL.rotation.z = Math.PI / 2;
    wRL.position.set(-1.3, 0.55, -2.6);
    group.add(wRL);
    wheels.push(wRL);

    const wRR = new THREE.Mesh(wheelGeo, blackMat);
    wRR.rotation.z = Math.PI / 2;
    wRR.position.set(1.3, 0.55, -2.6);
    group.add(wRR);
    wheels.push(wRR);

    // Powerful dual headlights
    const spot = new THREE.SpotLight(0xfffaed, 3.5, 60, Math.PI / 5, 0.3);
    spot.position.set(0, 1.2, 4.3);
    spot.target.position.set(0, 0.5, 35);
    group.add(spot);
    group.add(spot.target);

    group.userData = { wheels, headlightSpot: spot, type: 'bus' };
    return group;
  }

  // 4. PRIVATE SEDAN CAR
  static createSedan(customColor = 0xd62828) {
    const group = new THREE.Group();

    const carMat = new THREE.MeshStandardMaterial({ color: customColor, roughness: 0.3, metalness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });

    // Lower Chassis
    const baseGeo = new THREE.BoxGeometry(2.0, 0.6, 4.6);
    const base = new THREE.Mesh(baseGeo, carMat);
    base.position.y = 0.65;
    group.add(base);

    // Cabin Top
    const cabinGeo = new THREE.BoxGeometry(1.7, 0.65, 2.4);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.2, -0.2);
    group.add(cabin);

    // Roof
    const roofGeo = new THREE.BoxGeometry(1.68, 0.08, 2.1);
    const roof = new THREE.Mesh(roofGeo, carMat);
    roof.position.set(0, 1.55, -0.2);
    group.add(roof);

    // Wheels
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.25, 16);

    const offsets = [
      { x: -0.98, z: 1.4 }, { x: 0.98, z: 1.4 },
      { x: -0.98, z: -1.4 }, { x: 0.98, z: -1.4 }
    ];

    offsets.forEach(o => {
      const w = new THREE.Mesh(wheelGeo, blackMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(o.x, 0.36, o.z);
      group.add(w);
      wheels.push(w);
    });

    // Headlight Spot
    const spot = new THREE.SpotLight(0xffffff, 3.0, 55, Math.PI / 6, 0.3);
    spot.position.set(0, 0.65, 2.3);
    spot.target.position.set(0, 0.2, 30);
    group.add(spot);
    group.add(spot.target);

    group.userData = { wheels, headlightSpot: spot, type: 'sedan' };
    return group;
  }

  // 5. METRO MOTORCYCLE
  static createBike(customColor = 0x00e5ff) {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: customColor, roughness: 0.3, metalness: 0.8 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

    // Body
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 1.2), frameMat);
    tank.position.set(0, 0.75, 0.1);
    group.add(tank);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.6), blackMat);
    seat.position.set(0, 0.8, -0.5);
    group.add(seat);

    // 2 Wheels
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.16, 16);

    const wF = new THREE.Mesh(wheelGeo, blackMat);
    wF.rotation.z = Math.PI / 2;
    wF.position.set(0, 0.38, 0.9);
    group.add(wF);
    wheels.push(wF);

    const wR = new THREE.Mesh(wheelGeo, blackMat);
    wR.rotation.z = Math.PI / 2;
    wR.position.set(0, 0.38, -0.9);
    group.add(wR);
    wheels.push(wR);

    // Headlight
    const spot = new THREE.SpotLight(0xfff9d6, 2.5, 45, Math.PI / 6, 0.3);
    spot.position.set(0, 0.85, 1.0);
    spot.target.position.set(0, 0.2, 25);
    group.add(spot);
    group.add(spot.target);

    group.userData = { wheels, headlightSpot: spot, type: 'bike' };
    return group;
  }

  // 6. DHAKA POLICE PICKUP
  static createPolice() {
    const group = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.4 });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x0d47a1, roughness: 0.4 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

    // Chassis
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.7, 4.8), whiteMat);
    base.position.y = 0.75;
    group.add(base);

    // Blue Police Stripe along sides
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.3, 4.8), blueMat);
    stripe.position.y = 0.75;
    group.add(stripe);

    // Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.8, 2.2), whiteMat);
    cab.position.set(0, 1.45, 0.4);
    group.add(cab);

    // Flashing Emergency Lightbar on roof (Red and Blue)
    const barGeo = new THREE.BoxGeometry(1.2, 0.14, 0.35);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 1.95, 0.4);
    group.add(bar);

    const redLight = new THREE.PointLight(0xff0000, 2, 20);
    redLight.position.set(-0.4, 2.05, 0.4);
    group.add(redLight);

    const blueLight = new THREE.PointLight(0x0044ff, 2, 20);
    blueLight.position.set(0.4, 2.05, 0.4);
    group.add(blueLight);

    // Wheels
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.28, 16);
    const offsets = [
      { x: -1.02, z: 1.5 }, { x: 1.02, z: 1.5 },
      { x: -1.02, z: -1.5 }, { x: 1.02, z: -1.5 }
    ];

    offsets.forEach(o => {
      const w = new THREE.Mesh(wheelGeo, blackMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(o.x, 0.4, o.z);
      group.add(w);
      wheels.push(w);
    });

    const spot = new THREE.SpotLight(0xffffff, 3.2, 55, Math.PI / 6, 0.3);
    spot.position.set(0, 0.75, 2.4);
    spot.target.position.set(0, 0.2, 30);
    group.add(spot);
    group.add(spot.target);

    group.userData = { wheels, headlightSpot: spot, redLight, blueLight, type: 'police' };
    return group;
  }
}

