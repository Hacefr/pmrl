window.camera = { x: 0, y: 0 };
window.isSpriteLoaded = false;

window.playerSprite = new Image();
window.playerSprite.src = 'assets/sprites/player.png';

window.playerSprite.onload = () => {
    window.isSpriteLoaded = true;
    window.drawGame();
};

window.playerSprite.onerror = () => {
    console.warn("player.png asset missing. Using vector fallbacks.");
    window.drawGame();
};

window.updateCameraPosition = function() {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return;
    let targetCamX = (window.player.x * window.sizeTile) - (canvas.width / 2) + (window.sizeTile / 2);
    let targetCamY = (window.player.y * window.sizeTile) - (canvas.height / 2) + (window.sizeTile / 2);

    window.camera.x = Math.max(0, Math.min(targetCamX, (window.colsCount * window.sizeTile) - canvas.width));
    window.camera.y = Math.max(0, Math.min(targetCamY, (window.rowsCount * window.sizeTile) - canvas.height));
};

window.drawGame = function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-window.camera.x, -window.camera.y);

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0000ff";

    for (let r = 0; r < window.rowsCount; r++) {
        if (!window.gameMap[r]) continue;
        for (let c = 0; c < window.colsCount; c++) {
            let x = c * window.sizeTile;
            let y = r * window.sizeTile;

            if (x + window.sizeTile < window.camera.x || x > window.camera.x + canvas.width ||
                y + window.sizeTile < window.camera.y || y > window.camera.y + canvas.height) {
                continue;
            }

            if (window.gameMap[r][c] === 1) {
                ctx.strokeRect(x + 4, y + 4, window.sizeTile - 8, window.sizeTile - 8);
            } else if (window.gameMap[r][c] === 0) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(x + window.sizeTile / 2, y + window.sizeTile / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (window.gameMap[r][c] === 4) {
                ctx.fillStyle = "#ffff00";
                ctx.beginPath();
                ctx.arc(x + window.sizeTile / 2, y + window.sizeTile / 2, 5, 0, Math.PI * 2);
                ctx.fill();
            } else if (window.gameMap[r][c] === 3) {
                ctx.fillStyle = window.gamePhase === "white" ? "#ff0000" : "#ffff00"; 
                ctx.fillRect(x + 2, y + 12, window.sizeTile - 4, 8);
            } else if (window.gameMap[r][c] === 5) {
                let chars = ["0", "7", "A", "K", "田", "%", "X", "9"];
                let randChar = chars[(r + c + window.totalGlitchCount) % chars.length];
                let colors = ["#ff00ff", "#ff5500", "#00ff00", "#00ffff"];
                let randColor = colors[(r * c) % colors.length];
                ctx.fillStyle = randColor;
                ctx.font = "bold 16px monospace";
                ctx.fillText(randChar, x + 10, y + 22);
            }
        }
    }

    if (window.BabyEntity && typeof window.BabyEntity.draw === "function") {
        window.BabyEntity.draw(ctx, window.camera.x, window.camera.y, window.sizeTile);
    }

    let pX = window.player.x * window.sizeTile + window.sizeTile / 2;
    let pY = window.player.y * window.sizeTile + window.sizeTile / 2;

    ctx.save();
    ctx.translate(pX, pY);
    ctx.rotate(window.player.angle);

    if (window.isSpriteLoaded && !window.player.isDead) {
        let frameW = window.playerSprite.width / 2;
        let frameH = window.playerSprite.height / 2;
        let sourceX = window.player.animFrame * frameW;
        let sourceY = (window.player.currentDir === "up" || window.player.currentDir === "down") ? frameH : 0;
        ctx.drawImage(window.playerSprite, sourceX, sourceY, frameW, frameH, -window.sizeTile / 2, -window.sizeTile / 2, window.sizeTile, window.sizeTile);
    } else {
        ctx.fillStyle = window.player.isDead ? "#ff0000" : "#ffff00";
        ctx.beginPath();
        let mouthSize = window.player.animFrame === 1 ? 0.2 : 0.04;
        ctx.arc(0, 0, window.sizeTile / 2 - 2, mouthSize * Math.PI, (2 - mouthSize) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fill();
    }
    ctx.restore();

    if (window.player.isDead) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(window.camera.x, window.camera.y, canvas.width, canvas.height);
        ctx.fillStyle = "#ff0000";
        ctx.font = "bold 40px 'Courier New'";
        ctx.textAlign = "center";
        ctx.fillText("RUN FAILED", window.camera.x + canvas.width / 2, window.camera.y + canvas.height / 2 - 10);
        ctx.fillStyle = "#ffffff";
        ctx.font = "20px 'Courier New'";
        ctx.fillText("Refresh browser page to restart run", window.camera.x + canvas.width / 2, window.camera.y + canvas.height / 2 + 30);
    }
    ctx.restore(); 
};
