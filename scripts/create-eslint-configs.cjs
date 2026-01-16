#!/usr/bin/env node

/**
 * Script to create eslint.config.js files for all framework packages
 * Each package gets a minimal config that extends the shared config
 */

const fs = require('fs');
const path = require('path');

// Get all framework package directories
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

const eslintConfigTemplate = `// This package extends the shared ESLint configuration
// The shared config is located at: ../../eslint.config.shared.js

import sharedConfig from "../../eslint.config.shared.js";

export default sharedConfig;
`;

const eslintConfigTemplateRalph = `// This package extends the shared ESLint configuration
// The shared config is located at: ../../../eslint.config.shared.js

import sharedConfig from "../../../eslint.config.shared.js";

export default sharedConfig;
`;

console.log('📝 Creating ESLint config files for framework packages...\n');

let created = 0;
let skipped = 0;

for (const pkgDir of frameworkPackages) {
  const configPath = path.join(process.cwd(), pkgDir, 'eslint.config.js');
  
  if (fs.existsSync(configPath)) {
    console.log(`⚠️  Skipping ${pkgDir} - eslint.config.js already exists`);
    skipped++;
    continue;
  }

  // Determine template based on package path
  const template = pkgDir.includes('@ralphschuler') 
    ? eslintConfigTemplateRalph 
    : eslintConfigTemplate;

  fs.writeFileSync(configPath, template);
  console.log(`✓ Created ${configPath}`);
  created++;
}

console.log(`\n📊 Summary:`);
console.log(`  Created: ${created} config files`);
console.log(`  Skipped: ${skipped} config files`);
console.log(`  Total: ${frameworkPackages.length} packages`);

console.log(`\n✅ Done!`);
