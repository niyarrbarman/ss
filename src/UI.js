/**
 * UI.js - HUD and screen management
 */

export class UI {
    constructor() {
        this.elements = {
            startScreen: document.getElementById('start-screen'),
            victoryScreen: document.getElementById('victory-screen'),
            defeatScreen: document.getElementById('defeat-screen'),
            squadNumber: document.getElementById('squad-number'),
            bossHpContainer: document.getElementById('boss-hp-container'),
            bossHpFill: document.getElementById('boss-hp-fill'),
            bossHpText: document.getElementById('boss-hp-text'),
            enemiesKilled: document.getElementById('enemies-killed'),
            startBtn: document.getElementById('start-btn'),
            restartVictoryBtn: document.getElementById('restart-victory-btn'),
            restartDefeatBtn: document.getElementById('restart-defeat-btn'),
            scoreDisplay: document.getElementById('score-display'),
            finalScore: document.getElementById('final-score'),
            finalKills: document.getElementById('final-kills')
        };

        this.onStart = null;
        this.onRestart = null;

        // Create score display if not exists
        this.createScoreDisplay();

        this.setupEventListeners();
    }

    createScoreDisplay() {
        if (!this.elements.scoreDisplay) {
            const hud = document.getElementById('hud');
            if (hud) {
                const scoreDiv = document.createElement('div');
                scoreDiv.id = 'score-display';
                scoreDiv.innerHTML = '<span id="score-label">SCORE</span><span id="score-value">0</span>';
                scoreDiv.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.6);
                    padding: 8px 16px;
                    border-radius: 15px;
                    border: 2px solid rgba(255, 200, 0, 0.5);
                `;
                document.getElementById('game-container').appendChild(scoreDiv);
                this.elements.scoreDisplay = scoreDiv;
            }
        }
    }

    setupEventListeners() {
        if (this.elements.startBtn) {
            const startHandler = (e) => {
                if (e) {
                    e.preventDefault();
                }
                if (this.onStart) this.onStart();
            };

            this.elements.startBtn.addEventListener('pointerup', startHandler);
            this.elements.startBtn.addEventListener('click', startHandler);
            this.elements.startBtn.addEventListener('touchend', startHandler, { passive: false });
        }

        if (this.elements.restartVictoryBtn) {
            this.elements.restartVictoryBtn.addEventListener('click', () => {
                if (this.onRestart) this.onRestart();
            });
        }

        if (this.elements.restartDefeatBtn) {
            this.elements.restartDefeatBtn.addEventListener('click', () => {
                if (this.onRestart) this.onRestart();
            });
        }
    }

    hideAllScreens() {
        this.elements.startScreen?.classList.add('hidden');
        this.elements.victoryScreen?.classList.add('hidden');
        this.elements.defeatScreen?.classList.add('hidden');
    }

    showStartScreen() {
        this.hideAllScreens();
        this.elements.startScreen?.classList.remove('hidden');
    }

    showVictoryScreen(enemiesKilled) {
        this.hideAllScreens();
        if (this.elements.enemiesKilled) {
            this.elements.enemiesKilled.textContent = enemiesKilled;
        }
        this.elements.victoryScreen?.classList.remove('hidden');
    }

    showDefeatScreen(score = 0, enemiesKilled = 0) {
        this.hideAllScreens();

        // Update defeat screen with stats
        const defeatStats = document.getElementById('defeat-stats');
        if (!defeatStats) {
            const defeatScreen = this.elements.defeatScreen;
            if (defeatScreen) {
                const statsDiv = document.createElement('div');
                statsDiv.id = 'defeat-stats';
                statsDiv.style.cssText = 'text-align: center; margin-bottom: 20px;';
                statsDiv.innerHTML = `
                    <p style="font-size: 20px; color: #fff; margin: 10px 0;">Score: <span style="color: #ffcc00; font-weight: bold;">${score}</span></p>
                    <p style="font-size: 18px; color: #aaa; margin: 10px 0;">Enemies Killed: <span style="color: #ff6644;">${enemiesKilled}</span></p>
                `;
                const btn = defeatScreen.querySelector('button');
                if (btn) {
                    defeatScreen.insertBefore(statsDiv, btn);
                }
            }
        } else {
            defeatStats.innerHTML = `
                <p style="font-size: 20px; color: #fff; margin: 10px 0;">Score: <span style="color: #ffcc00; font-weight: bold;">${score}</span></p>
                <p style="font-size: 18px; color: #aaa; margin: 10px 0;">Enemies Killed: <span style="color: #ff6644;">${enemiesKilled}</span></p>
            `;
        }

        this.elements.defeatScreen?.classList.remove('hidden');
    }

    hideStartScreen() {
        this.elements.startScreen?.classList.add('hidden');
    }

    updateSquadCount(count, isMax = false) {
        if (this.elements.squadNumber) {
            this.elements.squadNumber.textContent = count;
        }
        this.showMaxMessage(isMax);
    }

    showMaxMessage(show) {
        let maxMsg = document.getElementById('max-message');
        if (show) {
            if (!maxMsg) {
                const squadCount = document.getElementById('squad-count');
                if (squadCount) {
                    maxMsg = document.createElement('div');
                    maxMsg.id = 'max-message';
                    maxMsg.textContent = 'MAX 200!';
                    maxMsg.style.cssText = `
                        font-size: 10px;
                        color: #ff4444;
                        font-weight: bold;
                        text-shadow: 1px 1px 2px #000;
                        margin-top: 2px;
                        animation: pulse 1s infinite;
                    `;
                    squadCount.appendChild(maxMsg);
                }
            }
            maxMsg.classList.remove('hidden');
        } else if (maxMsg) {
            maxMsg.classList.add('hidden');
        }
    }

    updateScore(score) {
        const scoreValue = document.getElementById('score-value');
        if (scoreValue) {
            scoreValue.textContent = score;
            scoreValue.style.cssText = `
                font-size: 24px;
                font-weight: bold;
                color: #ffcc00;
                text-shadow: 0 0 10px #ff8800;
            `;
        }
        const scoreLabel = document.getElementById('score-label');
        if (scoreLabel) {
            scoreLabel.style.cssText = `
                font-size: 12px;
                color: #aaa;
                text-transform: uppercase;
            `;
        }
    }

    showBossHP(current, max) {
        if (this.elements.bossHpContainer) {
            this.elements.bossHpContainer.classList.remove('hidden');
        }
        this.updateBossHP(current, max);
    }

    updateBossHP(current, max) {
        if (this.elements.bossHpFill) {
            const percent = Math.max(0, (current / max) * 100);
            this.elements.bossHpFill.style.width = percent + '%';
        }
        if (this.elements.bossHpText) {
            this.elements.bossHpText.textContent = Math.ceil(Math.max(0, current));
        }
    }

    hideBossHP() {
        if (this.elements.bossHpContainer) {
            this.elements.bossHpContainer.classList.add('hidden');
        }
    }

    setOnStart(callback) {
        this.onStart = callback;
    }

    setOnRestart(callback) {
        this.onRestart = callback;
    }
}

