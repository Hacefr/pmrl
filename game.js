const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreVal");
const levelVal = document.getElementById("levelVal");

let score = 0;
let currentLevel = 1;
let isSpriteLoaded = false;

const player = {
    x: 1,
    y: 1
};

const playerSprite = new Image();
playerSprite.src = 'assets/sprites/player.png'; 

playerSprite.onload = () => {
    isSpriteLoaded = true;
    drawGame();
};

playerSprite.onerror = () => {
    console.warn("player.png not found at assets/sprites/player.png. Rendering yellow canvas fallback.");
    drawGame();
};

function checkWinCondition() {
    let remainingDots = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (gameMap[r] && gameMap[r][c] === 0) {
                remainingDots++;
            }
        }
    }
    // If all dots are eaten, reveal exit stairs path if blocked
    if (remainingDots === 0 && gameMap[GRID_ROWS - 2][GRID_COLS - 2] === 1) {
        gameMap[GRID_ROWS - 2][GRID_COLS - 2] = 3;
    }
}

function advanceToNextLevel() {
    currentLevel++;
    levelVal.textContent = currentLevel;
    
    player.x = 1;
    player.y = 1;
    
    generateProceduralMaze();
    drawGame();
}

function movePlayer(dx, dy) {
    const targetX = player.x + dx;
    const targetY = player.y + dy;

    if (targetX >= 0 && targetX < GRID_COLS && targetY >= 0 && targetY < GRID_ROWS) {
        // Safety validation checklist structure
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
                drawGame();
            }
        }
    }
}

window.addEventListener("keydown", (e) => {
    switch(e.key.toLowerCase()) {
        case "w": case "arrowup":    movePlayer(0, -1); e.preventDefault(); break;
        case "s": case "arrowdown":  movePlayer(0, 1);  e.preventDefault(); break;
        case "a": case "arrowleft":  movePlayer(-1, 0); e.preventDefault(); break;
        case "d": case "arrowright": movePlayer(1, 0);  e.preventDefault(); break;
    }
});

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Secure Map Render Routine
    for (let r = 0; r < GRID_ROWS; r++) {
        if (!gameMap[r]) continue; // Skip rendering if the current row array structure isn't populated yet
        
        for (let c = 0; c < GRID_COLS; c++) {
            if (gameMap[r][c] === 1) {
                ctx.fillStyle = "#0000ff"; // Solid Blue Maze Walls
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (gameMap[r][c] === 0) {
                ctx.fillStyle = "#ffffff"; // Pac-Dots
                ctx.beginPath();
                ctx.arc(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (gameMap[r][c] === 3) {
                ctx.fillStyle = "#00ff00"; // Neon Green Level Up Gate
                ctx.fillRect(c * TILE_SIZE + 4, r * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            }
        }
    }

    // Secure Player Sprite Render Routine
    if (isSpriteLoaded) {
        ctx.drawImage(playerSprite, player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    } else {
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        ctx.arc(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2 - 2, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.lineTo(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2);
        ctx.fill();
    }
}

// Initial paint execution
drawGame();
