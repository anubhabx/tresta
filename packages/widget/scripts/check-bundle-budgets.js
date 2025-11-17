#!/usr/bin/env node

/**
 * Bundle Size Budget Checker
 * 
 * Enforces bundle size limits:
 * - Core runtime: 50KB gzipped (target), 100KB (hard limit)
 * - Layout chunks: 12KB gzipped each
 * - Total bundle: 100KB gzipped
 * 
 * Exits with code 1 if any budget is exceeded
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '../dist');

// Budget limits in bytes
const BUDGETS = {
  CORE_TARGET: 50 * 1024, // 50KB
  CORE_MAX: 100 * 1024,   // 100KB
  LAYOUT_MAX: 12 * 1024,  // 12KB per layout
  TOTAL_MAX: 100 * 1024,  // 100KB total
};

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    return statSync(filePath).size;
  } catch (error) {
    return 0;
  }
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
 * Get all files in directory recursively
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Main budget check function
 */
function checkBudgets() {
  console.log('\n📦 Checking bundle size budgets...\n');

  try {
    const allFiles = getAllFiles(DIST_DIR);
    
    // Filter for .gz files
    const gzFiles = allFiles.filter(f => f.endsWith('.gz'));
    
    if (gzFiles.length === 0) {
      console.error('❌ No gzipped files found in dist directory');
      console.error('   Make sure to run build with compression enabled');
      process.exit(1);
    }

    let hasErrors = false;
    let hasWarnings = false;
    let totalSize = 0;

    // Check each file
    const results = gzFiles.map(filePath => {
      const fileName = filePath.split('/').pop().replace('.gz', '');
      const size = getFileSize(filePath);
      totalSize += size;

      let status = '✅';
      let message = '';
      let isError = false;
      let isWarning = false;

      // Check core bundle
      if (fileName.includes('tresta-widget.iife.js') || fileName.includes('index')) {
        if (size > BUDGETS.CORE_MAX) {
          status = '❌';
          message = `Exceeds hard limit (${formatBytes(BUDGETS.CORE_MAX)})`;
          isError = true;
          hasErrors = true;
        } else if (size > BUDGETS.CORE_TARGET) {
          status = '⚠️';
          message = `Exceeds target (${formatBytes(BUDGETS.CORE_TARGET)})`;
          isWarning = true;
          hasWarnings = true;
        } else {
          message = `Within target (${formatBytes(BUDGETS.CORE_TARGET)})`;
        }
      }
      // Check layout chunks
      else if (fileName.includes('layout-')) {
        if (size > BUDGETS.LAYOUT_MAX) {
          status = '❌';
          message = `Exceeds limit (${formatBytes(BUDGETS.LAYOUT_MAX)})`;
          isError = true;
          hasErrors = true;
        } else {
          message = `Within limit (${formatBytes(BUDGETS.LAYOUT_MAX)})`;
        }
      }
      // Other chunks
      else {
        message = 'No specific limit';
      }

      return {
        fileName,
        size,
        status,
        message,
        isError,
        isWarning,
      };
    });

    // Print results
    console.log('Individual Files:');
    console.log('─'.repeat(80));
    results.forEach(({ fileName, size, status, message }) => {
      console.log(`${status} ${fileName.padEnd(40)} ${formatBytes(size).padStart(10)} - ${message}`);
    });

    console.log('─'.repeat(80));
    console.log(`   Total Bundle Size:                      ${formatBytes(totalSize).padStart(10)}`);
    console.log('');

    // Check total size
    if (totalSize > BUDGETS.TOTAL_MAX) {
      console.error(`❌ Total bundle size ${formatBytes(totalSize)} exceeds limit of ${formatBytes(BUDGETS.TOTAL_MAX)}`);
      hasErrors = true;
    } else {
      console.log(`✅ Total bundle size ${formatBytes(totalSize)} is within limit of ${formatBytes(BUDGETS.TOTAL_MAX)}`);
    }

    console.log('');

    // Summary
    if (hasErrors) {
      console.error('❌ Bundle size check FAILED - budgets exceeded');
      console.error('   Please optimize bundle size before deploying');
      process.exit(1);
    } else if (hasWarnings) {
      console.warn('⚠️  Bundle size check PASSED with warnings');
      console.warn('   Consider optimizing to meet target budgets');
      process.exit(0);
    } else {
      console.log('✅ Bundle size check PASSED - all budgets met');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error checking bundle budgets:', error.message);
    process.exit(1);
  }
}

// Run the check
checkBudgets();
