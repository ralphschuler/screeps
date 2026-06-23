## Read-only scout result

**Changed files by scout:** none.  
**Dirty tree respected:** avoided already-dirty packages: layouts, memory, pheromones, roles, stats, defense, spawn, screeps-bot.

## Recommended slice

### 1. `@ralphschuler/screeps-economy` — split `MarketManager` deal/order selection helpers

**Why high-value**
- `packages/screeps-economy/src/market/marketManager.ts` = **1516 LOC**, clean.
- One class currently owns:
  - price tracking
  - buy/sell order creation
  - emergency buying
  - active sells
  - arbitrage
  - room balancing
- ROADMAP fit:
  - `ROADMAP.md:503` market AI section
  - `ROADMAP.md:815-822` modularity/testability guidance
  - `ROADMAP.md:820` explicitly names market strategies for unit tests

**Narrow behavior-preserving slice**
Extract pure candidate/scoring helpers, keep side effects in `MarketManager`:
- from `executeActiveSell()` around `marketManager.ts:816`
- from `executeEmergencyBuy()` around `marketManager.ts:1116`
- optionally arbitrage math from `checkArbitrageOpportunities()` around `marketManager.ts:1354`

**Suggested files if implemented**
- Modify: `packages/screeps-economy/src/market/marketManager.ts`
- Add: `packages/screeps-economy/src/market/orderSelection.ts`
- Tests:
  - existing: `packages/screeps-economy/test/MarketManager.test.ts`
  - optional new focused unit: `packages/screeps-economy/test/orderSelection.test.ts`

**Validation**
- Ran:
  ```bash
  npm test -w @ralphschuler/screeps-economy -- --grep "MarketManager"
  ```
- Result: **15 passing**
- Checked clean target diff:
  ```bash
  git diff --stat -- packages/screeps-economy
  ```
  no output.

## Other candidates

- `packages/screeps-economy/src/terminals/terminalManager.ts` — 800 LOC, clean, but only 124 LOC tests. Lower confidence.
- `packages/screeps-chemistry/src/labs/labConfig.ts` — 399 LOC, clean, tested, but smaller payoff.
- `packages/screeps-utils/src/cache/roleCache.ts` — 514 LOC, clean, ROADMAP-aligned caching, but weak direct tests.

## Risks

- Market logic is credit/resource critical; preserve `Game.market.deal/createOrder` side effects in manager.
- Refactor should not change exported API from `packages/screeps-economy/src/index.ts`.
- Run after implementation:
  ```bash
  npm run test:economy
  npm run lint:economy
  npm run build:economy
  ```