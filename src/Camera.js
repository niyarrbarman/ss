/**
 * Camera.js - Third-person camera controller
 */
import * as THREE from 'three';
import { screenShake, lerp } from './Utils.js';

export class Camera {
    constructor(canvas) {
        const aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 200);

        // Camera position behind and above the squad
        this.targetPosition = new THREE.Vector3(0, 12, 8);
        this.camera.position.copy(this.targetPosition);

        // Look at point in front of squad
        this.lookAtTarget = new THREE.Vector3(0, 0, -10);
        this.camera.lookAt(this.lookAtTarget);

        // Smooth follow
        this.followSpeed = 0.05;
    }

    update(squadPosition) {
        // Smoothly follow squad's X position
        this.targetPosition.x = squadPosition.x * 0.5;

        // Apply screen shake
        screenShake.update();

        // Lerp camera position
        this.camera.position.x = lerp(
            this.camera.position.x,
            this.targetPosition.x + screenShake.offsetX,
            this.followSpeed
        );
        this.camera.position.y = lerp(
            this.camera.position.y,
            this.targetPosition.y + screenShake.offsetY,
            this.followSpeed
        );

        // Update look target
        this.lookAtTarget.x = squadPosition.x * 0.3;
        this.camera.lookAt(this.lookAtTarget);
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    getCamera() {
        return this.camera;
    }
}
