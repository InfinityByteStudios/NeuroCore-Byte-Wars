class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        canvas.addEventListener('mousedown', (e) => {
            this.mouse.isDown = true;
        });
        
        canvas.addEventListener('mouseup', (e) => {
            this.mouse.isDown = false;
        });
    }
    
    isKeyPressed(key) {
        return !!this.keys[key];
    }
    
    getMovementVector() {
        let x = 0;
        let y = 0;
        
        if (this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp')) y -= 1;
        if (this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown')) y += 1;
        if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) x -= 1;
        if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) x += 1;
        
        // Normalize diagonal movement
        if (x !== 0 && y !== 0) {
            const magnitude = Math.sqrt(x * x + y * y);
            x /= magnitude;
            y /= magnitude;
        }
        
        return { x, y };
    }
}
