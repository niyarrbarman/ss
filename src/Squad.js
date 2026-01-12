/**
 * Squad.js - Player squad management
 */
import * as THREE from 'three';
import { Soldier } from './Soldier.js';
import { CONSTANTS, randomRange } from './Utils.js';

export class Squad {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.soldiers = [];
        this.count = 0;
        this.currentWeapon = 'basic';
        this.reachedMax = false;

        this.position = new THREE.Vector3(CONSTANTS.PLAYER_LANE_X, 0, 0);
        this.targetX = CONSTANTS.PLAYER_LANE_X;

        // Spawn initial soldiers
        this.setCount(CONSTANTS.SQUAD_START_COUNT);

        scene.add(this.group);
    }

    setCount(newCount) {
        const diff = newCount - this.count;

        if (diff > 0) {
            const cappedCount = Math.min(200, this.count + diff);
            const toAdd = cappedCount - this.count;

            for (let i = 0; i < toAdd; i++) {
                this.addSoldier();
            }
        } else if (diff < 0) {
            for (let i = 0; i < -diff; i++) {
                this.removeSoldier();
            }
        }

        this.count = Math.max(0, Math.min(200, newCount));
        this.updateFormation();
        this.updateUI();
    }

    addSoldier() {
        const soldier = new Soldier();
        soldier.createGun(this.currentWeapon);
        this.soldiers.push(soldier);
        this.group.add(soldier.getGroup());

        // Spawn effect - start small and grow
        soldier.getGroup().scale.set(0.1, 0.1, 0.1);
        soldier.spawnTime = 0;
    }

    removeSoldier() {
        if (this.soldiers.length > 0) {
            const soldier = this.soldiers.pop();
            this.group.remove(soldier.getGroup());
        }
    }

    modifyCount(delta) {
        this.setCount(this.count + delta);
    }

    updateFormation() {
        const spacing = CONSTANTS.SOLDIER_SPACING;
        const count = this.soldiers.length;

        if (count === 0) return;

        // Arrange in a blob formation
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);

        let index = 0;
        for (let row = 0; row < rows && index < count; row++) {
            const colsInRow = Math.min(cols, count - index);
            const rowOffset = (colsInRow - 1) * spacing / 2;

            for (let col = 0; col < colsInRow && index < count; col++) {
                const soldier = this.soldiers[index];
                const x = col * spacing - rowOffset + randomRange(-0.05, 0.05);
                const z = row * spacing * 0.8 + randomRange(-0.05, 0.05);
                soldier.setPosition(x, 0, z);
                index++;
            }
        }
    }

    setWeapon(weaponType) {
        this.currentWeapon = weaponType;
        for (const soldier of this.soldiers) {
            soldier.createGun(weaponType);
        }
    }

    update(deltaTime, targetX, isShooting) {
        // Update position
        this.targetX = targetX;
        this.position.x += (this.targetX - this.position.x) * CONSTANTS.MOVE_SPEED;
        this.group.position.copy(this.position);

        // Face slightly towards enemy lane
        this.group.rotation.y = -0.1;

        // Update each soldier
        for (const soldier of this.soldiers) {
            soldier.update(deltaTime, isShooting);

            // Spawn animation
            if (soldier.spawnTime !== undefined && soldier.spawnTime < 1) {
                soldier.spawnTime += deltaTime * 3;
                const scale = Math.min(1, soldier.spawnTime);
                soldier.getGroup().scale.set(scale, scale, scale);

                if (soldier.spawnTime >= 1) {
                    delete soldier.spawnTime;
                }
            }
        }
    }

    updateUI(isMax = false) {
        const element = document.getElementById('squad-number');
        if (element) {
            element.textContent = this.count;
        }
    }

    getPosition() {
        return this.position;
    }

    getCount() {
        return this.count;
    }

    getSoldiers() {
        return this.soldiers;
    }

    getCurrentWeapon() {
        return this.currentWeapon;
    }

    isAlive() {
        return this.count > 0;
    }

    hasReachedMax() {
        return this.count >= 200;
    }

    clearMaxFlag() {
        // Flag logic replaced by state check in hasReachedMax
    }
}
