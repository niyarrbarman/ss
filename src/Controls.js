/**
 * Controls.js - Touch/mouse input handling
 */
import { clamp, CONSTANTS } from './Utils.js';

export class Controls {
    constructor(canvas) {
        this.canvas = canvas;
        this.targetX = CONSTANTS.PLAYER_LANE_X;
        this.currentX = CONSTANTS.PLAYER_LANE_X;
        this.isDragging = false;
        this.startX = 0;
        this.startTargetX = 0;

        this.sensitivity = 0.015;
        this.smoothing = 0.12;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.onPointerDown(e.touches[0]), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.onPointerMove(e.touches[0]);
        }, { passive: false });
        this.canvas.addEventListener('touchend', () => this.onPointerUp());
        this.canvas.addEventListener('touchcancel', () => this.onPointerUp());

        // Mouse events for desktop testing
        this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onPointerMove(e));
        this.canvas.addEventListener('mouseup', () => this.onPointerUp());
        this.canvas.addEventListener('mouseleave', () => this.onPointerUp());
    }

    onPointerDown(event) {
        this.isDragging = true;
        this.startX = event.clientX;
        this.startTargetX = this.targetX;
    }

    onPointerMove(event) {
        if (!this.isDragging) return;

        const deltaX = event.clientX - this.startX;
        const newTarget = this.startTargetX + deltaX * this.sensitivity;

        // Clamp to full road width (can move across all lanes)
        const minX = -5;  // Left side (enemy lane)
        const maxX = 5;   // Right side (boost lane)
        this.targetX = clamp(newTarget, minX, maxX);
    }

    onPointerUp() {
        this.isDragging = false;
    }

    update() {
        // Smooth movement towards target
        this.currentX += (this.targetX - this.currentX) * this.smoothing;
        return this.currentX;
    }

    getPosition() {
        return this.currentX;
    }
}
