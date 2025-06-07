class Weapon {
    constructor() {
        this.fireRate = 5; // bullets per second
        this.lastShotTime = 0;
        this.bulletSpeed = 400;
        this.damage = 10;
        this.name = "Basic Blaster";
    }
    
    canShoot(currentTime) {
        const timeSinceLastShot = currentTime - this.lastShotTime;
        return timeSinceLastShot >= (1000 / this.fireRate); // convert to milliseconds
    }
    
    shoot(x, y, direction, currentTime) {
        if (!this.canShoot(currentTime)) {
            return null;
        }
        
        this.lastShotTime = currentTime;
        
        // Create bullet slightly in front of player to avoid collision
        const offsetDistance = 20;
        const bulletX = x + Math.cos(direction) * offsetDistance;
        const bulletY = y + Math.sin(direction) * offsetDistance;
        
        return new Bullet(bulletX, bulletY, direction, this.bulletSpeed);
    }
}
