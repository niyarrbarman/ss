/**
 * Enemies.js - Enemy swarm and boss management
 */
import * as THREE from 'three';
import { CONSTANTS, randomRange, screenShake, distance2D } from './Utils.js';

class SwarmEnemy {
    constructor() {
        this.group = new THREE.Group();
        this.mesh = this.group;
        this.createModel();

        this.hp = CONSTANTS.SWARM_HP;
        this.active = false;
        this.walkCycle = Math.random() * Math.PI * 2;
    }

    createModel() {
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4a08c,
            roughness: 0.9
        });
        const suitMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a1b1b,
            roughness: 0.7
        });
        const vestMaterial = new THREE.MeshStandardMaterial({
            color: 0x551111,
            roughness: 0.8
        });
        const helmetMaterial = new THREE.MeshStandardMaterial({
            color: 0xb83333,
            roughness: 0.5,
            metalness: 0.2
        });
        const bootMaterial = new THREE.MeshStandardMaterial({
            color: 0x331111,
            roughness: 0.9
        });

        this.torsoGroup = new THREE.Group();
        const bodyGeometry = new THREE.BoxGeometry(0.28, 0.36, 0.18);
        this.body = new THREE.Mesh(bodyGeometry, suitMaterial);
        this.body.position.y = 0.36;
        this.body.castShadow = true;
        this.torsoGroup.add(this.body);

        const vestGeometry = new THREE.BoxGeometry(0.3, 0.28, 0.2);
        const vest = new THREE.Mesh(vestGeometry, vestMaterial);
        vest.position.set(0, 0.36, 0.02);
        this.torsoGroup.add(vest);

        this.group.add(this.torsoGroup);

        this.headGroup = new THREE.Group();
        const headGeometry = new THREE.SphereGeometry(0.11, 6, 6);
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 0.63;
        this.headGroup.add(head);

        const helmetGeometry = new THREE.SphereGeometry(0.13, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2);
        const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        helmet.position.y = 0.66;
        helmet.rotation.x = Math.PI;
        this.headGroup.add(helmet);

        this.group.add(this.headGroup);

        const createLeg = () => {
            const legGroup = new THREE.Group();
            const legGeometry = new THREE.BoxGeometry(0.11, 0.22, 0.11);
            const leg = new THREE.Mesh(legGeometry, suitMaterial);
            leg.position.y = -0.11;
            legGroup.add(leg);

            const bootGeometry = new THREE.BoxGeometry(0.12, 0.1, 0.14);
            const boot = new THREE.Mesh(bootGeometry, bootMaterial);
            boot.position.set(0, -0.27, 0.02);
            legGroup.add(boot);

            return legGroup;
        };

        this.leftLeg = createLeg();
        this.leftLeg.position.set(-0.09, 0.22, 0);
        this.group.add(this.leftLeg);

        this.rightLeg = createLeg();
        this.rightLeg.position.set(0.09, 0.22, 0);
        this.group.add(this.rightLeg);

        const createArm = () => {
            const armGroup = new THREE.Group();
            const sleeveGeometry = new THREE.BoxGeometry(0.09, 0.16, 0.09);
            const sleeve = new THREE.Mesh(sleeveGeometry, suitMaterial);
            sleeve.position.y = -0.08;
            armGroup.add(sleeve);

            const forearmGeometry = new THREE.BoxGeometry(0.07, 0.14, 0.07);
            const forearm = new THREE.Mesh(forearmGeometry, skinMaterial);
            forearm.position.y = -0.22;
            armGroup.add(forearm);

            const handGeometry = new THREE.BoxGeometry(0.06, 0.05, 0.08);
            const hand = new THREE.Mesh(handGeometry, skinMaterial);
            hand.position.set(0, -0.3, 0.02);
            armGroup.add(hand);

            return armGroup;
        };

        this.leftArm = createArm();
        this.leftArm.position.set(-0.2, 0.48, 0);
        this.group.add(this.leftArm);

        this.rightArm = createArm();
        this.rightArm.position.set(0.2, 0.48, 0);
        this.group.add(this.rightArm);
    }

    init(x, z) {
        this.mesh.position.set(x, 0.2, z);
        this.hp = CONSTANTS.SWARM_HP;
        this.active = true;
        this.walkCycle = Math.random() * Math.PI * 2;
    }

    update(deltaTime, worldSpeed) {
        if (!this.active) return;

        // Move towards player (world moves, so we stay relative)
        this.mesh.position.z += worldSpeed * deltaTime;

        // Simple walk animation
        this.walkCycle += deltaTime * 8;
        const legSwing = Math.sin(this.walkCycle) * 0.35;
        this.leftLeg.rotation.x = legSwing;
        this.rightLeg.rotation.x = -legSwing;
        this.leftArm.rotation.x = -legSwing * 0.4;
        this.rightArm.rotation.x = legSwing * 0.4;

        const bob = Math.abs(Math.sin(this.walkCycle)) * 0.03;
        this.torsoGroup.position.y = bob;
        this.headGroup.position.y = bob;
        this.mesh.rotation.z = Math.sin(this.walkCycle) * 0.08;

        // Deactivate if passed player
        if (this.mesh.position.z > 5) {
            this.active = false;
        }
    }

    // Check if enemy reached player zone and should deal damage
    checkPlayerCollision(playerZ = 0) {
        if (!this.active) return false;

        // Enemy reached player line
        if (this.mesh.position.z > playerZ - 0.5 && this.mesh.position.z < playerZ + 2) {
            this.active = false; // Enemy dies after attacking
            return true;
        }
        return false;
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.active = false;
            return true; // died
        }
        return false;
    }

    getPosition() {
        return this.mesh.position;
    }

    getMesh() {
        return this.mesh;
    }

    isActive() {
        return this.active;
    }
}

class Boss {
    constructor() {
        this.group = new THREE.Group();
        this.createModel();

        this.maxHp = CONSTANTS.BOSS_HP;
        this.hp = this.maxHp;
        this.active = false;
        this.walkCycle = 0;
    }

    createModel() {
        const armorMaterial = new THREE.MeshStandardMaterial({
            color: 0x1c1c1c,
            roughness: 0.5,
            metalness: 0.4,
            emissive: 0x220000
        });
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xd1a32f,
            roughness: 0.3,
            metalness: 0.8
        });
        const capeMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.8,
            side: THREE.DoubleSide
        });
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xc19070,
            roughness: 0.7
        });

        // Torso
        const bodyGeometry = new THREE.BoxGeometry(1.4, 1.8, 0.9);
        this.body = new THREE.Mesh(bodyGeometry, armorMaterial);
        this.body.position.y = 1.7;
        this.body.castShadow = true;
        this.group.add(this.body);

        const chestPlateGeometry = new THREE.BoxGeometry(1.0, 0.9, 0.2);
        const chestPlate = new THREE.Mesh(chestPlateGeometry, goldMaterial);
        chestPlate.position.set(0, 1.85, 0.55);
        this.group.add(chestPlate);

        const beltGeometry = new THREE.BoxGeometry(1.2, 0.2, 0.9);
        const belt = new THREE.Mesh(beltGeometry, goldMaterial);
        belt.position.y = 1.05;
        this.group.add(belt);

        // Head + crown
        const headGeometry = new THREE.SphereGeometry(0.45, 8, 8);
        this.head = new THREE.Mesh(headGeometry, skinMaterial);
        this.head.position.y = 2.65;
        this.head.castShadow = true;
        this.group.add(this.head);

        const crownGeometry = new THREE.CylinderGeometry(0.45, 0.55, 0.25, 6);
        const crown = new THREE.Mesh(crownGeometry, goldMaterial);
        crown.position.y = 3.05;
        this.group.add(crown);

        // Cape
        const capeGeometry = new THREE.PlaneGeometry(1.8, 2.2);
        const cape = new THREE.Mesh(capeGeometry, capeMaterial);
        cape.position.set(0, 1.6, -0.8);
        this.group.add(cape);

        // Arms
        const upperArmGeometry = new THREE.BoxGeometry(0.45, 1.0, 0.45);
        const gauntletGeometry = new THREE.BoxGeometry(0.5, 0.35, 0.5);

        this.leftArm = new THREE.Group();
        const leftUpper = new THREE.Mesh(upperArmGeometry, armorMaterial);
        leftUpper.position.y = -0.5;
        this.leftArm.add(leftUpper);
        const leftGauntlet = new THREE.Mesh(gauntletGeometry, goldMaterial);
        leftGauntlet.position.y = -1.05;
        this.leftArm.add(leftGauntlet);
        this.leftArm.position.set(-1.05, 2.05, 0);
        this.leftArm.rotation.z = 0.3;
        this.group.add(this.leftArm);

        this.rightArm = new THREE.Group();
        const rightUpper = new THREE.Mesh(upperArmGeometry, armorMaterial);
        rightUpper.position.y = -0.5;
        this.rightArm.add(rightUpper);
        const rightGauntlet = new THREE.Mesh(gauntletGeometry, goldMaterial);
        rightGauntlet.position.y = -1.05;
        this.rightArm.add(rightGauntlet);
        this.rightArm.position.set(1.05, 2.05, 0);
        this.rightArm.rotation.z = -0.3;
        this.group.add(this.rightArm);

        // Sword
        const swordGeometry = new THREE.BoxGeometry(0.2, 1.6, 0.12);
        const sword = new THREE.Mesh(swordGeometry, goldMaterial);
        sword.position.set(0, -1.4, 0.3);
        this.rightArm.add(sword);

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.55, 1.1, 0.55);
        const bootGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.6);

        this.leftLeg = new THREE.Group();
        const leftLegMesh = new THREE.Mesh(legGeometry, armorMaterial);
        leftLegMesh.position.y = -0.55;
        this.leftLeg.add(leftLegMesh);
        const leftBoot = new THREE.Mesh(bootGeometry, goldMaterial);
        leftBoot.position.y = -1.2;
        this.leftLeg.add(leftBoot);
        this.leftLeg.position.set(-0.45, 0.7, 0);
        this.group.add(this.leftLeg);

        this.rightLeg = new THREE.Group();
        const rightLegMesh = new THREE.Mesh(legGeometry, armorMaterial);
        rightLegMesh.position.y = -0.55;
        this.rightLeg.add(rightLegMesh);
        const rightBoot = new THREE.Mesh(bootGeometry, goldMaterial);
        rightBoot.position.y = -1.2;
        this.rightLeg.add(rightBoot);
        this.rightLeg.position.set(0.45, 0.7, 0);
        this.group.add(this.rightLeg);
    }

    init(z, hp) {
        this.group.position.set(CONSTANTS.ENEMY_LANE_X, 0, z);
        this.maxHp = hp;
        this.hp = hp;
        this.active = true;
        this.walkCycle = 0;

        const minScale = 0.45;
        const maxScale = 0.75;
        const minHp = 400;
        const maxHp = 3000;
        const t = Math.min(1, Math.max(0, (hp - minHp) / (maxHp - minHp)));
        const scale = minScale + (maxScale - minScale) * t;
        this.group.scale.setScalar(scale);
    }

    update(deltaTime, worldSpeed) {
        if (!this.active) return;

        // Move towards player
        this.group.position.z += worldSpeed * deltaTime;

        // Lumbering walk animation
        this.walkCycle += deltaTime * 4;
        const legSwing = Math.sin(this.walkCycle) * 0.2;
        this.leftLeg.rotation.x = legSwing;
        this.rightLeg.rotation.x = -legSwing;

        // Arm swing
        this.leftArm.rotation.x = -legSwing * 0.5;
        this.rightArm.rotation.x = legSwing * 0.5;

        // Slight body sway
        this.body.rotation.z = Math.sin(this.walkCycle * 0.5) * 0.05;

        // Update HP bar UI
        this.updateHPUI();
    }

    // Check if boss reached player zone - deals massive damage
    checkPlayerCollision(playerZ = 0) {
        if (!this.active) return 0;

        // Boss reached player line - deals damage proportional to remaining HP
        if (this.group.position.z > playerZ) {
            const damage = Math.ceil(this.hp / 50); // More HP = more damage
            this.hp -= 100; // Boss takes damage too
            if (this.hp <= 0) {
                this.active = false;
                this.hideHPUI();
            }
            return damage;
        }
        return 0;
    }

    takeDamage(damage) {
        this.hp -= damage;

        // Hit flash
        this.body.material.emissive.setHex(0xffffff);
        setTimeout(() => {
            if (this.body.material) {
                this.body.material.emissive.setHex(0x000000);
            }
        }, 50);

        if (this.hp <= 0) {
            this.active = false;
            this.group.visible = false; // Hide the boss mesh
            this.hideHPUI();
            return true;
        }
        return false;
    }

    updateHPUI() {
        const container = document.getElementById('boss-hp-container');
        const fill = document.getElementById('boss-hp-fill');
        const text = document.getElementById('boss-hp-text');

        if (container && fill && text) {
            container.classList.remove('hidden');
            const percent = Math.max(0, this.hp / this.maxHp * 100);
            fill.style.width = percent + '%';
            text.textContent = Math.max(0, Math.ceil(this.hp));
        }
    }

    hideHPUI() {
        const container = document.getElementById('boss-hp-container');
        if (container) {
            container.classList.add('hidden');
        }
    }

    getPosition() {
        return this.group.position;
    }

    getGroup() {
        return this.group;
    }

    isActive() {
        return this.active;
    }
}

export class Enemies {
    constructor(scene) {
        this.scene = scene;
        this.swarmEnemies = [];
        this.bosses = [];
        this.maxSwarm = 150;
        this.totalKills = 0;

        // Pre-create swarm enemies
        for (let i = 0; i < this.maxSwarm; i++) {
            const enemy = new SwarmEnemy();
            enemy.getMesh().visible = false;
            this.swarmEnemies.push(enemy);
            scene.add(enemy.getMesh());
        }

        // VFX for deaths
        this.deathParticles = [];
    }

    spawnSwarmWave(startZ, count, spreadX = 2, spreadZ = 5) {
        let spawned = 0;
        for (const enemy of this.swarmEnemies) {
            if (!enemy.isActive() && spawned < count) {
                const x = CONSTANTS.ENEMY_LANE_X + randomRange(-spreadX, spreadX);
                const z = startZ + randomRange(-spreadZ, 0);
                enemy.init(x, z);
                enemy.getMesh().visible = true;
                spawned++;
            }
        }
    }

    spawnBoss(z, hp = CONSTANTS.BOSS_HP) {
        const boss = new Boss();
        boss.init(z, hp);
        this.bosses.push(boss);
        this.scene.add(boss.getGroup());
        return boss;
    }

    update(deltaTime) {
        const worldSpeed = CONSTANTS.WORLD_SPEED;

        // Update swarm
        for (const enemy of this.swarmEnemies) {
            if (enemy.isActive()) {
                enemy.update(deltaTime, worldSpeed);

                if (!enemy.isActive()) {
                    enemy.getMesh().visible = false;
                }
            }
        }

        // Update bosses
        for (const boss of this.bosses) {
            if (boss.isActive()) {
                boss.update(deltaTime, worldSpeed);
            }
        }
    }

    checkBulletHit(bulletPos, damage, isAOE, aoeRadius) {
        // Check bosses first (priority target)
        for (const boss of this.bosses) {
            if (!boss.isActive()) continue;

            const bossPos = boss.getPosition();
            const dist = distance2D(bulletPos.x, bulletPos.z, bossPos.x, bossPos.z);

            if (dist < 2.5) {
                const killed = boss.takeDamage(damage);

                // Show damage number more frequently for boss
                if (Math.random() < 0.3) {
                    this.showDamageNumber(bossPos, damage);
                }

                if (killed) {
                    screenShake.add(15);
                    this.showDamageNumber(bossPos, 'DEAD!');
                    this.incrementKills(20);
                }

                return true;
            }
        }

        // Check swarm
        let hitAny = false;

        for (const enemy of this.swarmEnemies) {
            if (!enemy.isActive()) continue;

            const enemyPos = enemy.getPosition();
            const dist = distance2D(bulletPos.x, bulletPos.z, enemyPos.x, enemyPos.z);

            const hitRadius = isAOE ? aoeRadius : 0.4;

            if (dist < hitRadius) {
                const killed = enemy.takeDamage(damage);

                if (killed) {
                    enemy.getMesh().visible = false;
                    this.spawnDeathEffect(enemyPos);
                    this.incrementKills(1);
                }

                hitAny = true;

                if (!isAOE) break; // Regular bullets hit one enemy
            }
        }

        return hitAny;
    }

    spawnDeathEffect(position) {
        // Quick white puff (simplified)
        // In a full implementation, use particle system
    }

    showDamageNumber(position, damage) {
        const container = document.getElementById('game-container');
        if (!container) return;

        // Create damage text element
        const dmgEl = document.createElement('div');
        dmgEl.className = 'damage-number';
        dmgEl.textContent = Math.floor(damage);

        // Position (simplified - would need proper 3D to 2D conversion)
        dmgEl.style.left = '50%';
        dmgEl.style.top = '40%';

        container.appendChild(dmgEl);

        // Remove after animation
        setTimeout(() => dmgEl.remove(), 800);
    }

    getNearestEnemy(fromPosition) {
        let nearest = null;
        let nearestDist = Infinity;

        // Check bosses
        for (const boss of this.bosses) {
            if (!boss.isActive()) continue;

            const dist = distance2D(fromPosition.x, fromPosition.z, boss.getPosition().x, boss.getPosition().z);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = boss;
            }
        }

        // Check swarm
        for (const enemy of this.swarmEnemies) {
            if (!enemy.isActive()) continue;

            const dist = distance2D(fromPosition.x, fromPosition.z, enemy.getPosition().x, enemy.getPosition().z);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }

        return nearest;
    }

    hasActiveEnemies() {
        for (const boss of this.bosses) {
            if (boss.isActive()) return true;
        }
        for (const enemy of this.swarmEnemies) {
            if (enemy.isActive()) return true;
        }
        return false;
    }

    getActiveBossCount() {
        return this.bosses.filter(b => b.isActive()).length;
    }

    // Get first active boss for priority targeting
    getActiveBoss() {
        for (const boss of this.bosses) {
            if (boss.isActive()) {
                return boss;
            }
        }
        return null;
    }

    getKillCount() {
        return this.totalKills;
    }

    incrementKills(count = 1) {
        this.totalKills += count;
    }

    // Check if any enemies reached player and deal damage
    checkPlayerDamage(squad) {
        let totalDamage = 0;
        let enemiesHit = 0;

        // Check swarm enemies reaching player
        for (const enemy of this.swarmEnemies) {
            if (enemy.isActive() && enemy.checkPlayerCollision(0)) {
                totalDamage += 1; // Each swarm enemy kills 1 soldier
                enemiesHit++;
                enemy.getMesh().visible = false;

                // Show hit effect at enemy position
                this.showEnemyHitEffect(enemy.getPosition());
            }
        }

        // Check bosses reaching player
        for (const boss of this.bosses) {
            if (boss.isActive()) {
                const bossDamage = boss.checkPlayerCollision(0);
                if (bossDamage > 0) {
                    totalDamage += bossDamage;
                    screenShake.add(8);
                    this.showEnemyHitEffect(boss.getPosition());
                }
            }
        }

        // Apply damage to squad with visual feedback
        if (totalDamage > 0) {
            squad.modifyCount(-totalDamage);

            // Red screen flash
            this.showDamageFlash();

            // Screen shake proportional to damage
            screenShake.add(Math.min(totalDamage * 2, 10));

            // Show damage taken number
            this.showDamageTaken(totalDamage);
        }

        return totalDamage;
    }

    // Visual effect when enemy hits player
    showEnemyHitEffect(position) {
        // Create explosion/impact effect at enemy position
        const container = document.getElementById('game-container');
        if (!container) return;

        // Small red burst effect (would be 3D particles in full implementation)
    }

    // Red flash overlay when taking damage
    showDamageFlash() {
        const container = document.getElementById('game-container');
        if (!container) return;

        const flash = document.createElement('div');
        flash.className = 'damage-flash';
        flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, rgba(255,0,0,0.4) 0%, rgba(255,0,0,0.1) 60%, transparent 100%);
            pointer-events: none;
            animation: damage-flash-anim 0.3s ease-out forwards;
            z-index: 100;
        `;
        container.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }

    // Show how much damage was taken
    showDamageTaken(damage) {
        const container = document.getElementById('game-container');
        if (!container) return;

        const dmgEl = document.createElement('div');
        dmgEl.className = 'damage-taken';
        dmgEl.textContent = `-${damage}`;
        dmgEl.style.cssText = `
            position: absolute;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 48px;
            font-weight: bold;
            color: #ff3333;
            text-shadow: 0 0 10px #ff0000, 2px 2px 0 #000;
            animation: damage-taken-anim 1s ease-out forwards;
            pointer-events: none;
            z-index: 101;
        `;
        container.appendChild(dmgEl);
        setTimeout(() => dmgEl.remove(), 1000);
    }
}
