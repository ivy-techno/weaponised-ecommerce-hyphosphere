import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const sourcePath = path.join(projectDirectory, 'public', 'assets', 'field-notes-patchwork.png');
const outputDirectory = path.join(projectDirectory, 'submission-assets');
const outputPath = path.join(outputDirectory, 'weaponised-ecommerce-devpost-thumbnail.png');

const width = 1200;
const height = 800;
const artworkHeight = 400;

await mkdir(outputDirectory, { recursive: true });

const artwork = await sharp(sourcePath)
  .resize(width, artworkHeight, { fit: 'fill' })
  .modulate({ brightness: 1.04, saturation: 0.82 })
  .png()
  .toBuffer();

const titleField = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="header" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#153f3c"/>
      <stop offset="0.58" stop-color="#17534e"/>
      <stop offset="1" stop-color="#216a62"/>
    </linearGradient>
    <linearGradient id="ribbonFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#143c39" stop-opacity="0.33"/>
      <stop offset="0.26" stop-color="#143c39" stop-opacity="0"/>
      <stop offset="1" stop-color="#143c39" stop-opacity="0.08"/>
    </linearGradient>
    <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="1200" height="408" fill="url(#header)"/>
  <path d="M-70 335 C180 245 310 455 570 337 S940 198 1270 325" fill="none" stroke="#e8a54d" stroke-opacity="0.22" stroke-width="3"/>
  <path d="M-45 360 C190 292 340 457 605 354 S970 232 1265 348" fill="none" stroke="#f5d59c" stroke-opacity="0.13" stroke-width="1.5"/>
  <circle cx="78" cy="70" r="9" fill="#eba148"/>
  <circle cx="78" cy="70" r="20" fill="none" stroke="#f6d8a2" stroke-opacity="0.34" stroke-width="2"/>
  <text x="112" y="78" fill="#f6d39a" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="5">HYPHOSPHERE</text>

  <text x="70" y="192" fill="#fff2d7" font-family="Trebuchet MS, Arial, sans-serif" font-size="76" font-weight="700" letter-spacing="-3">WEAPONISED</text>
  <text x="70" y="270" fill="#fff2d7" font-family="Trebuchet MS, Arial, sans-serif" font-size="76" font-weight="700" letter-spacing="-3">ECOMMERCE</text>
  <text x="74" y="319" fill="#f2b45e" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" letter-spacing="4">THE HYPHOSPHERE OBSERVATORY</text>
  <text x="74" y="360" fill="#dce9df" font-family="Arial, Helvetica, sans-serif" font-size="21">Human + agent research terrain · WebMCP</text>

  <g transform="translate(1008 206)" filter="url(#softGlow)">
    <circle r="105" fill="#f6dfae" fill-opacity="0.08" stroke="#f5ce88" stroke-opacity="0.42" stroke-width="2"/>
    <path d="M0 0 L-58 -48 M0 0 L65 -43 M0 0 L72 34 M0 0 L5 76 M0 0 L-72 38" fill="none" stroke="#f5ce88" stroke-width="4" stroke-linecap="round"/>
    <path d="M-58 -48 L65 -43 M65 -43 L72 34 M72 34 L5 76 M5 76 L-72 38 M-72 38 L-58 -48" fill="none" stroke="#8bc8b9" stroke-opacity="0.58" stroke-width="2"/>
    <circle r="19" fill="#eea54b" stroke="#fff0cf" stroke-width="4"/>
    <circle cx="-58" cy="-48" r="13" fill="#8ac7b9" stroke="#fff0cf" stroke-width="3"/>
    <circle cx="65" cy="-43" r="13" fill="#d17d6e" stroke="#fff0cf" stroke-width="3"/>
    <circle cx="72" cy="34" r="13" fill="#9d8bc3" stroke="#fff0cf" stroke-width="3"/>
    <circle cx="5" cy="76" r="13" fill="#f0c363" stroke="#fff0cf" stroke-width="3"/>
    <circle cx="-72" cy="38" r="13" fill="#8ac7b9" stroke="#fff0cf" stroke-width="3"/>
  </g>

  <rect y="400" width="1200" height="400" fill="url(#ribbonFade)"/>
  <rect x="0" y="394" width="1200" height="12" fill="#e8a34a"/>
  <rect x="0" y="406" width="1200" height="4" fill="#f5d9a4" fill-opacity="0.72"/>
  <rect x="38" y="744" width="1124" height="31" rx="15.5" fill="#153f3c" fill-opacity="0.76"/>
  <text x="600" y="766" text-anchor="middle" fill="#fff2d7" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="2.6">TRACE THE INFRASTRUCTURE BEHIND THE VISIBLE STORY</text>
</svg>
`);

await sharp({
  create: {
    width,
    height,
    channels: 4,
    background: '#f3dec0',
  },
})
  .composite([
    { input: artwork, left: 0, top: height - artworkHeight },
    { input: titleField, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9, palette: true, quality: 95 })
  .toFile(outputPath);

console.log(outputPath);
