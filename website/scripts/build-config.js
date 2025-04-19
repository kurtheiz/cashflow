// Cross-platform build configuration script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create _redirects file
const redirectsContent = '/* /index.html 200';
fs.writeFileSync(path.join(distDir, '_redirects'), redirectsContent);

// Copy 404.html and error.html to dist
const publicDir = path.join(__dirname, '..', 'public');
const files = ['404.html', 'error.html'];

files.forEach(file => {
  const sourcePath = path.join(publicDir, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to dist folder`);
  } else {
    console.warn(`Warning: ${file} not found in public folder`);
  }
});

console.log('Build configuration completed successfully');
