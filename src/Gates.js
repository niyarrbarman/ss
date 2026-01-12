/**
 * Gates.js - Number gates (+/-)
 */
import * as THREE from 'three';
import { CONSTANTS, screenShake } from './Utils.js';

class Gate {
    constructor() {
        this.group = new THREE.Group();
        this.value = 0;
        this.active = false;
        this.passed = false;

        this.createModel();
    }

    createModel() {
        // Gate frame (two pillars + top bar)
        const pillarGeometry = new THREE.BoxGeometry(0.3, 2, 0.3);
        const topGeometry = new THREE.BoxGeometry(2.5, 0.3, 0.3);

        // Will be colored based on positive/negative
        this.material = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            roughness: 0.3,
            emissive: 0x003322,
            emissiveIntensity: 0.3
        });

        this.leftPillar = new THREE.Mesh(pillarGeometry, this.material);
        this.leftPillar.position.set(-1, 1, 0);
        this.group.add(this.leftPillar);

        this.rightPillar = new THREE.Mesh(pillarGeometry, this.material);
        this.rightPillar.position.set(1, 1, 0);
        this.group.add(this.rightPillar);

        this.topBar = new THREE.Mesh(topGeometry, this.material);
        this.topBar.position.set(0, 2, 0);
        this.group.add(this.topBar);

        // Back panel for visibility
        const panelGeometry = new THREE.PlaneGeometry(2, 1.5);
        this.panelMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        this.panel = new THREE.Mesh(panelGeometry, this.panelMaterial);
        this.panel.position.set(0, 1.2, 0);
        this.group.add(this.panel);

        // Number display (using canvas texture)
        this.numberCanvas = document.createElement('canvas');
        this.numberCanvas.width = 128;
        this.numberCanvas.height = 64;
        this.numberTexture = new THREE.CanvasTexture(this.numberCanvas);

        const numberGeometry = new THREE.PlaneGeometry(1.5, 0.75);
        this.numberMaterial = new THREE.MeshBasicMaterial({
            map: this.numberTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        this.numberMesh = new THREE.Mesh(numberGeometry, this.numberMaterial);
        this.numberMesh.position.set(0, 1.2, 0.2);
        this.group.add(this.numberMesh);
    }

    init(x, z, value) {
        this.group.position.set(x, 0, z);
        this.value = value;
        this.active = true;
        this.passed = false;

        // Color based on value
        const isPositive = value > 0;
        const color = isPositive ? 0x00ff88 : 0xff4444;
        const emissive = isPositive ? 0x003322 : 0x331111;

        this.material.color.setHex(color);
        this.material.emissive.setHex(emissive);
        this.panelMaterial.color.setHex(color);

        // Update number display
        this.updateNumberDisplay();
    }

    updateNumberDisplay() {
        const ctx = this.numberCanvas.getContext('2d');
        ctx.clearRect(0, 0, 128, 64);

        // Text style
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.strokeText(this.value > 0 ? '+' + this.value : this.value.toString(), 64, 32);

        // Fill
        ctx.fillStyle = '#fff';
        ctx.fillText(this.value > 0 ? '+' + this.value : this.value.toString(), 64, 32);

        this.numberTexture.needsUpdate = true;
    }

    update(deltaTime, worldSpeed) {
        if (!this.active) return;

        // Move with world
        this.group.position.z += worldSpeed * deltaTime;

        // Slight floating animation
        this.group.position.y = Math.sin(Date.now() * 0.003) * 0.1;

        // Deactivate if passed
        if (this.group.position.z > 10) {
            this.active = false;
        }
    }

    checkCollision(squadPosition) {
        if (!this.active || this.passed) return null;

        const gatePos = this.group.position;

        // Check if squad passed through
        if (gatePos.z > -1 && gatePos.z < 1) {
            const dx = Math.abs(squadPosition.x - gatePos.x);
            if (dx < 1.5) {
                this.passed = true;
                return this.value;
            }
        }

        return null;
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

export class Gates {
    constructor(scene) {
        this.scene = scene;
        this.gates = [];
        this.maxGates = 20;

        // Pre-create gates
        for (let i = 0; i < this.maxGates; i++) {
            const gate = new Gate();
            gate.getGroup().visible = false;
            this.gates.push(gate);
            scene.add(gate.getGroup());
        }
    }

    spawnGate(x, z, value) {
        for (const gate of this.gates) {
            if (!gate.isActive()) {
                gate.init(x, z, value);
                gate.getGroup().visible = true;
                return gate;
            }
        }
        return null;
    }

    spawnGateChoice(z, leftValue, rightValue) {
        // Spawn two gates side by side on the BOOST lane (right side)
        const boostLane = CONSTANTS.BOOST_LANE_X || 3;
        const leftX = boostLane - 1.2;
        const rightX = boostLane + 1.2;

        this.spawnGate(leftX, z, leftValue);
        this.spawnGate(rightX, z, rightValue);
    }

    update(deltaTime, squadPosition, squad) {
        const worldSpeed = CONSTANTS.WORLD_SPEED;

        for (const gate of this.gates) {
            if (gate.isActive()) {
                gate.update(deltaTime, worldSpeed);

                // Check collision
                const value = gate.checkCollision(squadPosition);
                if (value !== null) {
                    squad.modifyCount(value);

                    // Visual feedback
                    if (value > 0) {
                        screenShake.add(2);
                        this.showGateEffect(gate.getPosition(), true);
                    } else {
                        screenShake.add(3);
                        this.showGateEffect(gate.getPosition(), false);
                    }
                }

                if (!gate.isActive()) {
                    gate.getGroup().visible = false;
                }
            }
        }
    }

    showGateEffect(position, isPositive) {
        // Flash effect (would be implemented with proper VFX system)
        const container = document.getElementById('game-container');
        if (!container) return;

        const flash = document.createElement('div');
        flash.className = 'upgrade-flash';
        flash.style.background = isPositive
            ? 'radial-gradient(circle, rgba(0,255,100,0.5) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,50,50,0.5) 0%, transparent 70%)';

        container.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
    }
}
