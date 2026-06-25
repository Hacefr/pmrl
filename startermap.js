window.generateLevel1StarterMap = function() {
    window.gameMap = [];

    // Step 1: Pad the entire 60x40 world map with solid boundary walls
    for (let r = 0; r < window.WORLD_ROWS; r++) {
        window.gameMap[r] = [];
        for (let c = 0; c < window.WORLD_COLS; c++) {
            window.gameMap[r][c] = 1;
        }
    }

    // Step 2: Establish a tight, balanced play arena centered in the world
    // Rows 8-32 and Cols 12-48 creates a snappier, less repetitive early level
    const playMinRow = 8;
    const playMaxRow = 32;
    const playMinCol = 12;
    const playMaxCol = 48;

    // Carve out our 500 dots layout template using a strict mathematical loop matrix
    let dotsPlacedCount = 0;
    const targetStarterDots = 500;

    for (let r = playMinRow; r <= playMaxRow; r++) {
        for (let c = playMinCol; c <= playMaxCol; c++) {
            // Create uniform, easy-to-navigate arcade paths
            if (r % 2 === 1 || c % 2 === 1) {
                if (dotsPlacedCount < targetStarterDots) {
                    window.gameMap[r][c] = 0; // Standard White Dot
                    dotsPlacedCount++;
                } else {
                    window.gameMap[r][c] = 2; // Open Floor corridor (Zero dots left)
                }
            }
        }
    }

    // Step 3: Hardcode the absolute center Ghost House spawning container
    const centerY = Math.floor(window.WORLD_ROWS / 2);
    const centerX = Math.floor(window.WORLD_COLS / 2);

    // Hollow out the central spawn space
    for (let r = centerY - 1; r <= centerY + 1; r++) {
        for (let c = centerX - 2; c <= centerX + 2; c++) {
            window.gameMap[r][c] = 2; 
        }
    }

    // Construct the solid house room boundary walls
    for (let c = centerX - 3; c <= centerX + 3; c++) {
        window.gameMap[centerY - 2][c] = 1;
        window.gameMap[centerY + 2][c] = 1;
    }
    for (let r = centerY - 2; r <= centerY + 2; r++) {
        window.gameMap[r][centerX - 3] = 1;
        window.gameMap[r][centerX + 3] = 1;
    }

    // Mount the gate tile on the top wall
    window.gameMap[centerY - 2][centerX] = 3;

    // Clear guaranteed open lines straight outside your doorway
    window.gameMap[centerY - 3][centerX] = 2;
    window.gameMap[centerY - 4][centerX] = 2;
    window.gameMap[centerY - 3][centerX - 1] = 2;
    window.gameMap[centerY - 3][centerX + 1] = 2;
    
    window.gameMap[centerY][centerX - 4] = 2;
    window.gameMap[centerY][centerX + 4] = 2;
};
