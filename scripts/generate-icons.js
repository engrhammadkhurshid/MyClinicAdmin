// Generate PWA Icons Script
// Run this with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Simple SVG to generate placeholder icons
const generateIcon = (size) => {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
            fill="white" text-anchor="middle" dy=".35em" font-weight="bold">MC</text>
    </svg>
  `;
  return svg.trim();
};

// Create icons directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');

// Generate icons
const icon192 = generateIcon(192);
const icon512 = generateIcon(512);

// Save as SVG (can be converted to PNG later)
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), icon512);

console.log('✅ PWA icon templates generated!');
console.log('📝 Next steps:');
console.log('1. Convert SVG to PNG using an online tool or ImageMagick');
console.log('2. Or replace with your custom designed icons');
console.log('3. Ensure files are named: icon-192.png and icon-512.png');
