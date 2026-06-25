const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreVal");
const levelVal = document.getElementById("levelVal");
const phaseVal = document.getElementById("phaseVal");

let score = 0;
let currentLevel = 1;
let gamePhase = "white"; 
let isSpriteLoaded = false;

const rowsCount = window.WORLD_ROWS || 40;
const colsCount = window.WORLD_COLS || 60;
const sizeTile = window.TILE_SIZE || 32;

const startY = Math.floor(rowsCount / 2);
const startX = Math.floor(colsCount / 2);

const player = {
    x: startX,
    y: startY,
    angle: 0,
    animFrame: 0,
    currentDir: null,
    nextDir: null
};

const camera = {
    x: 0,
    y: 0
};

const playerSprite = new Image();
playerSprite.src = 'assets/sprites/player.png'; 

playerSprite.onload = () => {
    isSpriteLoaded = true;
    drawGame();
};

playerSprite.onerror = () => {
    console.warn("player.png not found. Running backup retro vector rendering.");
    drawGame();
};

setInterval(() => {
    if (player.currentDir) {
        player.animFrame = (player.animFrame + 1) % 2;
    }
}, 150);

setInterval(() => {
    updateGameTick();
}, 180);

function updateCameraPosition() {
    let targetCamX = (player.x * sizeTile) - (canvas.width / 2) + (sizeTile / 2);
    let targetCamY = (player.y * sizeTile) - (canvas.height / 2) + (sizeTile / 2);

    camera.x = Math.max(0, Math.min(targetCamX, (colsCount * sizeTile) - canvas.width));
    camera.y = Math.max(0, Math.min(targetCamY, (rowsCount * sizeTile) - canvas.height));
}

function checkWhitePhaseClear() {
    let remainingWhiteDots = 0;
    for (let r = 0; r < rowsCount; r++) {
        if (!window.gameMap[r]) continue;
        for (let c = 0; c < colsCount; c++) {
            if (window.gameMap[r][c] === 0) remainingWhiteDots++;
        }
    }
    if (remainingWhiteDots === 0 && gamePhase === "white") {
        triggerGoldPhaseExtraction();
    }
}

function triggerGoldPhaseExtraction() {
    gamePhase = "gold";
    phaseVal.textContent = "EXTRACTION";
    phaseVal.style.color = "#ffff00";

    for (let r = 1; r < rowsCount - 1; r++) {
        if (!window.gameMap[r]) continue;
        for (let c = 1; c < colsCount - 1; c++) {
            if (window.gameMap[r][c] === 2) {
                const centerY = Math.floor(rowsCount / 2);
                const centerX = Math.floor(colsCount / 2);
                if (r >= centerY - 1 && r <= centerY + 1 && c >= centerX - 2 && c <= centerX + 2) {
                    continue;
                }
                window.gameMap[r][c] = 4; 
            }
        }
    }
    drawGame();
}

function advanceToNextLevel() {
    currentLevel++;
    levelVal.textContent = currentLevel;
    gamePhase = "white";
    phaseVal.textContent = "COLLECTION";
    phaseVal.style.color = "#ffffff";

    window.generateProceduralMaze();

    player.x = Math.floor(colsCount / 2);
    player.y = Math.floor(rowsCount / 2);
    player.currentDir = null;
    player.nextDir = null;
    player.angle = 0;

    updateCameraPosition();
    drawGame();
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
    if (targetX >= 0 && targetX < colsCount && targetY >= 0 && targetY < rowsCount) {
        if (window.gameMap[targetY] !== undefined) {
            const tile = window.gameMap[targetY][targetX];
            // FIXED: Red gate door tile (3) is now fully passable in all game phases
            if (tile === 1) return false;
            return true;
        }
    }
    return false;
}

function updateGameTick() {
    if (player.nextDir) {
        let nextOffsets = getDirOffsets(player.nextDir);
        if (isWalkable(player.x + nextOffsets.dx, player.y + nextOffsets.dy)) {
            player.currentDir = player.nextDir;
            player.nextDir = null;
        }
    }

    if (!player.currentDir) return;

    let offsets = getDirOffsets(player.currentDir);
    let targetX = player.x + offsets.dx;
    let targetY = player.y + offsets.dy;

    player.angle = offsets.angle;

    if (isWalkable(targetX, targetY)) {
        player.x = targetX;
        player.y = targetY;

        const tile = window.gameMap[player.y][player.x];
        if (tile === 0 && gamePhase === "white") {
            window.gameMap[player.y][player.x] = 2; 
            score += 10;
            scoreVal.textContent = score;
            checkWhitePhaseClear();
        } else if (tile === 4 && gamePhase === "gold") {
            window.gameMap[player.y][player.x] = 2; 
            score += 50; 
            scoreVal.textContent = score;
        } else if (tile === 3 && gamePhase === "gold") {
            advanceToNextLevel();
            return;
        }
    } else {
        player.currentDir = null; 
    }

    updateCameraPosition();
    drawGame();
}

window.addEventListener("keydown", (e) => {
    let pressedDir = null;
    switch(e.key.toLowerCase()) {
        case "w": case "arrowup":    pressedDir = "up";    e.preventDefault(); break;
        case "s": case "arrowdown":  pressedDir = "down";  e.preventDefault(); break;
        case "a": case "arrowleft":  pressedDir = "left";  e.preventDefault(); break;
        case "d": case "arrowright": pressedDir = "right"; e.preventDefault(); break;
    }

    if (pressedDir) {
        if (!player.currentDir) {
            let testOffsets = getDirOffsets(pressedDir);
            if (isWalkable(player.x + testOffsets.dx, player.y + testOffsets.dy)) {
                player.currentDir = pressedDir;
                updateGameTick();
            }
        } else {
            player.nextDir = pressedDir; 
        }
    }
});

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0000ff";

    for (let r = 0; r < rowsCount; r++) {
        if (!window.gameMap[r]) continue; 
        
        for (let c = 0; c < colsCount; c++) {
            let x = c * sizeTile;
            let y = r * sizeTile;

            if (x + sizeTile < camera.x || x > camera.x + canvas.width ||
                y + sizeTile < camera.y || y > camera.y + canvas.height) {
                continue;
            }

            if (window.gameMap[r][c] === 1) {
                ctx.strokeRect(x + 4, y + 4, sizeTile - 8, sizeTile - 8);
            } else if (window.gameMap[r][c] === 0) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(x + sizeTile / 2, y + sizeTile / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (window.gameMap[r][c] === 4) {
                ctx.fillStyle = "#ffff00";
                ctx.beginPath();
                ctx.arc(x + sizeTile / 2, y + sizeTile / 2, 5, 0, Math.PI * 2);
                ctx.fill();
            } else if (window.gameMap[r][c] === 3) {
                ctx.fillStyle = gamePhase === "white" ? "#ff0000" : "#ffff00"; 
                ctx.fillRect(x + 2, y + 12, sizeTile - 4, 8);
            }
        }
    }

    let pX = player.x * sizeTile + sizeTile / 2;
    let pY = player.y * sizeTile + sizeTile / 2;

    ctx.save();
    ctx.translate(pX, pY);
    ctx.rotate(player.angle);

    if (isSpriteLoaded) {
        let frameW = playerSprite.width / 2;
        let frameH = playerSprite.height / 2;
        let sourceX = player.animFrame * frameW;
        let sourceY = (player.currentDir === "up" || player.currentDir === "down") ? frameH : 0;

        ctx.drawImage(playerSprite, sourceX, sourceY, frameW, frameH, -sizeTile / 2, -sizeTile / 2, sizeTile, sizeTile);
    } else {
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        let mouthSize = player.animFrame === 1 ? 0.2 : 0.04;
        ctx.arc(0, 0, sizeTile / 2 - 2, mouthSize * Math.PI, (2 - mouthSize) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fill();
    }
    ctx.restore();
    ctx.restore(); 
}

updateCameraPosition();
drawGame();
