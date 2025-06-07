class UI {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // UI colors
        this.primaryColor = '#00ffff';
        this.secondaryColor = '#ffffff';
        this.healthColor = '#00ff00';
        this.healthLowColor = '#ffff00';
        this.healthCriticalColor = '#ff0000';
        this.backgroundColor = '#000000';
        this.borderColor = '#004466';
    }
    
    render(ctx, gameData) {
        this.drawHealthBar(ctx, gameData.player);
        this.drawScore(ctx, gameData.score, gameData.kills);
        this.drawGameInfo(ctx, gameData);
    }
    
    drawHealthBar(ctx, player) {
        const barWidth = 200;
        const barHeight = 20;
        const barX = 20;
        const barY = 20;
        
        // Health bar background
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // Health bar border
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // Health bar background (inner)
        ctx.fillStyle = '#222222';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health bar fill
        const healthPercent = player.health / player.maxHealth;
        let healthColor = this.healthColor;
        
        if (healthPercent <= 0.25) {
            healthColor = this.healthCriticalColor;
        } else if (healthPercent <= 0.5) {
            healthColor = this.healthLowColor;
        }
        
        const healthWidth = barWidth * healthPercent;
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, healthWidth, barHeight);
        
        // Health text
        ctx.fillStyle = this.secondaryColor;
        ctx.font = '14px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`${player.health}/${player.maxHealth}`, barX + barWidth/2, barY + barHeight/2 + 5);
        
        // Health label
        ctx.fillStyle = this.primaryColor;
        ctx.font = '12px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('HEALTH', barX, barY - 5);
        
        // Invulnerability indicator
        if (player.invulnerable) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = '10px Courier New';
            ctx.fillText('INVULNERABLE', barX + barWidth + 10, barY + 15);
        }
    }
    
    drawScore(ctx, score, kills) {
        const scoreX = this.width - 150;
        const scoreY = 30;
        
        // Score display
        ctx.fillStyle = this.primaryColor;
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'right';
        ctx.fillText(`SCORE: ${score}`, scoreX, scoreY);
        
        // Kills display
        ctx.fillStyle = this.secondaryColor;
        ctx.font = '14px Courier New';
        ctx.fillText(`KILLS: ${kills}`, scoreX, scoreY + 20);
    }
    
    drawGameInfo(ctx, gameData) {
        const infoX = this.width - 150;
        const infoY = 80;
        
        ctx.fillStyle = this.secondaryColor;
        ctx.font = '12px Courier New';
        ctx.textAlign = 'right';
        
        // Enemy count
        ctx.fillText(`ENEMIES: ${gameData.enemyCount}`, infoX, infoY);
        
        // Wave info (placeholder for future)
        ctx.fillText(`WAVE: 1`, infoX, infoY + 15);
        
        // Game status
        if (gameData.player.isDead()) {
            this.drawGameOver(ctx, gameData.score, gameData.kills);
        }
    }
    
    drawGameOver(ctx, score, kills) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Game Over text
        ctx.fillStyle = this.healthCriticalColor;
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.width/2, this.height/2 - 50);
        
        // Final score
        ctx.fillStyle = this.primaryColor;
        ctx.font = 'bold 24px Courier New';
        ctx.fillText(`FINAL SCORE: ${score}`, this.width/2, this.height/2);
        ctx.fillText(`KILLS: ${kills}`, this.width/2, this.height/2 + 30);
        
        // Restart instruction
        ctx.fillStyle = this.secondaryColor;
        ctx.font = '16px Courier New';
        ctx.fillText('Press R to restart', this.width/2, this.height/2 + 80);
        
        ctx.textAlign = 'left'; // Reset text alignment
    }
    
    drawDebugInfo(ctx, gameData) {
        const debugY = this.height - 90;
        
        ctx.fillStyle = this.primaryColor;
        ctx.font = '12px Courier New';
        ctx.textAlign = 'left';
        
        ctx.fillText(`Player: (${Math.round(gameData.player.x)}, ${Math.round(gameData.player.y)})`, 10, debugY);
        ctx.fillText(`Aim: ${Math.round(gameData.player.aimDirection * 180 / Math.PI)}°`, 10, debugY + 15);
        ctx.fillText(`Velocity: (${Math.round(gameData.player.velocity.x)}, ${Math.round(gameData.player.velocity.y)})`, 10, debugY + 30);
        ctx.fillText(`Bullets: ${gameData.player.bullets.length}`, 10, debugY + 45);
        ctx.fillText(`Health: ${gameData.player.health}/${gameData.player.maxHealth}`, 10, debugY + 60);
        ctx.fillText(`Invulnerable: ${gameData.player.invulnerable}`, 10, debugY + 75);
    }
}
