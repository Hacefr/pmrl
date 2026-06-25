const TILE_SIZE = 32; 

// GAME WORLD SIZE - Significantly expanded beyond screen bounds
const WORLD_COLS = 60; 
const WORLD_ROWS = 40; 

// VIEWPORT SCREEN SIZE - The active window dimension sizes
const VIEW_COLS = 26; // 832px
const VIEW_ROWS = 18; // 576px

let gameMap = [];

// Tile Types: 1=Wall, 0=White Dot, 2=Empty Floor, 3=Locked Center Gate / Glowing Exit, 4=Gold Dot
function generateProceduralMaze() {
    gameMap = [];

    // Step 1: Initialize the entire massive map with solid wall structures
    for (let r = 0; r < WORLD_ROWS; r++) {
        gameMap[r] = [];
        for (let c = 0; c < WORLD_COLS; c++) {
            gameMap[r][c] = 1;
        }
    }

    // Step 2: Carve reliable corridors and spread standard White Dots (0)
    for (let r = 1; r < WORLD_ROWS - 1; r++) {
        for (let c = 1; c < WORLD_COLS - 1; c++) {
            if (Math.random() > 0.35 || (r % 2 === 1 && c % 2 === 1)) {
                gameMap[r][c] = 0; 
            }
        }
    }

    // Step 3: Explicitly carve the 5x3 Spawning Ghost House directly in the center
    const centerY = Math.floor(WORLD_ROWS / 2);
    const centerX = Math.floor(WORLD_COLS / 2);

    // Form a clear hollow room inside the massive matrix
    for (let r = centerY - 1; r <= centerY + 1; r++) {
        for (let c = centerX - 2; c <= centerX + 2; c++) {
            gameMap[r][c] = 2; // Empty floors inside the house
        }
    }

    // Wrap the House inside a specific boundary ring wall layout
    for (let c = centerX - 3; c <= centerX + 3; c++) {
        gameMap[centerY - 2][c] = 1;
        gameMap[centerY + 2][c] = 1;
    }
    for (let r = centerY - 2; r <= centerY + 2; r++) {
        gameMap[r][centerX - 3] = 1;
        gameMap[r][centerX + 3] = 1;
    }

    // Re-clear inner path corridors just outside doors to ensure zero trapping
    gameMap[centerY - 3][centerX] = 2;
    gameMap[centerY + 3][centerX] = 2;

    // Set up the Center House Door Gate Tile (Tile type 3)
    gameMap[centerY - 2][centerX] = 3; 
}

generateProceduralMaze();
