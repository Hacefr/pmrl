const TILE_SIZE = 32; 
const GRID_COLS = 26; // 832px width
const GRID_ROWS = 18; // 576px height

// Initialize global grid tracking storage
let gameMap = [];

// 1 = Wall, 0 = Dot to collect, 2 = Empty floor, 3 = Level exit stairs
function generateProceduralMaze() {
    gameMap = [];

    // Step 1: Securely create all row structures and fill them with wall structures
    for (let r = 0; r < GRID_ROWS; r++) {
        gameMap[r] = [];
        for (let c = 0; c < GRID_COLS; c++) {
            gameMap[r][c] = 1;
        }
    }

    // Step 2: Carve random pathways inside map boundaries
    for (let r = 1; r < GRID_ROWS - 1; r++) {
        for (let c = 1; c < GRID_COLS - 1; c++) {
            if (Math.random() > 0.35 || (r % 2 === 1 && c % 2 === 1)) {
                gameMap[r][c] = 0; // Spawn standard collectible dots
            }
        }
    }

    // Step 3: Explicitly set empty floors safely on instantiated row rows
    gameMap[1][1] = 2; 

    // Step 4: Add goal stairs down in bottom corner
    gameMap[GRID_ROWS - 2][GRID_COLS - 2] = 3; 
}

// Generate immediately on script resource loading frame
generateProceduralMaze();
