/**
 * Crates.js - Weapon crates with shoot-to-open mechanic
 */
import * as THREE from 'three';
import { CONSTANTS, screenShake, distance2D } from './Utils.js';
import { WEAPON_TYPES } from './Weapons.js';

class Crate {
    constructor() {
        this.group = new THREE.Group();
        this.hp = 50;
        this.maxHp = 50;
        this.weaponType = 'shotgun';
        this.active = false;
        this.opened = false;

        this.createModel();
    }

    createModel() {
        // Crate box
        const crateGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.6);
        const crateMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.8
        });
        this.crate = new THREE.Mesh(crateGeometry, crateMaterial);
        this.crate.position.y = 0.3;
        this.crate.castShadow = true;
        this.group.add(this.crate);

        // Metal bands
        const bandGeometry = new THREE.BoxGeometry(0.85, 0.08, 0.65);
        const bandMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.4,
            metalness: 0.6
        });

        const band1 = new THREE.Mesh(bandGeometry, bandMaterial);
        band1.position.y = 0.15;
        this.group.add(band1);

        const band2 = new THREE.Mesh(bandGeometry, bandMaterial);
        band2.position.y = 0.45;
        this.group.add(band2);

        // Floating weapon icon (simplified as colored sphere)
        const iconGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        this.iconMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc00,
            roughness: 0.3,
            emissive: 0xffcc00,
            emissiveIntensity: 0.3
        });
        this.icon = new THREE.Mesh(iconGeometry, this.iconMaterial);
        this.icon.position.y = 1.2;
        this.group.add(this.icon);

        // Golden ring/halo around icon
        const ringGeometry = new THREE.TorusGeometry(0.35, 0.03, 8, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0xffdd00,
            roughness: 0.2,
            metalness: 0.8
        });
        this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
        this.ring.position.y = 1.2;
        this.ring.rotation.x = Math.PI / 2;
        this.group.add(this.ring);

        // HP number display
        this.hpCanvas = document.createElement('canvas');
        this.hpCanvas.width = 128;
        this.hpCanvas.height = 64;
        this.hpTexture = new THREE.CanvasTexture(this.hpCanvas);

        const hpGeometry = new THREE.PlaneGeometry(0.8, 0.4);
        this.hpMaterial = new THREE.MeshBasicMaterial({
            map: this.hpTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        this.hpMesh = new THREE.Mesh(hpGeometry, this.hpMaterial);
        this.hpMesh.position.set(0, 0.65, 0.35);
        this.group.add(this.hpMesh);
    }

    init(x, z, weaponType, hp) {
        this.group.position.set(x, 0, z);
        this.weaponType = weaponType;
        this.maxHp = hp;
        this.hp = hp;
        this.active = true;
        this.opened = false;

        // Color icon based on weapon type
        const colors = {
            shotgun: 0x00ccff,
            rocket: 0xff6600,
            minigun: 0xcc66ff
        };
        this.iconMaterial.color.setHex(colors[weaponType] || 0xffcc00);
        this.iconMaterial.emissive.setHex(colors[weaponType] || 0xffcc00);

        this.updateHPDisplay();
    }

    updateHPDisplay() {
        const ctx = this.hpCanvas.getContext('2d');
        ctx.clearRect(0, 0, 128, 64);

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.roundRect(10, 10, 108, 44, 8);
        ctx.fill();

        // Text
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Color based on HP percentage
        const percent = this.hp / this.maxHp;
        if (percent > 0.5) {
            ctx.fillStyle = '#fff';
        } else if (percent > 0.2) {
            ctx.fillStyle = '#ffaa00';
        } else {
            ctx.fillStyle = '#ff4444';
        }

        ctx.fillText(Math.ceil(this.hp).toString(), 64, 32);

        this.hpTexture.needsUpdate = true;
    }

    update(deltaTime, worldSpeed) {
        if (!this.active) return;

        // Move with world
        this.group.position.z += worldSpeed * deltaTime;

        // Animate icon and ring
        this.icon.position.y = 1.2 + Math.sin(Date.now() * 0.005) * 0.1;
        this.icon.rotation.y += deltaTime * 2;
        this.ring.rotation.z += deltaTime * 1.5;

        // Check if crate reached player without being opened
        if (this.group.position.z > 0 && !this.opened) {
            // Penalty: crate passed without opening
            this.active = false;
        }

        if (this.group.position.z > 10) {
            this.active = false;
        }
    }

    takeDamage(damage) {
        if (!this.active || this.opened) return false;

        this.hp -= damage;
        this.updateHPDisplay();

        // Hit flash on crate
        this.crate.material.emissive.setHex(0xffffff);
        setTimeout(() => {
            if (this.crate.material) {
                this.crate.material.emissive.setHex(0x000000);
            }
        }, 30);

        if (this.hp <= 0) {
            this.opened = true;
            return true; // Opened!
        }

        return false;
    }

    getPosition() {
        return this.group.position;
    }

    getGroup() {
        return this.group;
    }

    getWeaponType() {
        return this.weaponType;
    }

    isActive() {
        return this.active;
    }

    isShootable() {
        return this.active && !this.opened && this.group.position.z < 5;
    }
}

export class Crates {
    constructor(scene) {
        this.scene = scene;
        this.crates = [];
        this.maxCrates = 10;

        // Pre-create crates
        for (let i = 0; i < this.maxCrates; i++) {
            const crate = new Crate();
            crate.getGroup().visible = false;
            this.crates.push(crate);
            scene.add(crate.getGroup());
        }
    }

    spawnCrate(x, z, weaponType, hp) {
        for (const crate of this.crates) {
            if (!crate.isActive()) {
                crate.init(x, z, weaponType, hp);
                crate.getGroup().visible = true;
                return crate;
            }
        }
        return null;
    }

    update(deltaTime, squad) {
        const worldSpeed = CONSTANTS.WORLD_SPEED;

        for (const crate of this.crates) {
            if (crate.isActive()) {
                crate.update(deltaTime, worldSpeed);

                // Check if opened
                if (crate.opened && crate.isActive()) {
                    // Grant weapon upgrade
                    squad.setWeapon(crate.getWeaponType());
                    this.showUpgradeEffect(crate.getWeaponType());
                    crate.active = false;
                    screenShake.add(5);
                }

                if (!crate.isActive()) {
                    crate.getGroup().visible = false;
                }
            }
        }
    }

    checkBulletHit(bulletPos, damage) {
        for (const crate of this.crates) {
            if (!crate.isShootable()) continue;

            const cratePos = crate.getPosition();
            const dist = distance2D(bulletPos.x, bulletPos.z, cratePos.x, cratePos.z);

            if (dist < 0.8) {
                crate.takeDamage(damage);
                return true;
            }
        }
        return false;
    }

    getNearestShootableCrate(fromPosition) {
        let nearest = null;
        let nearestDist = Infinity;

        for (const crate of this.crates) {
            if (!crate.isShootable()) continue;

            // Only target crates in front
            if (crate.getPosition().z > fromPosition.z) continue;

            const dist = distance2D(
                fromPosition.x, fromPosition.z,
                crate.getPosition().x, crate.getPosition().z
            );

            if (dist < nearestDist && dist < 15) {
                nearestDist = dist;
                nearest = crate;
            }
        }

        return nearest;
    }

    hasShootableCrates() {
        return this.crates.some(c => c.isShootable());
    }

    showUpgradeEffect(weaponType) {
        const container = document.getElementById('game-container');
        if (!container) return;

        // Flash effect
        const flash = document.createElement('div');
        flash.className = 'upgrade-flash';
        container.appendChild(flash);
        setTimeout(() => flash.remove(), 500);

        // Show weapon name
        const weaponName = WEAPON_TYPES[weaponType]?.name || weaponType;

        // Check if weapon display exists, create if not
        let display = document.getElementById('weapon-display');
        if (!display) {
            display = document.createElement('div');
            display.id = 'weapon-display';
            display.innerHTML = '<span id="weapon-name"></span>';
            container.appendChild(display);
        }

        const nameEl = document.getElementById('weapon-name');
        if (nameEl) {
            nameEl.textContent = weaponName + ' Acquired!';
            display.style.opacity = '1';

            setTimeout(() => {
                display.style.opacity = '0';
            }, 2000);
        }
    }
}
