/**
 * Minecraft Web Edition - Procedural 16x16 Pixel Texture Atlas Generator
 * Generates genuine 16x16 pixel-art canvas textures for all Minecraft blocks
 * using Three.js NearestFilter to maintain crisp, authentic voxel graphics.
 */

class MinecraftTextures {
  constructor() {
    this.canvasCache = {};
    this.textureCache = {};
    this.initPalette();
  }

  initPalette() {
    // Authentic Minecraft 16-color base palettes
    this.palettes = {
      grassTop: ['#5b8e32', '#4c7828', '#6ea83d', '#3f6620', '#56862f'],
      dirt: ['#866043', '#724f35', '#68462b', '#9b7151', '#5a3d25'],
      stone: ['#797979', '#686868', '#8a8a8a', '#5a5a5a', '#959595'],
      cobble: ['#636363', '#525252', '#7a7a7a', '#444444', '#8c8c8c'],
      stoneBrick: ['#7c7c7c', '#6d6d6d', '#8e8e8e', '#555555', '#484848'],
      mossyBrick: ['#7c7c7c', '#6d6d6d', '#8e8e8e', '#4f7d32', '#3d6326'],
      crackedBrick: ['#7c7c7c', '#6d6d6d', '#8e8e8e', '#3c3c3c', '#2c2c2c'],
      chiseledBrick: ['#7c7c7c', '#656565', '#8a8a8a', '#4c4c4c', '#9c9c9c'],
      planks: ['#a07844', '#8e6939', '#b3884f', '#7a5a2e', '#c1965a'],
      oakBark: ['#685233', '#554228', '#7b623f', '#44341e', '#886d47'],
      oakRings: ['#a98651', '#987544', '#856436', '#685233', '#bf9a60'],
      leaves: ['#386a24', '#2c551c', '#467f2e', '#1f3e13', '#539537'],
      sand: ['#ded59f', '#d2c88f', '#e6ddae', '#c5bb7f', '#eee5be'],
      water: ['#2e5299', '#244380', '#3b65b5', '#1e386e', '#4c78cc'],
      glass: ['#ffffff', '#e8f4f8', '#c2e2ec', '#a0d1e1'],
      bricks: ['#9b3e32', '#863428', '#b04b3e', '#d8d0c5', '#712b21'],
      ironBlock: ['#dedede', '#cccccc', '#efefef', '#b8b8b8', '#999999'],
      goldBlock: ['#fcee4b', '#e6cf2c', '#fff575', '#c7a918', '#9f8510'],
      diamondBlock: ['#62e3d8', '#42b5ac', '#8df5ed', '#2ea098', '#1e8078'],
      obsidian: ['#19132b', '#100c1e', '#2b1b48', '#38255e', '#0b0814'],
      glowstone: ['#ffb732', '#e59d20', '#ffd266', '#c97e10', '#fff0aa'],
      bookshelf: ['#a07844', '#8e6939', '#8a2b25', '#245a88', '#347a38'],
      redWool: ['#9f2824', '#85211d', '#b8332e', '#701915', '#cb423d']
    };
  }

  // Create a 16x16 HTML5 Canvas with raw pixel data
  createPixelCanvas(drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx);
    return canvas;
  }

  // Convert canvas to Three.js texture with NearestFilter (crisp pixel art!)
  toThreeTexture(canvas) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    return tex;
  }

  getTexture(type) {
    if (this.textureCache[type]) return this.textureCache[type];
    const canvas = this.getCanvas(type);
    const tex = this.toThreeTexture(canvas);
    this.textureCache[type] = tex;
    return tex;
  }

  getCanvas(type) {
    if (this.canvasCache[type]) return this.canvasCache[type];

    let canvas;
    switch (type) {
      case 'grass_top':
        canvas = this.createGrassTopCanvas();
        break;
      case 'grass_side':
        canvas = this.createGrassSideCanvas();
        break;
      case 'dirt':
        canvas = this.createDirtCanvas();
        break;
      case 'stone':
        canvas = this.createStoneCanvas();
        break;
      case 'cobblestone':
        canvas = this.createCobbleCanvas();
        break;
      case 'stone_bricks':
        canvas = this.createStoneBrickCanvas();
        break;
      case 'mossy_stone_bricks':
        canvas = this.createMossyBrickCanvas();
        break;
      case 'cracked_stone_bricks':
        canvas = this.createCrackedBrickCanvas();
        break;
      case 'chiseled_stone_bricks':
        canvas = this.createChiseledBrickCanvas();
        break;
      case 'oak_planks':
        canvas = this.createPlanksCanvas();
        break;
      case 'oak_log_side':
        canvas = this.createOakLogSideCanvas();
        break;
      case 'oak_log_top':
        canvas = this.createOakLogTopCanvas();
        break;
      case 'oak_leaves':
        canvas = this.createLeavesCanvas();
        break;
      case 'sand':
        canvas = this.createSandCanvas();
        break;
      case 'water':
        canvas = this.createWaterCanvas();
        break;
      case 'glass':
        canvas = this.createGlassCanvas();
        break;
      case 'bricks':
        canvas = this.createBricksCanvas();
        break;
      case 'iron_block':
        canvas = this.createBeveledBlockCanvas(this.palettes.ironBlock);
        break;
      case 'gold_block':
        canvas = this.createBeveledBlockCanvas(this.palettes.goldBlock);
        break;
      case 'diamond_block':
        canvas = this.createBeveledBlockCanvas(this.palettes.diamondBlock);
        break;
      case 'obsidian':
        canvas = this.createObsidianCanvas();
        break;
      case 'glowstone':
        canvas = this.createGlowstoneCanvas();
        break;
      case 'apple':
        canvas = this.createAppleCanvas();
        break;
      case 'bread':
        canvas = this.createBreadCanvas();
        break;
      case 'cooked_porkchop':
        canvas = this.createPorkchopCanvas();
        break;
      case 'diamond_sword':
        canvas = this.createDiamondSwordCanvas();
        break;
      case 'iron_pickaxe':
        canvas = this.createIronPickaxeCanvas();
        break;
      case 'zombie_skin':
        canvas = this.createZombieSkinCanvas();
        break;
      case 'zombie_head_top':
        canvas = this.createZombieHeadTopCanvas();
        break;
      case 'zombie_head_side':
        canvas = this.createZombieHeadSideCanvas();
        break;
      case 'sheep_face':
        canvas = this.createSheepFaceCanvas();
        break;
      case 'cow_face':
        canvas = this.createCowFaceCanvas();
        break;
      case 'pig_face':
        canvas = this.createPigFaceCanvas();
        break;
      case 'chicken_face':
        canvas = this.createChickenFaceCanvas();
        break;
      case 'white_wool':
        canvas = this.createWhiteWoolCanvas();
        break;
      case 'raw_beef':
        canvas = this.createRawBeefCanvas();
        break;
      case 'raw_mutton':
        canvas = this.createRawMuttonCanvas();
        break;
      case 'feather':
        canvas = this.createFeatherCanvas();
        break;
      case 'creeper_skin':
        canvas = this.createCreeperSkinCanvas();
        break;
      case 'dirt_bg':
        canvas = this.createDirtBgCanvas();
        break;
      case 'crafting_table_top':
        canvas = this.createCraftingTableTopCanvas();
        break;
      case 'crafting_table_side':
        canvas = this.createCraftingTableSideCanvas();
        break;
      case 'furnace_front':
        canvas = this.createFurnaceFrontCanvas(false);
        break;
      case 'furnace_front_lit':
        canvas = this.createFurnaceFrontCanvas(true);
        break;
      case 'bookshelf':
        canvas = this.createBookshelfCanvas();
        break;
      case 'red_wool':
        canvas = this.createWoolCanvas(this.palettes.redWool);
        break;
      case 'diamond_pickaxe':
        canvas = this.createDiamondPickaxeCanvas();
        break;
      case 'diamond_axe':
        canvas = this.createDiamondAxeCanvas();
        break;
      case 'diamond_shovel':
        canvas = this.createDiamondShovelCanvas();
        break;
      case 'bow':
        canvas = this.createBowCanvas();
        break;
      case 'arrow':
        canvas = this.createArrowCanvas();
        break;
      case 'golden_apple':
        canvas = this.createGoldenAppleCanvas();
        break;
      case 'cooked_beef':
        canvas = this.createCookedBeefCanvas();
        break;
      case 'carrot':
        canvas = this.createCarrotCanvas();
        break;
      case 'birch_planks':
        canvas = this.createBirchPlanksCanvas();
        break;
      case 'spruce_planks':
        canvas = this.createSprucePlanksCanvas();
        break;
      case 'sandstone_top':
      case 'sandstone_bottom':
        canvas = this.createSandstoneTopCanvas();
        break;
      case 'sandstone_side':
        canvas = this.createSandstoneSideCanvas();
        break;
      case 'smooth_stone':
        canvas = this.createSmoothStoneCanvas();
        break;
      case 'torch':
        canvas = this.createTorchCanvas();
        break;
      case 'emerald_block':
        canvas = this.createEmeraldBlockCanvas();
        break;
      case 'lapis_block':
        canvas = this.createLapisBlockCanvas();
        break;
      case 'netherrack':
        canvas = this.createNetherrackCanvas();
        break;
      case 'sea_lantern':
        canvas = this.createSeaLanternCanvas();
        break;
      case 'yellow_wool':
        canvas = this.createWoolCanvas(['#f0d43a', '#d9bd29', '#ffea59', '#b59c18']);
        break;
      case 'blue_wool':
        canvas = this.createWoolCanvas(['#2c3ea0', '#212f80', '#3b50bd', '#162261']);
        break;
      case 'green_wool':
        canvas = this.createWoolCanvas(['#4a7223', '#395719', '#5b8c2d', '#283d10']);
        break;
      case 'purple_wool':
        canvas = this.createWoolCanvas(['#782ca0', '#5e2180', '#923bbd', '#441661']);
        break;
      case 'black_wool':
        canvas = this.createWoolCanvas(['#191919', '#111111', '#282828', '#090909']);
        break;
      case 'chest_top':
        canvas = this.createChestTopCanvas();
        break;
      case 'chest_side':
        canvas = this.createChestSideCanvas();
        break;
      case 'water_bucket':
        canvas = this.createBucketCanvas('#2e5299');
        break;
      case 'lava_bucket':
        canvas = this.createBucketCanvas('#e85b17');
        break;
      case 'ladder':
        canvas = this.createLadderCanvas();
        break;
      case 'door_top':
        canvas = this.createDoorTopCanvas();
        break;
      case 'door_bottom':
        canvas = this.createDoorBottomCanvas();
        break;
      case 'door_side':
        canvas = this.createDoorSideCanvas();
        break;
      case 'bed_top':
        canvas = this.createBedTopCanvas();
        break;
      case 'bed_side':
        canvas = this.createBedSideCanvas();
        break;
      case 'campfire':
      case 'campfire_side':
        canvas = this.createCampfireCanvas();
        break;
      case 'campfire_top':
        canvas = this.createCampfireTopCanvas();
        break;
      case 'chair_top':
        canvas = this.createChairTopCanvas();
        break;
      case 'chair_side':
        canvas = this.createChairSideCanvas();
        break;
      case 'desk_top':
        canvas = this.createDeskTopCanvas();
        break;
      case 'desk_side':
        canvas = this.createDeskSideCanvas();
        break;
      case 'fireplace_front':
        canvas = this.createFireplaceFrontCanvas();
        break;
      default:
        canvas = this.createStoneCanvas();
    }

    this.canvasCache[type] = canvas;
    return canvas;
  }

  // --- 1. Grass Top ---
  createGrassTopCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.grassTop;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const rand = Math.floor(Math.random() * colors.length);
          ctx.fillStyle = colors[rand];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // --- 2. Grass Side (Dirt with hanging green blades) ---
  createGrassSideCanvas() {
    return this.createPixelCanvas(ctx => {
      const dirtColors = this.palettes.dirt;
      const grassColors = this.palettes.grassTop;

      // Fill base dirt
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = dirtColors[Math.floor(Math.random() * dirtColors.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Top grass fringe with hanging drops
      const fringeDepth = [2, 3, 4, 3, 2, 4, 3, 2, 3, 4, 2, 3, 4, 3, 2, 3];
      for (let x = 0; x < 16; x++) {
        const d = fringeDepth[x];
        for (let y = 0; y <= d; y++) {
          ctx.fillStyle = grassColors[Math.floor(Math.random() * grassColors.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // --- 3. Dirt ---
  createDirtCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.dirt;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // --- 4. Stone ---
  createStoneCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.stone;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // --- 5. Cobblestone ---
  createCobbleCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.cobble;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Mortar contours
      ctx.fillStyle = '#3a3a3a';
      const mortar = [
        [3, 0], [7, 0], [12, 0],
        [0, 4], [4, 4], [8, 4], [13, 4],
        [2, 8], [6, 8], [11, 8], [15, 8],
        [0, 12], [5, 12], [9, 12], [14, 12]
      ];
      mortar.forEach(([x, y]) => {
        ctx.fillRect(x, y, 2, 1);
        ctx.fillRect(x + 1, y + 1, 1, 2);
      });
    });
  }

  // --- 6. Stone Bricks (The Quintessential Castle Block!) ---
  createStoneBrickCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.stoneBrick;
      // 4 rows of bricks
      for (let row = 0; row < 4; row++) {
        const yStart = row * 4;
        const offset = (row % 2) * 4;
        for (let y = yStart; y < yStart + 3; y++) {
          for (let x = 0; x < 16; x++) {
            const brickIndex = Math.floor((x + offset) / 8);
            ctx.fillStyle = colors[(brickIndex + x + y) % 3];
            ctx.fillRect(x, y, 1, 1);
          }
        }
        // Horizontal mortar seam
        ctx.fillStyle = '#444444';
        ctx.fillRect(0, yStart + 3, 16, 1);
      }
      // Vertical mortar seams
      ctx.fillStyle = '#444444';
      ctx.fillRect(7, 0, 1, 3);
      ctx.fillRect(15, 0, 1, 3);
      ctx.fillRect(3, 4, 1, 3);
      ctx.fillRect(11, 4, 1, 3);
      ctx.fillRect(7, 8, 1, 3);
      ctx.fillRect(15, 8, 1, 3);
      ctx.fillRect(3, 12, 1, 3);
      ctx.fillRect(11, 12, 1, 3);
    });
  }

  // --- 7. Mossy Stone Bricks ---
  createMossyBrickCanvas() {
    const baseCanvas = this.createStoneBrickCanvas();
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(baseCanvas, 0, 0);

    // Green moss veins creeping along bricks
    const mossColors = this.palettes.mossyBrick.slice(3);
    const mossSpots = [
      [2, 3], [3, 3], [4, 3], [3, 2], [3, 4],
      [10, 7], [11, 7], [12, 7], [11, 6], [11, 8],
      [6, 11], [7, 11], [8, 11], [7, 12], [8, 12]
    ];
    mossSpots.forEach(([x, y]) => {
      ctx.fillStyle = mossColors[Math.floor(Math.random() * mossColors.length)];
      ctx.fillRect(x, y, 1, 1);
    });
    return canvas;
  }

  // --- 8. Cracked Stone Bricks ---
  createCrackedBrickCanvas() {
    const baseCanvas = this.createStoneBrickCanvas();
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(baseCanvas, 0, 0);

    // Dark jagged fissures
    ctx.fillStyle = '#222222';
    const cracks = [
      [2, 1], [3, 2], [3, 3], [4, 4], [4, 5], [5, 6],
      [10, 8], [9, 9], [9, 10], [10, 11], [11, 12]
    ];
    cracks.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
    return canvas;
  }

  // --- 9. Chiseled Stone Bricks (Royal Castle Crest Block) ---
  createChiseledBrickCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(0, 0, 16, 16);

      // Outer beveled frame
      ctx.fillStyle = '#8f8f8f';
      ctx.fillRect(1, 1, 14, 1);
      ctx.fillRect(1, 1, 1, 14);
      ctx.fillStyle = '#555555';
      ctx.fillRect(14, 1, 1, 14);
      ctx.fillRect(1, 14, 14, 1);

      // Inner engraved square
      ctx.fillStyle = '#444444';
      ctx.fillRect(3, 3, 10, 10);
      ctx.fillStyle = '#8f8f8f';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = '#555555';
      ctx.fillRect(5, 5, 6, 6);
      ctx.fillStyle = '#8f8f8f';
      ctx.fillRect(6, 6, 4, 4);
    });
  }

  // --- 10. Oak Wood Planks ---
  createPlanksCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.planks;
      // 4 horizontal boards
      for (let b = 0; b < 4; b++) {
        const yStart = b * 4;
        for (let y = yStart; y < yStart + 3; y++) {
          for (let x = 0; x < 16; x++) {
            ctx.fillStyle = colors[(x + y * 2) % 3];
            ctx.fillRect(x, y, 1, 1);
          }
        }
        // Dark plank seam
        ctx.fillStyle = '#5c4323';
        ctx.fillRect(0, yStart + 3, 16, 1);
      }
      // Nail details
      ctx.fillStyle = '#443118';
      ctx.fillRect(1, 1, 1, 1);
      ctx.fillRect(14, 5, 1, 1);
      ctx.fillRect(2, 9, 1, 1);
      ctx.fillRect(13, 13, 1, 1);
    });
  }

  // --- 11. Oak Log Bark Side ---
  createOakLogSideCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.oakBark;
      // Vertical bark stripes
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          const c = colors[(x * 3 + y) % colors.length];
          ctx.fillStyle = c;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.fillStyle = '#3a2b17';
      [2, 7, 12].forEach(x => {
        for (let y = 0; y < 16; y += 3) {
          ctx.fillRect(x, y, 1, 2);
        }
      });
    });
  }

  // --- 12. Oak Log Rings Top ---
  createOakLogTopCanvas() {
    return this.createPixelCanvas(ctx => {
      const rings = this.palettes.oakRings;
      ctx.fillStyle = rings[0];
      ctx.fillRect(0, 0, 16, 16);

      // Bark outer border
      ctx.fillStyle = '#554228';
      ctx.fillRect(0, 0, 16, 2);
      ctx.fillRect(0, 14, 16, 2);
      ctx.fillRect(0, 0, 2, 16);
      ctx.fillRect(14, 0, 2, 16);

      // Concentric tree rings
      ctx.fillStyle = rings[2];
      ctx.beginPath();
      ctx.arc(8, 8, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = rings[1];
      ctx.beginPath();
      ctx.arc(8, 8, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#554228'; // Center pith
      ctx.fillRect(7, 7, 2, 2);
    });
  }

  // --- 13. Oak Leaves (Pixelated with transparent gaps) ---
  createLeavesCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      const colors = this.palettes.leaves;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          // Leave ~15% transparent pixels for leafy cutout look
          if (Math.random() > 0.15) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    });
  }

  // --- 14. Sand ---
  createSandCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.sand;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // --- 15. Water (Translucent animated blue) ---
  createWaterCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.water;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[(x + y) % colors.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // --- 16. Glass (Transparent with diagonal glare lines) ---
  createGlassCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);

      // Frame border
      ctx.fillStyle = 'rgba(230, 245, 255, 0.75)';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillRect(15, 0, 1, 16);

      // Diagonal reflection streaks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      const streak = [[2, 2], [3, 3], [4, 4], [10, 3], [11, 4], [12, 5], [5, 10], [6, 11], [7, 12]];
      streak.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
    });
  }

  // --- 17. Bricks ---
  createBricksCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.bricks;
      for (let row = 0; row < 4; row++) {
        const yStart = row * 4;
        const offset = (row % 2) * 4;
        for (let y = yStart; y < yStart + 3; y++) {
          for (let x = 0; x < 16; x++) {
            ctx.fillStyle = colors[(x + y) % 3];
            ctx.fillRect(x, y, 1, 1);
          }
        }
        // White mortar line
        ctx.fillStyle = colors[3];
        ctx.fillRect(0, yStart + 3, 16, 1);
      }
      // Vertical mortar seams
      ctx.fillStyle = colors[3];
      ctx.fillRect(7, 0, 1, 3);
      ctx.fillRect(15, 0, 1, 3);
      ctx.fillRect(3, 4, 1, 3);
      ctx.fillRect(11, 4, 1, 3);
      ctx.fillRect(7, 8, 1, 3);
      ctx.fillRect(15, 8, 1, 3);
      ctx.fillRect(3, 12, 1, 3);
      ctx.fillRect(11, 12, 1, 3);
    });
  }

  // --- 18. Beveled Precious Metal Block (Iron, Gold, Diamond) ---
  createBeveledBlockCanvas(palette) {
    return this.createPixelCanvas(ctx => {
      const [base, dark, light, shadow, outline] = palette;
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, 16, 16);

      // Outer bevel
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, 16, 2);
      ctx.fillRect(0, 0, 2, 16);

      ctx.fillStyle = shadow;
      ctx.fillRect(0, 14, 16, 2);
      ctx.fillRect(14, 0, 2, 16);

      // Inner beveled square
      ctx.fillStyle = dark;
      ctx.fillRect(3, 3, 10, 10);
      ctx.fillStyle = base;
      ctx.fillRect(4, 4, 8, 8);
    });
  }

  // --- 19. Obsidian ---
  createObsidianCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.obsidian;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // --- 20. Glowstone ---
  createGlowstoneCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = this.palettes.glowstone;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // --- 21. Crafting Table Top ---
  createCraftingTableTopCanvas() {
    return this.createPixelCanvas(ctx => {
      // Wood plank base
      ctx.fillStyle = '#a07844';
      ctx.fillRect(0, 0, 16, 16);

      // 3x3 Grid Inlay
      ctx.fillStyle = '#4c341b';
      ctx.fillRect(2, 2, 12, 12);

      ctx.fillStyle = '#d8bb82';
      for (let gy = 0; gy < 3; gy++) {
        for (let gx = 0; gx < 3; gx++) {
          ctx.fillRect(3 + gx * 4, 3 + gy * 4, 3, 3);
        }
      }
    });
  }

  // --- 22. Crafting Table Side (with tools) ---
  createCraftingTableSideCanvas() {
    return this.createPixelCanvas(ctx => {
      // Wood planks
      ctx.fillStyle = '#8e6939';
      ctx.fillRect(0, 0, 16, 16);

      // Tools hanging on side (Saw & Pliers)
      ctx.fillStyle = '#333333';
      ctx.fillRect(4, 3, 2, 10);
      ctx.fillRect(3, 11, 4, 2);

      ctx.fillStyle = '#aaaaaa'; // Saw blade
      ctx.fillRect(9, 4, 3, 8);
      ctx.fillStyle = '#553311'; // Saw handle
      ctx.fillRect(9, 12, 3, 2);
    });
  }

  // --- 23. Furnace Front (Unlit / Lit) ---
  createFurnaceFrontCanvas(isLit) {
    return this.createPixelCanvas(ctx => {
      // Cobblestone frame
      ctx.fillStyle = '#686868';
      ctx.fillRect(0, 0, 16, 16);

      // Dark door outline
      ctx.fillStyle = '#333333';
      ctx.fillRect(3, 3, 10, 10);

      if (isLit) {
        // Blazing orange flame
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(4, 5, 8, 7);
        ctx.fillStyle = '#ffee33';
        ctx.fillRect(5, 7, 6, 4);
      } else {
        // Dark interior mouth
        ctx.fillStyle = '#1c1c1c';
        ctx.fillRect(4, 5, 8, 7);
      }
    });
  }

  // --- 24. Bookshelf ---
  createBookshelfCanvas() {
    return this.createPixelCanvas(ctx => {
      // Wood plank frame
      ctx.fillStyle = '#8e6939';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#442b10';
      ctx.fillRect(1, 1, 14, 6);
      ctx.fillRect(1, 8, 14, 6);

      // Colorful book spines on top & bottom shelves
      const bookColors = ['#8a2b25', '#245a88', '#347a38', '#b58832', '#724388'];
      [2, 9].forEach(y => {
        for (let x = 2; x <= 13; x += 2) {
          ctx.fillStyle = bookColors[(x + y) % bookColors.length];
          ctx.fillRect(x, y, 2, 5);
          // Gold title embossing
          ctx.fillStyle = '#d4af37';
          ctx.fillRect(x, y + 2, 2, 1);
        }
      });
    });
  }

  // --- 25. Wool (Woven fabric texture) ---
  createWoolCanvas(palette) {
    return this.createPixelCanvas(ctx => {
      const colors = palette;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const c = (x % 2 === y % 2) ? colors[0] : colors[1];
          ctx.fillStyle = c;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // --- 26. Food & Weapon Items ---
  createAppleCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      // Apple body (Red with highlights & shadows)
      ctx.fillStyle = '#b01e14';
      ctx.fillRect(5, 5, 6, 7);
      ctx.fillRect(4, 6, 8, 5);
      ctx.fillStyle = '#d63423';
      ctx.fillRect(6, 6, 3, 3);
      ctx.fillStyle = '#7a1008';
      ctx.fillRect(5, 11, 6, 1);
      // Stem & Leaf
      ctx.fillStyle = '#593d25';
      ctx.fillRect(8, 2, 1, 3);
      ctx.fillStyle = '#4c8a24';
      ctx.fillRect(9, 3, 2, 2);
    });
  }

  createBreadCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      // Golden crust
      ctx.fillStyle = '#9b6b28';
      ctx.fillRect(3, 7, 10, 4);
      ctx.fillStyle = '#c79246';
      ctx.fillRect(4, 6, 8, 5);
      // Top cuts
      ctx.fillStyle = '#613e10';
      ctx.fillRect(5, 6, 1, 2);
      ctx.fillRect(8, 6, 1, 2);
      ctx.fillRect(11, 6, 1, 2);
      ctx.fillStyle = '#e4b869';
      ctx.fillRect(4, 7, 1, 3);
    });
  }

  createPorkchopCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      // Grilled meat
      ctx.fillStyle = '#824632';
      ctx.fillRect(4, 5, 8, 6);
      ctx.fillStyle = '#b0654b';
      ctx.fillRect(5, 6, 6, 4);
      // Bone
      ctx.fillStyle = '#e6dec8';
      ctx.fillRect(3, 4, 2, 2);
      ctx.fillRect(11, 10, 2, 2);
      ctx.fillStyle = '#5c2d1e';
      ctx.fillRect(6, 7, 4, 1);
    });
  }

  createDiamondSwordCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      // Blade diagonal from (14, 1) down to (6, 9)
      const bladeCoords = [
        [14, 1], [13, 2], [14, 2], [12, 3], [13, 3],
        [11, 4], [12, 4], [10, 5], [11, 5], [9, 6], [10, 6],
        [8, 7], [9, 7], [7, 8], [8, 8], [6, 9], [7, 9]
      ];
      ctx.fillStyle = '#2db8aa';
      bladeCoords.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
      ctx.fillStyle = '#5ff0e4';
      [ [13, 1], [12, 2], [11, 3], [10, 4], [9, 5], [8, 6], [7, 7] ].forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));

      // Guard (cross)
      ctx.fillStyle = '#1c6f66';
      ctx.fillRect(5, 9, 3, 1);
      ctx.fillRect(6, 8, 1, 3);
      ctx.fillRect(5, 10, 1, 1);
      ctx.fillRect(8, 7, 1, 1);

      // Handle (wood)
      ctx.fillStyle = '#5c3e21';
      ctx.fillRect(4, 11, 2, 2);
      ctx.fillRect(3, 12, 2, 2);

      // Pommel
      ctx.fillStyle = '#2db8aa';
      ctx.fillRect(1, 14, 2, 2);
    });
  }

  createIronPickaxeCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      // Iron Pick head
      ctx.fillStyle = '#d4d4d4';
      const head = [
        [14, 2], [13, 1], [12, 1], [11, 2], [10, 3], [9, 4], [8, 5],
        [12, 2], [11, 3], [10, 4], [9, 5], [8, 6], [7, 7],
        [6, 8], [5, 9], [4, 10], [3, 11], [2, 12], [2, 13]
      ];
      ctx.fillStyle = '#bfbfbf';
      head.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
      ctx.fillStyle = '#ffffff';
      [ [13, 1], [12, 1], [11, 2], [10, 3] ].forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));

      // Wood stick
      ctx.fillStyle = '#6d4c28';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(8 - i, 7 + i, 1, 1);
        ctx.fillRect(9 - i, 7 + i, 1, 1);
      }
    });
  }

  createZombieSkinCanvas() {
    return this.createPixelCanvas(ctx => {
      // Green skin
      ctx.fillStyle = '#567c34';
      ctx.fillRect(0, 0, 16, 16);
      // Dark mossy hair
      ctx.fillStyle = '#2d4218';
      ctx.fillRect(0, 0, 16, 4);
      // Sunken dark eyes
      ctx.fillStyle = '#111809';
      ctx.fillRect(2, 6, 3, 2);
      ctx.fillRect(11, 6, 3, 2);
      // Nose
      ctx.fillStyle = '#426126';
      ctx.fillRect(7, 8, 2, 2);
      // Grim mouth
      ctx.fillStyle = '#1c280f';
      ctx.fillRect(5, 11, 6, 2);
    });
  }

  createZombieHeadTopCanvas() {
    return this.createPixelCanvas(ctx => {
      // Dark mossy hair covering top of head
      ctx.fillStyle = '#2d4218';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#223312';
      for (let y = 0; y < 16; y += 2) {
        for (let x = 0; x < 16; x += 2) {
          if ((x * 3 + y * 7) % 3 === 0) {
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }
    });
  }

  createZombieHeadSideCanvas() {
    return this.createPixelCanvas(ctx => {
      // Green skin
      ctx.fillStyle = '#567c34';
      ctx.fillRect(0, 0, 16, 16);
      // Hair drape on top
      ctx.fillStyle = '#2d4218';
      ctx.fillRect(0, 0, 16, 6);
      ctx.fillRect(0, 6, 4, 3);
      ctx.fillRect(12, 6, 4, 3);
    });
  }

  // --- Animal & Hunting Textures ---
  createSheepFaceCanvas() {
    return this.createPixelCanvas(ctx => {
      // Fluffy white wool
      ctx.fillStyle = '#eaeaea';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#dcdcdc';
      ctx.fillRect(2, 2, 12, 12);
      // Tan/pink skin muzzle
      ctx.fillStyle = '#dfb89b';
      ctx.fillRect(4, 6, 8, 8);
      // Eyes
      ctx.fillStyle = '#111111';
      ctx.fillRect(3, 7, 2, 2);
      ctx.fillRect(11, 7, 2, 2);
      // Pink nose
      ctx.fillStyle = '#cc8c82';
      ctx.fillRect(7, 11, 2, 2);
    });
  }

  createCowFaceCanvas() {
    return this.createPixelCanvas(ctx => {
      // Brown coat
      ctx.fillStyle = '#613b1e';
      ctx.fillRect(0, 0, 16, 16);
      // Grey horns
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(1, 0, 2, 4);
      ctx.fillRect(13, 0, 2, 4);
      // Pink snout
      ctx.fillStyle = '#d49987';
      ctx.fillRect(4, 9, 8, 6);
      // Black nostrils
      ctx.fillStyle = '#331a10';
      ctx.fillRect(5, 11, 2, 2);
      ctx.fillRect(9, 11, 2, 2);
      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 5, 3, 2);
      ctx.fillRect(11, 5, 3, 2);
      ctx.fillStyle = '#000000';
      ctx.fillRect(3, 5, 2, 2);
      ctx.fillRect(11, 5, 2, 2);
    });
  }

  createPigFaceCanvas() {
    return this.createPixelCanvas(ctx => {
      // Pink skin
      ctx.fillStyle = '#f09890';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#e4857b';
      ctx.fillRect(1, 1, 14, 14);
      // Protruding snout
      ctx.fillStyle = '#d6685e';
      ctx.fillRect(4, 8, 8, 5);
      // Nostrils
      ctx.fillStyle = '#66221c';
      ctx.fillRect(5, 10, 2, 2);
      ctx.fillRect(9, 10, 2, 2);
      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 5, 3, 2);
      ctx.fillRect(11, 5, 3, 2);
      ctx.fillStyle = '#111111';
      ctx.fillRect(3, 5, 2, 2);
      ctx.fillRect(11, 5, 2, 2);
    });
  }

  createChickenFaceCanvas() {
    return this.createPixelCanvas(ctx => {
      // White feathers
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 16, 16);
      // Yellow beak
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(5, 7, 6, 4);
      // Red wattle
      ctx.fillStyle = '#cc1111';
      ctx.fillRect(6, 11, 4, 3);
      // Eyes
      ctx.fillStyle = '#111111';
      ctx.fillRect(3, 5, 2, 2);
      ctx.fillRect(11, 5, 2, 2);
    });
  }

  createWhiteWoolCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = ['#f4f4f4', '#e2e2e2', '#dedede', '#ececec'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[(x * 3 + y * 7) % colors.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  createRawBeefCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#9c241e';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = '#b8322a';
      ctx.fillRect(5, 5, 6, 6);
      ctx.fillStyle = '#efcfc5';
      ctx.fillRect(6, 6, 2, 3);
      ctx.fillRect(9, 7, 2, 2);
    });
  }

  createRawMuttonCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#a63830';
      ctx.fillRect(4, 5, 8, 6);
      ctx.fillStyle = '#e8d9c5';
      ctx.fillRect(3, 4, 2, 2);
      ctx.fillRect(11, 10, 2, 2);
    });
  }

  createFeatherCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 9; i++) {
        ctx.fillRect(12 - i, 3 + i, 3, 2);
      }
      ctx.fillStyle = '#cccccc';
      for (let i = 0; i < 9; i++) {
        ctx.fillRect(13 - i, 3 + i, 1, 1);
      }
    });
  }

  createCreeperSkinCanvas() {
    return this.createPixelCanvas(ctx => {
      // Pixelated mottled green camouflage
      const greens = ['#4ca035', '#3f8c2b', '#5bb841', '#327320', '#255616'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = greens[(x * 3 + y * 7 + (x ^ y)) % greens.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Iconic black creeper face
      ctx.fillStyle = '#0a1408';
      // Eyes
      ctx.fillRect(3, 4, 3, 3);
      ctx.fillRect(10, 4, 3, 3);
      // Center nose & mouth
      ctx.fillRect(6, 7, 4, 4);
      ctx.fillRect(4, 9, 2, 5);
      ctx.fillRect(10, 9, 2, 5);
      ctx.fillRect(6, 13, 4, 2);
    });
  }

  createDirtBgCanvas() {
    return this.createPixelCanvas(ctx => {
      // Dark tiled dirt background for Minecraft menus
      const dirt = ['#382416', '#2f1e11', '#28190d', '#422c1b', '#201309'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = dirt[(x * 5 + y * 11 + (x * y)) % dirt.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  // --- Mining Destruction Cracks (Stages 0 to 9) ---
  getBreakingCrackTexture(stage) {
    const key = `crack_${stage}`;
    if (this.textureCache[key]) return this.textureCache[key];

    const canvas = this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#000000';
      const density = Math.min(10, Math.max(1, stage + 1));
      // Progressive black jagged fissures
      const crackCoords = [
        [[7, 7], [8, 8]],
        [[6, 6], [7, 7], [8, 8], [9, 9]],
        [[5, 6], [6, 7], [7, 7], [8, 8], [9, 8], [10, 9]],
        [[4, 5], [5, 6], [6, 7], [7, 7], [8, 8], [9, 8], [10, 9], [11, 10], [7, 9]],
        [[3, 4], [4, 5], [5, 6], [6, 7], [7, 7], [8, 8], [9, 8], [10, 9], [11, 10], [12, 11], [7, 9], [7, 10]],
        [[2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 7], [8, 8], [9, 8], [10, 9], [10, 10], [11, 11], [12, 12], [6, 9], [7, 10], [8, 11]],
        [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 7], [8, 8], [9, 8], [10, 9], [11, 10], [12, 11], [13, 12], [5, 8], [6, 9], [7, 10], [8, 11], [9, 12]],
        [[1, 1], [2, 2], [3, 3], [4, 5], [5, 6], [6, 7], [7, 7], [8, 8], [9, 8], [10, 9], [11, 10], [12, 11], [13, 12], [14, 13], [4, 7], [5, 8], [6, 9], [7, 10], [8, 11], [9, 12], [10, 13]],
        [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 7], [8, 8], [9, 8], [10, 9], [11, 10], [12, 11], [13, 12], [14, 13], [15, 14], [3, 6], [4, 7], [5, 8], [6, 9], [7, 10], [8, 11], [9, 12], [10, 13], [11, 14]],
        [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [11, 11], [12, 12], [13, 13], [14, 14], [15, 15], [0, 15], [1, 14], [2, 13], [3, 12], [4, 11], [5, 10], [6, 9], [7, 8], [8, 7], [9, 6], [10, 5], [11, 4], [12, 3], [13, 2], [14, 1], [15, 0]]
      ];
      const pts = crackCoords[Math.min(crackCoords.length - 1, stage)];
      pts.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
    });

    const tex = this.toThreeTexture(canvas);
    this.textureCache[key] = tex;
    return tex;
  }

  // --- New Authentic Minecraft Item & Block Generators ---
  createDiamondPickaxeCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#2db8aa';
      const head = [
        [14, 2], [13, 1], [12, 1], [11, 2], [10, 3], [9, 4], [8, 5],
        [12, 2], [11, 3], [10, 4], [9, 5], [8, 6], [7, 7],
        [6, 8], [5, 9], [4, 10], [3, 11], [2, 12], [2, 13]
      ];
      head.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
      ctx.fillStyle = '#5ff0e4';
      [ [13, 1], [12, 1], [11, 2], [10, 3] ].forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
      ctx.fillStyle = '#5c3e21';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(8 - i, 7 + i, 1, 1);
        ctx.fillRect(9 - i, 7 + i, 1, 1);
      }
    });
  }

  createDiamondAxeCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#2db8aa';
      // Axe head shape
      ctx.fillRect(8, 2, 5, 4);
      ctx.fillRect(7, 3, 2, 4);
      ctx.fillRect(10, 6, 3, 2);
      ctx.fillStyle = '#5ff0e4';
      ctx.fillRect(9, 2, 3, 2);
      ctx.fillRect(11, 4, 2, 2);
      // Wood stick
      ctx.fillStyle = '#5c3e21';
      for (let i = 0; i < 9; i++) {
        ctx.fillRect(10 - i, 5 + i, 1, 1);
        ctx.fillRect(11 - i, 5 + i, 1, 1);
      }
    });
  }

  createDiamondShovelCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      // Diamond spade tip
      ctx.fillStyle = '#2db8aa';
      ctx.fillRect(11, 2, 3, 3);
      ctx.fillRect(10, 3, 4, 3);
      ctx.fillStyle = '#5ff0e4';
      ctx.fillRect(12, 2, 2, 2);
      // Wood handle
      ctx.fillStyle = '#5c3e21';
      for (let i = 0; i < 10; i++) {
        ctx.fillRect(10 - i, 5 + i, 1, 1);
        ctx.fillRect(11 - i, 5 + i, 1, 1);
      }
    });
  }

  createBowCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#6d4c28';
      // Curved wooden stave
      const stave = [[13, 2], [12, 3], [11, 4], [9, 5], [7, 7], [5, 9], [4, 11], [3, 12], [2, 13]];
      stave.forEach(([x, y]) => ctx.fillRect(x, y, 2, 2));
      // String
      ctx.fillStyle = '#ffffff';
      for (let i = 2; i <= 13; i++) {
        ctx.fillRect(i + 1, i + 1, 1, 1);
      }
    });
  }

  createArrowCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      // Flint head
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(12, 2, 3, 3);
      // Shaft
      ctx.fillStyle = '#8b5a2b';
      for (let i = 0; i < 9; i++) {
        ctx.fillRect(11 - i, 4 + i, 1, 1);
      }
      // Feather fletching
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 12, 2, 3);
      ctx.fillRect(3, 13, 3, 2);
    });
  }

  createGoldenAppleCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#d4a017';
      ctx.fillRect(5, 5, 6, 7);
      ctx.fillRect(4, 6, 8, 5);
      ctx.fillStyle = '#ffdf43';
      ctx.fillRect(6, 6, 3, 4);
      ctx.fillStyle = '#fff4a3';
      ctx.fillRect(6, 7, 1, 2);
      ctx.fillStyle = '#5c3e21';
      ctx.fillRect(7, 3, 2, 2);
    });
  }

  createCookedBeefCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = '#5a2d1d';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillRect(3, 5, 10, 6);
      ctx.fillStyle = '#7a3c26';
      ctx.fillRect(5, 5, 6, 6);
      ctx.fillStyle = '#c8a688';
      ctx.fillRect(4, 4, 2, 2);
      ctx.fillRect(10, 10, 2, 2);
    });
  }

  createCarrotCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      // Leaves
      ctx.fillStyle = '#4a9c2d';
      ctx.fillRect(11, 2, 3, 2);
      ctx.fillRect(12, 4, 2, 2);
      // Orange root
      ctx.fillStyle = '#d96414';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(10 - i, 4 + i, Math.max(1, 3 - Math.floor(i / 3)), Math.max(1, 3 - Math.floor(i / 3)));
      }
      ctx.fillStyle = '#f08226';
      ctx.fillRect(9, 5, 1, 2);
      ctx.fillRect(8, 6, 1, 2);
    });
  }

  createBirchPlanksCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = ['#d7c59a', '#c8b688', '#e3d2a7', '#b9a576'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[(x * 3 + y * 7 + (x ^ y)) % colors.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.fillStyle = '#9c8758';
      ctx.fillRect(0, 3, 16, 1);
      ctx.fillRect(0, 7, 16, 1);
      ctx.fillRect(0, 11, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
    });
  }

  createSprucePlanksCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = ['#4a331c', '#3e2915', '#573c22', '#342110'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[(x * 3 + y * 7 + (x ^ y)) % colors.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.fillStyle = '#261609';
      ctx.fillRect(0, 3, 16, 1);
      ctx.fillRect(0, 7, 16, 1);
      ctx.fillRect(0, 11, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
    });
  }

  createSandstoneTopCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = ['#e0d7a6', '#d6cc97', '#ebd8aa', '#c9bf88'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[(x * 3 + y * 5) % colors.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  createSandstoneSideCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = ['#ded59f', '#d2c88f', '#e6ddae', '#c5bb7f'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[(x * 3 + y * 5) % colors.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Carved bottom band
      ctx.fillStyle = '#b3a469';
      ctx.fillRect(0, 12, 16, 4);
      ctx.fillStyle = '#9e8f57';
      ctx.fillRect(2, 13, 3, 2);
      ctx.fillRect(7, 13, 3, 2);
      ctx.fillRect(12, 13, 3, 2);
    });
  }

  createSmoothStoneCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.fillStyle = '#a1a1a1';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#b3b3b3';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#8c8c8c';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillStyle = '#666666';
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(15, 0, 1, 16);
    });
  }

  createTorchCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      // Wooden stick
      ctx.fillStyle = '#6d4c28';
      ctx.fillRect(7, 6, 2, 9);
      // Flame core
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(6, 3, 4, 3);
      ctx.fillStyle = '#ffee44';
      ctx.fillRect(7, 2, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 3, 1, 1);
    });
  }

  createEmeraldBlockCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.fillStyle = '#179c3d';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#31cf5e';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#0f752c';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(15, 0, 1, 16);
      // Bevel ring
      ctx.fillStyle = '#5bf085';
      ctx.fillRect(3, 3, 10, 10);
      ctx.fillStyle = '#1db047';
      ctx.fillRect(4, 4, 8, 8);
    });
  }

  createLapisBlockCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = ['#1a3d82', '#14316d', '#224ea1', '#0e2354'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[(x * 3 + y * 7 + (x ^ y)) % colors.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Gold specks
      ctx.fillStyle = '#f0c030';
      ctx.fillRect(3, 4, 1, 1);
      ctx.fillRect(11, 8, 1, 1);
      ctx.fillRect(7, 12, 1, 1);
      ctx.fillRect(13, 3, 1, 1);
    });
  }

  createNetherrackCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = ['#692222', '#521919', '#7a2d2d', '#3e1111', '#853535'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[(x * 5 + y * 11 + (x * y)) % colors.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
  }

  createSeaLanternCanvas() {
    return this.createPixelCanvas(ctx => {
      const colors = ['#a2d9d7', '#b5ece9', '#8ac5c3', '#71b0ae'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = colors[(x * 3 + y * 7) % colors.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.fillStyle = '#d2ffff';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 6, 4, 4);
    });
  }

  createChestTopCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.fillStyle = '#7a542b';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#966835';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#4a331a';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(15, 0, 1, 16);
    });
  }

  createChestSideCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.fillStyle = '#7a542b';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#966835';
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#4a331a';
      ctx.fillRect(0, 4, 16, 1);
      // Metal latch on front/side
      ctx.fillStyle = '#333333';
      ctx.fillRect(7, 3, 2, 4);
      ctx.fillStyle = '#bfbfbf';
      ctx.fillRect(7, 4, 2, 2);
    });
  }

  createBucketCanvas(fluidColor) {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      // Iron bucket rim and body
      ctx.fillStyle = '#b8b8b8';
      ctx.fillRect(4, 5, 8, 2);
      ctx.fillRect(3, 7, 10, 6);
      ctx.fillRect(4, 13, 8, 1);
      ctx.fillStyle = '#787878';
      ctx.fillRect(3, 7, 1, 6);
      ctx.fillRect(12, 7, 1, 6);
      ctx.fillRect(4, 13, 8, 1);
      // Fluid filling
      ctx.fillStyle = fluidColor;
      ctx.fillRect(5, 7, 6, 5);
      ctx.fillRect(6, 6, 4, 2);
    });
  }

  createLadderCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);
      const woodDark = '#553e23';
      const woodMid = '#8e6939';
      const woodLight = '#b3884f';

      // Left rail (x: 2..3)
      ctx.fillStyle = woodMid;
      ctx.fillRect(2, 0, 2, 16);
      ctx.fillStyle = woodDark;
      ctx.fillRect(2, 0, 1, 16);
      ctx.fillStyle = woodLight;
      ctx.fillRect(3, 0, 1, 16);

      // Right rail (x: 12..13)
      ctx.fillStyle = woodMid;
      ctx.fillRect(12, 0, 2, 16);
      ctx.fillStyle = woodDark;
      ctx.fillRect(12, 0, 1, 16);
      ctx.fillStyle = woodLight;
      ctx.fillRect(13, 0, 1, 16);

      // 4 Rungs across at y = 2, 6, 10, 14
      [2, 6, 10, 14].forEach(y => {
        ctx.fillStyle = woodMid;
        ctx.fillRect(4, y, 8, 2);
        ctx.fillStyle = woodLight;
        ctx.fillRect(4, y, 8, 1);
        ctx.fillStyle = woodDark;
        ctx.fillRect(4, y + 1, 8, 1);
      });
    });
  }

  // --- 17. Furniture: Oak Door (Top Half with glass/grid window panes) ---
  createDoorTopCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.fillStyle = '#8e6939'; // Oak plank base
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#a07844';
      ctx.fillRect(1, 1, 14, 14);

      // Frame perimeter
      ctx.fillStyle = '#553e23';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillRect(15, 0, 1, 16);
      ctx.fillRect(0, 15, 16, 1);

      // Two glass window cutout panes (x=2..6 and x=9..13, y=2..7)
      [[2, 2], [9, 2]].forEach(([wx, wy]) => {
        ctx.fillStyle = '#3a2b18'; // Pane border
        ctx.fillRect(wx, wy, 5, 6);
        ctx.fillStyle = '#b8e2f2'; // Pale glass
        ctx.fillRect(wx + 1, wy + 1, 3, 4);
        ctx.fillStyle = '#ffffff'; // Glass glare
        ctx.fillRect(wx + 1, wy + 1, 1, 1);
        ctx.fillRect(wx + 2, wy + 2, 1, 1);
      });

      // Lower decorative indented panels (x=2..6 and x=9..13, y=9..14)
      [[2, 9], [9, 9]].forEach(([px, py]) => {
        ctx.fillStyle = '#44321d';
        ctx.fillRect(px, py, 5, 6);
        ctx.fillStyle = '#7a5a2e';
        ctx.fillRect(px + 1, py + 1, 3, 4);
      });

      // Iron door knob / latch at x=13..14, y=11..13
      ctx.fillStyle = '#222222';
      ctx.fillRect(13, 11, 2, 3);
      ctx.fillStyle = '#bfbfbf';
      ctx.fillRect(13, 12, 1, 1);
    });
  }

  // --- 18. Furniture: Oak Door (Bottom Half with beveled panels) ---
  createDoorBottomCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.fillStyle = '#8e6939';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#a07844';
      ctx.fillRect(1, 1, 14, 14);

      // Outer frame
      ctx.fillStyle = '#553e23';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);
      ctx.fillRect(15, 0, 1, 16);
      ctx.fillRect(0, 15, 16, 1);

      // Two large beveled wood panels
      [[2, 2], [9, 2]].forEach(([px, py]) => {
        ctx.fillStyle = '#44321d';
        ctx.fillRect(px, py, 5, 12);
        ctx.fillStyle = '#7a5a2e';
        ctx.fillRect(px + 1, py + 1, 3, 10);
        ctx.fillStyle = '#9e733e';
        ctx.fillRect(px + 2, py + 2, 2, 8);
      });

      // Iron lock plate at x=13..14, y=2..4
      ctx.fillStyle = '#333333';
      ctx.fillRect(13, 2, 2, 3);
      ctx.fillStyle = '#111111';
      ctx.fillRect(13, 3, 1, 1);
    });
  }

  // --- 19. Furniture: Oak Door Side ---
  createDoorSideCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.fillStyle = '#8e6939';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#a07844';
      ctx.fillRect(2, 0, 12, 16);
      ctx.fillStyle = '#553e23';
      ctx.fillRect(0, 0, 2, 16);
      ctx.fillRect(14, 0, 2, 16);
      // Metal latch bolt in center
      ctx.fillStyle = '#777777';
      ctx.fillRect(6, 7, 4, 3);
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(7, 8, 2, 1);
    });
  }

  // --- 20. Furniture: Red Bed (Top: White Pillow + Red Blanket) ---
  createBedTopCanvas() {
    return this.createPixelCanvas(ctx => {
      // 1. Pillow (Head of bed: y=0..5)
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(0, 0, 16, 6);
      ctx.fillStyle = '#ffffff'; // Fluffy pillow center
      ctx.fillRect(2, 1, 12, 4);
      ctx.fillStyle = '#cccccc'; // Pillow crease
      ctx.fillRect(1, 4, 14, 1);

      // 2. Folded red blanket top hem (y=6)
      ctx.fillStyle = '#6b1814';
      ctx.fillRect(0, 6, 16, 1);

      // 3. Iconic Red Wool Blanket (y=7..15)
      const reds = ['#9f2824', '#85211d', '#b8332e', '#701915', '#cb423d'];
      for (let y = 7; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = reds[(x * 3 + y * 7) % reds.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Decorative blanket stitching along border
      ctx.fillStyle = '#6b1814';
      ctx.fillRect(0, 7, 1, 9);
      ctx.fillRect(15, 7, 1, 9);
      ctx.fillRect(0, 15, 16, 1);
    });
  }

  // --- 21. Furniture: Red Bed Side (Frame + Drape + Legs) ---
  createBedSideCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);

      // Pillow top edge on left (x=0..4, y=2..5)
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(0, 2, 5, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 2, 4, 3);

      // Red blanket draped down side (y=6..10)
      const reds = ['#9f2824', '#85211d', '#b8332e', '#701915'];
      for (let y = 6; y <= 10; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = reds[(x + y) % reds.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Wooden bed rail (y=11..12)
      ctx.fillStyle = '#8e6939';
      ctx.fillRect(0, 11, 16, 2);
      ctx.fillStyle = '#a07844';
      ctx.fillRect(0, 11, 16, 1);

      // 2 Carved oak bed legs (x=0..2 and x=13..15, y=13..15)
      ctx.fillStyle = '#553e23';
      ctx.fillRect(0, 13, 3, 3);
      ctx.fillRect(13, 13, 3, 3);
      ctx.fillStyle = '#443018';
      ctx.fillRect(0, 15, 3, 1);
      ctx.fillRect(13, 15, 3, 1);
    });
  }

  // --- 22. Furniture: Campfire (Roaring Flames, Embers & Crossed Logs) ---
  createCampfireCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);

      // Crisscrossed charred oak logs at bottom (y=12..15)
      ctx.fillStyle = '#44321d';
      ctx.fillRect(0, 12, 16, 4);
      ctx.fillStyle = '#261a0d'; // Charred bark
      ctx.fillRect(0, 12, 16, 1);
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(0, 12, 3, 4);
      ctx.fillRect(13, 12, 3, 4);

      // Red-hot coal ember bed (y=10..12, x=3..12)
      ctx.fillStyle = '#d83800';
      ctx.fillRect(3, 11, 10, 2);
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(4, 10, 8, 2);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(5, 11, 6, 1);

      // Dynamic Roaring Fire Tongues (y=1..10)
      // Flame tongue 1 (left)
      ctx.fillStyle = '#ff3300';
      ctx.fillRect(4, 4, 3, 7);
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(5, 5, 2, 5);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(5, 6, 1, 3);

      // Flame tongue 2 (center tall)
      ctx.fillStyle = '#ff2200';
      ctx.fillRect(7, 1, 3, 10);
      ctx.fillStyle = '#ff7700';
      ctx.fillRect(7, 3, 2, 7);
      ctx.fillStyle = '#ffff55';
      ctx.fillRect(7, 4, 2, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 5, 1, 2);

      // Flame tongue 3 (right)
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(10, 3, 3, 8);
      ctx.fillStyle = '#ff9900';
      ctx.fillRect(10, 5, 2, 5);
      ctx.fillStyle = '#ffee33';
      ctx.fillRect(11, 6, 1, 3);

      // Floating spark embers (y=0..2)
      ctx.fillStyle = '#ffee44';
      ctx.fillRect(5, 2, 1, 1);
      ctx.fillRect(12, 1, 1, 1);
      ctx.fillRect(8, 0, 1, 1);
    });
  }

  // --- 23. Furniture: Campfire Top (Overhead crossed logs & fire pit) ---
  createCampfireTopCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.fillStyle = '#332211';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#553e23';
      ctx.fillRect(0, 1, 16, 3);
      ctx.fillRect(0, 12, 16, 3);
      ctx.fillRect(1, 0, 3, 16);
      ctx.fillRect(12, 0, 3, 16);

      // Glowing coal bed inside
      ctx.fillStyle = '#b82a00';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = '#ff5500';
      ctx.fillRect(5, 5, 6, 6);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(6, 6, 4, 4);
      ctx.fillStyle = '#ffee44';
      ctx.fillRect(7, 7, 2, 2);
    });
  }

  // --- 24. Furniture: Oak Chair Top (Polished seat plank) ---
  createChairTopCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.fillStyle = '#8e6939'; // Oak plank base
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#a07844'; // Polished center
      ctx.fillRect(1, 1, 14, 14);
      ctx.fillStyle = '#b3884f';
      ctx.fillRect(2, 2, 12, 12);
      // Dark corner mounting pegs
      ctx.fillStyle = '#553e23';
      ctx.fillRect(1, 1, 2, 2);
      ctx.fillRect(13, 1, 2, 2);
      ctx.fillRect(1, 13, 2, 2);
      ctx.fillRect(13, 13, 2, 2);
      // Backrest shadow line
      ctx.fillStyle = '#443018';
      ctx.fillRect(1, 1, 14, 2);
    });
  }

  // --- 25. Furniture: Oak Chair Side (Backrest + Seat + Legs) ---
  createChairSideCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);

      // High Vertical Oak Backrest (left side: x=0..2, y=0..9)
      ctx.fillStyle = '#8e6939';
      ctx.fillRect(0, 0, 3, 10);
      ctx.fillStyle = '#b3884f';
      ctx.fillRect(1, 0, 1, 10);
      ctx.fillStyle = '#553e23';
      ctx.fillRect(0, 0, 1, 10);
      // Backrest slats (cutout lines)
      ctx.clearRect(1, 2, 1, 2);
      ctx.clearRect(1, 5, 1, 2);

      // Horizontal Oak Seat Plank (y=9..10, x=0..15)
      ctx.fillStyle = '#8e6939';
      ctx.fillRect(0, 9, 16, 2);
      ctx.fillStyle = '#a07844';
      ctx.fillRect(0, 9, 16, 1);
      ctx.fillStyle = '#553e23';
      ctx.fillRect(0, 10, 16, 1);

      // 2 Sturdy Vertical Oak Legs (x=1..3 and x=12..14, y=11..15)
      ctx.fillStyle = '#8e6939';
      ctx.fillRect(1, 11, 3, 5);
      ctx.fillRect(12, 11, 3, 5);
      ctx.fillStyle = '#553e23';
      ctx.fillRect(1, 11, 1, 5);
      ctx.fillRect(12, 11, 1, 5);
      ctx.fillRect(1, 15, 3, 1);
      ctx.fillRect(12, 15, 3, 1);
    });
  }

  // --- 26. Furniture: Oak Desk Top (With leather writing mat & parchment) ---
  createDeskTopCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.fillStyle = '#8e6939'; // Oak wood perimeter
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#a07844';
      ctx.fillRect(1, 1, 14, 14);

      // Fine leather writing blotter / study desk mat in center (x=3..12, y=3..12)
      ctx.fillStyle = '#4a2d18'; // Dark leather trim
      ctx.fillRect(3, 3, 10, 10);
      ctx.fillStyle = '#6d4325'; // Warm leather
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = '#e8dcc4'; // Parchment sheet
      ctx.fillRect(5, 5, 6, 5);
      ctx.fillStyle = '#333333'; // Ink strokes on paper
      ctx.fillRect(6, 6, 4, 1);
      ctx.fillRect(6, 8, 3, 1);

      // Glass ink pot in upper right corner (x=11..12, y=4..5)
      ctx.fillStyle = '#1a334d';
      ctx.fillRect(11, 4, 2, 2);
      ctx.fillStyle = '#66a3d2';
      ctx.fillRect(11, 4, 1, 1);
    });
  }

  // --- 27. Furniture: Oak Desk Side (Tabletop + Drawer + Corner Legs) ---
  createDeskSideCanvas() {
    return this.createPixelCanvas(ctx => {
      ctx.clearRect(0, 0, 16, 16);

      // Tabletop edge (y=0..2)
      ctx.fillStyle = '#8e6939';
      ctx.fillRect(0, 0, 16, 3);
      ctx.fillStyle = '#a07844';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillStyle = '#553e23';
      ctx.fillRect(0, 2, 16, 1);

      // Desk apron drawer front (y=3..5)
      ctx.fillStyle = '#7a5a2e';
      ctx.fillRect(1, 3, 14, 3);
      ctx.fillStyle = '#222222'; // Iron drawer pull
      ctx.fillRect(7, 4, 2, 1);

      // 2 Sturdy Carved Corner Legs (x=0..2 and x=13..15, y=6..15)
      ctx.fillStyle = '#8e6939';
      ctx.fillRect(0, 6, 3, 10);
      ctx.fillRect(13, 6, 3, 10);
      ctx.fillStyle = '#553e23';
      ctx.fillRect(0, 6, 1, 10);
      ctx.fillRect(13, 6, 1, 10);
      ctx.fillRect(0, 15, 3, 1);
      ctx.fillRect(13, 15, 3, 1);
    });
  }

  // --- 28. Furniture: Fireplace Hearth Front (Stone Brick Arch & Roaring Fire) ---
  createFireplaceFrontCanvas() {
    return this.createPixelCanvas(ctx => {
      // Medieval Stone Brick Mantle & Arch
      const stoneColors = ['#7c7c7c', '#6d6d6d', '#8e8e8e', '#555555'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = stoneColors[(x * 2 + y * 3) % stoneColors.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Arch mortar lines
      ctx.fillStyle = '#383838';
      ctx.fillRect(0, 3, 16, 1);
      ctx.fillRect(0, 0, 16, 1);

      // Fireplace Chamber Hearth (x=3..12, y=4..15)
      ctx.fillStyle = '#1c1510'; // Soot chamber
      ctx.fillRect(3, 4, 10, 12);
      ctx.fillStyle = '#0a0806';
      ctx.fillRect(4, 5, 8, 11);

      // Hot red burning coal bed (y=13..15)
      ctx.fillStyle = '#881100';
      ctx.fillRect(4, 13, 8, 3);
      ctx.fillStyle = '#e64400';
      ctx.fillRect(5, 13, 6, 2);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(6, 14, 4, 1);

      // Roaring yellow-orange flames licking upward (y=6..13)
      ctx.fillStyle = '#ff3300';
      ctx.fillRect(5, 8, 6, 5);
      ctx.fillStyle = '#ff7700';
      ctx.fillRect(6, 7, 4, 6);
      ctx.fillStyle = '#ffee33';
      ctx.fillRect(6, 8, 4, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 9, 2, 2);

      // Cast iron grate bars (y=12..14)
      ctx.fillStyle = '#222222';
      ctx.fillRect(3, 13, 10, 1);
      [4, 6, 8, 10].forEach(gx => ctx.fillRect(gx, 12, 1, 3));
    });
  }
}

window.MinecraftTextures = MinecraftTextures;
window.mcTextures = new MinecraftTextures();
