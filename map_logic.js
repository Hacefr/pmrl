// Make sizing variables globally accessible to all files via window scope
window.TILE_SIZE = 32; 
window.WORLD_COLS = 60; 
window.WORLD_ROWS = 40; 
window.VIEW_COLS = 26; 
window.VIEW_ROWS = 18; 

window.gameMap = [];

// Tile IDs: 1=Wall, 0=White Dot, 2=Empty Floor, 3=Gate Door, 4=Gold Dot
window.generateProceduralMaze = function() {
    window.gameMap = [];

    // Step 1: Initialize the entire world with solid walls
    for (let r = 0; r < window.WORLD_ROWS; r++) {
        window.gameMap[r] = [];
        for (let c = 0; c < window.WORLD_COLS; c++) {
            window.gameMap[r][c] = 1;
        }
    }

    // Step 2: Carve standard grid corridors
    for (let r = 1; r < window.WORLD_ROWS - 1; r++) {
        for (let c = 1; c < window.WORLD_COLS - 1; c++) {
            if (r % 2 === 1 || c % 2 === 1) {
                if (Math.random() > 0.28) {
                    window.gameMap[r][c] = 0; // Walkable path with dot
                }
            }
        }
    }

    // Step 3: Secure the Ghost House coordinates
    const centerY = Math.floor(window.WORLD_ROWS / 2);
    const centerX = Math.floor(window.WORLD_COLS / 2);

    // Carve out empty space inside the house room zone
    for (let r = centerY - 1; r <= centerY + 1; r++) {
        for (let c = centerX - 2; c <= centerX + 2; c++) {
            window.gameMap[r][c] = 2; 
        }
    }

    // Build the solid perimeter walls strictly around the room box
    for (let c = centerX - 3; c <= centerX + 3; c++) {
        window.gameMap[centerY - 2][c] = 1;
        window.gameMap[centerY + 2][c] = 1;
    }
    for (let r = centerY - 2; r <= centerY + 2; r++) {
        window.gameMap[r][centerX - 3] = 1;
        window.gameMap[r][centerX + 3] = 1;
    }

    // Assign the Door Gate tile to the top wall center row index
    window.gameMap[centerY - 2][centerX] = 3;

    // GUARANTEED ESCAPE LANE: Clear paths directly leading out of the door
    window.gameMap[centerY - 3][centerX] = 2;
    window.gameMap[centerY - 4][centerX] = 2;
    window.gameMap[centerY - 3][centerX - 1] = 2;
    window.gameMap[centerY - 3][centerX + 1] = 2;

    // Step 4: Run Flood-Fill validation from center spawn point to clear dead-ends
    ensureMapConnectivity(centerX, centerY);
};

function ensureMapConnectivity(startX, startY) {
    let reached = [];
    for (let r = 0; r < window.WORLD_ROWS; r++) {
        reached[r] = new Array(window.WORLD_COLS).fill(false);
    }

    let queue = [{ x: startX, y: startY }];
    reached[startY][startX] = true;

    while (queue.length > 0) {
        let current = queue.shift();
        let neighbors = [
            { x: current.x, y: current.y - 1 },
            { x: current.x, y: current.y + 1 },
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y }
        ];

        for (let n of neighbors) {
            if (n.x >= 0 && n.x < window.WORLD_COLS && n.y >= 0 && n.y < window.WORLD_ROWS) {
                if (window.gameMap[n.y][n.x] !== 1 && !reached[n.y][n.x]) {
                    reached[n.y][n.x] = true;
                    queue.push(n);
                }
            }
        }
    }

    // CLEANUP PASS: Turn any inaccessible trapped dot tile into a solid wall block
    for (let r = 1; r < window.WORLD_ROWS - 1; r++) {
        for (let c = 1; c < window.WORLD_COLS - 1; c++) {
            if (window.gameMap[r][c] === 3) continue;

            if (window.gameMap[r][c] !== 1 && !reached[r][c]) {
                window.gameMap[r][c] = 1;
            }
        }
    }
}

// Generate the maze array safely upon script resource initialization loading
window.generateProceduralMaze();
