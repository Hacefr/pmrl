// Visual sub-pixel trackers initialized exactly onto center starting spawn locations
window.player.renderX = window.player.x;
window.player.renderY = window.player.y;

function smoothFrameProcessEngineLoop() {
    if (!window.player.isDead) {
        // LINEAR INTERPOLATION (LERP): Slides visual values 22% closer to true grid blocks on every loop cycle
        let lerpSpeed = 0.22;
        
        window.player.renderX += (window.player.x - window.player.renderX) * lerpSpeed;
        window.player.renderY += (window.player.y - window.player.renderY) * lerpSpeed;

        // Recalculate tracking viewport camera coordinate windows using smooth lerps
        if (window.updateCameraPosition) window.updateCameraPosition();
        
        // Execute canvas repaint pass at a fluid, native 60 frames per second
        if (window.drawGame) window.drawGame();
    }
    
    // Keep browser animation engine firing continuously
    requestAnimationFrame(smoothFrameProcessEngineLoop);
}

// Kickstart the 60FPS loop immediately upon file compilation
requestAnimationFrame(smoothFrameProcessEngineLoop);
