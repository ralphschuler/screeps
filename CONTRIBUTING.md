# Contributing to Screeps Bot

## Package Structure

This monorepo contains multiple packages with two different build output patterns:

### Pattern 1: Simple Packages (No Cross-Package Dependencies)

**Used by:** `screeps-spawn`, `screeps-chemistry`, `screeps-utils`, `screeps-posis`

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

**package.json:**
```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

**Build Output:**
```
dist/
  index.js
  index.d.ts
  (other files from src/)
```

### Pattern 2: Complex Packages (With Cross-Package Dependencies)

**Used by:** `screeps-defense`, `screeps-economy`

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "outDir": "dist",
    // NO rootDir specified - allows cross-package imports
    "paths": {
      "@bot/*": ["../screeps-bot/src/*"]
    }
  }
}
```

**package.json:**
```json
{
  "main": "dist/screeps-defense/src/index.js",
  "types": "dist/screeps-defense/src/index.d.ts"
}
```

**Build Output:**
```
dist/
  screeps-defense/
    src/
      index.js
      index.d.ts
      (other files)
  screeps-bot/
    src/
      (imported files from @bot/*)
```

### Why Two Patterns?

**Pattern 1** is simpler and produces a clean output structure, but requires all code to be within the package's `src/` directory.

**Pattern 2** is necessary when a package imports from other packages using path aliases (`@bot/*`). TypeScript needs to compile those imports too, which results in the nested directory structure. The `rootDir` option cannot be used because TypeScript enforces that all compiled files must be under the `rootDir`.

### Test Environment

Tests run using mocha with `setup-mocha.cjs` which provides stub implementations for `@bot/*` imports. This allows packages using Pattern 2 to be tested without requiring the full bot codebase.

## Adding New Packages

1. **If your package doesn't import from other packages:** Use Pattern 1
2. **If your package imports from `@bot/*` or other packages:** Use Pattern 2

## Module Resolution

Both patterns work correctly with Node.js module resolution:
- **Pattern 1:** `node_modules/@ralphschuler/package-name/dist/index.js`
- **Pattern 2:** `node_modules/@ralphschuler/package-name/dist/package-name/src/index.js`

The `main` and `types` fields in `package.json` correctly point to these files.

## Testing

Run tests with:
```bash
npm test              # Run all tests
npm test -w <package> # Run tests for specific package
```

Tests must pass before merging. The CI/CD pipeline runs:
1. `npm ci` - Install dependencies
2. `npm run build` - Build all packages
3. `npm test` - Run test suite
