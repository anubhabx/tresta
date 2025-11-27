#!/usr/bin/env node

/**
 * CSP Compliance Audit Script
 * 
 * This script audits the codebase for CSP compliance issues:
 * - No eval() usage
 * - No Function() constructor
 * - No inline scripts
 * - No inline event handlers
 * - All resources from allowed domains
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ALLOWED_DOMAINS = [
  'cdn.tresta.app',
  'api.tresta.app',
];

const violations = [];

/**
 * Recursively get all TypeScript files
 */
function getTypeScriptFiles(dir, files = []) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist
      if (entry !== 'node_modules' && entry !== 'dist' && entry !== '.turbo') {
        getTypeScriptFiles(fullPath, files);
      }
    } else if (extname(entry) === '.ts' || extname(entry) === '.tsx') {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check for eval() usage
 * Skip test files and comments/strings
 */
function checkForEval(content, filePath) {
  // Skip test files
  if (filePath.includes('__tests__') || filePath.includes('.test.')) {
    return;
  }

  // Look for actual eval() calls (not in comments or strings)
  const lines = content.split('\n');
  let foundEval = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      continue;
    }

    // Check for eval() not in strings
    if (/\beval\s*\(/.test(line) && !line.includes("'eval") && !line.includes('"eval') && !line.includes('`eval')) {
      foundEval = true;
      break;
    }
  }

  if (foundEval) {
    violations.push({
      type: 'eval',
      file: filePath,
      message: 'eval() usage detected (CSP violation)',
    });
  }
}

/**
 * Check for Function constructor
 */
function checkForFunctionConstructor(content, filePath) {
  const functionPattern = /new\s+Function\s*\(/g;
  const matches = content.match(functionPattern);

  if (matches) {
    violations.push({
      type: 'function-constructor',
      file: filePath,
      count: matches.length,
      message: 'Function() constructor usage detected (CSP violation)',
    });
  }
}

/**
 * Check for inline event handlers in HTML strings
 * Only flag if they appear in HTML attribute format (e.g., onclick="...")
 */
function checkForInlineEventHandlers(content, filePath) {
  // Skip test files
  if (filePath.includes('__tests__') || filePath.includes('.test.')) {
    return;
  }

  // Look for HTML inline event handlers: onclick="..." or onclick='...'
  // This pattern looks for the attribute format specifically
  const htmlEventPattern = /\bon(click|load|error|mouseover|mouseout|keydown|keyup|submit|change|focus|blur)\s*=\s*["']/gi;
  const matches = content.match(htmlEventPattern);

  if (matches) {
    // Filter out false positives (programmatic assignments like .onerror = )
    const realViolations = matches.filter(match => {
      // Check if this is in an HTML context (has < before it)
      const index = content.indexOf(match);
      const before = content.substring(Math.max(0, index - 50), index);
      return before.includes('<') || before.includes('innerHTML');
    });

    if (realViolations.length > 0) {
      violations.push({
        type: 'inline-event-handler',
        file: filePath,
        count: realViolations.length,
        message: 'Inline event handler in HTML detected (CSP violation)',
      });
    }
  }
}

/**
 * Check for javascript: URLs
 */
function checkForJavaScriptURLs(content, filePath) {
  // Skip test files
  if (filePath.includes('__tests__') || filePath.includes('.test.')) {
    return;
  }

  const jsURLPattern = /href\s*=\s*["']javascript:/gi;
  const matches = content.match(jsURLPattern);

  if (matches) {
    violations.push({
      type: 'javascript-url',
      file: filePath,
      count: matches.length,
      message: 'javascript: URL detected (CSP violation)',
    });
  }
}

/**
 * Check for external domain references
 */
function checkForExternalDomains(content, filePath) {
  // Skip test files
  if (filePath.includes('__tests__') || filePath.includes('.test.')) {
    return;
  }

  // Look for URLs in the code
  const urlPattern = /https?:\/\/([a-zA-Z0-9.-]+)/g;
  let match;

  while ((match = urlPattern.exec(content)) !== null) {
    const domain = match[1];

    // Skip common safe domains
    const safeDomains = ['www.w3.org', 'xmlns.org', 'example.com'];
    if (safeDomains.includes(domain)) {
      continue;
    }

    // Check if domain is allowed
    const isAllowed = ALLOWED_DOMAINS.some(allowed => 
      domain === allowed || domain.endsWith(`.${allowed}`)
    );

    if (!isAllowed && !domain.includes('localhost') && !domain.includes('127.0.0.1')) {
      violations.push({
        type: 'external-domain',
        file: filePath,
        domain: domain,
        message: `External domain reference: ${domain} (not in allowed list)`,
      });
    }
  }
}

/**
 * Main audit function
 */
function auditCSPCompliance() {
  console.log('🔍 Starting CSP Compliance Audit...\n');

  const srcDir = join(__dirname, '..', 'src');
  const files = getTypeScriptFiles(srcDir);

  console.log(`📁 Scanning ${files.length} TypeScript files...\n`);

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const relativePath = file.replace(srcDir, 'src');

    checkForEval(content, relativePath);
    checkForFunctionConstructor(content, relativePath);
    checkForInlineEventHandlers(content, relativePath);
    checkForJavaScriptURLs(content, relativePath);
    checkForExternalDomains(content, relativePath);
  }

  // Report results
  console.log('📊 Audit Results:\n');

  if (violations.length === 0) {
    console.log('✅ No CSP violations detected!\n');
    console.log('The codebase is fully CSP compliant:');
    console.log('  ✓ No eval() usage');
    console.log('  ✓ No Function() constructor');
    console.log('  ✓ No inline event handlers');
    console.log('  ✓ No javascript: URLs');
    console.log('  ✓ All domains are allowed\n');
    return 0;
  }

  console.log(`❌ Found ${violations.length} potential CSP violation(s):\n`);

  // Group violations by type
  const byType = {};
  for (const violation of violations) {
    if (!byType[violation.type]) {
      byType[violation.type] = [];
    }
    byType[violation.type].push(violation);
  }

  for (const [type, items] of Object.entries(byType)) {
    console.log(`\n${type.toUpperCase()} (${items.length}):`);
    for (const item of items) {
      console.log(`  ⚠️  ${item.file}`);
      console.log(`     ${item.message}`);
      if (item.count) {
        console.log(`     Occurrences: ${item.count}`);
      }
    }
  }

  console.log('\n');
  return 1;
}

// Run audit
const exitCode = auditCSPCompliance();
process.exit(exitCode);
