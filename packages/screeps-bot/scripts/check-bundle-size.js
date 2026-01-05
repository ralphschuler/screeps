#!/usr/bin/env node
/**
 * Bundle Size Checker
 * 
 * Verifies that the built bundle does not exceed the Screeps 2MB upload limit.
 * This prevents accidental deployments of bundles that would be rejected by the server.
 * 
 * Usage: node scripts/check-bundle-size.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BUNDLE_PATH = path.join(__dirname, '../dist/main.js');
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Check if bundle exists
if (!fs.existsSync(BUNDLE_PATH)) {
  console.error('ERROR: Bundle not found at', BUNDLE_PATH);
  console.error('Run "npm run build" first.');
  process.exit(1);
}

// Get bundle size
const stats = fs.statSync(BUNDLE_PATH);
const sizeBytes = stats.size;
const sizeKB = Math.round(sizeBytes / 1024);
const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
const percentUsed = ((sizeBytes / MAX_SIZE_BYTES) * 100).toFixed(1);

// Display results
console.log('Bundle Size Check:');
console.log('  File:', BUNDLE_PATH);
console.log('  Size:', sizeKB + 'KB', `(${sizeMB}MB)`);
console.log('  Limit:', MAX_SIZE_MB * 1024 + 'KB', `(${MAX_SIZE_MB}MB)`);
console.log('  Usage:', percentUsed + '%');

// Check if size is acceptable
if (sizeBytes > MAX_SIZE_BYTES) {
  console.error('\n❌ ERROR: Bundle exceeds', MAX_SIZE_MB + 'MB', 'limit!');
  console.error('Bundle size:', sizeKB + 'KB');
  console.error('Maximum allowed:', MAX_SIZE_MB * 1024 + 'KB');
  process.exit(1);
}

// Warning if close to limit (>80%)
if (sizeBytes > MAX_SIZE_BYTES * 0.8) {
  console.warn('\n⚠️  WARNING: Bundle is using more than 80% of the limit.');
  console.warn('Consider optimizing to maintain a safety margin.');
}

console.log('\n✅ Bundle size is within limits.');
process.exit(0);
