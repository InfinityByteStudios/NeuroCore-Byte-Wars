class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize game systems
        this.arena = new Arena(this.canvas.width, this.canvas.height);
        this.input = new InputManager();
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.enemyManager = new EnemyManager(this.arena);
        this.ui = new UI(this.canvas);
        
        // Game state
        this.score = 0;
        this.kills = 0;
        this.gameOver = false;
        this.showDebug = false; // Toggle with D key
        
        // Game timing
        this.lastTime = 0;
        this.running = true;
        
        this.start();
    }
    
    start() {
        console.log('NeuroCore: Byte Wars - Starting...');
        this.gameLoop(0);
    }
    
    gameLoop(currentTime) {
        if (!this.running) return;
        
        // Calculate delta time in seconds
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Skip first frame (deltaTime would be too large)
        if (deltaTime < 0.1) {
            this.update(deltaTime);
            this.render();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }    update(deltaTime) {
        // Handle input for game controls
        this.handleGameInput();
        
        // Don't update game if game over
        if (this.gameOver) return;
        
        // Update player
        this.player.update(deltaTime, this.input, this.arena);
        
        // Update enemies
        this.enemyManager.update(deltaTime, this.player);
        
        // Check bullet-enemy collisions
        const pointsScored = this.enemyManager.checkBulletCollisions(this.player.bullets);
        if (pointsScored > 0) {
            this.score += pointsScored;
            this.kills++;
        }
        
        // Check player-enemy collisions
        const hitEnemy = this.enemyManager.checkPlayerCollisions(this.player);
        if (hitEnemy) {
            const playerDied = this.player.takeDamage(20); // Enemy contact damage
            if (playerDied) {
                this.gameOver = true;
                console.log('Game Over!');
            }
        }
    }    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render arena
        this.arena.render(this.ctx);
        
        // Render enemies
        this.enemyManager.render(this.ctx);
        
        // Render player
        this.player.render(this.ctx);
        
        // Render UI
        const gameData = {
            player: this.player,
            score: this.score,
            kills: this.kills,
            enemyCount: this.enemyManager.getActiveEnemyCount()
        };
        this.ui.render(this.ctx, gameData);
        
        // Draw debug info if enabled
        if (this.showDebug) {
            this.ui.drawDebugInfo(this.ctx, gameData);
        }
    }
    
    handleGameInput() {
        // Toggle debug display
        if (this.input.isKeyPressed('KeyD')) {
            // Simple toggle - will need debouncing for proper implementation
            // For now, this is just for basic functionality
        }
        
        // Restart game
        if (this.gameOver && this.input.isKeyPressed('KeyR')) {
            this.restartGame();
        }
    }
    
    restartGame() {
        console.log('Restarting game...');
        
        // Reset player
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        
        // Reset enemy manager
        this.enemyManager = new EnemyManager(this.arena);
        
        // Reset game state
        this.score = 0;
        this.kills = 0;
        this.gameOver = false;
    }
    
    drawDebugInfo() {
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '12px Courier New';
        this.ctx.fillText(`Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`, 10, this.canvas.height - 90);
        this.ctx.fillText(`Aim: ${Math.round(this.player.aimDirection * 180 / Math.PI)}°`, 10, this.canvas.height - 75);
        this.ctx.fillText(`Velocity: (${Math.round(this.player.velocity.x)}, ${Math.round(this.player.velocity.y)})`, 10, this.canvas.height - 60);
        this.ctx.fillText(`Bullets: ${this.player.bullets.length}`, 10, this.canvas.height - 45);
        this.ctx.fillText(`Enemies: ${this.enemyManager.getActiveEnemyCount()}`, 10, this.canvas.height - 30);
        this.ctx.fillText(`Score: ${this.score} | Kills: ${this.kills}`, 10, this.canvas.height - 15);
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});
