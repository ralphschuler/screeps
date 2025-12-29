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
    // NO rootDir specified - required for cross-package imports
    // TypeScript enforces that all source files must be under rootDir when specified
    // Cross-package imports reference files outside src/, so rootDir cannot be used
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

**Pattern 2** is necessary when a package imports from other packages using path aliases (`@bot/*`). When `rootDir` is specified, TypeScript enforces that all source files must be located under that directory. Since cross-package imports reference files outside the package's `src/` directory, omitting `rootDir` allows TypeScript to compile these external dependencies into the output directory. This results in the nested directory structure where both the package's code and its cross-package dependencies are included in `dist/`.

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
