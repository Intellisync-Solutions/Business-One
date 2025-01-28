import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateFavicons() {
  const sizes = [16, 32, 192, 512];
  const inputSvg = path.join(__dirname, '../public/favicon.svg');
  
  for (const size of sizes) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `../public/favicon-${size}x${size}.png`));
    console.log(`Generated favicon-${size}x${size}.png`);
  }

  // Generate apple-touch-icon (180x180)
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
}

async function generateOgImage() {
  const inputSvg = path.join(__dirname, '../public/og-image.svg');
  await sharp(inputSvg)
    .resize(1200, 630)
    .png()
    .toFile(path.join(__dirname, '../public/og-image.png'));
  console.log('Generated og-image.png');
}

async function generateShortcutIcons() {
  const inputSvg = path.join(__dirname, '../public/favicon.svg');
  const shortcuts = ['calculator', 'ratios'];
  
  for (const shortcut of shortcuts) {
    await sharp(inputSvg)
      .resize(96, 96)
      .png()
      .toFile(path.join(__dirname, `../public/shortcuts/${shortcut}.png`));
    console.log(`Generated ${shortcut}.png shortcut icon`);
  }
}

async function generateScreenshots() {
  // Create placeholder screenshots with text
  const desktopConfig = {
    width: 1920,
    height: 1080,
    channels: 4,
    background: { r: 15, g: 23, b: 42, alpha: 1 }
  };
  
  const mobileConfig = {
    width: 750,
    height: 1334,
    channels: 4,
    background: { r: 15, g: 23, b: 42, alpha: 1 }
  };

  // Desktop screenshot
  await sharp({
    create: desktopConfig
  })
    .png()
    .toFile(path.join(__dirname, '../public/screenshots/desktop.png'));
  console.log('Generated desktop screenshot placeholder');

  // Mobile screenshot
  await sharp({
    create: mobileConfig
  })
    .png()
    .toFile(path.join(__dirname, '../public/screenshots/mobile.png'));
  console.log('Generated mobile screenshot placeholder');
}

async function main() {
  try {
    await generateFavicons();
    await generateOgImage();
    await generateShortcutIcons();
    await generateScreenshots();
    console.log('All images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
    process.exit(1);
  }
}

main();
