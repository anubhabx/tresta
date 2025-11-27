
import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src', 'generated');
const destDir = path.join(process.cwd(), 'dist', 'generated');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(srcDir)) {
    console.log(`Copying ${srcDir} to ${destDir}...`);
    copyDir(srcDir, destDir);
    console.log('Done.');
} else {
    console.log(`Source directory ${srcDir} does not exist. Skipping copy.`);
}
