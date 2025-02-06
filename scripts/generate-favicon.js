const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a canvas with dimensions 32x32 (standard favicon size)
const canvas = createCanvas(32, 32);
const ctx = canvas.getContext('2d');

// Create a leaf-like shape
function drawLeaf() {
    ctx.beginPath();
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 32, 32);
    gradient.addColorStop(0, '#22c55e');  // green-500
    gradient.addColorStop(1, '#16a34a');  // green-600
    
    // Draw a stylized leaf
    ctx.moveTo(16, 4);
    ctx.bezierCurveTo(24, 4, 28, 16, 28, 24);
    ctx.bezierCurveTo(28, 28, 24, 28, 16, 28);
    ctx.bezierCurveTo(8, 28, 4, 28, 4, 24);
    ctx.bezierCurveTo(4, 16, 8, 4, 16, 4);
    
    // Fill with gradient
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add highlight
    ctx.beginPath();
    ctx.moveTo(16, 8);
    ctx.bezierCurveTo(20, 8, 22, 16, 22, 20);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Clear canvas and draw leaf
ctx.clearRect(0, 0, 32, 32);
drawLeaf();

// Save as PNG first (we'll need to convert to ICO format)
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, '../app/favicon.png'), buffer);

console.log('Favicon PNG generated. Please convert to ICO format using an online converter or appropriate tool.');
