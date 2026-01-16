#!/usr/bin/env node

/**
 * Script to add ESLint configuration to all framework packages
 * This adds lint and lint:fix scripts to package.json files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all framework package.json files
const frameworkPackages = [
  'packages/@ralphschuler/screeps-cache',
  'packages/@ralphschuler/screeps-clusters',
  'packages/@ralphschuler/screeps-console',
  'packages/@ralphschuler/screeps-core',
  'packages/@ralphschuler/screeps-empire',
  'packages/@ralphschuler/screeps-intershard',
  'packages/@ralphschuler/screeps-kernel',
  'packages/@ralphschuler/screeps-layouts',
  'packages/@ralphschuler/screeps-pathfinding',
  'packages/@ralphschuler/screeps-remote-mining',
  'packages/@ralphschuler/screeps-roles',
  'packages/@ralphschuler/screeps-standards',
  'packages/@ralphschuler/screeps-stats',
  'packages/@ralphschuler/screeps-visuals',
  'packages/screeps-chemistry',
  'packages/screeps-defense',
  'packages/screeps-economy',
  'packages/screeps-spawn',
  'packages/screeps-utils',
  'packages/screeps-tasks',
  'packages/screeps-posis'
];

console.log('📝 Adding ESLint configuration to framework packages...\n');

let updated = 0;
let skipped = 0;

for (const pkgDir of frameworkPackages) {
  const pkgPath = path.join(process.cwd(), pkgDir, 'package.json');
  
  if (!fs.existsSync(pkgPath)) {
    console.log(`⚠️  Skipping ${pkgDir} - package.json not found`);
    skipped++;
    continue;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  
  // Check if lint scripts already exist
  if (pkg.scripts && pkg.scripts.lint) {
    console.log(`✓ ${pkg.name} - lint scripts already exist`);
    skipped++;
    continue;
  }

  // Add lint scripts
  if (!pkg.scripts) {
    pkg.scripts = {};
  }

  pkg.scripts.lint = 'eslint "src/**/*.ts"';
  pkg.scripts['lint:fix'] = 'eslint "src/**/*.ts" --fix';

  // Write back
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`✓ ${pkg.name} - added lint scripts`);
  updated++;
}

console.log(`\n📊 Summary:`);
console.log(`  Updated: ${updated} packages`);
console.log(`  Skipped: ${skipped} packages`);
console.log(`  Total: ${frameworkPackages.length} packages`);

console.log(`\n✅ Done! Now create eslint.config.js files for each package.`);
