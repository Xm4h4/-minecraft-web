/**
 * Minecraft Web Edition - Wild Animals Simulation Engine
 * Implements passive wild animals: Sheep, Cows, Pigs, and Chickens
 * with 4-legged walking strides, grazing behaviors, panic flight when hunted,
 * authentic voice synthesis, and food/resource drops.
 */

class MinecraftAnimalManager {
  constructor(scene, world, game) {
    this.scene = scene;
    this.world = world;
    this.game = game;
    this.animals = [];
    this.spawnTimer = 0;
  }

  // Populate initial wild animals across the vast landscape
  spawnInitialAnimals() {
    const types = ['sheep', 'cow', 'pig', 'chicken'];
    for (let i = 0; i < 42; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 95;
      const x = Math.floor(this.game.playerPos.x + Math.cos(angle) * dist);
      const z = Math.floor(this.game.playerPos.z + Math.sin(angle) * dist);

      // Find surface
      let sy = -1;
      for (let y = 38; y >= 2; y--) {
        if (this.world.getBlock(x, y, z) === 2) { // Only spawn on lush grass
          sy = y + 1;
          break;
        }
      }

      if (sy > 0) {
        const type = types[i % types.length];
        this.createAnimal(type, x + 0.5, sy, z + 0.5);
      }
    }
  }

  createAnimal(type, x, y, z) {
    let animal;
    if (type === 'sheep') {
      animal = new SheepMob(this.scene, this.world, this.game, x, y, z);
    } else if (type === 'cow') {
      animal = new CowMob(this.scene, this.world, this.game, x, y, z);
    } else if (type === 'pig') {
      animal = new PigMob(this.scene, this.world, this.game, x, y, z);
    } else {
      animal = new ChickenMob(this.scene, this.world, this.game, x, y, z);
    }
    this.animals.push(animal);
    return animal;
  }

  update(delta, playerPos) {
    for (let i = this.animals.length - 1; i >= 0; i--) {
      const animal = this.animals[i];
      animal.update(delta, playerPos);

      if (animal.isDead) {
        this.scene.remove(animal.mesh);
        this.animals.splice(i, 1);
      }
    }

    // Gentle respawn if animal count gets low
    this.spawnTimer += delta;
    if (this.spawnTimer > 10.0 && this.animals.length < 16) {
      this.spawnTimer = 0;
      const angle = Math.random() * Math.PI * 2;
      const dist = 25 + Math.random() * 35;
      const sx = Math.floor(playerPos.x + Math.cos(angle) * dist);
      const sz = Math.floor(playerPos.z + Math.sin(angle) * dist);

      for (let y = 35; y >= 2; y--) {
        if (this.world.getBlock(sx, y, sz) === 2) {
          const types = ['sheep', 'cow', 'pig', 'chicken'];
          this.createAnimal(types[Math.floor(Math.random() * types.length)], sx + 0.5, y + 1, sz + 0.5);
          break;
        }
      }
    }
  }

  checkPlayerHunt(origin, dir, reach = 3.8) {
    for (let i = 0; i < this.animals.length; i++) {
      const animal = this.animals[i];
      if (animal.isDead) continue;

      const center = animal.pos.clone().add(new THREE.Vector3(0, animal.height / 2, 0));
      const toAnimal = center.clone().sub(origin);
      const dist = toAnimal.length();

      if (dist <= reach) {
        toAnimal.normalize();
        const dot = dir.dot(toAnimal);
        if (dot > 0.72) {
          const activeItem = this.game.hotbar[this.game.activeHotbarSlot];
          let dmg = 2; // Hand punch
          if (activeItem && activeItem.id === 28) dmg = 7; // Diamond Sword
          else if (activeItem && activeItem.id === 29) dmg = 4; // Iron Pickaxe

          animal.takeDamage(dmg, origin);
          return true;
        }
      }
    }
    return false;
  }
}

// ===========================================================================
// BASE WILD ANIMAL CLASS (Grazing, Wandering, Panic Running)
// ===========================================================================
class BaseAnimal {
  constructor(scene, world, game, x, y, z) {
    this.scene = scene;
    this.world = world;
    this.game = game;
    this.pos = new THREE.Vector3(x, y, z);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.yaw = Math.random() * Math.PI * 2;
    this.targetYaw = this.yaw;
    this.isGrounded = false;

    this.health = 10;
    this.maxHealth = 10;
    this.isDead = false;
    this.hurtTimer = 0;

    // AI & Behaviors
    this.walkAnimTime = 0;
    this.voiceTimer = 3 + Math.random() * 8;
    this.wanderTimer = 0;
    this.isWandering = false;
    this.wanderAngle = this.yaw;
    this.isGrazing = false;
    this.grazeTimer = 0;

    // Panic running when hunted
    this.panicTimer = 0;

    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.pos);
    this.scene.add(this.mesh);
  }

  setHurtVisuals(isHurt) {
    this.mesh.traverse(c => {
      if (c.isMesh) {
        if (c.userData.baseColor === undefined) {
          c.userData.baseColor = (c.material && c.material.color) ? c.material.color.getHex() : 0xffffff;
        }
        if (isHurt) {
          if (c.material && c.material.color) c.material.color.setHex(0xff3333);
        } else {
          if (c.material && c.material.color) c.material.color.setHex(c.userData.baseColor);
        }
      }
    });
  }

  takeDamage(amount, attackerPos) {
    if (this.isDead) return;
    this.health -= amount;
    this.hurtTimer = 0.25;
    this.panicTimer = 3.5; // Run away frantically in panic!
    this.isGrazing = false;
    this.setHurtVisuals(true);

    // Panic flee direction away from attacker
    const fleeDir = this.pos.clone().sub(attackerPos);
    fleeDir.y = 0;
    fleeDir.normalize();
    this.targetYaw = Math.atan2(fleeDir.x, fleeDir.z) + Math.PI;

    // Knockback
    this.vel.x = fleeDir.x * 5.0;
    this.vel.z = fleeDir.z * 5.0;
    this.vel.y = 4.5;

    if (window.mcAudio) {
      window.mcAudio.playMineHit('wood');
      this.playVoiceSound();
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    if (window.mcAudio) window.mcAudio.playLevelUpChime();
    this.game.addXP(3);
    this.dropLoot();
    this.game.showPopupNotice(`HUNTED ${this.name.toUpperCase()}!`);
  }

  dropLoot() {
    // Overridden by specific animal
  }

  playVoiceSound() {
    // Overridden by specific animal
  }

  updatePhysics(delta) {
    this.vel.y -= 26.0 * delta;

    if (this.isGrounded) {
      this.vel.x *= Math.pow(0.15, delta);
      this.vel.z *= Math.pow(0.15, delta);
    } else {
      this.vel.x *= Math.pow(0.5, delta);
      this.vel.z *= Math.pow(0.5, delta);
    }

    this.resolveCollision('x', this.vel.x * delta);
    this.resolveCollision('z', this.vel.z * delta);
    this.resolveCollision('y', this.vel.y * delta);

    this.mesh.position.copy(this.pos);
    this.mesh.rotation.y = this.yaw;
  }

  resolveCollision(axis, deltaMove) {
    const radius = 0.35;
    this.pos[axis] += deltaMove;

    const minX = Math.floor(this.pos.x - radius);
    const maxX = Math.floor(this.pos.x + radius);
    const minY = Math.floor(this.pos.y);
    const maxY = Math.floor(this.pos.y + this.height);
    const minZ = Math.floor(this.pos.z - radius);
    const maxZ = Math.floor(this.pos.z + radius);

    let hitWall = false;

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const bId = this.world.getBlock(x, y, z);
          const bDef = window.BLOCKS[bId];

          if (bDef && bDef.solid) {
            if (axis === 'x') {
              if (deltaMove > 0) this.pos.x = x - radius - 0.001;
              else if (deltaMove < 0) this.pos.x = x + 1 + radius + 0.001;
              this.vel.x = 0;
              hitWall = true;
            } else if (axis === 'z') {
              if (deltaMove > 0) this.pos.z = z - radius - 0.001;
              else if (deltaMove < 0) this.pos.z = z + 1 + radius + 0.001;
              this.vel.z = 0;
              hitWall = true;
            } else if (axis === 'y') {
              if (deltaMove > 0) {
                this.pos.y = y - this.height - 0.001;
                this.vel.y = 0;
              } else if (deltaMove < 0) {
                this.pos.y = y + 1;
                this.vel.y = 0;
                this.isGrounded = true;
              }
            }
          }
        }
      }
    }

    // Step-up jump when walking into 1-block terrain
    if (hitWall && this.isGrounded && (axis === 'x' || axis === 'z')) {
      const footY = Math.floor(this.pos.y);
      const lookX = -Math.sin(this.yaw) * 0.45;
      const lookZ = -Math.cos(this.yaw) * 0.45;
      const frontSolid = this.world.getBlock(Math.floor(this.pos.x + lookX), footY, Math.floor(this.pos.z + lookZ)) > 0;
      const spaceAbove = this.world.getBlock(Math.floor(this.pos.x + lookX), footY + 1, Math.floor(this.pos.z + lookZ)) === 0;

      if (frontSolid && spaceAbove) {
        this.vel.y = 7.6;
        this.isGrounded = false;
      }
    }
  }
}

// ===========================================================================
// 1. SHEEP (Fluffy White Wool, Grazes Grass, Drops Wool & Mutton)
// ===========================================================================
class SheepMob extends BaseAnimal {
  constructor(scene, world, game, x, y, z) {
    super(scene, world, game, x, y, z);
    this.name = 'Sheep';
    this.height = 1.3;
    this.buildModel();
  }

  buildModel() {
    const woolMat = new THREE.MeshLambertMaterial({
      map: window.mcTextures.getTexture('white_wool')
    });
    const skinMat = new THREE.MeshLambertMaterial({
      color: 0xdfb89b // Tan skin
    });
    const faceMat = new THREE.MeshLambertMaterial({
      map: window.mcTextures.getTexture('sheep_face')
    });

    // 1. Body (Fluffy wool cube: 0.65w x 0.65h x 0.95d)
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.65, 0.95), woolMat);
    bodyMesh.position.set(0, 0.72, 0);
    bodyMesh.castShadow = true;
    bodyMesh.userData.baseColor = 0xffffff;
    this.mesh.add(bodyMesh);

    // 2. Head Group (with neck pivot for grazing animation!)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.88, -0.5);
    this.mesh.add(this.headGroup);

    // Head Box (face on -Z)
    const headMats = [
      woolMat, woolMat, woolMat, skinMat, woolMat, faceMat
    ];
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.48), headMats);
    headMesh.position.set(0, 0, -0.15);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // 3. Four Stubby Legs with Top Hip Pivots
    const legGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);

    this.legFL = new THREE.Group();
    this.legFL.position.set(-0.22, 0.5, -0.32);
    const mFL = new THREE.Mesh(legGeo, woolMat);
    mFL.position.y = -0.25;
    this.legFL.add(mFL);
    this.mesh.add(this.legFL);

    this.legFR = new THREE.Group();
    this.legFR.position.set(0.22, 0.5, -0.32);
    const mFR = new THREE.Mesh(legGeo, woolMat);
    mFR.position.y = -0.25;
    this.legFR.add(mFR);
    this.mesh.add(this.legFR);

    this.legBL = new THREE.Group();
    this.legBL.position.set(-0.22, 0.5, 0.32);
    const mBL = new THREE.Mesh(legGeo, woolMat);
    mBL.position.y = -0.25;
    this.legBL.add(mBL);
    this.mesh.add(this.legBL);

    this.legBR = new THREE.Group();
    this.legBR.position.set(0.22, 0.5, 0.32);
    const mBR = new THREE.Mesh(legGeo, woolMat);
    mBR.position.y = -0.25;
    this.legBR.add(mBR);
    this.mesh.add(this.legBR);
  }

  playVoiceSound() {
    if (window.mcAudio) window.mcAudio.playSheepBaa();
  }

  dropLoot() {
    // Drops White Wool (id=30) and Raw Mutton (id=32)
    this.world.spawnItemDrop(this.pos.x, this.pos.y, this.pos.z, 30);
    this.world.spawnItemDrop(this.pos.x + 0.3, this.pos.y, this.pos.z, 32);
  }

  update(delta, playerPos) {
    if (this.isDead) return;

    // Hurt flashing
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      if (this.hurtTimer <= 0) {
        this.setHurtVisuals(false);
      }
    }

    // Voice sound
    this.voiceTimer -= delta;
    if (this.voiceTimer <= 0) {
      this.voiceTimer = 8 + Math.random() * 12;
      const dist = this.pos.distanceTo(playerPos);
      if (dist < 18) this.playVoiceSound();
    }

    // PANIC FLEEING (When struck by player)
    let isMoving = false;
    let speed = 1.3;

    if (this.panicTimer > 0) {
      this.panicTimer -= delta;
      speed = 4.8; // High speed sprint!
      this.yaw += (this.targetYaw - this.yaw) * Math.min(1.0, delta * 6.0);
      this.vel.x = -Math.sin(this.yaw) * speed;
      this.vel.z = -Math.cos(this.yaw) * speed;
      isMoving = true;
    } else {
      // PEACEFUL WANDERING & GRAZING
      this.wanderTimer -= delta;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 3.5 + Math.random() * 4.5;
        const rand = Math.random();
        if (rand < 0.4) {
          // Graze on grass
          this.isGrazing = true;
          this.isWandering = false;
          this.grazeTimer = 2.5;
        } else if (rand < 0.8) {
          // Wander
          this.isWandering = true;
          this.isGrazing = false;
          this.wanderAngle = this.yaw + (Math.random() - 0.5) * Math.PI * 1.5;
        } else {
          // Stand still
          this.isWandering = false;
          this.isGrazing = false;
        }
      }

      if (this.isGrazing) {
        this.grazeTimer -= delta;
        // Head dips down to munch grass!
        this.headGroup.rotation.x = THREE.MathUtils.lerp(this.headGroup.rotation.x, 0.75, 0.1);
        this.vel.x = 0;
        this.vel.z = 0;
        if (this.grazeTimer <= 0) this.isGrazing = false;
      } else {
        this.headGroup.rotation.x = THREE.MathUtils.lerp(this.headGroup.rotation.x, 0, 0.1);
      }

      if (this.isWandering) {
        this.targetYaw = this.wanderAngle;
        const diff = (this.targetYaw - this.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        this.yaw += diff * Math.min(1.0, delta * 3.5);
        this.vel.x = -Math.sin(this.yaw) * speed;
        this.vel.z = -Math.cos(this.yaw) * speed;
        isMoving = true;
      }
    }

    // 4-legged walking animation
    if (isMoving) {
      this.walkAnimTime += delta * (this.panicTimer > 0 ? 14 : 7);
      this.legFL.rotation.x = Math.sin(this.walkAnimTime) * 0.7;
      this.legBR.rotation.x = Math.sin(this.walkAnimTime) * 0.7;
      this.legFR.rotation.x = -Math.sin(this.walkAnimTime) * 0.7;
      this.legBL.rotation.x = -Math.sin(this.walkAnimTime) * 0.7;
    } else {
      this.legFL.rotation.x *= 0.1;
      this.legFR.rotation.x *= 0.1;
      this.legBL.rotation.x *= 0.1;
      this.legBR.rotation.x *= 0.1;
    }

    this.updatePhysics(delta);
  }
}

// ===========================================================================
// 2. COW (Brown Coat, Horns, Snout, Drops Beef & Leather)
// ===========================================================================
class CowMob extends BaseAnimal {
  constructor(scene, world, game, x, y, z) {
    super(scene, world, game, x, y, z);
    this.name = 'Cow';
    this.height = 1.4;
    this.buildModel();
  }

  buildModel() {
    const coatMat = new THREE.MeshLambertMaterial({ color: 0x613b1e }); // Brown coat
    const faceMat = new THREE.MeshLambertMaterial({ map: window.mcTextures.getTexture('cow_face') });
    const hornMat = new THREE.MeshLambertMaterial({ color: 0xbbbbbb }); // Horns
    const udderMat = new THREE.MeshLambertMaterial({ color: 0xd49987 }); // Pink

    // 1. Body (0.75w x 0.75h x 1.1d)
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 1.1), coatMat);
    bodyMesh.position.set(0, 0.78, 0);
    bodyMesh.castShadow = true;
    this.mesh.add(bodyMesh);

    // 2. Head with Horns
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.05, -0.6);
    this.mesh.add(this.headGroup);

    const headMats = [coatMat, coatMat, coatMat, udderMat, coatMat, faceMat];
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), headMats);
    headMesh.position.set(0, 0, -0.12);
    this.headGroup.add(headMesh);

    // Horns
    const hL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.1), hornMat);
    hL.position.set(-0.25, 0.28, -0.12);
    this.headGroup.add(hL);

    const hR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.1), hornMat);
    hR.position.set(0.25, 0.28, -0.12);
    this.headGroup.add(hR);

    // 3. Four Legs
    const legGeo = new THREE.BoxGeometry(0.22, 0.55, 0.22);
    this.legFL = new THREE.Group();
    this.legFL.position.set(-0.25, 0.55, -0.38);
    const mFL = new THREE.Mesh(legGeo, coatMat);
    mFL.position.y = -0.275;
    this.legFL.add(mFL);
    this.mesh.add(this.legFL);

    this.legFR = new THREE.Group();
    this.legFR.position.set(0.25, 0.55, -0.38);
    const mFR = new THREE.Mesh(legGeo, coatMat);
    mFR.position.y = -0.275;
    this.legFR.add(mFR);
    this.mesh.add(this.legFR);

    this.legBL = new THREE.Group();
    this.legBL.position.set(-0.25, 0.55, 0.38);
    const mBL = new THREE.Mesh(legGeo, coatMat);
    mBL.position.y = -0.275;
    this.legBL.add(mBL);
    this.mesh.add(this.legBL);

    this.legBR = new THREE.Group();
    this.legBR.position.set(0.25, 0.55, 0.38);
    const mBR = new THREE.Mesh(legGeo, coatMat);
    mBR.position.y = -0.275;
    this.legBR.add(mBR);
    this.mesh.add(this.legBR);
  }

  playVoiceSound() {
    if (window.mcAudio) window.mcAudio.playCowMoo();
  }

  dropLoot() {
    // Drops Raw Beef (id=31)
    this.world.spawnItemDrop(this.pos.x, this.pos.y, this.pos.z, 31);
    this.world.spawnItemDrop(this.pos.x + 0.3, this.pos.y, this.pos.z, 31);
  }

  update(delta, playerPos) {
    if (this.isDead) return;

    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      if (this.hurtTimer <= 0) {
        this.setHurtVisuals(false);
      }
    }

    this.voiceTimer -= delta;
    if (this.voiceTimer <= 0) {
      this.voiceTimer = 10 + Math.random() * 15;
      const dist = this.pos.distanceTo(playerPos);
      if (dist < 18) this.playVoiceSound();
    }

    let isMoving = false;
    let speed = 1.2;

    if (this.panicTimer > 0) {
      this.panicTimer -= delta;
      speed = 4.5;
      this.yaw += (this.targetYaw - this.yaw) * Math.min(1.0, delta * 6.0);
      this.vel.x = -Math.sin(this.yaw) * speed;
      this.vel.z = -Math.cos(this.yaw) * speed;
      isMoving = true;
    } else {
      this.wanderTimer -= delta;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 4 + Math.random() * 5;
        this.isWandering = Math.random() < 0.6;
        this.wanderAngle = this.yaw + (Math.random() - 0.5) * Math.PI * 1.5;
      }

      if (this.isWandering) {
        this.targetYaw = this.wanderAngle;
        const diff = (this.targetYaw - this.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        this.yaw += diff * Math.min(1.0, delta * 3.0);
        this.vel.x = -Math.sin(this.yaw) * speed;
        this.vel.z = -Math.cos(this.yaw) * speed;
        isMoving = true;
      }
    }

    if (isMoving) {
      this.walkAnimTime += delta * (this.panicTimer > 0 ? 13 : 6.5);
      this.legFL.rotation.x = Math.sin(this.walkAnimTime) * 0.7;
      this.legBR.rotation.x = Math.sin(this.walkAnimTime) * 0.7;
      this.legFR.rotation.x = -Math.sin(this.walkAnimTime) * 0.7;
      this.legBL.rotation.x = -Math.sin(this.walkAnimTime) * 0.7;
    } else {
      this.legFL.rotation.x *= 0.1;
      this.legFR.rotation.x *= 0.1;
      this.legBL.rotation.x *= 0.1;
      this.legBR.rotation.x *= 0.1;
    }

    this.updatePhysics(delta);
  }
}

// ===========================================================================
// 3. PIG (Pink Body, Protruding Snout, Drops Porkchops)
// ===========================================================================
class PigMob extends BaseAnimal {
  constructor(scene, world, game, x, y, z) {
    super(scene, world, game, x, y, z);
    this.name = 'Pig';
    this.height = 1.0;
    this.buildModel();
  }

  buildModel() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xf09890 }); // Pink skin
    const faceMat = new THREE.MeshLambertMaterial({ map: window.mcTextures.getTexture('pig_face') });
    const snoutMat = new THREE.MeshLambertMaterial({ color: 0xd6685e }); // Darker snout

    // 1. Body (0.65w x 0.55h x 0.9d)
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.9), skinMat);
    bodyMesh.position.set(0, 0.55, 0);
    this.mesh.add(bodyMesh);

    // 2. Head & Snout
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.75, -0.45);
    this.mesh.add(this.headGroup);

    const headMats = [skinMat, skinMat, skinMat, skinMat, skinMat, faceMat];
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), headMats);
    headMesh.position.set(0, 0, -0.15);
    this.headGroup.add(headMesh);

    // Snout
    const snoutMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.1), snoutMat);
    snoutMesh.position.set(0, -0.06, -0.42);
    this.headGroup.add(snoutMesh);

    // 3. Four Stubby Legs
    const legGeo = new THREE.BoxGeometry(0.18, 0.35, 0.18);
    this.legFL = new THREE.Group();
    this.legFL.position.set(-0.2, 0.35, -0.28);
    const mFL = new THREE.Mesh(legGeo, skinMat);
    mFL.position.y = -0.175;
    this.legFL.add(mFL);
    this.mesh.add(this.legFL);

    this.legFR = new THREE.Group();
    this.legFR.position.set(0.2, 0.35, -0.28);
    const mFR = new THREE.Mesh(legGeo, skinMat);
    mFR.position.y = -0.175;
    this.legFR.add(mFR);
    this.mesh.add(this.legFR);

    this.legBL = new THREE.Group();
    this.legBL.position.set(-0.2, 0.35, 0.28);
    const mBL = new THREE.Mesh(legGeo, skinMat);
    mBL.position.y = -0.175;
    this.legBL.add(mBL);
    this.mesh.add(this.legBL);

    this.legBR = new THREE.Group();
    this.legBR.position.set(0.2, 0.35, 0.28);
    const mBR = new THREE.Mesh(legGeo, skinMat);
    mBR.position.y = -0.175;
    this.legBR.add(mBR);
    this.mesh.add(this.legBR);
  }

  playVoiceSound() {
    if (window.mcAudio) window.mcAudio.playPigOink();
  }

  dropLoot() {
    // Drops Cooked Porkchop (id=27)
    this.world.spawnItemDrop(this.pos.x, this.pos.y, this.pos.z, 27);
  }

  update(delta, playerPos) {
    if (this.isDead) return;

    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      if (this.hurtTimer <= 0) {
        this.setHurtVisuals(false);
      }
    }

    this.voiceTimer -= delta;
    if (this.voiceTimer <= 0) {
      this.voiceTimer = 7 + Math.random() * 10;
      const dist = this.pos.distanceTo(playerPos);
      if (dist < 18) this.playVoiceSound();
    }

    let isMoving = false;
    let speed = 1.35;

    if (this.panicTimer > 0) {
      this.panicTimer -= delta;
      speed = 5.0;
      this.yaw += (this.targetYaw - this.yaw) * Math.min(1.0, delta * 6.0);
      this.vel.x = -Math.sin(this.yaw) * speed;
      this.vel.z = -Math.cos(this.yaw) * speed;
      isMoving = true;
    } else {
      this.wanderTimer -= delta;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 3 + Math.random() * 4;
        this.isWandering = Math.random() < 0.65;
        this.wanderAngle = this.yaw + (Math.random() - 0.5) * Math.PI * 1.5;
      }

      if (this.isWandering) {
        this.targetYaw = this.wanderAngle;
        const diff = (this.targetYaw - this.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        this.yaw += diff * Math.min(1.0, delta * 3.5);
        this.vel.x = -Math.sin(this.yaw) * speed;
        this.vel.z = -Math.cos(this.yaw) * speed;
        isMoving = true;
      }
    }

    if (isMoving) {
      this.walkAnimTime += delta * (this.panicTimer > 0 ? 15 : 8);
      this.legFL.rotation.x = Math.sin(this.walkAnimTime) * 0.7;
      this.legBR.rotation.x = Math.sin(this.walkAnimTime) * 0.7;
      this.legFR.rotation.x = -Math.sin(this.walkAnimTime) * 0.7;
      this.legBL.rotation.x = -Math.sin(this.walkAnimTime) * 0.7;
    } else {
      this.legFL.rotation.x *= 0.1;
      this.legFR.rotation.x *= 0.1;
      this.legBL.rotation.x *= 0.1;
      this.legBR.rotation.x *= 0.1;
    }

    this.updatePhysics(delta);
  }
}

// ===========================================================================
// 4. CHICKEN (White Feathers, Beak, Red Wattle, Drops Feathers & Food)
// ===========================================================================
class ChickenMob extends BaseAnimal {
  constructor(scene, world, game, x, y, z) {
    super(scene, world, game, x, y, z);
    this.name = 'Chicken';
    this.height = 0.8;
    this.buildModel();
  }

  buildModel() {
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const faceMat = new THREE.MeshLambertMaterial({ map: window.mcTextures.getTexture('chicken_face') });
    const legMat = new THREE.MeshLambertMaterial({ color: 0xffaa00 });

    // 1. Body (0.35w x 0.35h x 0.45d)
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.45), whiteMat);
    bodyMesh.position.set(0, 0.45, 0);
    this.mesh.add(bodyMesh);

    // 2. Head
    const headMats = [whiteMat, whiteMat, whiteMat, whiteMat, whiteMat, faceMat];
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.32, 0.25), headMats);
    headMesh.position.set(0, 0.72, -0.22);
    this.mesh.add(headMesh);

    // 3. Legs
    const legGeo = new THREE.BoxGeometry(0.06, 0.3, 0.06);
    this.legL = new THREE.Group();
    this.legL.position.set(-0.1, 0.3, 0);
    const mL = new THREE.Mesh(legGeo, legMat);
    mL.position.y = -0.15;
    this.legL.add(mL);
    this.mesh.add(this.legL);

    this.legR = new THREE.Group();
    this.legR.position.set(0.1, 0.3, 0);
    const mR = new THREE.Mesh(legGeo, legMat);
    mR.position.y = -0.15;
    this.legR.add(mR);
    this.mesh.add(this.legR);
  }

  playVoiceSound() {
    if (window.mcAudio) window.mcAudio.playChickenCluck();
  }

  dropLoot() {
    this.world.spawnItemDrop(this.pos.x, this.pos.y, this.pos.z, 33); // Feather
  }

  update(delta, playerPos) {
    if (this.isDead) return;

    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      if (this.hurtTimer <= 0) {
        this.setHurtVisuals(false);
      }
    }

    this.voiceTimer -= delta;
    if (this.voiceTimer <= 0) {
      this.voiceTimer = 6 + Math.random() * 8;
      const dist = this.pos.distanceTo(playerPos);
      if (dist < 18) this.playVoiceSound();
    }

    let isMoving = false;
    let speed = 1.2;

    if (this.panicTimer > 0) {
      this.panicTimer -= delta;
      speed = 4.2;
      this.yaw += (this.targetYaw - this.yaw) * Math.min(1.0, delta * 6.0);
      this.vel.x = -Math.sin(this.yaw) * speed;
      this.vel.z = -Math.cos(this.yaw) * speed;
      isMoving = true;
    } else {
      this.wanderTimer -= delta;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 3 + Math.random() * 4;
        this.isWandering = Math.random() < 0.6;
        this.wanderAngle = this.yaw + (Math.random() - 0.5) * Math.PI * 1.5;
      }

      if (this.isWandering) {
        this.targetYaw = this.wanderAngle;
        const diff = (this.targetYaw - this.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        this.yaw += diff * Math.min(1.0, delta * 3.5);
        this.vel.x = -Math.sin(this.yaw) * speed;
        this.vel.z = -Math.cos(this.yaw) * speed;
        isMoving = true;
      }
    }

    if (isMoving) {
      this.walkAnimTime += delta * 9;
      this.legL.rotation.x = Math.sin(this.walkAnimTime) * 0.7;
      this.legR.rotation.x = -Math.sin(this.walkAnimTime) * 0.7;
    } else {
      this.legL.rotation.x *= 0.1;
      this.legR.rotation.x *= 0.1;
    }

    this.updatePhysics(delta);
  }
}

window.MinecraftAnimalManager = MinecraftAnimalManager;
window.SheepMob = SheepMob;
window.CowMob = CowMob;
window.PigMob = PigMob;
window.ChickenMob = ChickenMob;
