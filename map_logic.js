// Global world configurations across window scopes
window.TILE_SIZE = 32; 
window.WORLD_COLS = 60; 
window.WORLD_ROWS = 40; 
window.VIEW_COLS = 26; 
window.VIEW_ROWS = 18; 

window.gameMap = [];

// Tile IDs: 1=Wall, 0=White Dot, 2=Empty Floor, 3=Gate Door, 4=Gold Dot
window.generateProceduralMaze = function() {
    window.gameMap = [];

    // Step 1: Lay down a solid outer border, and fill the inside with open floors and dots
    for (let r = 0; r < window.WORLD_ROWS; r++) {
        window.gameMap[r] = [];
        for (let c = 0; c < window.WORLD_COLS; c++) {
            if (r === 0 || r === window.WORLD_ROWS - 1 || c === 0 || c === window.WORLD_COLS - 1) {
                window.gameMap[r][c] = 1; // Outer solid boundary walls
            } else {
                window.gameMap[r][c] = 0; // Everything inside is initialized as paths with dots
            }
        }
    }

    // Step 2: Form a classic structured pillar grid (Approach A)
    // Placing a wall tile on alternating even coordinates leaves perfect 1-tile wide corridors
    for (let r = 2; r < window.WORLD_ROWS - 2; r += 2) {
        for (let c = 2; c < window.WORLD_COLS - 2; c += 2) {
            window.gameMap[r][c] = 1;

            // Randomly extend the pillar in ONE direction to form interesting corridors
            // This builds legal maze walls without ever blobbing into giant solid block zones
            let roll = Math.random();
            if (roll < 0.20) {
                window.gameMap[r + 1][c] = 1; // Extend Wall Down
            } else if (roll < 0.40) {
                window.gameMap[r - 1][c] = 1; // Extend Wall Up
            } else if (roll < 0.60) {
                window.gameMap[r][c + 1] = 1; // Extend Wall Right
            } else if (roll < 0.80) {
                window.gameMap[r][c - 1] = 1; // Extend Wall Left
            }
        }
    }

    // Step 3: Explicitly carve out and anchor the Ghost House in the center
    const centerY = Math.floor(window.WORLD_ROWS / 2);
    const centerX = Math.floor(window.WORLD_COLS / 2);

    // Completely hollow out the inside space of the home box
    for (let r = centerY - 1; r <= centerY + 1; r++) {
        for (let c = centerX - 2; c <= centerX + 2; c++) {
            window.gameMap[r][c] = 2; // Floor with no dots
        }
    }

    // Build standard single-thickness perimeter borders around the home box
    for (let c = centerX - 3; c <= centerX + 3; c++) {
        window.gameMap[centerY - 2][c] = 1;
        window.gameMap[centerY + 2][c] = 1;
    }
    for (let r = centerY - 2; r <= centerY + 2; r++) {
        window.gameMap[r][centerX - 3] = 1;
        window.gameMap[r][centerX + 3] = 1;
    }

    // Overwrite the top-center wall segment with the red Gate Door (Tile Type 3)
    window.gameMap[centerY - 2][centerX] = 3;

    // GUARANTEED ESCAPE LANES: Clear out walls directly surrounding the doorway path
    window.gameMap[centerY - 3][centerX] = 2;
    window.gameMap[centerY - 4][centerX] = 2;
    window.gameMap[centerY - 3][centerX - 1] = 2;
    window.gameMap[centerY - 3][centerX + 1] = 2;
    
    // Clear out paths leading down and out away from the side parameters for extra fluid flow
    window.gameMap[centerY][centerX - 4] = 0;
    window.gameMap[centerY][centerX + 4] = 0;

    // Step 4: Run a lightweight connectivity validation safety pass 
    ensureMapConnectivity(centerX, centerY);
};

function ensureMapConnectivity(startX, startY) {
    let reached = [];
    for (let r = 0; r < window.WORLD_ROWS; r++) {
        reached[r] = new Array(window.WORLD_COLS).fill(false);
    }

    // Use a queue to flood out from the center box
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

    // Since our pillar layout doesn't create giant block blobs anymore, 
    // any isolated dead ends that the queue couldn't touch are safely cleared out into corridors
    for (let r = 1; r < window.WORLD_ROWS - 1; r++) {
        for (let c = 1; c < window.WORLD_COLS - 1; c++) {
            if (window.gameMap[r][c] === 3) continue;

            // If a tile was marked as a dot but it's physically trapped, turn it into an empty open floor
            if (window.gameMap[r][c] !== 1 && !reached[r][c]) {
                window.gameMap[r][c] = 2; 
            }
        }
    }
}

// Automatically compile map arrays on script loading sequences
window.generateProceduralMaze();
