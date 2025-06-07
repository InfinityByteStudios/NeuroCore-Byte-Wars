class Enemy {
    constructor(x, y, type = 'datawisp') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        this.health = 100;
        this.maxHealth = 100;
        
        // Set properties based on enemy type
        this.setTypeProperties();
        
        // Movement
        this.velocity = { x: 0, y: 0 };
        this.targetX = x;
        this.targetY = y;
        
        // Visual effects
        this.flashTimer = 0;
        this.isFlashing = false;
    }
      setTypeProperties() {        switch (this.type) {
            case 'datawisp':
                this.radius = 12;
                this.speed = 65; // slow movement (increased for larger arena)
                this.health = 30;
                this.maxHealth = 30;
                this.color = '#ff4444';
                this.glowColor = '#ff6666';
                this.points = 10;
                break;            case 'bitbug':
                this.radius = 8;
                this.speed = 140; // fast and aggressive (increased for larger arena)
                this.health = 15;
                this.maxHealth = 15;
                this.color = '#ff6600';
                this.glowColor = '#ff8844';
                this.points = 15;
                this.aggressionTimer = 0;
                this.dashCooldown = 2.0; // seconds between dashes
                this.isDashing = false;
                this.dashSpeed = 350; // much faster during dash (increased for larger arena)
                break;
            case 'memoryleech':
                this.radius = 15;
                this.speed = 50; // slower than datawisp
                this.health = 80;
                this.maxHealth = 80;
                this.color = '#8a2be2'; // Purple color
                this.glowColor = '#9932cc';
                this.points = 25;
                this.drainRange = 120; // Range to drain player energy
                this.drainRate = 0.3; // How much energy to drain per second
                this.pulseTimer = 0;
                this.isDraining = false;
                break;
            default:
                this.radius = 10;
                this.speed = 60;
                this.health = 20;
                this.maxHealth = 20;
                this.color = '#ff0000';
                this.glowColor = '#ff3333';
                this.points = 5;
        }
    }    update(deltaTime, player, arena) {
        if (!this.active) return;
        
        // Update type-specific behavior
        this.updateTypeBehavior(deltaTime, player);
        
        // Check if player is protected by safe zone
        const playerProtected = arena && arena.isSafeZoneActive();
        
        if (playerProtected) {
            // Player is in active safe zone - move aimlessly
            this.moveAimlessly(deltaTime, arena);
        } else {
            // Normal AI: move towards player but avoid safe zone
            this.targetX = player.x;
            this.targetY = player.y;
            
            // Check if target is in safe zone and adjust if needed
            if (arena && arena.isInSafeZone(this.targetX, this.targetY)) {
                // If player is in safe zone, move to edge of safe zone instead
                const center = arena.getCenter();
                const dx = this.targetX - center.x;
                const dy = this.targetY - center.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // Position at safe zone boundary
                    const safeZoneEdge = arena.safeZoneRadius + 20; // Stay a bit outside
                    this.targetX = center.x + (dx / distance) * safeZoneEdge;
                    this.targetY = center.y + (dy / distance) * safeZoneEdge;
                }
            }
        }
        
        // Calculate direction to target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Normalize direction and apply speed
            let currentSpeed = this.speed;
              // Bit Bug dash behavior
            if (this.type === 'bitbug' && this.isDashing) {
                currentSpeed = this.dashSpeed;
            }
              this.velocity.x = (dx / distance) * currentSpeed;
            this.velocity.y = (dy / distance) * currentSpeed;
        }
        
        // Calculate new position
        let newX = this.x + this.velocity.x * deltaTime;
        let newY = this.y + this.velocity.y * deltaTime;
        
        // Prevent enemy from touching safe zone border ONLY when player is in the safe zone
        if (arena && arena.getSafeZoneStatus().inSafeZone && arena.getSafeZoneStatus().available) {
            // Check if enemy would be too close to safe zone border
            const center = arena.getCenter();
            const dx = newX - center.x;
            const dy = newY - center.y;
            const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
            const minDistanceFromBorder = arena.safeZoneRadius + this.radius + 5;
            
            if (distanceToCenter < minDistanceFromBorder) {
                // Push enemy away from safe zone border to maintain buffer
                if (distanceToCenter > 0) {
                    newX = center.x + (dx / distanceToCenter) * minDistanceFromBorder;
                    newY = center.y + (dy / distanceToCenter) * minDistanceFromBorder;
                }
            }
        }
        
        // Update position
        this.x = newX;
        this.y = newY;
          // Keep enemy in arena bounds
        if (arena) {
            const margin = this.radius;
            this.x = Math.max(arena.borderThickness + margin, 
                             Math.min(arena.width - arena.borderThickness - margin, this.x));
            this.y = Math.max(arena.borderThickness + margin, 
                             Math.min(arena.height - arena.borderThickness - margin, this.y));
        }
          // Update flash timer
        if (this.isFlashing) {
            this.flashTimer -= deltaTime;
            if (this.flashTimer <= 0) {
                this.isFlashing = false;
            }
        }
    }
    
    // Move aimlessly when player is protected in safe zone
    moveAimlessly(deltaTime, arena) {
        // Initialize random target if we don't have one or reached current target
        if (!this.aimlessTarget || this.isNearTarget(this.aimlessTarget, 30)) {
            this.generateAimlessTarget(arena);
        }
        
        // Move towards aimless target
        this.targetX = this.aimlessTarget.x;
        this.targetY = this.aimlessTarget.y;
        
        // Calculate direction to target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Move at half speed when aimless
            const aimlessSpeed = this.speed * 0.5;
            this.velocity.x = (dx / distance) * aimlessSpeed;
            this.velocity.y = (dy / distance) * aimlessSpeed;        }
          // Calculate new position
        let newX = this.x + this.velocity.x * deltaTime;
        let newY = this.y + this.velocity.y * deltaTime;
        
        // Prevent enemy from touching safe zone border ONLY when player is in the safe zone
        if (arena && arena.getSafeZoneStatus().inSafeZone && arena.getSafeZoneStatus().available) {
            // Check if enemy would be too close to safe zone border
            const center = arena.getCenter();
            const dx = newX - center.x;
            const dy = newY - center.y;
            const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
            const minDistanceFromBorder = arena.safeZoneRadius + this.radius + 5;
            
            if (distanceToCenter < minDistanceFromBorder) {
                // Push enemy away from safe zone border to maintain buffer
                if (distanceToCenter > 0) {
                    newX = center.x + (dx / distanceToCenter) * minDistanceFromBorder;
                    newY = center.y + (dy / distanceToCenter) * minDistanceFromBorder;
                }
            }
        }
        
        // Update position
        this.x = newX;
        this.y = newY;
        
        // Keep enemy in arena bounds
        if (arena) {
            const margin = this.radius;
            this.x = Math.max(arena.borderThickness + margin, 
                             Math.min(arena.width - arena.borderThickness - margin, this.x));
            this.y = Math.max(arena.borderThickness + margin, 
                             Math.min(arena.height - arena.borderThickness - margin, this.y));
        }
    }    // Generate a random target for aimless movement
    generateAimlessTarget(arena) {
        if (!arena) return;
        
        let attempts = 0;
        const safeZoneStatus = arena.getSafeZoneStatus();
        do {
            this.aimlessTarget = {
                x: arena.borderThickness + 50 + Math.random() * (arena.width - 2 * arena.borderThickness - 100),
                y: arena.borderThickness + 50 + Math.random() * (arena.height - 2 * arena.borderThickness - 100)
            };
            attempts++;
            // Only avoid safe zone if player is in it and zone is available
        } while (arena.isInSafeZone(this.aimlessTarget.x, this.aimlessTarget.y) && 
                 safeZoneStatus.inSafeZone && safeZoneStatus.available && attempts < 10);
    }
    
    // Check if we're near a target
    isNearTarget(target, threshold) {
        if (!target) return true;
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < threshold;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        this.isFlashing = true;
        this.flashTimer = 0.1; // Flash for 0.1 seconds
        
        if (this.health <= 0) {
            this.active = false;
            return this.points; // Return points for killing this enemy
        }
        return 0;
    }
    
    // Check collision with a point (like a bullet)
    checkCollision(x, y, radius = 0) {
        const dx = x - this.x;
        const dy = y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= (this.radius + radius);
    }
    
    // Check collision with player
    checkPlayerCollision(player) {
        return this.checkCollision(player.x, player.y, player.radius);
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // Choose color based on flash state
        const currentColor = this.isFlashing ? '#ffffff' : this.color;
        const currentGlow = this.isFlashing ? '#ffffff' : this.glowColor;
        
        // Draw glow effect
        ctx.shadowColor = currentGlow;
        ctx.shadowBlur = 15;
        
        // Draw enemy body
        ctx.fillStyle = currentColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Draw health bar if damaged
        if (this.health < this.maxHealth) {
            this.drawHealthBar(ctx);
        }
        
        // Draw type-specific features
        this.drawTypeFeatures(ctx);
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const barY = this.y - this.radius - 8;
        
        // Background
        ctx.fillStyle = '#444444';
        ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
          // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#00ff00' : '#ff0000';
        ctx.fillRect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
    }
      drawTypeFeatures(ctx) {
        switch (this.type) {
            case 'datawisp':
                // Draw wispy trail effect
                ctx.strokeStyle = this.isFlashing ? '#ffffff' : '#ff6666';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.5;
                
                // Draw some wispy lines
                for (let i = 0; i < 3; i++) {
                    const angle = (Date.now() / 1000 + i * Math.PI * 2 / 3) % (Math.PI * 2);
                    const trailLength = 8;
                    const startX = this.x + Math.cos(angle) * (this.radius - 2);
                    const startY = this.y + Math.sin(angle) * (this.radius - 2);
                    const endX = startX + Math.cos(angle + Math.PI) * trailLength;
                    const endY = startY + Math.sin(angle + Math.PI) * trailLength;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
                
                ctx.globalAlpha = 1.0;
                break;
                
            case 'bitbug':
                // Draw aggressive spike features
                ctx.strokeStyle = this.isFlashing ? '#ffffff' : this.color;
                ctx.lineWidth = this.isDashing ? 3 : 2;
                ctx.globalAlpha = this.isDashing ? 1.0 : 0.8;
                
                // Draw spikes around the bug
                const spikeCount = 6;
                const spikeLength = this.isDashing ? 8 : 5;
                
                for (let i = 0; i < spikeCount; i++) {
                    const angle = (i / spikeCount) * Math.PI * 2;
                    const startX = this.x + Math.cos(angle) * this.radius;
                    const startY = this.y + Math.sin(angle) * this.radius;
                    const endX = startX + Math.cos(angle) * spikeLength;
                    const endY = startY + Math.sin(angle) * spikeLength;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }                  // Add pulsing effect when dashing
                if (this.isDashing) {
                    ctx.fillStyle = 'rgba(255, 102, 0, 0.3)';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.globalAlpha = 1.0;
                break;
            case 'memoryleech':
                // Draw energy drain effect
                if (this.isDraining) {
                    // Draw drain beam effect
                    ctx.strokeStyle = 'rgba(138, 43, 226, 0.6)';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 5]);
                    
                    // Draw pulsing beam to show draining
                    const pulseIntensity = 0.5 + 0.5 * Math.sin(this.pulseTimer * 8);
                    ctx.globalAlpha = pulseIntensity;
                    
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.drainRange, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    ctx.setLineDash([]);
                }
                
                // Draw tentacle-like appendages
                ctx.strokeStyle = this.isFlashing ? '#ffffff' : '#9932cc';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.7;
                
                const tentacleCount = 4;
                for (let i = 0; i < tentacleCount; i++) {
                    const angle = (i / tentacleCount) * Math.PI * 2 + this.pulseTimer;
                    const wave = Math.sin(this.pulseTimer * 3 + i) * 3;
                    const tentacleLength = 12 + wave;
                    
                    const startX = this.x + Math.cos(angle) * this.radius;
                    const startY = this.y + Math.sin(angle) * this.radius;
                    
                    // Create wavy tentacle
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    
                    for (let j = 1; j <= 3; j++) {
                        const segmentAngle = angle + Math.sin(this.pulseTimer * 2 + j) * 0.3;
                        const segmentX = startX + Math.cos(segmentAngle) * (tentacleLength * j / 3);
                        const segmentY = startY + Math.sin(segmentAngle) * (tentacleLength * j / 3);
                        ctx.lineTo(segmentX, segmentY);
                    }
                    
                    ctx.stroke();
                }
                
                // Draw pulsing core when draining
                if (this.isDraining) {
                    const pulseSize = 3 + 2 * Math.sin(this.pulseTimer * 6);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.globalAlpha = 1.0;
                break;
        }
    }
    
    updateTypeBehavior(deltaTime, player) {
        switch (this.type) {
            case 'bitbug':
                // Update aggression timer
                this.aggressionTimer += deltaTime;
                
                // Calculate distance to player
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
                
                // Trigger dash when close enough and cooldown is ready
                if (!this.isDashing && this.aggressionTimer >= this.dashCooldown && distanceToPlayer < 150) {
                    this.isDashing = true;
                    this.aggressionTimer = 0;
                    
                    // Dash lasts for a short time
                    setTimeout(() => {
                        this.isDashing = false;                    }, 400); // 0.4 seconds of dashing
                }
                break;
            case 'memoryleech':
                // Update pulse timer for visual effect
                this.pulseTimer += deltaTime;
                
                // Calculate distance to player
                const dx2 = player.x - this.x;
                const dy2 = player.y - this.y;
                const distanceToPlayer2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                
                // Drain player energy if in range
                if (distanceToPlayer2 <= this.drainRange) {
                    this.isDraining = true;
                    // Reduce player's dash cooldown recovery rate
                    if (player.dashCooldownTimer > 0) {
                        player.dashCooldownTimer += this.drainRate * deltaTime;
                    }
                    // Reduce overclock charge
                    if (player.overclockCharge > 0) {
                        player.overclockCharge = Math.max(0, player.overclockCharge - this.drainRate * deltaTime * 10);
                    }
                } else {
                    this.isDraining = false;
                }
                break;
        }
    }
}
