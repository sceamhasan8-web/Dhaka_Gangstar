// VoiceEventSystem.js - Event-Driven Bridge between Game Mechanics and Voice Dialogue
export class VoiceEventSystem {
  constructor(voiceManager) {
    this.voiceManager = voiceManager;
    this.dialogue = voiceManager.dialogue;
  }

  // --- PLAYER ACTIONS ---
  triggerPlayerJump(isFemale = false) {
    const key = isFemale ? 'player_jump_female' : 'player_jump_male';
    this.dialogue.requestDialogue(key, { priority: 2 });
  }

  triggerPlayerLand(isFemale = false, velocity = 5) {
    if (velocity < 4) return; // Only voice land on noticeable drops
    const key = isFemale ? 'player_land_female' : 'player_land_male';
    this.dialogue.requestDialogue(key, { priority: 2 });
  }

  triggerPlayerPain(isFemale = false) {
    const key = isFemale ? 'player_pain_female' : 'player_pain_male';
    this.dialogue.requestDialogue(key, { priority: 3, force: true });
  }

  triggerPlayerEnterVehicle(isFemale = false) {
    if (!isFemale) {
      this.dialogue.requestDialogue('player_car_male', { priority: 2 });
    }
  }

  triggerPlayerVictory(isFemale = false) {
    const key = isFemale ? 'player_victory_female' : 'player_victory_male';
    this.dialogue.requestDialogue(key, { priority: 4, force: true });
  }

  // --- MISSIONS ---
  triggerMissionStart(missionId) {
    const missionVoiceMap = {
      'biryani_rush': 'mission_start_biryani',
      'hatirjheel_drift': 'mission_start_hatirjheel',
      'sadarghat_drop': 'mission_start_sadarghat',
      'curzon_courier': 'mission_start_curzon',
      'parliament_escort': 'mission_start_parliament'
    };

    const key = missionVoiceMap[missionId] || 'mission_start_biryani';
    this.dialogue.requestDialogue(key, { priority: 5, force: true });
  }

  triggerMissionTimeWarning() {
    this.dialogue.requestDialogue('mission_time_warning', { priority: 5, force: true });
  }

  triggerMissionComplete() {
    this.dialogue.requestDialogue('mission_complete_voice', { priority: 5, force: true });
  }

  triggerMissionFailed() {
    this.dialogue.requestDialogue('mission_failed_voice', { priority: 5, force: true });
  }

  // --- POLICE DISPATCH & MEGAHONE ---
  triggerPoliceAlert() {
    this.dialogue.requestDialogue('police_dispatch_alert', { priority: 4 });
  }

  triggerPoliceWarning(cruiserMesh = null) {
    this.dialogue.requestDialogue('police_warning_halt', {
      priority: 4,
      spatialSource: cruiserMesh
    });
  }

  triggerPolicePursuitBackup(cruiserMesh = null) {
    this.dialogue.requestDialogue('police_pursuit_backup', {
      priority: 4,
      spatialSource: cruiserMesh
    });
  }

  triggerPoliceStandDown() {
    this.dialogue.requestDialogue('police_stand_down', { priority: 3 });
  }

  // --- PEDESTRIAN CONVERSATIONS & REACTIONS ---
  triggerPedestrianGreeting(mesh = null) {
    const options = ['ped_greet_1', 'ped_greet_2', 'ped_rickshaw_puller', 'ped_chat_jam', 'ped_chat_metro'];
    const chosen = options[Math.floor(Math.random() * options.length)];
    this.dialogue.requestDialogue(chosen, {
      priority: 1,
      spatialSource: mesh
    });
  }

  triggerPedestrianTrafficNear(mesh = null) {
    const chosen = Math.random() < 0.5 ? 'ped_traffic_react_1' : 'ped_traffic_react_2';
    this.dialogue.requestDialogue(chosen, {
      priority: 3,
      spatialSource: mesh
    });
  }

  triggerPedestrianGangstarSalute(mesh = null) {
    this.dialogue.requestDialogue('ped_gangstar_salute', {
      priority: 2,
      spatialSource: mesh
    });
  }

  // --- STREET VENDORS ---
  triggerVendorTea(mesh = null) {
    this.dialogue.requestDialogue('vendor_tea_stall', {
      priority: 2,
      spatialSource: mesh
    });
  }

  triggerVendorBiryani(mesh = null) {
    this.dialogue.requestDialogue('vendor_biryani_stall', {
      priority: 2,
      spatialSource: mesh
    });
  }

  // --- TUTORIAL ---
  triggerTutorialWelcome() {
    this.dialogue.requestDialogue('tutorial_welcome', { priority: 5 });
  }
}
