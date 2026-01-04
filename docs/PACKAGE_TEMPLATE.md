# Package Template Guide

This guide explains how to create new packages in the screeps monorepo for extracting subsystems.

## Package Structure

Each package follows this standard structure:

```
packages/@ralphschuler/screeps-<name>/
├── src/
│   ├── index.ts          # Public API exports
│   ├── types.ts          # TypeScript type definitions
│   └── ...               # Implementation files
├── test/
│   ├── setup.ts          # Test setup and mocks
│   └── *.test.ts         # Test files
├── .mocharc.json         # Mocha test configuration
├── package.json          # Package metadata and dependencies
├── tsconfig.json         # TypeScript build configuration
├── tsconfig.test.json    # TypeScript test configuration
└── README.md             # Package documentation

```

## File Templates

### package.json

```json
{
  "name": "@ralphschuler/screeps-<name>",
  "version": "0.1.0",
  "description": "Brief description of what this package does",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "private": false,
  "scripts": {
    "build": "tsc",
    "test": "mocha test/**/*.test.ts",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "screeps",
    "<relevant-keyword>",
    "typescript"
  ],
  "author": "Ralph Schuler",
  "license": "Unlicense",
  "devDependencies": {
    "@types/chai": "^5.2.3",
    "@types/mocha": "^10.0.10",
    "@types/node": "^25.0.3",
    "@types/screeps": "^3.3.8",
    "chai": "^6.2.2",
    "mocha": "^11.7.5",
    "ts-node": "^10.2.0",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.4.3"
  }
}
```

### tsconfig.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node", "screeps"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### tsconfig.test.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["node", "mocha", "chai", "screeps"]
  },
  "include": ["src/**/*", "test/**/*"]
}
```

### .mocharc.json

```json
{
  "require": ["ts-node/register/transpile-only", "test/setup.ts"],
  "extension": ["ts"],
  "spec": "test/**/*.test.ts"
}
```

### test/setup.ts

```typescript
/**
 * Test setup and global mocks for Screeps tests
 */

// Mock global Game object
(global as any).Game = {
  time: 1000,
  cpu: {
    getUsed: () => 0,
    limit: 100,
    bucket: 10000
  },
  rooms: {},
  creeps: {},
  spawns: {},
  structures: {},
  flags: {},
  gcl: { level: 1, progress: 0, progressTotal: 1000000 },
  gpl: { level: 0, progress: 0, progressTotal: 1000000 },
  market: {},
  resources: {},
  shard: { name: 'shard0', type: 'normal', ptr: false }
};

// Mock Memory
(global as any).Memory = {
  stats: {},
  rooms: {},
  creeps: {}
};

// Mock RawMemory
(global as any).RawMemory = {
  segments: {},
  get: () => '',
  set: () => {}
};

// Mock InterShardMemory
(global as any).InterShardMemory = {
  getLocal: () => '',
  setLocal: () => {},
  getRemote: () => ''
};

// Add other common mocks as needed
```

### src/index.ts

```typescript
/**
 * @ralphschuler/screeps-<name>
 * 
 * Description of what this package provides
 */

export * from './types';
// Export main functionality
```

### README.md

```markdown
# @ralphschuler/screeps-<name>

Brief description of what this package does.

## Installation

\`\`\`bash
npm install @ralphschuler/screeps-<name>
\`\`\`

## Usage

\`\`\`typescript
import { SomeExport } from '@ralphschuler/screeps-<name>';

// Example usage
\`\`\`

## API

### SomeClass

Description of the class/function/export

**Methods:**
- \`method()\` - Description

## Features

- Feature 1
- Feature 2
- Feature 3

## Testing

\`\`\`bash
npm test
\`\`\`

## License

Unlicense
```

## Steps to Create a New Package

1. **Create the package directory:**
   ```bash
   mkdir -p packages/@ralphschuler/screeps-<name>/{src,test}
   ```

2. **Copy template files:**
   - Use the templates above to create the core files

3. **Move source files:**
   - Identify files to extract from `packages/screeps-bot/src`
   - Move them to the new package's `src/` directory
   - Update import paths to be relative

4. **Define public API:**
   - Create `src/index.ts` with public exports
   - Export only what needs to be used externally
   - Keep implementation details private

5. **Add tests:**
   - Create test files matching source files
   - Aim for >80% test coverage
   - Use `test/setup.ts` for common mocks

6. **Update root package.json:**
   - Add build script: `"build:<name>": "npm run build -w @ralphschuler/screeps-<name>"`
   - Add test script: `"test:<name>": "npm test -w @ralphschuler/screeps-<name>"`
   - Include in `build:all` and `test:all` scripts

7. **Update bot imports:**
   - Change imports in `packages/screeps-bot/src` to use the new package
   - Example: `import { X } from '@ralphschuler/screeps-<name>'`

8. **Install and build:**
   ```bash
   npm install
   npm run build:<name>
   npm run test:<name>
   ```

9. **Verify integration:**
   ```bash
   npm run build
   npm test
   ```

## Best Practices

### Package Design

- **Single Responsibility:** Each package should do one thing well
- **Clear API:** Export only what's needed, keep internals private
- **Minimal Dependencies:** Avoid unnecessary external dependencies
- **Type Safety:** Use TypeScript strict mode, export types
- **Documentation:** Include clear README with examples

### Dependencies

- **Screeps types as peerDependency:** Don't bundle Screeps types
- **Share common utilities:** Use `@ralphschuler/screeps-utils` for shared code
- **Avoid circular dependencies:** Packages should not depend on each other in cycles

### Testing

- **Unit tests:** Test individual functions and classes
- **Mock Screeps APIs:** Use test/setup.ts for global mocks
- **Aim for 80%+ coverage:** Use comprehensive test cases
- **Test public API:** Focus on exported functionality

### Versioning

- **Semantic versioning:** Use semver (MAJOR.MINOR.PATCH)
- **Start at 0.1.0:** Indicates pre-release/unstable
- **Breaking changes:** Bump major version
- **New features:** Bump minor version
- **Bug fixes:** Bump patch version

## Common Patterns

### Exporting Singleton

```typescript
// src/manager.ts
export class MyManager {
  // Implementation
}

export const myManager = new MyManager();

// src/index.ts
export { MyManager, myManager } from './manager';
```

### Exporting Types and Classes

```typescript
// src/types.ts
export interface MyConfig {
  enabled: boolean;
}

// src/manager.ts
import { MyConfig } from './types';

export class MyManager {
  constructor(config: MyConfig) {}
}

// src/index.ts
export * from './types';
export { MyManager } from './manager';
```

### Exporting Utilities

```typescript
// src/utils.ts
export function helperFunction(): void {
  // Implementation
}

// src/index.ts
export { helperFunction } from './utils';
```

## Troubleshooting

### Build Errors

- **Module not found:** Check that package is in workspace and installed
- **Type errors:** Ensure @types/screeps is in devDependencies
- **Import errors:** Verify paths are correct and files are exported

### Test Errors

- **Global undefined:** Add missing mocks to test/setup.ts
- **Module not found:** Check tsconfig.test.json includes test files
- **Type errors:** Ensure test types are in tsconfig.test.json

### Integration Errors

- **Import not found:** Verify package is built and exported in index.ts
- **Circular dependency:** Restructure to remove circular imports
- **Version mismatch:** Run `npm install` to sync workspace versions
