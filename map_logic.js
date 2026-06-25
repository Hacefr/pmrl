const TILE_SIZE = 32; 
const WORLD_COLS = 60; 
const WORLD_ROWS = 40; 
const VIEW_COLS = 26; 
const VIEW_ROWS = 18; 

let gameMap = [];

// Tile IDs: 1=Wall, 0=White Dot, 2=Empty Floor, 3=Gate Door, 4=Gold Dot
function generateProceduralMaze() {
    gameMap = [];

    // Step 1: Initialize the entire world with solid walls
    for (let r = 0; r < WORLD_ROWS; r++) {
        gameMap[r] = [];
        for (let c = 0; c < WORLD_COLS; c++) {
            gameMap[r][c] = 1;
        }
    }

    // Step 2: Carve standard grid corridors (Force alternating pathways)
    for (let r = 1; r < WORLD_ROWS - 1; r++) {
        for (let c = 1; c < WORLD_COLS - 1; c++) {
            // Create a structured grid template layout
            if (r % 2 === 1 || c % 2 === 1) {
                if (Math.random() > 0.28) {
                    gameMap[r][c] = 0; // Walkable path filled with white dot
                }
            }
        }
    }

    // Step 3: Secure the Ghost House coordinates
    const centerY = Math.floor(WORLD_ROWS / 2);
    const centerX = Math.floor(WORLD_COLS / 2);

    // Carve out empty space inside the house room zone
    for (let r = centerY - 1; r <= centerY + 1; r++) {
        for (let c = centerX - 2; c <= centerX + 2; c++) {
            gameMap[r][c] = 2; // Floor with no dots
        }
    }

    // Build the solid perimeter walls strictly around the room box
    for (let c = centerX - 3; c <= centerX + 3; c++) {
        gameMap[centerY - 2][c] = 1;
        gameMap[centerY + 2][c] = 1;
    }
    for (let r = centerY - 2; r <= centerY + 2; r++) {
        gameMap[r][centerX - 3] = 1;
        gameMap[r][centerX + 3] = 1;
    }

    // Assign the Door Gate tile to the top wall center row index
    gameMap[centerY - 2][centerX] = 3;

    // GUARANTEED ESCAPE LANE: Clear paths directly leading out of the door
    gameMap[centerY - 3][centerX] = 2;
    gameMap[centerY - 4][centerX] = 2;
    gameMap[centerY - 3][centerX - 1] = 2;
    gameMap[centerY - 3][centerX + 1] = 2;

    // Step 4: Run Flood-Fill validation from center spawn point to clear dead-ends
    ensureMapConnectivity(centerX, centerY);
}

function ensureMapConnectivity(startX, startY) {
    // Array matrix to track reached spaces
    let reached = [];
    for (let r = 0; r < WORLD_ROWS; r++) {
        reached[r] = new Array(WORLD_COLS).fill(false);
    }

    let queue = [{ x: startX, y: startY }];
    reached[startY][startX] = true;

    // Explore outward from center spawn through corridors
    while (queue.length > 0) {
        let current = queue.shift();
        let neighbors = [
            { x: current.x, y: current.y - 1 },
            { x: current.x, y: current.y + 1 },
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y }
        ];

        for (let n of neighbors) {
            if (n.x >= 0 && n.x < WORLD_COLS && n.y >= 0 && n.y < WORLD_ROWS) {
                // If it is not a wall and we haven't visited it yet, queue it
                if (gameMap[n.y][n.x] !== 1 && !reached[n.y][n.x]) {
                    reached[n.y][n.x] = true;
                    queue.push(n);
                }
            }
        }
    }

    // CLEANUP PASS: Turn any inaccessible trapped dot tile into a solid wall block
    for (let r = 1; r < WORLD_ROWS - 1; r++) {
        for (let c = 1; c < WORLD_COLS - 1; c++) {
            // Skip the door gate tile entirely
            if (gameMap[r][c] === 3) continue;

            // If a tile is floor/dot but flood-fill could not reach it, turn it to solid wall
            if (gameMap[r][c] !== 1 && !reached[r][c]) {
                gameMap[r][c] = 1;
            }
        }
    }
}
