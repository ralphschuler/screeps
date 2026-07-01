#!/usr/bin/env node

/**
 * Script to check if the current Node.js and npm versions meet the minimum requirements.
 * 
 * This is an optional helper script. The primary version enforcement comes from:
 * - package.json "engines" field (enforced by npm with --engine-strict)
 * - .nvmrc file (used by nvm for automatic version switching)
 * 
 * Note: This uses basic version comparison logic suitable for simple ranges.
 * For complex version requirements, npm's built-in engine checking is recommended.
 * 
 * TODO(P3): STYLE - Convert to TypeScript for consistency with the rest of the codebase
 * All other source files are TypeScript
 * TODO(P3): FEATURE - Add support for more complex semver ranges (e.g., ^, ~, ||)
 * Current implementation handles simple whitespace-separated comparators: >=, >, <=, <, and exact.
 */

import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { engines } = require('../package.json');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m'
};

/**
 * Simple version comparison function
 * Returns true if current satisfies the requirement
 */
export function satisfiesVersion(current, required) {
  // Remove 'v' prefix if present
  current = current.replace(/^v/, '');

  // Parse requirement (e.g., ">=24 <25" or ">=16.0.0 <=20.x")
  const parts = required.trim().split(/\s+/).filter(Boolean);

  for (const part of parts) {
    const match = /^(>=|<=|>|<|=)?(.+)$/.exec(part);
    if (!match) {
      continue;
    }

    const operator = match[1] || '=';
    const requiredVersion = match[2];
    if (!compareVersions(current, requiredVersion, operator)) return false;
  }

  return true;
}

export function compareVersions(version1, version2, operator) {
  const v1Parts = parseVersionParts(version1, 0);
  const v2Parts = parseVersionParts(version2, operator === '<=' ? 999 : 0);

  for (let i = 0; i < 3; i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;

    if (v1 > v2) return operator === '>=' || operator === '>';
    if (v1 < v2) return operator === '<=' || operator === '<';
  }

  return operator === '>=' || operator === '<=' || operator === '=';
}

function parseVersionParts(version, wildcardValue) {
  return version
    .replace(/^v/, '')
    .split('.')
    .slice(0, 3)
    .map((part) => {
      if (part === 'x' || part === 'X' || part === '*') return wildcardValue;
      const match = /^\d+/.exec(part);
      return match ? Number(match[0]) : 0;
    });
}

function checkVersion(name, current, required) {
  console.log(`Checking ${name} version...`);
  console.log(`  Required: ${required}`);
  console.log(`  Current:  ${current}`);

  if (!satisfiesVersion(current, required)) {
    console.error(`${colors.red}✗ ${name} version ${current} does not satisfy requirement ${required}${colors.reset}`);
    return false;
  }

  console.log(`${colors.green}✓ ${name} version is compatible${colors.reset}\n`);
  return true;
}

function main() {
  console.log('\n=== Checking environment versions ===\n');

  let allChecksPassed = true;

  // Check Node.js version
  const nodeVersion = process.version.slice(1); // Remove the 'v' prefix
  if (!checkVersion('Node.js', nodeVersion, engines.node)) {
    allChecksPassed = false;
  }

  // Check npm version
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    if (!checkVersion('npm', npmVersion, engines.npm)) {
      allChecksPassed = false;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Failed to check npm version${colors.reset}`);
    allChecksPassed = false;
  }

  if (!allChecksPassed) {
    console.error(`${colors.red}
❌ Version requirements not met!

Please update your Node.js and/or npm to compatible versions.
Supported Node.js versions: ${engines.node}
Supported npm versions: ${engines.npm}

You can use nvm (Node Version Manager) to easily switch versions:

  nvm install  # Uses .nvmrc file
  nvm use

Or download Node.js from: https://nodejs.org/
${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.green}✅ All version checks passed!${colors.reset}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
