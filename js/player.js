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
    }update(deltaTime, input, arena) {
        // Get movement input
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
        }
        
        // Draw player body
        ctx.fillStyle = currentColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
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
}
