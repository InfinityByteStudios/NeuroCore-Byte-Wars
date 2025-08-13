// Shop System for NeuroCore: Byte Wars
class ShopSystem {    constructor() {
        this.isShopOpen = false;        this.selectedSkin = 'mainSprite'; // Default to Main Sprite
        this.ownedSkins = new Set(['mainSprite', 'cyan']); // Player starts with Main Sprite and Cyan (both free)
        this.byteCoins = 100; // Starting ByteCoins
        this.player = null; // Reference to player for skin updates
        
        // ByteCoin rewards per enemy hit
        this.byteCoinRewards = {
            'dataWisp': 1,
            'bitBug': 2,
            'memoryLeech': 3,
            'syntaxBreaker': 4,
            'theForked': 5,
            'corruptedProtocol': 10,
            'neuroFork': 15
        };          // Available skins - different color variants with same circle-with-stick design
        this.availableSkins = {            'mainSprite': {
                name: 'Main Neural Core',
                description: 'Standard issue neural interface',
                price: 0,
                color: '#ffffff', // White color (not used in sprite mode)
                spriteFile: 'Main Sprite.png', // Uses the actual Main Sprite image
                overclockSprite: 'OverClock Sprite.png', // Uses overclock sprite during overclock
                owned: true,
                isSpriteMode: true // Uses actual sprite file
            },
            'cyan': {
                name: 'Classic Cyan Core',
                description: 'Original cyan neural interface',
                price: 0,
                color: '#00ffff', // Cyan - original color
                spriteFile: null, // No sprite, uses shape drawing
                overclockSprite: null,
                owned: true,
                isSpriteMode: false // Uses shape drawing
            },            'crimson': {
                name: 'Crimson Override',
                description: 'Blood-red neural enhancement',
                price: 50,
                color: '#ff0033',
                spriteFile: null, // No sprite, uses shape drawing
                overclockSprite: null,
                owned: false,
                isSpriteMode: false // Uses same circle-with-stick design
            },
            'golden': {
                name: 'Golden Protocol',
                description: 'Elite golden neural matrix',
                price: 100,
                color: '#ffd700',
                spriteFile: null,
                overclockSprite: null,
                owned: false,
                isSpriteMode: false // Uses same circle-with-stick design
            },
            'violet': {
                name: 'Violet Nexus',
                description: 'Mysterious purple energy core',
                price: 75,
                color: '#9966ff',
                spriteFile: null,
                overclockSprite: null,                owned: false,
                isSpriteMode: false // Uses same circle-with-stick design
            },
            'emerald': {
                name: 'Emerald Matrix',
                description: 'Nature-inspired green enhancement',
                price: 80,
                color: '#00ff66',
                spriteFile: null,
                overclockSprite: null,
                owned: false,
                isSpriteMode: false // Uses same circle-with-stick design
            },
            'arctic': {
                name: 'Arctic Protocol',
                description: 'Ice-cold blue enhancement',
                price: 60,
                color: '#66ccff',
                spriteFile: null,
                overclockSprite: null,
                owned: false,
                isSpriteMode: false // Uses same circle-with-stick design
            }
        };
        
        this.createShopUI();
    }
    
    createShopUI() {
        // Create shop overlay
        const shopOverlay = document.createElement('div');
        shopOverlay.id = 'shopOverlay';
        shopOverlay.className = 'shop-overlay hidden';
        shopOverlay.innerHTML = `
            <div class="shop-container">                <div class="shop-header">
                    <h2>◤ NEURAL SKIN SHOP ◥</h2>
                    <div class="shop-currency">BYTECOINS: <span id="shopCurrency">${this.byteCoins}</span></div>
                    <button class="shop-close" id="shopCloseBtn">✕</button>
                </div>
                <div class="shop-content">
                    <div class="shop-grid" id="shopGrid">
                        <!-- Skins will be populated here -->
                    </div>
                </div>                <div class="shop-footer">
                    <p>Press M to close shop • Earn ByteCoins by hitting enemies • Different enemies give different rewards</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(shopOverlay);
        this.populateShopGrid();
        this.setupShopEventListeners();
    }
    
    populateShopGrid() {
        const shopGrid = document.getElementById('shopGrid');
        shopGrid.innerHTML = '';
        
        Object.entries(this.availableSkins).forEach(([skinId, skin]) => {
            const skinCard = document.createElement('div');
            skinCard.className = `skin-card ${this.ownedSkins.has(skinId) ? 'owned' : ''} ${this.selectedSkin === skinId ? 'selected' : ''}`;
            skinCard.dataset.skinId = skinId;
            
            const isOwned = this.ownedSkins.has(skinId);
            const canAfford = this.byteCoins >= skin.price;
              skinCard.innerHTML = `
                <div class="skin-preview" style="background: linear-gradient(45deg, ${skin.color}22, ${skin.color}44);">
                    <div class="skin-player-preview" style="color: ${skin.color};">
                        <div class="skin-player-head"></div>
                        <div class="skin-player-body"></div>
                        <div class="skin-player-arms"></div>
                        <div class="skin-player-legs"></div>
                    </div>
                </div>
                <div class="skin-info">
                    <h3>${skin.name}</h3>
                    <p>${skin.description}</p>                    <div class="skin-price">
                        ${isOwned ? 'OWNED' : 
                          skinId === 'default' ? 'FREE' : 
                          `${skin.price} BYTECOINS`}
                    </div>
                </div>
                <div class="skin-actions">
                    ${isOwned ? 
                        `<button class="skin-select-btn ${this.selectedSkin === skinId ? 'selected' : ''}" data-skin="${skinId}">
                            ${this.selectedSkin === skinId ? 'EQUIPPED' : 'EQUIP'}
                        </button>` :
                        `<button class="skin-buy-btn ${canAfford ? '' : 'disabled'}" data-skin="${skinId}" ${!canAfford ? 'disabled' : ''}>
                            BUY
                        </button>`
                    }
                </div>
            `;
            
            shopGrid.appendChild(skinCard);
        });
    }
    
    setupShopEventListeners() {
        // Close button
        document.getElementById('shopCloseBtn').addEventListener('click', () => {
            this.closeShop();
        });
        
        // Shop grid event delegation
        document.getElementById('shopGrid').addEventListener('click', (e) => {
            if (e.target.classList.contains('skin-buy-btn') && !e.target.disabled) {
                const skinId = e.target.dataset.skin;
                this.buySkin(skinId);
            } else if (e.target.classList.contains('skin-select-btn')) {
                const skinId = e.target.dataset.skin;
                this.selectSkin(skinId);
            }
        });
        
        // Close shop with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.isShopOpen) {
                this.closeShop();
            }
        });
    }
    
    openShop() {
        if (this.isShopOpen) return;
        
        this.isShopOpen = true;
        const shopOverlay = document.getElementById('shopOverlay');
        shopOverlay.classList.remove('hidden');
          // Update ByteCoins display
        document.getElementById('shopCurrency').textContent = this.byteCoins;
        
        // Refresh the shop grid to show current state
        this.populateShopGrid();
        
        console.log('🛒 Shop opened');
    }
    
    closeShop() {
        if (!this.isShopOpen) return;
        
        this.isShopOpen = false;
        const shopOverlay = document.getElementById('shopOverlay');
        shopOverlay.classList.add('hidden');
        
        console.log('🛒 Shop closed');
    }
    
    toggleShop() {
        if (this.isShopOpen) {
            this.closeShop();
        } else {
            this.openShop();
        }
    }
    
    buySkin(skinId) {
        const skin = this.availableSkins[skinId];        if (!skin || this.ownedSkins.has(skinId) || this.byteCoins < skin.price) {
            return false;
        }
        
        // Deduct ByteCoins and add skin
        this.byteCoins -= skin.price;
        this.ownedSkins.add(skinId);
          // Update UI
        document.getElementById('shopCurrency').textContent = this.byteCoins;
        this.populateShopGrid();
        
        console.log(`🛒 Purchased skin: ${skin.name} for ${skin.price} ByteCoins`);
        return true;
    }
      selectSkin(skinId) {
        if (!this.ownedSkins.has(skinId)) {
            return false;
        }
        
        this.selectedSkin = skinId;
        this.populateShopGrid();
        
        // Update player skin if player reference is available
        if (this.player && this.player.updateSkin) {
            this.player.updateSkin();
        }
        
        console.log(`🎨 Selected skin: ${this.availableSkins[skinId].name}`);
        return true;
    }
      // Method to be called by game to add ByteCoins (e.g., from kills/score)
    addCurrency(amount) {
        this.byteCoins += amount;
        
        // Update ByteCoins display if shop is open
        if (this.isShopOpen) {
            document.getElementById('shopCurrency').textContent = this.byteCoins;
        }
    }
    
    // Calculate ByteCoins from hit data
    calculateByteCoinReward(hitData) {
        let totalReward = 0;
        
        for (const hit of hitData) {
            const reward = this.byteCoinRewards[hit.enemyType] || 1; // Default to 1 if enemy type not found
            totalReward += reward;
            console.log(`🪙 +${reward} ByteCoins from ${hit.enemyType} hit`);
        }
        
        return totalReward;
    }
    
    // Add ByteCoins based on hit data
    addByteCoinReward(hitData) {
        const reward = this.calculateByteCoinReward(hitData);
        if (reward > 0) {
            this.addCurrency(reward);
            console.log(`💰 Total ByteCoins earned: +${reward}`);
        }
    }
    
    // Get current skin info for player to use
    getCurrentSkin() {
        return this.availableSkins[this.selectedSkin];
    }
    
    // Save/load system (could be expanded to localStorage later)
    getSaveData() {
        return {
            selectedSkin: this.selectedSkin,
            ownedSkins: Array.from(this.ownedSkins),
            byteCoins: this.byteCoins
        };
    }
    
    loadSaveData(data) {
        if (data.selectedSkin) this.selectedSkin = data.selectedSkin;
        if (data.ownedSkins) this.ownedSkins = new Set(data.ownedSkins);
        if (data.byteCoins !== undefined) this.byteCoins = data.byteCoins;
        // Support legacy save data
        if (data.currency !== undefined) this.byteCoins = data.currency;
    }
    
    // Set player reference for skin updates
    setPlayer(player) {
        this.player = player;
    }
}
