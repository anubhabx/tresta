import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '../../..');
const sourceDir = path.resolve(repoRoot, 'packages/widget/dist');
const destDir = path.resolve(__dirname, '../public/widget');

async function copyWidgetBundle() {
  console.log(`[copy-widget] Copying from ${sourceDir} to ${destDir}`);

  // Ensure destination exists and is clean to avoid stale assets
  await mkdir(destDir, { recursive: true });
  await rm(destDir, { recursive: true, force: true });
  await mkdir(destDir, { recursive: true });

  await cp(sourceDir, destDir, { recursive: true });

  console.log('[copy-widget] Widget assets copied successfully');
}

copyWidgetBundle().catch((error) => {
  console.error('[copy-widget] Failed to copy widget assets:', error);
  process.exitCode = 1;
});
