import fs from 'fs';
import path from 'path';
import ttf2woff2 from 'ttf2woff2';

// Paths configuration
const srcFontsDir = path.resolve('src/assets/fonts');
const destFontsDir = path.resolve('src/fonts');
const cssOutputPath = path.resolve('src/scss/fonts.scss');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destFontsDir)) {
  fs.mkdirSync(destFontsDir, { recursive: true });
}

// Main function to convert fonts
async function convertFonts() {
  console.log('🔍 Looking for font files...');

  // Get all TTF/OTF files
  const files = fs.readdirSync(srcFontsDir).filter(file =>
    file.endsWith('.ttf') || file.endsWith('.otf')
  );

  if (files.length === 0) {
    console.log('❌ No font files found in src/assets/fonts');
    return;
  }

  console.log(`✅ Found ${files.length} font file(s)`);

  let cssContent = '/* Generated font-face declarations */\n\n';

  // Process each font file
  for (const file of files) {
    const filePath = path.join(srcFontsDir, file);
    const fileNameWithoutExt = path.basename(file, path.extname(file));
    const fontFamily = fileNameWithoutExt.split('-')[0] || fileNameWithoutExt;

    // Determine font weight and style from filename
    let fontWeight = '400';
    let fontStyle = 'normal';

    const lowerName = fileNameWithoutExt.toLowerCase();

    if (lowerName.includes('bold')) fontWeight = '700';
    if (lowerName.includes('semibold')) fontWeight = '600';
    if (lowerName.includes('medium')) fontWeight = '500';
    if (lowerName.includes('light')) fontWeight = '300';
    if (lowerName.includes('thin')) fontWeight = '100';
    if (lowerName.includes('italic')) fontStyle = 'italic';

    // Read font file
    const input = fs.readFileSync(filePath);

    // Convert to WOFF2
    const woff2Buffer = ttf2woff2(input);
    const woff2FileName = `${fileNameWithoutExt}.woff2`;
    fs.writeFileSync(path.join(destFontsDir, woff2FileName), woff2Buffer);

    // Generate CSS with correct relative path
    cssContent += `@font-face {
  font-family: '${fontFamily}';
  src: url('../fonts/${woff2FileName}') format('woff2');
  font-weight: ${fontWeight};
  font-style: ${fontStyle};
  font-display: swap;
}\n\n`;

    console.log(`✅ Converted ${file} to ${woff2FileName}`);
  }

  // Write CSS file
  fs.writeFileSync(cssOutputPath, cssContent);
  console.log(`✅ Generated fonts.scss with ${files.length} font-face declarations`);
}

convertFonts().catch(err => {
  console.error('Error converting fonts:', err);
  process.exit(1);
}); 