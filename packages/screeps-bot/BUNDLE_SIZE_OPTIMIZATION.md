# Bundle Size Optimization Guide

## Overview

Screeps enforces a **2MB upload limit** for bot code. This document explains our current bundle size, optimization strategies, and monitoring approach.

## Current Status

- **Bundle Size**: ~1.15MB (57.4% of limit)
- **Size Limit**: 2MB (2,097,152 bytes)
- **Safety Margin**: ~850KB remaining
- **Warning Threshold**: 1.6MB (80% of limit)

## Automatic Size Checking

Bundle size is automatically checked:

1. **During Build**: `npm run build` includes `bundle:check`
2. **Before Deployment**: `npm run push` checks size before uploading
3. **CI/CD**: Build workflow validates bundle size

The build will **fail** if the bundle exceeds 2MB, preventing accidental deployment.

## Bundle Size Breakdown

### Current Configuration

- **Without Terser**: ~2.5MB (raw TypeScript compilation)
- **With Terser (beautify: false)**: ~0.98MB
- **With Terser (beautify: true)**: ~1.15MB

### Why Beautify is Enabled

The `beautify: true` setting in terser adds ~170KB (15%) to the bundle but is **required** to prevent a critical bug:

```javascript
// Without beautify, this:
x ? 0.5 : 0.3

// Becomes this (invalid syntax):
x?.5:.3  // Looks like optional chaining!

// With beautify, it becomes:
x ? 0.5 : 0.3  // Correct spacing
```

**Do not disable beautify** unless you have an alternative solution for this bug.

## Optimization Strategies

### 1. Terser Configuration (Current)

Our terser configuration balances size and correctness:

```javascript
terser({
  compress: {
    passes: 3,              // 3 compression passes
    drop_console: false,    // Keep console.log (needed for debugging)
    drop_debugger: true,    // Remove debugger statements
    unsafe_comps: false,    // CRITICAL: Prevents decimal ternary bug
    dead_code: true,        // Remove unreachable code
    evaluate: true,         // Evaluate constant expressions
    loops: true,            // Optimize loops
    unused: true            // Remove unused variables
  },
  mangle: {
    toplevel: true,         // Mangle top-level names
    properties: false       // Don't mangle properties (breaks Game.*)
  },
  format: {
    beautify: true,         // CRITICAL: Required for decimal ternary fix
    indent_level: 0,        // Minimize indentation
    wrap_func_args: false   // Don't wrap function arguments
  }
})
```

### 2. Tree Shaking

Rollup automatically removes unused code. To maximize tree shaking:

- **Use ES6 imports**: `import { specific } from 'module'`
- **Avoid wildcard imports**: Don't use `import * as`
- **Export only what's needed**: Remove unused exports
- **Use conditional imports carefully**: Dynamic imports prevent tree shaking

### 3. Dependency Management

Monitor dependency sizes:

```bash
# Check package sizes
npm run build && ls -lh dist/main.js

# Analyze bundle composition (if needed)
npm install -D rollup-plugin-visualizer
```

**Tips**:
- Avoid large libraries (lodash, moment, etc.)
- Use built-in JavaScript instead of utilities
- Inline small helper functions instead of importing

### 4. Code Patterns for Size Reduction

**Avoid Repeated Code**:
```typescript
// Bad: Repeated string literals
Game.rooms["W1N1"];
Game.rooms["W1N1"];
Game.rooms["W1N1"];

// Good: Use constants
const ROOM_NAME = "W1N1";
Game.rooms[ROOM_NAME];
```

**Use Short Variable Names** (terser will mangle them anyway):
```typescript
// Terser mangles these anyway, so readability in source is fine
function calculateEnergyNeeded(room: Room, targetLevel: number) {
  // ... terser will mangle to: function a(b,c){...}
}
```

**Avoid Large Data Structures** in code:
```typescript
// Bad: Large inline data (adds to bundle size)
const ROOM_DATA = {
  W1N1: { ... },
  W1N2: { ... },
  // ... 100 more rooms
};

// Good: Load from Memory or generate dynamically
const roomData = Memory.roomData || generateRoomData();
```

## Monitoring and Alerts

### Manual Checking

```bash
# Check current bundle size
npm run bundle:check

# Build and check in one command
npm run build
```

### Size Progression

Track bundle size over time:

| Date | Size | Change | Notes |
|------|------|--------|-------|
| 2025-01-05 | 1.15MB | - | Current size with beautify |

### Warning Signs

Watch for these indicators:

- ⚠️ **Over 80% (1.6MB)**: Review recent changes, consider optimizations
- 🚨 **Over 90% (1.8MB)**: Immediate action needed, block new features
- 🛑 **Over 95% (1.9MB)**: Emergency - must reduce size before next feature

## If Bundle Exceeds Limit

### Immediate Actions

1. **Check Recent Changes**:
   ```bash
   git log --oneline -10
   git diff HEAD~1 HEAD -- src/
   ```

2. **Identify Size Culprits**:
   ```bash
   # Compare with previous commit
   git checkout HEAD~1
   npm run build
   ls -lh dist/main.js  # Note the size
   git checkout -
   npm run build
   ls -lh dist/main.js  # Compare
   ```

3. **Quick Wins**:
   - Remove debug/test code accidentally committed
   - Check for duplicate dependencies
   - Look for large constants or data structures

### Long-term Solutions

If the bundle is legitimately growing:

1. **Module Splitting**: Consider uploading multiple modules
   ```typescript
   // main.js - core logic only
   // utilities.js - helper functions
   // constants.js - lookup tables
   ```

2. **Code Splitting**: Move rarely-used code to Memory
   ```typescript
   // Instead of bundling large algorithms
   Memory.pathfindingCache = generatePaths();
   ```

3. **External Data**: Use Memory or Segments for data
   ```typescript
   // Don't bundle large datasets
   RawMemory.segments[0] = JSON.stringify(largeData);
   ```

4. **Simplify Dependencies**: Replace large packages
   ```typescript
   // Instead of lodash
   import _ from 'lodash';  // +70KB

   // Use native JavaScript
   const cloned = {...obj};  // +0KB
   ```

## Alternative: Multi-Module Deployment

If single bundle exceeds 2MB, consider multi-module approach:

```javascript
// screeps.json - upload multiple files
{
  "main": "dist/main.js",      // Core logic
  "utils": "dist/utils.js",    // Utilities
  "data": "dist/data.js"       // Constants/lookup tables
}
```

**Note**: Each module has a 2MB limit, and total Memory is also limited.

## Testing Bundle Size Changes

Before committing changes:

```bash
# 1. Check current size
npm run build
# Note the size

# 2. Make changes

# 3. Build and compare
npm run build
# Compare with noted size

# 4. If size increased significantly, investigate
```

## CI/CD Integration

The build workflow automatically checks bundle size:

```yaml
# .github/workflows/build.yml
- name: Build
  run: npm run build

# bundle:check is included in build script
# Build fails if bundle > 2MB
```

## Resources

- [Screeps Code Limits](https://docs.screeps.com/modules.html)
- [Rollup Tree Shaking](https://rollupjs.org/guide/en/#tree-shaking)
- [Terser Documentation](https://github.com/terser/terser#compress-options)

## Summary

- ✅ Current size: 1.15MB (safe)
- ✅ Automatic size checking in build/push
- ✅ Beautify required for correctness
- ⚠️ Monitor growth rate
- 📊 Review this document when approaching 80% (1.6MB)
