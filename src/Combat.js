/**
 * Combat.js - Combat management and shooting
 */
import * as THREE from 'three';
import { BulletPool, WEAPON_TYPES } from './Weapons.js';
import { CONSTANTS, screenShake } from './Utils.js';

export class Combat {
    constructor(scene) {
        this.scene = scene;
        this.bulletPool = new BulletPool(scene, 300);

        this.lastFireTime = 0;
        this.isShooting = false;

        // Direction towards enemy lane (forward-left)
        this.shootDirection = new THREE.Vector3(-0.3, 0, -1).normalize();
    }

    update(deltaTime, squad, enemies, crates, currentTime) {
        // Update bullets
        this.bulletPool.update(deltaTime);

        // Check if we should be shooting
        const hasTargets = enemies.hasActiveEnemies() || crates.hasShootableCrates();

        if (hasTargets && squad.isAlive()) {
            const weapon = WEAPON_TYPES[squad.getCurrentWeapon()];

            if (currentTime - this.lastFireTime >= weapon.fireRate) {
                this.fire(squad, enemies, crates);
                this.lastFireTime = currentTime;
                this.isShooting = true;
            }
        } else {
            this.isShooting = false;
        }

        // Check bullet collisions
        this.checkCollisions(enemies, crates);
    }

    fire(squad, enemies, crates) {
        const soldiers = squad.getSoldiers();
        const weapon = WEAPON_TYPES[squad.getCurrentWeapon()];

        // NO AUTO-AIM - shoot straight forward!
        const straightDirection = new THREE.Vector3(0, 0, -1); // Straight ahead

        // Fire from each soldier
        for (const soldier of soldiers) {
            const muzzlePos = soldier.getMuzzlePosition();

            for (let i = 0; i < weapon.bulletsPerShot; i++) {
                let direction = straightDirection.clone();

                // Add slight spread for shotgun
                if (weapon.bulletsPerShot > 1) {
                    const spreadAngle = (i - (weapon.bulletsPerShot - 1) / 2) * weapon.spread;
                    direction.x = Math.sin(spreadAngle);
                    direction.z = -Math.cos(spreadAngle);
                    direction.normalize();
                }

                this.bulletPool.spawn(muzzlePos.clone(), direction, squad.getCurrentWeapon());
            }
        }

        // Screen shake for heavy weapons
        if (squad.getCurrentWeapon() === 'rocket') {
            screenShake.add(3);
        } else if (squad.getCurrentWeapon() === 'shotgun') {
            screenShake.add(1);
        }
    }

    checkCollisions(enemies, crates) {
        const bullets = this.bulletPool.getActiveBullets();

        for (const bullet of bullets) {
            if (!bullet.isActive()) continue;

            const bulletPos = bullet.getPosition();

            // Check enemy collisions
            const hitEnemy = enemies.checkBulletHit(bulletPos, bullet.damage, bullet.isAOE, bullet.aoeRadius);

            if (hitEnemy) {
                if (bullet.isAOE) {
                    screenShake.add(5);
                }
                bullet.deactivate();
                continue;
            }

            // Check crate collisions
            const hitCrate = crates.checkBulletHit(bulletPos, bullet.damage);
            if (hitCrate) {
                bullet.deactivate();
            }
        }
    }

    isFiring() {
        return this.isShooting;
    }
}
