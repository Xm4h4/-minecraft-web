/**
 * Minecraft Web Edition - Steve Voxel Character Model & First-Person Hand
 * Features authentic Steve skin texturing, skeletal walking animation,
 * first-person animated hand with 3D held tools/blocks, and F5 camera toggle.
 */

class MinecraftCharacter {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    // Camera view mode: 0: First-Person, 1: Third-Person Back, 2: Third-Person Front
    this.cameraMode = 0;

    // Swing animation state
    this.isSwinging = false;
    this.swingProgress = 0;
    this.walkAnimTime = 0;

    // Player Root Mesh (for 3rd person)
    this.mesh = new THREE.Group();
    this.mesh.name = 'Steve_Player';

    this.buildSteveModel();
    this.scene.add(this.mesh);

    // First-Person Hand & Held Item (anchored to camera)
    this.buildFirstPersonHand();
  }

  // =========================================================================
  // STEVE 3D VOXEL MODEL (Exact Minecraft proportions)
  // =========================================================================
  buildSteveModel() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xb5825d }); // Tanned skin
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x422612 }); // Dark brown hair
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x00a8aa }); // Iconic Cyan T-shirt
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x223388 }); // Blue jeans
    const shoesMat = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Grey shoes

    // 1. Torso (0.5 x 0.75 x 0.25)
    this.torso = new THREE.Group();
    this.torso.position.y = 1.05;
    this.mesh.add(this.torso);

    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.25), shirtMat);
    torsoMesh.castShadow = true;
    this.torso.add(torsoMesh);

    // 2. Head (0.5 x 0.5 x 0.5)
    this.head = new THREE.Group();
    this.head.position.y = 0.625;
    this.torso.add(this.head);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    const hairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.52), hairMat);
    hairMesh.position.set(0, 0.16, 0);
    this.head.add(hairMesh);

    // Steve Blue Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2e52b2 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.12, 0.12].forEach(x => {
      const eyeW = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), whiteMat);
      eyeW.position.set(x, 0.02, -0.26);
      this.head.add(eyeW);

      const eyeB = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.022), eyeMat);
      eyeB.position.set(x > 0 ? x + 0.02 : x - 0.02, 0.02, -0.261);
      this.head.add(eyeB);
    });

    // 3. Left Arm (0.25 x 0.75 x 0.25)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.375, 0.25, 0);
    this.torso.add(this.leftArm);

    const lArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), skinMat);
    lArmMesh.position.y = -0.25;
    lArmMesh.castShadow = true;
    this.leftArm.add(lArmMesh);
    const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.26), shirtMat);
    lSleeve.position.y = -0.02;
    this.leftArm.add(lSleeve);

    // 4. Right Arm (0.25 x 0.75 x 0.25)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.375, 0.25, 0);
    this.torso.add(this.rightArm);

    const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), skinMat);
    rArmMesh.position.y = -0.25;
    rArmMesh.castShadow = true;
    this.rightArm.add(rArmMesh);
    const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.26), shirtMat);
    rSleeve.position.y = -0.02;
    this.rightArm.add(rSleeve);

    // 5. Left Leg (0.25 x 0.75 x 0.25)
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.13, -0.375, 0);
    this.torso.add(this.leftLeg);

    const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), pantsMat);
    lLegMesh.position.y = -0.375;
    lLegMesh.castShadow = true;
    this.leftLeg.add(lLegMesh);
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.26), shoesMat);
    lShoe.position.y = -0.68;
    this.leftLeg.add(lShoe);

    // 6. Right Leg (0.25 x 0.75 x 0.25)
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.13, -0.375, 0);
    this.torso.add(this.rightLeg);

    const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.75, 0.25), pantsMat);
    rLegMesh.position.y = -0.375;
    rLegMesh.castShadow = true;
    this.rightLeg.add(rLegMesh);
    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.26), shoesMat);
    rShoe.position.y = -0.68;
    this.rightLeg.add(rShoe);

    // Initially in first-person mode
    this.mesh.visible = false;
  }

  // =========================================================================
  // FIRST-PERSON HAND & 3D EQUIPPED TOOLS / BLOCKS
  // =========================================================================
  buildFirstPersonHand() {
    this.fpArmContainer = new THREE.Group();
    // Positioned in bottom-right corner of camera viewport
    this.fpArmContainer.position.set(0.32, -0.26, -0.45);
    this.camera.add(this.fpArmContainer);

    // Steve Arm Mesh
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xb5825d });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x00a8aa });

    this.fpArmMesh = new THREE.Group();
    this.fpArmContainer.add(this.fpArmMesh);

    // Forearm
    const armBox = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.14), skinMat);
    armBox.position.set(0, -0.16, 0);
    this.fpArmMesh.add(armBox);

    // Cyan sleeve top
    const sleeveBox = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.15), shirtMat);
    sleeveBox.position.set(0, -0.32, 0);
    this.fpArmMesh.add(sleeveBox);

    // Initial forward tilt
    this.fpArmMesh.rotation.set(0.4, -0.2, -0.35);

    // Item Container (held in hand at tip of forearm)
    this.heldItemContainer = new THREE.Group();
    this.heldItemContainer.position.set(0.04, 0.14, -0.06);
    this.fpArmMesh.add(this.heldItemContainer);

    // 1. Block Model (Miniature 3D Voxel Box)
    const blockMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.heldBlockMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), blockMat);
    this.heldBlockMesh.rotation.set(0.2, 0.45, 0);
    this.heldItemContainer.add(this.heldBlockMesh);

    // 2. 3D Diamond Sword Model
    this.heldSwordMesh = new THREE.Group();
    this.build3DSword();
    this.heldSwordMesh.visible = false;
    this.heldItemContainer.add(this.heldSwordMesh);

    // 3. 3D Iron Pickaxe Model
    this.heldPickaxeMesh = new THREE.Group();
    this.build3DPickaxe();
    this.heldPickaxeMesh.visible = false;
    this.heldItemContainer.add(this.heldPickaxeMesh);

    // 4. 3D Diamond Pickaxe Model
    this.heldDiamondPickaxeMesh = new THREE.Group();
    this.build3DDiamondPickaxe();
    this.heldDiamondPickaxeMesh.visible = false;
    this.heldItemContainer.add(this.heldDiamondPickaxeMesh);

    // 5. 3D Diamond Axe Model
    this.heldDiamondAxeMesh = new THREE.Group();
    this.build3DDiamondAxe();
    this.heldDiamondAxeMesh.visible = false;
    this.heldItemContainer.add(this.heldDiamondAxeMesh);

    // 6. 3D Diamond Shovel Model
    this.heldDiamondShovelMesh = new THREE.Group();
    this.build3DDiamondShovel();
    this.heldDiamondShovelMesh.visible = false;
    this.heldItemContainer.add(this.heldDiamondShovelMesh);

    // 7. 3D Bow Model
    this.heldBowMesh = new THREE.Group();
    this.build3DBow();
    this.heldBowMesh.visible = false;
    this.heldItemContainer.add(this.heldBowMesh);

    // 8. 2.5D Item Model (Food, Arrows, Buckets)
    this.heldFoodMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.22, 0.04),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    this.heldFoodMesh.rotation.set(0.2, 0.4, 0);
    this.heldFoodMesh.visible = false;
    this.heldItemContainer.add(this.heldFoodMesh);
  }

  build3DSword() {
    const bladeMat = new THREE.MeshLambertMaterial({ color: 0x5ff0e4 }); // Cyan diamond
    const edgeMat = new THREE.MeshLambertMaterial({ color: 0x2db8aa }); // Deep cyan border
    const guardMat = new THREE.MeshLambertMaterial({ color: 0x1c6f66 }); // Dark teal guard
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x5c3e21 }); // Brown wood

    // Wooden Grip
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), handleMat);
    handle.position.set(0, -0.08, 0);
    this.heldSwordMesh.add(handle);

    // Crossguard
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.06), guardMat);
    guard.position.set(0, 0.02, 0);
    this.heldSwordMesh.add(guard);

    // Diamond Blade
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.03), bladeMat);
    blade.position.set(0, 0.28, 0);
    this.heldSwordMesh.add(blade);

    // Angled forward-upward stance like Minecraft Java!
    this.heldSwordMesh.rotation.set(-0.35, 0.45, -0.4);
    this.heldSwordMesh.position.set(0.02, 0.08, -0.08);
  }

  build3DPickaxe() {
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x6d4c28 }); // Wood handle
    const ironMat = new THREE.MeshLambertMaterial({ color: 0xdedede }); // Iron head

    // Long handle
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 0.04), handleMat);
    handle.position.set(0, 0.08, 0);
    this.heldPickaxeMesh.add(handle);

    // Curved iron head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.06), ironMat);
    head.position.set(0, 0.32, 0);
    this.heldPickaxeMesh.add(head);

    this.heldPickaxeMesh.rotation.set(-0.3, 0.5, -0.35);
    this.heldPickaxeMesh.position.set(0.02, 0.06, -0.08);
  }

  build3DDiamondPickaxe() {
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x5c3e21 });
    const diamondMat = new THREE.MeshLambertMaterial({ color: 0x5ff0e4 });

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 0.04), handleMat);
    handle.position.set(0, 0.08, 0);
    this.heldDiamondPickaxeMesh.add(handle);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.06), diamondMat);
    head.position.set(0, 0.32, 0);
    this.heldDiamondPickaxeMesh.add(head);

    this.heldDiamondPickaxeMesh.rotation.set(-0.3, 0.5, -0.35);
    this.heldDiamondPickaxeMesh.position.set(0.02, 0.06, -0.08);
  }

  build3DDiamondAxe() {
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x5c3e21 });
    const diamondMat = new THREE.MeshLambertMaterial({ color: 0x5ff0e4 });

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 0.04), handleMat);
    handle.position.set(0, 0.08, 0);
    this.heldDiamondAxeMesh.add(handle);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.06), diamondMat);
    blade.position.set(0.08, 0.26, 0);
    this.heldDiamondAxeMesh.add(blade);

    this.heldDiamondAxeMesh.rotation.set(-0.3, 0.5, -0.35);
    this.heldDiamondAxeMesh.position.set(0.02, 0.06, -0.08);
  }

  build3DDiamondShovel() {
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x5c3e21 });
    const diamondMat = new THREE.MeshLambertMaterial({ color: 0x5ff0e4 });

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.52, 0.04), handleMat);
    handle.position.set(0, 0.08, 0);
    this.heldDiamondShovelMesh.add(handle);

    const spade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.05), diamondMat);
    spade.position.set(0, 0.34, 0);
    this.heldDiamondShovelMesh.add(spade);

    this.heldDiamondShovelMesh.rotation.set(-0.3, 0.5, -0.35);
    this.heldDiamondShovelMesh.position.set(0.02, 0.06, -0.08);
  }

  build3DBow() {
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x6d4c28 });
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const stave = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.05), woodMat);
    this.heldBowMesh.add(stave);

    const string = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.48, 0.015), stringMat);
    string.position.set(-0.06, 0, 0);
    this.heldBowMesh.add(string);

    this.heldBowMesh.rotation.set(0.1, 0.6, -0.2);
    this.heldBowMesh.position.set(0.04, 0.05, -0.08);
  }

  updateHeldItem(blockId) {
    if (!this.heldItemContainer) return;

    // Reset all sub-models
    this.heldBlockMesh.visible = false;
    this.heldSwordMesh.visible = false;
    this.heldPickaxeMesh.visible = false;
    this.heldDiamondPickaxeMesh.visible = false;
    this.heldDiamondAxeMesh.visible = false;
    this.heldDiamondShovelMesh.visible = false;
    this.heldBowMesh.visible = false;
    this.heldFoodMesh.visible = false;

    if (!blockId || blockId === 0) {
      // Empty hand
      return;
    }

    const bDef = window.BLOCKS[blockId];
    if (!bDef) return;

    if (blockId === 28) {
      // Diamond Sword
      this.heldSwordMesh.visible = true;
    } else if (blockId === 29) {
      // Iron Pickaxe
      this.heldPickaxeMesh.visible = true;
    } else if (blockId === 34) {
      // Diamond Pickaxe
      this.heldDiamondPickaxeMesh.visible = true;
    } else if (blockId === 35) {
      // Diamond Axe
      this.heldDiamondAxeMesh.visible = true;
    } else if (blockId === 36) {
      // Diamond Shovel
      this.heldDiamondShovelMesh.visible = true;
    } else if (blockId === 37) {
      // Bow
      this.heldBowMesh.visible = true;
    } else if (bDef.food || bDef.itemOnly) {
      // Food or item (2.5D texture card)
      this.heldFoodMesh.visible = true;
      const texName = bDef.textures.all || 'apple';
      this.heldFoodMesh.material.map = window.mcTextures.getTexture(texName);
      this.heldFoodMesh.material.needsUpdate = true;
    } else {
      // 3D Block Cube (with authentic face mapping)
      this.heldBlockMesh.visible = true;
      const texTop = bDef.textures.all || bDef.textures.top || 'stone';
      const texSide = bDef.textures.all || bDef.textures.side || texTop;
      const texBot = bDef.textures.all || bDef.textures.bottom || texSide;
      const topTex = window.mcTextures.getTexture(texTop);
      const sideTex = window.mcTextures.getTexture(texSide);
      const botTex = window.mcTextures.getTexture(texBot);
      this.heldBlockMesh.material = [
        new THREE.MeshLambertMaterial({ map: sideTex }),
        new THREE.MeshLambertMaterial({ map: sideTex }),
        new THREE.MeshLambertMaterial({ map: topTex }),
        new THREE.MeshLambertMaterial({ map: botTex }),
        new THREE.MeshLambertMaterial({ map: sideTex }),
        new THREE.MeshLambertMaterial({ map: sideTex })
      ];
    }
  }

  swingArm() {
    this.isSwinging = true;
    this.swingProgress = 0;
  }

  cycleCameraMode() {
    this.cameraMode = (this.cameraMode + 1) % 3;
    // Mode 0: 1st person (mesh hidden, hand visible)
    // Mode 1: 3rd person back (mesh visible, hand hidden)
    // Mode 2: 3rd person front (mesh visible, hand hidden)
    this.mesh.visible = (this.cameraMode !== 0);
    this.fpArmContainer.visible = (this.cameraMode === 0);
  }

  update(delta, playerPos, playerYaw, playerPitch, isMoving, isSprinting) {
    // 1. Sync 3rd-person mesh position & orientation
    this.mesh.position.set(playerPos.x, playerPos.y - 1.62, playerPos.z);
    this.mesh.rotation.y = playerYaw;
    this.head.rotation.x = playerPitch;

    // 2. Walking animation
    if (isMoving) {
      const speedMult = isSprinting ? 14 : 9;
      this.walkAnimTime += delta * speedMult;
      const legAngle = Math.sin(this.walkAnimTime) * 0.6;
      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;
      this.leftArm.rotation.x = -legAngle;
      this.rightArm.rotation.x = legAngle;
    } else {
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.15);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.15);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.15);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.15);
    }

    // 3. First-Person Hand Bobbing & Mining Swing Physics
    if (this.cameraMode === 0 && this.fpArmContainer) {
      // Subtle idle breathing
      const breath = Math.sin(performance.now() * 0.002) * 0.006;

      // Walking hand bobbing
      let walkBobX = 0;
      let walkBobY = 0;
      if (isMoving) {
        walkBobX = Math.cos(this.walkAnimTime * 0.5) * 0.018;
        walkBobY = Math.abs(Math.sin(this.walkAnimTime)) * 0.018;
      }

      // Mining / Attack Swing Punch Motion
      let swingAngle = 0;
      if (this.isSwinging) {
        this.swingProgress += delta * 7.5; // Fast, responsive Minecraft attack swing
        swingAngle = Math.sin(this.swingProgress * Math.PI) * 0.85;
        if (this.swingProgress >= 1.0) {
          this.isSwinging = false;
          this.swingProgress = 0;
        }
      }

      this.fpArmContainer.position.set(
        0.32 + walkBobX - swingAngle * 0.08,
        -0.26 + breath - walkBobY - swingAngle * 0.06,
        -0.45 - swingAngle * 0.12
      );

      this.fpArmMesh.rotation.set(
        0.4 + swingAngle * 0.95,
        -0.2 - swingAngle * 0.45,
        -0.35 + swingAngle * 0.35
      );
    }
  }
}

window.MinecraftCharacter = MinecraftCharacter;
