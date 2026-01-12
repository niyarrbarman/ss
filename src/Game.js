/**
 * Game.js - Main game class managing state and level (ENDLESS MODE)
 */
import * as THREE from 'three';
import { Scene } from './Scene.js';
import { Camera } from './Camera.js';
import { World } from './World.js';
import { Controls } from './Controls.js';
import { Squad } from './Squad.js';
import { Combat } from './Combat.js';
import { Enemies } from './Enemies.js';
import { Gates } from './Gates.js';
import { Crates } from './Crates.js';
import { Obstacles } from './Obstacles.js';
import { VFX } from './VFX.js';
import { UI } from './UI.js';
import { CONSTANTS, randomRange, randomInt } from './Utils.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Game state
        this.state = 'menu'; // menu, playing, lost
        this.levelProgress = 0;
        this.score = 0;
        this.difficulty = 1;
        this.bossCount = 0;

        // Spawn timers for endless mode
        this.lastGateSpawn = 0;
        this.lastCrateSpawn = 0;
        this.lastSwarmSpawn = 0;
        this.lastBossSpawn = 0;
        this.lastObstacleSpawn = 0;

        // Time tracking
        this.clock = new THREE.Clock();
        this.lastTime = 0;

        // Initialize systems
        this.init();

        // Handle resize
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    init() {
        // Core systems
        this.scene = new Scene();
        this.camera = new Camera(this.canvas);
        this.controls = new Controls(this.canvas);

        // World
        this.world = new World(this.scene);

        // Entities
        this.squad = new Squad(this.scene);
        this.enemies = new Enemies(this.scene);
        this.gates = new Gates(this.scene);
        this.crates = new Crates(this.scene);
        this.obstacles = new Obstacles(this.scene);

        // Combat
        this.combat = new Combat(this.scene);

        // VFX
        this.vfx = new VFX(this.scene);

        // UI
        this.ui = new UI();
        this.ui.setOnStart(() => this.startGame());
        this.ui.setOnRestart(() => this.restart());

        // Show start screen
        this.ui.showStartScreen();
    }

    startGame() {
        this.state = 'playing';
        this.ui.hideStartScreen();
        this.levelProgress = 0;
        this.score = 0;
        this.difficulty = 1;

        // Reset spawn timers
        this.lastGateSpawn = 0;
        this.lastCrateSpawn = 0;
        this.lastSwarmSpawn = 0;
        this.lastBossSpawn = 0;
        this.lastObstacleSpawn = 0;

        // Initial spawns
        this.spawnInitialWave();
    }

    spawnInitialWave() {
        const spawnZ = -40;

        // Initial positive gate on boost lane (right) to help player grow
        const boostLane = CONSTANTS.BOOST_LANE_X || 3;
        this.gates.spawnGate(boostLane, spawnZ, 5);

        // Some initial enemies on left lane
        this.enemies.spawnSwarmWave(spawnZ - 20, 15);
    }

    // Endless spawning logic
    updateEndlessSpawning() {
        const progress = this.levelProgress;
        const spawnZ = -45;

        // Increase difficulty over time (faster scaling)
        this.difficulty = 1 + Math.floor(progress / 80) * 0.4;

        // Spawn gates every ~12 units of progress
        if (progress - this.lastGateSpawn > 12) {
            this.spawnRandomGates(spawnZ);
            this.lastGateSpawn = progress;
        }

        // Spawn obstacles every ~15 units (more frequent as difficulty rises)
        const obstacleInterval = Math.max(10, 18 - this.difficulty * 2);
        if (progress - this.lastObstacleSpawn > obstacleInterval) {
            this.spawnRandomObstacles(spawnZ);
            this.lastObstacleSpawn = progress;
        }

        // Spawn weapon crates every ~50 units
        if (progress - this.lastCrateSpawn > 50) {
            this.spawnRandomCrate(spawnZ);
            this.lastCrateSpawn = progress;
        }

        // Spawn swarm waves every ~18 units (more enemies over time)
        if (progress - this.lastSwarmSpawn > 18) {
            const count = Math.floor(15 + this.difficulty * 20);
            this.enemies.spawnSwarmWave(spawnZ - 10, count);
            this.lastSwarmSpawn = progress;
        }

        // Spawn boss - progressively HARDER
        // First boss at 100, then every 120 units (faster)
        const bossInterval = Math.max(80, 150 - this.bossCount * 10);
        if (progress - this.lastBossSpawn > bossInterval) {
            this.bossCount = (this.bossCount || 0) + 1;

            // Boss HP scales exponentially: 400, 600, 900, 1300, 1800...
            const baseHp = 400;
            const hpScaling = Math.pow(1.4, this.bossCount - 1);
            const bossHp = Math.floor(baseHp * hpScaling);

            this.enemies.spawnBoss(spawnZ - 5, bossHp);
            this.lastBossSpawn = progress;

            // Announce boss (could add visual indicator)
            console.log(`BOSS #${this.bossCount} spawned! HP: ${bossHp}`);
        }
    }

    spawnRandomGates(z) {
        const rand = Math.random();

        if (rand < 0.6) {
            // Gate choice (most common)
            const posValue = randomInt(3, 10 + Math.floor(this.difficulty * 2));
            const negValue = -randomInt(3 + Math.floor(this.difficulty * 2), 8 + Math.floor(this.difficulty * 3));

            if (Math.random() > 0.5) {
                this.gates.spawnGateChoice(z, posValue, negValue);
            } else {
                this.gates.spawnGateChoice(z, negValue, posValue);
            }
        } else {
            // Single gate on boost lane
            const value = Math.random() > 0.3
                ? randomInt(3, 8)
                : -randomInt(2 + Math.floor(this.difficulty), 5 + Math.floor(this.difficulty * 2));
            const boostLane = CONSTANTS.BOOST_LANE_X || 3;
            this.gates.spawnGate(boostLane, z, value);
        }
    }

    spawnRandomObstacles(z) {
        // Spawn obstacles in the CENTER (player path) - they must dodge!
        const count = randomInt(1, 2 + Math.floor(this.difficulty * 0.5));

        for (let i = 0; i < count; i++) {
            // Obstacles spawn in center where player is
            const x = CONSTANTS.PLAYER_LANE_X + randomRange(-1.5, 1.5);
            const zOffset = randomRange(-5, 5);

            // Scale obstacle damage with difficulty
            const barrelDamage = randomInt(2 + Math.floor(this.difficulty), 4 + Math.floor(this.difficulty * 2));
            const spikeDamage = randomInt(1 + Math.floor(this.difficulty), 3 + Math.floor(this.difficulty * 2));

            if (Math.random() > 0.4) {
                this.obstacles.spawnBarrel(x, z + zOffset, barrelDamage);
            } else {
                this.obstacles.spawnSpike(x, z + zOffset, spikeDamage);
            }
        }
    }

    spawnRandomCrate(z) {
        const weapons = ['shotgun', 'rocket', 'minigun'];
        const weapon = weapons[randomInt(0, weapons.length - 1)];
        const hp = Math.floor(30 + this.difficulty * 15);

        // Spawn crates on the BOOST lane (right side)
        const boostLane = CONSTANTS.BOOST_LANE_X || 3;
        this.crates.spawnCrate(boostLane, z, weapon, hp);
    }

    update() {
        const deltaTime = this.clock.getDelta();
        const currentTime = performance.now();

        if (this.state !== 'playing') return;

        // Update level progress
        this.levelProgress += CONSTANTS.WORLD_SPEED * deltaTime;
        this.score = Math.floor(this.levelProgress);

        // Endless spawning
        this.updateEndlessSpawning();

        // Update controls
        const targetX = this.controls.update();

        // Update world (treadmill effect)
        this.world.update(deltaTime);

        // Update squad
        this.squad.update(deltaTime, targetX, this.combat.isFiring());

        // Update enemies
        this.enemies.update(deltaTime);

        // Check enemy damage to player (enemies reaching player zone)
        this.enemies.checkPlayerDamage(this.squad);

        // Update gates
        this.gates.update(deltaTime, this.squad.getPosition(), this.squad);

        // Update crates
        this.crates.update(deltaTime, this.squad);

        // Update obstacles (barrels, spikes)
        this.obstacles.update(deltaTime, this.squad.getPosition(), this.squad);

        // Update combat
        this.combat.update(deltaTime, this.squad, this.enemies, this.crates, currentTime);

        // Update VFX
        this.vfx.update(deltaTime);

        // Update camera
        this.camera.update(this.squad.getPosition());

        // Update UI
        this.ui.updateSquadCount(this.squad.getCount(), this.squad.hasReachedMax());
        this.ui.updateScore(this.score);
        this.squad.clearMaxFlag();

        // Check lose condition (no win in endless mode)
        this.checkGameEnd();
    }

    checkGameEnd() {
        // Lose condition: squad eliminated
        if (!this.squad.isAlive()) {
            this.state = 'lost';
            this.ui.showDefeatScreen(this.score, this.enemies.getKillCount());
        }

        // No win condition - it's endless!
    }

    restart() {
        // Reset everything by reinitializing
        // Remove all objects from current scene
        while (this.scene.getScene().children.length > 0) {
            this.scene.getScene().remove(this.scene.getScene().children[0]);
        }

        this.init();
        this.startGame();
    }

    render() {
        this.renderer.render(this.scene.getScene(), this.camera.getCamera());
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.camera.resize(width, height);
    }

    run() {
        const animate = () => {
            requestAnimationFrame(animate);
            this.update();
            this.render();
        };
        animate();
    }
}
