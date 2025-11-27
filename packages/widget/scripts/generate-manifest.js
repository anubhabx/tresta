#!/usr/bin/env node

/**
 * Release Manifest Generator
 * 
 * Generates a JSON manifest containing:
 * - Version number
 * - File paths and sizes
 * - SHA-384 integrity hashes for SRI
 * - Build timestamp
 * 
 * Used by admin panel to generate embed code with correct URLs and integrity hashes
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '../dist');
const PACKAGE_JSON = join(__dirname, '../package.json');

/**
 * Generate SHA-384 hash for a file
 */
function generateIntegrityHash(filePath) {
  const content = readFileSync(filePath);
  const hash = createHash('sha384').update(content).digest('base64');
  return `sha384-${hash}`;
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  return statSync(filePath).size;
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get all files in directory (non-recursive)
 */
function getFiles(dirPath) {
  try {
    return readdirSync(dirPath)
      .filter(file => {
        const filePath = join(dirPath, file);
        return statSync(filePath).isFile();
      })
      .map(file => join(dirPath, file));
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
    return [];
  }
}

/**
 * Main manifest generation function
 */
function generateManifest() {
  console.log('\n📋 Generating release manifest...\n');

  try {
    // Read package version
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON, 'utf-8'));
    const version = process.env.WIDGET_VERSION || packageJson.version;

    // Get all files in dist directory
    const files = getFiles(DIST_DIR);
    
    if (files.length === 0) {
      console.error('❌ No files found in dist directory');
      process.exit(1);
    }

    // Generate manifest entries
    const assets = {};
    
    files.forEach(filePath => {
      const fileName = relative(DIST_DIR, filePath);
      
      // Skip source maps (they're uploaded separately to private storage)
      if (fileName.endsWith('.map')) {
        return;
      }

      const size = getFileSize(filePath);
      const integrity = generateIntegrityHash(filePath);
      
      // Determine asset type
      let type = 'other';
      if (fileName.endsWith('.js')) type = 'script';
      else if (fileName.endsWith('.css')) type = 'stylesheet';
      else if (fileName.endsWith('.gz')) type = 'compressed';
      else if (fileName.endsWith('.br')) type = 'compressed';
      
      assets[fileName] = {
        path: fileName,
        size: size,
        sizeFormatted: formatBytes(size),
        integrity: integrity,
        type: type,
      };

      console.log(`✅ ${fileName.padEnd(35)} ${formatBytes(size).padStart(10)} ${integrity.substring(0, 20)}...`);
    });

    // Build manifest
    const manifest = {
      version: version,
      buildTime: new Date().toISOString(),
      assets: assets,
      cdn: {
        baseUrl: `https://cdn.tresta.app/widget/v${version}`,
        versionedUrl: `https://cdn.tresta.app/widget/v${version}/tresta-widget.iife.js`,
        majorVersionUrl: `https://cdn.tresta.app/widget/v${version.split('.')[0]}/tresta-widget.iife.js`,
      },
      embedCode: {
        standard: generateStandardEmbed(version),
        cspFriendly: generateCSPEmbed(version, assets['tresta-widget.iife.js']?.integrity),
      },
    };

    // Write manifest to dist directory
    const manifestPath = join(DIST_DIR, 'manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log('\n─'.repeat(80));
    console.log(`✅ Manifest generated successfully`);
    console.log(`   Version: ${version}`);
    console.log(`   Assets: ${Object.keys(assets).length} files`);
    console.log(`   Output: ${manifestPath}`);
    console.log('─'.repeat(80));
    console.log('');

  } catch (error) {
    console.error('❌ Error generating manifest:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Generate standard embed code
 */
function generateStandardEmbed(version) {
  return `<!-- Tresta Testimonial Widget -->
<div id="tresta-widget-{WIDGET_ID}" data-widget-id="{WIDGET_ID}"></div>
<script async src="https://cdn.tresta.app/widget/v${version}/tresta-widget.iife.js" 
        data-widget-id="{WIDGET_ID}"></script>`;
}

/**
 * Generate CSP-friendly embed code with SRI
 */
function generateCSPEmbed(version, integrity) {
  return `<!-- Tresta Testimonial Widget (CSP-friendly with SRI) -->
<div id="tresta-widget-{WIDGET_ID}" data-widget-id="{WIDGET_ID}"></div>
<script async 
        src="https://cdn.tresta.app/widget/v${version}/tresta-widget.iife.js" 
        integrity="${integrity || 'sha384-HASH_WILL_BE_GENERATED'}"
        crossorigin="anonymous"
        data-widget-id="{WIDGET_ID}"></script>`;
}

// Run the generator
generateManifest();
