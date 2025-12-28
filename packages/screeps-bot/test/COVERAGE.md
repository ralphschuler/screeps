# Test Coverage

This document describes the test coverage setup and metrics for the Screeps bot.

## Current Coverage

As of the latest test run:
- **Lines**: 55.14%
- **Statements**: 55.14%
- **Functions**: 59.93%
- **Branches**: 63.36%

## Coverage Thresholds

The following minimum coverage thresholds are enforced:
- Lines: 55%
- Statements: 55%
- Functions: 50%
- Branches: 50%

## Running Coverage Reports

### Locally

```bash
# Run tests with coverage
npm run test:coverage -w screeps-typescript-starter

# Generate HTML coverage report
npm run test:coverage:report -w screeps-typescript-starter

# View HTML report
open packages/screeps-bot/coverage/index.html
```

### In CI/CD

Coverage reports are automatically generated and uploaded to Codecov on every pull request and push to main branch.

## Coverage Goals

### Short Term (Current Sprint)
- [x] Establish baseline coverage measurement
- [x] Set up CI/CD coverage reporting
- [x] Configure coverage thresholds

### Medium Term (Next Quarter)
- [ ] Increase overall coverage to 60%
- [ ] Focus on critical paths: pheromone logic, spawn priority, defense coordination
- [ ] Add integration tests for kernel process lifecycle

### Long Term
- [ ] Achieve 70%+ coverage for core systems
- [ ] Implement performance regression testing
- [ ] Add property-based tests for critical algorithms

## High Priority Coverage Areas

Based on the general testing guidance in ROADMAP.md Section 23 and the detailed requirements from the originating GitHub issue, these areas need additional test coverage:

1. **Pheromone Logic** (Section 7)
   - Current: ~50% coverage
   - Target: 80% coverage
   - Files: `src/memory/swarmState.ts`, `src/rooms/roomPheromone.ts`

2. **Spawn Priority** (Section 10)
   - Current: ~50% coverage
   - Target: 75% coverage
   - Files: `src/spawning/spawnPriority.ts`, `src/spawning/spawnQueue.ts`

3. **Market Trading** (Section 17)
   - Current: ~60% coverage
   - Target: 70% coverage
   - Files: `src/empire/marketManager.ts`, economy package

4. **Defense Coordination** (Section 12)
   - Current: ~65% coverage
   - Target: 80% coverage
   - Files: defense package

5. **Pathfinding & Caching**
   - Current: 100% coverage ✅
   - Files: `src/utils/caching/*`

## Coverage by System

### Excellent Coverage (>80%)
- Caching utilities (100%)
- Metrics collection (100%)
- Unified stats (95%)
- State machine (94%)
- Computation scheduler (93%)

### Good Coverage (60-80%)
- Economy behaviors (82%)
- Kernel system (77%)
- Bootstrap manager (76%)
- Event bus (73%)

### Needs Improvement (<60%)
- Visualization (30%)
- Standards protocols (40-70%)
- Remote mining utilities (40%)
- Spawn coordinator (36%)
- Cluster management (49%)

## Excluded from Coverage

The following are excluded from coverage metrics:
- Type definition files (`*.d.ts`)
- Test files (`*.test.ts`)
- Test infrastructure (`test/`)
- Node modules
- Build output (`dist/`)

## Coverage Tools

- **Framework**: c8 (Istanbul code coverage for native ESM)
- **Reporters**: Text (terminal), HTML (browser), LCOV (CI integration)
- **CI Integration**: Codecov for PR comments and historical tracking

## Best Practices

1. **Write testable code**: Keep functions pure when possible
2. **Test edge cases**: Don't just test happy paths
3. **Mock external dependencies**: Use stubs for Game objects
4. **Focus on critical paths**: Prioritize high-impact, high-risk code
5. **Keep tests fast**: Avoid delays and complex setup
6. **Document complex tests**: Explain "why" not just "what"

## Related Documentation

- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - How to write and run tests
- [TEST_COVERAGE.md](./TEST_COVERAGE.md) - Detailed coverage by file
- [ROADMAP.md](../../ROADMAP.md) - Section 23: Projektstruktur, Modularität & Tests (general guidance on structure & testability)
