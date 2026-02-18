// Generate PWA icons as simple SVG-based PNGs
const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size, outputPath) {
  // Since we may not have canvas module, create an SVG and reference it
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f97316"/>
        <stop offset="100%" style="stop-color:#ea580c"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" 
          font-family="Arial, Helvetica, sans-serif" font-weight="bold" 
          font-size="${size * 0.35}" fill="white" letter-spacing="-${size * 0.01}">BE</text>
  </svg>`;
  
  fs.writeFileSync(outputPath.replace('.png', '.svg'), svg);
  console.log(`Generated: ${outputPath.replace('.png', '.svg')}`);
}

// Generate as SVG (will work universally)
generateIcon(192, 'public/icon-192.png');
generateIcon(512, 'public/icon-512.png');

console.log('Icons generated (as SVG — rename or convert as needed)');
