import sharp from 'sharp';

const createIcon = async (size: number, filename: string) => {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f97316"/>
          <stop offset="100%" style="stop-color:#ea580c"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
      <g fill="white">
        <rect x="${size * 0.25}" y="${size * 0.15}" width="${size * 0.12}" height="${size * 0.5}" rx="${size * 0.03}"/>
        <rect x="${size * 0.43}" y="${size * 0.25}" width="${size * 0.12}" height="${size * 0.4}" rx="${size * 0.03}"/>
        <rect x="${size * 0.61}" y="${size * 0.35}" width="${size * 0.12}" height="${size * 0.3}" rx="${size * 0.03}"/>
        <circle cx="${size * 0.31}" cy="${size * 0.75}" r="${size * 0.08}"/>
        <circle cx="${size * 0.49}" cy="${size * 0.75}" r="${size * 0.08}"/>
        <circle cx="${size * 0.67}" cy="${size * 0.75}" r="${size * 0.08}"/>
        <path d="M ${size * 0.2} ${size * 0.85} Q ${size * 0.5} ${size * 0.95} ${size * 0.8} ${size * 0.85}" stroke="white" stroke-width="${size * 0.04}" fill="none" stroke-linecap="round"/>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(`public/${filename}`);
  
  console.log(`Created ${filename}`);
};

const createAppleTouchIcon = async () => {
  const size = 180;
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f97316"/>
          <stop offset="100%" style="stop-color:#ea580c"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
      <g fill="white">
        <rect x="${size * 0.25}" y="${size * 0.15}" width="${size * 0.12}" height="${size * 0.5}" rx="${size * 0.03}"/>
        <rect x="${size * 0.43}" y="${size * 0.25}" width="${size * 0.12}" height="${size * 0.4}" rx="${size * 0.03}"/>
        <rect x="${size * 0.61}" y="${size * 0.35}" width="${size * 0.12}" height="${size * 0.3}" rx="${size * 0.03}"/>
        <circle cx="${size * 0.31}" cy="${size * 0.75}" r="${size * 0.08}"/>
        <circle cx="${size * 0.49}" cy="${size * 0.75}" r="${size * 0.08}"/>
        <circle cx="${size * 0.67}" cy="${size * 0.75}" r="${size * 0.08}"/>
        <path d="M ${size * 0.2} ${size * 0.85} Q ${size * 0.5} ${size * 0.95} ${size * 0.8} ${size * 0.85}" stroke="white" stroke-width="${size * 0.04}" fill="none" stroke-linecap="round"/>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile('public/apple-touch-icon.png');
  
  console.log('Created apple-touch-icon.png');
};

async function main() {
  await createIcon(192, 'icon-192.png');
  await createIcon(512, 'icon-512.png');
  await createAppleTouchIcon();
  console.log('\n✅ All icons created!');
}

main().catch(console.error);
