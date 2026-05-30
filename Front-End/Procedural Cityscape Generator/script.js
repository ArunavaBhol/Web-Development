// --- DOM Elements ---
const canvas = document.getElementById('cityCanvas');
const ctx = canvas.getContext('2d');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const densityInput = document.getElementById('density');
const densityVal = document.getElementById('densityVal');
const heightInput = document.getElementById('maxHeight');
const heightVal = document.getElementById('heightVal');
const themeSelect = document.getElementById('theme');

// --- Color Themes ---
const themes = {
    midnight: {
        skyTop: '#0B0B1A',
        skyBottom: '#1A1A3A',
        buildingBase: [20, 25, 45], // RGB array for manipulation
        windowColors: ['#FCE570', '#FFD700', '#FFF']
    },
    sunset: {
        skyTop: '#2C1B4D',
        skyBottom: '#D8525E',
        buildingBase: [30, 10, 30],
        windowColors: ['#FF9E80', '#FF5252', '#FFD740']
    },
    toxic: {
        skyTop: '#0D1A11',
        skyBottom: '#2F4F2F',
        buildingBase: [15, 25, 15],
        windowColors: ['#39FF14', '#00FF00', '#ADFF2F']
    }
};

// --- Initialization ---
function init() {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    
    // Event Listeners for UI
    generateBtn.addEventListener('click', drawArt);
    downloadBtn.addEventListener('click', exportPNG);
    
    densityInput.addEventListener('input', (e) => {
        densityVal.textContent = e.target.value;
    });
    
    heightInput.addEventListener('input', (e) => {
        heightVal.textContent = e.target.value;
    });

    // Generate initial art
    drawArt();
}

// --- Canvas Setup (High DPI scaling) ---
function setupCanvas() {
    const container = canvas.parentElement;
    // Calculate aspect ratio (16:9)
    let width = container.clientWidth - 64; // subtract padding
    let height = width * (9 / 16);
    
    if (height > container.clientHeight - 64) {
        height = container.clientHeight - 64;
        width = height * (16 / 9);
    }

    // Handle high-DPI displays (Retina screens)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(dpr, dpr);
    
    // Only redraw if we already have context initialized
    if(document.readyState === "complete") {
        drawArt();
    }
}

// --- Core Drawing Logic ---
function drawArt() {
    const width = parseFloat(canvas.style.width);
    const height = parseFloat(canvas.style.height);
    const theme = themes[themeSelect.value];
    
    // 1. Draw Sky Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, theme.skyTop);
    gradient.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw Stars/Moon if midnight
    if(themeSelect.value === 'midnight') drawStars(width, height);

    // 2. Draw City Layers
    const density = parseInt(densityInput.value);
    const maxHeightPercent = parseInt(heightInput.value) / 100;
    
    // We draw 3 layers for depth (Back, Middle, Front)
    const layers = 3;
    
    for (let layer = 0; layer < layers; layer++) {
        // Adjust properties based on layer depth
        const layerDepth = layer / (layers - 1); // 0 (back) to 1 (front)
        
        const layerDensity = Math.floor(density / layers);
        const maxH = height * maxHeightPercent * (0.6 + (layerDepth * 0.4)); // Back is shorter
        const minH = height * 0.1;
        
        // Calculate color based on depth (Atmospheric Perspective)
        // Back layers are darker and blend with sky
        const r = Math.floor(theme.buildingBase[0] * (0.2 + layerDepth * 0.8));
        const g = Math.floor(theme.buildingBase[1] * (0.2 + layerDepth * 0.8));
        const b = Math.floor(theme.buildingBase[2] * (0.2 + layerDepth * 0.8));
        const buildingColor = `rgb(${r}, ${g}, ${b})`;

        drawLayer(width, height, layerDensity, maxH, minH, buildingColor, layerDepth, theme);
    }
}

function drawLayer(canvasW, canvasH, count, maxH, minH, color, depth, theme) {
    for (let i = 0; i < count; i++) {
        const bWidth = random(20 + (depth * 20), 80 + (depth * 40));
        const bHeight = random(minH, maxH);
        const xPos = random(-bWidth, canvasW);
        const yPos = canvasH - bHeight;

        // Draw Building Main Body
        ctx.fillStyle = color;
        ctx.fillRect(xPos, yPos, bWidth, bHeight);

        // Draw details/windows (More details on front layers)
        if (depth > 0) {
            drawWindows(xPos, yPos, bWidth, bHeight, depth, theme);
        }
        
        // Outline for separation
        ctx.strokeStyle = `rgba(0,0,0,${0.3 + depth * 0.5})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(xPos, yPos, bWidth, bHeight);
    }
}

function drawWindows(bx, by, bw, bh, depth, theme) {
    const cols = Math.floor(random(2, 6));
    const windowW = bw / cols * 0.6;
    const gapX = bw / cols * 0.4;
    
    const rows = Math.floor(bh / (windowW * 1.5));
    const windowH = windowW * 1.2;
    const gapY = windowH * 0.5;

    // Start drawing windows from top to bottom
    let currentY = by + gapY;
    
    for (let r = 0; r < rows; r++) {
        let currentX = bx + gapX / 2;
        
        for (let c = 0; c < cols; c++) {
            // Chance for a window to be "on"
            // Front layers have more lights on
            if (Math.random() < (0.1 + depth * 0.2)) {
                // Randomly pick a window color from theme
                ctx.fillStyle = theme.windowColors[Math.floor(Math.random() * theme.windowColors.length)];
                
                // Add a little glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = ctx.fillStyle;
                
                ctx.fillRect(currentX, currentY, windowW, windowH);
                
                // Reset shadow
                ctx.shadowBlur = 0;
            } else {
                // Window is "off"
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(currentX, currentY, windowW, windowH);
            }
            currentX += windowW + gapX;
        }
        currentY += windowH + gapY;
    }
}

function drawStars(w, h) {
    ctx.fillStyle = '#FFFFFF';
    for(let i = 0; i < 150; i++) {
        const x = random(0, w);
        const y = random(0, h * 0.6); // Stars only in top 60%
        const size = random(0.5, 2);
        
        // Make some stars blink (opacity)
        ctx.globalAlpha = random(0.3, 1);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1; // reset
}

// --- Utility Functions ---
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// --- Export Function ---
function exportPNG() {
    // Convert canvas data to base64 image URL
    const dataURL = canvas.toDataURL('image/png');
    
    // Create a temporary anchor link to trigger download
    const link = document.createElement('a');
    link.download = `cityscape-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Start the app
init();
