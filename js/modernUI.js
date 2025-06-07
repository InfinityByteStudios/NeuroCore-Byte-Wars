// Modern HTML/CSS UI System for NeuroCore: Byte Wars
class ModernUI {    constructor() {
        // Get all UI elements
        this.elements = {
            // Health system
            healthFill: document.getElementById('healthFill'),
            healthText: document.getElementById('healthText'),
            healthWarning: document.getElementById('healthWarning'),
            shieldIndicator: document.getElementById('shieldIndicator'),            // Overclock system - COMPLETELY DISABLED (elements removed from HTML)
            overclockPanel: null, // document.getElementById('overclockPanel'), 
            overclockLabel: null, // document.getElementById('overclockLabel'),
            overclockText: null, // document.getElementById('overclockText'),
            overclockReady: null, // document.getElementById('overclockReady'),
            overclockEffects: null, // document.getElementById('overclockEffects'),
            // Note: All overclock elements completely removed from HTML to eliminate green bar
              // Dash system
            dashFill: document.getElementById('dashFill'),
            dashText: document.getElementById('dashText'),
            
            // Safe zone system
            safezonePanel: document.getElementById('safezonePanel'),
            safezoneLabel: document.getElementById('safezoneLabel'),
            safezoneBar: document.getElementById('safezoneBar'),
            safezoneFill: document.getElementById('safezoneFill'),
            safezoneText: document.getElementById('safezoneText'),
            safezoneStatus: document.getElementById('safezoneStatus'),
            
            // Stats
            scoreDisplay: document.getElementById('scoreDisplay'),
            killsDisplay: document.getElementById('killsDisplay'),            
            // Wave system
            waveTitle: document.getElementById('waveTitle'),
            waveStatus: document.getElementById('waveStatus'),
            waveProgressFill: document.getElementById('waveProgressFill'),
            waveProgressText: document.getElementById('waveProgressText'),
            waveTimer: document.getElementById('waveTimer'),
            
            // Upgrades system
            upgradesList: document.getElementById('upgradesList'),
            upgradesEmpty: document.getElementById('upgradesEmpty'),
            
            // Mini map
            minimapCanvas: document.getElementById('minimapCanvas'),
            
            // Game over
            gameOverScreen: document.getElementById('gameOverScreen'),
            finalScore: document.getElementById('finalScore'),
            finalKills: document.getElementById('finalKills'),            // Debug
            debugPanel: document.getElementById('debugPanel'),
            debugInfo: document.getElementById('debugInfo'),
            
            // Settings
            settingsButton: document.getElementById('settingsButton'),
            settingsOverlay: document.getElementById('settingsOverlay'),
            settingsClose: document.getElementById('settingsClose'),
            debugToggle: document.getElementById('debugToggle'),
            minimapToggle: document.getElementById('minimapToggle'),
            difficultySelect: document.getElementById('difficultySelect'),
              // Pause overlay
            pauseOverlay: document.getElementById('pauseOverlay'),
            
            // Upgrade system
            upgradeOverlay: document.getElementById('upgradeOverlay'),
            upgradeChoices: document.getElementById('upgradeChoices')        };
        
        // UI state
        this.changelogVisible = false;
        this.settingsVisible = false;
        this.upgradeVisible = false;
        
        // Get changelog element
        this.changelogOverlay = document.getElementById('changelogOverlay');
        
        // Setup settings event listeners
        this.setupSettingsListeners();
        
        // Initialize minimap context
        this.minimapCtx = this.elements.minimapCanvas.getContext('2d');
        
        // Animation state
        this.scoreFlashTimer = 0;
        this.killFlashTimer = 0;
    }    update(deltaTime, gameData) {
        this.updateFlashTimers(deltaTime);
        this.updateHealth(gameData.player);
        this.updateOverclock(gameData.player);
        this.updateDash(gameData.player);        this.updateSafeZone(gameData.arena);
        this.updateStats(gameData.score, gameData.kills);        
        this.updateWave(gameData.enemyManager);
        this.updateUpgrades(gameData.upgradeSystem);
        this.updateMiniMap(gameData);
        
        // Sync settings with game state
        this.updateSettingsState(gameData);
        
        // Update pause overlay
        if (gameData.paused && !this.changelogVisible && !this.settingsVisible) {
            this.showPauseOverlay();
        } else {
            this.hidePauseOverlay();
        }
        
        // Update game over screen
        if (gameData.gameOver) {
            this.showGameOver(gameData.score, gameData.kills);
        } else {
            this.hideGameOver();
        }
    }
    
    updateFlashTimers(deltaTime) {
        if (this.scoreFlashTimer > 0) {
            this.scoreFlashTimer -= deltaTime;
            if (this.scoreFlashTimer <= 0) {
                this.elements.scoreDisplay.classList.remove('flash');
            }
        }
        
        if (this.killFlashTimer > 0) {
            this.killFlashTimer -= deltaTime;
            if (this.killFlashTimer <= 0) {
                this.elements.killsDisplay.classList.remove('flash');
            }
        }
    }
    
    updateHealth(player) {
        const healthPercent = player.health / player.maxHealth;
        
        // Update health bar fill
        this.elements.healthFill.style.width = `${healthPercent * 100}%`;
        this.elements.healthText.textContent = `${player.health}/${player.maxHealth}`;
        
        // Update health bar color based on health level
        this.elements.healthFill.className = 'health-fill';
        if (healthPercent <= 0.25) {
            this.elements.healthFill.classList.add('critical');
            this.elements.healthWarning.style.display = 'block';
        } else {
            this.elements.healthWarning.style.display = 'none';
            if (healthPercent <= 0.5) {
                this.elements.healthFill.classList.add('low');
            }
        }
        
        // Update shield indicator
        if (player.invulnerable) {
            this.elements.shieldIndicator.style.display = 'block';
        } else {
            this.elements.shieldIndicator.style.display = 'none';
        }
    }    updateOverclock(player) {
        // Overclock UI completely disabled - no visual elements exist
        // The overclock system still functions in the background
        // Players can still use Q to activate overclock when charged
        return;
    }
      updateDash(player) {
        const fill = this.elements.dashFill;
        const text = this.elements.dashText;
        
        if (player.isDashing) {
            fill.className = 'dash-fill active';
            text.textContent = 'DASH ACTIVE';
        } else if (player.dashCooldownTimer > 0) {
            const cooldownPercent = 1 - (player.dashCooldownTimer / player.dashCooldown);
            fill.style.width = `${cooldownPercent * 100}%`;
            fill.className = 'dash-fill cooldown';
            text.textContent = `DASH: ${player.dashCooldownTimer.toFixed(1)}s`;
        } else {
            fill.className = 'dash-fill ready';
            text.textContent = 'DASH READY';
        }
    }
    
    updateSafeZone(arena) {
        if (!arena) return;
        
        const status = arena.getSafeZoneStatus();
        const panel = this.elements.safezonePanel;
        const label = this.elements.safezoneLabel;
        const bar = this.elements.safezoneBar;
        const fill = this.elements.safezoneFill;
        const text = this.elements.safezoneText;
        const statusDiv = this.elements.safezoneStatus;
        
        // Reset all classes
        panel.className = 'safezone-panel';
        label.className = 'safezone-label';
        bar.className = 'safezone-bar';
        fill.className = 'safezone-fill';
        
        if (!status.available) {
            // Cooldown state
            panel.classList.add('cooldown');
            label.classList.add('cooldown');
            bar.classList.add('cooldown');
            fill.classList.add('cooldown');
            
            const cooldownPercent = 1 - (status.cooldownRemaining / 60); // 60 is cooldown duration
            fill.style.width = `${cooldownPercent * 100}%`;
            
            label.textContent = '◤ SAFE ZONE COOLDOWN ◥';
            text.textContent = `${Math.ceil(status.cooldownRemaining)}s`;
            statusDiv.textContent = 'Zone unavailable';
            statusDiv.className = 'safezone-status cooldown';
            
        } else if (status.inSafeZone && status.active) {
            // Active protection with warning if time is low
            if (status.timeRemaining < 3) {
                panel.classList.add('warning');
                label.classList.add('warning');
                bar.classList.add('warning');
                fill.classList.add('warning');
            }
            
            const timePercent = status.timeRemaining / status.maxTime;
            fill.style.width = `${timePercent * 100}%`;
            
            label.textContent = '◤ SAFE ZONE ACTIVE ◥';
            text.textContent = `${Math.ceil(status.timeRemaining)}s`;
            statusDiv.textContent = status.timeRemaining < 3 ? 'Warning: Time running out!' : 'Protected from enemies';
            statusDiv.className = status.timeRemaining < 3 ? 'safezone-status warning' : 'safezone-status';
            
        } else {
            // Available state
            const timePercent = status.timeRemaining / status.maxTime;
            fill.style.width = `${timePercent * 100}%`;
            
            label.textContent = '◤ SAFE ZONE ◥';
            text.textContent = 'AVAILABLE';
            
            if (status.inSafeZone) {
                statusDiv.textContent = 'Enter zone for protection';
            } else {
                statusDiv.textContent = `${Math.ceil(status.timeRemaining)}s protection`;
            }
            statusDiv.className = 'safezone-status';
        }
    }
    
    updateStats(score, kills) {
        this.elements.scoreDisplay.textContent = `SCORE: ${score}`;
        this.elements.killsDisplay.textContent = `KILLS: ${kills}`;
    }
      updateMiniMap(gameData) {
        const ctx = this.minimapCtx;
        const canvas = this.elements.minimapCanvas;
        const size = 136;
        
        // Clear minimap
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, size, size);
        
        if (!gameData.arena) return;
        
        // Calculate scale
        const scaleX = size / gameData.arena.width;
        const scaleY = size / gameData.arena.height;
        
        // Draw arena border
        ctx.strokeStyle = '#004466';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 2, size - 4, size - 4);
        
        // Draw player position
        const playerX = gameData.player.x * scaleX;
        const playerY = gameData.player.y * scaleY;
        
        ctx.fillStyle = gameData.player.isOverclocked ? '#ff00ff' : '#00ffff';
        ctx.beginPath();
        ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw enemies if available
        if (gameData.enemies) {
            ctx.fillStyle = '#ff4444';
            for (const enemy of gameData.enemies) {
                if (enemy.active) {
                    const enemyX = enemy.x * scaleX;
                    const enemyY = enemy.y * scaleY;
                    
                    ctx.beginPath();
                    ctx.arc(enemyX, enemyY, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    showGameOver(score, kills) {
        this.elements.finalScore.textContent = `Final Score: ${score}`;
        this.elements.finalKills.textContent = `Enemies Eliminated: ${kills}`;
        this.elements.gameOverScreen.style.display = 'flex';
    }
    
    hideGameOver() {
        this.elements.gameOverScreen.style.display = 'none';
    }
    
    // Changelog functionality
    toggleChangelog() {
        this.changelogVisible = !this.changelogVisible;
        if (this.changelogVisible) {
            this.changelogOverlay.classList.remove('hidden');
        } else {
            this.changelogOverlay.classList.add('hidden');
        }
    }
      hideChangelog() {
        this.changelogVisible = false;
        this.changelogOverlay.classList.add('hidden');
    }
    
    // Pause overlay functionality
    showPauseOverlay() {
        this.elements.pauseOverlay.classList.remove('hidden');
    }
    
    hidePauseOverlay() {
        this.elements.pauseOverlay.classList.add('hidden');
    }
    
    flashScore() {
        this.scoreFlashTimer = 0.5;
        this.elements.scoreDisplay.classList.add('flash');
    }
    
    flashKill() {
        this.killFlashTimer = 0.5;
        this.elements.killsDisplay.classList.add('flash');
    }
    
    toggleDebug(show) {
        if (show) {
            this.elements.debugPanel.classList.remove('hidden');
        } else {
            this.elements.debugPanel.classList.add('hidden');
        }
    }
    
    updateDebugInfo(gameData) {
        if (!this.elements.debugPanel.classList.contains('hidden')) {
            const player = gameData.player;
            const debugText = [
                `Player: (${Math.round(player.x)}, ${Math.round(player.y)})`,
                `Aim: ${Math.round(player.aimDirection * 180 / Math.PI)}°`,
                `Velocity: (${Math.round(player.velocity.x)}, ${Math.round(player.velocity.y)})`,
                `Bullets: ${player.bullets.length}`,
                `Enemies: ${gameData.enemyCount}`,
                `Overclock: ${player.overclockCharge}/${player.overclockMaxCharge}`,
                `Health: ${player.health}/${player.maxHealth}`
            ].join('<br>');
            
            this.elements.debugInfo.innerHTML = debugText;
        }
    }
    
    updateWave(enemyManager) {
        if (!enemyManager) return;
        
        const waveNumber = enemyManager.getCurrentWave();
        const waveState = enemyManager.getWaveState();
        const waveProgress = enemyManager.getWaveProgress();
        const timeUntilNext = enemyManager.getTimeUntilNextWave();
        const remainingEnemies = enemyManager.getRemainingEnemiesInWave();
        
        // Update wave title
        this.elements.waveTitle.textContent = `◤ WAVE ${waveNumber} ◥`;
        
        // Update wave status with styling
        const statusElement = this.elements.waveStatus;
        statusElement.className = `wave-status ${waveState}`;
        
        switch (waveState) {
            case 'preparing':
                statusElement.textContent = 'PREPARING...';
                break;
            case 'spawning':
                statusElement.textContent = 'ENEMIES INCOMING!';
                break;
            case 'active':
                statusElement.textContent = 'CLEAR ALL ENEMIES!';
                break;
            case 'completed':
                statusElement.textContent = 'WAVE CLEARED!';
                break;
        }
        
        // Update progress bar
        const progressPercent = Math.round(waveProgress * 100);
        this.elements.waveProgressFill.style.width = `${progressPercent}%`;
        
        // Update progress text based on state
        if (waveState === 'spawning') {
            const totalEnemies = enemyManager.waveConfig ? enemyManager.waveConfig.enemies.length + enemyManager.enemiesSpawnedThisWave : 0;
            const spawnedEnemies = enemyManager.enemiesSpawnedThisWave;
            this.elements.waveProgressText.textContent = `${spawnedEnemies}/${totalEnemies}`;
        } else if (waveState === 'active') {
            const totalEnemies = enemyManager.waveConfig ? enemyManager.waveConfig.enemies.length + enemyManager.enemiesSpawnedThisWave : 0;
            const defeatedEnemies = Math.round(totalEnemies * waveProgress);
            this.elements.waveProgressText.textContent = `${defeatedEnemies}/${totalEnemies}`;
        } else {
            this.elements.waveProgressText.textContent = `${progressPercent}%`;
        }
        
        // Update timer
        if (timeUntilNext > 0) {
            if (waveState === 'preparing') {
                this.elements.waveTimer.textContent = `Starting in: ${Math.ceil(timeUntilNext)}s`;
            } else if (waveState === 'completed') {
                this.elements.waveTimer.textContent = `Next wave in: ${Math.ceil(timeUntilNext)}s`;
            }
        } else if (waveState === 'active' && remainingEnemies > 0) {
            this.elements.waveTimer.textContent = `Enemies remaining: ${remainingEnemies}`;
        } else {
            this.elements.waveTimer.textContent = '';
        }
    }
    
    updateUpgrades(upgradeSystem) {
        if (!upgradeSystem) return;
        
        const activeUpgrades = upgradeSystem.getActiveUpgradesList();
        const upgradesList = this.elements.upgradesList;
        const upgradesEmpty = this.elements.upgradesEmpty;
        
        // Clear existing upgrades display
        upgradesList.innerHTML = '';
        
        if (activeUpgrades.length === 0) {
            // Show empty state
            upgradesEmpty.style.display = 'block';
            upgradesList.style.display = 'none';
        } else {
            // Hide empty state and show upgrades
            upgradesEmpty.style.display = 'none';
            upgradesList.style.display = 'block';
            
            // Add each active upgrade to the display
            activeUpgrades.forEach(upgrade => {
                const upgradeElement = document.createElement('div');
                upgradeElement.className = 'upgrade-item';
                
                // Create upgrade content with icon, name, and level
                upgradeElement.innerHTML = `
                    <span class="upgrade-icon">${upgrade.icon}</span>
                    <span class="upgrade-name">${upgrade.name}</span>
                    <span class="upgrade-level">Lv.${upgrade.level}</span>
                `;
                
                upgradesList.appendChild(upgradeElement);
            });
        }
    }
    
    // Legacy compatibility methods for canvas-based rendering
    render(ctx, gameData) {
        // This method is called by the game but we handle everything in update()
        // Keep it for compatibility but move logic to update()
        this.update(1/60, gameData); // Assume 60fps for compatibility
        
        if (gameData.showDebug) {
            this.updateDebugInfo(gameData);
        }
    }
    
    drawDebugInfo(ctx, gameData) {
        // Legacy method - now handled by updateDebugInfo
        this.updateDebugInfo(gameData);
    }
    
    setupSettingsListeners() {
        // Settings button click
        this.elements.settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSettings();
        });
        
        // Settings close button
        this.elements.settingsClose.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hideSettings();
        });
        
        // Click outside to close
        this.elements.settingsOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsOverlay) {
                this.hideSettings();
            }
        });
        
        // Settings controls
        this.elements.debugToggle.addEventListener('change', (e) => {
            // This will be handled by the game's input system
            console.log('Debug toggle:', e.target.checked);
        });
        
        this.elements.minimapToggle.addEventListener('change', (e) => {
            // Toggle minimap visibility
            const minimap = document.querySelector('.minimap-container');
            if (minimap) {
                minimap.style.display = e.target.checked ? 'block' : 'none';
            }
        });
        
        this.elements.difficultySelect.addEventListener('change', (e) => {
            console.log('Difficulty changed to:', e.target.value);
            // This could be used to adjust enemy spawn rates, damage, etc.
        });
    }

    // Settings functionality
    toggleSettings() {
        this.settingsVisible = !this.settingsVisible;
        if (this.settingsVisible) {
            this.showSettings();
        } else {
            this.hideSettings();
        }
    }
    
    showSettings() {
        this.settingsVisible = true;
        this.elements.settingsOverlay.classList.remove('hidden');
    }
    
    hideSettings() {
        this.settingsVisible = false;
        this.elements.settingsOverlay.classList.add('hidden');
    }
    
    updateSettingsState(gameData) {
        // Sync debug toggle with actual debug state
        if (this.elements.debugToggle.checked !== gameData.showDebug) {
            this.elements.debugToggle.checked = gameData.showDebug;
        }
    }
    
    // Upgrade system functionality
    showUpgradeMenu(upgradeChoices) {
        this.upgradeVisible = true;
        this.populateUpgradeChoices(upgradeChoices);
        this.elements.upgradeOverlay.classList.remove('hidden');
    }
    
    hideUpgradeMenu() {
        this.upgradeVisible = false;
        this.elements.upgradeOverlay.classList.add('hidden');
    }
    
    populateUpgradeChoices(choices) {
        const container = this.elements.upgradeChoices;
        container.innerHTML = '';
        
        choices.forEach((upgrade, index) => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'upgrade-choice';
            choiceElement.dataset.upgradeId = upgrade.id;
            
            const nextLevel = upgrade.currentLevel + 1;
            const levelText = nextLevel > 1 ? `Level ${nextLevel}` : 'New';
            
            choiceElement.innerHTML = `
                <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-description">${upgrade.description}</div>
                <div class="upgrade-level">${levelText}</div>
            `;
            
            // Add click event listener
            choiceElement.addEventListener('click', () => {
                this.selectUpgrade(upgrade.id);
            });
            
            container.appendChild(choiceElement);
        });
    }
    
    selectUpgrade(upgradeId) {
        // Dispatch custom event for game to handle
        const event = new CustomEvent('upgradeSelected', {
            detail: { upgradeId: upgradeId }
        });
        document.dispatchEvent(event);
          this.hideUpgradeMenu();
    }
}
