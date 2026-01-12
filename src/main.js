/**
 * main.js - Entry point
 * Last War Survival Clone
 */
import { Game } from './Game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');

    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // Create and run game
    const game = new Game(canvas);
    game.run();

    console.log('Last War Survival - Game Started!');
});
