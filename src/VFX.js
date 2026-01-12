/**
 * VFX.js - Visual effects (explosions, trails, particles)
 */
import * as THREE from 'three';

export class VFX {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    createExplosion(position, color = 0xff6600, size = 1) {
        // Simple expanding sphere that fades
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        this.scene.add(mesh);

        const particle = {
            mesh,
            material,
            life: 0,
            maxLife: 0.3,
            size,
            update: (dt) => {
                particle.life += dt;
                const t = particle.life / particle.maxLife;

                const scale = size * (1 + t * 3);
                mesh.scale.set(scale, scale, scale);
                material.opacity = 1 - t;

                if (particle.life >= particle.maxLife) {
                    this.scene.remove(mesh);
                    return false;
                }
                return true;
            }
        };

        this.particles.push(particle);
    }

    createSpawnEffect(position) {
        // Blue shimmer for soldier spawn
        this.createExplosion(position, 0x00aaff, 0.5);
    }

    createDeathPuff(position) {
        // White puff for enemy death
        this.createExplosion(position, 0xffffff, 0.3);
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const alive = this.particles[i].update(deltaTime);
            if (!alive) {
                this.particles.splice(i, 1);
            }
        }
    }
}
