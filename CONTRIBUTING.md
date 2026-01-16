# Contributing to Screeps Bot

## Framework-First Development Policy

**IMPORTANT**: This repository follows a **framework-first** development approach. Framework packages (`@ralphschuler/*`) are the **source of truth** for all shared functionality.

### Framework Packages are Canonical

All behavior implementations, role logic, and reusable components **must** be developed in framework packages:

- ✅ **Develop in**: `packages/@ralphschuler/screeps-*` packages
- ❌ **Do NOT develop in**: `packages/screeps-bot/src` (monolith)

The monolith (`packages/screeps-bot`) should only contain:
- Integration/wiring code
- Thin adapters that import from framework packages
- Bot-specific configuration

### Rules for Code Placement

**Behavior & Role Code** → `@ralphschuler/screeps-roles`
```typescript
// ✅ Correct: Framework package
packages/@ralphschuler/screeps-roles/src/behaviors/executor.ts

// ❌ Wrong: Monolith
packages/screeps-bot/src/roles/behaviors/executor.ts  // Should NOT exist
```

**Economy Logic** → `@ralphschuler/screeps-economy`  
**Defense Logic** → `@ralphschuler/screeps-defense`  
**Spawn Logic** → `@ralphschuler/screeps-spawn`  
**Core Utilities** → `@ralphschuler/screeps-core`

### Importing from Framework Packages

Always import from framework packages, never from local monolith files:

```typescript
// ✅ Correct: Import from framework package
import { createContext, executeAction } from "@ralphschuler/screeps-roles";

// ❌ Wrong: Local import (should not exist)
import { createContext } from "./roles/behaviors/context";
```

### CI Enforcement

The repository has automated checks (`.github/workflows/framework-sync-check.yml`) that will **fail your PR** if:

1. A `behaviors/` directory exists in the monolith
2. Local imports from `behaviors/` are detected
3. Code duplication is found between monolith and framework

### Making Changes to Role Behavior

When modifying role behavior, edit the framework package directly:

```bash
# ✅ Edit framework package
vim packages/@ralphschuler/screeps-roles/src/behaviors/executor.ts

# Build framework package
cd packages/@ralphschuler/screeps-roles
npm run build

# Build monolith (which imports the updated framework)
cd ../screeps-bot
npm run build
```

### Why Framework-First?

1. **Single Source of Truth**: Eliminates code divergence and duplication
2. **Community Reusability**: Framework packages can be published to npm
3. **Better Testing**: Framework packages are independently testable
4. **Clear Ownership**: Framework packages own features, monolith just integrates
5. **Easier Maintenance**: Changes in one place, benefits everywhere

### Migration Status

As of January 2026, the synchronization between monolith and framework is **complete**:
- ✅ All behavior files migrated to `@ralphschuler/screeps-roles`
- ✅ Monolith behaviors directory removed
- ✅ All monolith imports updated to use framework packages
- ✅ CI checks prevent future divergence

See `FRAMEWORK_MATURITY_ROADMAP.md` for more details on framework adoption progress.

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

## Framework Package Dependencies

All framework packages with names starting with `@ralphschuler/screeps-*` share the same `devDependencies` configuration. This is **automatically synchronized** to ensure consistency across those packages.

**Included framework packages:**
- All packages under `packages/@ralphschuler/*` (e.g., `screeps-core`, `screeps-cache`, `screeps-kernel`)
- Framework packages under `packages/screeps-*/` with `@ralphschuler/screeps-*` names (e.g., `screeps-spawn`, `screeps-chemistry`, `screeps-defense`, `screeps-economy`, `screeps-utils`)

**Excluded packages** (managed separately):
- MCP packages (`@ralphschuler/screeps-mcp`, `@ralphschuler/screeps-docs-mcp`, etc.) - use different testing framework
- Server packages (`@ralphschuler/screeps-server`, `@ralphschuler/screeps-tasks`, `@ralphschuler/screeps-posis`) - have different dependency requirements

### How It Works

- **Single source of truth**: `scripts/shared-dependencies.json` defines all shared devDependencies
- **Automated sync**: Run `npm run sync:deps` to update all framework packages
- **CI enforcement**: PR checks fail if packages have inconsistent dependencies
- **Scope**: Applies to all `@ralphschuler/screeps-*` packages except MCP and server packages

### Updating Dependencies

**To update a dependency version** (e.g., TypeScript, @types/node):

1. Edit `scripts/shared-dependencies.json`:
   ```json
   {
     "framework": {
       "devDependencies": {
         "typescript": "^5.5.0"  // Update version here
       }
     }
   }
   ```

2. Run the sync script:
   ```bash
   npm run sync:deps
   ```

3. Commit all changes:
   ```bash
   git add scripts/shared-dependencies.json 'packages/@ralphschuler/*/package.json' 'packages/screeps-*/package.json'
   git commit -m "chore: Update TypeScript to 5.5.0"
   ```

### Removing a Shared Dependency

If you remove a dependency from `scripts/shared-dependencies.json`, it will persist in individual `package.json` files. To fully remove it:

1. Remove it from `scripts/shared-dependencies.json`
2. Manually delete it from each affected `package.json` file
3. Or modify the sync script to track and remove explicitly removed dependencies

### Checking for Drift

To verify all packages are synchronized:

```bash
npm run sync:deps:check
```

This is automatically run in CI and will fail the build if packages have drifted.

### Adding New Framework Packages

When creating a new `@ralphschuler/screeps-*` package:

1. Create the package directory and files
2. Add minimal `package.json` (without devDependencies)
3. Run `npm run sync:deps` to add shared devDependencies
4. The package will automatically have consistent dependencies

### Why Automated Synchronization?

**Before** (manual):
- 14 files to edit for each dependency update
- High risk of inconsistencies
- Manual verification required

**After** (automated):
- 1 file edit → 14 packages updated
- Zero drift (enforced by CI)
- Self-healing on `npm install`

## Module Resolution

Both patterns work correctly with Node.js module resolution:
- **Pattern 1:** `node_modules/@ralphschuler/package-name/dist/index.js`
- **Pattern 2:** `node_modules/@ralphschuler/package-name/dist/package-name/src/index.js`

The `main` and `types` fields in `package.json` correctly point to these files.

## Build Requirements

### System Requirements

- **Node.js**: v18.20.5 or higher (v20.19.0+ recommended for latest dependencies)
- **npm**: 8.0.0 or higher
- **Python**: Not required (native modules have been removed/updated)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/ralphschuler/screeps.git
cd screeps

# Install dependencies
npm install

# Build all packages
npm run build:all
```

### Building the Project

**Build all packages:**
```bash
npm run build:all
```

**Build specific packages:**
```bash
npm run build:kernel    # @ralphschuler/screeps-kernel
npm run build:utils     # @ralphschuler/screeps-utils
npm run build:stats     # @ralphschuler/screeps-stats
npm run build           # Main bot (screeps-typescript-starter)
# ... see package.json for all build:* scripts
```

**Build order (for manual builds):**
1. Core packages first (kernel, utils, stats)
2. Feature packages (spawn, economy, defense, etc.)
3. Main bot last

### Common Build Issues

#### Issue: Type errors in test files blocking build

**Symptom:**
```
error TS2339: Property 'greaterThanOrEqual' does not exist on type 'typeof Assert'
```

**Solution:**
Test files should not be included in production builds. The main bot's `tsconfig.json` excludes test files, and the rollup config has `check: false` to prevent type-checking errors from blocking builds.

#### Issue: "Index signature missing" type errors

**Symptom:**
```
error TS2345: Type 'X' is not assignable to parameter of type 'Y'
  Index signature for type 'string' is missing
```

**Solution:**
This occurs when interfaces need to be compatible with visualization or external packages. Add an index signature to the interface:

```typescript
export interface MyInterface {
  specificField: number;
  // Add index signature for compatibility
  [key: string]: unknown;
}
```

#### Issue: npm install warnings about engine versions

**Symptom:**
```
npm warn EBADENGINE Unsupported engine { required: { node: '>=20.19.0' } }
```

**Solution:**
These are warnings, not errors. The build will work with Node 18.20.5+, but some packages prefer newer versions. Upgrade to Node 20.19.0+ to eliminate warnings:

```bash
# Using nvm
nvm install 20.19.0
nvm use 20.19.0
```

#### Issue: Rollup cache causing stale type errors

**Solution:**
```bash
# Clean rollup cache
rm -rf packages/screeps-bot/.rpt2_cache

# Clean all build artifacts
npm run clean  # If available, or manually:
find packages -name "dist" -type d -exec rm -rf {} +
find packages -name ".rpt2_cache" -type d -exec rm -rf {} +

# Rebuild
npm run build:all
```

### Troubleshooting Checklist

If you encounter build failures:

1. **Check Node/npm versions:**
   ```bash
   node --version  # Should be >= 18.20.5
   npm --version   # Should be >= 8.0.0
   ```

2. **Clean install:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Clean build artifacts:**
   ```bash
   rm -rf packages/*/dist packages/*/.rpt2_cache
   npm run build:all
   ```

4. **Check for uncommitted changes:**
   ```bash
   git status  # Should show clean working tree
   ```

5. **Verify package dependencies:**
   ```bash
   npm run build:kernel  # Build dependencies first
   npm run build         # Then build main bot
   ```

### CI/CD Build Process

The GitHub Actions CI pipeline runs:

1. **Checkout code** with full git history
2. **Setup Node.js** (version specified in workflow)
3. **Install dependencies:** `npm ci` (clean install)
4. **Build packages:** `npm run build:all`
5. **Run tests:** `npm test`
6. **Security scan:** CodeQL analysis

See `.github/workflows/` for complete CI configuration.

### Deployment to Screeps

The repository includes automated deployment workflows that push built code to Screeps servers:

- **Deploy Workflow** (`.github/workflows/deploy.yml`) - Deploys on release or manual trigger
- **Supports multiple environments** - screeps.com, sim, season, ptr, and private servers

**For repository maintainers**: To enable deployment, you must configure GitHub Environments with Screeps credentials. See [.github/ENVIRONMENT_SETUP.md](.github/ENVIRONMENT_SETUP.md) for detailed setup instructions.

**For local development**: You can deploy manually using:
```bash
# Set credentials
export SCREEPS_TOKEN=your-token-here
# OR
export SCREEPS_USER=your-username
export SCREEPS_PASS=your-password

# Deploy to Screeps
npm run push
```

The build process will show diagnostic output indicating whether credentials are configured correctly. If you see "Credentials not configured" warnings, the code will build but won't upload (dryRun mode).

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

## TODO Comment Workflow

This repository uses an automated TODO-to-issue workflow that converts TODO comments into GitHub issues. **Use TODO comments liberally** - they are a feature, not a code smell.

### How It Works

1. **Write TODO comments** in your code following the format below
2. **Workflow runs automatically**:
   - On every push to `main` branch
   - Weekly on Sunday at midnight UTC (for catching any missed TODOs)
3. **Issues are created** automatically with labels and context
4. **Issue URLs are inserted** back into the code next to the TODO comment

### TODO Comment Format

The workflow recognizes various TODO formats. Use descriptive comments that will become clear GitHub issues:

**Basic Format:**
```typescript
// TODO: Brief description of what needs to be done
```

**With Priority and Category:**
```typescript
// TODO(P1): BUG - Add error handling for missing source map file
// TODO(P2): PERF - Cache source map parsing to avoid expensive re-parsing
// TODO(P3): FEATURE - Add cluster-wide construction planning
```

**With Estimates:**
```typescript
// TODO: [P1, Est: 4h] Posture switching to defensive may be too aggressive
// TODO: [P2, Est: 2h] Defense pheromone threshold may be too low
```

**Multi-line with Context:**
```typescript
// TODO(P2): ARCH - Implement adaptive CPU budgets based on room count
// This should monitor actual process performance and adjust budgets dynamically
// See ROADMAP.md Section 15 for kernel requirements
```

### Priority Levels

- **P1 (Critical)**: Bugs, critical features, blocking issues - should be addressed ASAP
- **P2 (High)**: Important improvements, architecture changes, performance optimizations
- **P3 (Medium)**: Nice-to-have features, minor optimizations, documentation improvements

### Category Tags

- **BUG**: Bug fixes and error handling
- **PERF**: Performance optimizations
- **ARCH**: Architectural improvements
- **FEATURE**: New features and capabilities
- **TEST**: Test coverage and testing improvements
- **DOCS**: Documentation updates
- **STYLE**: Code style and linting

### When to Use TODO Comments

✅ **Use TODO comments when:**
- Setting up code structure but full implementation is out of scope
- Identifying work that should be done but exceeds the current task's boundaries
- Delivering a minimal working solution with clear next steps
- Documenting future enhancements during implementation
- Breaking down large features into smaller, trackable pieces
- Encountering errors that need separate investigation

❌ **Don't use TODO comments for:**
- Issues that can be fixed immediately in the current task
- External library issues (file issues with the library instead)
- Intentional design decisions (use regular comments to explain)
- Already fixed issues (remove the TODO)

### After Workflow Runs

Once the workflow runs, your TODO will be updated with an issue link:

```typescript
// TODO(P1): BUG - Add error handling for missing source map file
// Issue URL: https://github.com/ralphschuler/screeps/issues/809
```

You can then:
- **Track progress** on the GitHub issue
- **Assign** the issue to someone
- **Add milestones** for planning
- **Reference** the issue in commits: `git commit -m "fix: handle missing source map, fixes #809"`

### Workflow Configuration

The workflow is defined in `.github/workflows/auto-todo-issue.yml` and uses [`alstr/todo-to-issue-action`](https://github.com/alstr/todo-to-issue-action).

**Manual Trigger (if needed):**
```bash
gh workflow run auto-todo-issue.yml
```

### Examples

#### Example 1: Bug Fix Needed
```typescript
function processMemory(data: any) {
  // TODO(P1): BUG - Add null check for data parameter
  // Currently throws if data is undefined
  return data.map(item => item.value);
}
```

#### Example 2: Performance Optimization
```typescript
export function calculatePath(from: RoomPosition, to: RoomPosition) {
  // TODO(P2): PERF - Implement path caching with 50-tick TTL
  // Current implementation recalculates paths every tick
  // Expected CPU savings: ~0.5 CPU per creep per tick
  return PathFinder.search(from, to);
}
```

#### Example 3: Architecture Improvement
```typescript
class SpawnQueue {
  // TODO(P2): ARCH - Implement priority-based queueing system
  // Features needed:
  // - Priority levels (emergency > defense > economy)
  // - Energy availability prediction
  // - Body part optimization based on available energy
  // - Queue persistence across global resets
  // Current implementation uses simple FIFO queue
  private queue: SpawnRequest[] = [];
}
```

### Best Practices

1. **Be specific**: Describe what needs to be done and why
2. **Add context**: Reference related files, functions, or documentation
3. **Estimate effort**: Include time estimates when known (`Est: 2h`)
4. **Reference roadmap**: Link to ROADMAP.md sections when applicable
5. **Group related TODOs**: Use similar wording for related work items
6. **Keep TODOs updated**: Remove when work is complete

## Caching Patterns

This codebase uses a unified cache system located in `packages/screeps-bot/src/cache/`. All new caches should use this system instead of creating independent `Map<>` implementations.

### When to Use Unified Cache

✅ **Use the unified cache system when**:
- Data needs TTL-based expiration
- Data should be tracked in observability metrics
- Cache needs coordinated invalidation
- Cache is performance-critical

❌ **Don't use unified cache when**:
- Using Map as a data structure (not a cache)
- Need very specific eviction logic
- Data structure requires Map-specific methods

### Basic Usage

```typescript
import { globalCache } from "./cache";

const CACHE_NAMESPACE = "myFeature";
const TTL = 100; // ticks

// Get from cache
const value = globalCache.get<MyType>(key, {
  namespace: CACHE_NAMESPACE,
  ttl: TTL
});

// Set in cache
globalCache.set(key, value, {
  namespace: CACHE_NAMESPACE,
  ttl: TTL
});

// Invalidate
globalCache.invalidate(key, CACHE_NAMESPACE);
```

### TTL Guidelines

- **1 tick**: Per-tick ephemeral data (e.g., target assignments)
- **20-50 ticks**: Frequently changing data (e.g., structure counts)
- **100-500 ticks**: Stable data (e.g., paths, waypoints)
- **-1**: Permanent (use sparingly)

### Cache Registration

New caches should be registered in `packages/screeps-bot/src/cache/cacheRegistration.ts`:

```typescript
cacheCoherence.registerCache(
  "myFeature",
  globalCache,
  CacheLayer.L2,
  {
    priority: 50,
    maxMemory: 1 * 1024 * 1024 // 1MB
  }
);
```

### Documentation

See `packages/screeps-bot/src/cache/CACHE_MIGRATION.md` for detailed migration patterns and best practices.

