// Global State Tracking Registers
window.score = 0;
window.currentLevel = 1;
window.gamePhase = "white"; 

// QOL Inventory Statistics
window.totalLevelWhiteDots = 0;
window.consumedWhiteDots = 0;
window.totalGlitchCount = 0;

window.calculateInitialLevelDots = function() {
    window.totalLevelWhiteDots = 0;
    window.consumedWhiteDots = 0;
    window.totalGlitchCount = 0;

    for (let r = 0; r < window.rowsCount; r++) {
        for (let c = 0; c < window.colsCount; c++) {
            if (window.gameMap[r] && window.gameMap[r][c] === 0) {
                window.totalLevelWhiteDots++;
            }
        }
    }
    window.updateDotCounterUI();
};

window.updateDotCounterUI = function() {
    const el = document.getElementById("dotCounterVal");
    if (!el) return;
    if (window.gamePhase === "white") {
        el.textContent = `${window.consumedWhiteDots} / ${window.totalLevelWhiteDots}`;
        el.style.color = "#ffffff";
    } else {
        el.textContent = "EXTRACT!";
        el.style.color = "#ffff00";
    }
};

window.triggerGoldPhaseExtraction = function() {
    window.gamePhase = "gold";
    const phaseEl = document.getElementById("phaseVal");
    if (phaseEl) {
        phaseEl.textContent = "EXTRACTION";
        phaseEl.style.color = "#ffff00";
    }
    window.updateDotCounterUI();

    for (let r = 1; r < window.rowsCount - 1; r++) {
        if (!window.gameMap[r]) continue;
        for (let c = 1; c < window.colsCount - 1; c++) {
            if (window.gameMap[r][c] === 2) {
                const centerY = Math.floor(window.rowsCount / 2);
                const centerX = Math.floor(window.colsCount / 2);
                if (r >= centerY - 1 && r <= centerY + 1 && c >= centerX - 2 && c <= centerX + 2) {
                    continue;
                }
                window.gameMap[r][c] = 4; // Spawn Gold Dots
            }
        }
    }
    window.drawGame();
};

window.spawnRandomGlitchTile = function() {
    let r = Math.floor(Math.random() * (window.rowsCount - 2)) + 1;
    let c = Math.floor(Math.random() * (window.colsCount - 2)) + 1;

    const centerY = Math.floor(window.rowsCount / 2);
    const centerX = Math.floor(window.colsCount / 2);
    if (r >= centerY - 2 && r <= centerY + 2 && c >= centerX - 3 && c <= centerX + 3) return;

    if (window.gameMap[r] && window.gameMap[r][c] !== 3) {
        window.gameMap[r][c] = 5; // Glitch tile
        window.totalGlitchCount++;
        window.drawGame();
    }
};

window.triggerGameOver = function() {
    window.player.isDead = true;
    window.player.currentDir = null;
    window.player.nextDir = null;
    const phaseEl = document.getElementById("phaseVal");
    if (phaseEl) {
        phaseEl.textContent = "RUN FAILED";
        phaseEl.style.color = "#ff0000";
    }
    window.drawGame();
};

window.advanceToNextLevel = function() {
    window.currentLevel++;
    document.getElementById("levelVal").textContent = window.currentLevel;
    window.gamePhase = "white";
    
    const phaseEl = document.getElementById("phaseVal");
    if (phaseEl) {
        phaseEl.textContent = "COLLECTION";
        phaseEl.style.color = "#ffffff";
    }

    window.generateProceduralMaze();
    window.calculateInitialLevelDots();

    window.player.x = Math.floor(window.colsCount / 2);
    window.player.y = Math.floor(window.rowsCount / 2);
    window.player.currentDir = null;
    window.player.nextDir = null;
    window.player.angle = 0;

    window.BabyEntity.init();
    window.updateCameraPosition();
    window.drawGame();
};
