import * as THREE from 'three';

// Manages the 20 Dhaka Districts, coordinates, boundary checks, and GPS waypoints

export class DistrictManager {
  constructor() {
    this.districts = [
      { id: 'motijheel', name: 'Motijheel Commercial Zone', bengali: 'মতিঝিল', x: 150, z: -150, radius: 100, desc: 'Financial capital of Dhaka with banks and Shapla Chattar' },
      { id: 'gulistan', name: 'Gulistan & Stadium', bengali: 'গুলিস্তান', x: 75, z: -200, radius: 80, desc: 'Bustling transport hub, electronics market and flyover' },
      { id: 'shahbagh', name: 'Shahbagh & DU Campus', bengali: 'শাহবাগ', x: -60, z: -100, radius: 90, desc: 'Cultural and university hub near Curzon Hall & Shaheed Minar' },
      { id: 'farmgate', name: 'Farmgate Junction', bengali: 'ফার্মগেট', x: -30, z: 80, radius: 85, desc: 'Major transit intersection with Metro Rail station' },
      { id: 'karwan_bazar', name: 'Karwan Bazar Wholesale', bengali: 'কারওয়ান বাজার', x: 40, z: 40, radius: 85, desc: 'Massive vegetable market and TV media towers' },
      { id: 'dhanmondi', name: 'Dhanmondi Residential', bengali: 'ধানমন্ডি', x: -180, z: -50, radius: 95, desc: 'Lakeside cafes, educational institutions and schools' },
      { id: 'mohammadpur', name: 'Mohammadpur Town', bengali: 'মোহাম্মদপুর', x: -280, z: 20, radius: 100, desc: 'Residential area famous for Town Hall and sweets' },
      { id: 'mirpur', name: 'Mirpur 10 Circle', bengali: 'মিরপুর', x: -220, z: 260, radius: 110, desc: 'Cricket stadium, Benarosi palli and bustling metro line' },
      { id: 'uttara', name: 'Uttara Model Town', bengali: 'উত্তরা', x: 0, z: 350, radius: 120, desc: 'Northern terminal sector with planned modern avenues' },
      { id: 'banani', name: 'Banani Commercial Area', bengali: 'বনানী', x: 120, z: 220, radius: 90, desc: 'Modern trendy restaurants, corporate offices and boutiques' },
      { id: 'gulshan', name: 'Gulshan 1 & 2 Circle', bengali: 'গুলশান', x: 200, z: 200, radius: 110, desc: 'Diplomatic zone, high-end shopping and luxury penthouses' },
      { id: 'mohakhali', name: 'Mohakhali Flyover', bengali: 'মহাখালী', x: 80, z: 140, radius: 90, desc: 'Inter-district bus terminal, flyover and ICDDRB' },
      { id: 'tejgaon', name: 'Tejgaon Industrial Area', bengali: 'তেজগাঁও', x: 120, z: 60, radius: 95, desc: 'Industrial corridor, automotive garages and studio offices' },
      { id: 'old_dhaka', name: 'Puran Dhaka (Old Dhaka)', bengali: 'পুরান ঢাকা', x: -160, z: -320, radius: 110, desc: 'Historic narrow winding golis, heritage biryani, and bakarkhani' },
      { id: 'sadarghat', name: 'Sadarghat River Port', bengali: 'সদরঘাট', x: -150, z: -420, radius: 90, desc: 'Buriganga river terminal with giant passenger launch ships' },
      { id: 'jatrabari', name: 'Jatrabari Gate', bengali: 'যাত্রাবাড়ী', x: 160, z: -380, radius: 95, desc: 'Gateway to Chittagong highway and southern districts' },
      { id: 'badda', name: 'Badda & Pragati Sarani', bengali: 'বাড্ডা', x: 280, z: 120, radius: 90, desc: 'Rapidly expanding commercial artery along Rampura canal' },
      { id: 'rampura', name: 'Rampura Bridge', bengali: 'রামপুরা', x: 240, z: 20, radius: 85, desc: 'Bangladesh Television center and Hatirjheel entry' },
      { id: 'hatirjheel', name: 'Hatirjheel Express Loop', bengali: 'হাতিরঝিল', x: 0, z: 180, radius: 110, desc: 'Iconic curved arch bridges, water taxi terminals and lake drive' },
      { id: 'airport_road', name: 'Dhaka Airport Expressway', bengali: 'এয়ারপোর্ট রোড', x: 180, z: 320, radius: 110, desc: 'Wide modern expressway leading to Shahjalal International' }
    ];

    this.activeGPSWaypoint = null;
  }

  getCurrentDistrict(pos) {
    let closest = this.districts[0];
    let minDist = Infinity;

    for (let i = 0; i < this.districts.length; i++) {
      const d = this.districts[i];
      const dist = Math.hypot(pos.x - d.x, pos.z - d.z);
      if (dist < minDist) {
        minDist = dist;
        closest = d;
      }
    }
    return closest;
  }

  setGPSWaypoint(districtId) {
    const dist = this.districts.find(d => d.id === districtId);
    if (dist) {
      this.activeGPSWaypoint = new THREE.Vector3(dist.x, 0, dist.z);
      return dist;
    }
    return null;
  }

  clearGPSWaypoint() {
    this.activeGPSWaypoint = null;
  }
}

