window.TILE_SIZE = 32; 
window.WORLD_COLS = 60; 
window.WORLD_ROWS = 40; 
window.VIEW_COLS = 26; 
window.VIEW_ROWS = 18; 

window.gameMap = [];

window.generateProceduralMaze = function() {
    // ROUTING GATE: If it is the first stage run, deploy your custom 500 dots starter layout module
    if (window.currentLevel === 1 && typeof window.generateLevel1StarterMap === "function") {
        window.generateLevel1StarterMap();
        return;
    }

    // LEVEL 2+: Continue utilizing your advanced randomized infinite pillar carver engine
    window.gameMap = [];

    for (let r = 0; r < window.WORLD_ROWS; r++) {
        window.gameMap[r] = [];
        for (let c = 0; c < window.WORLD_COLS; c++) {
            if (r === 0 || r === window.WORLD_ROWS - 1 || c === 0 || c === window.WORLD_COLS - 1) {
                window.gameMap[r][c] = 1; 
            } else {
                window.gameMap[r][c] = 0; 
            }
        }
    }

    for (let r = 2; r < window.WORLD_ROWS - 2; r += 2) {
        for (let c = 2; c < window.WORLD_COLS - 2; c += 2) {
            window.gameMap[r][c] = 1;

            let roll = Math.random();
            if (roll < 0.20) {
                window.gameMap[r + 1][c] = 1; 
            } else if (roll < 0.40) {
                window.gameMap[r - 1][c] = 1; 
            } else if (roll < 0.60) {
                window.gameMap[r][c + 1] = 1; 
            } else if (roll < 0.80) {
                window.gameMap[r][c - 1] = 1; 
            }
        }
    }

    const centerY = Math.floor(window.WORLD_ROWS / 2);
    const centerX = Math.floor(window.WORLD_COLS / 2);

    for (let r = center-1; r <= centerY + 1; r++) {
        for (let c = centerX - 2; c <= centerX + 2; c++) {
            window.gameMap[r][c] = 2; 
        }
    }

    for (let c = centerX - 3; c <= centerX + 3; c++) {
        window.gameMap[centerY - 2][c] = 1;
        window.gameMap[centerY + 2][c] = 1;
    }
    for (let r = centerY - 2; r <= centerY + 2; r++) {
        window.gameMap[r][centerX - 3] = 1;
        window.gameMap[r][centerX + 3] = 1;
    }

    window.gameMap[centerY - 2][centerX] = 3;

    window.gameMap[centerY - 3][centerX] = 2;
    window.gameMap[centerY - 4][centerX] = 2;
    window.gameMap[centerY - 3][centerX - 1] = 2;
    window.gameMap[centerY - 3][centerX + 1] = 2;
    
    window.gameMap[centerY][centerX - 4] = 0;
    window.gameMap[centerY][centerX + 4] = 0;

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

    for (let r = 1; r < window.WORLD_ROWS - 1; r++) {
        for (let c = 1; c < window.WORLD_COLS - 1; c++) {
            if (window.gameMap[r][c] === 3) continue;

            if (window.gameMap[r][c] !== 1 && !reached[r][c]) {
                window.gameMap[r][c] = 2; 
            }
        }
    }
}

window.generateProceduralMaze();
