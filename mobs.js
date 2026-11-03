/**
 * Minecraft Web Edition - Hostile & Passive Mob Simulation Engine
 * Implements authentic Minecraft Zombies with canonical joint hierarchies,
 * hip/shoulder limb pivots, shambling gait, smooth turning, obstacle jumping,
 * attack lunges, daylight combustion, and Creeper stalker mechanics.
 */

class MinecraftMobManager {
  constructor(scene, world, game) {
    this.scene = scene;
    this.world = world;
    this.game = game;
    this.mobs = [];
    this.spawnTimer = 0;
  }

  update(delta, playerPos) {
    // 1. Update existing mobs
    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      mob.update(delta, playerPos);

      // Remove dead mobs
      if (mob.isDead) {
        this.scene.remove(mob.mesh);
        this.mobs.splice(i, 1);
      }
    }

    // 2. Peaceful mode removes all hostiles
    if (this.game.gameRules.difficulty === 'Peaceful') {
      if (this.mobs.length > 0) {
        this.mobs.forEach(m => this.scene.remove(m.mesh));
        this.mobs = [];
      }
      return;
    }

    if (!this.game.gameRules.doMobSpawning) return;

    // 3. Nighttime spawning
    this.spawnTimer += delta;
    if (this.spawnTimer > 4.5 && this.mobs.length < 7) {
      this.spawnTimer = 0;
      this.trySpawnMob(playerPos);
    }
  }

  trySpawnMob(playerPos) {
    const isNight = (this.game.worldTime > 12500 && this.game.worldTime < 23500);
    if (!isNight) return;

    // Random location 14 to 28 blocks away from player
    const angle = Math.random() * Math.PI * 2;
    const dist = 14 + Math.random() * 12;
    const sx = Math.floor(playerPos.x + Math.cos(angle) * dist);
    const sz = Math.floor(playerPos.z + Math.sin(angle) * dist);

    let sy = -1;
    for (let y = 35; y >= 2; y--) {
      if (this.world.getBlock(sx, y, sz) > 0) {
        sy = y + 1;
        break;
      }
    }

    if (sy > 0 && this.world.getBlock(sx, sy, sz) === 0 && this.world.getBlock(sx, sy + 1, sz) === 0) {
      const mobType = Math.random() < 0.65 ? 'zombie' : 'creeper';
      if (mobType === 'zombie') {
        const zombie = new ZombieMob(this.scene, this.world, this.game, sx + 0.5, sy, sz + 0.5);
        this.mobs.push(zombie);
      } else {
        const creeper = new CreeperMob(this.scene, this.world, this.game, sx + 0.5, sy, sz + 0.5);
        this.mobs.push(creeper);
      }
    }
  }

  checkPlayerAttack(origin, dir, reach = 3.8) {
    for (let i = 0; i < this.mobs.length; i++) {
      const mob = this.mobs[i];
      if (mob.isDead) continue;

      const mobCenter = mob.pos.clone().add(new THREE.Vector3(0, mob.height / 2, 0));
      const toMob = mobCenter.clone().sub(origin);
      const dist = toMob.length();

      if (dist <= reach) {
        toMob.normalize();
        const dot = dir.dot(toMob);
        if (dot > 0.78) {
          const activeItem = this.game.hotbar[this.game.activeHotbarSlot];
          let dmg = 2; // Hand punch
          if (activeItem && activeItem.id === 28) dmg = 7; // Diamond Sword
          else if (activeItem && activeItem.id === 29) dmg = 4; // Iron Pickaxe

          mob.takeDamage(dmg, origin);
          return true;
        }
      }
    }
    return false;
  }
}

// ===========================================================================
// BASE MOB CLASS WITH SEPARATE AXIS AABB & VOXEL JUMP PHYSICS
// ===========================================================================
class BaseMob {
  constructor(scene, world, game, x, y, z) {
    this.scene = scene;
    this.world = world;
    this.game = game;
    this.pos = new THREE.Vector3(x, y, z);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.yaw = Math.random() * Math.PI * 2;
    this.targetYaw = this.yaw;
    this.isGrounded = false;

    this.health = 20;
    this.maxHealth = 20;
    this.isDead = false;
    this.hurtTimer = 0;
    this.stunTimer = 0;

    // Root Three.js Group
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.pos);
    this.scene.add(this.mesh);
  }

  takeDamage(amount, attackerPos) {
    if (this.isDead) return;
    this.health -= amount;
    this.hurtTimer = 0.28;
    this.stunTimer = 0.35; // Brief hit stun before resuming pursuit

    // Knockback
    const knockDir = this.pos.clone().sub(attackerPos);
    knockDir.y = 0;
    knockDir.normalize();
    this.vel.x = knockDir.x * 6.5;
    this.vel.z = knockDir.z * 6.5;
    this.vel.y = 5.2;

    if (window.mcAudio) {
      window.mcAudio.playMineHit('wood');
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    if (window.mcAudio) {
      window.mcAudio.playLevelUpChime();
    }
    this.game.addXP(5);
    this.game.showPopupNotice(`${this.name.toUpperCase()} DEFEATED (+5 XP)!`);
  }

  checkOpenSky() {
    const bx = Math.floor(this.pos.x);
    const by = Math.floor(this.pos.y + this.height);
    const bz = Math.floor(this.pos.z);
    for (let y = by; y < 48; y++) {
      const bId = this.world.getBlock(bx, y, bz);
      const bDef = window.BLOCKS[bId];
      if (bDef && bDef.solid && !bDef.transparent) {
        return false;
      }
    }
    return true;
  }

  updatePhysics(delta) {
    // Gravity
    this.vel.y -= 26.0 * delta;

    // Ground friction
    if (this.isGrounded) {
      this.vel.x *= Math.pow(0.12, delta);
      this.vel.z *= Math.pow(0.12, delta);
    } else {
      this.vel.x *= Math.pow(0.4, delta);
      this.vel.z *= Math.pow(0.4, delta);
    }

    // Separate Axis AABB Collisions
    this.resolveCollision('x', this.vel.x * delta);
    this.resolveCollision('z', this.vel.z * delta);
    this.resolveCollision('y', this.vel.y * delta);

    // Sync Root Mesh Position
    this.mesh.position.copy(this.pos);
    this.mesh.rotation.y = this.yaw;
  }

  resolveCollision(axis, deltaMove) {
    const radius = 0.3;
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

    // VOXEL JUMP: If walking into a 1-block obstacle and grounded, jump!
    if (hitWall && this.isGrounded && (axis === 'x' || axis === 'z')) {
      const footY = Math.floor(this.pos.y);
      const lookX = -Math.sin(this.yaw) * 0.45;
      const lookZ = -Math.cos(this.yaw) * 0.45;
      const frontSolid = this.world.getBlock(Math.floor(this.pos.x + lookX), footY, Math.floor(this.pos.z + lookZ)) > 0;
      const spaceAbove = this.world.getBlock(Math.floor(this.pos.x + lookX), footY + 1, Math.floor(this.pos.z + lookZ)) === 0;

      if (frontSolid && spaceAbove) {
        this.vel.y = 7.8; // Authentic Minecraft mob jump impulse
        this.isGrounded = false;
      }
    }
  }
}

// ===========================================================================
// ZOMBIE MOB (Canonical Proportions, Hip/Shoulder Pivots, Shambling Gait)
// ===========================================================================
class ZombieMob extends BaseMob {
  constructor(scene, world, game, x, y, z) {
    super(scene, world, game, x, y, z);
    this.name = 'Zombie';
    this.height = 1.95;

    // Animation & Gait Timers
    this.walkAnimTime = 0;
    this.groanTimer = 2.5 + Math.random() * 5;
    this.attackCooldown = 0;
    this.attackAnimProgress = 0;

    // AI Wandering state
    this.wanderTimer = 0;
    this.wanderAngle = this.yaw;
    this.isWandering = false;

    // Daylight burning
    this.isOnFire = false;
    this.fireTimer = 0;

    this.buildModel();
  }

  // =========================================================================
  // CANONICAL MINECRAFT HUMANOID HIERARCHY WITH JOINT PIVOTS
  // =========================================================================
  buildModel() {
    const skinMat = new THREE.MeshLambertMaterial({
      color: 0x567c34 // Green skin
    });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x228888 }); // Teal shirt
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x222277 }); // Dark blue trousers

    // 1. Torso Pivot Group (y = 0.75, at waist)
    this.torso = new THREE.Group();
    this.torso.position.set(0, 0.75, 0);
    this.mesh.add(this.torso);

    // Torso box: 0.5w x 0.75h x 0.25d, center at +0.375
    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.25), shirtMat);
    torsoMesh.position.y = 0.375;
    torsoMesh.castShadow = true;
    torsoMesh.userData.baseColor = 0x228888;
    this.torso.add(torsoMesh);

    // 2. Head Pivot Group (on top of torso at y = 0.75)
    this.head = new THREE.Group();
    this.head.position.set(0, 0.75, 0);
    this.torso.add(this.head);

    // Head 6-material cube: face at -Z (index 5)
    const headMaterials = [
      new THREE.MeshLambertMaterial({ map: window.mcTextures.getTexture('zombie_head_side') }), // +x right
      new THREE.MeshLambertMaterial({ map: window.mcTextures.getTexture('zombie_head_side') }), // -x left
      new THREE.MeshLambertMaterial({ map: window.mcTextures.getTexture('zombie_head_top') }),  // +y top
      new THREE.MeshLambertMaterial({ color: 0x567c34 }),                                       // -y bottom
      new THREE.MeshLambertMaterial({ map: window.mcTextures.getTexture('zombie_head_top') }),  // +z back
      new THREE.MeshLambertMaterial({ map: window.mcTextures.getTexture('zombie_skin') })       // -z front face!
    ];
    headMaterials.forEach(m => m.userData.baseColor = 0xffffff);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), headMaterials);
    headMesh.position.y = 0.25;
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // 3. Left Arm Shoulder Pivot (-0.375, 0.65, 0)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.375, 0.65, 0);
    this.torso.add(this.leftArm);

    // Arm box: 0.25w x 0.75h x 0.25d, offset downwards so it hangs from shoulder
    const lArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), skinMat);
    lArmMesh.position.y = -0.375;
    lArmMesh.castShadow = true;
    lArmMesh.userData.baseColor = 0x567c34;
    this.leftArm.add(lArmMesh);
    // Teal sleeve on top
    const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), shirtMat);
    lSleeve.position.y = -0.13;
    lSleeve.userData.baseColor = 0x228888;
    this.leftArm.add(lSleeve);

    // 4. Right Arm Shoulder Pivot (+0.375, 0.65, 0)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.375, 0.65, 0);
    this.torso.add(this.rightArm);

    const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), skinMat);
    rArmMesh.position.y = -0.375;
    rArmMesh.castShadow = true;
    rArmMesh.userData.baseColor = 0x567c34;
    this.rightArm.add(rArmMesh);
    const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), shirtMat);
    rSleeve.position.y = -0.13;
    rSleeve.userData.baseColor = 0x228888;
    this.rightArm.add(rSleeve);

    // Canonical Minecraft Zombie arms forward posture! (rotation.x = +Math.PI / 2 points along -Z)
    this.leftArm.rotation.x = Math.PI / 2;
    this.leftArm.rotation.y = -0.08; // Slight inward angle
    this.rightArm.rotation.x = Math.PI / 2;
    this.rightArm.rotation.y = 0.08;

    // 5. Left Leg Hip Pivot (-0.125, 0.75, 0)
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.125, 0.75, 0);
    this.mesh.add(this.leftLeg);

    const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), pantsMat);
    lLegMesh.position.y = -0.375;
    lLegMesh.castShadow = true;
    lLegMesh.userData.baseColor = 0x222277;
    this.leftLeg.add(lLegMesh);

    // 6. Right Leg Hip Pivot (+0.125, 0.75, 0)
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.125, 0.75, 0);
    this.mesh.add(this.rightLeg);

    const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), pantsMat);
    rLegMesh.position.y = -0.375;
    rLegMesh.castShadow = true;
    rLegMesh.userData.baseColor = 0x222277;
    this.rightLeg.add(rLegMesh);
  }

  // =========================================================================
  // AUTHENTIC ZOMBIE AI & MOVEMENT LOGIC
  // =========================================================================
  update(delta, playerPos) {
    if (this.isDead) return;

    // 1. Color tinting (damage flash, fire, or authentic base colors)
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      this.mesh.traverse(child => {
        if (child.isMesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.color && m.color.setHex(0xff3333));
          } else if (child.material.color) {
            child.material.color.setHex(0xff3333);
          }
        }
      });
    } else if (this.isOnFire) {
      this.mesh.traverse(child => {
        if (child.isMesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.color && m.color.setHex(0xff7722));
          } else if (child.material.color) {
            child.material.color.setHex(0xff7722);
          }
        }
      });
    } else {
      this.mesh.traverse(child => {
        if (child.isMesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.color && m.color.setHex(m.userData.baseColor || 0xffffff));
          } else if (child.material.color) {
            child.material.color.setHex(child.userData.baseColor || 0xffffff);
          }
        }
      });
    }

    // 2. DAYLIGHT COMBUSTION (Catch fire in morning sun if open to sky)
    const isDay = (this.game.worldTime > 500 && this.game.worldTime < 12000);
    if (isDay && this.pos.y >= 14 && this.checkOpenSky()) {
      this.isOnFire = true;
      this.fireTimer += delta;
      if (this.fireTimer >= 1.2) {
        this.fireTimer = 0;
        this.takeDamage(2, this.pos);
        if (window.mcAudio) window.mcAudio.playBurn();
      }
    } else {
      this.isOnFire = false;
    }

    // 3. GROAN AUDIO
    this.groanTimer -= delta;
    if (this.groanTimer <= 0) {
      this.groanTimer = 6 + Math.random() * 8;
      const dist = this.pos.distanceTo(playerPos);
      if (dist < 18 && window.mcAudio) {
        window.mcAudio.playZombieGroan();
      }
    }

    // 4. BEHAVIOR & PATHFINDING
    const toPlayer = playerPos.clone().sub(this.pos);
    const distToPlayer = toPlayer.length();
    let isMoving = false;
    let walkSpeed = 2.2; // Canonical Java zombie speed (slower than player 4.3 m/s)

    if (this.stunTimer > 0) {
      // Hit stun: cannot walk forward while reeling from knockback
      this.stunTimer -= delta;
      isMoving = false;
    } else if (distToPlayer < 18 && this.game.gameMode !== 'creative') {
      // --- PLAYER PURSUIT MODE ---
      this.targetYaw = Math.atan2(toPlayer.x, toPlayer.z) + Math.PI;

      // Smooth turning (Angular slerp, max 5.5 rad/s)
      const diff = (this.targetYaw - this.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      this.yaw += diff * Math.min(1.0, delta * 5.5);

      // Head tracks player independently
      this.head.rotation.y = THREE.MathUtils.clamp(-diff * 0.7, -0.75, 0.75);
      const pitchToPlayer = Math.atan2(toPlayer.y, distToPlayer);
      this.head.rotation.x = THREE.MathUtils.clamp(pitchToPlayer, -0.5, 0.5);

      if (distToPlayer > 1.25) {
        // Shambling forward along -Z heading
        this.vel.x = -Math.sin(this.yaw) * walkSpeed;
        this.vel.z = -Math.cos(this.yaw) * walkSpeed;
        isMoving = true;
      } else {
        this.vel.x = 0;
        this.vel.z = 0;
      }

      // Attack Strike if within reach
      this.attackCooldown -= delta;
      if (distToPlayer <= 1.4 && this.attackCooldown <= 0) {
        this.attackCooldown = 1.2;
        this.attackAnimProgress = 1.0;
        this.game.damagePlayer(3, 'Zombie');
      }
    } else {
      // --- IDLE WANDERING MODE ---
      this.wanderTimer -= delta;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 3.5 + Math.random() * 4.0;
        this.isWandering = Math.random() < 0.6; // 60% chance to walk, 40% to pause
        this.wanderAngle = this.yaw + (Math.random() - 0.5) * Math.PI * 1.5;
      }

      if (this.isWandering) {
        this.targetYaw = this.wanderAngle;
        const diff = (this.targetYaw - this.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        this.yaw += diff * Math.min(1.0, delta * 3.5);

        const wanderSpeed = 1.1; // Gentle wander
        this.vel.x = -Math.sin(this.yaw) * wanderSpeed;
        this.vel.z = -Math.cos(this.yaw) * wanderSpeed;
        isMoving = true;
      } else {
        this.vel.x = 0;
        this.vel.z = 0;
      }

      this.head.rotation.y = Math.sin(this.walkAnimTime * 0.4) * 0.15;
      this.head.rotation.x = 0.05;
    }

    // 5. LIMB & SHAMBLING ANIMATIONS
    if (isMoving) {
      this.walkAnimTime += delta * 6.5;

      // Authentic leg stride from hip joints
      this.leftLeg.rotation.x = Math.sin(this.walkAnimTime) * 0.95;
      this.rightLeg.rotation.x = -Math.sin(this.walkAnimTime) * 0.95;

      // Shambling body vertical bob & roll
      this.torso.position.y = 0.75 + Math.abs(Math.sin(this.walkAnimTime)) * 0.05;
      this.torso.rotation.z = Math.sin(this.walkAnimTime) * 0.035;
      this.torso.rotation.x = 0.08; // Iconic zombie forward slouch

      // Arms gentle sway while outstretched along -Z
      this.leftArm.rotation.x = Math.PI / 2 + Math.sin(this.walkAnimTime * 0.8) * 0.08;
      this.rightArm.rotation.x = Math.PI / 2 - Math.sin(this.walkAnimTime * 0.8) * 0.08;
    } else {
      // Smooth recovery to idle standing
      this.leftLeg.rotation.x *= Math.pow(0.05, delta);
      this.rightLeg.rotation.x *= Math.pow(0.05, delta);
      this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 0.75, 0.1);
      this.torso.rotation.z *= Math.pow(0.05, delta);
      this.torso.rotation.x = 0.05;

      // Idle breathing sway on arms
      const idleTime = performance.now() * 0.002;
      this.leftArm.rotation.x = Math.PI / 2 + Math.sin(idleTime) * 0.04;
      this.rightArm.rotation.x = Math.PI / 2 + Math.sin(idleTime + 0.5) * 0.04;
    }

    // 6. ATTACK LUNGE ANIMATION (Sharp downward arm strike)
    if (this.attackAnimProgress > 0) {
      this.attackAnimProgress = Math.max(0, this.attackAnimProgress - delta * 4.0);
      const strikeAngle = Math.sin(this.attackAnimProgress * Math.PI) * 0.65;
      this.leftArm.rotation.x -= strikeAngle;
      this.rightArm.rotation.x -= strikeAngle;
    }

    // 7. PHYSICS & COLLISION
    this.updatePhysics(delta);
  }
}

// ===========================================================================
// CREEPER MOB (Stalker, Swell, Fuse Hiss & Blast)
// ===========================================================================
class CreeperMob extends BaseMob {
  constructor(scene, world, game, x, y, z) {
    super(scene, world, game, x, y, z);
    this.name = 'Creeper';
    this.height = 1.7;
    this.fuseTime = 0;
    this.maxFuse = 1.4;
    this.isHissing = false;
    this.walkAnimTime = 0;

    this.buildModel();
  }

  buildModel() {
    const skinMat = new THREE.MeshLambertMaterial({
      map: window.mcTextures.getTexture('creeper_skin')
    });

    // 1. Head (0.5 x 0.5 x 0.5)
    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
    this.head.position.set(0, 1.45, 0);
    this.head.userData.baseColor = 0xffffff;
    this.mesh.add(this.head);

    // 2. Body (0.4 x 0.7 x 0.25)
    this.body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.25), skinMat);
    this.body.position.set(0, 0.9, 0);
    this.body.userData.baseColor = 0xffffff;
    this.mesh.add(this.body);

    // 3. Four Walking Legs with Hip Pivots
    const legGeo = new THREE.BoxGeometry(0.2, 0.35, 0.2);

    this.legFL = new THREE.Group();
    this.legFL.position.set(-0.12, 0.35, -0.15);
    const mFL = new THREE.Mesh(legGeo, skinMat);
    mFL.position.y = -0.175;
    mFL.userData.baseColor = 0xffffff;
    this.legFL.add(mFL);
    this.mesh.add(this.legFL);

    this.legFR = new THREE.Group();
    this.legFR.position.set(0.12, 0.35, -0.15);
    const mFR = new THREE.Mesh(legGeo, skinMat);
    mFR.position.y = -0.175;
    mFR.userData.baseColor = 0xffffff;
    this.legFR.add(mFR);
    this.mesh.add(this.legFR);

    this.legBL = new THREE.Group();
    this.legBL.position.set(-0.12, 0.35, 0.15);
    const mBL = new THREE.Mesh(legGeo, skinMat);
    mBL.position.y = -0.175;
    mBL.userData.baseColor = 0xffffff;
    this.legBL.add(mBL);
    this.mesh.add(this.legBL);

    this.legBR = new THREE.Group();
    this.legBR.position.set(0.12, 0.35, 0.15);
    const mBR = new THREE.Mesh(legGeo, skinMat);
    mBR.position.y = -0.175;
    mBR.userData.baseColor = 0xffffff;
    this.legBR.add(mBR);
    this.mesh.add(this.legBR);
  }

  update(delta, playerPos) {
    if (this.isDead) return;

    // Reset base colors
    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta;
      this.mesh.traverse(child => {
        if (child.isMesh && child.material.color) {
          child.material.color.setHex(0xff3333);
        }
      });
    } else if (!this.isHissing) {
      this.mesh.traverse(child => {
        if (child.isMesh && child.material.color) {
          child.material.color.setHex(child.userData.baseColor || 0xffffff);
        }
      });
    }

    const toPlayer = playerPos.clone().sub(this.pos);
    const distToPlayer = toPlayer.length();

    // AI Stalker
    if (distToPlayer < 18 && distToPlayer > 3.0 && this.game.gameMode !== 'creative') {
      this.targetYaw = Math.atan2(toPlayer.x, toPlayer.z) + Math.PI;
      const diff = (this.targetYaw - this.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      this.yaw += diff * Math.min(1.0, delta * 5.0);

      const speed = 2.0;
      this.vel.x = -Math.sin(this.yaw) * speed;
      this.vel.z = -Math.cos(this.yaw) * speed;

      // 4-leg alternating stride
      this.walkAnimTime += delta * 7.5;
      this.legFL.rotation.x = Math.sin(this.walkAnimTime) * 0.65;
      this.legBR.rotation.x = Math.sin(this.walkAnimTime) * 0.65;
      this.legFR.rotation.x = -Math.sin(this.walkAnimTime) * 0.65;
      this.legBL.rotation.x = -Math.sin(this.walkAnimTime) * 0.65;
    } else {
      this.vel.x = 0;
      this.vel.z = 0;
      this.legFL.rotation.x *= 0.1;
      this.legFR.rotation.x *= 0.1;
      this.legBL.rotation.x *= 0.1;
      this.legBR.rotation.x *= 0.1;
    }

    // FUSE MECHANIC
    if (distToPlayer <= 3.2 && this.game.gameMode !== 'creative') {
      if (!this.isHissing) {
        this.isHissing = true;
        if (window.mcAudio) window.mcAudio.playCreeperFuse();
      }
      this.fuseTime += delta;

      const swell = 1.0 + (this.fuseTime / this.maxFuse) * 0.35;
      this.mesh.scale.set(swell, swell, swell);

      const flashWhite = Math.sin(this.fuseTime * 25) > 0;
      this.mesh.traverse(child => {
        if (child.isMesh && child.material.color) {
          child.material.color.setHex(flashWhite ? 0xffffff : 0x44bb44);
        }
      });

      if (this.fuseTime >= this.maxFuse) {
        this.explode();
      }
    } else {
      this.isHissing = false;
      this.fuseTime = Math.max(0, this.fuseTime - delta * 1.5);
      this.mesh.scale.set(1, 1, 1);
      this.mesh.traverse(child => {
        if (child.isMesh && child.material.color) {
          child.material.color.setHex(0xffffff);
        }
      });
    }

    this.updatePhysics(delta);
  }

  explode() {
    this.isDead = true;
    if (window.mcAudio) {
      window.mcAudio.playExplosion();
    }

    const cx = Math.floor(this.pos.x);
    const cy = Math.floor(this.pos.y);
    const cz = Math.floor(this.pos.z);
    const blastRadius = 2;

    for (let bx = -blastRadius; bx <= blastRadius; bx++) {
      for (let by = -1; by <= blastRadius; by++) {
        for (let bz = -blastRadius; bz <= blastRadius; bz++) {
          if (bx * bx + by * by + bz * bz <= blastRadius * blastRadius) {
            const bId = this.world.getBlock(cx + bx, cy + by, cz + bz);
            if (bId > 0 && bId !== 19) {
              this.world.setBlock(cx + bx, cy + by, cz + bz, 0, false);
            }
          }
        }
      }
    }

    const distToPlayer = this.pos.distanceTo(this.game.playerPos);
    if (distToPlayer < 5.0) {
      const dmg = Math.floor((1 - distToPlayer / 5.0) * 16) + 4;
      this.game.damagePlayer(dmg, 'Creeper');
    }

    this.game.showPopupNotice("CREEPER EXPLODED!");
  }
}

window.MinecraftMobManager = MinecraftMobManager;
window.ZombieMob = ZombieMob;
window.CreeperMob = CreeperMob;
