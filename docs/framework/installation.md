# Installation Guide

## Prerequisites

Before installing the Screeps Framework, ensure you have:

- **Node.js** 16.x or higher
- **npm** 7.x or higher (comes with Node.js)
- **TypeScript** 4.0 or higher
- **Screeps account** (official server or private server)

## Installation Methods

### Method 1: Install Specific Packages (Recommended)

Install only the packages you need:

```bash
# Core process management
npm install @ralphschuler/screeps-kernel

# Spawning system
npm install @ralphschuler/screeps-spawn

# Economy management
npm install @ralphschuler/screeps-economy

# Defense systems
npm install @ralphschuler/screeps-defense

# Lab automation
npm install @ralphschuler/screeps-chemistry

# Utilities
npm install @ralphschuler/screeps-utils
```

### Method 2: Install Framework Bundle

**Note**: Currently, packages must be installed individually. A framework bundle will be available after npm publishing.

```bash
# Coming soon: Framework bundle
npm install @ralphschuler/screeps-framework
```

### Method 3: Use Example Bot

Clone the minimal bot example:

```bash
git clone https://github.com/ralphschuler/screeps.git
cd screeps/examples/minimal-bot
npm install
```

## Package Installation Matrix

| Package | Installation Command | Dependencies |
|---------|---------------------|--------------|
| **Process Management** |
| screeps-kernel | `npm i @ralphschuler/screeps-kernel` | None |
| screeps-posis | `npm i @ralphschuler/screeps-posis` | None |
| **Economy & Resources** |
| screeps-spawn | `npm i @ralphschuler/screeps-spawn` | None |
| screeps-economy | `npm i @ralphschuler/screeps-economy` | screeps-utils |
| screeps-chemistry | `npm i @ralphschuler/screeps-chemistry` | None |
| screeps-tasks | `npm i @ralphschuler/screeps-tasks` | None |
| **Combat & Defense** |
| screeps-defense | `npm i @ralphschuler/screeps-defense` | screeps-kernel |
| **Architecture & Utilities** |
| screeps-roles | `npm i @ralphschuler/screeps-roles` | screeps-core, screeps-stats |
| screeps-utils | `npm i @ralphschuler/screeps-utils` | None |
| screeps-cache | `npm i @ralphschuler/screeps-cache` | None |
| screeps-pathfinding | `npm i @ralphschuler/screeps-pathfinding` | screeps-utils |
| screeps-remote-mining | `npm i @ralphschuler/screeps-remote-mining` | screeps-pathfinding |
| **Infrastructure** |
| screeps-core | `npm i @ralphschuler/screeps-core` | None |
| screeps-stats | `npm i @ralphschuler/screeps-stats` | screeps-core |
| screeps-console | `npm i @ralphschuler/screeps-console` | None |
| screeps-visuals | `npm i @ralphschuler/screeps-visuals` | None |
| screeps-layouts | `npm i @ralphschuler/screeps-layouts` | None |
| screeps-intershard | `npm i @ralphschuler/screeps-intershard` | screeps-core |
| screeps-clusters | `npm i @ralphschuler/screeps-clusters` | screeps-core |
| screeps-empire | `npm i @ralphschuler/screeps-empire` | screeps-intershard |
| screeps-standards | `npm i @ralphschuler/screeps-standards` | None |

## Project Setup

### 1. Initialize TypeScript Project

If starting from scratch:

```bash
# Create project directory
mkdir my-screeps-bot
cd my-screeps-bot

# Initialize npm
npm init -y

# Install TypeScript and types
npm install --save-dev typescript
npm install --save-dev @types/node
npm install --save-dev @types/screeps
```

### 2. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Install Framework Packages

Install the packages you need:

```bash
# Essential packages for basic bot
npm install @ralphschuler/screeps-kernel
npm install @ralphschuler/screeps-spawn
npm install @ralphschuler/screeps-utils

# Optional: Add economy management
npm install @ralphschuler/screeps-economy

# Optional: Add defense
npm install @ralphschuler/screeps-defense

# Optional: Add lab automation
npm install @ralphschuler/screeps-chemistry
```

### 4. Create Bot Entry Point

Create `src/main.ts`:

```typescript
import { Kernel } from '@ralphschuler/screeps-kernel';
import { SpawnManager } from '@ralphschuler/screeps-spawn';

const kernel = new Kernel({ cpuBudget: 10 });
const spawnManager = new SpawnManager();

kernel.registerProcess({
  id: 'spawning',
  priority: 90,
  execute: () => {
    // Your spawning logic
  },
  cpuBudget: 0.5
});

export const loop = () => {
  kernel.run();
};
```

## Build Configuration

### Option A: Rollup (Recommended)

```bash
npm install --save-dev rollup
npm install --save-dev @rollup/plugin-typescript
npm install --save-dev @rollup/plugin-node-resolve
npm install --save-dev @rollup/plugin-commonjs
```

Create `rollup.config.js`:

```javascript
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript()
  ]
};
```

Add to `package.json`:

```json
{
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c -w"
  }
}
```

### Option B: Webpack

```bash
npm install --save-dev webpack webpack-cli
npm install --save-dev ts-loader
```

Create `webpack.config.js`:

```javascript
const path = require('path');

module.exports = {
  entry: './src/main.ts',
  mode: 'production',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
```

### Option C: Plain TypeScript Compiler

```bash
# Build
npx tsc

# Watch mode
npx tsc --watch
```

## Deployment Configuration

### Using Screeps CLI

```bash
npm install --save-dev screeps-api
```

Create `.screeps.json`:

```json
{
  "email": "your-email@example.com",
  "password": "your-password",
  "branch": "default",
  "ptr": false
}
```

Add deploy script to `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && screeps-upload dist/main.js"
  }
}
```

### Using Grunt (screeps-typescript-starter compatible)

```bash
npm install --save-dev grunt grunt-screeps
```

Create `Gruntfile.js`:

```javascript
module.exports = function(grunt) {
  const config = require('./.screeps.json');
  
  grunt.loadNpmTasks('grunt-screeps');
  
  grunt.initConfig({
    screeps: {
      options: {
        email: config.email,
        password: config.password,
        branch: config.branch,
        ptr: config.ptr
      },
      dist: {
        src: ['dist/main.js']
      }
    }
  });
};
```

## Verification

After installation, verify the framework is working:

```typescript
// In your main.ts or in Screeps console
import { Kernel } from '@ralphschuler/screeps-kernel';

console.log('Kernel version:', Kernel.version);
console.log('Framework loaded successfully!');
```

## Common Installation Issues

### Issue: Module Not Found

**Error**: `Cannot find module '@ralphschuler/screeps-kernel'`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall packages
rm -rf node_modules package-lock.json
npm install
```

### Issue: Type Errors

**Error**: `Type 'X' is not assignable to type 'Y'`

**Solution**:
```bash
# Ensure @types/screeps is installed
npm install --save-dev @types/screeps

# Verify TypeScript version
npm install --save-dev typescript@latest
```

### Issue: Build Errors

**Error**: Build fails with module resolution errors

**Solution**:
1. Check `tsconfig.json` has correct settings
2. Verify all dependencies are installed
3. Clear build cache: `rm -rf dist`

## Updating Packages

### Update All Framework Packages

```bash
# Check for updates
npm outdated

# Update all @ralphschuler packages
npm update @ralphschuler/screeps-kernel
npm update @ralphschuler/screeps-spawn
# ... etc
```

### Update to Specific Version

```bash
# Install specific version
npm install @ralphschuler/screeps-kernel@0.2.0

# Install latest
npm install @ralphschuler/screeps-kernel@latest
```

## Next Steps

- **[Quick Start Guide](quickstart.md)** - Build your first bot
- **[Framework Overview](overview.md)** - Understand the architecture
- **[Developer Guides](../guides/)** - Learn specific systems
- **[Examples](../../examples/)** - See working implementations

## Support

- **Installation Issues**: [GitHub Issues](https://github.com/ralphschuler/screeps/issues)
- **Questions**: [GitHub Discussions](https://github.com/ralphschuler/screeps/discussions)
- **Documentation**: [Framework Guide](../../FRAMEWORK.md)
