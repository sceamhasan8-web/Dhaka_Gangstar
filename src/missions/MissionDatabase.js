import * as THREE from 'three';

export const MISSION_DATABASE = [
  {
    id: 'biryani_rush',
    title: 'PURAN DHAKA BIRYANI RUSH',
    bengali: 'পুরান ঢাকার বিরিয়ানি ডেলিভারি',
    type: 'Story Mission',
    desc: 'Pick up hot Haji Biryani from Old Dhaka and rush it through traffic jams to the Motijheel corporate bank tower!',
    startPos: new THREE.Vector3(-150, 0, -320),
    destPos: new THREE.Vector3(150, 0, -180),
    destName: 'Motijheel Bank Tower',
    timeLimit: 150, // 2:30 min
    reward: 3500
  },
  {
    id: 'hatirjheel_drift',
    title: 'HATIRJHEEL MIDNIGHT TIME TRIAL',
    bengali: 'হাতিরঝিল স্পিড রান',
    type: 'Driving Challenge',
    desc: 'Drift across the Hatirjheel arched bridges and hit all checkpoints before time runs out!',
    startPos: new THREE.Vector3(0, 0, 140),
    destPos: new THREE.Vector3(0, 0, 260),
    destName: 'Hatirjheel North Bridge',
    timeLimit: 90,
    reward: 4000
  },
  {
    id: 'sadarghat_drop',
    title: 'BURIGANGA CONTRABAND RECOVERY',
    bengali: 'সদরঘাট লঞ্চ ঘাট উদ্ধার',
    type: 'Gangstar Heist',
    desc: 'Retrieve the hidden briefcase dropped at the Sadarghat launch terminal and escape!',
    startPos: new THREE.Vector3(-150, 0, -410),
    destPos: new THREE.Vector3(-30, 0, 80),
    destName: 'Farmgate Safehouse',
    timeLimit: 180,
    reward: 5000
  },
  {
    id: 'curzon_courier',
    title: 'CURZON HALL SECRET COURIER',
    bengali: 'কার্জন হল গোপন চিঠি',
    type: 'Courier Mission',
    desc: 'Transport historical research documents from Shahbagh to Curzon Hall pavilion safely.',
    startPos: new THREE.Vector3(-60, 0, -100),
    destPos: new THREE.Vector3(-310, 0, -100),
    destName: 'Curzon Hall Mughal Arch',
    timeLimit: 120,
    reward: 3000
  },
  {
    id: 'parliament_escort',
    title: 'PARLIAMENT VIP MOTORCADE',
    bengali: 'সংসদ ভবন ভিআইপি এসকর্ট',
    type: 'VIP Escort',
    desc: 'Drive the executive VIP vehicle through Mirpur Road to Jatiya Sangsad Bhaban.',
    startPos: new THREE.Vector3(-180, 0, 80),
    destPos: new THREE.Vector3(300, 0, 340),
    destName: 'National Parliament South Plaza',
    timeLimit: 160,
    reward: 6000
  }
];

