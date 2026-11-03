/**
 * Minecraft Web Edition - Castle & Architectural Space Builder
 * Procedural generation and blueprint tools for building medieval castles,
 * watchtowers, fortified curtain walls, gatehouses, and royal throne halls.
 */

class MinecraftCastleArchitect {
  constructor(world) {
    this.world = world;
  }

  // =========================================================================
  // 1. WATCHTOWER (Circular stone brick tower with crenellations & banner)
  // =========================================================================
  buildWatchtower(baseX, baseY, baseZ, height = 14, radius = 3) {
    const w = this.world;
    const stoneBrick = 9;   // Stone Bricks
    const mossyBrick = 10;  // Mossy Stone Bricks
    const planks = 5;       // Oak Planks
    const glowstone = 20;   // Glowstone light
    const redWool = 24;     // Red Wool Royal Banner

    // Solid stone foundation & hollow circular walls
    for (let dy = 0; dy < height; dy++) {
      const y = baseY + dy;
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const dist = Math.sqrt(dx * dx + dz * dz);
          const x = baseX + dx;
          const z = baseZ + dz;

          // Wall perimeter
          if (dist <= radius && dist >= radius - 1) {
            // Mix stone bricks with occasional mossy or cracked bricks
            const mat = Math.random() < 0.15 ? mossyBrick : stoneBrick;
            // Arrow slits at mid height
            if (dy % 4 === 2 && (dx === 0 || dz === 0)) {
              w.setBlock(x, y, z, 8, false); // Glass slit
            } else {
              w.setBlock(x, y, z, mat, false);
            }
          }
          // Wooden floors every 4 blocks
          else if (dist < radius - 1) {
            if (dy % 4 === 0) {
              if (dx === 0 && dz === radius - 2 && dy > 0) {
                w.setBlock(x, y, z, 0, false); // Ladder hatch
              } else {
                w.setBlock(x, y, z, planks, false);
                // Center lighting
                if (dx === 0 && dz === 0) w.setBlock(x, y, z, glowstone, false);
              }
            } else {
              w.setBlock(x, y, z, 0, false); // Air inside
            }
          }
        }
      }
    }

    const roofY = baseY + height;

    // Install vertical climbing ladder to 2nd floor, 3rd floor, and roof
    const lX = baseX;
    const lZ = baseZ + radius - 2;
    for (let ly = 1; ly <= height; ly++) {
      w.setBlock(lX, baseY + ly, lZ, 59, false);
    }
    w.setBlock(lX, roofY, lZ, 0, false); // Roof exit hatch

    // Furnish Watchtower: Door at entrance, Fireplace, Bed, Desk, and Chair
    w.setBlock(baseX, baseY + 1, baseZ - radius, 60, false); // Oak Door
    w.setBlock(baseX, baseY + 2, baseZ - radius, 0, false);  // Upper doorway clearance
    w.setBlock(baseX - 1, baseY + 1, baseZ, 63, false);      // Campfire

    if (height >= 8) {
      w.setBlock(baseX - 1, baseY + 5, baseZ - 1, 62, false); // Red Bed
      w.setBlock(baseX + 1, baseY + 5, baseZ - 1, 65, false); // Oak Desk
      w.setBlock(baseX + 1, baseY + 5, baseZ, 64, false);     // Oak Chair
    }

    // Top Platform with Battlements / Crenellations
    for (let dx = -radius - 1; dx <= radius + 1; dx++) {
      for (let dz = -radius - 1; dz <= radius + 1; dz++) {
        const dist = Math.sqrt(dx * dx + dz * dz);
        const x = baseX + dx;
        const z = baseZ + dz;

        // Overhanging parapet floor
        if (dist <= radius + 1) {
          w.setBlock(x, roofY, z, stoneBrick, false);
        }

        // Crenellation battlements (alternating teeth)
        if (dist <= radius + 1.2 && dist >= radius) {
          if ((dx + dz) % 2 === 0) {
            w.setBlock(x, roofY + 1, z, stoneBrick, false);
          }
        }
      }
    }

    // Royal Banner Pole at Center
    for (let py = 1; py <= 5; py++) {
      w.setBlock(baseX, roofY + py, baseZ, 6, false); // Oak Log pole
    }
    // Red Wool Flag
    w.setBlock(baseX + 1, roofY + 4, baseZ, redWool, false);
    w.setBlock(baseX + 2, roofY + 4, baseZ, redWool, false);
    w.setBlock(baseX + 1, roofY + 3, baseZ, redWool, false);

    // Rebuild affected chunks
    this.refreshArea(baseX - radius - 2, baseZ - radius - 2, baseX + radius + 2, baseZ + radius + 2);
    if (window.mcAudio) window.mcAudio.playLevelUpChime();
  }

  // =========================================================================
  // 2. FORTIFIED CURTAIN WALL (With walkway, arrow slits & ramparts)
  // =========================================================================
  buildWall(x1, z1, x2, z2, baseY, height = 8) {
    const w = this.world;
    const stoneBrick = 9;
    const mossyBrick = 10;
    const planks = 5;

    const dx = x2 - x1;
    const dz = z2 - z1;
    const steps = Math.max(Math.abs(dx), Math.abs(dz));
    const stepX = dx / steps;
    const stepZ = dz / steps;

    for (let i = 0; i <= steps; i++) {
      const cx = Math.round(x1 + i * stepX);
      const cz = Math.round(z1 + i * stepZ);

      // 3-blocks thick wall for authentic fortification
      for (let thick = -1; thick <= 1; thick++) {
        const wx = dx === 0 ? cx + thick : cx;
        const wz = dz === 0 ? cz + thick : cz;

        for (let y = baseY; y < baseY + height; y++) {
          const mat = Math.random() < 0.12 ? mossyBrick : stoneBrick;
          w.setBlock(wx, y, wz, mat, false);
        }

        // Parapet walkway on top
        w.setBlock(wx, baseY + height, wz, planks, false);

        // Crenellations on outer edge
        if (thick === -1 || thick === 1) {
          if (i % 2 === 0) {
            w.setBlock(wx, baseY + height + 1, wz, stoneBrick, false);
          }
        }
      }
    }

    this.refreshArea(
      Math.min(x1, x2) - 3, Math.min(z1, z2) - 3,
      Math.max(x1, x2) + 3, Math.max(z1, z2) + 3
    );
    if (window.mcAudio) window.mcAudio.playBlockPlace('stone');
  }

  // =========================================================================
  // 3. GRAND THRONE ROOM & GREAT HALL
  // =========================================================================
  buildThroneRoom(startX, startY, startZ, width = 12, length = 18, height = 9) {
    const w = this.world;
    const stoneBrick = 9;
    const chiseled = 12;
    const planks = 5;
    const redWool = 24;
    const goldBlock = 17;
    const glowstone = 20;
    const glass = 8;

    // Floor (Polished stone bricks with central red carpet runner)
    for (let x = startX; x < startX + width; x++) {
      for (let z = startZ; z < startZ + length; z++) {
        const isCenterCarpet = Math.abs(x - (startX + Math.floor(width / 2))) <= 1;
        w.setBlock(x, startY, z, isCenterCarpet ? redWool : planks, false);
      }
    }

    // Outer Walls & High Cathedral Ceiling
    for (let y = startY + 1; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        for (let z = startZ; z < startZ + length; z++) {
          const isBorder = (x === startX || x === startX + width - 1 || z === startZ || z === startZ + length - 1);
          if (isBorder) {
            // Stained glass cathedral windows
            if (y >= startY + 3 && y <= startY + 6 && (x % 3 === 0 || z % 3 === 0)) {
              w.setBlock(x, y, z, glass, false);
            } else {
              w.setBlock(x, y, z, stoneBrick, false);
            }
          } else {
            // Hollow hall interior
            w.setBlock(x, y, z, 0, false);
          }
        }
      }
    }

    // Grand Arched Stone Pillars
    const midZ = [startZ + 4, startZ + 9, startZ + 14];
    midZ.forEach(pz => {
      [startX + 2, startX + width - 3].forEach(px => {
        for (let py = startY + 1; py < startY + height - 1; py++) {
          w.setBlock(px, py, pz, chiseled, false);
        }
        // Glowing brazier atop pillar
        w.setBlock(px, startY + height - 1, pz, glowstone, false);
      });
    });

    // Vaulted Ceiling Roof
    for (let x = startX; x < startX + width; x++) {
      for (let z = startZ; z < startZ + length; z++) {
        w.setBlock(x, startY + height, z, stoneBrick, false);
      }
    }

    // Royal Golden Throne on Raised Dais
    const throneX = startX + Math.floor(width / 2);
    const throneZ = startZ + length - 3;
    // Dais platform
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        w.setBlock(throneX + dx, startY + 1, throneZ + dz, chiseled, false);
      }
    }
    // Gold Throne Seat & High Back
    w.setBlock(throneX, startY + 2, throneZ, goldBlock, false);
    w.setBlock(throneX, startY + 3, throneZ, goldBlock, false);
    w.setBlock(throneX, startY + 4, throneZ, goldBlock, false);
    w.setBlock(throneX - 1, startY + 2, throneZ, redWool, false);
    w.setBlock(throneX + 1, startY + 2, throneZ, redWool, false);

    // Roaring Fireplace Hearths in Great Hall
    w.setBlock(startX + 1, startY + 1, startZ + 7, 66, false);
    w.setBlock(startX + width - 2, startY + 1, startZ + 7, 66, false);

    // Entrance Oak Doors
    const entranceX = startX + Math.floor(width / 2);
    w.setBlock(entranceX, startY + 1, startZ, 60, false);
    w.setBlock(entranceX, startY + 2, startZ, 0, false);

    // Royal Advisor Desks & Chairs
    w.setBlock(throneX - 3, startY + 1, throneZ - 1, 65, false); // Desk
    w.setBlock(throneX - 3, startY + 1, throneZ, 64, false);     // Chair
    w.setBlock(throneX + 3, startY + 1, throneZ - 1, 65, false); // Desk
    w.setBlock(throneX + 3, startY + 1, throneZ, 64, false);     // Chair

    this.refreshArea(startX - 2, startZ - 2, startX + width + 2, startZ + length + 2);
    if (window.mcAudio) window.mcAudio.playLevelUpChime();
  }

  // =========================================================================
  // 4. COMPLETE FORTIFIED ROYAL CASTLE COMPLEX
  // =========================================================================
  buildCompleteCastle(centerX, centerY, centerZ) {
    const size = 32; // 32x32 Fortress
    const half = Math.floor(size / 2);
    const x1 = centerX - half;
    const z1 = centerZ - half;
    const x2 = centerX + half;
    const z2 = centerZ + half;

    // 1. Level courtyard base with green lawn & cobblestone paths
    for (let x = x1; x <= x2; x++) {
      for (let z = z1; z <= z2; z++) {
        const isPath = (x === centerX || z === centerZ);
        this.world.setBlock(x, centerY, z, isPath ? 4 : 2, false); // Cobble or Grass
        // Clear space above
        for (let y = centerY + 1; y <= centerY + 16; y++) {
          this.world.setBlock(x, y, z, 0, false);
        }
      }
    }

    // 2. Four Corner Watchtowers
    this.buildWatchtower(x1 + 3, centerY, z1 + 3, 14, 3);
    this.buildWatchtower(x2 - 3, centerY, z1 + 3, 14, 3);
    this.buildWatchtower(x1 + 3, centerY, z2 - 3, 14, 3);
    this.buildWatchtower(x2 - 3, centerY, z2 - 3, 14, 3);

    // 3. Four Fortified Curtain Walls
    this.buildWall(x1 + 6, z1 + 3, x2 - 6, z1 + 3, centerY, 8); // North wall
    this.buildWall(x1 + 6, z2 - 3, x2 - 6, z2 - 3, centerY, 8); // South wall
    this.buildWall(x1 + 3, z1 + 6, x1 + 3, z2 - 6, centerY, 8); // West wall
    this.buildWall(x2 - 3, z1 + 6, x2 - 3, z2 - 6, centerY, 8); // East wall

    // 4. Central Throne Keep
    this.buildThroneRoom(centerX - 6, centerY, centerZ - 8, 12, 16, 9);

    // 5. Central Courtyard Fountain
    const fx = centerX - 8;
    const fz = centerZ;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const isRim = Math.abs(dx) === 2 || Math.abs(dz) === 2;
        this.world.setBlock(fx + dx, centerY + 1, fz + dz, isRim ? 9 : 15, false); // Stone brick rim or Water
      }
    }
    // Center fountain pillar
    this.world.setBlock(fx, centerY + 2, fz, 9, false);
    this.world.setBlock(fx, centerY + 3, fz, 20, false); // Glowstone

    this.refreshArea(x1 - 4, z1 - 4, x2 + 4, z2 + 4);
    if (window.mcAudio) window.mcAudio.playLevelUpChime();
  }

  // Refresh all chunks covering a bounding box
  refreshArea(x1, z1, x2, z2) {
    const minCX = Math.floor(x1 / this.world.chunkSize);
    const maxCX = Math.floor(x2 / this.world.chunkSize);
    const minCZ = Math.floor(z1 / this.world.chunkSize);
    const maxCZ = Math.floor(z2 / this.world.chunkSize);

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cz = minCZ; cz <= maxCZ; cz++) {
        this.world.rebuildChunk(cx, cz);
      }
    }
  }
}

window.MinecraftCastleArchitect = MinecraftCastleArchitect;
