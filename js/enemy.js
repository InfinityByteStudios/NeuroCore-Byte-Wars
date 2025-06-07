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
    
    setTypeProperties() {
        switch (this.type) {
            case 'datawisp':
                this.radius = 12;
                this.speed = 50; // slow movement
                this.health = 30;
                this.maxHealth = 30;
                this.color = '#ff4444';
                this.glowColor = '#ff6666';
                this.points = 10;
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
    }
    
    update(deltaTime, player, arena) {
        if (!this.active) return;
        
        // Simple AI: move towards player
        this.targetX = player.x;
        this.targetY = player.y;
        
        // Calculate direction to player
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Normalize direction and apply speed
            this.velocity.x = (dx / distance) * this.speed;
            this.velocity.y = (dy / distance) * this.speed;
        }
        
        // Update position
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
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
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
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
        }
    }
}
