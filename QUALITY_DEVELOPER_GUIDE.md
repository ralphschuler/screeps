# Code Quality Developer Guide

This guide explains the code quality tools and workflows for developers working on the Screeps repository.

## Quick Start

Before submitting a PR, run these commands locally:

```bash
# Install dependencies (first time only)
npm install

# Run all quality checks
npm run lint:all          # Lint all packages
npm run quality:baseline  # Check duplication and complexity
npm test                  # Run tests
npm run build             # Build all packages
```

## Quality Tools Overview

### 1. ESLint - Code Linting

**Purpose**: Enforce code style, catch errors, ensure consistency

**Usage**:
```bash
# Lint main bot
npm run lint

# Lint specific package
npm run lint:kernel
npm run lint:roles
npm run lint:economy

# Lint all packages
npm run lint:all

# Auto-fix issues (main bot only for now)
npm run lint:fix
```

**Configuration**:
- Shared config: `eslint.config.shared.js`
- Per-package config: `packages/*/eslint.config.js`
- All packages use the same rules for consistency

**Common Errors**:
- `no-undef`: Undefined variable (check imports)
- `@typescript-eslint/no-unused-vars`: Unused variable (remove or prefix with `_`)
- `import/order`: Imports not sorted (run `lint:fix` to auto-sort)

### 2. jscpd - Code Duplication Detection

**Purpose**: Identify duplicated code that should be consolidated

**Usage**:
```bash
# Run duplication analysis
npm run quality:duplication

# View HTML report
open reports/duplication/html/index.html

# View JSON report
cat reports/duplication/jscpd-report.json | jq
```

**Thresholds**:
- **Target**: < 5% duplication
- **Current**: 18.85% (baseline, improvement needed)
- **Warning**: > 5% duplication
- **Error**: > 10% duplication

**Configuration**: `.jscpd.json`

**What to do if duplication is high**:
1. Identify common patterns in the report
2. Extract shared code to utilities or base classes
3. Use composition over duplication
4. Document why duplication is acceptable (if temporary)

### 3. Complexity Analysis

**Purpose**: Identify files and functions that are too complex

**Usage**:
```bash
# Run complexity analysis
npm run quality:complexity

# View report
cat reports/complexity-baseline.json | jq
```

**Thresholds**:
- **File Size**: < 300 lines (recommended), < 500 lines (acceptable)
- **Function Complexity**: < 15 (recommended), < 25 (maximum)
- **Average File Size**: < 200 lines

**What to do if complexity is high**:
1. Split large files into smaller modules
2. Extract complex functions into smaller helpers
3. Use composition and delegation patterns
4. Consider state machines for complex logic

### 4. TypeScript Compilation

**Purpose**: Ensure type safety and catch errors early

**Usage**:
```bash
# Build all packages
npm run build:all

# Build specific package
npm run build:kernel
npm run build

# Clean rebuild
rm -rf packages/*/dist
npm run build:all
```

**Common Errors**:
- Type mismatches: Fix types or use type assertions
- Missing types: Add `@types/*` dependencies
- Circular dependencies: Refactor to break cycles

### 5. Tests

**Purpose**: Verify code correctness and prevent regressions

**Usage**:
```bash
# Run all tests
npm test

# Run specific package tests
npm run test:kernel
npm run test:roles

# Run with coverage
npm run test:coverage
```

**Test Requirements**:
- All new features should have tests
- Maintain or improve test coverage (target: >55%)
- Tests should be fast (<100ms per test)
- Use mocks for Screeps game objects

## Quality Metrics Dashboard

### Current Metrics (Baseline)

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Code Duplication | 18.85% | <5% | ⚠️ High |
| Files Over 300 Lines | 30% | <20% | ⚠️ High |
| Average File Size | 239 lines | <200 lines | ⚠️ Moderate |
| Test Coverage | 54.66% | >55% | ⚠️ Below Target |
| TypeScript Build | 100% | 100% | ✅ Good |
| Lint Errors | Warnings Only | 0 | ⚠️ Needs Improvement |

### Quality Reports

All quality reports are generated in the `reports/` directory:

```
reports/
├── duplication/
│   ├── html/
│   │   └── index.html        # Interactive HTML report
│   └── jscpd-report.json     # JSON report for CI
└── complexity-baseline.json  # Complexity metrics
```

## Development Workflow

### Before Starting Work

1. **Pull latest changes**:
   ```bash
   git pull origin main
   npm install
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Run baseline checks**:
   ```bash
   npm run lint:all
   npm run quality:baseline
   npm test
   ```

### During Development

1. **Write code following existing patterns**
2. **Add tests for new functionality**
3. **Run linter frequently**:
   ```bash
   npm run lint
   ```

4. **Check for duplication**:
   ```bash
   npm run quality:duplication
   ```

5. **Keep files small** (under 300 lines if possible)

### Before Committing

1. **Run all quality checks**:
   ```bash
   npm run lint:all
   npm run quality:baseline
   npm test
   npm run build:all
   ```

2. **Fix any errors or warnings**

3. **Document any unavoidable warnings** in your PR description

4. **Commit with conventional commit message**:
   ```bash
   git commit -m "feat: Add new pathfinding cache"
   git commit -m "fix: Resolve memory leak in kernel"
   git commit -m "refactor: Split large empireManager.ts file"
   ```

### Creating a Pull Request

1. **Use PR template** - Fill out all sections
2. **Link related issues** - Use `Fixes #123` or `Relates to #456`
3. **Document quality warnings** - Explain any lint warnings
4. **Wait for CI checks** - All checks must pass

## CI Quality Checks

The CI pipeline runs these quality checks on every PR:

### Linting (quality.yml)
- Lints all 21 framework packages + main bot
- Reports errors and warnings
- ⚠️ Currently informational (doesn't block PRs)

### Duplication Detection (quality.yml)
- Runs jscpd on entire codebase
- Uploads HTML and JSON reports as artifacts
- Shows duplication percentage in summary
- ⚠️ Currently informational (doesn't block PRs)

### Complexity Analysis (quality.yml)
- Analyzes file sizes and complexity
- Uploads JSON report as artifact
- Shows files over 300 lines in summary
- ⚠️ Currently informational (doesn't block PRs)

### TypeScript Compilation (ci.yml)
- Builds all packages
- ❌ Blocks PR if build fails

### Tests (ci.yml)
- Runs all package tests
- Uploads coverage reports
- ❌ Blocks PR if tests fail

### Bundle Size (ci.yml)
- Tracks bundle sizes
- Shows size changes in summary
- ⚠️ Currently informational

## Troubleshooting

### "ESLint: Cannot find module"

**Problem**: ESLint can't find shared config

**Solution**:
```bash
# Make sure you're in the root directory
cd /path/to/screeps

# Check that eslint.config.shared.js exists
ls eslint.config.shared.js

# Reinstall dependencies
npm install
```

### "jscpd: command not found"

**Problem**: jscpd not installed

**Solution**:
```bash
npm install --save-dev jscpd
```

### "Reports directory missing"

**Problem**: Reports directory doesn't exist

**Solution**:
```bash
mkdir -p reports
npm run quality:baseline
```

### "Too many lint warnings"

**Problem**: Inherited codebase has many warnings

**Solution**:
- Focus on fixing errors first (not warnings)
- Don't introduce new warnings
- Gradually fix warnings in files you modify
- Document remaining warnings in PR

## Best Practices

### Code Style

✅ **Do**:
- Use TypeScript strict mode
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Use early returns for error handling
- Follow existing code patterns

❌ **Don't**:
- Use `any` type (unless absolutely necessary)
- Leave commented-out code
- Add console.log (except in approved files)
- Create large monolithic files (>300 lines)
- Duplicate code (extract to shared utilities)

### File Organization

✅ **Do**:
- Keep files under 300 lines
- Group related functionality
- Use clear, descriptive file names
- Follow established directory structure

❌ **Don't**:
- Create "god" files with everything
- Mix unrelated concerns in one file
- Use deeply nested directories

### Performance

✅ **Do**:
- Cache expensive calculations
- Use efficient algorithms
- Profile CPU usage in Screeps
- Avoid unnecessary memory allocations

❌ **Don't**:
- Recalculate on every tick
- Create unnecessary objects in hot paths
- Use expensive operations in loops

### Testing

✅ **Do**:
- Write tests for new features
- Test edge cases and error conditions
- Use descriptive test names
- Keep tests fast and focused

❌ **Don't**:
- Skip writing tests
- Write tests that depend on external state
- Make tests overly complex

## Quality Improvement Roadmap

### Short-Term (1-2 months)

- [ ] Reduce duplication to <10%
- [ ] Fix all lint errors (allow warnings)
- [ ] Increase test coverage to >60%
- [ ] Refactor files over 500 lines

### Medium-Term (3-6 months)

- [ ] Reduce duplication to <5%
- [ ] Reduce files over 300 lines to <20%
- [ ] Increase test coverage to >70%
- [ ] Enable stricter lint rules

### Long-Term (6-12 months)

- [ ] Maintain <5% duplication
- [ ] Maintain <10% files over 300 lines
- [ ] Maintain >80% test coverage
- [ ] Zero lint warnings

## Resources

- **QUALITY_METRICS.md** - Baseline metrics and targets
- **QUALITY_GATES.md** - CI/CD quality automation details
- **CONTRIBUTING.md** - General contribution guidelines
- **ROADMAP.md** - Architecture and design principles
- **.jscpd.json** - Duplication detection config
- **eslint.config.shared.js** - Shared ESLint configuration

## Getting Help

- Check existing issues: https://github.com/ralphschuler/screeps/issues
- Read documentation in the repository
- Ask in pull request comments
- Look at recent merged PRs for examples

## Summary

**Quality is everyone's responsibility**. By following these guidelines and using the provided tools, we can maintain a high-quality codebase that's easy to understand, maintain, and extend.

**Remember**:
1. ✅ Run quality checks before committing
2. ✅ Fix errors, document warnings
3. ✅ Write tests for new features
4. ✅ Keep files small and focused
5. ✅ Don't duplicate code

**Questions?** Open an issue or ask in your PR!
