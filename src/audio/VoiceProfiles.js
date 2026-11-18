// VoiceProfiles.js - Character Voice Profiles & Persona Definitions
export const VOICE_PROFILES = {
  // Playable characters
  aslam: {
    id: 'aslam',
    name: 'Aslam Bhai',
    bengaliName: 'আসলাম ভাই',
    gender: 'male',
    pitch: 0.9,
    rate: 1.0,
    style: 'gritty_veteran',
    language: 'both',
    fallbackVoice: 'male'
  },
  rahim: {
    id: 'rahim',
    name: 'Rahim',
    bengaliName: 'রহিম',
    gender: 'male',
    pitch: 1.1,
    rate: 1.1,
    style: 'young_racer',
    language: 'both',
    fallbackVoice: 'male'
  },
  shanto: {
    id: 'shanto',
    name: 'Shanto',
    bengaliName: 'শান্ত',
    gender: 'male',
    pitch: 0.95,
    rate: 1.0,
    style: 'cool_operator',
    language: 'both',
    fallbackVoice: 'male'
  },
  maya: {
    id: 'maya',
    name: 'Maya',
    bengaliName: 'মায়া',
    gender: 'female',
    pitch: 1.05,
    rate: 1.0,
    style: 'sharp_operative',
    language: 'both',
    fallbackVoice: 'female'
  },

  // City NPCs & Pedestrians
  pedestrian_male: {
    id: 'pedestrian_male',
    name: 'Dhaka Citizen',
    bengaliName: 'পথচারী',
    gender: 'male',
    pitch: 1.0,
    rate: 1.0,
    style: 'casual_street',
    fallbackVoice: 'male'
  },
  pedestrian_female: {
    id: 'pedestrian_female',
    name: 'Dhaka Citizen',
    bengaliName: 'পথচারী',
    gender: 'female',
    pitch: 1.1,
    rate: 1.05,
    style: 'casual_street',
    fallbackVoice: 'female'
  },

  // Vendors
  vendor_tea: {
    id: 'vendor_tea',
    name: 'Tong Mama',
    bengaliName: 'টং মামা',
    gender: 'male',
    pitch: 1.0,
    rate: 1.1,
    style: 'welcoming_vendor',
    fallbackVoice: 'male'
  },
  vendor_biryani: {
    id: 'vendor_biryani',
    name: 'Haji Bawarchi',
    bengaliName: 'হাজী বাবুর্চি',
    gender: 'male',
    pitch: 0.85,
    rate: 0.95,
    style: 'old_dhaka_chef',
    fallbackVoice: 'male'
  },

  // Police & Law Enforcement
  police_dispatch: {
    id: 'police_dispatch',
    name: 'Police HQ Dispatch',
    bengaliName: 'পুলিশ হেডকোয়ার্টার',
    gender: 'female',
    pitch: 1.0,
    rate: 1.15,
    style: 'radio_filtered',
    fallbackVoice: 'female'
  },
  police_officer: {
    id: 'police_officer',
    name: 'Patrol Officer',
    bengaliName: 'টহল পুলিশ',
    gender: 'male',
    pitch: 0.95,
    rate: 1.1,
    style: 'megaphone_warning',
    fallbackVoice: 'male'
  },

  // System & Missions
  mission_hq: {
    id: 'mission_hq',
    name: 'Dhaka Underground HQ',
    bengaliName: 'মিশন সদরদপ্তর',
    gender: 'female',
    pitch: 1.0,
    rate: 1.05,
    style: 'tactical_briefing',
    fallbackVoice: 'female'
  }
};
