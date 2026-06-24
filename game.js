const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreVal");

let score = 0;
let isSpriteLoaded = false;

// Starting positioning inside the map corridors
const player = {
    x: 1,
    y: 1
};

const playerSprite = new Image();
// Target your exact repository directory folder structure directly
playerSprite.src = 'assets/sprites/player.png'; 

playerSprite.onload = () => {
    isSpriteLoaded = true;
    drawGame();
};

playerSprite.onerror = () => {
    console.error("Failed to find image at assets/sprites/player.png. Check spelling or extensions.");
    drawGame(); // Renders the safe vector fallback if loading crashes
};

function movePlayer(dx, dy) {
    const targetX = player.x + dx;
    const targetY = player.y + dy;

    // Boundary maps checked against GRID_COLS and GRID_ROWS from map.js
    if (targetX >= 0 && targetX < GRID_COLS && targetY >= 0 && targetY < GRID_ROWS) {
        if (gameMap[targetY][targetX] !== 1) {
            player.x = targetX;
            player.y = targetY;

            // Dot interaction mechanics
            if (gameMap[player.y][player.x] === 0) {
                gameMap[player.y][player.x] = 2; 
                score += 10;
                scoreVal.textContent = score;
            }
            drawGame();
        }
    }
}

// Input Listener
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

    // Map Render Loop
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (gameMap[r][c] === 1) {
                ctx.fillStyle = "#0000ff"; // Arcade Blue Walls
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (gameMap[r][c] === 0) {
                // Centered White Dots
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Player Render Loop
    if (isSpriteLoaded) {
        ctx.drawImage(playerSprite, player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    } else {
        // Fallback drawing shape if asset path is breaking
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        ctx.arc(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2 - 2, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.lineTo(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2);
        ctx.fill();
    }
}

// Force baseline frame render
drawGame();
