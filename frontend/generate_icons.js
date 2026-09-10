const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const logoPath = path.join(publicDir, 'logo.png');

async function generateIcons() {
  console.log('Generating PWA icons matching original D Tailors logo...');
  const logoBuffer = fs.readFileSync(logoPath);

  const sizes = [
    { name: 'icon-192.png', width: 192, height: 192 },
    { name: 'icon-512.png', width: 512, height: 512 },
    { name: 'apple-icon.png', width: 180, height: 180 },
    { name: 'favicon.png', width: 48, height: 48 },
  ];

  for (const item of sizes) {
    const outputPath = path.join(publicDir, item.name);
    await sharp(logoBuffer)
      .resize(item.width, item.height)
      .png()
      .toFile(outputPath);
    console.log(`Created ${item.name} (${item.width}x${item.height})`);
  }

  const icoPath = path.join(__dirname, 'src', 'app', 'favicon.ico');
  await sharp(logoBuffer)
    .resize(32, 32)
    .toFormat('png')
    .toFile(icoPath);
  console.log('Updated src/app/favicon.ico');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
