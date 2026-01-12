/**
 * Obstacles.js - Barrel and hazard obstacles in player lane
 */
import * as THREE from 'three';
import { CONSTANTS, screenShake, distance2D, randomRange } from './Utils.js';

class Barrel {
    constructor() {
        this.group = new THREE.Group();
        this.active = false;
        this.damage = 3; // Kills 3 soldiers on hit
        this.hit = false;

        this.createModel();
    }

    createModel() {
        // Main barrel cylinder
        const barrelGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.8, 12);
        const barrelMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4400,
            roughness: 0.6,
            metalness: 0.3
        });
        this.barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        this.barrel.position.y = 0.4;
        this.barrel.castShadow = true;
        this.group.add(this.barrel);

        // Metal bands
        const bandGeometry = new THREE.TorusGeometry(0.38, 0.03, 8, 16);
        const bandMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.4,
            metalness: 0.8
        });

        const band1 = new THREE.Mesh(bandGeometry, bandMaterial);
        band1.position.y = 0.15;
        band1.rotation.x = Math.PI / 2;
        this.group.add(band1);

        const band2 = new THREE.Mesh(bandGeometry, bandMaterial);
        band2.position.y = 0.65;
        band2.rotation.x = Math.PI / 2;
        this.group.add(band2);

        // Hazard symbol (simplified as a triangle)
        const symbolGeometry = new THREE.CircleGeometry(0.2, 3);
        const symbolMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            side: THREE.DoubleSide
        });
        const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
        symbol.position.set(0, 0.4, 0.36);
        symbol.rotation.z = Math.PI;
        this.group.add(symbol);
    }

    init(x, z, damage = 3) {
        this.group.position.set(x, 0, z);
        this.damage = damage;
        this.active = true;
        this.hit = false;

        // Reset color
        this.barrel.material.color.setHex(0xff4400);
    }

    update(deltaTime, worldSpeed) {
        if (!this.active) return;

        // Move with world
        this.group.position.z += worldSpeed * deltaTime;

        // Subtle rotation/wobble
        this.barrel.rotation.y += deltaTime * 0.5;

        // Deactivate if passed player
        if (this.group.position.z > 5) {
            this.active = false;
        }
    }

    checkCollision(squadPosition, squadCount) {
        if (!this.active || this.hit) return 0;

        const barrelPos = this.group.position;

        // Check if barrel is at player's Z position
        if (barrelPos.z > -1 && barrelPos.z < 1.5) {
            // Check X distance (squad spread)
            const dx = Math.abs(squadPosition.x - barrelPos.x);
            const squadWidth = Math.min(squadCount * 0.1, 1.5);

            if (dx < squadWidth + 0.4) {
                this.hit = true;
                // Explosion visual
                this.barrel.material.color.setHex(0xff0000);
                this.barrel.material.emissive.setHex(0xff4400);

                return this.damage;
            }
        }

        return 0;
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

class Spike {
    constructor() {
        this.group = new THREE.Group();
        this.active = false;
        this.damage = 2;
        this.hit = false;

        this.createModel();
    }

    createModel() {
        // Spike strip
        const baseGeometry = new THREE.BoxGeometry(1.5, 0.12, 0.5);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.6,
            metalness: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.05;
        this.group.add(base);

        // Spikes
        const spikeGeometry = new THREE.ConeGeometry(0.08, 0.35, 4);
        const spikeMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.2,
            metalness: 0.9,
            emissive: 0x222222
        });

        for (let i = 0; i < 5; i++) {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(-0.6 + i * 0.3, 0.28, 0);
            this.group.add(spike);
        }
    }

    init(x, z, damage = 2) {
        this.group.position.set(x, 0, z);
        this.damage = damage;
        this.active = true;
        this.hit = false;
    }

    update(deltaTime, worldSpeed) {
        if (!this.active) return;

        this.group.position.z += worldSpeed * deltaTime;

        if (this.group.position.z > 5) {
            this.active = false;
        }
    }

    checkCollision(squadPosition, squadCount) {
        if (!this.active || this.hit) return 0;

        const pos = this.group.position;

        if (pos.z > -0.5 && pos.z < 1) {
            const dx = Math.abs(squadPosition.x - pos.x);
            const squadWidth = Math.min(squadCount * 0.1, 1.5);

            if (dx < squadWidth + 0.7) {
                this.hit = true;
                return this.damage;
            }
        }

        return 0;
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

export class Obstacles {
    constructor(scene) {
        this.scene = scene;
        this.barrels = [];
        this.spikes = [];
        this.maxBarrels = 20;
        this.maxSpikes = 15;

        // Pre-create barrels
        for (let i = 0; i < this.maxBarrels; i++) {
            const barrel = new Barrel();
            barrel.getGroup().visible = false;
            this.barrels.push(barrel);
            scene.add(barrel.getGroup());
        }

        // Pre-create spikes
        for (let i = 0; i < this.maxSpikes; i++) {
            const spike = new Spike();
            spike.getGroup().visible = false;
            this.spikes.push(spike);
            scene.add(spike.getGroup());
        }
    }

    spawnBarrel(x, z, damage = 3) {
        for (const barrel of this.barrels) {
            if (!barrel.isActive()) {
                barrel.init(x, z, damage);
                barrel.getGroup().visible = true;
                return barrel;
            }
        }
        return null;
    }

    spawnSpike(x, z, damage = 2) {
        for (const spike of this.spikes) {
            if (!spike.isActive()) {
                spike.init(x, z, damage);
                spike.getGroup().visible = true;
                return spike;
            }
        }
        return null;
    }

    spawnRandomObstacle(z) {
        const type = Math.random() > 0.6 ? 'spike' : 'barrel';
        const x = CONSTANTS.PLAYER_LANE_X + randomRange(-1.2, 1.2);

        if (type === 'barrel') {
            this.spawnBarrel(x, z, 3);
        } else {
            this.spawnSpike(x, z, 2);
        }
    }

    update(deltaTime, squadPosition, squad) {
        const worldSpeed = CONSTANTS.WORLD_SPEED;
        let totalDamage = 0;

        // Update barrels
        for (const barrel of this.barrels) {
            if (barrel.isActive()) {
                barrel.update(deltaTime, worldSpeed);

                const damage = barrel.checkCollision(squadPosition, squad.getCount());
                if (damage > 0) {
                    totalDamage += damage;
                    screenShake.add(5);
                    this.showHitEffect(barrel.getPosition());
                }

                if (!barrel.isActive()) {
                    barrel.getGroup().visible = false;
                }
            }
        }

        // Update spikes
        for (const spike of this.spikes) {
            if (spike.isActive()) {
                spike.update(deltaTime, worldSpeed);

                const damage = spike.checkCollision(squadPosition, squad.getCount());
                if (damage > 0) {
                    totalDamage += damage;
                    screenShake.add(3);
                }

                if (!spike.isActive()) {
                    spike.getGroup().visible = false;
                }
            }
        }

        // Apply damage to squad
        if (totalDamage > 0) {
            squad.modifyCount(-totalDamage);
        }
    }

    showHitEffect(position) {
        const container = document.getElementById('game-container');
        if (!container) return;

        const flash = document.createElement('div');
        flash.className = 'upgrade-flash';
        flash.style.background = 'radial-gradient(circle, rgba(255,100,0,0.6) 0%, transparent 70%)';
        container.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }
}
