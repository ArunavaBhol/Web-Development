// DOM Elements
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

// Inputs
const sidesInput = document.getElementById('sides');
const layersInput = document.getElementById('layers');
const radiusInput = document.getElementById('radius');
const colorInput = document.getElementById('color');
const bgColorInput = document.getElementById('bgColor');

// Value Displays
const sidesVal = document.getElementById('sides-val');
const layersVal = document.getElementById('layers-val');
const radiusVal = document.getElementById('radius-val');

// Buttons
const btnRandom = document.getElementById('btn-random');
const btnExport = document.getElementById('btn-export');

// Set canvas size
function resizeCanvas() {
    // Make canvas a square based on the smaller window dimension
    const size = Math.min(window.innerWidth - 320, window.innerHeight) * 0.95;
    canvas.width = size;
    canvas.height = size;
    drawMandala();
}

window.addEventListener('resize', resizeCanvas);

// Utility: Convert Hex to RGB for opacity control
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

// Core Drawing Function
function drawMandala() {
    // 1. Clear and fill background
    ctx.fillStyle = bgColorInput.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Get current values
    const sides = parseInt(sidesInput.value);
    const layers = parseInt(layersInput.value);
    const maxRadius = parseInt(radiusInput.value);
    const rgb = hexToRgb(colorInput.value);

    // 3. Move origin to center of canvas
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // 4. Procedural drawing loop
    for (let layer = 0; layer < layers; layer++) {
        // Shrink radius for inner layers
        const currentRadius = maxRadius * (1 - layer / layers);
        
        // Stagger the rotation for each layer to create a weaving effect
        const rotationOffset = (Math.PI / sides) * layer; 

        for (let side = 0; side < sides; side++) {
            // Calculate angle for 360 degree symmetry
            const angle = ((Math.PI * 2) / sides) * side + rotationOffset;

            ctx.save();
            ctx.rotate(angle);

            // Draw Geometric Petal using Bezier Curves
            ctx.beginPath();
            ctx.moveTo(0, 0);
            
            // Curve defining the right side of the petal
            ctx.bezierCurveTo(
                currentRadius * 0.4, currentRadius * 0.2, 
                currentRadius * 0.8, currentRadius * 0.8, 
                0, currentRadius                          
            );
            
            // Curve defining the left side of the petal
            ctx.bezierCurveTo(
                -currentRadius * 0.8, currentRadius * 0.8,
                -currentRadius * 0.4, currentRadius * 0.2,
                0, 0
            );

            // Styling: Fill with transparent color, stroke with solid color
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.1 + (layer/layers)*0.2})`;
            ctx.fill();

            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw internal connecting geometry (circles)
            ctx.beginPath();
            ctx.arc(0, currentRadius * 0.65, currentRadius * 0.08, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
            ctx.stroke();

            ctx.restore();
        }
    }
    
    // Reset transform
    ctx.restore();
}

// Event Listeners for UI Updates
[sidesInput, layersInput, radiusInput, colorInput, bgColorInput].forEach(input => {
    input.addEventListener('input', (e) => {
        // Update number displays
        if(e.target.id === 'sides') sidesVal.textContent = e.target.value;
        if(e.target.id === 'layers') layersVal.textContent = e.target.value;
        if(e.target.id === 'radius') radiusVal.textContent = e.target.value;
        
        // Redraw automatically
        drawMandala();
    });
});

// Randomize Feature
btnRandom.addEventListener('click', () => {
    sidesInput.value = Math.floor(Math.random() * 32) + 4;
    layersInput.value = Math.floor(Math.random() * 18) + 2;
    radiusInput.value = Math.floor(Math.random() * 400) + 100;
    
    // Random Hex Colors
    colorInput.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    
    // Update displays
    sidesVal.textContent = sidesInput.value;
    layersVal.textContent = layersInput.value;
    radiusVal.textContent = radiusInput.value;

    drawMandala();
});

// Export Feature using native Canvas API
btnExport.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `generative-mandala-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Initialize
resizeCanvas();
