/**
 * Minecraft Web Edition - Chunk-Based Voxel World Engine
 * Features multi-octave procedural terrain, face culling voxel mesher,
 * water, trees, caves, DDA raycasting, block highlight box, and block breaking particles.
 */

class MinecraftWorld {
  constructor(scene) {
    this.scene = scene;
    this.chunks = new Map(); // key "cx,cz" -> Chunk
    this.chunkSize = 16;
    this.worldHeight = 48;
    this.seaLevel = 14;

    // Active meshes
    this.chunkMeshes = new Map();

    // Block highlight wireframe box
    this.highlightBox = null;
    this.initHighlightBox();

    // Breaking crack overlay box
    this.breakingBox = null;
    this.initBreakingBox();

    // Active block breaking particle pool
    this.particles = [];

    // Materials map by texture name
    this.materials = {};
    this.smoothLighting = true;

    // Active item drops in world
    this.itemDrops = [];

    // Voxel Clouds Layer
    this.cloudMesh = null;
    this.initClouds();

    // Generate initial 5x5 chunk world centered at (0, 0)
    this.generateWorld();
  }

  // =========================================================================
  // VOLUMETRIC VOXEL CLOUDS
  // =========================================================================
  initClouds() {
    const cloudGeo = new THREE.PlaneGeometry(1200, 1200, 1, 1);
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';

    for (let y = 0; y < 64; y += 4) {
      for (let x = 0; x < 64; x += 4) {
        if (Math.sin(x * 0.22) * Math.cos(y * 0.22) + Math.sin((x + y) * 0.1) * 0.3 > 0.15) {
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(24, 24);

    const cloudMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    this.cloudMesh.position.set(0, 45, 0);
    this.cloudMesh.rotation.x = Math.PI / 2;
    this.scene.add(this.cloudMesh);
  }

  // =========================================================================
  // DROPPED 3D VOXEL ITEM ENTITIES
  // =========================================================================
  spawnItemDrop(x, y, z, blockId) {
    if (blockId <= 0) return;
    const bDef = window.BLOCKS[blockId];
    if (!bDef) return;

    const group = new THREE.Group();
    group.position.set(x + 0.5, y + 0.35, z + 0.5);

    const geo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const texName = bDef.textures.all || bDef.textures.side || 'stone';
    const mat = new THREE.MeshLambertMaterial({
      map: window.mcTextures.getTexture(texName)
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    this.scene.add(group);
    this.itemDrops.push({
      group,
      mesh,
      blockId,
      initialY: y + 0.35,
      bobOffset: Math.random() * Math.PI * 2,
      age: 0
    });
  }

  updateItemDrops(delta, playerPos, onCollect) {
    if (!playerPos) return;
    for (let i = this.itemDrops.length - 1; i >= 0; i--) {
      const drop = this.itemDrops[i];
      drop.age += delta;

      drop.mesh.rotation.y += delta * 2.5;
      drop.mesh.rotation.x = Math.sin(drop.age * 2) * 0.12;
      drop.group.position.y = drop.initialY + Math.sin(drop.age * 3.5 + drop.bobOffset) * 0.1;

      const dist = drop.group.position.distanceTo(playerPos);
      if (dist < 2.8) {
        const pull = playerPos.clone().sub(drop.group.position).normalize().multiplyScalar(delta * 9.0);
        drop.group.position.add(pull);

        if (dist < 0.9) {
          this.scene.remove(drop.group);
          this.itemDrops.splice(i, 1);
          if (window.mcAudio) window.mcAudio.playItemPop();
          if (onCollect) onCollect(drop.blockId);
          continue;
        }
      }

      if (drop.age > 180) {
        this.scene.remove(drop.group);
        this.itemDrops.splice(i, 1);
      }
    }
  }

  // =========================================================================
  // HIGHLIGHT & BREAKING CRACK OVERLAYS
  // =========================================================================
  initHighlightBox() {
    const geo = new THREE.BoxGeometry(1.004, 1.004, 1.004);
    const edges = new THREE.EdgesGeometry(geo);
    this.highlightBox = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    );
    this.highlightBox.visible = false;
    this.scene.add(this.highlightBox);
  }

  initBreakingBox() {
    const geo = new THREE.BoxGeometry(1.006, 1.006, 1.006);
    this.breakingMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.7,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    this.breakingBox = new THREE.Mesh(geo, this.breakingMaterial);
    this.breakingBox.visible = false;
    this.scene.add(this.breakingBox);
  }

  setBreakingProgress(stage, x, y, z) {
    if (stage === null || stage < 0) {
      this.breakingBox.visible = false;
    } else {
      this.breakingBox.position.set(x + 0.5, y + 0.5, z + 0.5);
      this.breakingMaterial.map = window.mcTextures.getBreakingCrackTexture(stage);
      this.breakingMaterial.needsUpdate = true;
      this.breakingBox.visible = true;
    }
  }

  // =========================================================================
  // VOXEL GETTERS & SETTERS
  // =========================================================================
  getChunkKey(cx, cz) {
    return `${cx},${cz}`;
  }

  getChunkCoords(x, z) {
    return {
      cx: Math.floor(x / this.chunkSize),
      cz: Math.floor(z / this.chunkSize),
      lx: (x % this.chunkSize + this.chunkSize) % this.chunkSize,
      lz: (z % this.chunkSize + this.chunkSize) % this.chunkSize
    };
  }

  getBlock(x, y, z) {
    if (y < 0 || y >= this.worldHeight) return 0;
    const { cx, cz, lx, lz } = this.getChunkCoords(x, z);
    const key = this.getChunkKey(cx, cz);
    const chunk = this.chunks.get(key);
    if (!chunk) return 0;
    return chunk.voxels[lx + lz * this.chunkSize + y * this.chunkSize * this.chunkSize];
  }

  setBlock(x, y, z, blockId, playSound = true) {
    if (y < 0 || y >= this.worldHeight) return false;
    const { cx, cz, lx, lz } = this.getChunkCoords(x, z);
    const key = this.getChunkKey(cx, cz);
    let chunk = this.chunks.get(key);
    if (!chunk) return false;

    const idx = lx + lz * this.chunkSize + y * this.chunkSize * this.chunkSize;
    const oldId = chunk.voxels[idx];
    if (oldId === blockId) return false;

    chunk.voxels[idx] = blockId;
    this.rebuildChunk(cx, cz);

    // If on chunk border, rebuild neighboring chunk too
    if (lx === 0) this.rebuildChunk(cx - 1, cz);
    if (lx === this.chunkSize - 1) this.rebuildChunk(cx + 1, cz);
    if (lz === 0) this.rebuildChunk(cx, cz - 1);
    if (lz === this.chunkSize - 1) this.rebuildChunk(cx, cz + 1);

    if (playSound && window.mcAudio) {
      if (blockId === 0) {
        // Breaking block
        const bInfo = window.BLOCKS[oldId] || {};
        window.mcAudio.playBlockBreak(bInfo.sound || 'stone');
        this.spawnBreakParticles(x, y, z, oldId);

        // Spawn 3D item drop in Survival / Hardcore
        if (!window.mcGame || window.mcGame.gameMode !== 'creative') {
          this.spawnItemDrop(x, y, z, oldId);
        }
      } else {
        // Placing block
        const bInfo = window.BLOCKS[blockId] || {};
        window.mcAudio.playBlockPlace(bInfo.sound || 'stone');
      }
    }

    return true;
  }

  // =========================================================================
  // PROCEDURAL TERRAIN GENERATION (Perlin Noise Hills, Trees, Ores)
  // =========================================================================
  generateWorld() {
    const radius = 6; // -6 to +6 (13x13 chunks = 169 chunks = 208x208 blocks vast area!)
    for (let cx = -radius; cx <= radius; cx++) {
      for (let cz = -radius; cz <= radius; cz++) {
        this.generateChunkData(cx, cz);
      }
    }

    // Build all chunk meshes
    for (let cx = -radius; cx <= radius; cx++) {
      for (let cz = -radius; cz <= radius; cz++) {
        this.rebuildChunk(cx, cz);
      }
    }
  }

  generateChunkData(cx, cz) {
    const key = this.getChunkKey(cx, cz);
    if (this.chunks.has(key)) return;

    const voxels = new Uint8Array(this.chunkSize * this.chunkSize * this.worldHeight);
    const chunk = { cx, cz, voxels };
    this.chunks.set(key, chunk);

    // Multi-octave 2D terrain height calculation (continental plains, mountain peaks, river valleys)
    for (let lx = 0; lx < this.chunkSize; lx++) {
      for (let lz = 0; lz < this.chunkSize; lz++) {
        const wx = cx * this.chunkSize + lx;
        const wz = cz * this.chunkSize + lz;

        // Broad continental landscape + majestic mountain ridges
        const n1 = Math.sin(wx * 0.02) * Math.cos(wz * 0.02) * 1.2;
        const n2 = Math.sin(wx * 0.055 + 1.2) * Math.sin(wz * 0.055 + 0.8) * 0.6;
        const n3 = Math.sin((wx + wz) * 0.012 - 0.5) * 0.8;
        const rawHeight = 20 + (n1 + n2 + n3) * 8.5;
        const height = Math.min(this.worldHeight - 5, Math.max(8, Math.floor(rawHeight)));

        // Bedrock
        voxels[lx + lz * this.chunkSize + 0 * this.chunkSize * this.chunkSize] = 19; // Obsidian / Bedrock

        // Subterranean Stone Layer with Ores
        for (let y = 1; y < height - 3; y++) {
          let blockId = 1; // Stone
          // Rare ore veins
          const oreRand = Math.random();
          if (oreRand < 0.008 && y < 10) blockId = 18; // Diamond Block
          else if (oreRand < 0.02 && y < 14) blockId = 17; // Gold Block
          else if (oreRand < 0.05 && y < 20) blockId = 16; // Iron Block
          voxels[lx + lz * this.chunkSize + y * this.chunkSize * this.chunkSize] = blockId;
        }

        // Dirt Layer
        for (let y = Math.max(1, height - 3); y < height; y++) {
          voxels[lx + lz * this.chunkSize + y * this.chunkSize * this.chunkSize] = 3; // Dirt
        }

        // Surface Layer
        if (height <= this.seaLevel) {
          // Beach Sand
          voxels[lx + lz * this.chunkSize + height * this.chunkSize * this.chunkSize] = 14; // Sand
          // Water above sand up to sea level
          for (let y = height + 1; y <= this.seaLevel; y++) {
            voxels[lx + lz * this.chunkSize + y * this.chunkSize * this.chunkSize] = 15; // Water
          }
        } else if (height >= 33) {
          // High mountain peaks: stone and smooth stone caps
          voxels[lx + lz * this.chunkSize + height * this.chunkSize * this.chunkSize] = 1; // Stone
        } else {
          // Lush Green Grass Block
          voxels[lx + lz * this.chunkSize + height * this.chunkSize * this.chunkSize] = 2; // Grass Block

          // Tree Placement (Oak trunk & foliage)
          if (lx >= 2 && lx <= 13 && lz >= 2 && lz <= 13 && height < 30) {
            const treeChance = (Math.sin(wx * 0.3) * Math.cos(wz * 0.3) + 1) / 2;
            if (treeChance > 0.88 && Math.random() < 0.22) {
              this.plantOakTree(voxels, lx, height + 1, lz);
            }
          }
        }
      }
    }
  }

  plantOakTree(voxels, tx, ty, tz) {
    const trunkHeight = 5;
    // Wood Trunk
    for (let y = 0; y < trunkHeight; y++) {
      if (ty + y < this.worldHeight) {
        voxels[tx + tz * this.chunkSize + (ty + y) * this.chunkSize * this.chunkSize] = 6; // Oak Log
      }
    }

    // Leaf Canopy (Spherical block crown)
    const leafCenterY = ty + trunkHeight - 1;
    for (let dy = -2; dy <= 2; dy++) {
      const radius = dy === 2 ? 1 : 2;
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const lx = tx + dx;
          const lz = tz + dz;
          const ly = leafCenterY + dy;
          if (lx >= 0 && lx < this.chunkSize && lz >= 0 && lz < this.chunkSize && ly < this.worldHeight) {
            const idx = lx + lz * this.chunkSize + ly * this.chunkSize * this.chunkSize;
            if (voxels[idx] === 0) {
              voxels[idx] = 7; // Oak Leaves
            }
          }
        }
      }
    }
  }

  // =========================================================================
  // SMOOTH LIGHTING (VOXEL AMBIENT OCCLUSION)
  // =========================================================================
  isSolid(x, y, z) {
    const id = this.getBlock(x, y, z);
    const def = window.BLOCKS[id];
    return !!(def && def.solid && !def.transparent);
  }

  getVertexAO(s1, s2, corner) {
    if (s1 && s2) return 0.5;
    return 1.0 - ((s1 ? 1 : 0) + (s2 ? 1 : 0) + (corner ? 1 : 0)) * 0.16;
  }

  calculateFaceAO(wx, y, wz, faceName) {
    if (!this.smoothLighting) return [1, 1, 1, 1];

    if (faceName === 'top') {
      const up = y + 1;
      const w = this.isSolid(wx - 1, up, wz);
      const e = this.isSolid(wx + 1, up, wz);
      const s = this.isSolid(wx, up, wz + 1);
      const n = this.isSolid(wx, up, wz - 1);
      const sw = this.isSolid(wx - 1, up, wz + 1);
      const se = this.isSolid(wx + 1, up, wz + 1);
      const ne = this.isSolid(wx + 1, up, wz - 1);
      const nw = this.isSolid(wx - 1, up, wz - 1);
      return [
        this.getVertexAO(w, s, sw),
        this.getVertexAO(e, s, se),
        this.getVertexAO(e, n, ne),
        this.getVertexAO(w, n, nw)
      ];
    } else if (faceName === 'bottom') {
      const down = y - 1;
      const w = this.isSolid(wx - 1, down, wz);
      const e = this.isSolid(wx + 1, down, wz);
      const s = this.isSolid(wx, down, wz + 1);
      const n = this.isSolid(wx, down, wz - 1);
      const sw = this.isSolid(wx - 1, down, wz + 1);
      const se = this.isSolid(wx + 1, down, wz + 1);
      const ne = this.isSolid(wx + 1, down, wz - 1);
      const nw = this.isSolid(wx - 1, down, wz - 1);
      return [
        this.getVertexAO(w, n, nw),
        this.getVertexAO(e, n, ne),
        this.getVertexAO(e, s, se),
        this.getVertexAO(w, s, sw)
      ];
    } else {
      return [0.88, 0.88, 0.88, 0.88];
    }
  }

  // =========================================================================
  // EFFICIENT VOXEL MESHER WITH 6-WAY FACE CULLING
  // =========================================================================
  rebuildChunk(cx, cz) {
    const key = this.getChunkKey(cx, cz);
    const chunk = this.chunks.get(key);
    if (!chunk) return;

    // Remove existing meshes for this chunk
    if (this.chunkMeshes.has(key)) {
      const oldGroup = this.chunkMeshes.get(key);
      this.scene.remove(oldGroup);
      this.chunkMeshes.delete(key);
    }

    const chunkGroup = new THREE.Group();
    chunkGroup.name = `Chunk_${key}`;
    this.scene.add(chunkGroup);
    this.chunkMeshes.set(key, chunkGroup);

    // Group geometry data by block material
    const materialBatches = {};

    const getBatch = (matKey, transparent = false) => {
      if (!materialBatches[matKey]) {
        materialBatches[matKey] = {
          positions: [],
          normals: [],
          uvs: [],
          colors: [],
          transparent: transparent
        };
      }
      return materialBatches[matKey];
    };

    // 6 Neighbor Offsets: Top, Bottom, West, East, South, North
    const faces = [
      { dir: [0, 1, 0], name: 'top', corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], ao: 1.0 },
      { dir: [0, -1, 0], name: 'bottom', corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], ao: 0.55 },
      { dir: [-1, 0, 0], name: 'side', corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], ao: 0.75 },
      { dir: [1, 0, 0], name: 'side', corners: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], ao: 0.75 },
      { dir: [0, 0, 1], name: 'side', corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], ao: 0.85 },
      { dir: [0, 0, -1], name: 'side', corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], ao: 0.85 }
    ];

    for (let lx = 0; lx < this.chunkSize; lx++) {
      for (let lz = 0; lz < this.chunkSize; lz++) {
        for (let y = 0; y < this.worldHeight; y++) {
          const idx = lx + lz * this.chunkSize + y * this.chunkSize * this.chunkSize;
          const blockId = chunk.voxels[idx];
          if (blockId === 0) continue; // Air

          const blockDef = window.BLOCKS[blockId];
          if (!blockDef) continue;

          const wx = cx * this.chunkSize + lx;
          const wz = cz * this.chunkSize + lz;

          // Check 6 neighboring faces for culling
          for (let f = 0; f < 6; f++) {
            const face = faces[f];
            const nx = wx + face.dir[0];
            const ny = y + face.dir[1];
            const nz = wz + face.dir[2];

            const neighborId = this.getBlock(nx, ny, nz);
            const neighborDef = window.BLOCKS[neighborId];

            // Render face ONLY if neighbor is air OR transparent/fluid
            const isNeighborTransparent = !neighborDef || neighborDef.transparent || !neighborDef.solid;
            const isSelfTransparent = blockDef.transparent;

            // Don't render water-to-water or leaf-to-leaf hidden inner faces
            if (neighborId === blockId && isSelfTransparent && blockId !== 8) {
              continue;
            }

            if (isNeighborTransparent) {
              // Determine texture name for this face
              let texName;
              if (blockDef.textures.all) {
                texName = blockDef.textures.all;
              } else if (face.name === 'top') {
                texName = blockDef.textures.top;
              } else if (face.name === 'bottom') {
                texName = blockDef.textures.bottom;
              } else {
                texName = blockDef.textures.side;
              }

              const batch = getBatch(texName, blockDef.transparent || blockDef.fluid);
              const c = face.corners;
              const norm = face.dir;
              const shade = face.ao;

              // Two triangles (6 vertices per quad)
              const v = [
                [wx + c[0][0], y + c[0][1], wz + c[0][2]],
                [wx + c[1][0], y + c[1][1], wz + c[1][2]],
                [wx + c[2][0], y + c[2][1], wz + c[2][2]],
                [wx + c[0][0], y + c[0][1], wz + c[0][2]],
                [wx + c[2][0], y + c[2][1], wz + c[2][2]],
                [wx + c[3][0], y + c[3][1], wz + c[3][2]]
              ];

              const uvs = [
                [0, 0], [1, 0], [1, 1],
                [0, 0], [1, 1], [0, 1]
              ];

              const cornerAOs = this.calculateFaceAO(wx, y, wz, face.name);
              const aoIndices = [0, 1, 2, 0, 2, 3];

              for (let i = 0; i < 6; i++) {
                batch.positions.push(v[i][0], v[i][1], v[i][2]);
                batch.normals.push(norm[0], norm[1], norm[2]);
                batch.uvs.push(uvs[i][0], uvs[i][1]);
                const vShade = shade * cornerAOs[aoIndices[i]];
                batch.colors.push(vShade, vShade, vShade);
              }
            }
          }
        }
      }
    }

    // Build Three.js Mesh per material batch
    Object.keys(materialBatches).forEach(matKey => {
      const b = materialBatches[matKey];
      if (b.positions.length === 0) return;

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(b.positions, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(b.normals, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(b.uvs, 2));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(b.colors, 3));

      let mat = this.materials[matKey];
      if (!mat) {
        const tex = window.mcTextures.getTexture(matKey);
        mat = new THREE.MeshLambertMaterial({
          map: tex,
          vertexColors: true,
          transparent: b.transparent,
          alphaTest: (b.transparent && matKey !== 'water' && matKey !== 'glass') ? 0.15 : 0.0,
          opacity: matKey === 'water' ? 0.68 : (matKey === 'glass' ? 0.85 : 1.0),
          side: ((b.transparent && matKey !== 'glass') || matKey === 'water') ? THREE.DoubleSide : THREE.FrontSide
        });
        this.materials[matKey] = mat;
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = !b.transparent;
      mesh.receiveShadow = true;
      chunkGroup.add(mesh);
    });
  }

  rebuildAllChunks() {
    for (const key of this.chunks.keys()) {
      const [cx, cz] = key.split(',').map(Number);
      this.rebuildChunk(cx, cz);
    }
  }

  // =========================================================================
  // DDA VOXEL RAYCASTING (Accurate block targeting up to 6 blocks reach)
  // =========================================================================
  raycastBlock(origin, direction, maxDistance = 6.0) {
    let px = origin.x;
    let py = origin.y;
    let pz = origin.z;

    const dx = direction.x;
    const dy = direction.y;
    const dz = direction.z;

    let ix = Math.floor(px);
    let iy = Math.floor(py);
    let iz = Math.floor(pz);

    const stepX = dx >= 0 ? 1 : -1;
    const stepY = dy >= 0 ? 1 : -1;
    const stepZ = dz >= 0 ? 1 : -1;

    const tDeltaX = dx !== 0 ? Math.abs(1 / dx) : Infinity;
    const tDeltaY = dy !== 0 ? Math.abs(1 / dy) : Infinity;
    const tDeltaZ = dz !== 0 ? Math.abs(1 / dz) : Infinity;

    let tMaxX = dx !== 0 ? (stepX > 0 ? (ix + 1 - px) * tDeltaX : (px - ix) * tDeltaX) : Infinity;
    let tMaxY = dy !== 0 ? (stepY > 0 ? (iy + 1 - py) * tDeltaY : (py - iy) * tDeltaY) : Infinity;
    let tMaxZ = dz !== 0 ? (stepZ > 0 ? (iz + 1 - pz) * tDeltaZ : (pz - iz) * tDeltaZ) : Infinity;

    let normal = new THREE.Vector3(0, 1, 0);
    let dist = 0;

    while (dist <= maxDistance) {
      const blockId = this.getBlock(ix, iy, iz);
      // Hit a solid block (ignore air & water for targeting)
      if (blockId > 0 && blockId !== 15) {
        return {
          x: ix,
          y: iy,
          z: iz,
          faceNormal: normal.clone(),
          blockId: blockId
        };
      }

      if (tMaxX < tMaxY) {
        if (tMaxX < tMaxZ) {
          dist = tMaxX;
          tMaxX += tDeltaX;
          ix += stepX;
          normal.set(-stepX, 0, 0);
        } else {
          dist = tMaxZ;
          tMaxZ += tDeltaZ;
          iz += stepZ;
          normal.set(0, 0, -stepZ);
        }
      } else {
        if (tMaxY < tMaxZ) {
          dist = tMaxY;
          tMaxY += tDeltaY;
          iy += stepY;
          normal.set(0, -stepY, 0);
        } else {
          dist = tMaxZ;
          tMaxZ += tDeltaZ;
          iz += stepZ;
          normal.set(0, 0, -stepZ);
        }
      }
    }

    return null;
  }

  // =========================================================================
  // BLOCK DESTRUCTION PARTICLES
  // =========================================================================
  spawnBreakParticles(x, y, z, blockId) {
    const blockDef = window.BLOCKS[blockId];
    if (!blockDef) return;

    const count = 12;
    const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const texName = blockDef.textures.all || blockDef.textures.side || 'stone';
    const tex = window.mcTextures.getTexture(texName);
    const pMat = new THREE.MeshLambertMaterial({ map: tex });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.position.set(
        x + 0.2 + Math.random() * 0.6,
        y + 0.2 + Math.random() * 0.6,
        z + 0.2 + Math.random() * 0.6
      );

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4.5,
        2.5 + Math.random() * 3.0,
        (Math.random() - 0.5) * 4.5
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel,
        life: 0.8 + Math.random() * 0.4
      });
    }
  }

  spawnCampfireSmoke(x, y, z) {
    if (this.particles.length > 50) return;
    const geo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    const isSpark = Math.random() < 0.35;
    const mat = new THREE.MeshBasicMaterial({
      color: isSpark ? 0xffaa22 : (Math.random() < 0.5 ? 0xcccccc : 0x888888),
      transparent: true,
      opacity: 0.75
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      x + 0.5 + (Math.random() - 0.5) * 0.3,
      y + 0.65,
      z + 0.5 + (Math.random() - 0.5) * 0.3
    );
    this.scene.add(mesh);
    this.particles.push({
      mesh,
      vel: new THREE.Vector3((Math.random() - 0.5) * 0.2, 1.2 + Math.random() * 0.8, (Math.random() - 0.5) * 0.2),
      life: 1.2 + Math.random() * 0.5,
      isSmoke: true
    });
  }

  updateParticles(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      if (p.isSmoke) {
        p.vel.y = Math.min(2.2, p.vel.y + delta * 0.4);
        p.mesh.position.addScaledVector(p.vel, delta);
        p.mesh.scale.multiplyScalar(1.0 + delta * 0.5);
      } else {
        p.vel.y -= 18.0 * delta; // Gravity
        p.mesh.position.addScaledVector(p.vel, delta);
        p.mesh.rotation.x += delta * 6;
        p.mesh.rotation.y += delta * 6;
      }

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  checkChunkStreaming(playerPos) {
    if (!playerPos) return;
    const pcx = Math.floor(playerPos.x / this.chunkSize);
    const pcz = Math.floor(playerPos.z / this.chunkSize);
    const streamRadius = 6;
    for (let cx = pcx - streamRadius; cx <= pcx + streamRadius; cx++) {
      for (let cz = pcz - streamRadius; cz <= pcz + streamRadius; cz++) {
        const key = this.getChunkKey(cx, cz);
        if (!this.chunks.has(key)) {
          this.generateChunkData(cx, cz);
          this.rebuildChunk(cx, cz);
          // Rebuild adjacent boundary chunks
          this.rebuildChunk(cx - 1, cz);
          this.rebuildChunk(cx + 1, cz);
          this.rebuildChunk(cx, cz - 1);
          this.rebuildChunk(cx, cz + 1);
          return; // Max 1 new chunk per tick to preserve 60 FPS
        }
      }
    }
  }

  update(delta, playerPos, onCollectItem) {
    this.updateParticles(delta);
    this.updateItemDrops(delta, playerPos, onCollectItem);
    this.checkChunkStreaming(playerPos);

    // Periodic ambient campfire smoke & spark embers near player
    this.smokeTimer = (this.smokeTimer || 0) + delta;
    if (this.smokeTimer > 0.18 && playerPos) {
      this.smokeTimer = 0;
      const px = Math.floor(playerPos.x);
      const py = Math.floor(playerPos.y);
      const pz = Math.floor(playerPos.z);
      const range = 8;
      for (let dx = -range; dx <= range; dx += 2) {
        for (let dz = -range; dz <= range; dz += 2) {
          for (let dy = -4; dy <= 4; dy++) {
            const bId = this.getBlock(px + dx, py + dy, pz + dz);
            if (bId === 63 || bId === 66) { // Campfire or Fireplace Hearth
              this.spawnCampfireSmoke(px + dx, py + dy, pz + dz);
            }
          }
        }
      }
    }

    // Drift clouds across sky
    if (this.cloudMesh && this.cloudMesh.material.map) {
      this.cloudMesh.material.map.offset.x = (this.cloudMesh.material.map.offset.x + delta * 0.005) % 1.0;
    }
  }
}

window.MinecraftWorld = MinecraftWorld;
