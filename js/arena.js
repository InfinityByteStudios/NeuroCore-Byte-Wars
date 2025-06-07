class Arena {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.borderThickness = 20;
        
        // Arena visual properties
        this.borderColor = '#00ffff';
        this.backgroundColor = '#001122';
        this.gridColor = '#003344';
        this.gridSize = 50;
        
        // Corner decorations
        this.cornerSize = 40;
        this.cornerColor = '#ff6600';
        
        // Central elements
        this.centerRingRadius = 80;
        this.centerRingColor = '#004466';
    }
    
    render(ctx) {
        // Draw background
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw grid pattern
        this.drawGrid(ctx);
        
        // Draw center ring
        this.drawCenterRing(ctx);
        
        // Draw corner decorations
        this.drawCornerDecorations(ctx);
        
        // Draw arena borders
        this.drawBorders(ctx);
        
        // Draw arena info
        this.drawArenaInfo(ctx);
    }
    
    drawGrid(ctx) {
        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]); // Dashed lines
        
        // Vertical lines
        for (let x = this.gridSize; x < this.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = this.gridSize; y < this.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
        
        ctx.setLineDash([]); // Reset to solid lines
    }
    
    drawCenterRing(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Outer ring
        ctx.strokeStyle = this.centerRingColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.centerRingRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.centerRingRadius - 15, 0, Math.PI * 2);
        ctx.stroke();
        
        // Center dot
        ctx.fillStyle = this.centerRingColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawCornerDecorations(ctx) {
        const corners = [
            { x: this.cornerSize, y: this.cornerSize }, // Top-left
            { x: this.width - this.cornerSize, y: this.cornerSize }, // Top-right
            { x: this.cornerSize, y: this.height - this.cornerSize }, // Bottom-left
            { x: this.width - this.cornerSize, y: this.height - this.cornerSize } // Bottom-right
        ];
        
        ctx.strokeStyle = this.cornerColor;
        ctx.lineWidth = 2;
        
        corners.forEach(corner => {
            // Draw corner brackets
            const size = 15;
            
            // Top-left bracket part
            ctx.beginPath();
            ctx.moveTo(corner.x - size, corner.y);
            ctx.lineTo(corner.x, corner.y);
            ctx.lineTo(corner.x, corner.y - size);
            ctx.stroke();
            
            // Top-right bracket part
            ctx.beginPath();
            ctx.moveTo(corner.x + size, corner.y);
            ctx.lineTo(corner.x, corner.y);
            ctx.lineTo(corner.x, corner.y + size);
            ctx.stroke();
        });
    }
    
    drawBorders(ctx) {
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = this.borderThickness;
        ctx.shadowColor = this.borderColor;
        ctx.shadowBlur = 15;
        
        // Draw border rectangle
        ctx.strokeRect(
            this.borderThickness / 2, 
            this.borderThickness / 2, 
            this.width - this.borderThickness, 
            this.height - this.borderThickness
        );
        
        ctx.shadowBlur = 0;
    }
    
    drawArenaInfo(ctx) {
        // Arena title
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('NEUROCORE TRAINING ARENA', this.width / 2, 35);
        
        // Arena designation
        ctx.font = '10px Courier New';
        ctx.fillStyle = '#666666';
        ctx.fillText('SECTOR 01 - PROTOTYPE TESTING ZONE', this.width / 2, 50);
        
        ctx.textAlign = 'left'; // Reset text alignment
    }
    
    // Check if a point is within the arena bounds (excluding borders)
    isInBounds(x, y, radius = 0) {
        return x - radius >= this.borderThickness && 
               x + radius <= this.width - this.borderThickness &&
               y - radius >= this.borderThickness && 
               y + radius <= this.height - this.borderThickness;
    }
    
    // Get the safe spawn area (avoiding center ring)
    getSafeSpawnArea() {
        const margin = 50;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const safeRadius = this.centerRingRadius + margin;
        
        return {
            minX: this.borderThickness + margin,
            maxX: this.width - this.borderThickness - margin,
            minY: this.borderThickness + margin,
            maxY: this.height - this.borderThickness - margin,
            centerX: centerX,
            centerY: centerY,
            centerExclusionRadius: safeRadius
        };
    }
}
