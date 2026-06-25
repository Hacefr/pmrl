function smoothFrameProcessEngineLoop() {
    // Safety check: Don't interpolate if player object hasn't been instantiated yet by game.js
    if (window.player && window.player.renderX !== undefined) {
        let lerpSpeed = 0.22;
        
        window.player.renderX += (window.player.x - window.player.renderX) * lerpSpeed;
        window.player.renderY += (window.player.y - window.player.renderY) * lerpSpeed;

        if (window.updateCameraPosition) window.updateCameraPosition();
        if (window.drawGame) window.drawGame();
    }
    
    requestAnimationFrame(smoothFrameProcessEngineLoop);
}

// Kickstart rendering only after everything finishes loading
window.addEventListener("load", () => {
    requestAnimationFrame(smoothFrameProcessEngineLoop);
});
