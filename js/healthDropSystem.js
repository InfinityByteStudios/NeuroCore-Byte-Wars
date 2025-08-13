// Health Drop System for NeuroCore: Byte Wars
class HealthDrop {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.active = true;
        this.healAmount = 20; // Heal 20 HP when collected
        
        // Visual properties
        this.pulseTimer = 0;
        this.pulseSpeed = 4;
        this.glowRadius = 12;
        
        // Lifetime
        this.maxLifetime = 15; // Disappear after 15 seconds
        this.lifetime = 0;
        this.collected = false;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Update pulse animation
        this.pulseTimer += deltaTime * this.pulseSpeed;
        
        // Update lifetime
        this.lifetime += deltaTime;
        if (this.lifetime >= this.maxLifetime) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // Calculate alpha based on remaining lifetime
        const remainingTime = this.maxLifetime - this.lifetime;
        let alpha = 1;
        if (remainingTime < 3) {
            // Start flashing when 3 seconds remain
            alpha = 0.3 + 0.7 * Math.abs(Math.sin(this.lifetime * 6));
        }
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Draw glow effect
        const pulse = Math.sin(this.pulseTimer) * 0.3 + 0.7;
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.glowRadius * pulse
        );
        gradient.addColorStop(0, 'rgba(0, 255, 128, 0.8)');
        gradient.addColorStop(0.7, 'rgba(0, 255, 128, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 128, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            this.x - this.glowRadius * pulse, 
            this.y - this.glowRadius * pulse,
            this.glowRadius * pulse * 2,
            this.glowRadius * pulse * 2
        );
        
        // Draw main health drop (cross symbol)
        ctx.strokeStyle = '#00ff80';
        ctx.fillStyle = '#00ff80';
        ctx.lineWidth = 3;
        
        // Vertical line of cross
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.radius * 0.7);
        ctx.lineTo(this.x, this.y + this.radius * 0.7);
        ctx.stroke();
        
        // Horizontal line of cross
        ctx.beginPath();
        ctx.moveTo(this.x - this.radius * 0.7, this.y);
        ctx.lineTo(this.x + this.radius * 0.7, this.y);
        ctx.stroke();
        
        // Add small circle in center
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // Check collision with player
    checkCollision(player) {
        if (!this.active || this.collected) return false;
        
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < this.radius + player.radius;
    }
    
    // Collect the health drop
    collect() {
        if (this.collected) return 0;
        
        this.collected = true;
        this.active = false;
        return this.healAmount;
    }
}

// Health Drop Manager
class HealthDropManager {
    constructor() {
        this.healthDrops = [];
        this.spawnChance = 0.05; // 5% chance per enemy death in Extreme mode
    }
    
    // Try to spawn a health drop at enemy death location
    trySpawnHealthDrop(x, y, difficultyManager) {
        if (!difficultyManager.areHealthDropsEnabled()) {
            return; // Only spawn on Extreme difficulty
        }
        
        if (Math.random() < this.spawnChance) {
            this.healthDrops.push(new HealthDrop(x, y));
            console.log('💚 Health drop spawned at enemy death location');
        }
    }
    
    update(deltaTime) {
        // Update all health drops
        for (let i = this.healthDrops.length - 1; i >= 0; i--) {
            const drop = this.healthDrops[i];
            drop.update(deltaTime);
            
            // Remove inactive drops
            if (!drop.active) {
                this.healthDrops.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        this.healthDrops.forEach(drop => drop.render(ctx));
    }
    
    // Check collisions with player
    checkCollisions(player) {
        let totalHealing = 0;
        
        for (let i = this.healthDrops.length - 1; i >= 0; i--) {
            const drop = this.healthDrops[i];
            
            if (drop.checkCollision(player)) {
                totalHealing += drop.collect();
                this.healthDrops.splice(i, 1);
            }
        }
        
        return totalHealing;
    }
    
    // Clear all health drops (for game reset)
    clear() {
        this.healthDrops = [];
    }
    
    // Get active health drop count
    getActiveCount() {
        return this.healthDrops.length;
    }
}
