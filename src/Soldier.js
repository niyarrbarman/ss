/**
 * Soldier.js - Individual soldier entity
 */
import * as THREE from 'three';

export class Soldier {
    constructor() {
        this.group = new THREE.Group();
        this.createModel();

        this.runCycle = 0;
        this.shootCycle = 0;
        this.active = true;
    }

    createModel() {
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xf2c8a0,
            roughness: 0.8
        });
        const suitMaterial = new THREE.MeshStandardMaterial({
            color: 0x2f6fb9,
            roughness: 0.6
        });
        const vestMaterial = new THREE.MeshStandardMaterial({
            color: 0x1e3d63,
            roughness: 0.7
        });
        const helmetMaterial = new THREE.MeshStandardMaterial({
            color: 0x2f86e0,
            roughness: 0.3,
            metalness: 0.2
        });
        const beltMaterial = new THREE.MeshStandardMaterial({
            color: 0x2b2b2b,
            roughness: 0.6
        });
        const bootMaterial = new THREE.MeshStandardMaterial({
            color: 0x1f2a36,
            roughness: 0.8
        });

        this.torsoGroup = new THREE.Group();

        const bodyGeometry = new THREE.BoxGeometry(0.26, 0.38, 0.16);
        this.body = new THREE.Mesh(bodyGeometry, suitMaterial);
        this.body.position.y = 0.38;
        this.body.castShadow = true;
        this.torsoGroup.add(this.body);

        const vestGeometry = new THREE.BoxGeometry(0.28, 0.3, 0.18);
        const vest = new THREE.Mesh(vestGeometry, vestMaterial);
        vest.position.set(0, 0.38, 0.02);
        vest.castShadow = true;
        this.torsoGroup.add(vest);

        const beltGeometry = new THREE.BoxGeometry(0.28, 0.08, 0.2);
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 0.22;
        this.torsoGroup.add(belt);

        this.group.add(this.torsoGroup);

        this.headGroup = new THREE.Group();
        const headGeometry = new THREE.SphereGeometry(0.11, 6, 6);
        this.head = new THREE.Mesh(headGeometry, skinMaterial);
        this.head.position.y = 0.66;
        this.head.castShadow = true;
        this.headGroup.add(this.head);

        const helmetGeometry = new THREE.SphereGeometry(0.13, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2);
        this.helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        this.helmet.position.y = 0.69;
        this.helmet.rotation.x = Math.PI;
        this.helmet.castShadow = true;
        this.headGroup.add(this.helmet);

        const brimGeometry = new THREE.BoxGeometry(0.18, 0.04, 0.12);
        const brim = new THREE.Mesh(brimGeometry, helmetMaterial);
        brim.position.set(0, 0.62, 0.07);
        this.headGroup.add(brim);

        this.group.add(this.headGroup);

        const createLeg = () => {
            const legGroup = new THREE.Group();
            const legGeometry = new THREE.BoxGeometry(0.11, 0.22, 0.11);
            const leg = new THREE.Mesh(legGeometry, suitMaterial);
            leg.position.y = -0.11;
            legGroup.add(leg);

            const bootGeometry = new THREE.BoxGeometry(0.12, 0.1, 0.15);
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
        this.leftArm.position.set(-0.2, 0.5, 0);
        this.group.add(this.leftArm);

        this.rightArm = createArm();
        this.rightArm.position.set(0.2, 0.5, 0);
        this.group.add(this.rightArm);

        // Gun (will be updated based on weapon type)
        this.createGun('basic');
    }

    createGun(weaponType) {
        // Remove existing gun if any
        if (this.gun) {
            this.rightArm.remove(this.gun);
        }

        let gunGeometry, gunColor;

        switch (weaponType) {
            case 'shotgun':
                gunGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.25);
                gunColor = 0x666666;
                break;
            case 'rocket':
                gunGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.3, 6);
                gunColor = 0x445533;
                break;
            case 'minigun':
                gunGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.35, 8);
                gunColor = 0x555577;
                break;
            default: // basic
                gunGeometry = new THREE.BoxGeometry(0.03, 0.03, 0.2);
                gunColor = 0x333333;
        }

        const gunMaterial = new THREE.MeshStandardMaterial({
            color: gunColor,
            roughness: 0.4,
            metalness: 0.6
        });

        this.gun = new THREE.Mesh(gunGeometry, gunMaterial);
        this.gun.position.set(0, -0.28, -0.18);

        if (weaponType === 'rocket' || weaponType === 'minigun') {
            this.gun.rotation.x = Math.PI / 2;
        }

        this.rightArm.add(this.gun);
        this.weaponType = weaponType;
    }

    update(deltaTime, isShooting) {
        // Running animation
        this.runCycle += deltaTime * 10;
        const legSwing = Math.sin(this.runCycle) * 0.3;
        this.leftLeg.rotation.x = legSwing;
        this.rightLeg.rotation.x = -legSwing;

        // Arm swing (opposite to legs, but front arm aims forward)
        this.leftArm.rotation.x = -legSwing * 0.5;

        // Shooting pose - right arm points forward-left (towards enemy lane)
        this.rightArm.rotation.x = -0.35;
        this.rightArm.rotation.z = 0.25;

        // Slight body bob
        const bob = Math.abs(Math.sin(this.runCycle * 2)) * 0.02;
        this.torsoGroup.position.y = bob;
        this.headGroup.position.y = bob;

        // Shooting recoil
        if (isShooting) {
            this.shootCycle += deltaTime * 30;
            const recoil = Math.sin(this.shootCycle) * 0.02;
            this.gun.position.z = -0.12 + recoil;
        }
    }

    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }

    getGroup() {
        return this.group;
    }

    getMuzzlePosition() {
        // Get world position of gun muzzle
        const pos = new THREE.Vector3(0, 0, -0.22);
        this.gun.localToWorld(pos);
        return pos;
    }
}
