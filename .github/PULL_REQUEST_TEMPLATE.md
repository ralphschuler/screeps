## Description

<!-- Provide a clear and concise description of your changes -->

## Type of Change

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Configuration change

## Related Issues

<!-- Link to related issues: Fixes #123, Relates to #456 -->

## Changes Made

<!-- List the key changes in bullet points -->

-
-
-

## Testing

<!-- Describe the tests you ran and how to reproduce them -->

### Test Configuration

- Node version:
- npm version:
- Branch:

### Test Results

- [ ] Unit tests pass locally
- [ ] Integration tests pass locally (if applicable)
- [ ] Linter passes with no errors
- [ ] No new TypeScript errors

## Code Quality Checklist

### General Quality

- [ ] Code follows the existing code style
- [ ] Code is self-documenting or includes helpful comments
- [ ] No unnecessary console.log statements (except in approved files)
- [ ] No commented-out code (unless temporarily needed for debugging)

### Quality Metrics

- [ ] **Linting**: `npm run lint` passes (or warnings are documented below)
- [ ] **Type Safety**: `npm run build` compiles without errors
- [ ] **Tests**: Test coverage maintained or improved
- [ ] **Duplication**: No significant new code duplication added
- [ ] **Complexity**: No excessively complex functions (>25 cyclomatic complexity)
- [ ] **File Size**: New files under 300 lines (or split if larger)

### Performance

- [ ] Changes are CPU-efficient (important for Screeps!)
- [ ] No memory leaks or excessive memory usage
- [ ] Caching used appropriately for frequently accessed data

### ROADMAP Compliance

- [ ] Changes align with ROADMAP.md architecture and principles
- [ ] Changes respect CPU budgets defined in ROADMAP
- [ ] Changes follow established design patterns

## Documentation

- [ ] Updated relevant documentation in markdown files
- [ ] Updated inline code comments for complex logic
- [ ] Updated QUALITY_METRICS.md if changing quality infrastructure
- [ ] Added TODO comments for future work (if applicable)

## Quality Warnings (if any)

<!-- If linting or other quality checks have warnings, document them here and explain why they're acceptable -->

```
# Paste any quality check warnings here
```

**Justification**:

<!-- Explain why these warnings are acceptable -->

## Breaking Changes

<!-- If this is a breaking change, describe what breaks and migration steps -->

**What breaks**:

**Migration required**:

## Screenshots (if UI changes)

<!-- Add screenshots or GIFs demonstrating UI changes -->

## Additional Notes

<!-- Any other information that reviewers should know -->

## Reviewer Checklist

<!-- For reviewers to check -->

- [ ] Code changes are minimal and focused
- [ ] Tests adequately cover the changes
- [ ] No obvious security vulnerabilities
- [ ] Performance impact is acceptable
- [ ] Documentation is sufficient
- [ ] Quality metrics are acceptable

---

**Automated Checks**

The following will be checked automatically:
- ✅ Linting (all packages)
- ✅ TypeScript compilation (all packages)
- ✅ Unit tests (all packages)
- ✅ Code duplication analysis
- ✅ Code complexity analysis
- ✅ Bundle size tracking
