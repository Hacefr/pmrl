window.BabyEntity = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    state: "idle",          // "idle" (stalking/patrolling) or "charge" (dashing)
    telegraphLine: null,     // Coordinates storing the red attack trajectory line
    isIdleSpriteLoaded: false,
    isChargeSpriteLoaded: false,
    
    // Attack Tuning Parameters
    baseTelegraphDuration: 1300, // Shaves down as glitched corruption counts scale up
    lastAttackTime: 0,
    attackCooldown: 3500,        // Interval delay window between charges
    chargeProgress: 0,
    chargeSpeed: 0.25,           // Velocity delta multiplier for the line-dash surge
    
    idleImg: new Image(),
    chargeImg: new Image(),

    init: function() {
        // Position Baby far away from center spawning zone at level load coordinates
        this.x = 5;
        this.y = 5;
        this.state = "idle";
        this.telegraphLine = null;
        this.lastAttackTime = Date.now();

        this.idleImg.src = 'assets/sprites/baby_idle.png';
        this.chargeImg.src = 'assets/sprites/baby_charge.png';

        this.idleImg.onload = () => { this.isIdleSpriteLoaded = true; };
        this.chargeImg.onload = () => { this.isChargeSpriteLoaded = true; };
    },

    update: function(playerX, playerY, gamePhase, totalGlitchCount) {
        let now = Date.now();

        if (this.state === "idle") {
            // STEP 1: Constantly slide directly through walls toward player's active position coordinates
            let dx = playerX - this.x;
            let dy = playerY - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0.1) {
                // Base slow drifting speed pacing
                this.x += (dx / distance) * 0.04;
                this.y += (dy / distance) * 0.04;
            }

            // STEP 2: Handle attack loop intervals
            if (now - this.lastAttackTime > this.attackCooldown) {
                // Calculate dynamic scaling telegraph window linked to Level 256 glitch counts
                let currentTelegraphWindow = Math.max(200, this.baseTelegraphDuration - (totalGlitchCount * 25));
                
                this.state = "telegraph";
                this.lastAttackTime = now;
                this.targetX = playerX;
                this.targetY = playerY;
                
                // Formulate target line endpoint bounds
                this.telegraphLine = { startX: this.x, startY: this.y, endX: playerX, endY: playerY };

                // Handle automated windup timer transition to high-speed charge state execution
                setTimeout(() => {
                    if (this.state === "telegraph") {
                        this.state = "charge";
                        this.chargeProgress = 0;
                    }
                }, currentTelegraphWindow);
            }
        } else if (this.state === "charge") {
            // STEP 3: Surge down the telegraphed path line at maximum speed
            this.chargeProgress += this.chargeSpeed;
            
            // Linear position translation interpolation vectors
            this.x = this.telegraphLine.startX + (this.telegraphLine.endX - this.telegraphLine.startX) * this.chargeProgress;
            this.y = this.telegraphLine.startY + (this.telegraphLine.endY - this.telegraphLine.startY) * this.chargeProgress;

            if (this.chargeProgress >= 1) {
                // Dash completed, return back to idle tracking configuration loop
                this.state = "idle";
                this.telegraphLine = null;
                this.lastAttackTime = Date.now();
            }
        }
    },

    draw: function(ctx, cameraX, cameraY, sizeTile) {
        let renderX = this.x * sizeTile;
        let renderY = this.y * sizeTile;

        // Draw telegraph tracking lines directly on the canvas layers below the sprite
        if (this.state === "telegraph" && this.telegraphLine) {
            ctx.save();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(255, 0, 0, 0.65)"; // Radiant glowing warning lines
            ctx.setLineDash([4, 4]); // Blinking retro aesthetic dashes
            ctx.beginPath();
            ctx.moveTo(this.telegraphLine.startX * sizeTile + sizeTile / 2, this.telegraphLine.startY * sizeTile + sizeTile / 2);
            ctx.lineTo(this.telegraphLine.endX * sizeTile + sizeTile / 2, this.telegraphLine.endY * sizeTile + sizeTile / 2);
            ctx.stroke();
            ctx.restore();
        }

        // Render target Baby texture structures on the highest layering stack space
        ctx.save();
        if (this.state === "charge" && this.isChargeSpriteLoaded) {
            ctx.drawImage(this.chargeImg, renderX, renderY, sizeTile, sizeTile);
        } else if (this.isIdleSpriteLoaded) {
            ctx.drawImage(this.idleImg, renderX, renderY, sizeTile, sizeTile);
        } else {
            // Backup emergency vector shapes if asset graphics take time to compile paths
            ctx.fillStyle = "#ff00ff";
            ctx.beginPath();
            ctx.arc(renderX + sizeTile / 2, renderY + sizeTile / 2, sizeTile / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
};
