window.rowsCount = window.WORLD_ROWS || 40;
window.colsCount = window.WORLD_COLS || 60;
window.sizeTile = window.TILE_SIZE || 32;

const startY = Math.floor(window.rowsCount / 2);
const startX = Math.floor(window.colsCount / 2);

window.player = {
    x: startX,
    y: startY,
    angle: 0,
    animFrame: 0,
    currentDir: null,
    nextDir: null,
    isDead: false
};

// Fire boot initializations
if (window.BabyEntity) window.BabyEntity.init();
if (window.calculateInitialLevelDots) window.calculateInitialLevelDots();

setInterval(() => {
    if (window.player.currentDir && !window.player.isDead) {
        window.player.animFrame = (window.player.animFrame + 1) % 2;
    }
}, 150);

setInterval(() => {
    if (!window.player.isDead) {
        updateGameTick();
        if (window.BabyEntity) window.BabyEntity.update(window.player.x, window.player.y, window.gamePhase, window.totalGlitchCount);
        checkLethalCollisions();
    }
}, 180);

setInterval(() => {
    if (window.gamePhase === "gold" && !window.player.isDead && window.spawnRandomGlitchTile) {
        window.spawnRandomGlitchTile();
    }
}, 2500);

function checkLethalCollisions() {
    if (window.gameMap[window.player.y] && window.gameMap[window.player.y][window.player.x] === 5) {
        window.triggerGameOver();
        return;
    }
    if (window.BabyEntity) {
        let pDistX = Math.abs(window.player.x - window.BabyEntity.x);
        let pDistY = Math.abs(window.player.y - window.BabyEntity.y);
        if (pDistX < 0.75 && pDistY < 0.75) window.triggerGameOver();
    }
}

function getDirOffsets(dir) {
    switch (dir) {
        case "up":    return { dx: 0,  dy: -1, angle: 1.5 * Math.PI };
        case "down":  return { dx: 0,  dy: 1,  angle: 0.5 * Math.PI };
        case "left":  return { dx: -1, dy: 0,  angle: Math.PI };
        case "right": return { dx: 1,  dy: 0,  angle: 0 };
        default:      return { dx: 0,  dy: 0,  angle: 0 };
    }
}

function isWalkable(targetX, targetY) {
    if (targetX >= 0 && targetX < window.colsCount && targetY >= 0 && targetY < window.rowsCount) {
        if (window.gameMap[targetY] !== undefined) {
            return window.gameMap[targetY][targetX] !== 1;
        }
    }
    return false;
}

function updateGameTick() {
    if (window.player.nextDir) {
        let nextOffsets = getDirOffsets(window.player.nextDir);
        if (isWalkable(window.player.x + nextOffsets.dx, window.player.y + nextOffsets.dy)) {
            window.player.currentDir = window.player.nextDir;
            window.player.nextDir = null;
        }
    }

    if (!window.player.currentDir) return;

    let offsets = getDirOffsets(window.player.currentDir);
    let targetX = window.player.x + offsets.dx;
    let targetY = window.player.y + offsets.dy;

    window.player.angle = offsets.angle;

    if (isWalkable(targetX, targetY)) {
        window.player.x = targetX;
        window.player.y = targetY;

        const tile = window.gameMap[window.player.y][window.player.x];
        if (tile === 0 && window.gamePhase === "white") {
            window.gameMap[window.player.y][window.player.x] = 2; 
            window.score += 10;
            document.getElementById("scoreVal").textContent = window.score;
            window.consumedWhiteDots++;
            window.updateDotCounterUI();
            
            if (window.totalLevelWhiteDots - window.consumedWhiteDots <= 0) {
                window.triggerGoldPhaseExtraction();
            }
        } else if (tile === 4 && window.gamePhase === "gold") {
            window.gameMap[window.player.y][window.player.x] = 2; 
            window.score += 50; 
            document.getElementById("scoreVal").textContent = window.score;
        } else if (tile === 3 && window.gamePhase === "gold") {
            window.advanceToNextLevel();
            return;
        }
    } else {
        window.player.currentDir = null; 
    }

    window.updateCameraPosition();
    window.drawGame();
}

window.addEventListener("keydown", (e) => {
    if (window.player.isDead) return;
    let pressedDir = null;
    switch(e.key.toLowerCase()) {
        case "w": case "arrowup":    pressedDir = "up";    e.preventDefault(); break;
        case "s": case "arrowdown":  pressedDir = "down";  e.preventDefault(); break;
        case "a": case "arrowleft":  pressedDir = "left";  e.preventDefault(); break;
        case "d": case "arrowright": pressedDir = "right"; e.preventDefault(); break;
    }

    if (pressedDir) {
        if (!window.player.currentDir) {
            let testOffsets = getDirOffsets(pressedDir);
            if (isWalkable(window.player.x + testOffsets.dx, window.player.y + testOffsets.dy)) {
                window.player.currentDir = pressedDir;
                updateGameTick();
            }
        } else {
            window.player.nextDir = pressedDir; 
        }
    }
});

window.updateCameraPosition();
window.drawGame();
