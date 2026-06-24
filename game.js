const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreVal = document.getElementById("scoreVal");

let score = 0;

// Player starting data coordinates (Grid 1,1)
const player = {
    x: 1,
    y: 1
};

// Load your custom sprite image from the repository
const playerSprite = new Image();
playerSprite.src = 'player.png';

// Ensure rendering updates cleanly when the sprite finishes loading
playerSprite.onload = () => {
    drawGame();
};

function movePlayer(dx, dy) {
    const targetX = player.x + dx;
    const targetY = player.y + dy;

    // Grid boundary and wall collision check
    if (targetX >= 0 && targetX < GRID_SIZE && targetY >= 0 && targetY < GRID_SIZE) {
        if (gameMap[targetY][targetX] !== 1) {
            player.x = targetX;
            player.y = targetY;

            // Dot consumption logic (0 = dot present, 2 = eaten/empty floor)
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
        case "w": case "arrowup":    movePlayer(0, -1); break;
        case "s": case "arrowdown":  movePlayer(0, 1);  break;
        case "a": case "arrowleft":  movePlayer(-1, 0); break;
        case "d": case "arrowright": movePlayer(1, 0);  break;
    }
});

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render map matrix
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (gameMap[r][c] === 1) {
                ctx.fillStyle = "#0000ff"; // Solid Blue Walls
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (gameMap[r][c] === 0) {
                // Draw small yellow dots centered inside the tile
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Render the custom player sprite 
    ctx.drawImage(
        playerSprite, 
        player.x * TILE_SIZE, 
        player.y * TILE_SIZE, 
        TILE_SIZE, 
        TILE_SIZE
    );
}
