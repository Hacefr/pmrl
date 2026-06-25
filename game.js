const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreVal");
const levelVal = document.getElementById("levelVal");
const phaseVal = document.getElementById("phaseVal");

let score = 0;
let currentLevel = 1;
let gamePhase = "white"; // "white" or "gold"
let isSpriteLoaded = false;

// Calculate structural true map center to safely deploy player inside Ghost House
const startY = Math.floor(WORLD_ROWS / 2);
const startX = Math.floor(WORLD_COLS / 2);

const player = {
    x: startX,
    y: startY,
    angle: 0,
    animFrame: 0,
    currentDir: null,
    nextDir: null
};

// Camera view boundaries positions tracking offset variables
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
    console.warn("player.png not found. Using retro vector graphics engine fallback.");
    drawGame();
};

// Timers for animation steps and constant scrolling ticks
setInterval(() => {
    if (player.currentDir) {
        player.animFrame = (player.animFrame + 1) % 2;
    }
}, 150);

setInterval(() => {
    updateGameTick();
}, 180);

function updateCameraPosition() {
    // Center the viewport anchor smoothly over the player pixel values coordinates
    let targetCamX = (player.x * TILE_SIZE) - (canvas.width / 2) + (TILE_SIZE / 2);
    let targetCamY = (player.y * TILE_SIZE) - (canvas.height / 2) + (TILE_SIZE / 2);

    // Clamp camera within the absolute outermost edges of the massive world array boundaries
    camera.x = Math.max(0, Math.min(targetCamX, (WORLD_COLS * TILE_SIZE) - canvas.width));
    camera.y = Math.max(0, Math.min(targetCamY, (WORLD_ROWS * TILE_SIZE) - canvas.height));
}

function checkWhitePhaseClear() {
    let remainingWhiteDots = 0;
    for (let r = 0; r < WORLD_ROWS; r++) {
        for (let c = 0; c < WORLD_COLS; c++) {
            if (gameMap[r][c] === 0) remainingWhiteDots++;
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

    // TRANSFORMATION: Every single eaten tile path turns into Gold dots
    for (let r = 1; r < WORLD_ROWS - 1; r++) {
        for (let c = 1; c < WORLD_COLS - 1; c++) {
            if (gameMap[r][c] === 2) {
                // Do not place dots directly inside the center spawn house perimeter walls
                const centerY = Math.floor(WORLD_ROWS / 2);
                const centerX = Math.floor(WORLD_COLS / 2);
                if (r >= centerY - 1 && r <= centerY + 1 && c >= centerX - 2 && c <= centerX + 2) {
                    continue;
                }
                gameMap[r][c] = 4; // Spawn Gold Dot currency
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

    generateProceduralMaze();

    player.x = Math.floor(WORLD_COLS / 2);
    player.y = Math.floor(WORLD_ROWS / 2);
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
    if (targetX >= 0 && targetX < WORLD_COLS && targetY >= 0 && targetY < WORLD_ROWS) {
        const tile = gameMap[targetY][targetX];
        if (tile === 1) return false;
        if (tile === 3 && gamePhase === "white") return false; // Gate stays firmly locked in Phase 1
        return true;
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

        const tile = gameMap[player.y][player.x];
        if (tile === 0 && gamePhase === "white") {
            gameMap[player.y][player.x] = 2; // Consume white dot
            score += 10;
            scoreVal.textContent = score;
            checkWhitePhaseClear();
        } else if (tile === 4 && gamePhase === "gold") {
            gameMap[player.y][player.x] = 2; // Consume gold currency
            score += 50; // Gold dots give major score bonuses
            scoreVal.textContent = score;
        } else if (tile === 3 && gamePhase === "gold") {
            advanceToNextLevel();
            return;
        }
    } else {
        player.currentDir = null; // Wall impact, halt progression steps
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
            player.nextDir = pressedDir; // Buffer execution turns smoothly
        }
    }
});

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Offset everything by negative camera vector coordinates to follow scrolling motion
    ctx.translate(-camera.x, -camera.y);

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0000ff";

    // Dynamic Viewport Rendering bounds loops limits
    for (let r = 0; r < WORLD_ROWS; r++) {
        for (let c = 0; c < WORLD_COLS; c++) {
            let x = c * TILE_SIZE;
            let y = r * TILE_SIZE;

            // PERFORMANCE SKIP: Do not spend GPU power rendering items completely outside view window
            if (x + TILE_SIZE < camera.x || x > camera.x + canvas.width ||
                y + TILE_SIZE < camera.y || y > camera.y + canvas.height) {
                continue;
            }

            if (gameMap[r][c] === 1) {
                ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            } else if (gameMap[r][c] === 0) {
                // White Pac-Dots
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (gameMap[r][c] === 4) {
                // Gold Currency Dots
                ctx.fillStyle = "#ffff00";
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 5, 0, Math.PI * 2);
                ctx.fill();
            } else if (gameMap[r][c] === 3) {
                // Ghost House Exit Door Gate Portal
                ctx.fillStyle = gamePhase === "white" ? "#ff0000" : "#ffff00"; // Red locked, glowing yellow unlocked
                ctx.fillRect(x + 2, y + 12, TILE_SIZE - 4, 8);
            }
        }
    }

    // Render Player inside Camera space transform limits
    let pX = player.x * TILE_SIZE + TILE_SIZE / 2;
    let pY = player.y * TILE_SIZE + TILE_SIZE / 2;

    ctx.save();
    ctx.translate(pX, pY);
    ctx.rotate(player.angle);

    if (isSpriteLoaded) {
        let frameW = playerSprite.width / 2;
        let frameH = playerSprite.height / 2;
        let sourceX = player.animFrame * frameW;
        let sourceY = (player.currentDir === "up" || player.currentDir === "down") ? frameH : 0;

        ctx.drawImage(playerSprite, sourceX, sourceY, frameW, frameH, -TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
    } else {
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        let mouthSize = player.animFrame === 1 ? 0.2 : 0.04;
        ctx.arc(0, 0, TILE_SIZE / 2 - 2, mouthSize * Math.PI, (2 - mouthSize) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fill();
    }
    ctx.restore();
    ctx.restore(); // Close the global camera transformation sequence matrix window
}

// Initial draw execution frame load layout
updateCameraPosition();
drawGame();
