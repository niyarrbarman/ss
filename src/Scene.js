/**
 * Scene.js - Three.js scene setup
 */
import * as THREE from 'three';

export class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x9fd3ff); // Bright sky blue
        this.scene.fog = new THREE.Fog(0x9fd3ff, 40, 140);

        this.setupLighting();
    }

    setupLighting() {
        // Ambient light for base illumination
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        // Main directional light (sun)
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(10, 30, 20);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 1024;
        sun.shadow.mapSize.height = 1024;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 100;
        sun.shadow.camera.left = -30;
        sun.shadow.camera.right = 30;
        sun.shadow.camera.top = 30;
        sun.shadow.camera.bottom = -30;
        this.scene.add(sun);

        // Fill light to soften shadows
        const fill = new THREE.DirectionalLight(0x9db8ff, 0.3);
        fill.position.set(-10, 10, -10);
        this.scene.add(fill);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    getScene() {
        return this.scene;
    }
}
