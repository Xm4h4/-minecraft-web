# Minecraft Web Edition 3D (WebGL)

An authentic, fully featured recreation of Minecraft built directly from the official Minecraft specifications outlined on [Minecraft.net](https://www.minecraft.net/en-us/about-minecraft).

Runs smoothly at 60 FPS in any modern web browser using Three.js WebGL with 100% self-contained local assets and procedural synthesizers.

---

## 🎮 Play Locally

Open your browser to:
**`http://localhost:8090`**

---

## ✨ Features & Systems

### 1. Game Modes & Rules
- **Survival Mode**:
  - Health & hunger simulation (10 hearts, 10 drumsticks).
  - Progressive block breaking with 10 crack stages (0–9) based on block hardness.
  - 3D rotating mini-voxel item drops that magnetically vacuum into the player's hotbar.
  - Natural regeneration when hunger $\ge 18$.
  - Starvation damage when hunger reaches 0.
  - Fall damage calculation ($fallDistance - 3$).
  - Underwater drowning: 10 oxygen air bubbles appear when submerged, popping one by one before drowning damage begins.
  - Consumable food items (Apple, Bread, Cooked Porkchop) with multi-crunch eating sound and health/hunger restoration.
  - Steve "OOF!" hurt grunt sound, red damage screen flash, and camera recoil.
  - Death screen with score display and respawn options.
- **Creative Mode**:
  - Instant 1-click block destruction (no delay or crack overlay).
  - Double-tap `Space` to toggle Creative Flight (ascend with `Space`, descend with `Shift`).
  - Unlimited blocks and complete invulnerability to damage and hunger.
- **Hardcore Mode**:
  - Same as Survival, locked to Hardest difficulty.
  - Permadeath: no respawn on death (Spectate or Delete World).
  - Signature Hardcore Hearts with aggressive slanted red eyes.
- **Adventure Mode**:
  - Blocks cannot be broken or placed without specialized tools.
- **Game Rules Toggles**:
  - `doDaylightCycle`: On / Off
  - `keepInventory`: On / Off
  - `naturalRegeneration`: On / Off
  - `doMobSpawning`: On / Off
  - `fallDamage`: On / Off
  - `smoothLighting`: On / Off
  - Difficulty: Peaceful, Easy, Normal, Hard

### 2. Night Hostile Mobs ("Survive the Night")
- **Zombie**:
  - 3D voxel model with green skin, blue shirt, trousers, and outstretched arms.
  - Tracking AI: pathfinds towards player at night with eerie groaning sounds.
  - Attacks within 1.4 blocks dealing damage and knockback.
  - Takes knockback and red damage flashes when hit by player punches or Diamond Sword.
  - Drops XP orbs with level-up chime upon defeat.
- **Creeper**:
  - Mottled green camouflage 4-legged voxel model that silently stalks the player.
  - When within 3.2 blocks, it stops, hisses (`playCreeperFuse()`), and swells white.
  - If player doesn't flee or defeat it within 1.4s, it detonates in an explosion, destroying nearby blocks and dealing blast damage!

### 3. Graphics & Visual Authenticity
- **Voxel Ambient Occlusion (Smooth Lighting)**:
  - Quad vertex shading calculated from neighbor blocks, giving mountain edges, caves, and castle arches deep volumetric depth.
- **Volumetric Pixel Clouds**:
  - High-altitude voxel cloud canopy floating across the sky at $Y=45$.
- **Procedural 16×16 Pixel Canvas Textures**:
  - High-fidelity textures with `THREE.NearestFilter` (Grass, Stone, Cobble, Stone Bricks, Mossy/Cracked Bricks, Oak Logs/Planks/Leaves, Sand, Water, Glass, Diamond/Gold/Iron, Obsidian, Glowstone, Crafting Table, Furnace, Bookshelf, Red Wool, Apple, Bread, Diamond Sword, Iron Pickaxe, Zombie, and Creeper).
- **Day / Sunset / Night Celestial Cycle**:
  - Orbiting square voxel Sun, Moon, and stars with dynamic horizon fog colors.
- **Steve 3D Rigged Model**:
  - Walking limb swing animations, first-person animated right hand holding active voxel items with attack swing recoil, and **F5** camera cycling (1st person $\rightarrow$ 3rd person back $\rightarrow$ 3rd person front).

### 4. Official Menus, UI & Typography
- **Local Minecraft Fonts**: Bundled `MinecraftTen.woff` (title) and `Minecraftia.woff` (body/UI).
- **Main Menu**: Dirt background texture pattern with dark vignette, 3D stone-cracked "MINECRAFT" logo, pulsing yellow splash text at $-18^\circ$, and stone-beveled buttons with hover highlighting.
- **World Creation & Game Rules Modal**: World name, game mode toggles, difficulty selector, and rule buttons.
- **Options / Video Settings Modal**: FOV slider (Normal 70 to Quake Pro 110), Render Distance, and Volume sliders.
- **In-Game Pause Menu (`Esc` key)**: "Back to Game", "Mode Switcher", "Options...", "Castle Blueprints (C)", and "Save and Quit to Title".
- **Advancements System**: Celebratory toast notifications in the top right with brass fanfare chime.
- **Castle Architect Blueprint Workshop (`C` key)**: Instant construction of Grand Fortresses, Fortified Watchtowers, and Royal Throne Halls.

---

## ⌨️ Controls Guide

| Key / Input | Action |
| :--- | :--- |
| `W`, `A`, `S`, `D` | Walk / Move (Smooth auto step-up climbing over 1-block steps & stairs) |
| `Mouse` | Look around (click screen to lock cursor) |
| `Left Click` or `F` | Attack mob / Mine block (hold to mine with cracks; Mac trackpad friendly) |
| `Right Click` or `R` | Place block / Interact (Open Doors, Sleep in Beds, Sit on Chairs, Cook on Campfires) |
| `Middle Click` or `Q` | Pick block under cursor |
| `Left Shift` | Sprint (drains hunger) / Climb down ladders / Sneak |
| `Space` | Jump / Climb up ladders / Stand up from chairs (Double-tap in Creative to fly) |
| `1` – `9` or `Wheel` | Select active hotbar slot |
| `E` | Open Survival Inventory, 2×2 Crafting GUI & Creative Catalog with Furniture tab |
| `C` | Open Castle Architect Blueprint Workshop |
| `Escape` | Open Game Menu (Pause & settings) |
| `F5` | Toggle Camera Perspective (1st person / 3rd person back / 3rd person front) |
| `F3` | Toggle Debug Screen (Coordinates, biome, chunk, FPS) |

---

## 🪑 Furniture & Medieval Living Spaces

- **Oak Door**: Right-click to swing open or close with authentic wooden door audio. Walk through open doors!
- **Red Bed**: Right-click to set your respawn point. Right-click at night to sleep through the night to sunrise dawn and restore full hearts and hunger.
- **Campfire & Fireplace Hearth**: Radiates bright firelight (level 15) and emits rising smoke plumes and orange sparks. Right-click with Raw Beef or Raw Mutton to sizzle and cook into hot Steaks and Roasted Mutton!
- **Oak Chair**: Right-click to sit down comfortably on the chair. Press `Space` or `Shift` to stand up.
- **Oak Desk**: Traditional study and writing desk for architectural blueprints.
- **Ladders**: Place on walls and hold `W` or `Space` to climb vertically between floors. Release to cling in place!
- **Auto Step-Up & Pillar Jump**: Seamlessly walk up staircases onto second floors without jumping, and jump-build pillars beneath your feet.
