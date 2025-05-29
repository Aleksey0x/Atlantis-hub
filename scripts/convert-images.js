import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Paths configuration
const srcImagesDir = path.resolve('src/assets/images');
const destImagesDir = path.resolve('src/images');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destImagesDir)) {
  fs.mkdirSync(destImagesDir, { recursive: true });
}

// Main function to convert images
async function convertImages() {
  console.log('🔍 Looking for image files...');
  
  // Get all image files
  const files = fs.readdirSync(srcImagesDir).filter(file => 
    /\.(jpg|jpeg|png|gif)$/i.test(file)
  );
  
  if (files.length === 0) {
    console.log('❌ No image files found in src/assets/images');
    return;
  }
  
  console.log(`✅ Found ${files.length} image file(s)`);
  
  // Process each image file
  for (const file of files) {
    const filePath = path.join(srcImagesDir, file);
    const fileNameWithoutExt = path.basename(file, path.extname(file));
    const webpFileName = `${fileNameWithoutExt}.webp`;
    const outputPath = path.join(destImagesDir, webpFileName);
    
    try {
      // Convert to WebP with 80% quality
      await sharp(filePath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      console.log(`✅ Converted ${file} to ${webpFileName}`);
    } catch (err) {
      console.error(`❌ Error converting ${file}: ${err.message}`);
    }
  }
  
  console.log(`✅ Converted ${files.length} image(s) to WebP format`);
}

convertImages().catch(err => {
  console.error('Error converting images:', err);
  process.exit(1);
}); 