# Package Development Guide

Learn how to **create new framework packages** and contribute to the Screeps Framework.

---

## Table of Contents

- [Overview](#overview)
- [Creating a New Package](#creating-a-new-package)
- [Package Structure](#package-structure)
- [Development Workflow](#development-workflow)
- [API Design Guidelines](#api-design-guidelines)
- [Documentation Requirements](#documentation-requirements)
- [Publishing Packages](#publishing-packages)

---

## Overview

The Screeps Framework is built as a **monorepo** using npm workspaces. Each package is independently publishable to npm.

### Package Naming Convention

- Framework packages: `@ralphschuler/screeps-*`
- Legacy packages: `screeps-*` (being migrated)

### Package Categories

1. **Core Infrastructure** - Foundation packages (core, cache, memory)
2. **Coordination** - Kernel, pheromones, stats
3. **Architectural** - Empire, intershard, clusters
4. **Functional** - Spawn, economy, defense, chemistry
5. **Behavior** - Roles, tasks
6. **Utilities** - Console, visuals, pathfinding, layouts

---

## Creating a New Package

### Step 1: Use Package Template

```bash
# Create package directory
mkdir -p packages/@ralphschuler/screeps-mynew

# Copy template structure
cp -r packages/@ralphschuler/screeps-core/* packages/@ralphschuler/screeps-mynew/
```

### Step 2: Update package.json

```json
{
  "name": "@ralphschuler/screeps-mynew",
  "version": "0.1.0",
  "description": "Short description of your package",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src",
    "clean": "rm -rf dist"
  },
  "keywords": [
    "screeps",
    "framework",
    "mynew"
  ],
  "author": "Your Name",
  "license": "Unlicense",
  "repository": {
    "type": "git",
    "url": "https://github.com/ralphschuler/screeps",
    "directory": "packages/@ralphschuler/screeps-mynew"
  },
  "dependencies": {
    "@types/screeps": "^3.3.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

### Step 3: Create Source Structure

```
packages/@ralphschuler/screeps-mynew/
├── src/
│   ├── index.ts          # Main exports
│   ├── Manager.ts        # Main class
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
├── test/
│   ├── Manager.test.ts   # Unit tests
│   └── utils.test.ts
├── README.md             # Package documentation
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Step 4: Implement Core Functionality

```typescript
// src/Manager.ts
export class MyNewManager {
  constructor(private options: MyNewOptions = {}) {
    // Initialize
  }
  
  public run(): void {
    // Main logic
  }
}

// src/types.ts
export interface MyNewOptions {
  debug?: boolean;
  // ...
}

// src/index.ts
export { MyNewManager } from './Manager';
export type { MyNewOptions } from './types';
```

---

## Package Structure

### Required Files

1. **README.md** - Comprehensive package documentation
2. **package.json** - Package metadata and dependencies
3. **tsconfig.json** - TypeScript configuration
4. **src/index.ts** - Main entry point
5. **test/** - Unit tests
6. **LICENSE** - Unlicense (public domain)

### TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ]
};
```

---

## Development Workflow

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Link workspace packages
npm run sync:deps
```

### 2. Build Package

```bash
# Build single package
npm run build -w @ralphschuler/screeps-mynew

# Build all packages
npm run build
```

### 3. Run Tests

```bash
# Test single package
npm test -w @ralphschuler/screeps-mynew

# Test all packages
npm test
```

### 4. Lint Code

```bash
# Lint single package
npm run lint -w @ralphschuler/screeps-mynew

# Lint all packages
npm run lint
```

### 5. Local Development

```bash
# Watch mode for development
cd packages/@ralphschuler/screeps-mynew
npm run build -- --watch
```

---

## API Design Guidelines

### 1. Keep Interfaces Simple

```typescript
// Good: Simple, focused interface
export class SpawnManager {
  processSpawnQueue(spawns: StructureSpawn[], requests: SpawnRequest[]): void {
    // ...
  }
}

// Bad: Too many parameters, complex interface
export class SpawnManager {
  processSpawnQueue(
    spawns: StructureSpawn[],
    requests: SpawnRequest[],
    options: SpawnOptions,
    callbacks: SpawnCallbacks,
    validators: SpawnValidators
  ): void {
    // Too complex!
  }
}
```

### 2. Use TypeScript Strictly

```typescript
// Enable strict mode
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}

// Export all types
export type { SpawnRequest, SpawnOptions } from './types';
```

### 3. Minimize Dependencies

```typescript
// Good: Minimal dependencies
{
  "dependencies": {
    "@types/screeps": "^3.3.0"
  }
}

// Acceptable: Framework dependencies
{
  "dependencies": {
    "@types/screeps": "^3.3.0",
    "@ralphschuler/screeps-cache": "^0.1.0"
  }
}

// Bad: Many external dependencies
{
  "dependencies": {
    "lodash": "^4.17.0",
    "moment": "^2.29.0",
    // ... many more
  }
}
```

### 4. Provide Sensible Defaults

```typescript
export interface ManagerOptions {
  debug?: boolean;
  cpuBudget?: number;
  interval?: number;
}

export class Manager {
  constructor(options: ManagerOptions = {}) {
    this.debug = options.debug ?? false;
    this.cpuBudget = options.cpuBudget ?? 1.0;
    this.interval = options.interval ?? 10;
  }
}
```

### 5. Support Both Direct and Kernel Integration

```typescript
// Direct integration (simple)
const manager = new MyManager();
manager.run();

// Kernel integration (advanced)
kernel.registerProcess({
  id: 'mynew',
  execute: () => manager.run(),
  cpuBudget: 0.5
});
```

---

## Documentation Requirements

### README Structure

Use the [Package README Template](../../PACKAGE_README_TEMPLATE.md):

1. **Overview** - What the package does
2. **Installation** - How to install
3. **Quick Start** - Get running in 5 minutes
4. **Features** - Key capabilities
5. **API Reference** - Complete API documentation
6. **Usage Examples** - 3+ working examples
7. **Integration Guide** - How to use with other packages
8. **Configuration** - Available options
9. **Performance** - CPU characteristics
10. **Troubleshooting** - Common issues
11. **Development** - Contributing guide
12. **Testing** - How to run tests
13. **License** - Unlicense
14. **Related Packages** - Links to related packages

### JSDoc Comments

```typescript
/**
 * Manages spawning of creeps with priority-based queue.
 * 
 * @example
 * ```typescript
 * const manager = new SpawnManager({ debug: true });
 * manager.processSpawnQueue(spawns, requests);
 * ```
 */
export class SpawnManager {
  /**
   * Process spawn queue and spawn creeps in priority order.
   * 
   * @param spawns - Array of spawns to use
   * @param requests - Spawn requests with priorities
   * @returns Number of creeps spawned
   */
  processSpawnQueue(
    spawns: StructureSpawn[],
    requests: SpawnRequest[]
  ): number {
    // ...
  }
}
```

### Code Examples

Every package should have 3+ working examples:

```typescript
// Example 1: Basic usage
const manager = new Manager();
manager.run();

// Example 2: With options
const manager = new Manager({ debug: true });

// Example 3: Advanced integration
kernel.registerProcess({
  id: 'manager',
  execute: () => manager.run()
});
```

---

## Publishing Packages

### 1. Version Management

Follow [Semantic Versioning](https://semver.org/):

```bash
# Patch version (bug fixes)
npm version patch -w @ralphschuler/screeps-mynew

# Minor version (new features)
npm version minor -w @ralphschuler/screeps-mynew

# Major version (breaking changes)
npm version major -w @ralphschuler/screeps-mynew
```

### 2. Pre-Publish Checklist

- [ ] All tests pass
- [ ] Code is linted
- [ ] Documentation is complete
- [ ] README has examples
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Build succeeds

### 3. Publish to npm

```bash
# Build package
npm run build -w @ralphschuler/screeps-mynew

# Publish
npm publish -w @ralphschuler/screeps-mynew --access public
```

### 4. Create Git Tag

```bash
git tag @ralphschuler/screeps-mynew@0.1.0
git push --tags
```

---

## Best Practices

### 1. Write Tests

```typescript
describe('SpawnManager', () => {
  it('should spawn creeps in priority order', () => {
    const manager = new SpawnManager();
    const requests = [
      { role: 'harvester', priority: 100 },
      { role: 'upgrader', priority: 80 }
    ];
    
    // Test implementation
  });
});
```

### 2. Profile Performance

```typescript
// Add performance notes to README
/**
 * ## Performance
 * 
 * - Base CPU: ~0.05 CPU per room per tick
 * - With 10 spawn requests: ~0.15 CPU
 * - Caching enabled: ~0.02 CPU (cached)
 */
```

### 3. Handle Errors Gracefully

```typescript
try {
  this.processSpawnQueue(spawns, requests);
} catch (error) {
  console.log(`Error in spawn manager: ${error}`);
  // Don't crash the bot
}
```

### 4. Support Configuration

```typescript
export interface Config {
  enabled?: boolean;
  debug?: boolean;
  cpuBudget?: number;
}

export class Manager {
  constructor(private config: Config = {}) {
    this.config = {
      enabled: true,
      debug: false,
      cpuBudget: 1.0,
      ...config
    };
  }
}
```

---

## Related Documentation

- **[Testing Guide](testing.md)** - Testing requirements
- **[Release Process](release-process.md)** - Publishing workflow
- **[Package Template](../../PACKAGE_README_TEMPLATE.md)** - README template

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
