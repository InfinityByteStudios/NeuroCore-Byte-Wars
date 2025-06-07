class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set up dynamic canvas resizing
        this.setupCanvasResize();
        
        // Initialize game systems
        this.arena = new Arena(this.canvas.width, this.canvas.height);
        this.input = new InputManager();        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.enemyManager = new EnemyManager(this.arena);
        this.upgradeSystem = new UpgradeSystem(); // Add upgrade system
        this.visualEffects = new VisualEffects(); // Visual effects system
        this.ui = new ModernUI(); // Use the new modern UI system        // Game state
        this.score = 0;
        this.kills = 0;
        this.gameOver = false;
        this.paused = true; // Start paused during splash screenthis.showDebug = false; // Toggle with D key
          // Game timing
        this.lastTime = 0;
        this.running = true;
        this.gameStarted = false; // Track if game has started
        
        // Set up upgrade system event listener
        this.setupUpgradeEventListener();
        
        this.showSplashScreen();
    }    showSplashScreen() {
        // Show studio splash screen for 3 seconds, then transition to game logo
        setTimeout(() => {
            this.showGameLogo();
        }, 3000);
    }    showGameLogo() {
        const studioSplash = document.getElementById('studioSplash');
        const gameSplash = document.getElementById('gameSplash');
        
        if (studioSplash && gameSplash) {
            // Start fading out studio splash
            studioSplash.classList.remove('active');
            studioSplash.classList.add('fade-out');
            
            // Start fading in game logo slightly before studio splash finishes
            setTimeout(() => {
                gameSplash.classList.add('fade-in');
            }, 300);
            
            // Clean up studio splash after it's fully faded
            setTimeout(() => {
                studioSplash.style.display = 'none';
                studioSplash.classList.remove('fade-out');
                
                // Show game logo for 2.5 seconds, then fade to game
                setTimeout(() => {
                    this.startGameFromLogo();
                }, 2500);
            }, 1000);
        } else {
            this.hideSplashScreen();
        }
    }    startGameFromLogo() {
        const gameSplash = document.getElementById('gameSplash');
        const gameContainer = document.getElementById('gameContainer');
        
        if (gameSplash) {
            // Start fading out game logo
            gameSplash.classList.remove('fade-in');
            gameSplash.classList.add('fade-out');
            
            // Start showing game container with fade slightly before logo finishes
            setTimeout(() => {
                if (gameContainer) {
                    gameContainer.style.opacity = '0';
                    gameContainer.style.display = 'block';
                    gameContainer.style.transition = 'opacity 1s ease-in-out';
                    
                    // Fade in game container
                    setTimeout(() => {
                        gameContainer.style.opacity = '1';
                    }, 50);
                }
            }, 300);
            
            // Clean up game splash after fade completes
            setTimeout(() => {
                gameSplash.style.display = 'none';
                gameSplash.classList.remove('fade-out');
                this.start();
            }, 1000);
        } else {
            this.start();
        }
    }hideSplashScreen() {
        // This method is now only used as a fallback if splash elements are missing
        const studioSplash = document.getElementById('studioSplash');
        const gameSplash = document.getElementById('gameSplash');
        
        if (studioSplash) studioSplash.style.display = 'none';
        if (gameSplash) gameSplash.style.display = 'none';
        this.start();
    }start() {
        this.gameStarted = true;
        this.paused = false; // Unpause the game when it starts
        
        // Show the game container if it's not already visible
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer && gameContainer.style.display === 'none') {
            gameContainer.style.display = 'block';
        }
        
        // Ensure canvas is properly sized
        this.setupCanvasResize();
          // Give canvas focus for input
        this.canvas.focus();
        
        // Start the game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
      setupCanvasResize() {
        // Function to resize canvas to fill viewport
        const resizeCanvas = () => {
            const canvas = this.canvas;
            const container = canvas.parentElement;
            
            // Get actual viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Set canvas internal resolution
            canvas.width = viewportWidth;
            canvas.height = viewportHeight;
            
            // Optimize canvas context for performance
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            
            // Update arena dimensions if it exists
            if (this.arena) {
                this.arena.width = viewportWidth;
                this.arena.height = viewportHeight;
            }
            
            // Reposition player to center if it exists
            if (this.player) {
                this.player.x = viewportWidth / 2;
                this.player.y = viewportHeight / 2;            }
        };
        
        // Initial resize
        resizeCanvas();
        
        // Resize on window resize
        window.addEventListener('resize', resizeCanvas);
        
        // Also handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 100); // Small delay to ensure proper dimensions
        });
    }    gameLoop(currentTime) {
        if (!this.running) return;
        
        // Initialize lastTime on first frame
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        // Calculate delta time in seconds
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent huge jumps
        const cappedDeltaTime = Math.min(deltaTime, 0.033); // Cap at ~30 FPS minimum
        
        // Always handle input even when paused (for pause/unpause controls)
        this.handleGameInput();
        
        // Only update game systems if not paused
        if (!this.paused) {
            this.update(cappedDeltaTime);
        }
        
        this.render();
          // Update UI with proper deltaTime
        const gameData = {
            player: this.player,
            score: this.score,
            kills: this.kills,
            enemyCount: this.enemyManager.getActiveEnemyCount(),
            enemyManager: this.enemyManager,
            upgradeSystem: this.upgradeSystem,
            gameOver: this.gameOver,
            paused: this.paused,
            showDebug: this.showDebug,
            arena: this.arena,
            enemies: this.enemyManager.enemies
        };
        this.ui.update(deltaTime, gameData);
          requestAnimationFrame((time) => this.gameLoop(time));
    }
      update(deltaTime) {
        // Don't update game if game over
        if (this.gameOver) return;        // Update player and capture action events for visual effects
        const playerActionEvents = this.player.update(deltaTime, this.input, this.arena);
        
        // Update arena (safe zone timer)
        this.arena.update(deltaTime, this.player.x, this.player.y);
        
        // Trigger visual effects for player actions
        if (playerActionEvents.dashActivated) {
            this.visualEffects.onDashUsed(this.player.x, this.player.y);
        }
        if (playerActionEvents.overclockActivated) {
            this.visualEffects.onOverclockActivated(this.player.x, this.player.y);
        }
        
        // Update enemies
        this.enemyManager.update(deltaTime, this.player);
        
        // Update visual effects
        this.visualEffects.update(deltaTime);
          // Check bullet-enemy collisions
        const collisionResult = this.enemyManager.checkBulletCollisions(this.player.bullets, this.visualEffects);
        if (collisionResult.points > 0) {
            this.score += collisionResult.points;
            this.kills += collisionResult.kills;
            
            // Call player onKill method for each kill (to charge Overclock)
            for (let i = 0; i < collisionResult.kills; i++) {
                this.player.onKill();
            }
            
            // Trigger UI flash effects for visual feedback
            this.ui.flashScore();
            this.ui.flashKill();
        }        // Check player-enemy collisions
        const hitEnemy = this.enemyManager.checkPlayerCollisions(this.player, this.arena);
        if (hitEnemy) {
            const damage = 20; // Enemy contact damage
            const playerDied = this.player.takeDamage(damage);
            
            // Trigger visual effects for player damage
            this.visualEffects.onPlayerHit(this.player.x, this.player.y, damage);
              if (playerDied) {
                this.gameOver = true;
                console.log('Game Over!');
            }
        }
        
        // Check for wave completion to show upgrade menu
        this.checkForWaveCompletion();
    }render() {
        // Apply screen shake offset
        const shakeOffset = this.visualEffects.getScreenShakeOffset();
        this.ctx.save();
        this.ctx.translate(shakeOffset.x, shakeOffset.y);
        
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-shakeOffset.x, -shakeOffset.y, this.canvas.width, this.canvas.height);
        
        // Apply Overclock screen effects
        if (this.player.isOverclocked) {
            this.renderOverclockScreenEffects();
        }
        
        // Render arena
        this.arena.render(this.ctx);
        
        // Render enemies
        this.enemyManager.render(this.ctx);
        
        // Render player
        this.player.render(this.ctx);
        
        // Render visual effects (sparks, damage numbers, etc.)
        this.visualEffects.render(this.ctx);
        
        // Apply final Overclock overlay effects
        if (this.player.isOverclocked) {
            this.renderOverclockOverlay();
        }
        
        // Restore canvas transform
        this.ctx.restore();
    }    handleGameInput() {
        // Don't handle input if game hasn't started yet
        if (!this.gameStarted) {
            return;
        }
        
        // Toggle debug display
        if (this.input.wasKeyPressed('KeyD')) {
            this.showDebug = !this.showDebug;
            this.ui.toggleDebug(this.showDebug);
            // Update settings checkbox if settings are open
            if (this.ui.settingsVisible) {
                this.ui.elements.debugToggle.checked = this.showDebug;
            }
        }
        
        // Close settings with ESC key
        if (this.input.wasKeyPressed('Escape')) {
            if (this.ui.settingsVisible) {
                this.ui.hideSettings();
            }
        }
        
        // Toggle changelog display (pauses game)
        if (this.input.wasKeyPressed('KeyC')) {
            if (this.ui.changelogVisible) {
                // Hide changelog and unpause
                this.ui.hideChangelog();
                this.paused = false;
            } else {
                // Show changelog and pause
                this.ui.toggleChangelog();
                this.paused = true;
            }
        }
        
        // Toggle general pause
        if (this.input.wasKeyPressed('KeyP')) {
            if (this.ui.changelogVisible) {
                // If changelog is open, close it first
                this.ui.hideChangelog();
            }
            this.paused = !this.paused;
        }
        
        // Restart game
        if (this.gameOver && this.input.isKeyPressed('KeyR')) {
            this.restartGame();
        }
    }    restartGame() {
        
        // Reset player
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        
        // Reset enemy manager
        this.enemyManager = new EnemyManager(this.arena);
          // Clear visual effects
        this.visualEffects.clear();
        
        // Reset upgrade system
        this.upgradeSystem.reset();
        
        // Reset game state
        this.score = 0;
        this.kills = 0;
        this.gameOver = false;
    }
    
    renderOverclockScreenEffects() {
        // Background color shift during Overclock
        const time = Date.now() / 1000;
        const intensity = 0.1 + 0.05 * Math.sin(time * 6); // Pulsing intensity
        
        // Apply magenta tint to background
        this.ctx.fillStyle = `rgba(255, 0, 255, ${intensity})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add scanning lines effect
        this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
        this.ctx.lineWidth = 1;
        const lineSpacing = 4;
        const offset = (time * 200) % lineSpacing; // Moving lines
        
        for (let y = -offset; y < this.canvas.height + lineSpacing; y += lineSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    renderOverclockOverlay() {
        // Screen edge glow during Overclock
        const time = Date.now() / 1000;
        const glowIntensity = 0.3 + 0.2 * Math.sin(time * 4);
        
        // Create radial gradient from edges
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
        
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, maxRadius * 0.6,
            centerX, centerY, maxRadius
        );
        
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0)');
        gradient.addColorStop(1, `rgba(255, 0, 255, ${glowIntensity})`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Corner energy flashes
        const corners = [
            { x: 20, y: 20 },
            { x: this.canvas.width - 20, y: 20 },
            { x: 20, y: this.canvas.height - 20 },
            { x: this.canvas.width - 20, y: this.canvas.height - 20 }
        ];
        
        corners.forEach((corner, index) => {
            const flashTime = time * 3 + index * Math.PI / 2;
            const flashIntensity = Math.max(0, Math.sin(flashTime));
            
            if (flashIntensity > 0.7) {
                this.ctx.fillStyle = `rgba(255, 0, 255, ${flashIntensity})`;
                this.ctx.beginPath();
                this.ctx.arc(corner.x, corner.y, 15, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
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
    
    setupUpgradeEventListener() {
        document.addEventListener('upgradeSelected', (event) => {
            this.handleUpgradeSelected(event.detail.upgradeId);
        });
    }
    
    handleUpgradeSelected(upgradeId) {
        console.log(`🔧 Player selected upgrade: ${upgradeId}`);
        
        // Apply the upgrade
        const effects = this.upgradeSystem.applyUpgrade(upgradeId);
        
        // Apply effects to player
        this.applyUpgradeEffectsToPlayer(effects);
        
        // Resume the game
        this.paused = false;
        
        // Continue with next wave
        this.enemyManager.continueAfterUpgrade();
    }
      applyUpgradeEffectsToPlayer(effects) {
        // Apply individual upgrade effects to player
        this.player.applyUpgradeEffects(effects);
        
        console.log(`🎯 Applied upgrade effects:`, effects);
    }
    
    checkForWaveCompletion() {
        const waveState = this.enemyManager.getWaveState();
        
        // Check if wave just completed and we haven't shown upgrade menu yet
        if (waveState === 'completed' && !this.upgradeSystem.shouldShowUpgradeMenu() && !this.paused) {
            const currentWave = this.enemyManager.getCurrentWave();
            
            // Show upgrade menu after every wave (except first preparation)
            if (currentWave > 1) {
                this.showUpgradeMenu();
            }
        }
    }
    
    showUpgradeMenu() {
        console.log('🎮 Showing upgrade menu...');
        
        // Generate upgrade choices
        const choices = this.upgradeSystem.generateUpgradeChoices();
        
        if (choices.length > 0) {
            // Mark that we're showing the upgrade menu
            this.upgradeSystem.setUpgradeMenuVisible(true);
            
            // Pause the game
            this.paused = true;
            
            // Show the upgrade menu in UI
            this.ui.showUpgradeMenu(choices);
        }
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});
