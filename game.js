// Setup global placeholders that will sync after the DOM finishes parsing
window.rowsCount = 0;
window.colsCount = 0;
window.sizeTile = 0;

window.player = {
    x: 0,
    y: 0,
    angle: 0,
    animFrame: 0,
    currentDir: null,
    nextDir: null,
    isDead: false
};

window.camera = {
    x: 0,
    y: 0
};

// Global asset definition
window.playerSprite = new Image();
window.playerSprite.src = 'assets/sprites/player.png'; 

// Unified initialization environment wrapper
window.onload = function() {
    // 1. Sync dimensions with map_logic variables now safely loaded in memory
    window.rowsCount = window.WORLD_ROWS || 40;
    window.colsCount = window.WORLD_COLS || 60;
    window.sizeTile = window.TILE_SIZE || 32;

    // 2. Safely place player at the precise center coordinates of the map
    window.player.x = Math.floor(window.colsCount / 2);
    window.player.y = Math.floor(window.rowsCount / 2);

    // 3. Initialize background subsystems
    if (window.BabyEntity) window.BabyEntity.init();
    if (window.calculateInitialLevelDots) window.calculateInitialLevelDots();

    // 4. Fire continuous game timers
    window.isSpriteLoaded = false;
    window.playerSprite.onload = () => {
        window.isSpriteLoaded = true;
        window.drawGame();
    };
    window.playerSprite.onerror = () => {
        console.warn("player.png not found. Running backup retro vector rendering.");
    };
};
