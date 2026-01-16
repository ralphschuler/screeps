#!/usr/bin/env node
/**
 * Framework Package Dependency Synchronization Script
 * 
 * This script ensures all @ralphschuler/screeps-* framework packages have
 * consistent devDependencies by reading from a shared configuration file
 * and updating all package.json files.
 * 
 * Usage:
 *   node scripts/sync-framework-deps.js [--check]
 * 
 * Options:
 *   --check    Only check for inconsistencies without modifying files
 */

const fs = require('fs');
const path = require('path');

// Load shared dependencies configuration
const sharedDepsPath = path.join(__dirname, 'shared-dependencies.json');
const sharedDepsConfig = JSON.parse(fs.readFileSync(sharedDepsPath, 'utf8'));
const sharedDevDeps = sharedDepsConfig.framework.devDependencies;

// Find all framework packages
const packagesDir = path.join(__dirname, '..', 'packages', '@ralphschuler');
const packageDirs = fs.readdirSync(packagesDir)
  .filter(dir => fs.statSync(path.join(packagesDir, dir)).isDirectory())
  .map(dir => path.join(packagesDir, dir, 'package.json'))
  .filter(pkgPath => fs.existsSync(pkgPath));

// Check if running in check-only mode
const checkOnly = process.argv.includes('--check');

let hasInconsistencies = false;
let updatedCount = 0;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Framework Package Dependency Synchronization');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log(`Mode: ${checkOnly ? 'CHECK ONLY' : 'SYNC'}`);
console.log(`Found ${packageDirs.length} framework packages`);
console.log('');

packageDirs.forEach(pkgPath => {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const packageName = pkg.name;
  const relativePath = path.relative(process.cwd(), pkgPath);
  
  // Initialize devDependencies if it doesn't exist
  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }
  
  // Check for inconsistencies
  const inconsistencies = [];
  
  for (const [depName, depVersion] of Object.entries(sharedDevDeps)) {
    const currentVersion = pkg.devDependencies[depName];
    
    if (!currentVersion) {
      inconsistencies.push(`  + ${depName}: ${depVersion} (missing)`);
    } else if (currentVersion !== depVersion) {
      inconsistencies.push(`  ~ ${depName}: ${currentVersion} → ${depVersion} (outdated)`);
    }
  }
  
  if (inconsistencies.length > 0) {
    hasInconsistencies = true;
    console.log(`📦 ${packageName}`);
    console.log(`   ${relativePath}`);
    inconsistencies.forEach(msg => console.log(msg));
    console.log('');
    
    if (!checkOnly) {
      // Merge shared devDependencies (preserving other deps)
      pkg.devDependencies = {
        ...pkg.devDependencies,
        ...sharedDevDeps
      };
      
      // Sort devDependencies alphabetically for consistency
      const sortedDevDeps = {};
      Object.keys(pkg.devDependencies).sort().forEach(key => {
        sortedDevDeps[key] = pkg.devDependencies[key];
      });
      pkg.devDependencies = sortedDevDeps;
      
      // Write back to file with consistent formatting
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      updatedCount++;
      console.log(`   ✅ Updated`);
      console.log('');
    }
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

if (checkOnly) {
  if (hasInconsistencies) {
    console.log('❌ FAIL: Found dependency inconsistencies');
    console.log('');
    console.log('Run `npm run sync:deps` to synchronize all packages');
    process.exit(1);
  } else {
    console.log('✅ PASS: All framework packages have consistent dependencies');
  }
} else {
  if (updatedCount > 0) {
    console.log(`✨ Synchronized ${updatedCount} framework packages`);
    console.log('');
    console.log('All packages now have consistent devDependencies from:');
    console.log(`   ${sharedDepsPath}`);
  } else {
    console.log('✅ All packages already synchronized');
  }
}

console.log('');
