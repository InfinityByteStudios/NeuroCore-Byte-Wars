class UI {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // UI colors - enhanced cyberpunk theme
        this.primaryColor = '#00ffff';
        this.secondaryColor = '#ffffff';
        this.accentColor = '#ff6600';
        this.healthColor = '#00ff00';
        this.healthLowColor = '#ffff00';
        this.healthCriticalColor = '#ff0000';
        this.backgroundColor = '#000000';
        this.borderColor = '#004466';
        this.panelColor = 'rgba(0, 68, 102, 0.3)';
        
        // Animation properties
        this.scoreFlashTimer = 0;
        this.killFlashTimer = 0;
    }
      render(ctx, gameData) {
        this.updateFlashTimers(gameData);
        this.drawHealthBar(ctx, gameData.player);
        this.drawDashIndicator(ctx, gameData.player);
        this.drawStatsPanel(ctx, gameData.score, gameData.kills);
        this.drawGameInfo(ctx, gameData);
        this.drawMiniMap(ctx, gameData);
    }
    
    updateFlashTimers(gameData) {
        // Update flash timers for visual feedback
        if (this.scoreFlashTimer > 0) this.scoreFlashTimer -= 0.016; // Assuming 60fps
        if (this.killFlashTimer > 0) this.killFlashTimer -= 0.016;
    }
    
    drawHealthBar(ctx, player) {
        const barWidth = 250;
        const barHeight = 24;
        const barX = 20;
        const barY = 20;
        
        // Health panel background with glow
        ctx.fillStyle = this.panelColor;
        ctx.fillRect(barX - 8, barY - 8, barWidth + 16, barHeight + 24);
        
        // Health bar border with cyberpunk glow
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.primaryColor;
        ctx.shadowBlur = 8;
        ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        ctx.shadowBlur = 0;
        
        // Health bar background (inner)
        ctx.fillStyle = '#111111';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health bar fill with gradient
        const healthPercent = player.health / player.maxHealth;
        let healthColor = this.healthColor;
        
        if (healthPercent <= 0.25) {
            healthColor = this.healthCriticalColor;
        } else if (healthPercent <= 0.5) {
            healthColor = this.healthLowColor;
        }
        
        const healthWidth = barWidth * healthPercent;
        
        // Create gradient for health bar
        const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
        gradient.addColorStop(0, healthColor);
        gradient.addColorStop(1, this.darkenColor(healthColor, 0.3));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, healthWidth, barHeight);
        
        // Health text with better positioning
        ctx.fillStyle = this.secondaryColor;
        ctx.font = 'bold 14px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`${player.health}/${player.maxHealth}`, barX + barWidth/2, barY + barHeight/2 + 5);
        
        // Health label with cyberpunk styling
        ctx.fillStyle = this.primaryColor;
        ctx.font = 'bold 12px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('◤ NEURAL INTEGRITY ◥', barX, barY - 12);
        
        // Critical health warning
        if (healthPercent <= 0.25) {
            ctx.fillStyle = this.healthCriticalColor;
            ctx.font = 'bold 10px Courier New';
            const warningY = barY + barHeight + 15;
            ctx.fillText('⚠ CRITICAL DAMAGE ⚠', barX, warningY);
        }
        
        // Invulnerability indicator with improved styling
        if (player.invulnerable) {
            ctx.fillStyle = this.accentColor;
            ctx.font = 'bold 11px Courier New';
            ctx.fillText('◦ SHIELD ACTIVE ◦', barX + barWidth + 15, barY + 15);        }
    }
    
    drawDashIndicator(ctx, player) {
        const indicatorX = 20;
        const indicatorY = 60;
        const indicatorWidth = 150;
        const indicatorHeight = 15;
        
        // Dash indicator background
        ctx.fillStyle = this.panelColor;
        ctx.fillRect(indicatorX - 4, indicatorY - 4, indicatorWidth + 8, indicatorHeight + 8);
        
        // Border
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(indicatorX - 4, indicatorY - 4, indicatorWidth + 8, indicatorHeight + 8);
        
        // Background bar
        ctx.fillStyle = '#111111';
        ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
        
        // Dash status
        if (player.isDashing) {
            // Show dash active
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
            
            ctx.fillStyle = this.primaryColor;
            ctx.font = 'bold 10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('DASH ACTIVE', indicatorX + indicatorWidth/2, indicatorY + indicatorHeight/2 + 3);
        } else if (player.dashCooldownTimer > 0) {
            // Show cooldown progress
            const cooldownPercent = 1 - (player.dashCooldownTimer / player.dashCooldown);
            const progressWidth = indicatorWidth * cooldownPercent;
            
            ctx.fillStyle = this.accentColor;
            ctx.fillRect(indicatorX, indicatorY, progressWidth, indicatorHeight);
            
            ctx.fillStyle = this.secondaryColor;
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(`DASH: ${player.dashCooldownTimer.toFixed(1)}s`, indicatorX + indicatorWidth/2, indicatorY + indicatorHeight/2 + 3);
        } else {
            // Dash ready
            ctx.fillStyle = this.healthColor;
            ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
            
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('DASH READY [SPACE]', indicatorX + indicatorWidth/2, indicatorY + indicatorHeight/2 + 3);
        }
        
        // Label
        ctx.fillStyle = this.primaryColor;
        ctx.font = '10px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('◤ MOBILITY CORE ◥', indicatorX, indicatorY - 8);
    }
    
    drawStatsPanel(ctx, score, kills) {
        const panelX = this.width - 180;
        const panelY = 15;
        const panelWidth = 160;
        const panelHeight = 80;
        
        // Stats panel background
        ctx.fillStyle = this.panelColor;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Panel border
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Score display with flash effect
        const scoreColor = this.scoreFlashTimer > 0 ? this.accentColor : this.primaryColor;
        ctx.fillStyle = scoreColor;
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'right';
        ctx.fillText(`SCORE: ${score.toLocaleString()}`, panelX + panelWidth - 10, panelY + 25);
        
        // Kills display with flash effect
        const killColor = this.killFlashTimer > 0 ? this.accentColor : this.secondaryColor;
        ctx.fillStyle = killColor;
        ctx.font = 'bold 14px Courier New';
        ctx.fillText(`KILLS: ${kills}`, panelX + panelWidth - 10, panelY + 45);
        
        // Stats label
        ctx.fillStyle = this.primaryColor;
        ctx.font = '10px Courier New';
        ctx.fillText('◤ COMBAT STATS ◥', panelX + panelWidth - 10, panelY + 65);
    }
    
    drawGameInfo(ctx, gameData) {
        const infoX = this.width - 180;
        const infoY = 110;
        
        // Info panel background
        ctx.fillStyle = this.panelColor;
        ctx.fillRect(infoX, infoY, 160, 60);
        
        // Panel border
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(infoX, infoY, 160, 60);
        
        ctx.fillStyle = this.secondaryColor;
        ctx.font = '12px Courier New';
        ctx.textAlign = 'right';
        
        // Enemy count with threat indicator
        const enemyCount = gameData.enemyCount;
        const threatLevel = enemyCount >= 5 ? 'HIGH' : enemyCount >= 3 ? 'MED' : 'LOW';
        const threatColor = enemyCount >= 5 ? this.healthCriticalColor : 
                           enemyCount >= 3 ? this.healthLowColor : this.healthColor;
        
        ctx.fillStyle = threatColor;
        ctx.fillText(`THREATS: ${enemyCount} [${threatLevel}]`, infoX + 150, infoY + 20);
        
        // Wave info
        ctx.fillStyle = this.secondaryColor;
        ctx.fillText(`SECTOR: 01`, infoX + 150, infoY + 35);
        ctx.fillText(`WAVE: ENDLESS`, infoX + 150, infoY + 50);
        
        // Game status
        if (gameData.player.isDead()) {
            this.drawGameOver(ctx, gameData.score, gameData.kills);
        }
    }
    
    drawMiniMap(ctx, gameData) {
        const mapSize = 120;
        const mapX = 20;
        const mapY = this.height - mapSize - 20;
        
        // Mini-map background
        ctx.fillStyle = this.panelColor;
        ctx.fillRect(mapX, mapY, mapSize, mapSize);
        
        // Mini-map border
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(mapX, mapY, mapSize, mapSize);
        
        // Arena representation
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(mapX + 5, mapY + 5, mapSize - 10, mapSize - 10);
        
        // Player dot
        const playerMapX = mapX + (gameData.player.x / this.width) * mapSize;
        const playerMapY = mapY + (gameData.player.y / this.height) * mapSize;
        
        ctx.fillStyle = this.primaryColor;
        ctx.beginPath();
        ctx.arc(playerMapX, playerMapY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Mini-map label
        ctx.fillStyle = this.primaryColor;
        ctx.font = '10px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('◤ TACTICAL VIEW ◥', mapX, mapY - 5);
    }
    
    drawGameOver(ctx, score, kills) {
        // Semi-transparent overlay with pulse effect
        const alpha = 0.85 + Math.sin(Date.now() / 200) * 0.1;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Game Over panel
        const panelWidth = 400;
        const panelHeight = 200;
        const panelX = (this.width - panelWidth) / 2;
        const panelY = (this.height - panelHeight) / 2;
        
        ctx.fillStyle = this.panelColor;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        ctx.strokeStyle = this.healthCriticalColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Game Over text with glow
        ctx.fillStyle = this.healthCriticalColor;
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.shadowColor = this.healthCriticalColor;
        ctx.shadowBlur = 15;
        ctx.fillText('◤ NEURAL LINK SEVERED ◥', this.width/2, this.height/2 - 30);
        ctx.shadowBlur = 0;
        
        // Final stats
        ctx.fillStyle = this.primaryColor;
        ctx.font = 'bold 18px Courier New';
        ctx.fillText(`FINAL SCORE: ${score.toLocaleString()}`, this.width/2, this.height/2 + 10);
        ctx.fillText(`THREATS ELIMINATED: ${kills}`, this.width/2, this.height/2 + 35);
        
        // Restart instruction
        ctx.fillStyle = this.secondaryColor;
        ctx.font = '14px Courier New';
        ctx.fillText('◦ Press [R] to reinitialize ◦', this.width/2, this.height/2 + 70);
        
        ctx.textAlign = 'left'; // Reset text alignment
    }
    
    // Helper function to darken colors
    darkenColor(color, factor) {
        // Simple color darkening - could be enhanced
        return color.replace(/[0-9a-f]/gi, (match) => {
            const value = parseInt(match, 16);
            const darkened = Math.floor(value * (1 - factor));
            return darkened.toString(16);
        });
    }
    
    // Trigger flash effects when stats change
    triggerScoreFlash() {
        this.scoreFlashTimer = 0.3;
    }
    
    triggerKillFlash() {
        this.killFlashTimer = 0.3;
    }
}
