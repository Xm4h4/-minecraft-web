/**
 * Minecraft Web Edition - Master Game Engine
 * Orchestrates Three.js rendering, chunk meshing, voxel physics,
 * survival game rules, mobs AI, castle architect, audio, and UI menus.
 */

class MinecraftGame {
  constructor() {
    this.container = document.getElementById('game-container');
    this.canvas = document.getElementById('webgl-canvas');

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Game Mode & Rules
    this.gameMode = 'survival'; // 'survival' | 'creative' | 'hardcore' | 'adventure'
    this.gameRules = {
      doDaylightCycle: true,
      keepInventory: false,
      naturalRegeneration: true,
      doMobSpawning: true,
      fallDamage: true,
      smoothLighting: true,
      difficulty: 'Normal' // 'Peaceful' | 'Easy' | 'Normal' | 'Hard'
    };

    // Player State & Physics
    this.playerPos = new THREE.Vector3(0, 22, 0);
    this.playerVel = new THREE.Vector3(0, 0, 0);
    this.playerYaw = 0;
    this.playerPitch = 0;
    this.isGrounded = false;
    this.isFlying = false;
    this.lastSpacePress = 0;
    this.isSprinting = false;
    this.highestYWhileFalling = 22;

    // Attributes (Survival / Hardcore)
    this.health = 20; // 10 Hearts (2 HP each)
    this.maxHealth = 20;
    this.hunger = 20; // 10 Drumsticks
    this.saturation = 5.0;
    this.oxygen = 10; // 10 Air bubbles
    this.xpLevel = 7;
    this.xpProgress = 0.65;
    this.isDead = false;

    // Timers for regen & starvation
    this.regenTimer = 0;
    this.starveTimer = 0;
    this.drownTimer = 0;
    this.hurtFlashTimer = 0;

    // Hotbar & 27 Main Inventory Slots (Real Minecraft Furniture & Items)
    this.activeHotbarSlot = 0; // 0 to 8
    this.hotbar = [
      { id: 9, count: 64 },  // Stone Bricks (Castle building)
      { id: 5, count: 64 },  // Oak Planks
      { id: 60, count: 16 }, // Oak Door (Interactive open/close!)
      { id: 62, count: 4 },  // Red Bed (Sleep & respawn point!)
      { id: 63, count: 16 }, // Campfire (Fire burning place with smoke & cooking!)
      { id: 64, count: 16 }, // Oak Chair (Interactive sit & relax!)
      { id: 65, count: 16 }, // Oak Desk (Study & writing table!)
      { id: 66, count: 16 }, // Fireplace Hearth (Roaring fire pit!)
      { id: 59, count: 64 }  // Ladder (Climb floors!)
    ];

    // 27-slot Main Inventory filled with authentic Minecraft blocks, tools, and foods
    this.inventory = [
      { id: 31, count: 16 }, // Raw Beef (Cook over campfire/fireplace!)
      { id: 32, count: 16 }, // Raw Mutton (Roast over campfire!)
      { id: 28, count: 1 },  // Diamond Sword
      { id: 34, count: 1 },  // Diamond Pickaxe
      { id: 35, count: 1 },  // Diamond Axe
      { id: 36, count: 1 },  // Diamond Shovel
      { id: 37, count: 1 },  // Bow
      { id: 38, count: 64 }, // Arrow
      { id: 39, count: 16 }, // Golden Apple
      { id: 40, count: 32 }, // Steak
      { id: 26, count: 32 }, // Bread
      { id: 25, count: 32 }, // Apple
      { id: 20, count: 64 }, // Glowstone
      { id: 46, count: 64 }, // Torch
      { id: 21, count: 16 }, // Crafting Table
      { id: 22, count: 16 }, // Furnace
      { id: 23, count: 16 }, // Bookshelf
      { id: 56, count: 16 }, // Chest
      { id: 8, count: 64 },  // Glass Block
      { id: 4, count: 64 },  // Cobblestone
      { id: 6, count: 64 },  // Oak Log
      { id: 13, count: 64 }, // Bricks
      { id: 24, count: 64 }, // Red Wool Tapestry
      { id: 30, count: 64 }, // White Wool
      { id: 50, count: 64 }, // Sea Lantern
      { id: 57, count: 1 },  // Water Bucket
      { id: 58, count: 1 }   // Lava Bucket
    ];

    this.catalogFilter = 'all';

    // Input state
    this.keys = {};
    this.mouse = { isDown: false, rightDown: false };
    this.isPointerLocked = false;

    // Mining / Breaking state
    this.breakTarget = null;
    this.breakProgress = 0;

    // Day / Night cycle (0 to 24000 ticks, starts at 6000 noon)
    this.worldTime = 6000;
    this.timeScale = 12; // 20 min full day cycle

    // Subsystems
    this.world = null;
    this.character = null;
    this.castleArchitect = null;
    this.animalManager = null;

    // Initialize
    this.initThree();
    this.initWorldAndPlayer();
    this.initInput();
    this.initUI();
    this.startLoop();
  }

  // =========================================================================
  // THREE.JS SCENE, SKYBOX & CELESTIAL ORBITS (Sun & Moon)
  // =========================================================================
  initThree() {
    this.scene = new THREE.Scene();

    // Minecraft Day Sky & Fog
    this.skyColorDay = new THREE.Color(0x78a7ff);
    this.skyColorNight = new THREE.Color(0x0a0e1a);
    this.skyColorSunset = new THREE.Color(0xdb6e39);
    this.scene.background = this.skyColorDay.clone();
    this.scene.fog = new THREE.Fog(0x78a7ff, 80, 320); // Majestic wide horizon visibility

    this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 800);
    this.camera.position.copy(this.playerPos);
    this.scene.add(this.camera);

    // Illuminates first-person hand & held tool
    const camLight = new THREE.PointLight(0xffffff, 0.55, 6);
    camLight.position.set(0.2, -0.15, -0.2);
    this.camera.add(camLight);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false, // Authentic nearest pixel rendering
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Atmospheric Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.95);
    this.sunLight.position.set(40, 80, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.scene.add(this.sunLight);

    // 3D Voxel Sun & Moon Orbits (scaled for vast world)
    this.celestialGroup = new THREE.Group();
    this.scene.add(this.celestialGroup);

    // Voxel Sun (Bright Yellow Square)
    const sunGeo = new THREE.PlaneGeometry(28, 28);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffea, side: THREE.DoubleSide });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunMesh.position.set(0, 240, 0);
    this.sunMesh.rotation.x = Math.PI / 2;
    this.celestialGroup.add(this.sunMesh);

    // Voxel Moon (Soft White Square)
    const moonGeo = new THREE.PlaneGeometry(22, 22);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xddddff, side: THREE.DoubleSide });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(0, -240, 0);
    this.moonMesh.rotation.x = Math.PI / 2;
    this.celestialGroup.add(this.moonMesh);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // =========================================================================
  // WORLD, CHARACTER, MOBS & CASTLE ARCHITECT
  // =========================================================================
  initWorldAndPlayer() {
    this.world = new MinecraftWorld(this.scene);
    window.mcWorld = this.world;

    this.character = new MinecraftCharacter(this.scene, this.camera);
    window.mcCharacter = this.character;

    this.castleArchitect = new MinecraftCastleArchitect(this.world);
    window.mcCastle = this.castleArchitect;

    this.animalManager = new MinecraftAnimalManager(this.scene, this.world, this);
    window.mcAnimals = this.animalManager;
    this.animalManager.spawnInitialAnimals();

    // Find highest terrain at spawn (0, 0)
    for (let y = 45; y >= 0; y--) {
      if (this.world.getBlock(0, y, 0) > 0) {
        this.playerPos.set(0.5, y + 2.5, 0.5);
        this.highestYWhileFalling = this.playerPos.y;
        break;
      }
    }

    this.updateActiveItem();
  }

  // =========================================================================
  // INPUT HANDLING (Pointer Lock, WASD, Hotbar, Esc, E, C)
  // =========================================================================
  initInput() {
    window.addEventListener('keydown', e => this.onKeyDown(e));
    window.addEventListener('keyup', e => this.onKeyUp(e));

    this.canvas.addEventListener('mousedown', e => {
      if (window.mcAudio) window.mcAudio.ensureContext();
      if (!this.isPointerLocked) {
        if (!this.isAnyModalOpen()) {
          this.canvas.requestPointerLock();
        }
        return;
      }

      if (e.button === 0) {
        if (e.ctrlKey || e.metaKey) {
          // Mac Trackpad Ctrl+Click or Cmd+Click = Secondary Click (Place / Eat)
          this.mouse.rightDown = true;
          this.handleRightClick();
        } else {
          // Left Click: Mine Block or Hunt Animals
          this.mouse.isDown = true;
          this.handleLeftClick();
        }
      } else if (e.button === 2) {
        // Right Click: Place Block / Eat Food / Interact
        this.mouse.rightDown = true;
        this.handleRightClick();
      } else if (e.button === 1) {
        // Middle Click: Pick Block
        e.preventDefault();
        this.handleMiddleClick();
      }
    });

    window.addEventListener('mouseup', e => {
      if (e.button === 0) {
        this.mouse.isDown = false;
        this.resetMining();
        this.mouse.rightDown = false;
      }
      if (e.button === 2) this.mouse.rightDown = false;
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = (document.pointerLockElement === this.canvas);
      if (!this.isPointerLocked && !this.isAnyModalOpen() && !this.isDead) {
        // Show pause menu when escaping
        this.togglePauseMenu(true);
      }
    });

    window.addEventListener('mousemove', e => {
      if (this.isPointerLocked && !this.isDead) {
        const sens = 0.0022;
        this.playerYaw -= e.movementX * sens;
        this.playerPitch -= e.movementY * sens;
        this.playerPitch = Math.max(-Math.PI / 2.05, Math.min(Math.PI / 2.05, this.playerPitch));
      }
    });

    // Mouse wheel hotbar slot scroll
    window.addEventListener('wheel', e => {
      if (e.deltaY > 0) {
        this.selectHotbarSlot((this.activeHotbarSlot + 1) % 9);
      } else if (e.deltaY < 0) {
        this.selectHotbarSlot((this.activeHotbarSlot + 8) % 9);
      }
    }, { passive: true });

    window.addEventListener('contextmenu', e => e.preventDefault());
  }

  isAnyModalOpen() {
    const modals = [
      'start-screen',
      'world-modal',
      'options-modal',
      'pause-modal',
      'death-modal',
      'inventory-modal',
      'castle-modal'
    ];
    return modals.some(id => {
      const el = document.getElementById(id);
      return el && !el.classList.contains('hidden') && el.classList.contains('active');
    });
  }

  onKeyDown(e) {
    if (window.mcAudio) window.mcAudio.ensureContext();
    const code = e.code;
    this.keys[code] = true;

    // Hotbar Slot Selection 1-9
    if (e.key >= '1' && e.key <= '9') {
      this.selectHotbarSlot(parseInt(e.key) - 1);
    }

    // Space: Jump or Double-Tap Flight Toggle (for building tall structures)
    if (code === 'Space') {
      const now = performance.now();
      if (now - this.lastSpacePress < 300) {
        this.isFlying = !this.isFlying;
        this.playerVel.y = 0;
        this.showPopupNotice(this.isFlying ? "BUILDER FLIGHT ON (SPACE / SHIFT)" : "BUILDER FLIGHT OFF");
      }
      this.lastSpacePress = now;
    }

    // Mac Trackpad Primary Mining / Attack Key: [F]
    if (code === 'KeyF') {
      if (!this.mouse.isDown) {
        this.mouse.isDown = true;
        this.handleLeftClick();
      }
    }

    // Mac Trackpad Secondary Place / Eat Key: [R]
    if (code === 'KeyR') {
      this.handleRightClick();
    }

    // Mac Trackpad Pick Block Key: [Q]
    if (code === 'KeyQ') {
      this.handleMiddleClick();
    }

    // Sprinting
    if (code === 'ShiftLeft' || code === 'ControlLeft') {
      this.isSprinting = true;
    }

    // Inventory GUI (E)
    if (code === 'KeyE') {
      if (!document.getElementById('start-screen').classList.contains('hidden')) return;
      this.toggleInventory();
    }

    // Castle Architect Menu (C)
    if (code === 'KeyC') {
      if (!document.getElementById('start-screen').classList.contains('hidden')) return;
      this.toggleCastleMenu();
    }

    // Camera Perspective (F5)
    if (code === 'F5') {
      e.preventDefault();
      this.character.cycleCameraMode();
    }

    // Debug Screen (F3)
    if (code === 'F3') {
      e.preventDefault();
      this.toggleDebugScreen();
    }

    // Escape Key (Game Menu)
    if (code === 'Escape') {
      e.preventDefault();
      if (!document.getElementById('start-screen').classList.contains('hidden')) return;
      this.togglePauseMenu();
    }
  }

  onKeyUp(e) {
    this.keys[e.code] = false;
    if (e.code === 'KeyF') {
      this.mouse.isDown = false;
      this.resetMining();
    }
    if (e.code === 'ShiftLeft' || e.code === 'ControlLeft') {
      this.isSprinting = false;
    }
  }

  // =========================================================================
  // MINING, COMBAT & PLACING LOGIC
  // =========================================================================
  handleLeftClick() {
    this.character.swingArm();
    if (window.mcAudio) window.mcAudio.playSwing();

    const lookDir = new THREE.Vector3(0, 0, -1);
    lookDir.applyEuler(new THREE.Euler(this.playerPitch, this.playerYaw, 0, 'YXZ'));

    // 1. Check if attack hunts any wild animal first!
    if (this.animalManager && this.animalManager.checkPlayerHunt(this.camera.position, lookDir)) {
      return;
    }

    // 2. Voxel block targeting
    const hit = this.getRaycastHit();
    if (!hit) return;

    if (this.gameMode === 'creative') {
      // Instant break in Creative!
      this.world.setBlock(hit.x, hit.y, hit.z, 0);
      return;
    }

    // Survival / Hardcore progressive breaking
    this.breakTarget = hit;
    this.breakProgress = 0;
  }

  handleRightClick() {
    const activeItem = this.hotbar[this.activeHotbarSlot];
    if (!activeItem || activeItem.id <= 0) return;

    const bDef = window.BLOCKS[activeItem.id];

    this.character.swingArm();
    const hit = this.getRaycastHit();

    const targetBlockId = hit ? this.world.getBlock(hit.x, hit.y, hit.z) : 0;
    const targetDef = window.BLOCKS[targetBlockId];
    const isSneaking = this.keys['ShiftLeft'] || this.keys['KeyC'];

    // Interactive furniture handling (Open doors, Sleep in bed, Sit on chair, Cook over campfire/fireplace)
    if (hit && !isSneaking && targetDef) {
      // 1. OAK DOOR: Open / Close
      if (targetDef.door) {
        const newDoorId = targetBlockId === 60 ? 61 : 60;
        this.world.setBlock(hit.x, hit.y, hit.z, newDoorId);
        if (window.mcAudio) window.mcAudio.playDoor(newDoorId === 61);
        this.showPopupNotice(newDoorId === 61 ? 'DOOR OPENED' : 'DOOR CLOSED');
        return;
      }

      // 2. RED BED: Sleep through the night & set respawn point
      if (targetDef.bed) {
        this.spawnPos = new THREE.Vector3(hit.x + 0.5, hit.y + 1 + 1.62, hit.z + 0.5);
        const isNight = this.worldTime >= 12500 && this.worldTime <= 23500;
        if (isNight) {
          if (window.mcAudio) window.mcAudio.playBedSleep();
          this.worldTime = 0; // Dawn sunrise!
          this.health = 20;
          this.hunger = 20;
          this.updateHeartsUI();
          this.updateHungerUI();
          this.showPopupNotice('RESPAWN POINT SET. SLEPT THROUGH THE NIGHT');
        } else {
          if (window.mcAudio) window.mcAudio.playLevelUpChime();
          this.showPopupNotice('RESPAWN POINT SET (You can sleep at night)');
        }
        return;
      }

      // 3. CAMPFIRE / FIREPLACE: Sizzle & cook raw meat
      if (targetDef.campfire || targetDef.fireplace) {
        if (activeItem.id === 31) { // Raw Beef -> Cooked Steak (id 40)
          activeItem.id = 40;
          if (window.mcAudio) window.mcAudio.playCampfireSizzle();
          this.renderHotbarUI();
          this.updateActiveItem();
          this.showPopupNotice('COOKED DELICIOUS STEAK OVER THE FIRE!');
          return;
        } else if (activeItem.id === 32) { // Raw Mutton -> Cooked Porkchop/Meat (id 27)
          activeItem.id = 27;
          if (window.mcAudio) window.mcAudio.playCampfireSizzle();
          this.renderHotbarUI();
          this.updateActiveItem();
          this.showPopupNotice('ROASTED MUTTON OVER THE FIRE!');
          return;
        } else {
          this.showPopupNotice('CAMPFIRE BURNING BRIGHT (Use raw meat to cook)');
          return;
        }
      }

      // 4. OAK CHAIR: Sit down / Stand up
      if (targetDef.chair) {
        if (this.isSitting) {
          this.isSitting = false;
          this.playerPos.y += 0.4;
          this.showPopupNotice('STOOD UP FROM CHAIR');
        } else {
          this.isSitting = true;
          this.sittingPos = new THREE.Vector3(hit.x + 0.5, hit.y + 0.65 + 1.62, hit.z + 0.5);
          this.playerPos.copy(this.sittingPos);
          this.playerVel.set(0, 0, 0);
          if (window.mcAudio) window.mcAudio.playFootstep('wood');
          this.showPopupNotice('SITTING ON OAK CHAIR (Press SPACE to stand)');
        }
        return;
      }

      // 5. OAK DESK: Study / Workspace
      if (targetDef.desk) {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        this.showPopupNotice('OAK STUDY DESK - WRITE BLUEPRINTS & PLANS');
        return;
      }
    }

    // Check if item is food and eat when not interacting with a block
    if (bDef && bDef.food) {
      this.eatFood(activeItem, bDef);
      return;
    }

    if (!hit) return;

    // Target neighbor voxel using face normal
    const tx = hit.x + hit.faceNormal.x;
    const ty = hit.y + hit.faceNormal.y;
    const tz = hit.z + hit.faceNormal.z;

    const isSolid = bDef && bDef.solid;

    let isUnderFeet = false;
    if (isSolid) {
      // Prevent placing inside player bounding box, unless pillar-jumping
      const pMinX = this.playerPos.x - 0.32;
      const pMaxX = this.playerPos.x + 0.32;
      const pMinY = this.playerPos.y - 1.62;
      const pMaxY = this.playerPos.y + 0.18;
      const pMinZ = this.playerPos.z - 0.32;
      const pMaxZ = this.playerPos.z + 0.32;

      const collides = (
        pMinX < tx + 1 && pMaxX > tx &&
        pMinY < ty + 1 && pMaxY > ty &&
        pMinZ < tz + 1 && pMaxZ > tz
      );

      // PILLAR JUMP ASSIST: Allow placing directly under feet when jumping / building upwards
      isUnderFeet = (
        pMinX < tx + 1 && pMaxX > tx &&
        pMinZ < tz + 1 && pMaxZ > tz &&
        hit.faceNormal.y === 1 &&
        pMinY >= ty - 0.45
      );

      if (collides && !isUnderFeet) return;
    }

    // Place block
    this.world.setBlock(tx, ty, tz, activeItem.id);

    // If jump-building, smoothly lift player feet onto top of new block
    if (isUnderFeet) {
      this.playerPos.y = (ty + 1) + 1.62;
      this.playerVel.y = Math.max(0, this.playerVel.y);
      this.isGrounded = true;
    }

    // In Survival, decrement stack count
    if (this.gameMode !== 'creative') {
      activeItem.count--;
      if (activeItem.count <= 0) {
        this.hotbar[this.activeHotbarSlot] = { id: 0, count: 0 };
      }
      this.renderHotbarUI();
      this.updateActiveItem();
    }
  }

  eatFood(item, bDef) {
    if (this.hunger >= 20 && this.health >= 20) return;

    if (window.mcAudio) window.mcAudio.playEat();
    this.character.swingArm();

    this.hunger = Math.min(20, this.hunger + (bDef.restoreHunger || 4));
    this.health = Math.min(20, this.health + (bDef.restoreHealth || 2));
    this.updateHeartsUI();
    this.updateHungerUI();

    this.showPopupNotice(`CONSUMED ${bDef.name.toUpperCase()}`);

    if (this.gameMode !== 'creative') {
      item.count--;
      if (item.count <= 0) {
        this.hotbar[this.activeHotbarSlot] = { id: 0, count: 0 };
      }
      this.renderHotbarUI();
      this.updateActiveItem();
    }
  }

  handleMiddleClick() {
    const hit = this.getRaycastHit();
    if (hit && hit.blockId > 0) {
      this.hotbar[this.activeHotbarSlot] = { id: hit.blockId, count: 64 };
      this.updateActiveItem();
      this.renderHotbarUI();
    }
  }

  getRaycastHit() {
    const lookDir = new THREE.Vector3(0, 0, -1);
    lookDir.applyEuler(new THREE.Euler(this.playerPitch, this.playerYaw, 0, 'YXZ'));
    return this.world.raycastBlock(this.camera.position, lookDir, 5.5);
  }

  resetMining() {
    this.breakTarget = null;
    this.breakProgress = 0;
    this.world.setBreakingProgress(-1);
  }

  updateMining(delta) {
    if (!this.mouse.isDown || this.gameMode === 'creative') return;

    const hit = this.getRaycastHit();
    if (!hit) {
      this.resetMining();
      return;
    }

    if (this.breakTarget && this.breakTarget.x === hit.x && this.breakTarget.y === hit.y && this.breakTarget.z === hit.z) {
      const bDef = window.BLOCKS[hit.blockId] || { hardness: 1.0 };
      const activeItem = this.hotbar[this.activeHotbarSlot];
      const toolDef = activeItem ? window.BLOCKS[activeItem.id] : null;
      const toolEfficiency = (toolDef && toolDef.efficiency) ? toolDef.efficiency : 1.0;

      const breakSpeed = (2.4 * toolEfficiency) / Math.max(0.2, bDef.hardness);
      this.breakProgress += delta * breakSpeed;

      const stage = Math.floor(this.breakProgress * 10);
      this.world.setBreakingProgress(Math.min(9, stage), hit.x, hit.y, hit.z);

      if (Math.random() < 0.14 && window.mcAudio) {
        window.mcAudio.playMineHit(bDef.sound || 'stone');
        this.character.swingArm();
      }

      if (this.breakProgress >= 1.0) {
        this.world.setBlock(hit.x, hit.y, hit.z, 0);
        this.resetMining();
      }
    } else {
      this.breakTarget = hit;
      this.breakProgress = 0;
    }
  }

  // =========================================================================
  // ITEM VACUUM COLLECTION & XP
  // =========================================================================
  collectItem(blockId) {
    // Add to hotbar or inventory
    let added = false;
    for (let i = 0; i < 9; i++) {
      if (this.hotbar[i].id === blockId && this.hotbar[i].count < 64) {
        this.hotbar[i].count++;
        added = true;
        break;
      }
    }
    if (!added) {
      for (let i = 0; i < 9; i++) {
        if (this.hotbar[i].id === 0) {
          this.hotbar[i] = { id: blockId, count: 1 };
          added = true;
          break;
        }
      }
    }

    if (!added && this.inventory) {
      for (let i = 0; i < 27; i++) {
        if (this.inventory[i] && this.inventory[i].id === blockId && this.inventory[i].count < 64) {
          this.inventory[i].count++;
          added = true;
          break;
        }
      }
      if (!added) {
        for (let i = 0; i < 27; i++) {
          if (!this.inventory[i] || this.inventory[i].id === 0) {
            this.inventory[i] = { id: blockId, count: 1 };
            added = true;
            break;
          }
        }
      }
    }

    this.renderHotbarUI();
    this.updateActiveItem();
    this.addXP(1);
  }

  addXP(amount) {
    this.xpProgress += amount * 0.08;
    if (this.xpProgress >= 1.0) {
      this.xpLevel++;
      this.xpProgress -= 1.0;
      if (window.mcAudio) window.mcAudio.playLevelUpChime();
    }

    const badge = document.querySelector('.xp-level-badge');
    if (badge) badge.innerText = this.xpLevel;
    const fill = document.querySelector('.xp-bar-fill');
    if (fill) fill.style.width = `${Math.min(100, Math.floor(this.xpProgress * 100))}%`;
  }

  // =========================================================================
  // PLAYER PHYSICS, COLLISION & FALL DAMAGE
  // =========================================================================
  updatePlayerPhysics(delta) {
    if (this.isDead) return;

    const forward = this.keys['KeyW'] || this.keys['ArrowUp'];
    const backward = this.keys['KeyS'] || this.keys['ArrowDown'];
    const left = this.keys['KeyA'] || this.keys['ArrowLeft'];
    const right = this.keys['KeyD'] || this.keys['ArrowRight'];
    const jump = this.keys['Space'];
    const crouch = this.keys['ShiftLeft'] || this.keys['KeyC'];

    // Camera relative vectors (XZ plane)
    const sinY = Math.sin(this.playerYaw);
    const cosY = Math.cos(this.playerYaw);
    const forwardVec = new THREE.Vector3(-sinY, 0, -cosY);
    const rightVec = new THREE.Vector3(cosY, 0, -sinY);

    const moveDir = new THREE.Vector3(0, 0, 0);
    if (forward) moveDir.add(forwardVec);
    if (backward) moveDir.sub(forwardVec);
    if (right) moveDir.add(rightVec);
    if (left) moveDir.sub(rightVec);

    const isMoving = moveDir.lengthSq() > 0.001;
    if (isMoving) {
      moveDir.normalize();
      // Deplete hunger when sprinting
      if (this.isSprinting && this.gameMode !== 'creative') {
        this.hunger = Math.max(0, this.hunger - delta * 0.15);
        this.updateHungerUI();
      }
    }

    // Chair Sitting Handling
    if (this.isSitting) {
      if (jump || crouch || isMoving) {
        this.isSitting = false;
        this.playerPos.y += 0.4;
        this.showPopupNotice('STOOD UP FROM CHAIR');
      } else {
        if (this.sittingPos) this.playerPos.copy(this.sittingPos);
        this.playerVel.set(0, 0, 0);
        return;
      }
    }

    // Check if player is in water (y < 14)
    const inWater = this.playerPos.y < 14.2;

    // --- CREATIVE FLIGHT ---
    if (this.isFlying) {
      const flySpeed = this.isSprinting ? 20.0 : 12.0;
      this.playerVel.x = moveDir.x * flySpeed;
      this.playerVel.z = moveDir.z * flySpeed;

      if (jump) this.playerVel.y = flySpeed * 0.75;
      else if (crouch) this.playerVel.y = -flySpeed * 0.75;
      else this.playerVel.y = 0;

      this.playerPos.addScaledVector(this.playerVel, delta);
      return;
    }

    // --- LADDER CLIMBING ---
    const onLadder = this.isPlayerOnLadder();
    if (onLadder) {
      const ladderClimbSpeed = 4.2;
      this.playerVel.x = moveDir.x * 2.8;
      this.playerVel.z = moveDir.z * 2.8;

      if (forward || jump) {
        this.playerVel.y = ladderClimbSpeed;
      } else if (backward || crouch) {
        this.playerVel.y = -ladderClimbSpeed;
      } else {
        this.playerVel.y = 0; // Cling to ladder
      }
      this.highestYWhileFalling = this.playerPos.y;
    } else if (inWater) {
      const speed = 3.0;
      this.playerVel.x = moveDir.x * speed;
      this.playerVel.z = moveDir.z * speed;
      if (jump) this.playerVel.y = 4.2;
      else this.playerVel.y = -1.1;
      this.highestYWhileFalling = this.playerPos.y;
    } else {
      // Normal walking / sprinting
      const speed = this.isSprinting ? 7.2 : 4.5;
      this.playerVel.x = moveDir.x * speed;
      this.playerVel.z = moveDir.z * speed;

      // Track peak fall height for fall damage
      if (this.playerVel.y < 0) {
        if (!this.isGrounded && this.playerPos.y > this.highestYWhileFalling) {
          this.highestYWhileFalling = this.playerPos.y;
        }
      } else {
        this.highestYWhileFalling = this.playerPos.y;
      }

      // Check ground state before jump
      this.updateGroundedStatus();

      // Gravity
      this.playerVel.y -= 28.0 * delta;

      // Jump (only when grounded)
      if (jump && this.isGrounded) {
        this.playerVel.y = 8.8;
        this.isGrounded = false;
        if (window.mcAudio) window.mcAudio.playFootstep('grass');
      }
    }

    const wasGrounded = this.isGrounded;

    // Separate Axis Resolution with Step-Up Assist
    this.moveHorizontalAxis('x', this.playerVel.x * delta);
    this.moveHorizontalAxis('z', this.playerVel.z * delta);
    this.moveVerticalAxis(this.playerVel.y * delta);

    // Re-check grounded status after movement
    this.updateGroundedStatus();

    // FALL DAMAGE CHECK
    if (!wasGrounded && this.isGrounded && !inWater && !onLadder) {
      const fallDistance = this.highestYWhileFalling - this.playerPos.y;
      if (fallDistance > 3.5 && this.gameRules.fallDamage && this.gameMode !== 'creative') {
        const dmg = Math.floor(fallDistance - 3);
        if (dmg > 0) {
          this.damagePlayer(dmg, 'Fall Damage');
        }
      }
      this.highestYWhileFalling = this.playerPos.y;
    }

    // Void safe guard
    if (this.playerPos.y < -12) {
      this.damagePlayer(20, 'Fell out of the world');
    }
  }

  isPlayerOnLadder() {
    const minX = Math.floor(this.playerPos.x - 0.35);
    const maxX = Math.floor(this.playerPos.x + 0.35);
    const minY = Math.floor(this.playerPos.y - 1.55);
    const maxY = Math.floor(this.playerPos.y + 0.1);
    const minZ = Math.floor(this.playerPos.z - 0.35);
    const maxZ = Math.floor(this.playerPos.z + 0.35);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const bId = this.world.getBlock(x, y, z);
          const bDef = window.BLOCKS[bId];
          if (bDef && bDef.ladder) {
            return true;
          }
        }
      }
    }
    return false;
  }

  updateGroundedStatus() {
    const feetY = this.playerPos.y - 1.62;
    const minX = Math.floor(this.playerPos.x - 0.25);
    const maxX = Math.floor(this.playerPos.x + 0.25);
    const checkY = Math.floor(feetY - 0.04);
    const minZ = Math.floor(this.playerPos.z - 0.25);
    const maxZ = Math.floor(this.playerPos.z + 0.25);

    let grounded = false;
    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        const bId = this.world.getBlock(x, checkY, z);
        const bDef = window.BLOCKS[bId];
        if (bDef && bDef.solid) {
          grounded = true;
          break;
        }
      }
      if (grounded) break;
    }
    this.isGrounded = grounded;
    return grounded;
  }

  checkPlayerCollision(px, py, pz, radius = 0.28, insetY = 0.08) {
    const minX = Math.floor(px - radius);
    const maxX = Math.floor(px + radius);
    const minY = Math.floor(py - 1.62 + insetY);
    const maxY = Math.floor(py + 0.18 - insetY);
    const minZ = Math.floor(pz - radius);
    const maxZ = Math.floor(pz + radius);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const bId = this.world.getBlock(x, y, z);
          const bDef = window.BLOCKS[bId];
          if (bDef && bDef.solid) {
            return true;
          }
        }
      }
    }
    return false;
  }

  moveHorizontalAxis(axis, deltaMove) {
    if (Math.abs(deltaMove) < 0.000001) return;

    const targetPos = this.playerPos.clone();
    targetPos[axis] += deltaMove;

    // 1. Direct move test
    if (!this.checkPlayerCollision(targetPos.x, targetPos.y, targetPos.z, 0.28, 0.08)) {
      this.playerPos[axis] = targetPos[axis];
      return;
    }

    // 2. Step-Up Assist (Minecraft auto-step up <= 1.05 blocks, e.g. 1-block steps, stairs, slabs)
    // Only attempt when grounded or moving upward/level
    const maxStepHeight = 1.05;
    if (this.playerVel.y >= -2.0) {
      const elevatedY = this.playerPos.y + maxStepHeight;
      // Headroom at current position
      if (!this.checkPlayerCollision(this.playerPos.x, elevatedY, this.playerPos.z, 0.28, 0.08)) {
        // Headroom at target position
        if (!this.checkPlayerCollision(targetPos.x, elevatedY, targetPos.z, 0.28, 0.08)) {
          // Probe down from elevatedY to find the surface of the step
          let stepLandedY = elevatedY;
          while (stepLandedY > this.playerPos.y && !this.checkPlayerCollision(targetPos.x, stepLandedY - 0.05, targetPos.z, 0.28, 0.01)) {
            stepLandedY -= 0.05;
          }

          if (stepLandedY > this.playerPos.y) {
            this.playerPos[axis] = targetPos[axis];
            this.playerPos.y = stepLandedY;
            this.playerVel.y = 0;
            this.isGrounded = true;
            return;
          }
        }
      }
    }

    // 3. Wall slide: advance smoothly towards wall without ever snapping backwards
    let step = deltaMove;
    for (let i = 0; i < 4; i++) {
      step *= 0.5;
      const testPos = this.playerPos.clone();
      testPos[axis] += step;
      if (!this.checkPlayerCollision(testPos.x, testPos.y, testPos.z, 0.28, 0.08)) {
        this.playerPos[axis] = testPos[axis];
      }
    }
    this.playerVel[axis] = 0;
  }

  moveVerticalAxis(deltaMove) {
    if (Math.abs(deltaMove) < 0.000001) return;

    if (deltaMove > 0) {
      // Moving UP (Jumping, Flight, Climbing Ladder)
      const targetY = this.playerPos.y + deltaMove;
      if (!this.checkPlayerCollision(this.playerPos.x, targetY, this.playerPos.z, 0.28, 0.001)) {
        this.playerPos.y = targetY;
      } else {
        // Head hit ceiling: clamp head right below ceiling block
        const headY = targetY + 0.18;
        const ceilBlockY = Math.floor(headY);
        this.playerPos.y = ceilBlockY - 0.18 - 0.001;
        this.playerVel.y = 0;
      }
    } else {
      // Moving DOWN (Gravity, Falling)
      const targetY = this.playerPos.y + deltaMove;
      if (!this.checkPlayerCollision(this.playerPos.x, targetY, this.playerPos.z, 0.28, 0.001)) {
        this.playerPos.y = targetY;
        this.isGrounded = false;
      } else {
        // Feet hit ground / floor: land cleanly on top of floor block
        const feetY = targetY - 1.62;
        const floorBlockY = Math.floor(feetY);
        this.playerPos.y = (floorBlockY + 1) + 1.62;
        this.playerVel.y = 0;
        this.isGrounded = true;
      }
    }
  }

  resolveCollision(axis, deltaMove) {
    if (axis === 'y') {
      this.moveVerticalAxis(deltaMove);
    } else {
      this.moveHorizontalAxis(axis, deltaMove);
    }
  }

  // =========================================================================
  // SURVIVAL RULES: HEALTH, HUNGER, DROWNING & DAMAGE
  // =========================================================================
  updateSurvivalRules(delta) {
    if (this.gameMode === 'creative' || this.isDead) return;

    // 1. DROWNING
    const isUnderwater = this.playerPos.y < 13.8;
    const bubblesWrap = document.getElementById('bubbles-container');

    if (isUnderwater) {
      if (bubblesWrap) bubblesWrap.classList.add('active');
      this.drownTimer += delta;
      if (this.drownTimer >= 1.5) {
        this.drownTimer = 0;
        this.oxygen = Math.max(0, this.oxygen - 1);
        this.updateBubblesUI();

        if (this.oxygen <= 0) {
          this.damagePlayer(2, 'Drowning');
          if (window.mcAudio) window.mcAudio.playWaterSplash();
        }
      }
    } else {
      if (bubblesWrap) bubblesWrap.classList.remove('active');
      this.oxygen = 10;
      this.drownTimer = 0;
      this.updateBubblesUI();
    }

    // 2. NATURAL REGENERATION (Hunger >= 18)
    if (this.gameRules.naturalRegeneration && this.hunger >= 18 && this.health < this.maxHealth) {
      this.regenTimer += delta;
      if (this.regenTimer >= 3.0) {
        this.regenTimer = 0;
        this.health = Math.min(this.maxHealth, this.health + 1);
        this.hunger = Math.max(0, this.hunger - 0.5);
        this.updateHeartsUI();
        this.updateHungerUI();
      }
    }

    // 3. STARVATION (Hunger == 0)
    if (this.hunger <= 0) {
      this.starveTimer += delta;
      if (this.starveTimer >= 2.8) {
        this.starveTimer = 0;
        // In Hard / Hardcore starvation can kill! In Normal stops at 1 HP.
        const minHealth = (this.gameRules.difficulty === 'Hard' || this.gameMode === 'hardcore') ? 0 : 2;
        if (this.health > minHealth) {
          this.damagePlayer(1, 'Starvation');
        }
      }
    }

    // Peaceful mode rapid health restoration
    if (this.gameRules.difficulty === 'Peaceful') {
      this.hunger = 20;
      if (this.health < this.maxHealth) {
        this.health = Math.min(this.maxHealth, this.health + delta * 2);
        this.updateHeartsUI();
        this.updateHungerUI();
      }
    }
  }

  damagePlayer(amount, reason = 'Damage') {
    if (this.gameMode === 'creative' || this.isDead) return;

    this.health = Math.max(0, this.health - amount);
    this.updateHeartsUI();

    // Damage flash vignette & Steve "OOF!" sound
    const flashEl = document.getElementById('damage-flash');
    if (flashEl) {
      flashEl.classList.add('flash');
      clearTimeout(this.flashTimer);
      this.flashTimer = setTimeout(() => flashEl.classList.remove('flash'), 240);
    }

    if (window.mcAudio) window.mcAudio.playHurt();

    // Camera tilt recoil
    this.playerPitch += 0.08;

    if (this.health <= 0) {
      this.triggerDeath(reason);
    }
  }

  triggerDeath(reason) {
    this.isDead = true;
    document.exitPointerLock();

    const deathModal = document.getElementById('death-modal');
    const titleEl = document.getElementById('death-title');
    const scoreEl = document.getElementById('death-score');
    const respawnBtn = document.getElementById('btn-respawn');

    if (deathModal) deathModal.classList.add('active');

    if (this.gameMode === 'hardcore') {
      if (titleEl) titleEl.innerText = "Game Over!";
      if (scoreEl) scoreEl.innerText = `You died in Hardcore mode! (${reason})`;
      if (respawnBtn) {
        respawnBtn.innerText = "Spectate World";
        respawnBtn.onclick = () => {
          this.gameMode = 'creative';
          this.isFlying = true;
          this.isDead = false;
          deathModal.classList.remove('active');
          this.canvas.requestPointerLock();
        };
      }
    } else {
      if (titleEl) titleEl.innerText = "You Died!";
      if (scoreEl) scoreEl.innerText = `Killed by ${reason}. Score: ${this.xpLevel * 10}`;
      if (respawnBtn) {
        respawnBtn.innerText = "Respawn";
        respawnBtn.onclick = () => this.respawn();
      }
    }
  }

  respawn() {
    this.health = this.maxHealth;
    this.hunger = 20;
    this.oxygen = 10;
    this.isDead = false;
    this.playerPos.set(0.5, 24, 0.5);
    this.playerVel.set(0, 0, 0);

    const deathModal = document.getElementById('death-modal');
    if (deathModal) deathModal.classList.remove('active');

    this.updateHeartsUI();
    this.updateHungerUI();
    this.canvas.requestPointerLock();
  }

  // =========================================================================
  // CAMERA SYNC
  // =========================================================================
  updateCamera() {
    const eyePos = this.playerPos.clone();

    if (this.character.cameraMode === 0) {
      // 1st Person
      this.camera.position.copy(eyePos);
      this.camera.rotation.set(this.playerPitch, this.playerYaw, 0, 'YXZ');
    } else if (this.character.cameraMode === 1) {
      // 3rd Person Back
      const dist = 4.2;
      const camOffset = new THREE.Vector3(0, 0, dist);
      camOffset.applyEuler(new THREE.Euler(this.playerPitch * 0.7, this.playerYaw, 0, 'YXZ'));
      this.camera.position.copy(eyePos).add(camOffset);
      this.camera.lookAt(eyePos.clone().add(new THREE.Vector3(0, 0.2, 0)));
    } else if (this.character.cameraMode === 2) {
      // 3rd Person Front (Selfie)
      const dist = 3.6;
      const camOffset = new THREE.Vector3(0, 0, -dist);
      camOffset.applyEuler(new THREE.Euler(this.playerPitch * 0.7, this.playerYaw, 0, 'YXZ'));
      this.camera.position.copy(eyePos).add(camOffset);
      this.camera.lookAt(eyePos);
    }
  }

  // =========================================================================
  // DAY / NIGHT CELESTIAL CYCLE
  // =========================================================================
  updateDayNightCycle(delta) {
    if (!this.gameRules.doDaylightCycle) return;

    this.worldTime = (this.worldTime + delta * 20 * this.timeScale) % 24000;
    const progress = this.worldTime / 24000;
    const angle = progress * Math.PI * 2;

    this.celestialGroup.rotation.z = angle;
    const sunElevation = Math.sin(angle);

    if (sunElevation > 0.2) {
      // Day
      this.scene.background.lerp(this.skyColorDay, 0.05);
      this.scene.fog.color.lerp(this.skyColorDay, 0.05);
      this.ambientLight.intensity = THREE.MathUtils.lerp(this.ambientLight.intensity, 0.75, 0.05);
      this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, 0.95, 0.05);
    } else if (sunElevation > -0.2) {
      // Sunset / Sunrise
      this.scene.background.lerp(this.skyColorSunset, 0.05);
      this.scene.fog.color.lerp(this.skyColorSunset, 0.05);
      this.ambientLight.intensity = THREE.MathUtils.lerp(this.ambientLight.intensity, 0.45, 0.05);
    } else {
      // Night
      this.scene.background.lerp(this.skyColorNight, 0.05);
      this.scene.fog.color.lerp(this.skyColorNight, 0.05);
      this.ambientLight.intensity = THREE.MathUtils.lerp(this.ambientLight.intensity, 0.22, 0.05);
      this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, 0.12, 0.05);
    }
  }

  // =========================================================================
  // UI, MENUS & HUD
  // =========================================================================
  initUI() {
    this.renderHotbarUI();
    this.updateHeartsUI();
    this.updateHungerUI();
    this.updateBubblesUI();
    this.initInventoryUI();

    // 1. MAIN MENU (Start Screen)
    const btnSingleplayer = document.getElementById('btn-singleplayer');
    if (btnSingleplayer) {
      btnSingleplayer.addEventListener('click', () => {
        this.startPlaying();
      });
    }

    const btnOpenRules = document.getElementById('btn-open-rules');
    if (btnOpenRules) {
      btnOpenRules.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        this.openWorldCreationModal();
      });
    }

    const btnOpenOptions = document.getElementById('btn-open-options');
    if (btnOpenOptions) {
      btnOpenOptions.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        this.openOptionsModal();
      });
    }

    const btnCastleMenu = document.getElementById('btn-open-castle-menu');
    if (btnCastleMenu) {
      btnCastleMenu.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        this.toggleCastleMenu();
      });
    }

    // 2. WORLD CREATION & GAME RULES MODAL
    const btnGamemode = document.getElementById('btn-toggle-gamemode');
    if (btnGamemode) {
      const modes = ['survival', 'creative', 'hardcore', 'adventure'];
      const modeDescs = {
        survival: "Search for resources, craft tools, gain levels, health and hunger.",
        creative: "Unlimited resources, free flying, and destroy blocks instantly.",
        hardcore: "Same as Survival mode, locked at hardest difficulty, and one life only!",
        adventure: "Explore structures; blocks cannot be broken or placed without tools."
      };
      btnGamemode.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        const nextIdx = (modes.indexOf(this.gameMode) + 1) % modes.length;
        this.setGameMode(modes[nextIdx]);
        btnGamemode.innerText = `Game Mode: ${this.gameMode.charAt(0).toUpperCase() + this.gameMode.slice(1)}`;
        document.getElementById('gamemode-desc').innerText = modeDescs[this.gameMode];
      });
    }

    const btnDifficulty = document.getElementById('btn-toggle-difficulty');
    if (btnDifficulty) {
      const diffs = ['Peaceful', 'Easy', 'Normal', 'Hard'];
      btnDifficulty.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        const nextIdx = (diffs.indexOf(this.gameRules.difficulty) + 1) % diffs.length;
        this.gameRules.difficulty = diffs[nextIdx];
        btnDifficulty.innerText = `Difficulty: ${this.gameRules.difficulty}`;
      });
    }

    // Game Rule Toggles
    const ruleButtons = [
      { id: 'rule-daylight', key: 'doDaylightCycle', label: 'Daylight Cycle' },
      { id: 'rule-keepinventory', key: 'keepInventory', label: 'Keep Inventory' },
      { id: 'rule-regen', key: 'naturalRegeneration', label: 'Natural Regen' },
      { id: 'rule-mobs', key: 'doMobSpawning', label: 'Mob Spawning' },
      { id: 'rule-falldamage', key: 'fallDamage', label: 'Fall Damage' },
      { id: 'rule-ao', key: 'smoothLighting', label: 'Smooth Lighting' }
    ];

    ruleButtons.forEach(rb => {
      const el = document.getElementById(rb.id);
      if (el) {
        el.addEventListener('click', () => {
          if (window.mcAudio) window.mcAudio.playButtonClick();
          this.gameRules[rb.key] = !this.gameRules[rb.key];
          el.innerText = `${rb.label}: ${this.gameRules[rb.key] ? 'ON' : 'OFF'}`;
          el.classList.toggle('active', this.gameRules[rb.key]);

          if (rb.key === 'smoothLighting') {
            this.world.smoothLighting = this.gameRules.smoothLighting;
            this.world.chunkMeshes.forEach((_, key) => {
              const [cx, cz] = key.split(',').map(Number);
              this.world.rebuildChunk(cx, cz);
            });
          }
        });
      }
    });

    const btnCreateWorldConfirm = document.getElementById('btn-create-world-confirm');
    if (btnCreateWorldConfirm) {
      btnCreateWorldConfirm.addEventListener('click', () => {
        this.startPlaying();
      });
    }

    const btnCloseWorld = document.getElementById('btn-close-world-modal');
    if (btnCloseWorld) {
      btnCloseWorld.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        document.getElementById('world-modal').classList.remove('active');
      });
    }

    // 3. OPTIONS MODAL
    const fovSlider = document.getElementById('slider-fov');
    if (fovSlider) {
      fovSlider.addEventListener('input', e => {
        const val = parseInt(e.target.value);
        this.camera.fov = val;
        this.camera.updateProjectionMatrix();
        document.getElementById('label-fov').innerText = `FOV: ${val} ${val === 72 ? '(Normal)' : (val === 110 ? '(Quake Pro)' : '')}`;
      });
    }

    const masterVolSlider = document.getElementById('slider-master-volume');
    if (masterVolSlider) {
      masterVolSlider.addEventListener('input', e => {
        const val = parseInt(e.target.value) / 100;
        if (window.mcAudio && window.mcAudio.masterGain) {
          window.mcAudio.masterGain.gain.setValueAtTime(val, window.mcAudio.ctx.currentTime);
        }
        document.getElementById('label-master-volume').innerText = `Master Volume: ${e.target.value}%`;
      });
    }

    const musicVolSlider = document.getElementById('slider-music-volume');
    if (musicVolSlider) {
      musicVolSlider.addEventListener('input', e => {
        const val = parseInt(e.target.value) / 100;
        if (window.mcAudio && window.mcAudio.musicGain) {
          window.mcAudio.musicGain.gain.setValueAtTime(val, window.mcAudio.ctx.currentTime);
        }
        document.getElementById('label-music-volume').innerText = `Music Volume: ${e.target.value}%`;
      });
    }

    const btnCloseOptions = document.getElementById('btn-close-options');
    if (btnCloseOptions) {
      btnCloseOptions.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        document.getElementById('options-modal').classList.remove('active');
      });
    }

    // 4. PAUSE MENU (Game Menu)
    const btnResume = document.getElementById('btn-resume-game');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        this.togglePauseMenu(false);
        this.canvas.requestPointerLock();
      });
    }

    const btnQuickSwitch = document.getElementById('btn-quick-switch-mode');
    if (btnQuickSwitch) {
      btnQuickSwitch.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        const nextMode = this.gameMode === 'survival' ? 'creative' : 'survival';
        this.setGameMode(nextMode);
        btnQuickSwitch.innerText = `Mode: ${nextMode.charAt(0).toUpperCase() + nextMode.slice(1)}`;
      });
    }

    const btnPauseOptions = document.getElementById('btn-pause-options');
    if (btnPauseOptions) {
      btnPauseOptions.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        this.openOptionsModal();
      });
    }

    const btnPauseCastle = document.getElementById('btn-pause-castle');
    if (btnPauseCastle) {
      btnPauseCastle.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        this.togglePauseMenu(false);
        this.toggleCastleMenu();
      });
    }

    const btnQuitTitle = document.getElementById('btn-quit-to-title');
    if (btnQuitTitle) {
      btnQuitTitle.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        this.togglePauseMenu(false);
        document.getElementById('start-screen').classList.remove('hidden');
      });
    }

    // 5. DEATH BUTTONS
    const btnDeathTitle = document.getElementById('btn-death-title');
    if (btnDeathTitle) {
      btnDeathTitle.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        document.getElementById('death-modal').classList.remove('active');
        document.getElementById('start-screen').classList.remove('hidden');
      });
    }

    // 6. CASTLE BLUEPRINTS
    const btnCastle = document.getElementById('btn-build-castle');
    if (btnCastle) {
      btnCastle.addEventListener('click', () => {
        const px = Math.floor(this.playerPos.x);
        const py = Math.floor(this.playerPos.y - 1);
        const pz = Math.floor(this.playerPos.z - 18);
        this.castleArchitect.buildCompleteCastle(px, py, pz);
        this.toggleCastleMenu();
        this.showPopupNotice("GRAND CASTLE BUILT!");
        this.triggerAdvancement("Architectural Master", "Construct a grand medieval fortress");
      });
    }

    const btnTower = document.getElementById('btn-build-tower');
    if (btnTower) {
      btnTower.addEventListener('click', () => {
        const px = Math.floor(this.playerPos.x + 6);
        const py = Math.floor(this.playerPos.y - 1);
        const pz = Math.floor(this.playerPos.z);
        this.castleArchitect.buildWatchtower(px, py, pz, 14, 3);
        this.toggleCastleMenu();
        this.showPopupNotice("WATCHTOWER CONSTRUCTED!");
      });
    }

    const btnThrone = document.getElementById('btn-build-throne');
    if (btnThrone) {
      btnThrone.addEventListener('click', () => {
        const px = Math.floor(this.playerPos.x - 6);
        const py = Math.floor(this.playerPos.y - 1);
        const pz = Math.floor(this.playerPos.z - 10);
        this.castleArchitect.buildThroneRoom(px, py, pz, 12, 16, 9);
        this.toggleCastleMenu();
        this.showPopupNotice("ROYAL THRONE HALL ERECTED!");
      });
    }
  }

  setGameMode(mode) {
    this.gameMode = mode;
    this.isFlying = (mode === 'creative');
    if (mode === 'hardcore') {
      this.gameRules.difficulty = 'Hard';
    }
    this.updateHeartsUI();
    this.showPopupNotice(`GAME MODE: ${mode.toUpperCase()}`);
  }

  startPlaying() {
    if (window.mcAudio) {
      window.mcAudio.playButtonClick();
      window.mcAudio.init();
    }
    const worldModal = document.getElementById('world-modal');
    if (worldModal) worldModal.classList.remove('active');
    document.getElementById('start-screen').classList.add('hidden');
    this.canvas.requestPointerLock();
    this.triggerAdvancement("Getting Wood", "Punch trees and build your realm");
  }

  openWorldCreationModal() {
    document.getElementById('world-modal').classList.add('active');
  }

  openOptionsModal() {
    document.getElementById('options-modal').classList.add('active');
  }

  togglePauseMenu(forceOpen = null) {
    const modal = document.getElementById('pause-modal');
    if (!modal) return;
    const shouldOpen = forceOpen !== null ? forceOpen : !modal.classList.contains('active');
    modal.classList.toggle('active', shouldOpen);
    if (shouldOpen) {
      document.exitPointerLock();
    }
  }

  triggerAdvancement(title, desc) {
    if (window.mcAudio) window.mcAudio.playAdvancementChime();
    const toast = document.getElementById('advancement-toast');
    const nameEl = document.getElementById('advancement-title');
    if (toast && nameEl) {
      nameEl.innerText = title;
      toast.classList.add('show');
      clearTimeout(this.advancementTimer);
      this.advancementTimer = setTimeout(() => toast.classList.remove('show'), 4200);
    }
  }

  selectHotbarSlot(index) {
    this.activeHotbarSlot = index;
    this.renderHotbarUI();
    this.updateActiveItem();

    const item = this.hotbar[index];
    if (item && item.id > 0) {
      const bDef = window.BLOCKS[item.id];
      if (bDef) this.showItemLabel(bDef.name);
    }
  }

  updateActiveItem() {
    const item = this.hotbar[this.activeHotbarSlot];
    const bId = item ? item.id : 0;
    this.character.updateHeldItem(bId);
  }

  renderHotbarUI() {
    const slots = document.querySelectorAll('.hotbar-slot');
    slots.forEach((slot, idx) => {
      slot.classList.toggle('selected', idx === this.activeHotbarSlot);

      const item = this.hotbar[idx];
      const iconCanvas = slot.querySelector('canvas');
      const countEl = slot.querySelector('.slot-count');

      if (iconCanvas) {
        const ctx = iconCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 36, 36);

        if (item && item.id > 0) {
          const bDef = window.BLOCKS[item.id];
          const texName = bDef ? (bDef.textures.all || bDef.textures.top || 'stone') : 'stone';
          const sourceCanvas = window.mcTextures.getCanvas(texName);
          ctx.drawImage(sourceCanvas, 0, 0, 36, 36);
          if (countEl) countEl.innerText = item.count > 1 ? item.count : '';
        } else {
          if (countEl) countEl.innerText = '';
        }
      }
    });
  }

  updateHeartsUI() {
    const container = document.getElementById('hearts-container');
    if (!container) return;
    container.innerHTML = '';

    const isHardcore = (this.gameMode === 'hardcore');
    const fullHearts = Math.floor(this.health / 2);
    const hasHalfHeart = (this.health % 2 === 1);

    for (let i = 0; i < 10; i++) {
      const h = document.createElement('div');
      if (i < fullHearts) {
        h.className = `heart ${isHardcore ? 'hardcore-full' : 'full'}`;
      } else if (i === fullHearts && hasHalfHeart) {
        h.className = 'heart half';
      } else {
        h.className = 'heart empty';
      }
      container.appendChild(h);
    }
  }

  updateHungerUI() {
    const container = document.getElementById('hunger-container');
    if (!container) return;
    container.innerHTML = '';

    const fullDrumsticks = Math.floor(this.hunger / 2);
    for (let i = 0; i < 10; i++) {
      const d = document.createElement('div');
      d.className = `drumstick ${i < fullDrumsticks ? 'full' : 'empty'}`;
      container.appendChild(d);
    }
  }

  updateBubblesUI() {
    const container = document.getElementById('bubbles-container');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 10; i++) {
      const b = document.createElement('div');
      b.className = `bubble-icon ${i < this.oxygen ? 'full' : 'empty'}`;
      container.appendChild(b);
    }
  }

  showItemLabel(name) {
    const el = document.getElementById('hotbar-item-name');
    if (el) {
      el.innerText = name;
      el.classList.add('show');
      clearTimeout(this.labelTimer);
      this.labelTimer = setTimeout(() => el.classList.remove('show'), 2000);
    }
  }

  showPopupNotice(msg) {
    const el = document.getElementById('popup-notice');
    if (el) {
      el.innerText = msg;
      el.classList.add('show');
      clearTimeout(this.noticeTimer);
      this.noticeTimer = setTimeout(() => el.classList.remove('show'), 2500);
    }
  }

  toggleInventory() {
    const modal = document.getElementById('inventory-modal');
    if (modal) {
      const isOpen = modal.classList.toggle('active');
      if (isOpen) {
        document.exitPointerLock();
        this.renderInventoryUI();
      } else {
        this.canvas.requestPointerLock();
      }
    }
  }

  initInventoryUI() {
    const tabBtns = document.querySelectorAll('.catalog-filter-tabs .tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.catalogFilter = btn.dataset.filter || 'all';
        this.renderCatalogGrid();
      });
    });
  }

  renderInventoryUI() {
    this.renderMainInventoryGrid();
    this.renderInventoryHotbarStrip();
    this.renderCatalogGrid();
  }

  renderMainInventoryGrid() {
    const grid = document.getElementById('inventory-grid-slots');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < 27; i++) {
      const item = this.inventory[i] || { id: 0, count: 0 };
      const slot = document.createElement('div');
      slot.className = 'grid-slot';
      slot.dataset.index = i;

      if (item.id > 0) {
        const bDef = window.BLOCKS[item.id];
        const name = bDef ? bDef.name : 'Unknown';
        slot.title = `${name} (${item.count})`;

        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const texName = bDef ? (bDef.textures.all || bDef.textures.top || 'stone') : 'stone';
        const sourceCanvas = window.mcTextures.getCanvas(texName);
        ctx.drawImage(sourceCanvas, 0, 0, 32, 32);
        slot.appendChild(canvas);

        if (item.count > 1) {
          const countSpan = document.createElement('span');
          countSpan.className = 'slot-count';
          countSpan.innerText = item.count;
          slot.appendChild(countSpan);
        }
      }

      slot.addEventListener('click', () => {
        if (item.id > 0) {
          if (window.mcAudio) window.mcAudio.playButtonClick();
          this.hotbar[this.activeHotbarSlot] = { id: item.id, count: item.count || 64 };
          this.renderHotbarUI();
          this.updateActiveItem();
          this.renderInventoryHotbarStrip();
          const bDef = window.BLOCKS[item.id];
          this.showPopupNotice(`EQUIPPED ${bDef.name.toUpperCase()} TO SLOT ${this.activeHotbarSlot + 1}`);
        }
      });

      grid.appendChild(slot);
    }
  }

  renderInventoryHotbarStrip() {
    const strip = document.getElementById('inventory-hotbar-slots');
    if (!strip) return;
    strip.innerHTML = '';

    for (let i = 0; i < 9; i++) {
      const item = this.hotbar[i] || { id: 0, count: 0 };
      const slot = document.createElement('div');
      slot.className = `grid-slot ${i === this.activeHotbarSlot ? 'selected' : ''}`;
      slot.dataset.index = i;

      if (item.id > 0) {
        const bDef = window.BLOCKS[item.id];
        const name = bDef ? bDef.name : 'Unknown';
        slot.title = `Slot ${i + 1}: ${name} (${item.count})`;

        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const texName = bDef ? (bDef.textures.all || bDef.textures.top || 'stone') : 'stone';
        const sourceCanvas = window.mcTextures.getCanvas(texName);
        ctx.drawImage(sourceCanvas, 0, 0, 32, 32);
        slot.appendChild(canvas);

        if (item.count > 1) {
          const countSpan = document.createElement('span');
          countSpan.className = 'slot-count';
          countSpan.innerText = item.count;
          slot.appendChild(countSpan);
        }
      }

      slot.addEventListener('click', () => {
        this.selectHotbarSlot(i);
        this.renderInventoryHotbarStrip();
      });

      strip.appendChild(slot);
    }
  }

  renderCatalogGrid() {
    const catalog = document.getElementById('catalog-grid-slots');
    if (!catalog) return;
    catalog.innerHTML = '';

    const filter = this.catalogFilter || 'all';
    const allIds = Object.keys(window.BLOCKS).map(Number).filter(id => id > 0);

    const filteredIds = allIds.filter(id => {
      const def = window.BLOCKS[id];
      if (!def) return false;
      if (filter === 'all') return true;
      if (filter === 'building') return (def.solid || def.ladder) && !def.itemOnly && !def.name.includes('Wool') && !def.door && !def.bed && !def.chair && !def.desk && !def.campfire && !def.fireplace;
      if (filter === 'furniture') return def.door || def.bed || def.chair || def.desk || def.campfire || def.fireplace || [20, 21, 22, 23, 46, 50, 56, 59].includes(def.id);
      if (filter === 'tools') return def.tool || def.weapon;
      if (filter === 'food') return def.food;
      if (filter === 'wool') return def.name.includes('Wool');
      return true;
    });

    filteredIds.forEach(id => {
      const bDef = window.BLOCKS[id];
      const slot = document.createElement('div');
      slot.className = 'grid-slot';
      slot.title = `${bDef.name} (Click for 64x)`;

      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const texName = bDef.textures.all || bDef.textures.top || 'stone';
      const sourceCanvas = window.mcTextures.getCanvas(texName);
      ctx.drawImage(sourceCanvas, 0, 0, 32, 32);
      slot.appendChild(canvas);

      slot.addEventListener('click', () => {
        if (window.mcAudio) window.mcAudio.playButtonClick();
        const stackCount = (bDef.tool || bDef.weapon) ? 1 : 64;
        this.hotbar[this.activeHotbarSlot] = { id: id, count: stackCount };
        this.renderHotbarUI();
        this.updateActiveItem();
        this.renderInventoryHotbarStrip();
        this.showPopupNotice(`GRABBED 64x ${bDef.name.toUpperCase()}`);
      });

      catalog.appendChild(slot);
    });
  }

  toggleCastleMenu() {
    const modal = document.getElementById('castle-modal');
    if (modal) {
      const isOpen = modal.classList.toggle('active');
      if (isOpen) document.exitPointerLock();
      else this.canvas.requestPointerLock();
    }
  }

  toggleDebugScreen() {
    const screen = document.getElementById('debug-screen');
    if (screen) screen.classList.toggle('active');
  }

  updateDebugInfo() {
    const el = document.getElementById('debug-info-text');
    if (!el || !document.getElementById('debug-screen').classList.contains('active')) return;

    const x = this.playerPos.x.toFixed(2);
    const y = this.playerPos.y.toFixed(2);
    const z = this.playerPos.z.toFixed(2);
    const chunkX = Math.floor(this.playerPos.x / 16);
    const chunkZ = Math.floor(this.playerPos.z / 16);

    el.innerHTML = `
      Minecraft Web 1.20 (WebGL)<br>
      XYZ: ${x} / ${y} / ${z}<br>
      Chunk: [${chunkX}, ${chunkZ}]<br>
      Mode: ${this.gameMode.toUpperCase()} | Diff: ${this.gameRules.difficulty}<br>
      Flying: ${this.isFlying ? 'Yes' : 'No'} | Grounded: ${this.isGrounded ? 'Yes' : 'No'}<br>
      Wild Animals: ${this.animalManager ? this.animalManager.animals.length : 0}<br>
      Active Slot: [${this.activeHotbarSlot + 1}] ${window.BLOCKS[this.hotbar[this.activeHotbarSlot]?.id]?.name || ''}
    `;
  }

  // =========================================================================
  // MAIN GAME LOOP
  // =========================================================================
  startLoop() {
    const loop = () => {
      requestAnimationFrame(loop);
      const delta = Math.min(this.clock.getDelta(), 0.1);

      this.update(delta);
      this.render();
    };
    loop();
  }

  update(delta) {
    // 1. Player Physics & Collisions
    this.updatePlayerPhysics(delta);

    // 2. Camera Positioning
    this.updateCamera();

    // 3. Voxel Raycasting & Block Highlight Box
    const hit = this.getRaycastHit();
    if (hit && this.world.highlightBox) {
      this.world.highlightBox.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);
      this.world.highlightBox.visible = true;
    } else if (this.world.highlightBox) {
      this.world.highlightBox.visible = false;
    }

    // 4. Mining Progress
    this.updateMining(delta);

    // 5. Character Animation
    const isMoving = this.keys['KeyW'] || this.keys['KeyS'] || this.keys['KeyA'] || this.keys['KeyD'];
    this.character.update(delta, this.playerPos, this.playerYaw, this.playerPitch, isMoving, this.isSprinting);

    // 6. Wild Animals Simulation (Sheep, Cows, Pigs, Chickens)
    if (this.animalManager) {
      this.animalManager.update(delta, this.playerPos);
    }

    // 7. World Particles, Floating Item Drops & Day/Night Cycle
    this.world.update(delta, this.playerPos, blockId => this.collectItem(blockId));
    this.updateDayNightCycle(delta);

    // 8. Survival Rules (Hunger, Health Regen, Drowning)
    this.updateSurvivalRules(delta);

    // 9. Debug Info
    this.updateDebugInfo();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

window.MinecraftGame = MinecraftGame;
