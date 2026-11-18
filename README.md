# DHAKA CITY GANGSTAR (ঢাকা সিটি গ্যাংস্টার)
### A 3D Open-World Dhaka City Action Game Powered by Three.js & WebGL 2

---

## 🌟 Overview

**DHAKA CITY GANGSTAR** is an original open-world action & driving game capturing the dynamic atmosphere, architecture, traffic, and street culture of Dhaka, Bangladesh. Built with **Three.js**, **WebGL 2**, **HTML5/CSS3**, and the **Web Audio API**.

---

## 🎮 How to Play & Controls

### 🖥️ Desktop Keyboard & Mouse
| Key | Action |
| --- | --- |
| **W / A / S / D** or **Arrow Keys** | Walk / Run / Steer Vehicle & Accelerate / Reverse |
| **Space** | Jump (on foot) / Handbrake & Drift (in vehicle) |
| **Shift** | Sprint (on foot) / Nitro Boost (in vehicle) |
| **E** | Enter / Exit Vehicle (CNG Auto, Rickshaw, Bus, Sedan, Bike, Police) |
| **F** | Rickshaw Bell *"Tring-Tring!"* / Hydraulic Air Horn / Talk to NPCs |
| **C** | Cycle Camera (3rd Person Close, 3rd Far, 1st Person Hood, Cinematic Orbit) |
| **M** | Toggle Full Dhaka City Map & GPS Navigation Waypoints |
| **H** | Toggle Headlights & Rickshaw Lanterns |
| **R** | Reset / Flip Vehicle Upright |
| **G** | Open Mod Garage & Vehicle Customizer |
| **Mouse Drag** | 360° Orbit & Camera Tilt |

### 📱 Mobile Touch Controls
- **Virtual Analog Joystick** (Bottom-left): 360° steering & directional movement.
- **Gas / Sprint Button** (⚡): Accelerate vehicle or sprint.
- **Brake / Jump Button** (🛑): Handbrake & drift or jump on foot.
- **Enter/Exit Button** (🛺): Quick access to board vehicles.
- **Horn / Bell Button** (🔔): Ring rickshaw bell or sound bus horns.
- **Camera Switch Button** (🎥): Switch viewpoints dynamically.

---

## 🗺️ 20 Interconnected Dhaka Districts

1. **Motijheel**: Financial heart of Dhaka with high-rise banking towers and Shapla Chattar.
2. **Gulistan**: Transport terminal, sports stadium, electronics market.
3. **Shahbagh**: Cultural center adjacent to Dhaka University.
4. **Farmgate**: Major transit hub featuring elevated Metro Rail Station.
5. **Karwan Bazar**: Historic wholesale market and national media towers.
6. **Dhanmondi**: Lakeside cafes and planned residential sectors.
7. **Mohammadpur**: Famous residential town.
8. **Mirpur**: Cricket stadium, Benarosi Palli, and northern Metro corridor.
9. **Uttara**: Northern terminal sector of MRT Line 6.
10. **Banani**: Trendsetting commercial hub and dining streets.
11. **Gulshan**: Diplomatic quarter with modern skyscrapers and luxury penthouses.
12. **Mohakhali**: Elevated flyover, bus terminal, and healthcare corridor.
13. **Tejgaon**: Automotive industrial zone and mod garages.
14. **Old Dhaka (Puran Dhaka)**: Historic labyrinth alleys, bakarkhani, and heritage architecture.
15. **Sadarghat**: Historic river port with giant multi-deck passenger launch ships.
16. **Jatrabari**: Gateway flyovers to the southeast.
17. **Badda**: Rapidly expanding commercial artery along Pragati Sarani.
18. **Rampura**: Television hub and Hatirjheel entrance.
19. **Hatirjheel**: Cable-stayed parabolic arch bridges and scenic ring roads.
20. **Airport Road**: Express four-lane highway with flyover overpasses.

---

## 🏛️ Iconic Landmarks
- **Jatiya Sangsad Bhaban (National Parliament)**: Louis Kahn’s monumental concrete geometry and reflecting lake moat.
- **Hatirjheel Bridges**: Parabolic cable-stayed arch bridge with glowing night LED cables.
- **Dhaka Metro Rail (MRT Line 6)**: Elevated viaduct with cylindrical piers, Farmgate station, and animated train.
- **Shaheed Minar**: Monument with red circular sun disc.
- **Curzon Hall**: Indo-Saracenic red brick pavilion with Mughal arches and chattris.
- **Shapla Chattar**: White water lily fountain sculpture in central Motijheel.
- **Buriganga Riverfront & Sadarghat Launch**: River water with docked passenger vessel *M.V. Mayurpankhi*.

---

## 🛺 Authentic Bangladesh Vehicles
1. **Green CNG Auto-Rickshaw**: Wire safety mesh, rear spare tire, meter, and 2-stroke engine sound.
2. **Traditional Pedal Rickshaw**: High passenger seat, folding hood with peacock backplate art, and brass bell.
3. **Dhaka Local Bus ("Murir Tin")**: Colorful painted body, route boards, roof luggage rack, and dual-tone pneumatic air horn.
4. **Corolla Sedan**: Modern 4-door Dhaka private car with drift mechanics.
5. **Metro Motorcycle**: Agile two-wheeler with body leaning physics.
6. **Dhaka Police Pickup**: White-and-blue patrol pickup with flashing emergency lightbars and wailing sirens.

---

## 🎯 Story Missions & Challenges
- **Puran Dhaka Biryani Rush**: Pick up Haji Biryani and rush through traffic jams to Motijheel before the timer expires.
- **Hatirjheel Midnight Time Trial**: Drift across Hatirjheel bridges and hit all checkpoints.
- **Buriganga Contraband Recovery**: Retrieve documents at Sadarghat and shake off the police.
- **Curzon Hall Secret Courier**: Deliver blueprints safely to Curzon Hall.
- **Parliament VIP Motorcade**: Escort executive VIP vehicle to the National Parliament.

---

## 🔊 Web Audio API Sound Synthesizer
- Authentic dual-tone Rickshaw bell ("Tring-Tring!")
- 2-stroke CNG sputtering engine
- Loud pneumatic Dhaka bus horn ("PAAN-POON!")
- Heavy diesel engine rumble and tire skid screech
- Ambient crowd voices and Bengali NPC dialogue
- Procedurally generated Dhaka Beats radio station

---

## 🛠️ Tech Stack & Architecture
- **Three.js** (v0.165+)
- **Vite** (v5+)
- **WebGL 2** with ACES Filmic tone mapping and soft shadow maps
- **Modular JavaScript**:
  - `src/core/Game.js`: Master loop and lifecycle coordinator
  - `src/core/Renderer.js`: High-performance WebGL renderer
  - `src/core/CameraController.js`: 5 distinct camera perspectives
  - `src/core/InputManager.js`: Desktop & mobile touch controls
  - `src/core/AudioManager.js`: Real-time Web Audio API synthesizer
  - `src/world/DhakaWorld.js`: Open-world terrain and district coordinator
  - `src/world/RoadNetwork.js`: Road mesh, flyover, and GPS pathfinding
  - `src/world/Landmarks.js`: Parliament, Hatirjheel, Curzon Hall, etc.
  - `src/world/MetroRail.js`: MRT Line 6 viaduct and animated train
  - `src/world/WeatherDayNight.js`: Day/night cycle and monsoon rain
  - `src/vehicles/VehiclePhysics.js`: Raycast suspension, friction, drifting
  - `src/vehicles/VehicleModels.js`: CNG, Rickshaw, Bus, Sedan, Bike, Police
  - `src/vehicles/TrafficSystem.js`: Autonomous AI city traffic
  - `src/npcs/PedestrianSystem.js`: Sidewalk AI pedestrians and Bengali dialogue
  - `src/missions/MissionManager.js`: Objective tracking and checkpoints
  - `src/ui/`: Minimap, Full City Map, Garage, HUD, Settings
  - `src/save/SaveManager.js`: IndexedDB & LocalStorage persistence

---

## 🚀 Running the Project
```bash
# Install dependencies
npm install

# Start Vite local development server
npm run dev

# Build production bundle
npm run build
```
Game runs at **`http://localhost:3000`**.

