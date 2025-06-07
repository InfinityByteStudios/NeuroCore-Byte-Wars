class EnemyManager {
    constructor(arena) {
        this.enemies = [];
        this.arena = arena;
        this.spawnTimer = 0;
        this.spawnInterval = 3.0; // seconds between spawns
        this.maxEnemies = 5; // maximum enemies on screen
        this.totalSpawned = 0;
    }
    
    update(deltaTime, player) {
        // Update spawn timer
        this.spawnTimer += deltaTime;
        
        // Spawn new enemies if needed
        if (this.spawnTimer >= this.spawnInterval && 
            this.enemies.filter(e => e.active).length < this.maxEnemies) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
        
        // Update all enemies
        for (let enemy of this.enemies) {
            if (enemy.active) {
                enemy.update(deltaTime, player, this.arena);
            }
        }
        
        // Remove inactive enemies
        this.enemies = this.enemies.filter(enemy => enemy.active);
    }
    
    spawnEnemy() {
        const spawnArea = this.arena.getSafeSpawnArea();
        let spawnX, spawnY;
        let attempts = 0;
        const maxAttempts = 10;
        
        // Try to find a spawn position away from the center ring
        do {
            spawnX = spawnArea.minX + Math.random() * (spawnArea.maxX - spawnArea.minX);
            spawnY = spawnArea.minY + Math.random() * (spawnArea.maxY - spawnArea.minY);
            
            // Check distance from center
            const centerDist = Math.sqrt(
                (spawnX - spawnArea.centerX) ** 2 + 
                (spawnY - spawnArea.centerY) ** 2
            );
            
            if (centerDist > spawnArea.centerExclusionRadius) {
                break;
            }
            
            attempts++;
        } while (attempts < maxAttempts);
        
        // Create new Data Wisp enemy
        const enemy = new Enemy(spawnX, spawnY, 'datawisp');
        this.enemies.push(enemy);
        this.totalSpawned++;
        
        console.log(`Spawned Data Wisp at (${Math.round(spawnX)}, ${Math.round(spawnY)})`);
    }
    
    // Check bullet collisions and return points scored
    checkBulletCollisions(bullets) {
        let pointsScored = 0;
        
        for (let bullet of bullets) {
            if (!bullet.active) continue;
            
            for (let enemy of this.enemies) {
                if (!enemy.active) continue;
                
                if (enemy.checkCollision(bullet.x, bullet.y, bullet.radius)) {
                    bullet.active = false;
                    const points = enemy.takeDamage(10); // Basic weapon damage
                    pointsScored += points;
                    
                    if (points > 0) {
                        console.log(`Data Wisp destroyed! +${points} points`);
                    }
                    break; // Bullet can only hit one enemy
                }
            }
        }
        
        return pointsScored;
    }
    
    // Check player collisions
    checkPlayerCollisions(player) {
        for (let enemy of this.enemies) {
            if (!enemy.active) continue;
            
            if (enemy.checkPlayerCollision(player)) {
                return enemy; // Return the enemy that hit the player
            }
        }
        return null;
    }
    
    render(ctx) {
        for (let enemy of this.enemies) {
            if (enemy.active) {
                enemy.render(ctx);
            }
        }
    }
    
    getActiveEnemyCount() {
        return this.enemies.filter(e => e.active).length;
    }
    
    getTotalSpawned() {
        return this.totalSpawned;
    }
}
