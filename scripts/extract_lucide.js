import * as Lucide from 'lucide';
import fs from 'fs';

const icons = [
  'Car', 'CarFront', 'Camera', 'Hand', 'HandFist', 'Pause', 'Play',
  'Settings', 'Maximize', 'Minimize', 'Volume2', 'VolumeX', 'Map',
  'RotateCcw', 'LogOut', 'DoorOpen', 'MessageCircle', 'Flag',
  'Backpack', 'PersonStanding', 'Footprints', 'X', 'Crosshair',
  'Zap', 'Sun', 'Moon', 'Compass', 'Gauge', 'Radio', 'Shield', 'Sparkles'
];

const result = {};
for (const name of icons) {
  if (Lucide[name]) {
    result[name] = Lucide[name].map(([tag, attrs]) => {
      const attrStr = Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');
      return `<${tag} ${attrStr}/>`;
    }).join('');
  } else {
    console.warn('Missing in Lucide:', name);
  }
}

fs.writeFileSync('scripts/lucide_icons.json', JSON.stringify(result, null, 2));
console.log('Successfully extracted', Object.keys(result).length, 'icons to scripts/lucide_icons.json');
