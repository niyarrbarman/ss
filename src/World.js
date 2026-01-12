/**
 * World.js - Bridge environment with treadmill movement
 */
import * as THREE from 'three';
import { CONSTANTS } from './Utils.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.segments = [];
        this.citySegments = [];
        this.segmentLength = 20;
        this.citySegmentLength = 40;
        this.numSegments = 6;
        this.numCitySegments = 4;

        this.createMaterials();
        this.createOcean();
        this.createInitialSegments();

        // Defer heavier background work for faster first paint
        this.cityEnabled = false;

        scene.add(this.group);
    }

    createMaterials() {
        // Bridge road material
        this.roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x2e2f33,
            roughness: 0.9,
            metalness: 0.05
        });

        // Lane marking material
        this.markingMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

        // Center divider material
        this.dividerMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5c542,
            roughness: 0.4
        });

        // Guard rail material
        this.railMaterial = new THREE.MeshStandardMaterial({
            color: 0x7d8b96,
            roughness: 0.5,
            metalness: 0.4
        });

        // Barrier stripes
        this.barrierMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            roughness: 0.4
        });

        this.pylonMaterial = new THREE.MeshStandardMaterial({
            color: 0x8a9ba8,
            roughness: 0.4,
            metalness: 0.5
        });

        this.cableMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.4
        });

        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x111122,
            roughness: 0.2,
            metalness: 0.8
        });

        this.buildingMaterials = [
            new THREE.MeshStandardMaterial({ color: 0xccd5e0, roughness: 0.6 }),
            new THREE.MeshStandardMaterial({ color: 0xbac4d1, roughness: 0.6 }),
            new THREE.MeshStandardMaterial({ color: 0xd8e0e8, roughness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: 0xaab2bd, roughness: 0.7 })
        ];
        this.buildingMaterials.forEach(m => m.userData = { isBuilding: true, windowMat: windowMaterial });
    }

    createOcean() {
        // Simple ocean plane
        const oceanGeometry = new THREE.PlaneGeometry(200, 200);
        const oceanMaterial = new THREE.MeshStandardMaterial({
            color: 0x1f78b5,
            roughness: 0.2,
            metalness: 0.3,
            transparent: true,
            opacity: 0.92
        });

        this.ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
        this.ocean.rotation.x = -Math.PI / 2;
        this.ocean.position.y = -2;
        this.scene.getScene().add(this.ocean);

        // Add wave animation time
        this.waveTime = 0;
    }

    createBridgeSegment(zPosition, index) {
        const segment = new THREE.Group();
        segment.position.z = zPosition;

        // Main road surface - wider to accommodate 3 lanes
        const roadGeometry = new THREE.BoxGeometry(14, 0.3, this.segmentLength);
        const road = new THREE.Mesh(roadGeometry, this.roadMaterial);
        road.position.y = -0.15;
        road.receiveShadow = true;
        segment.add(road);

        // LEFT lane stripe (red - enemy side) - FLAT on ground, no wall
        const stripeGeometry = new THREE.BoxGeometry(0.2, 0.05, this.segmentLength);
        const leftStripe = new THREE.Mesh(stripeGeometry, this.barrierMaterial);
        leftStripe.position.set(-1.5, 0.02, 0);
        segment.add(leftStripe);

        // RIGHT lane stripe (green - boost side) - FLAT on ground, no wall
        const greenMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            roughness: 0.4
        });
        const rightStripe = new THREE.Mesh(stripeGeometry, greenMaterial);
        rightStripe.position.set(1.5, 0.02, 0);
        segment.add(rightStripe);

        // Center yellow double line
        const centerLineGeometry = new THREE.BoxGeometry(0.08, 0.05, this.segmentLength);
        const leftCenterLine = new THREE.Mesh(centerLineGeometry, this.dividerMaterial);
        leftCenterLine.position.set(-0.12, 0.03, 0);
        segment.add(leftCenterLine);

        const rightCenterLine = new THREE.Mesh(centerLineGeometry, this.dividerMaterial);
        rightCenterLine.position.set(0.12, 0.03, 0);
        segment.add(rightCenterLine);

        // Left guard rail (outer edge)
        this.createGuardRail(segment, -7);

        // Right guard rail (outer edge)
        this.createGuardRail(segment, 7);

        // Lane markings for center
        this.createLaneMarkings(segment);

        // Add street lamps
        this.createStreetLamp(segment, -6.8);
        this.createStreetLamp(segment, 6.8);

        if (index % 3 === 0) {
            this.createBridgeTower(segment);
        }

        return segment;
    }

    createGuardRail(segment, xPos) {
        // Vertical posts
        const postGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.2);
        for (let i = 0; i < 4; i++) {
            const post = new THREE.Mesh(postGeometry, this.railMaterial);
            post.position.set(xPos, 0.75, -this.segmentLength / 2 + 2 + i * 5);
            post.castShadow = true;
            segment.add(post);
        }

        // Horizontal rail
        const railGeometry = new THREE.BoxGeometry(0.15, 0.1, this.segmentLength);
        const rail = new THREE.Mesh(railGeometry, this.railMaterial);
        rail.position.set(xPos, 1.2, 0);
        segment.add(rail);

        // Lower rail
        const lowerRail = new THREE.Mesh(railGeometry, this.railMaterial);
        lowerRail.position.set(xPos, 0.6, 0);
        segment.add(lowerRail);
    }

    createBridgeTower(segment) {
        const pillarGeometry = new THREE.BoxGeometry(1.2, 9, 1.2); // Thicker, taller pillars
        const crossGeometry = new THREE.BoxGeometry(10, 1.5, 1.2); // Thicker crossbeam

        const leftPillar = new THREE.Mesh(pillarGeometry, this.pylonMaterial);
        leftPillar.position.set(-5.5, 4.5, 0);
        leftPillar.castShadow = true;
        segment.add(leftPillar);

        const rightPillar = new THREE.Mesh(pillarGeometry, this.pylonMaterial);
        rightPillar.position.set(5.5, 4.5, 0);
        rightPillar.castShadow = true;
        segment.add(rightPillar);

        const crossBeam = new THREE.Mesh(crossGeometry, this.pylonMaterial);
        crossBeam.position.set(0, 8.2, 0);
        crossBeam.castShadow = true;
        segment.add(crossBeam);

        // Add detailed cable anchors
        const anchorGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const anchorL = new THREE.Mesh(anchorGeo, this.cableMaterial);
        anchorL.position.set(-5.5, 8.5, 0);
        segment.add(anchorL);
        
        const anchorR = new THREE.Mesh(anchorGeo, this.cableMaterial);
        anchorR.position.set(5.5, 8.5, 0);
        segment.add(anchorR);

        const leftCableTop = new THREE.Vector3(-5.5, 8.5, -3);
        const rightCableTop = new THREE.Vector3(5.5, 8.5, -3);
        const cableTargets = [
            new THREE.Vector3(-7, 1.6, 6),
            new THREE.Vector3(-7, 1.2, -6),
            new THREE.Vector3(7, 1.6, 6),
            new THREE.Vector3(7, 1.2, -6)
        ];
        
        // Thicker cables
        this.cableWidth = 0.08; 

        this.createCable(segment, leftCableTop, cableTargets[0]);
        this.createCable(segment, leftCableTop, cableTargets[1]);
        this.createCable(segment, rightCableTop, cableTargets[2]);
        this.createCable(segment, rightCableTop, cableTargets[3]);
    }

    createCable(segment, start, end) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const cableGeometry = new THREE.CylinderGeometry(this.cableWidth || 0.05, this.cableWidth || 0.05, length, 6);
        const cable = new THREE.Mesh(cableGeometry, this.cableMaterial);
        cable.position.copy(start).addScaledVector(direction, 0.5);
        cable.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        segment.add(cable);
    }

    createLaneMarkings(segment) {
        // Dashed line markings on player lane
        const dashGeometry = new THREE.BoxGeometry(0.15, 0.02, 2);
        for (let i = 0; i < 4; i++) {
            const dash = new THREE.Mesh(dashGeometry, this.markingMaterial);
            dash.position.set(CONSTANTS.PLAYER_LANE_X, 0.01, -this.segmentLength / 2 + 3 + i * 5);
            segment.add(dash);
        }
    }

    createInitialSegments() {
        for (let i = 0; i < this.numSegments; i++) {
            const z = -i * this.segmentLength + this.segmentLength;
            const segment = this.createBridgeSegment(z, i);
            segment.userData.index = i;
            this.segments.push(segment);
            this.group.add(segment);
        }
    }

    enableCity() {
        if (this.cityEnabled) return;
        this.cityEnabled = true;
        this.createCitySegments();
    }

    createCitySegments() {
        for (let i = 0; i < this.numCitySegments; i++) {
            const z = -i * this.citySegmentLength;
            const segment = this.createCitySegment(z);
            segment.userData.index = i;
            this.citySegments.push(segment);
            this.group.add(segment);
        }
    }

    createCitySegment(zPosition) {
        const segment = new THREE.Group();
        segment.position.z = zPosition;

        const spacing = 8; // More space between buildings
        const offsetZ = -this.citySegmentLength / 2 + 4;

        for (let i = 0; i < 5; i++) { // Fewer but better buildings
            const height = 8 + Math.random() * 12; // Taller
            const width = 3 + Math.random() * 2;
            const depth = 3 + Math.random() * 2;
            const material = this.buildingMaterials[i % this.buildingMaterials.length];

            const createBuilding = (x, h, w, d) => {
                const bGroup = new THREE.Group();
                const geometry = new THREE.BoxGeometry(w, h, d);
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.y = h / 2 - 2;
                mesh.castShadow = true;
                bGroup.add(mesh);

                // Simple window grid texture
                const winW = 0.4;
                const winH = 0.6;
                const rows = Math.floor(h / 1.5);
                const cols = Math.floor(w / 1.2);
                
                if (rows > 2 && cols > 1) {
                   const winGeo = new THREE.BoxGeometry(winW, winH, 0.1);
                   const winMesh = new THREE.InstancedMesh(winGeo, material.userData.windowMat, rows * cols);
                   let idx = 0;
                   const dummy = new THREE.Object3D();
                   
                   for(let r=0; r<rows; r++) {
                       for(let c=0; c<cols; c++) {
                           dummy.position.set(
                               (c - (cols-1)/2) * 1.0,
                               (r - (rows-1)/2) * 1.2 + h/2 - 2, 
                               d/2
                           );
                           dummy.updateMatrix();
                           winMesh.setMatrixAt(idx++, dummy.matrix);
                       }
                   }
                   bGroup.add(winMesh);
                }
                
                bGroup.position.set(x, 0, offsetZ + i * spacing);
                return bGroup;
            };

            segment.add(createBuilding(-22 - Math.random() * 5, height, width, depth));
            segment.add(createBuilding(22 + Math.random() * 5, height * 0.9, width, depth));
        }

        return segment;
    }

    update(deltaTime) {
        const moveSpeed = CONSTANTS.WORLD_SPEED * deltaTime;

        // Move all segments towards player
        for (const segment of this.segments) {
            segment.position.z += moveSpeed;

            // If segment passed the player, recycle it
            if (segment.position.z > this.segmentLength * 2) {
                const farthestZ = this.getFarthestZ();
                segment.position.z = farthestZ - this.segmentLength;
            }
        }

        if (this.cityEnabled) {
            for (const segment of this.citySegments) {
                segment.position.z += moveSpeed * 0.6;

                if (segment.position.z > this.citySegmentLength) {
                    const farthestZ = this.getFarthestCityZ();
                    segment.position.z = farthestZ - this.citySegmentLength;
                }
            }
        }

        // Animate ocean waves
        this.waveTime += deltaTime;
        this.ocean.position.y = -2 + Math.sin(this.waveTime * 0.5) * 0.1;
    }

    createStreetLamp(segment, xPos) {
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 4, 6);
        const poleMat = this.railMaterial;
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(xPos, 2, 0);
        pole.castShadow = true;
        segment.add(pole);
        
        const armGeo = new THREE.BoxGeometry(1.5, 0.1, 0.1);
        const arm = new THREE.Mesh(armGeo, poleMat);
        arm.position.set(xPos + (xPos > 0 ? -0.5 : 0.5), 3.8, 0);
        segment.add(arm);
        
        const lampGeo = new THREE.BoxGeometry(0.4, 0.1, 0.2);
        const lamp = new THREE.Mesh(lampGeo, poleMat);
        lamp.position.set(xPos + (xPos > 0 ? -1.2 : 1.2), 3.75, 0);
        segment.add(lamp);
        
        // Emissive light part
        const bulbGeo = new THREE.PlaneGeometry(0.3, 0.15);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.rotation.x = Math.PI / 2;
        bulb.position.set(xPos + (xPos > 0 ? -1.2 : 1.2), 3.7, 0);
        segment.add(bulb);
    }
    
    getFarthestZ() {
        let minZ = Infinity;
        for (const segment of this.segments) {
            if (segment.position.z < minZ) {
                minZ = segment.position.z;
            }
        }
        return minZ;
    }

    getFarthestCityZ() {
        if (!this.citySegments.length) return 0;
        let minZ = Infinity;
        for (const segment of this.citySegments) {
            if (segment.position.z < minZ) {
                minZ = segment.position.z;
            }
        }
        return minZ;
    }

    // Get world offset for spawning objects at consistent world positions
    getWorldOffset() {
        return this.segments[0] ? this.segments[0].position.z : 0;
    }
}
