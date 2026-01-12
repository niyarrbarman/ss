/**
 * Weapons.js - Weapon definitions and bullet types
 */
import * as THREE from 'three';
import { CONSTANTS, ObjectPool } from './Utils.js';

export const WEAPON_TYPES = {
    basic: {
        name: 'Rifle',
        fireRate: CONSTANTS.FIRE_RATE.basic,
        damage: CONSTANTS.DAMAGE.basic,
        bulletSpeed: 40,
        bulletColor: 0xffff00,
        bulletSize: 0.08,
        spread: 0.05,
        bulletsPerShot: 1,
        isAOE: false
    },
    shotgun: {
        name: 'Shotgun',
        fireRate: CONSTANTS.FIRE_RATE.shotgun,
        damage: CONSTANTS.DAMAGE.shotgun,
        bulletSpeed: 35,
        bulletColor: 0x00ccff,
        bulletSize: 0.06,
        spread: 0.3,
        bulletsPerShot: 5,
        isAOE: false
    },
    rocket: {
        name: 'Rocket Launcher',
        fireRate: CONSTANTS.FIRE_RATE.rocket,
        damage: CONSTANTS.DAMAGE.rocket,
        bulletSpeed: 20,
        bulletColor: 0xff6600,
        bulletSize: 0.15,
        spread: 0.02,
        bulletsPerShot: 1,
        isAOE: true,
        aoeRadius: 2
    },
    minigun: {
        name: 'Minigun',
        fireRate: CONSTANTS.FIRE_RATE.minigun,
        damage: CONSTANTS.DAMAGE.minigun,
        bulletSpeed: 50,
        bulletColor: 0xcc66ff,
        bulletSize: 0.05,
        spread: 0.15,
        bulletsPerShot: 2,
        isAOE: false
    }
};

export class Bullet {
    constructor() {
        this.geometry = new THREE.SphereGeometry(1, 6, 6);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.velocity = new THREE.Vector3();
        this.active = false;
        this.damage = 1;
        this.isAOE = false;
        this.aoeRadius = 0;
        this.weaponType = 'basic';

        // Trail
        this.trailPoints = [];
        this.maxTrailLength = 5;
    }

    init(position, direction, weaponType) {
        const weapon = WEAPON_TYPES[weaponType];

        this.mesh.position.copy(position);
        this.mesh.scale.setScalar(weapon.bulletSize);
        this.material.color.setHex(weapon.bulletColor);

        // Add spread
        const spread = weapon.spread;
        direction.x += (Math.random() - 0.5) * spread;
        direction.y += (Math.random() - 0.5) * spread * 0.5;
        direction.normalize();

        this.velocity.copy(direction).multiplyScalar(weapon.bulletSpeed);
        this.damage = weapon.damage;
        this.isAOE = weapon.isAOE;
        this.aoeRadius = weapon.aoeRadius || 0;
        this.weaponType = weaponType;
        this.active = true;

        // Rocket visual adjustments
        if (weaponType === 'rocket') {
            this.mesh.scale.set(0.15, 0.15, 0.3);
        }

        this.trailPoints = [];
    }

    update(deltaTime) {
        if (!this.active) return;

        // Store trail position
        this.trailPoints.push(this.mesh.position.clone());
        if (this.trailPoints.length > this.maxTrailLength) {
            this.trailPoints.shift();
        }

        // Move bullet
        this.mesh.position.add(
            this.velocity.clone().multiplyScalar(deltaTime)
        );

        // Rotate rocket to face direction
        if (this.weaponType === 'rocket') {
            this.mesh.lookAt(
                this.mesh.position.clone().add(this.velocity)
            );
        }

        // Deactivate if too far
        if (this.mesh.position.z < -80 ||
            this.mesh.position.z > 20 ||
            Math.abs(this.mesh.position.x) > 20) {
            this.active = false;
        }
    }

    getMesh() {
        return this.mesh;
    }

    getPosition() {
        return this.mesh.position;
    }

    isActive() {
        return this.active;
    }

    deactivate() {
        this.active = false;
    }
}

export class BulletPool {
    constructor(scene, maxBullets = 200) {
        this.scene = scene;
        this.bullets = [];
        this.activeBullets = [];

        for (let i = 0; i < maxBullets; i++) {
            const bullet = new Bullet();
            this.bullets.push(bullet);
            scene.add(bullet.getMesh());
            bullet.getMesh().visible = false;
        }
    }

    spawn(position, direction, weaponType) {
        // Find inactive bullet
        for (const bullet of this.bullets) {
            if (!bullet.isActive()) {
                bullet.init(position, direction, weaponType);
                bullet.getMesh().visible = true;
                this.activeBullets.push(bullet);
                return bullet;
            }
        }
        return null;
    }

    update(deltaTime) {
        for (let i = this.activeBullets.length - 1; i >= 0; i--) {
            const bullet = this.activeBullets[i];
            bullet.update(deltaTime);

            if (!bullet.isActive()) {
                bullet.getMesh().visible = false;
                this.activeBullets.splice(i, 1);
            }
        }
    }

    getActiveBullets() {
        return this.activeBullets;
    }
}
