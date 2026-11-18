import fs from 'fs';

// Load extracted Lucide icons
const lucide = JSON.parse(fs.readFileSync('scripts/lucide_icons.json', 'utf8'));

// Custom game locomotion icons in pure Lucide 24x24 stroke style
const locomotionIcons = {
  Run: `<circle cx="15" cy="4" r="2"/><path d="M14 6.5 10 11.5"/><path d="m12.5 8.5 3.5 1.5 2-2"/><path d="m12.5 8.5-3.5 1.5-3-1.5"/><path d="m10 11.5 3 3.5-1 5"/><path d="m10 11.5-3 2.5-3 1"/>`,
  Jump: `<circle cx="12" cy="4" r="2"/><path d="M12 6.5v6"/><path d="m12 8-4-3-2 2"/><path d="m12 8 4-3 2 2"/><path d="m12 12.5-3 3.5 2 4"/><path d="m12 12.5 3 3.5-2 4"/>`,
  Crouch: `<circle cx="9" cy="6" r="2"/><path d="M9 8.5v4.5"/><path d="m9 13 4 2-1 5"/><path d="M5 19h4"/><path d="m9 10 3 1.5v3"/>`,
  Stand: lucide.PersonStanding,
  Walk: `<circle cx="13" cy="4" r="2"/><path d="M13 6v6"/><path d="m10 9 3 1.5 3-1.5"/><path d="m13 12-3 8"/><path d="m13 12 3 8"/>`,
  Vault: `<path d="M3 20h18"/><circle cx="14" cy="5" r="2"/><path d="m7 19 4-6 4 1 3-3"/><path d="m11 13 3-2 2 3"/>`,
  Prone: `<circle cx="5" cy="14" r="2"/><path d="M7 15h10l3 3"/><path d="M10 15v3h4"/>`
};

console.log('Locomotion icons compiled successfully.');
