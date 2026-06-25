window.BabyEntity = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    state: "idle",          
    telegraphLine: null,     
    isIdleSpriteLoaded: false,
    isChargeSpriteLoaded: false,
    
    baseTelegraphDuration: 1300, 
    lastAttackTime: 0,
    attackCooldown: 3500,        
    chargeProgress: 0,
    chargeSpeed: 0.25,           
    
    idleImg: new Image(),
    chargeImg: new Image(),

    init: function() {
        // Spawn Baby a safe distance away from the center room coordinates on load
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
            // Constant smooth wall-phasing tracking vector formulas
            let dx = playerX - this.x;
            let dy = playerY - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0.1) {
                this.x += (dx / distance) * 0.04;
                this.y += (dy / distance) * 0.04;
            }

            if (now - this.lastAttackTime > this.attackCooldown) {
                let currentTelegraphWindow = Math.max(200, this.baseTelegraphDuration - (totalGlitchCount * 25));
                
                this.state = "telegraph";
                this.lastAttackTime = now;
                this.targetX = playerX;
                this.targetY = playerY;
                
                this.telegraphLine = { startX: this.x, startY: this.y, endX: playerX, endY: playerY };

                setTimeout(() => {
                    if (this.state === "telegraph") {
                        this.state = "charge";
                        this.chargeProgress = 0;
                    }
                }, currentTelegraphWindow);
            }
        } else if (this.state === "charge") {
            this.chargeProgress += this.chargeSpeed;
            
            this.x = this.telegraphLine.startX + (this.telegraphLine.endX - this.telegraphLine.startX) * this.chargeProgress;
            this.y = this.telegraphLine.startY + (this.telegraphLine.endY - this.telegraphLine.startY) * this.chargeProgress;

            if (this.chargeProgress >= 1) {
                this.state = "idle";
                this.telegraphLine = null;
                this.lastAttackTime = Date.now();
            }
        }
    },

    draw: function(ctx, cameraX, cameraY, sizeTile) {
        let renderX = this.x * sizeTile;
        let renderY = this.y * sizeTile;

        // Render the warning telegraph lines clearly on the map layers
        if (this.state === "telegraph" && this.telegraphLine) {
            ctx.save();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(255, 0, 0, 0.65)";
            ctx.beginPath();
            ctx.moveTo(this.telegraphLine.startX * sizeTile + sizeTile / 2, this.telegraphLine.startY * sizeTile + sizeTile / 2);
            ctx.lineTo(this.telegraphLine.endX * sizeTile + sizeTile / 2, this.telegraphLine.endY * sizeTile + sizeTile / 2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.save();
        
        // DECOUPLING FIX: Visual size scales up smoothly (~56px) while keeping the hitbox at 32px
        let upscaledSize = sizeTile * 1.75; 
        let offset = (upscaledSize - sizeTile) / 2;

        if (this.state === "charge" && this.isChargeSpriteLoaded) {
            ctx.drawImage(this.chargeImg, renderX - offset, renderY - offset, upscaledSize, upscaledSize);
        } else if (this.isIdleSpriteLoaded) {
            ctx.drawImage(this.idleImg, renderX - offset, renderY - offset, upscaledSize, upscaledSize);
        } else {
            ctx.fillStyle = "#ff00ff";
            ctx.beginPath();
            ctx.arc(renderX + sizeTile / 2, renderY + sizeTile / 2, sizeTile / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
};
