import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationStateMachine } from './AnimationStateMachine.js';

/**
 * DHAKA CITY GANGSTAR — Advanced Character System (Aslam Bhai)
 * Features:
 * - Dual-pipeline architecture: Instant procedural 3D avatar + Asynchronous GLTF Skeletal Rigging
 * - Biomechanically accurate 2-segment limbs (Shoulder/Elbow, Hip/Knee/Ankle)
 * - True opposite arm-leg swinging locomotion with dynamic knee flexion
 * - Non-stretching rigid bone preservation during Jump, Fall & Land
 * - Speed-scaled walk and athletic run cycles with forward lean & vertical bounce
 * - Smooth lerp-based animation state blending
 */
export class CharacterModel {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'PlayerCharacterGroup';
    this.scene.add(this.group);

    this.isLoaded = false;
    this.mixer = null;
    this.actions = {};
    this.stateMachine = null;
    this.bones = {};
    this.initialBonePositions = {};
    this.modelRoot = null;

    this.options = Object.assign({
      modelPath: './models/readyplayer.me.glb',
      animSourcePath: './models/Xbot.glb',
      fallbackAnimPath: './models/Soldier.glb',
      jacketColor: 0x1f2937, // Aslam Bhai signature dark denim jacket
      jeansColor: 0x334155,  // Dark urban jeans
      skinTone: 0x9b6b43,    // South Asian complexion
      scale: 1.05
    }, options);

    this.walkCycleTime = 0;
    this.idleTimer = 0;
    this.currentLean = 0;
    this.currentPitch = 0;
    this.leftFootIKOffset = 0;
    this.rightFootIKOffset = 0;

    // Configurable Locomotion Parameters
    this.animParams = {
      walkLegAmp: THREE.MathUtils.degToRad(30),   // ~0.52 rad
      walkArmAmp: THREE.MathUtils.degToRad(32),   // ~0.56 rad
      walkKneeAmp: 0.65,                          // ~37 deg backward knee bend
      runLegAmp: THREE.MathUtils.degToRad(46),    // ~0.80 rad
      runArmAmp: THREE.MathUtils.degToRad(50),    // ~0.87 rad
      runKneeAmp: 1.10,                           // ~63 deg athletic knee lift
      runElbowBend: 0.75,                         // ~43 deg running arm tuck
      runPitch: 0.16                              // Torso forward lean
    };

    // 1. Instant Procedural 3D Humanoid (Zero-latency rendering on frame 1)
    this.buildProceduralAvatar();

    // 2. Defer heavy GLB downloads (6.8 MB) until after initial frame renders
    if (typeof window !== 'undefined') {
      const scheduleLoad = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
      scheduleLoad(() => {
        this.loadRealisticHumanoid();
      });
    } else {
      this.loadRealisticHumanoid();
    }
  }

  buildProceduralAvatar() {
    this.procAvatar = new THREE.Group();
    this.procAvatar.name = 'ProceduralAslamBhai';

    const skinMat = new THREE.MeshStandardMaterial({ color: this.options.skinTone, roughness: 0.65 });
    const jacketMat = new THREE.MeshStandardMaterial({ color: this.options.jacketColor, roughness: 0.55 });
    const jeansMat = new THREE.MeshStandardMaterial({ color: this.options.jeansColor, roughness: 0.8 });
    const bootsMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.9 });

    // Hips / Pelvis root
    this.procHips = new THREE.Group();
    this.procHips.position.y = 0;
    this.procAvatar.add(this.procHips);

    // ── Upper Body (Spine, Torso, Collar, Head, Articulated Arms) ─────────
    this.procSpine = new THREE.Group();
    this.procSpine.position.set(0, 0.88, 0);
    this.procHips.add(this.procSpine);

    // Torso / Chest (Capsule geometry for natural shoulders & waist)
    const torsoGeo = new THREE.CapsuleGeometry(0.24, 0.52, 4, 8);
    const torso = new THREE.Mesh(torsoGeo, jacketMat);
    torso.position.y = 0.30;
    torso.castShadow = true;
    torso.receiveShadow = true;
    this.procSpine.add(torso);

    // Inner Shirt Accent (Mustard Gold Dhaka collar)
    const collarGeo = new THREE.BoxGeometry(0.20, 0.12, 0.16);
    const collar = new THREE.Mesh(collarGeo, new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 }));
    collar.position.set(0, 0.58, 0.08);
    this.procSpine.add(collar);

    // Head & Neck
    this.procHead = new THREE.Group();
    this.procHead.position.set(0, 0.68, 0);
    this.procSpine.add(this.procHead);

    const headGeo = new THREE.SphereGeometry(0.23, 12, 10);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    this.procHead.add(head);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.235, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.08, 0);
    this.procHead.add(hair);

    // Signature Aslam Bhai Beard
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.10, 0.12), hairMat);
    beard.position.set(0, -0.09, 0.09);
    this.procHead.add(beard);

    // Aviator Sunglasses
    const glasses = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.06, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1, metalness: 0.9 })
    );
    glasses.position.set(0, 0.01, 0.14);
    this.procHead.add(glasses);

    // ── 2-Segment Arms (Shoulders + Elbows + Forearms + Hands) ────────────
    // Left Arm
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(-0.28, 0.52, 0);
    this.procSpine.add(this.leftShoulder);

    const lUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.088, 0.30, 8), jacketMat);
    lUpperArmMesh.position.y = -0.15;
    lUpperArmMesh.castShadow = true;
    this.leftShoulder.add(lUpperArmMesh);

    this.leftElbow = new THREE.Group();
    this.leftElbow.position.set(0, -0.30, 0);
    this.leftShoulder.add(this.leftElbow);

    const lForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.28, 8), jacketMat);
    lForearmMesh.position.y = -0.14;
    lForearmMesh.castShadow = true;
    this.leftElbow.add(lForearmMesh);

    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.078, 8, 6), skinMat);
    lHand.position.set(0, -0.28, 0.02);
    this.leftElbow.add(lHand);

    // Right Arm
    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(0.28, 0.52, 0);
    this.procSpine.add(this.rightShoulder);

    const rUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.088, 0.30, 8), jacketMat);
    rUpperArmMesh.position.y = -0.15;
    rUpperArmMesh.castShadow = true;
    this.rightShoulder.add(rUpperArmMesh);

    this.rightElbow = new THREE.Group();
    this.rightElbow.position.set(0, -0.30, 0);
    this.rightShoulder.add(this.rightElbow);

    const rForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.28, 8), jacketMat);
    rForearmMesh.position.y = -0.14;
    rForearmMesh.castShadow = true;
    this.rightElbow.add(rForearmMesh);

    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.078, 8, 6), skinMat);
    rHand.position.set(0, -0.28, 0.02);
    this.rightElbow.add(rHand);

    // ── 2-Segment Legs (Hips + Knees + Ankles + Boots) ───────────────────
    // Neutral height: Thigh (0.42m) + Calf (0.40m) + Boot offset (0.06m) = 0.88m (ground flush)
    // Left Leg
    this.leftHip = new THREE.Group();
    this.leftHip.position.set(-0.14, 0.88, 0);
    this.procHips.add(this.leftHip);

    const lThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.115, 0.42, 8), jeansMat);
    lThighMesh.position.y = -0.21;
    lThighMesh.castShadow = true;
    this.leftHip.add(lThighMesh);

    this.leftKnee = new THREE.Group();
    this.leftKnee.position.set(0, -0.42, 0);
    this.leftHip.add(this.leftKnee);

    const lCalfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.095, 0.40, 8), jeansMat);
    lCalfMesh.position.y = -0.20;
    lCalfMesh.castShadow = true;
    this.leftKnee.add(lCalfMesh);

    this.leftAnkle = new THREE.Group();
    this.leftAnkle.position.set(0, -0.40, 0);
    this.leftKnee.add(this.leftAnkle);

    this.leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.28), bootsMat);
    this.leftBoot.position.set(0, -0.05, 0.04);
    this.leftBoot.castShadow = true;
    this.leftAnkle.add(this.leftBoot);

    // Right Leg
    this.rightHip = new THREE.Group();
    this.rightHip.position.set(0.14, 0.88, 0);
    this.procHips.add(this.rightHip);

    const rThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.115, 0.42, 8), jeansMat);
    rThighMesh.position.y = -0.21;
    rThighMesh.castShadow = true;
    this.rightHip.add(rThighMesh);

    this.rightKnee = new THREE.Group();
    this.rightKnee.position.set(0, -0.42, 0);
    this.rightHip.add(this.rightKnee);

    const rCalfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.095, 0.40, 8), jeansMat);
    rCalfMesh.position.y = -0.20;
    rCalfMesh.castShadow = true;
    this.rightKnee.add(rCalfMesh);

    this.rightAnkle = new THREE.Group();
    this.rightAnkle.position.set(0, -0.40, 0);
    this.rightKnee.add(this.rightAnkle);

    this.rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.28), bootsMat);
    this.rightBoot.position.set(0, -0.05, 0.04);
    this.rightBoot.castShadow = true;
    this.rightAnkle.add(this.rightBoot);

    this.group.add(this.procAvatar);
  }

  loadRealisticHumanoid() {
    const loader = new GLTFLoader();

    loader.load(
      this.options.modelPath,
      (gltf) => {
        this.modelRoot = gltf.scene;
        this.modelRoot.scale.setScalar(this.options.scale);
        this.modelRoot.position.y = 0;

        // Cache all skeletal bones and their initial rest positions
        this.cacheSkeletonBones(this.modelRoot);

        this.modelRoot.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = Math.max(0.4, child.material.roughness || 0.6);
              child.material.metalness = Math.min(0.2, child.material.metalness || 0.05);
            }
          }
        });

        // Hide procedural avatar and add GLTF model
        if (this.procAvatar) {
          this.procAvatar.visible = false;
        }
        this.group.add(this.modelRoot);

        this.mixer = new THREE.AnimationMixer(this.modelRoot);
        this.loadSkeletalAnimations(loader);
      },
      undefined,
      (err) => {
        console.warn('[CharacterModel] Using high-fidelity procedural avatar:', err);
      }
    );
  }

  cacheSkeletonBones(root) {
    this.initialBonePositions = {};
    root.traverse((node) => {
      if (node.isBone) {
        const cleanName = node.name.replace(/^mixamorig:/, '');
        this.bones[cleanName] = node;
        this.bones[node.name] = node;
        this.initialBonePositions[cleanName] = node.position.clone();
        this.initialBonePositions[node.name] = node.position.clone();
      }
    });
    console.log(`[CharacterModel] Cached ${Object.keys(this.bones).length / 2} skeletal joints with rest positions.`);
  }

  loadSkeletalAnimations(loader) {
    const animPath = this.options.animSourcePath;

    loader.load(
      animPath,
      (animGltf) => {
        this.processAnimationClips(animGltf.animations);
      },
      undefined,
      () => {
        loader.load(this.options.fallbackAnimPath, (fallbackGltf) => {
          this.processAnimationClips(fallbackGltf.animations);
        });
      }
    );
  }

  processAnimationClips(rawClips) {
    rawClips.forEach((clip) => {
      const remappedClip = this.remapMixamoClip(clip);
      const name = clip.name.toLowerCase();
      this.actions[name] = this.mixer.clipAction(remappedClip);

      // Register variations
      if (name === 'walk') {
        const fastWalk = this.mixer.clipAction(remappedClip.clone());
        fastWalk.timeScale = 1.25;
        this.actions['fast_walk'] = fastWalk;

        const backwardAction = this.mixer.clipAction(remappedClip.clone());
        backwardAction.timeScale = -0.85;
        this.actions['backward'] = backwardAction;

        this.actions['strafe_left'] = this.mixer.clipAction(remappedClip.clone());
        this.actions['strafe_right'] = this.mixer.clipAction(remappedClip.clone());
      } else if (name === 'run') {
        const jogAction = this.mixer.clipAction(remappedClip.clone());
        jogAction.timeScale = 0.82;
        this.actions['jog'] = jogAction;

        const sprintAction = this.mixer.clipAction(remappedClip.clone());
        sprintAction.timeScale = 1.35;
        this.actions['sprint'] = sprintAction;
      }
    });

    // Synthesize procedural clips for actions not in base GLB
    this.synthesizeProceduralClips();

    this.stateMachine = new AnimationStateMachine(this.mixer, this.actions);
    this.isLoaded = true;
    console.log('[CharacterModel] Complete skeletal animation engine online.');
  }

  remapMixamoClip(clip) {
    const newTracks = [];
    clip.tracks.forEach((track) => {
      const remappedName = track.name.replace(/mixamorig:/g, '');

      // CRITICAL FIX: Only allow Hips to have translation tracks!
      // Child bone translations alter limb length, causing legs and arms to stretch unnaturally!
      if (remappedName.endsWith('.position') && !remappedName.startsWith('Hips.')) {
        return;
      }

      // CRITICAL FIX: Strip all scale tracks to prevent distortion
      if (remappedName.endsWith('.scale')) {
        return;
      }

      // Clamp Hips vertical position to prevent excessive lifting or leg elongation
      if (remappedName === 'Hips.position') {
        const values = Array.from(track.values);
        for (let i = 1; i < values.length; i += 3) {
          values[i] = THREE.MathUtils.clamp(values[i], 0.82, 1.05);
        }
        newTracks.push(new THREE.VectorKeyframeTrack(remappedName, Array.from(track.times), values));
        return;
      }

      const newTrack = track.clone();
      newTrack.name = remappedName;
      newTracks.push(newTrack);
    });
    return new THREE.AnimationClip(clip.name, clip.duration, newTracks);
  }

  /**
   * Synthesize natural animation clips using keyframed bone rotations
   * without stretching bone lengths or translating child limbs.
   */
  synthesizeProceduralClips() {
    // 1. JUMP TAKEOFF CLIP (0.45s) — Natural knee bend and arm push
    const jumpTracks = [];
    const jumpTimes = [0, 0.15, 0.45];

    // Hips stay at natural height (no excessive lift that stretches legs)
    jumpTracks.push(new THREE.VectorKeyframeTrack('Hips.position', jumpTimes, [0, 0.96, 0, 0, 0.88, 0, 0, 0.96, 0]));

    // Thighs tuck slightly forward
    const qNeutral = new THREE.Quaternion();
    const qThighCrouch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.32);
    const qKneeCrouch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.55);
    const qSpineLeap = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.12);

    jumpTracks.push(new THREE.QuaternionKeyframeTrack('LeftUpLeg.quaternion', jumpTimes, [
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w,
      qThighCrouch.x, qThighCrouch.y, qThighCrouch.z, qThighCrouch.w,
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w
    ]));
    jumpTracks.push(new THREE.QuaternionKeyframeTrack('RightUpLeg.quaternion', jumpTimes, [
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w,
      qThighCrouch.x, qThighCrouch.y, qThighCrouch.z, qThighCrouch.w,
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w
    ]));
    jumpTracks.push(new THREE.QuaternionKeyframeTrack('LeftLeg.quaternion', jumpTimes, [
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w,
      qKneeCrouch.x, qKneeCrouch.y, qKneeCrouch.z, qKneeCrouch.w,
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w
    ]));
    jumpTracks.push(new THREE.QuaternionKeyframeTrack('RightLeg.quaternion', jumpTimes, [
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w,
      qKneeCrouch.x, qKneeCrouch.y, qKneeCrouch.z, qKneeCrouch.w,
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w
    ]));
    jumpTracks.push(new THREE.QuaternionKeyframeTrack('Spine.quaternion', jumpTimes, [
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w,
      qSpineLeap.x, qSpineLeap.y, qSpineLeap.z, qSpineLeap.w,
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w
    ]));

    const jumpClip = new THREE.AnimationClip('jump', 0.45, jumpTracks);
    this.actions['jump'] = this.mixer.clipAction(jumpClip);

    // 2. FALL AIRBORNE DESCENT CLIP (0.6s looped) — Balanced knee tuck, arms for stability
    const fallTracks = [];
    const fallTimes = [0, 0.6];
    const qThighAirL = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.22);
    const qThighAirR = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.16);
    const qKneeAir = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.38);
    const qArmAirL = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.22);
    const qArmAirR = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.22);

    fallTracks.push(new THREE.VectorKeyframeTrack('Hips.position', fallTimes, [0, 0.95, 0, 0, 0.95, 0]));
    fallTracks.push(new THREE.QuaternionKeyframeTrack('LeftUpLeg.quaternion', fallTimes, [
      qThighAirL.x, qThighAirL.y, qThighAirL.z, qThighAirL.w,
      qThighAirL.x, qThighAirL.y, qThighAirL.z, qThighAirL.w
    ]));
    fallTracks.push(new THREE.QuaternionKeyframeTrack('RightUpLeg.quaternion', fallTimes, [
      qThighAirR.x, qThighAirR.y, qThighAirR.z, qThighAirR.w,
      qThighAirR.x, qThighAirR.y, qThighAirR.z, qThighAirR.w
    ]));
    fallTracks.push(new THREE.QuaternionKeyframeTrack('LeftLeg.quaternion', fallTimes, [
      qKneeAir.x, qKneeAir.y, qKneeAir.z, qKneeAir.w,
      qKneeAir.x, qKneeAir.y, qKneeAir.z, qKneeAir.w
    ]));
    fallTracks.push(new THREE.QuaternionKeyframeTrack('RightLeg.quaternion', fallTimes, [
      qKneeAir.x, qKneeAir.y, qKneeAir.z, qKneeAir.w,
      qKneeAir.x, qKneeAir.y, qKneeAir.z, qKneeAir.w
    ]));
    fallTracks.push(new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', fallTimes, [
      qArmAirL.x, qArmAirL.y, qArmAirL.z, qArmAirL.w,
      qArmAirL.x, qArmAirL.y, qArmAirL.z, qArmAirL.w
    ]));
    fallTracks.push(new THREE.QuaternionKeyframeTrack('RightArm.quaternion', fallTimes, [
      qArmAirR.x, qArmAirR.y, qArmAirR.z, qArmAirR.w,
      qArmAirR.x, qArmAirR.y, qArmAirR.z, qArmAirR.w
    ]));

    const fallClip = new THREE.AnimationClip('fall', 0.6, fallTracks);
    this.actions['fall'] = this.mixer.clipAction(fallClip);

    // 3. LAND IMPACT RECOVERY CLIP (0.28s) — Shock absorption
    const landTracks = [];
    const landTimes = [0, 0.12, 0.28];
    const qKneeImpact = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.52);

    landTracks.push(new THREE.VectorKeyframeTrack('Hips.position', landTimes, [0, 0.95, 0, 0, 0.85, 0, 0, 0.96, 0]));
    landTracks.push(new THREE.QuaternionKeyframeTrack('LeftLeg.quaternion', landTimes, [
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w,
      qKneeImpact.x, qKneeImpact.y, qKneeImpact.z, qKneeImpact.w,
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w
    ]));
    landTracks.push(new THREE.QuaternionKeyframeTrack('RightLeg.quaternion', landTimes, [
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w,
      qKneeImpact.x, qKneeImpact.y, qKneeImpact.z, qKneeImpact.w,
      qNeutral.x, qNeutral.y, qNeutral.z, qNeutral.w
    ]));

    const landClip = new THREE.AnimationClip('land', 0.28, landTracks);
    this.actions['land'] = this.mixer.clipAction(landClip);

    // 4. DRIVING SEATED CLIP
    const driveTracks = [];
    const driveTimes = [0, 1.0];
    const qSeatedLeg = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -1.45);
    const qSeatedKnee = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 1.45);
    const qSteerArm = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.65);

    driveTracks.push(new THREE.VectorKeyframeTrack('Hips.position', driveTimes, [0, 0.58, 0, 0, 0.58, 0]));
    driveTracks.push(new THREE.QuaternionKeyframeTrack('LeftUpLeg.quaternion', driveTimes, [
      qSeatedLeg.x, qSeatedLeg.y, qSeatedLeg.z, qSeatedLeg.w,
      qSeatedLeg.x, qSeatedLeg.y, qSeatedLeg.z, qSeatedLeg.w
    ]));
    driveTracks.push(new THREE.QuaternionKeyframeTrack('RightUpLeg.quaternion', driveTimes, [
      qSeatedLeg.x, qSeatedLeg.y, qSeatedLeg.z, qSeatedLeg.w,
      qSeatedLeg.x, qSeatedLeg.y, qSeatedLeg.z, qSeatedLeg.w
    ]));
    driveTracks.push(new THREE.QuaternionKeyframeTrack('LeftLeg.quaternion', driveTimes, [
      qSeatedKnee.x, qSeatedKnee.y, qSeatedKnee.z, qSeatedKnee.w,
      qSeatedKnee.x, qSeatedKnee.y, qSeatedKnee.z, qSeatedKnee.w
    ]));
    driveTracks.push(new THREE.QuaternionKeyframeTrack('RightLeg.quaternion', driveTimes, [
      qSeatedKnee.x, qSeatedKnee.y, qSeatedKnee.z, qSeatedKnee.w,
      qSeatedKnee.x, qSeatedKnee.y, qSeatedKnee.z, qSeatedKnee.w
    ]));
    driveTracks.push(new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', driveTimes, [
      qSteerArm.x, qSteerArm.y, qSteerArm.z, qSteerArm.w,
      qSteerArm.x, qSteerArm.y, qSteerArm.z, qSteerArm.w
    ]));
    driveTracks.push(new THREE.QuaternionKeyframeTrack('RightArm.quaternion', driveTimes, [
      qSteerArm.x, qSteerArm.y, qSteerArm.z, qSteerArm.w,
      qSteerArm.x, qSteerArm.y, qSteerArm.z, qSteerArm.w
    ]));

    const driveClip = new THREE.AnimationClip('driving', 1.0, driveTracks);
    this.actions['driving'] = this.mixer.clipAction(driveClip);
  }

  playAnimation(name, duration = 0.22, speed = null) {
    if (this.stateMachine) {
      this.stateMachine.transitionTo(name, duration, speed);
    }
  }

  updateMovementSpeed(vel) {
    if (this.stateMachine) {
      this.stateMachine.updateMovementSpeed(vel);
    }
  }

  /**
   * Procedural Turn Banking & Acceleration Pitch
   */
  applyProceduralBodyResponse(delta, angularVelocity, speed, accel) {
    const targetLean = THREE.MathUtils.clamp(-angularVelocity * speed * 0.0075, -0.18, 0.18);
    this.currentLean = THREE.MathUtils.lerp(this.currentLean, targetLean, Math.min(1.0, delta * 10));

    const targetPitch = THREE.MathUtils.clamp((accel / 12.0) * 0.09, -0.12, 0.14);
    this.currentPitch = THREE.MathUtils.lerp(this.currentPitch, targetPitch, Math.min(1.0, delta * 8));

    const spine = this.bones['Spine'] || this.bones['mixamorig:Spine'];
    if (spine) {
      spine.rotation.z = this.currentLean;
      spine.rotation.x = this.currentPitch;
    }

    if (this.procSpine && this.procAvatar.visible) {
      this.procSpine.rotation.z = this.currentLean;
      this.procSpine.rotation.x = this.currentPitch;
    }
  }

  /**
   * Foot Placement & Ground Alignment Inverse Kinematics
   * Adjusts feet to road elevation without accumulative bone distortion.
   */
  applyFootPlacementIK(delta, leftGroundY, rightGroundY, playerY) {
    const targetLeftOffset = THREE.MathUtils.clamp(leftGroundY - playerY, -0.25, 0.25);
    const targetRightOffset = THREE.MathUtils.clamp(rightGroundY - playerY, -0.25, 0.25);

    this.leftFootIKOffset = THREE.MathUtils.lerp(this.leftFootIKOffset, targetLeftOffset, Math.min(1.0, delta * 12));
    this.rightFootIKOffset = THREE.MathUtils.lerp(this.rightFootIKOffset, targetRightOffset, Math.min(1.0, delta * 12));

    // Skeletal rig IK adjustment without accumulation
    const leftFoot = this.bones['LeftFoot'] || this.bones['mixamorig:LeftFoot'];
    const rightFoot = this.bones['RightFoot'] || this.bones['mixamorig:RightFoot'];

    if (leftFoot && this.initialBonePositions && this.initialBonePositions['LeftFoot']) {
      leftFoot.position.copy(this.initialBonePositions['LeftFoot']);
      leftFoot.position.y += this.leftFootIKOffset * 0.2;
    }
    if (rightFoot && this.initialBonePositions && this.initialBonePositions['RightFoot']) {
      rightFoot.position.copy(this.initialBonePositions['RightFoot']);
      rightFoot.position.y += this.rightFootIKOffset * 0.2;
    }

    // Procedural avatar: adjust ankle pivot elevation
    if (this.leftAnkle) {
      this.leftAnkle.position.y = -0.40 + this.leftFootIKOffset * 0.4;
    }
    if (this.rightAnkle) {
      this.rightAnkle.position.y = -0.40 + this.rightFootIKOffset * 0.4;
    }
  }

  /**
   * Main Animation Loop
   * Executes skeletal mixer tick AND drives articulated procedural biomechanics.
   */
  update(delta, isMoving = false, speed = 0, isGrounded = true, isInVehicle = false, isCrouched = false, animState = 'idle') {
    // 1. Skeletal Mixer Update
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // 2. Procedural Avatar Biomechanical Locomotion Engine
    if (this.procAvatar && this.procAvatar.visible) {
      // Vehicle Seated State
      if (isInVehicle) {
        this.procHips.position.y = -0.35;
        this.leftHip.rotation.x = -1.45;
        this.rightHip.rotation.x = -1.45;
        this.leftKnee.rotation.x = 1.45;
        this.rightKnee.rotation.x = 1.45;
        this.leftShoulder.rotation.x = -0.65;
        this.rightShoulder.rotation.x = -0.65;
        this.leftElbow.rotation.x = -0.45;
        this.rightElbow.rotation.x = -0.45;
        return;
      }

      // Targets to be smoothly interpolated
      let targetHipY = 0;
      let targetLeftHipX = 0;
      let targetRightHipX = 0;
      let targetLeftKneeX = 0;
      let targetRightKneeX = 0;
      let targetLeftAnkleX = 0;
      let targetRightAnkleX = 0;

      let targetLeftShoulderX = 0;
      let targetRightShoulderX = 0;
      let targetLeftShoulderZ = -0.05;
      let targetRightShoulderZ = 0.05;
      let targetLeftElbowX = -0.15;
      let targetRightElbowX = -0.15;

      let targetSpinePitch = 0;
      let targetSpineYaw = 0;

      // ── A. AIRBORNE STATE (Jumping / Falling) ───────────────────────────
      if (!isGrounded) {
        // Natural airborne pose: knees tucked naturally toward body, arms out for balance
        targetHipY = 0.02;
        targetLeftHipX = -0.24;
        targetRightHipX = -0.18;
        targetLeftKneeX = 0.42;
        targetRightKneeX = 0.36;
        targetLeftAnkleX = -0.15;
        targetRightAnkleX = -0.15;

        // Arms raised slightly for aerodynamic stability
        targetLeftShoulderX = -0.38;
        targetRightShoulderX = -0.38;
        targetLeftShoulderZ = -0.22;
        targetRightShoulderZ = 0.22;
        targetLeftElbowX = -0.35;
        targetRightElbowX = -0.35;
        targetSpinePitch = 0.06;
      }
      // ── B. CROUCHING STATE ─────────────────────────────────────────────
      else if (isCrouched) {
        targetHipY = -0.25;
        targetSpinePitch = 0.22;

        if (isMoving && speed > 0.1) {
          const cadence = THREE.MathUtils.clamp(speed * 2.0, 3.0, 7.0);
          this.walkCycleTime += delta * cadence;
          const swing = Math.sin(this.walkCycleTime);

          targetLeftHipX = -0.45 + swing * 0.32;
          targetRightHipX = -0.45 - swing * 0.32;
          targetLeftKneeX = 0.65 + Math.max(0, -swing) * 0.35;
          targetRightKneeX = 0.65 + Math.max(0, swing) * 0.35;

          targetLeftShoulderX = -swing * 0.30;
          targetRightShoulderX = swing * 0.30;
          targetLeftElbowX = -0.35;
          targetRightElbowX = -0.35;
        } else {
          targetLeftHipX = -0.48;
          targetRightHipX = -0.48;
          targetLeftKneeX = 0.70;
          targetRightKneeX = 0.70;
          targetLeftShoulderX = -0.18;
          targetRightShoulderX = -0.18;
          targetLeftElbowX = -0.25;
          targetRightElbowX = -0.25;
        }
      }
      // ── C. RUNNING / SPRINTING STATE (speed > 5.5 m/s) ─────────────────
      else if (isMoving && speed > 5.5) {
        const isSprint = speed > 10.0;
        const cadence = THREE.MathUtils.clamp(speed * 1.5, 7.5, 13.5);
        this.walkCycleTime += delta * cadence;

        const swing = Math.sin(this.walkCycleTime);
        const cosSwing = Math.cos(this.walkCycleTime);

        const legAmp = isSprint ? this.animParams.runLegAmp * 1.15 : this.animParams.runLegAmp;
        const armAmp = isSprint ? this.animParams.runArmAmp * 1.12 : this.animParams.runArmAmp;
        const kneeAmp = isSprint ? this.animParams.runKneeAmp * 1.1 : this.animParams.runKneeAmp;

        // Alternating Thighs
        targetLeftHipX = swing * legAmp;
        targetRightHipX = -swing * legAmp;

        // Dynamic Knee Flexion during backswing & high knee lift
        targetLeftKneeX = Math.max(0, -swing) * kneeAmp;
        targetRightKneeX = Math.max(0, swing) * kneeAmp;

        // Ankle orientation
        targetLeftAnkleX = -targetLeftHipX * 0.35 - targetLeftKneeX * 0.35;
        targetRightAnkleX = -targetRightHipX * 0.35 - targetRightKneeX * 0.35;

        // True Opposite Arm Swing (Left arm opposes left leg, follows right leg)
        targetLeftShoulderX = -swing * armAmp;
        targetRightShoulderX = swing * armAmp;

        // Running Arm Tuck (elbows bent 45-75 degrees)
        targetLeftElbowX = -this.animParams.runElbowBend - Math.max(0, -swing) * 0.35;
        targetRightElbowX = -this.animParams.runElbowBend - Math.max(0, swing) * 0.35;

        // Forward Torso Lean & Natural Pelvis Bobbing
        targetSpinePitch = isSprint ? 0.20 : this.animParams.runPitch;
        targetSpineYaw = -swing * 0.08;
        targetHipY = Math.abs(cosSwing) * 0.055;
      }
      // ── D. WALKING STATE (0.1 < speed <= 5.5 m/s) ───────────────────────
      else if (isMoving && speed > 0.1) {
        const cadence = THREE.MathUtils.clamp(speed * 1.6, 3.5, 7.5);
        this.walkCycleTime += delta * cadence;

        const swing = Math.sin(this.walkCycleTime);
        const cosSwing = Math.cos(this.walkCycleTime);

        const legAmp = this.animParams.walkLegAmp;
        const armAmp = this.animParams.walkArmAmp;
        const kneeAmp = this.animParams.walkKneeAmp;

        // Alternating Thighs (Left vs Right in strict opposition)
        targetLeftHipX = swing * legAmp;
        targetRightHipX = -swing * legAmp;

        // Natural Knee Bend during backward stride
        targetLeftKneeX = Math.max(0, -swing) * kneeAmp;
        targetRightKneeX = Math.max(0, swing) * kneeAmp;

        // Ankle keeps foot aligned with road surface
        targetLeftAnkleX = -targetLeftHipX * 0.40 - targetLeftKneeX * 0.35;
        targetRightAnkleX = -targetRightHipX * 0.40 - targetRightKneeX * 0.35;

        // Strict Opposite Arm Swing (Left arm opposes left leg)
        targetLeftShoulderX = -swing * armAmp;
        targetRightShoulderX = swing * armAmp;

        // Subtle natural elbow flex when arm swings forward
        targetLeftElbowX = -0.15 - Math.max(0, -swing) * 0.38;
        targetRightElbowX = -0.15 - Math.max(0, swing) * 0.38;

        // Subtle vertical bounce and spine sway
        targetHipY = Math.abs(cosSwing) * 0.03;
        targetSpineYaw = -swing * 0.04;
        targetSpinePitch = 0.04;
      }
      // ── E. IDLE STATE (Standing Still) ─────────────────────────────────
      else {
        this.idleTimer += delta;
        const breathe = Math.sin(this.idleTimer * 2.2) * 0.03;

        // Both feet flat on the ground
        targetHipY = breathe * 0.015;
        targetLeftHipX = 0;
        targetRightHipX = 0;
        targetLeftKneeX = 0;
        targetRightKneeX = 0;
        targetLeftAnkleX = 0;
        targetRightAnkleX = 0;

        // Relaxed arms at sides with breathing motion
        targetLeftShoulderX = breathe;
        targetRightShoulderX = -breathe;
        targetLeftShoulderZ = -0.06;
        targetRightShoulderZ = 0.06;
        targetLeftElbowX = -0.12;
        targetRightElbowX = -0.12;
        targetSpinePitch = breathe * 0.2;
      }

      // Landing compression override
      if (animState === 'land') {
        targetHipY -= 0.10;
        targetLeftKneeX += 0.45;
        targetRightKneeX += 0.45;
        targetSpinePitch += 0.12;
      }

      // Smooth interpolation (avoids sudden snapping or jitter)
      const lerpSpeed = Math.min(1.0, delta * 15.0);

      this.procHips.position.y = THREE.MathUtils.lerp(this.procHips.position.y, targetHipY, lerpSpeed);

      // Thighs
      this.leftHip.rotation.x = THREE.MathUtils.lerp(this.leftHip.rotation.x, targetLeftHipX, lerpSpeed);
      this.rightHip.rotation.x = THREE.MathUtils.lerp(this.rightHip.rotation.x, targetRightHipX, lerpSpeed);

      // Knees
      this.leftKnee.rotation.x = THREE.MathUtils.lerp(this.leftKnee.rotation.x, targetLeftKneeX, lerpSpeed);
      this.rightKnee.rotation.x = THREE.MathUtils.lerp(this.rightKnee.rotation.x, targetRightKneeX, lerpSpeed);

      // Ankles
      this.leftAnkle.rotation.x = THREE.MathUtils.lerp(this.leftAnkle.rotation.x, targetLeftAnkleX, lerpSpeed);
      this.rightAnkle.rotation.x = THREE.MathUtils.lerp(this.rightAnkle.rotation.x, targetRightAnkleX, lerpSpeed);

      // Shoulders
      this.leftShoulder.rotation.x = THREE.MathUtils.lerp(this.leftShoulder.rotation.x, targetLeftShoulderX, lerpSpeed);
      this.rightShoulder.rotation.x = THREE.MathUtils.lerp(this.rightShoulder.rotation.x, targetRightShoulderX, lerpSpeed);
      this.leftShoulder.rotation.z = THREE.MathUtils.lerp(this.leftShoulder.rotation.z, targetLeftShoulderZ, lerpSpeed);
      this.rightShoulder.rotation.z = THREE.MathUtils.lerp(this.rightShoulder.rotation.z, targetRightShoulderZ, lerpSpeed);

      // Elbows
      this.leftElbow.rotation.x = THREE.MathUtils.lerp(this.leftElbow.rotation.x, targetLeftElbowX, lerpSpeed);
      this.rightElbow.rotation.x = THREE.MathUtils.lerp(this.rightElbow.rotation.x, targetRightElbowX, lerpSpeed);

      // Torso / Spine
      this.procSpine.rotation.y = THREE.MathUtils.lerp(this.procSpine.rotation.y, targetSpineYaw, lerpSpeed);
      this.procSpine.rotation.x = THREE.MathUtils.lerp(this.procSpine.rotation.x, targetSpinePitch + this.currentPitch, lerpSpeed);
      this.procSpine.rotation.z = THREE.MathUtils.lerp(this.procSpine.rotation.z, this.currentLean, lerpSpeed);
    }
  }

  setOutfitColor(colorHex) {
    this.options.jacketColor = colorHex;
    if (this.procAvatar) {
      this.procAvatar.traverse((child) => {
        if (child.isMesh && child.material && child.geometry.type === 'CapsuleGeometry') {
          child.material.color.setHex(colorHex);
        }
      });
    }
  }

  setVisible(visible) {
    this.group.visible = visible;
  }
}
