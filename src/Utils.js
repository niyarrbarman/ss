/**
 * Utils.js - Helper functions and object pooling
 */

// Simple object pool for performance
export class ObjectPool {
    constructor(factory, reset, initialSize = 10) {
        this.factory = factory;
        this.reset = reset;
        this.pool = [];

        for (let i = 0; i < initialSize; i++) {
            this.pool.push(factory());
        }
    }

    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.factory();
    }

    release(obj) {
        this.reset(obj);
        this.pool.push(obj);
    }
}

// Math utilities
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

export function distance2D(x1, z1, x2, z2) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dz * dz);
}

// Easing functions
export function easeOutQuad(t) {
    return t * (2 - t);
}

export function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeOutElastic(t) {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

// Color utilities
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}

// Screen shake state
export const screenShake = {
    intensity: 0,
    decay: 0.9,
    offsetX: 0,
    offsetY: 0,

    add(intensity) {
        this.intensity = Math.min(this.intensity + intensity, 20);
    },

    update() {
        if (this.intensity > 0.1) {
            this.offsetX = (Math.random() - 0.5) * this.intensity;
            this.offsetY = (Math.random() - 0.5) * this.intensity;
            this.intensity *= this.decay;
        } else {
            this.intensity = 0;
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }
};

// Game constants
export const CONSTANTS = {
    // World
    WORLD_SPEED: 8,
    LANE_WIDTH: 3,
    PLAYER_LANE_X: 0,      // Player in CENTER
    ENEMY_LANE_X: -3,      // Enemies on LEFT
    BOOST_LANE_X: 3,       // Boosts on RIGHT
    DIVIDER_X: 0,

    // Squad
    SQUAD_START_COUNT: 1,
    SOLDIER_SPACING: 0.4,
    MOVE_SPEED: 0.15,
    MOVE_BOUNDS: 1.5,

    // Combat
    FIRE_RATE: {
        basic: 150,
        shotgun: 500,
        rocket: 800,
        minigun: 40
    },
    DAMAGE: {
        basic: 3,
        shotgun: 5,
        rocket: 30,
        minigun: 2
    },

    // Enemies
    SWARM_HP: 5,
    BOSS_HP: 500,
    ENEMY_SPEED: 4,

    // Level
    LEVEL_LENGTH: 500,
    GATE_SPAWN_INTERVAL: 15,
    CRATE_SPAWN_INTERVAL: 40
};
