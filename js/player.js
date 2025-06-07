class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 200; // pixels per second
        
        // Visual properties
        this.color = '#00ffff';
        this.aimDirection = 0; // angle in radians
        
        // Movement smoothing
        this.velocity = { x: 0, y: 0 };
        this.friction = 0.85;
        
        // Weapon system
        this.weapon = new Weapon();
        this.bullets = [];
        
        // Health system
        this.health = 100;
        this.maxHealth = 100;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.invulnerabilityDuration = 1.0; // seconds
          // Visual effects
        this.flashTimer = 0;
        this.isFlashing = false;
        this.damageColor = '#ff0000';
        
        // Dash system
        this.dashSpeed = 600; // pixels per second during dash
        this.dashDuration = 0.2; // seconds
        this.dashCooldown = 2.0; // seconds between dashes
        this.dashTimer = 0; // current dash time
        this.dashCooldownTimer = 0; // cooldown remaining
        this.isDashing = false;
        this.dashDirection = { x: 0, y: 0 };
        this.dashTrail = []; // For visual trail effect
    }    update(deltaTime, input, arena) {
        // Update dash cooldown
        if (this.dashCooldownTimer > 0) {
            this.dashCooldownTimer -= deltaTime;
        }
        
        // Handle dash input (Space key)
        if (input.isKeyPressed('Space') && this.canDash()) {
            this.startDash(input);
        }
        
        // Update dash state
        this.updateDash(deltaTime);
        
        // Get movement input (disabled during dash)
        if (!this.isDashing) {
            const movement = input.getMovementVector();
            
            // Apply movement with acceleration
            const acceleration = 800; // pixels per second squared
            this.velocity.x += movement.x * acceleration * deltaTime;
            this.velocity.y += movement.y * acceleration * deltaTime;
            
            // Apply friction
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            
            // Cap velocity
            const maxSpeed = this.speed;
            const currentSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
            if (currentSpeed > maxSpeed) {
                this.velocity.x = (this.velocity.x / currentSpeed) * maxSpeed;
                this.velocity.y = (this.velocity.y / currentSpeed) * maxSpeed;
            }
        }
        
        // Update position
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        // Keep player in arena bounds
        if (arena) {
            const margin = this.radius;
            this.x = Math.max(arena.borderThickness + margin, 
                             Math.min(arena.width - arena.borderThickness - margin, this.x));
            this.y = Math.max(arena.borderThickness + margin, 
                             Math.min(arena.height - arena.borderThickness - margin, this.y));
        } else {
            // Fallback to canvas bounds
            const canvas = document.getElementById('gameCanvas');
            this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        }
        
        // Update dash trail
        this.updateDashTrail();
        
        // Update aim direction based on mouse position
        this.aimDirection = Math.atan2(input.mouse.y - this.y, input.mouse.x - this.x);
          // Handle shooting
        if (input.mouse.isDown) {
            this.shoot();
        }
        
        // Update bullets
        this.updateBullets(deltaTime);
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTimer -= deltaTime;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Update flash timer
        if (this.isFlashing) {
            this.flashTimer -= deltaTime;
            if (this.flashTimer <= 0) {
                this.isFlashing = false;
            }        }
    }
    
    // Dash system methods
    canDash() {
        return !this.isDashing && this.dashCooldownTimer <= 0;
    }
    
    startDash(input) {
        // Get dash direction from current movement input or aim direction
        const movement = input.getMovementVector();
        
        if (movement.x !== 0 || movement.y !== 0) {
            // Dash in movement direction
            this.dashDirection.x = movement.x;
            this.dashDirection.y = movement.y;
        } else {
            // Dash in aim direction if no movement input
            this.dashDirection.x = Math.cos(this.aimDirection);
            this.dashDirection.y = Math.sin(this.aimDirection);
        }
        
        // Normalize dash direction
        const magnitude = Math.sqrt(this.dashDirection.x ** 2 + this.dashDirection.y ** 2);
        if (magnitude > 0) {
            this.dashDirection.x /= magnitude;
            this.dashDirection.y /= magnitude;
        }
        
        // Start dash
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldownTimer = this.dashCooldown;
        
        // Set dash velocity
        this.velocity.x = this.dashDirection.x * this.dashSpeed;
        this.velocity.y = this.dashDirection.y * this.dashSpeed;
        
        console.log('Dash activated!');
    }
    
    updateDash(deltaTime) {
        if (!this.isDashing) return;
        
        this.dashTimer -= deltaTime;
        
        if (this.dashTimer <= 0) {
            // End dash
            this.isDashing = false;
            this.dashTimer = 0;
            
            // Reduce velocity after dash
            this.velocity.x *= 0.3;
            this.velocity.y *= 0.3;
        } else {
            // Maintain dash velocity during dash
            this.velocity.x = this.dashDirection.x * this.dashSpeed;
            this.velocity.y = this.dashDirection.y * this.dashSpeed;
        }
    }
    
    updateDashTrail() {
        // Add current position to trail during dash
        if (this.isDashing) {
            this.dashTrail.unshift({ x: this.x, y: this.y, alpha: 1.0 });
            
            // Limit trail length
            if (this.dashTrail.length > 8) {
                this.dashTrail.pop();
            }
        }
        
        // Update trail alpha values
        for (let i = 0; i < this.dashTrail.length; i++) {
            this.dashTrail[i].alpha -= 0.15;
            if (this.dashTrail[i].alpha <= 0) {
                this.dashTrail.splice(i, 1);
                i--;
            }
        }
    }
    
    shoot() {
        const currentTime = Date.now();
        const bullet = this.weapon.shoot(this.x, this.y, this.aimDirection, currentTime);
        if (bullet) {
            this.bullets.push(bullet);
        }
    }
    
    updateBullets(deltaTime) {
        // Update all bullets
        for (let bullet of this.bullets) {
            bullet.update(deltaTime);
        }
        
        // Remove inactive bullets
        this.bullets = this.bullets.filter(bullet => bullet.active);
    }
    
    takeDamage(damage) {
        if (this.invulnerable) return false;
        
        this.health -= damage;
        this.health = Math.max(0, this.health); // Don't go below 0
        
        // Start invulnerability period
        this.invulnerable = true;
        this.invulnerabilityTimer = this.invulnerabilityDuration;
        
        // Start flash effect
        this.isFlashing = true;
        this.flashTimer = 0.2; // Flash for 0.2 seconds
        
        console.log(`Player took ${damage} damage! Health: ${this.health}/${this.maxHealth}`);
        
        return this.health <= 0; // Return true if player died
    }
    
    heal(amount) {
        this.health += amount;
        this.health = Math.min(this.maxHealth, this.health); // Don't exceed max health
    }
    
    isDead() {
        return this.health <= 0;
    }
      render(ctx) {
        // Draw dash trail first (behind player)
        this.renderDashTrail(ctx);
        
        // Choose color based on state
        let currentColor = this.color;
        if (this.isFlashing) {
            currentColor = this.damageColor;
        } else if (this.invulnerable) {
            // Flicker effect during invulnerability
            const flickerRate = 10; // flickers per second
            const flickerTime = Date.now() / 1000;
            if (Math.floor(flickerTime * flickerRate) % 2 === 0) {
                currentColor = '#ffffff';
            }
        } else if (this.isDashing) {
            // Special dash color with glow
            currentColor = '#ffffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
        }
        
        // Draw player body
        ctx.fillStyle = currentColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
          // Reset shadow
        ctx.shadowBlur = 0;
        
        // Draw aim indicator
        const aimLength = 25;
        const aimEndX = this.x + Math.cos(this.aimDirection) * aimLength;
        const aimEndY = this.y + Math.sin(this.aimDirection) * aimLength;
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(aimEndX, aimEndY);
        ctx.stroke();
        
        // Draw a small dot at the aim end
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(aimEndX, aimEndY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Render bullets
        for (let bullet of this.bullets) {
            bullet.render(ctx);
        }
    }
    
    renderDashTrail(ctx) {
        if (this.dashTrail.length === 0) return;
        
        // Draw trail segments
        for (let i = 0; i < this.dashTrail.length; i++) {
            const trail = this.dashTrail[i];
            const size = this.radius * (0.3 + trail.alpha * 0.7); // Shrinking trail
            
            ctx.globalAlpha = trail.alpha * 0.6;
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0; // Reset alpha
    }
}
