const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreVal");
const levelVal = document.getElementById("levelVal");

let score = 0;
let currentLevel = 1;
let isSpriteLoaded = false;

// Player configuration setup
const player = {
    x: 1,
    y: 1,
    angle: 0,
    animFrame: 0,
    currentDir: null, // Starts stationary until a key is pressed
    nextDir: null     // Buffers the next turn input smoothly
};

const playerSprite = new Image();
playerSprite.src = 'assets/sprites/player.png'; 

playerSprite.onload = () => {
    isSpriteLoaded = true;
    drawGame();
};

playerSprite.onerror = () => {
    console.warn("player.png asset missing. Using vector fallback layout instead.");
    drawGame();
};

// --- GAME HEARTBEAT TIMERS ---

// Animation clock: Swaps open/closed mouth frames
setInterval(() => {
    if (player.currentDir) {
        player.animFrame = (player.animFrame + 1) % 2;
    }
}, 150);

// Core Movement Tick Clock: Moves Pac-Man continuously every 180ms
setInterval(() => {
    updateMovementTick();
}, 180);

function checkWinCondition() {
    let remainingDots = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (gameMap[r] && gameMap[r][c] === 0) {
                remainingDots++;
            }
        }
    }
    if (remainingDots === 0 && gameMap[GRID_ROWS - 2][GRID_COLS - 2] === 1) {
        gameMap[GRID_ROWS - 2][GRID_COLS - 2] = 3;
    }
}

function advanceToNextLevel() {
    currentLevel++;
    levelVal.textContent = currentLevel;
    
    player.x = 1;
    player.y = 1;
    player.angle = 0;
    player.currentDir = null;
    player.nextDir = null;
    
    generateProceduralMaze();
    drawGame();
}

// Converts a direction string to coordinate shifts and rotation angles
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
    if (targetX >= 0 && targetX < GRID_COLS && targetY >= 0 && targetY < GRID_ROWS) {
        return gameMap[targetY] !== undefined && gameMap[targetY][targetX] !== 1;
    }
    return false;
}

// Automatically processes continuous steps on every game clock pulse
function updateMovementTick() {
    // Try to switch to the buffered next direction if valid
    if (player.nextDir) {
        let nextOffsets = getDirOffsets(player.nextDir);
        if (isWalkable(player.x + nextOffsets.dx, player.y + nextOffsets.dy)) {
            player.currentDir = player.nextDir;
            player.nextDir = null;
        }
    }

    if (!player.currentDir) return; // Sit still until initial user input action

    let currentOffsets = getDirOffsets(player.currentDir);
    let targetX = player.x + currentOffsets.dx;
    let targetY = player.y + currentOffsets.dy;

    // Update facing angle to match active heading direction instantly
    player.angle = currentOffsets.angle;

    if (isWalkable(targetX, targetY)) {
        player.x = targetX;
        player.y = targetY;

        const targetTile = gameMap[player.y][player.x];
        if (targetTile === 0) {
            gameMap[player.y][player.x] = 2; // Eat dot
            score += 10;
            scoreVal.textContent = score;
            checkWinCondition();
        } else if (targetTile === 3) {
            advanceToNextLevel();
            return;
        }
    } else {
        // Hit a wall, stop auto-movement loop execution sequence
        player.currentDir = null;
    }

    drawGame();
}

// User inputs buffer paths instantly without waiting for movement execution frames
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
            // If completely stopped, immediately evaluate if movement is valid
            let testOffsets = getDirOffsets(pressedDir);
            if (isWalkable(player.x + testOffsets.dx, player.y + testOffsets.dy)) {
                player.currentDir = pressedDir;
                updateMovementTick(); // Fire instantly for snappy response
            }
        } else {
            // Buffer the move for the next available grid corridor turning point intersection
            player.nextDir = pressedDir;
        }
    }
});

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render Neon Blue Outline Maze
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0000ff";

    for (let r = 0; r < GRID_ROWS; r++) {
        if (!gameMap[r]) continue;
        for (let c = 0; c < GRID_COLS; c++) {
            if (gameMap[r][c] === 1) {
                let x = c * TILE_SIZE;
                let y = r * TILE_SIZE;
                ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            } else if (gameMap[r][c] === 0) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (gameMap[r][c] === 3) {
                ctx.fillStyle = "#00ff00"; // Exit point
                ctx.fillRect(c * TILE_SIZE + 6, r * TILE_SIZE + 6, TILE_SIZE - 12, TILE_SIZE - 12);
            }
        }
    }

    // Dynamic Slicing Engine Processing
    let pX = player.x * TILE_SIZE + TILE_SIZE / 2;
    let pY = player.y * TILE_SIZE + TILE_SIZE / 2;

    ctx.save();
    ctx.translate(pX, pY);
    ctx.rotate(player.angle);

    if (isSpriteLoaded) {
        // Dynamically slice the sprite sheet based on its actual dimensions (2x2 grid format)
        let frameW = playerSprite.width / 2;
        let frameH = playerSprite.height / 2;

        let sourceX = player.animFrame * frameW;
        // Top row for left/right angles, bottom row for up/down directions
        let sourceY = (player.currentDir === "up" || player.currentDir === "down") ? frameH : 0;

        ctx.drawImage(
            playerSprite,
            sourceX, sourceY,
            frameW, frameH,
            -TILE_SIZE / 2, -TILE_SIZE / 2,
            TILE_SIZE, TILE_SIZE
        );
    } else {
        // Vector safe graphics engine rendering routine
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        let mouthSize = player.animFrame === 1 ? 0.2 : 0.04;
        ctx.arc(0, 0, TILE_SIZE / 2 - 2, mouthSize * Math.PI, (2 - mouthSize) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fill();
    }
    ctx.restore();
}

drawGame();
