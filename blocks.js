/**
 * Minecraft Web Edition - Block Registry & Crafting System
 * Maps block IDs, material properties, textures, sounds, and crafting recipes.
 */

const BLOCKS = {
  0: { id: 0, name: 'Air', transparent: true, solid: false, hardness: 0 },
  1: {
    id: 1,
    name: 'Stone',
    solid: true,
    hardness: 1.5,
    sound: 'stone',
    textures: { all: 'stone' }
  },
  2: {
    id: 2,
    name: 'Grass Block',
    solid: true,
    hardness: 0.6,
    sound: 'grass',
    textures: { top: 'grass_top', bottom: 'dirt', side: 'grass_side' }
  },
  3: {
    id: 3,
    name: 'Dirt',
    solid: true,
    hardness: 0.5,
    sound: 'dirt',
    textures: { all: 'dirt' }
  },
  4: {
    id: 4,
    name: 'Cobblestone',
    solid: true,
    hardness: 2.0,
    sound: 'stone',
    textures: { all: 'cobblestone' }
  },
  5: {
    id: 5,
    name: 'Oak Planks',
    solid: true,
    hardness: 2.0,
    sound: 'wood',
    textures: { all: 'oak_planks' }
  },
  6: {
    id: 6,
    name: 'Oak Log',
    solid: true,
    hardness: 2.0,
    sound: 'wood',
    textures: { top: 'oak_log_top', bottom: 'oak_log_top', side: 'oak_log_side' }
  },
  7: {
    id: 7,
    name: 'Oak Leaves',
    solid: true,
    transparent: true,
    hardness: 0.2,
    sound: 'grass',
    textures: { all: 'oak_leaves' }
  },
  8: {
    id: 8,
    name: 'Glass',
    solid: true,
    transparent: true,
    hardness: 0.3,
    sound: 'glass',
    textures: { all: 'glass' }
  },
  9: {
    id: 9,
    name: 'Stone Bricks',
    solid: true,
    hardness: 1.5,
    sound: 'stone',
    textures: { all: 'stone_bricks' }
  },
  10: {
    id: 10,
    name: 'Mossy Stone Bricks',
    solid: true,
    hardness: 1.5,
    sound: 'stone',
    textures: { all: 'mossy_stone_bricks' }
  },
  11: {
    id: 11,
    name: 'Cracked Stone Bricks',
    solid: true,
    hardness: 1.5,
    sound: 'stone',
    textures: { all: 'cracked_stone_bricks' }
  },
  12: {
    id: 12,
    name: 'Chiseled Stone Bricks',
    solid: true,
    hardness: 1.5,
    sound: 'stone',
    textures: { all: 'chiseled_stone_bricks' }
  },
  13: {
    id: 13,
    name: 'Bricks',
    solid: true,
    hardness: 2.0,
    sound: 'stone',
    textures: { all: 'bricks' }
  },
  14: {
    id: 14,
    name: 'Sand',
    solid: true,
    hardness: 0.5,
    sound: 'sand',
    textures: { all: 'sand' }
  },
  15: {
    id: 15,
    name: 'Water',
    solid: false,
    transparent: true,
    fluid: true,
    hardness: 100,
    sound: 'water',
    textures: { all: 'water' }
  },
  16: {
    id: 16,
    name: 'Iron Block',
    solid: true,
    hardness: 5.0,
    sound: 'metal',
    textures: { all: 'iron_block' }
  },
  17: {
    id: 17,
    name: 'Gold Block',
    solid: true,
    hardness: 3.0,
    sound: 'metal',
    textures: { all: 'gold_block' }
  },
  18: {
    id: 18,
    name: 'Diamond Block',
    solid: true,
    hardness: 5.0,
    sound: 'metal',
    textures: { all: 'diamond_block' }
  },
  19: {
    id: 19,
    name: 'Obsidian',
    solid: true,
    hardness: 50.0,
    sound: 'stone',
    textures: { all: 'obsidian' }
  },
  20: {
    id: 20,
    name: 'Glowstone',
    solid: true,
    hardness: 0.3,
    sound: 'glass',
    light: 15,
    textures: { all: 'glowstone' }
  },
  21: {
    id: 21,
    name: 'Crafting Table',
    solid: true,
    hardness: 2.5,
    sound: 'wood',
    textures: { top: 'crafting_table_top', bottom: 'oak_planks', side: 'crafting_table_side' }
  },
  22: {
    id: 22,
    name: 'Furnace',
    solid: true,
    hardness: 3.5,
    sound: 'stone',
    textures: { top: 'cobblestone', bottom: 'cobblestone', side: 'furnace_front' }
  },
  23: {
    id: 23,
    name: 'Bookshelf',
    solid: true,
    hardness: 1.5,
    sound: 'wood',
    textures: { top: 'oak_planks', bottom: 'oak_planks', side: 'bookshelf' }
  },
  24: {
    id: 24,
    name: 'Red Wool Tapestry',
    solid: true,
    hardness: 0.8,
    sound: 'cloth',
    textures: { all: 'red_wool' }
  },
  25: {
    id: 25,
    name: 'Apple',
    itemOnly: true,
    food: true,
    restoreHunger: 4,
    restoreHealth: 2,
    sound: 'cloth',
    textures: { all: 'apple' }
  },
  26: {
    id: 26,
    name: 'Bread',
    itemOnly: true,
    food: true,
    restoreHunger: 5,
    restoreHealth: 3,
    sound: 'cloth',
    textures: { all: 'bread' }
  },
  27: {
    id: 27,
    name: 'Cooked Porkchop',
    itemOnly: true,
    food: true,
    restoreHunger: 8,
    restoreHealth: 4,
    sound: 'cloth',
    textures: { all: 'cooked_porkchop' }
  },
  28: {
    id: 28,
    name: 'Diamond Sword',
    itemOnly: true,
    weapon: true,
    damage: 7,
    sound: 'stone',
    textures: { all: 'diamond_sword' }
  },
  29: {
    id: 29,
    name: 'Iron Pickaxe',
    itemOnly: true,
    tool: true,
    efficiency: 3.5,
    sound: 'stone',
    textures: { all: 'iron_pickaxe' }
  },
  30: {
    id: 30,
    name: 'White Wool',
    solid: true,
    hardness: 0.8,
    sound: 'cloth',
    textures: { all: 'white_wool' }
  },
  31: {
    id: 31,
    name: 'Raw Beef',
    itemOnly: true,
    food: true,
    restoreHunger: 4,
    restoreHealth: 2,
    sound: 'cloth',
    textures: { all: 'raw_beef' }
  },
  32: {
    id: 32,
    name: 'Raw Mutton',
    itemOnly: true,
    food: true,
    restoreHunger: 3,
    restoreHealth: 2,
    sound: 'cloth',
    textures: { all: 'raw_mutton' }
  },
  33: {
    id: 33,
    name: 'Feather',
    itemOnly: true,
    sound: 'cloth',
    textures: { all: 'feather' }
  },
  34: {
    id: 34,
    name: 'Diamond Pickaxe',
    itemOnly: true,
    tool: true,
    efficiency: 5.0,
    sound: 'stone',
    textures: { all: 'diamond_pickaxe' }
  },
  35: {
    id: 35,
    name: 'Diamond Axe',
    itemOnly: true,
    tool: true,
    efficiency: 5.0,
    sound: 'wood',
    textures: { all: 'diamond_axe' }
  },
  36: {
    id: 36,
    name: 'Diamond Shovel',
    itemOnly: true,
    tool: true,
    efficiency: 5.0,
    sound: 'sand',
    textures: { all: 'diamond_shovel' }
  },
  37: {
    id: 37,
    name: 'Bow',
    itemOnly: true,
    weapon: true,
    damage: 6,
    sound: 'wood',
    textures: { all: 'bow' }
  },
  38: {
    id: 38,
    name: 'Arrow',
    itemOnly: true,
    sound: 'wood',
    textures: { all: 'arrow' }
  },
  39: {
    id: 39,
    name: 'Golden Apple',
    itemOnly: true,
    food: true,
    restoreHunger: 8,
    restoreHealth: 8,
    sound: 'cloth',
    textures: { all: 'golden_apple' }
  },
  40: {
    id: 40,
    name: 'Cooked Beef (Steak)',
    itemOnly: true,
    food: true,
    restoreHunger: 8,
    restoreHealth: 4,
    sound: 'cloth',
    textures: { all: 'cooked_beef' }
  },
  41: {
    id: 41,
    name: 'Carrot',
    itemOnly: true,
    food: true,
    restoreHunger: 3,
    restoreHealth: 2,
    sound: 'cloth',
    textures: { all: 'carrot' }
  },
  42: {
    id: 42,
    name: 'Birch Planks',
    solid: true,
    hardness: 2.0,
    sound: 'wood',
    textures: { all: 'birch_planks' }
  },
  43: {
    id: 43,
    name: 'Spruce Planks',
    solid: true,
    hardness: 2.0,
    sound: 'wood',
    textures: { all: 'spruce_planks' }
  },
  44: {
    id: 44,
    name: 'Sandstone',
    solid: true,
    hardness: 0.8,
    sound: 'stone',
    textures: { top: 'sandstone_top', bottom: 'sandstone_bottom', side: 'sandstone_side' }
  },
  45: {
    id: 45,
    name: 'Smooth Stone',
    solid: true,
    hardness: 2.0,
    sound: 'stone',
    textures: { all: 'smooth_stone' }
  },
  46: {
    id: 46,
    name: 'Torch',
    solid: false,
    transparent: true,
    light: 14,
    hardness: 0,
    sound: 'wood',
    textures: { all: 'torch' }
  },
  47: {
    id: 47,
    name: 'Emerald Block',
    solid: true,
    hardness: 5.0,
    sound: 'metal',
    textures: { all: 'emerald_block' }
  },
  48: {
    id: 48,
    name: 'Lapis Lazuli Block',
    solid: true,
    hardness: 3.0,
    sound: 'stone',
    textures: { all: 'lapis_block' }
  },
  49: {
    id: 49,
    name: 'Netherrack',
    solid: true,
    hardness: 0.4,
    sound: 'stone',
    textures: { all: 'netherrack' }
  },
  50: {
    id: 50,
    name: 'Sea Lantern',
    solid: true,
    hardness: 0.3,
    light: 15,
    sound: 'glass',
    textures: { all: 'sea_lantern' }
  },
  51: {
    id: 51,
    name: 'Yellow Wool',
    solid: true,
    hardness: 0.8,
    sound: 'cloth',
    textures: { all: 'yellow_wool' }
  },
  52: {
    id: 52,
    name: 'Blue Wool',
    solid: true,
    hardness: 0.8,
    sound: 'cloth',
    textures: { all: 'blue_wool' }
  },
  53: {
    id: 53,
    name: 'Green Wool',
    solid: true,
    hardness: 0.8,
    sound: 'cloth',
    textures: { all: 'green_wool' }
  },
  54: {
    id: 54,
    name: 'Purple Wool',
    solid: true,
    hardness: 0.8,
    sound: 'cloth',
    textures: { all: 'purple_wool' }
  },
  55: {
    id: 55,
    name: 'Black Wool',
    solid: true,
    hardness: 0.8,
    sound: 'cloth',
    textures: { all: 'black_wool' }
  },
  56: {
    id: 56,
    name: 'Chest',
    solid: true,
    hardness: 2.5,
    sound: 'wood',
    textures: { top: 'chest_top', bottom: 'chest_top', side: 'chest_side' }
  },
  57: {
    id: 57,
    name: 'Water Bucket',
    itemOnly: true,
    sound: 'water',
    textures: { all: 'water_bucket' }
  },
  58: {
    id: 58,
    name: 'Lava Bucket',
    itemOnly: true,
    sound: 'stone',
    textures: { all: 'lava_bucket' }
  },
  59: {
    id: 59,
    name: 'Ladder',
    solid: false,
    ladder: true,
    transparent: true,
    hardness: 0.4,
    sound: 'wood',
    textures: { all: 'ladder' }
  },
  60: {
    id: 60,
    name: 'Oak Door',
    solid: true,
    door: true,
    transparent: true,
    hardness: 1.5,
    sound: 'wood',
    textures: { top: 'door_top', bottom: 'door_bottom', side: 'door_side' }
  },
  61: {
    id: 61,
    name: 'Open Oak Door',
    solid: false,
    door: true,
    isOpen: true,
    transparent: true,
    hardness: 1.5,
    sound: 'wood',
    textures: { top: 'door_top', bottom: 'door_bottom', side: 'door_side' }
  },
  62: {
    id: 62,
    name: 'Red Bed',
    solid: true,
    bed: true,
    transparent: true,
    hardness: 0.8,
    sound: 'cloth',
    textures: { top: 'bed_top', bottom: 'oak_planks', side: 'bed_side' }
  },
  63: {
    id: 63,
    name: 'Campfire',
    solid: false,
    campfire: true,
    light: 15,
    transparent: true,
    hardness: 1.0,
    sound: 'wood',
    textures: { top: 'campfire_top', bottom: 'oak_log_top', side: 'campfire_side', all: 'campfire' }
  },
  64: {
    id: 64,
    name: 'Oak Chair',
    solid: true,
    chair: true,
    transparent: true,
    hardness: 1.0,
    sound: 'wood',
    textures: { top: 'chair_top', bottom: 'oak_planks', side: 'chair_side' }
  },
  65: {
    id: 65,
    name: 'Oak Desk',
    solid: true,
    desk: true,
    transparent: true,
    hardness: 1.5,
    sound: 'wood',
    textures: { top: 'desk_top', bottom: 'oak_planks', side: 'desk_side' }
  },
  66: {
    id: 66,
    name: 'Fireplace Hearth',
    solid: true,
    fireplace: true,
    light: 15,
    hardness: 2.5,
    sound: 'stone',
    textures: { top: 'stone_bricks', bottom: 'cobblestone', side: 'fireplace_front' }
  }
};

// Crafting Recipes definition
const CRAFTING_RECIPES = [
  // 6 Planks -> 3 Oak Doors
  {
    name: 'Oak Door',
    pattern: [
      [5, 5],
      [5, 5],
      [5, 5]
    ],
    result: { id: 60, count: 3 }
  },
  // 3 Red Wool + 3 Planks -> Red Bed
  {
    name: 'Red Bed',
    pattern: [
      [24, 24, 24],
      [5, 5, 5]
    ],
    result: { id: 62, count: 1 }
  },
  // 3 Logs + 3 Planks -> Campfire
  {
    name: 'Campfire',
    pattern: [
      [0, 5, 0],
      [5, 6, 5],
      [6, 6, 6]
    ],
    result: { id: 63, count: 1 }
  },
  // 4 Planks -> 2 Oak Chairs
  {
    name: 'Oak Chair',
    pattern: [
      [5, 0],
      [5, 5],
      [5, 5]
    ],
    result: { id: 64, count: 2 }
  },
  // 3 Planks + 2 Logs -> Oak Desk
  {
    name: 'Oak Desk',
    pattern: [
      [5, 5, 5],
      [6, 0, 6]
    ],
    result: { id: 65, count: 1 }
  },
  // 6 Stone Bricks -> Fireplace Hearth
  {
    name: 'Fireplace Hearth',
    pattern: [
      [9, 9, 9],
      [9, 0, 9]
    ],
    result: { id: 66, count: 1 }
  },
  // 1 Oak Log -> 4 Oak Planks
  {
    name: 'Oak Planks',
    pattern: [[6]],
    result: { id: 5, count: 4 }
  },
  // 4 Cobblestone -> 4 Stone Bricks (Castle building essential)
  {
    name: 'Stone Bricks',
    pattern: [
      [4, 4],
      [4, 4]
    ],
    result: { id: 9, count: 4 }
  },
  // 4 Oak Planks -> Crafting Table
  {
    name: 'Crafting Table',
    pattern: [
      [5, 5],
      [5, 5]
    ],
    result: { id: 21, count: 1 }
  },
  // 8 Cobblestone -> Furnace
  {
    name: 'Furnace',
    pattern: [
      [4, 4, 4],
      [4, 0, 4],
      [4, 4, 4]
    ],
    result: { id: 22, count: 1 }
  },
  // 6 Planks -> Bookshelf
  {
    name: 'Bookshelf',
    pattern: [
      [5, 5, 5],
      [5, 5, 5]
    ],
    result: { id: 23, count: 1 }
  }
];

window.BLOCKS = BLOCKS;
window.CRAFTING_RECIPES = CRAFTING_RECIPES;
