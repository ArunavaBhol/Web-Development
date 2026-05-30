// --- DOM Elements ---
const canvas = document.getElementById('art-canvas');
const ctx = canvas.getContext('2d');

const inputs = {
    depth: document.getElementById('depth'),
    angle: document.getElementById('angle'),
    length: document.getElementById('length'),
    color: document.getElementById('color')
};

const labels = {
    depth: document.getElementById('depth-val'),
    angle: document.getElementById('angle-val'),
    length: document.getElementById('length-val')
};

const btnRandom = document.getElementById('btn-random');
const btnDownload = document.getElementById('btn-download');

// --- Canvas Setup ---
// Dynamically size the canvas based on its container
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth - 64; // 64px accounts for container padding
    canvas.height = container.clientHeight - 64;
    generateArt();
}

// Ensure the canvas recalculates if the browser window changes size
window.addEventListener('resize', resizeCanvas);

// --- The Core Algorithm: Recursive Tree ---
// This function calls itself, branching out smaller and smaller until depth hits 0
function drawBranch(startX, startY, len, angle, depth, branchWidth, leafColor) {
    ctx.beginPath();
    ctx.save();
    
    // Style logic: Trunk is dark gray, tips are colored
    ctx.strokeStyle = depth <= 3 ? leafColor : '#334155';
    ctx.fillStyle = leafColor;
    ctx.lineWidth = branchWidth;
    
    // Move to starting point and rotate the canvas context
    ctx.translate(startX, startY);
    ctx.rotate((angle * Math.PI) / 180);
    
    // Draw the branch
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -len);
    ctx.stroke();

    // Base Case: Stop recursion when depth is 0 and draw a leaf
    if (depth === 0) {
        ctx.beginPath();
        ctx.arc(0, -len, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }

    // Get branch angle from UI
    const branchAngle = parseInt(inputs.angle.value);

    // Recursive Calls: Left Branch and Right Branch
    // Multipliers (0.75, 0.7) shrink the branches as they grow outward
    drawBranch(0, -len, len * 0.75, branchAngle, depth - 1, branchWidth * 0.7, leafColor);
    drawBranch(0, -len, len * 0.75, -branchAngle, depth - 1, branchWidth * 0.7, leafColor);

    ctx.restore();
}

// --- Main Render Function ---
function generateArt() {
    // 1. Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Extract current values from the UI
    const depth = parseInt(inputs.depth.value);
    const length = parseInt(inputs.length.value);
    const color = inputs.color.value;

    // 3. Update the text labels on the UI
    labels.depth.innerText = depth;
    labels.angle.innerText = inputs.angle.value;
    labels.length.innerText = length;

    // 4. Calculate starting position (bottom center of canvas)
    const startX = canvas.width / 2;
    const startY = canvas.height - 20;

    // 5. Fire the recursive function (Initial angle is 0, pointing straight up)
    drawBranch(startX, startY, length, 0, depth, 12, color);
}

// --- Event Listeners ---

// Listen for any movement on sliders and instantly redraw
Object.values(inputs).forEach(input => {
    input.addEventListener('input', generateArt);
});

// Randomize button logic
btnRandom.addEventListener('click', () => {
    // Generate random values within sensible bounds
    inputs.depth.value = Math.floor(Math.random() * 8) + 4; // 4 to 11
    inputs.angle.value = Math.floor(Math.random() * 60) + 10; // 10 to 70
    inputs.length.value = Math.floor(Math.random() * 100) + 70; // 70 to 170
    
    // Generate random hex color
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    inputs.color.value = randomColor;

    generateArt();
});

// Download button logic
btnDownload.addEventListener('click', () => {
    // Trick: To prevent a transparent/black background in the PNG, 
    // we create a temporary hidden canvas to paint a background color first.
    const tempCanvas = document.createElement('canvas');
    const tCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Paint the dark background
    tCtx.fillStyle = '#020617'; 
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw our actual art on top of the dark background
    tCtx.drawImage(canvas, 0, 0);

    // Trigger download via anchor tag
    const link = document.createElement('a');
    link.download = 'my-generative-art.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
});

// --- Initialization ---
// Small timeout ensures the CSS has rendered the container size before initial draw
setTimeout(resizeCanvas, 50);
