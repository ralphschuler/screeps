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

// Helper function to exit with error
function exitWithError(message) {
  console.error('');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ ERROR');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('');
  console.error(message);
  console.error('');
  process.exit(1);
}

// Load shared dependencies configuration
const sharedDepsPath = path.join(__dirname, 'shared-dependencies.json');

let sharedDepsConfig;
try {
  const configContent = fs.readFileSync(sharedDepsPath, 'utf8');
  sharedDepsConfig = JSON.parse(configContent);
} catch (error) {
  if (error.code === 'ENOENT') {
    exitWithError(`Shared dependencies file not found: ${sharedDepsPath}\nPlease create this file with framework devDependencies.`);
  } else if (error instanceof SyntaxError) {
    exitWithError(`Invalid JSON in shared dependencies file: ${sharedDepsPath}\n${error.message}`);
  } else {
    exitWithError(`Failed to read shared dependencies file: ${error.message}`);
  }
}

if (!sharedDepsConfig.framework || !sharedDepsConfig.framework.devDependencies) {
  exitWithError(`Invalid shared dependencies config: ${sharedDepsPath}\nMissing framework.devDependencies property.`);
}

const sharedDevDeps = sharedDepsConfig.framework.devDependencies;

// Find all framework packages: any package.json under packages/ whose name starts with @ralphschuler/screeps-
// Excludes MCP packages, server, tasks, and posis which have different dependency requirements
const packagesDir = path.join(__dirname, '..', 'packages');

if (!fs.existsSync(packagesDir)) {
  exitWithError(`Packages directory not found: ${packagesDir}\nExpected directory structure: packages/ containing @ralphschuler/screeps-* packages.`);
}

/**
 * Recursively find all package.json files under a root directory whose
 * package name starts with @ralphschuler/screeps- but exclude non-framework packages.
 */
function findFrameworkPackageJsons(rootDir) {
  const results = [];
  const excludedPackages = [
    '@ralphschuler/screeps-mcp',
    '@ralphschuler/screeps-docs-mcp',
    '@ralphschuler/screeps-wiki-mcp',
    '@ralphschuler/screeps-typescript-mcp',
    '@ralphschuler/screeps-server',
    '@ralphschuler/screeps-tasks',
    '@ralphschuler/screeps-posis'
  ];

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      // Silently ignore directories we cannot read
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules directories
      if (entry.isDirectory() && entry.name === 'node_modules') {
        continue;
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name === 'package.json') {
        try {
          const pkgContent = fs.readFileSync(fullPath, 'utf8');
          const pkgJson = JSON.parse(pkgContent);
          if (
            typeof pkgJson.name === 'string' &&
            pkgJson.name.startsWith('@ralphschuler/screeps-') &&
            !excludedPackages.includes(pkgJson.name)
          ) {
            results.push(fullPath);
          }
        } catch {
          // Silently ignore unreadable or invalid package.json files
        }
      }
    }
  }

  walk(rootDir);
  return results;
}

let packageDirs;
try {
  packageDirs = findFrameworkPackageJsons(packagesDir);
} catch (error) {
  exitWithError(`Failed to scan packages directory: ${error.message}`);
}

if (packageDirs.length === 0) {
  exitWithError(`No framework packages found in: ${packagesDir}\nExpected at least one package with name starting with @ralphschuler/screeps-.`);
}

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
  let pkg;
  try {
    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    pkg = JSON.parse(pkgContent);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`⚠️  Skipping ${pkgPath}: Invalid JSON - ${error.message}`);
    } else {
      console.error(`⚠️  Skipping ${pkgPath}: ${error.message}`);
    }
    return;
  }
  
  const packageName = pkg.name;
  const relativePath = path.relative(process.cwd(), pkgPath);
  
  // Initialize devDependencies if it doesn't exist
  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }
  
  // Check for inconsistencies
  const inconsistencies = [];
  
  // Check for missing or outdated shared dependencies
  for (const [depName, depVersion] of Object.entries(sharedDevDeps)) {
    const currentVersion = pkg.devDependencies[depName];
    
    if (!currentVersion) {
      inconsistencies.push(`  + ${depName}: ${depVersion} (missing)`);
    } else if (currentVersion !== depVersion) {
      inconsistencies.push(`  ~ ${depName}: ${currentVersion} → ${depVersion} (outdated)`);
    }
  }
  
  // Check for dependencies that are in package but not in shared config
  // These might be package-specific dependencies or removed shared dependencies
  const sharedDepNames = Object.keys(sharedDevDeps);
  for (const depName of Object.keys(pkg.devDependencies)) {
    if (!sharedDepNames.includes(depName)) {
      // This is either a package-specific dependency (keep it) or a removed shared dependency
      // We don't flag this as an inconsistency since we preserve package-specific deps
    }
  }
  
  if (inconsistencies.length > 0) {
    hasInconsistencies = true;
    console.log(`📦 ${packageName}`);
    console.log(`   ${relativePath}`);
    inconsistencies.forEach(msg => console.log(msg));
    console.log('');
    
    if (!checkOnly) {
      // Merge shared devDependencies (preserving package-specific deps)
      // Note: If a dependency is removed from shared-dependencies.json,
      // it will persist in package.json files as a package-specific dependency.
      // To fully remove a shared dependency, manually delete it from each package.json
      // or modify this script to track and remove explicitly removed dependencies.
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
      try {
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        updatedCount++;
        console.log(`   ✅ Updated`);
        console.log('');
      } catch (error) {
        console.error(`   ❌ Failed to write: ${error.message}`);
        console.error('');
      }
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
