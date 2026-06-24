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
    angle: 0,         // Target rotation mapping (0 = Right, PI/2 = Down, PI = Left, 3PI/2 = Up)
    animFrame: 0,     // Alternates 0 and 1 for open/closed mouth frames
    lastDir: "right"  // Tracks orientation
};

// Spritesheet configuration coordinates based on your 2x2 yellow sheet layout
const SPRITE_FRAME_SIZE = 16; // Assumes your sheet uses square asset frame bounds

const playerSprite = new Image();
playerSprite.src = 'assets/sprites/player.png'; 

playerSprite.onload = () => {
    isSpriteLoaded = true;
    drawGame();
};

playerSprite.onerror = () => {
    console.warn("player.png asset missing. Using vector fallback system layout instead.");
    drawGame();
};

// Simple animation frame toggle loop
setInterval(() => {
    player.animFrame = (player.animFrame + 1) % 2;
    drawGame();
}, 200); // Swaps open/closed frames every 200ms

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
    player.lastDir = "right";
    
    generateProceduralMaze();
    drawGame();
}

function movePlayer(dx, dy, dirName, targetAngle) {
    const targetX = player.x + dx;
    const targetY = player.y + dy;

    // Always update rotation target angle instantly even if blocked by wall grid blocks
    player.lastDir = dirName;
    player.angle = targetAngle;

    if (targetX >= 0 && targetX < GRID_COLS && targetY >= 0 && targetY < GRID_ROWS) {
        if (gameMap[targetY] !== undefined) {
            const targetTile = gameMap[targetY][targetX];

            if (targetTile !== 1) { 
                player.x = targetX;
                player.y = targetY;

                if (targetTile === 0) {
                    gameMap[player.y][player.x] = 2; 
                    score += 10;
                    scoreVal.textContent = score;
                    checkWinCondition();
                } else if (targetTile === 3) {
                    advanceToNextLevel();
                    return;
                }
            }
        }
    }
    drawGame();
}

// Retains your instant tap-to-move single key click setup, adding angle orientation values
window.addEventListener("keydown", (e) => {
    switch(e.key.toLowerCase()) {
        case "w": case "arrowup":    movePlayer(0, -1, "up", 1.5 * Math.PI); e.preventDefault(); break;
        case "s": case "arrowdown":  movePlayer(0, 1, "down", 0.5 * Math.PI); e.preventDefault(); break;
        case "a": case "arrowleft":  movePlayer(-1, 0, "left", Math.PI);       e.preventDefault(); break;
        case "d": case "arrowright": movePlayer(1, 0, "right", 0);            e.preventDefault(); break;
    }
});

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render Thin Classic Neon Walls & Dots
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0000ff"; // Classic thin arcade layout styling blue line tint

    for (let r = 0; r < GRID_ROWS; r++) {
        if (!gameMap[r]) continue;
        for (let c = 0; c < GRID_COLS; c++) {
            if (gameMap[r][c] === 1) {
                // Draws lines only along border faces adjacent to open paths instead of full boxes
                let x = c * TILE_SIZE;
                let y = r * TILE_SIZE;
                
                ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            } else if (gameMap[r][c] === 0) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (gameMap[r][c] === 3) {
                ctx.fillStyle = "#00ff00"; // Green stage finish ladder
                ctx.fillRect(c * TILE_SIZE + 6, r * TILE_SIZE + 6, TILE_SIZE - 12, TILE_SIZE - 12);
            }
        }
    }

    // Process Canvas Slicing and Directional Rotation Transformations
    let pX = player.x * TILE_SIZE + TILE_SIZE / 2;
    let pY = player.y * TILE_SIZE + TILE_SIZE / 2;

    ctx.save();
    ctx.translate(pX, pY);
    ctx.rotate(player.angle);

    if (isSpriteLoaded) {
        // Source image calculations: mapping your 2x2 grid frames based on direction and animations
        let sourceX = 0;
        let sourceY = 0;

        // Row positioning maps (Top Row = Left/Right animations, Bottom Row = Up/Down animations)
        if (player.lastDir === "left" || player.lastDir === "right") {
            sourceY = 0;
            sourceX = player.animFrame * SPRITE_FRAME_SIZE;
        } else {
            sourceY = SPRITE_FRAME_SIZE;
            sourceX = player.animFrame * SPRITE_FRAME_SIZE;
        }

        // Draws the isolated single slice tile to canvas centered on player position coordinates
        ctx.drawImage(
            playerSprite,
            sourceX, sourceY,          // Slice boundaries source inputs
            SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE, 
            -TILE_SIZE / 2, -TILE_SIZE / 2, // Positions sprite perfectly centered over rotation pivots
            TILE_SIZE, TILE_SIZE
        );
    } else {
        // Clean vector geometry rendering system fallback
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        let mouthSize = player.animFrame === 1 ? 0.2 : 0.05;
        ctx.arc(0, 0, TILE_SIZE / 2 - 2, mouthSize * Math.PI, (2 - mouthSize) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fill();
    }
    ctx.restore();
}

drawGame();
