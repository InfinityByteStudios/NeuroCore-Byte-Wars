// Difficulty Manager for NeuroCore: Byte Wars
class DifficultyManager {
    constructor() {
        this.currentDifficulty = 'medium'; // Default difficulty
          // Difficulty configurations based on new specifications
        this.difficulties = {
            easy: {
                name: 'Easy',
                emoji: '🟢',
                playerHealth: 100,  // Updated to 100 as specified
                playerSpeedMultiplier: 1.0,
                enemySpeedMultiplier: 1.0,
                enemyHealthMultiplier: 0.8,
                enemyDamageMultiplier: 0.7,
                overclockChargeMultiplier: 1.5,
                waveEnemyCount: { min: 3, max: 7 },  // 3-7 enemies per wave
                dashCooldownMultiplier: 0.7,
                healingType: 'after_each_wave',  // Heal after each wave
                healingRate: 0,
                upgradeDropMultiplier: 1.3,
                healthDropsEnabled: false  // No health drops
            },
            medium: {
                name: 'Medium',
                emoji: '🟡',
                playerHealth: 100,
                playerSpeedMultiplier: 0.95,
                enemySpeedMultiplier: 1.0,
                enemyHealthMultiplier: 1.0,
                enemyDamageMultiplier: 1.0,
                overclockChargeMultiplier: 1.0,
                waveEnemyCount: { min: 7, max: 10 },  // 7-10 enemies per wave
                dashCooldownMultiplier: 1.0,
                healingType: 'after_every_2_waves',  // Heal after every 2 waves
                healingRate: 0,
                upgradeDropMultiplier: 1.0,
                healthDropsEnabled: false  // No health drops
            },
            hard: {
                name: 'Hard',
                emoji: '🔴',
                playerHealth: 100,
                playerSpeedMultiplier: 0.90,
                enemySpeedMultiplier: 1.0,
                enemyHealthMultiplier: 1.2,
                enemyDamageMultiplier: 1.2,
                overclockChargeMultiplier: 0.7,
                waveEnemyCount: { min: 10, max: 15 },  // 10-15 enemies per wave
                dashCooldownMultiplier: 1.0,
                healingType: 'after_every_3_waves',  // Heal after every 3 waves
                healingRate: 0,                upgradeDropMultiplier: 1.0,
                healthDropsEnabled: false  // No health drops
            },
            extreme: {
                name: 'Extreme',
                emoji: '☠️',
                playerHealth: 100,  // Updated to 100 as specified
                playerSpeedMultiplier: 0.80,
                enemySpeedMultiplier: 1.0,
                enemyHealthMultiplier: 1.5,
                enemyDamageMultiplier: 1.5,
                overclockChargeMultiplier: 0.5,
                waveEnemyCount: { min: 15, max: 25 },  // 15+ enemies per wave
                dashCooldownMultiplier: 1.0,
                healingType: 'never',  // No healing after waves
                healingRate: 0,
                upgradeDropMultiplier: 0.8,
                healthDropsEnabled: true  // Health drops appear (but rare)
            }
        };
        
        // Base enemy damage values from Planning.md
        this.baseEnemyDamage = {
            datawisp: 5,
            bitbug: 10,
            memoryleech: 2,    // Per second while latched
            syntaxbreaker: 8,
            corruptedprotocol: 20, // Average of 15-25 range
            theforked: 15,         // Average of 12-18 range
            neurofork: 27          // Average of 20-35 range
        };
        
        console.log('🎮 Difficulty Manager initialized with default difficulty: medium');
    }
    
    // Set difficulty level
    setDifficulty(difficulty) {
        if (this.difficulties[difficulty]) {
            this.currentDifficulty = difficulty;
            console.log(`🎮 Difficulty set to: ${this.difficulties[difficulty].emoji} ${this.difficulties[difficulty].name}`);
            return true;
        }
        console.warn(`⚠️ Invalid difficulty: ${difficulty}`);
        return false;
    }
    
    // Get current difficulty configuration
    getCurrentDifficulty() {
        return this.difficulties[this.currentDifficulty];
    }
    
    // Get current difficulty name
    getCurrentDifficultyName() {
        return this.currentDifficulty;
    }
    
    // Get all available difficulties for UI
    getAllDifficulties() {
        return Object.keys(this.difficulties).map(key => ({
            key: key,
            name: this.difficulties[key].name,
            emoji: this.difficulties[key].emoji,
            description: this.getDifficultyDescription(key)
        }));
    }
    
    // Get difficulty description
    getDifficultyDescription(difficulty) {
        const config = this.difficulties[difficulty];
        if (!config) return '';
        
        switch (difficulty) {
            case 'easy':
                return 'New/casual players. More health, weaker enemies, healing during waves.';
            case 'medium':
                return 'Standard gameplay. Balanced difficulty, heal after waves.';
            case 'hard':
                return 'Skilled players. Faster, tougher enemies. Heal every 3 waves.';
            case 'extreme':
                return 'Hardcore challenge. Very tough enemies, no healing ever.';
            default:
                return '';
        }
    }
    
    // Apply difficulty modifiers to player stats
    applyPlayerModifiers(player) {
        const config = this.getCurrentDifficulty();
        
        // Set player health based on difficulty
        player.maxHealth = config.playerHealth;
        player.health = config.playerHealth;
        
        // Apply overclock charge multiplier
        player.baseOverclockChargePerKill = Math.round(player.baseOverclockChargePerKill * config.overclockChargeMultiplier);
        player.overclockChargePerKill = player.baseOverclockChargePerKill;
        
        // Apply dash cooldown multiplier
        player.baseDashCooldown = player.baseDashCooldown * config.dashCooldownMultiplier;
        player.dashCooldown = player.baseDashCooldown;
        
        // Apply player speed multiplier
        player.setSpeedMultiplier(config.playerSpeedMultiplier);
        
        console.log(`🎮 Applied ${config.name} difficulty modifiers to player:`, {
            health: player.health,
            speed: Math.round(player.speed),
            speedMultiplier: `${Math.round(config.playerSpeedMultiplier * 100)}%`,
            dashCooldown: player.dashCooldown.toFixed(1),
            overclockCharge: player.overclockChargePerKill
        });
    }
    
    // Apply difficulty modifiers to enemy stats
    applyEnemyModifiers(enemy) {
        const config = this.getCurrentDifficulty();
        
        // Apply health multiplier
        enemy.health = Math.round(enemy.health * config.enemyHealthMultiplier);
        enemy.maxHealth = Math.round(enemy.maxHealth * config.enemyHealthMultiplier);
        
        // Store original damage for calculations
        if (!enemy.baseDamage) {
            enemy.baseDamage = this.getEnemyBaseDamage(enemy.type);
        }
        
        return enemy;
    }
    
    // Get enemy damage based on type and difficulty
    getEnemyDamage(enemyType) {
        const config = this.getCurrentDifficulty();
        const baseDamage = this.baseEnemyDamage[enemyType] || 5; // Default to 5 if type not found
        return Math.round(baseDamage * config.enemyDamageMultiplier);
    }
    
    // Get base enemy damage (for reference)
    getEnemyBaseDamage(enemyType) {
        return this.baseEnemyDamage[enemyType] || 5;    }
    
      // Check if player should heal
    shouldHealPlayer(waveNumber, duringWave = false) {
        const config = this.getCurrentDifficulty();
        
        switch (config.healingType) {
            case 'during_wave':
                return duringWave; // Heal during waves only
            case 'after_each_wave':
                return !duringWave; // Heal after each wave
            case 'after_every_2_waves':
                return !duringWave && (waveNumber % 2 === 0); // Heal after every 2nd wave
            case 'after_every_3_waves':
                return !duringWave && (waveNumber % 3 === 0); // Heal after every 3rd wave
            case 'never':
                return false; // Never heal
            default:
                return false;
        }
    }
    
    // Get healing rate for gradual healing
    getHealingRate() {
        return this.getCurrentDifficulty().healingRate;
    }
    
    // Get upgrade drop multiplier
    getUpgradeDropMultiplier() {
        return this.getCurrentDifficulty().upgradeDropMultiplier;
    }
    
    // Get difficulty statistics for display
    getDifficultyStats() {
        const config = this.getCurrentDifficulty();
        return {
            name: config.name,
            emoji: config.emoji,
            playerHealth: config.playerHealth,
            enemySpeed: `${Math.round(config.enemySpeedMultiplier * 100)}%`,
            enemyHealth: `${Math.round(config.enemyHealthMultiplier * 100)}%`,
            enemyDamage: `${Math.round(config.enemyDamageMultiplier * 100)}%`,
            overclockCharge: `${Math.round(config.overclockChargeMultiplier * 100)}%`,
            waveSize: `${Math.round(config.waveSpawnMultiplier * 100)}%`,
            healingType: config.healingType.replace('_', ' ').toUpperCase()
        };
    }
    
    // Get wave enemy count range based on difficulty
    getWaveEnemyCount() {
        const config = this.getCurrentDifficulty();
        if (config.waveEnemyCount) {
            const min = config.waveEnemyCount.min;
            const max = config.waveEnemyCount.max;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        // Fallback to old system if not configured
        return Math.floor(Math.random() * 5) + 5;
    }
    
    // Check if health drops should be enabled
    areHealthDropsEnabled() {
        return this.getCurrentDifficulty().healthDropsEnabled || false;
    }
}
