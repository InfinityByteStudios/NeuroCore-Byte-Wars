class Bullet {
    constructor(x, y, direction, speed = 400) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = speed;
        this.radius = 3;
        this.color = '#ffff00';
        this.lifetime = 2.0; // seconds
        this.age = 0;
        this.active = true;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Move bullet
        this.x += Math.cos(this.direction) * this.speed * deltaTime;
        this.y += Math.sin(this.direction) * this.speed * deltaTime;
        
        // Update age
        this.age += deltaTime;
        
        // Check bounds and lifetime
        const canvas = document.getElementById('gameCanvas');
        if (this.x < 0 || this.x > canvas.width || 
            this.y < 0 || this.y > canvas.height || 
            this.age >= this.lifetime) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
