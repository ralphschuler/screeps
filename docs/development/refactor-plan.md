# Refactor plan

This plan turns code-refinement findings into staged, framework-first cleanup work. `ROADMAP.md` remains the gameplay/architecture source of truth.

## P0 — deploy safety

- Keep `npm run build`, `npm run typecheck`, `npm run lint:all`, `npm run test:all`, `npm run test:server:smoke`, and `npm run build:docs` passing.
- Preserve ally filtering for `TooAngel` and `TedRoastBeef` in combat, tower, expansion, and hostile-classification code.
- Preserve `npm run push` / `npm run deploy` as the official Screeps upload path.

## P1 — framework-first corrections

- **Command registry ownership** — done. `@ralphschuler/screeps-console` owns command registry/decorator behavior; the bot has only a compatibility re-export. See [ADR-0009](../adr/0009-console-command-registry-ownership.md).
- **Intershard transfer lifecycle** — done. `@ralphschuler/screeps-intershard` owns transfer lifecycle; the bot injects spawn ports. See [ADR-0010](../adr/0010-intershard-spawn-port-injection.md).
- **Visuals ownership** — done for the first cleanup slice. `@ralphschuler/screeps-visuals` owns room/map visualizers, visualization manager, RoomVisual extensions, and budget dashboard rendering; the bot keeps only dependency-injection compatibility adapters.
- **InterShard schema ownership** — done for the first cleanup slice. `@ralphschuler/screeps-intershard` owns schema serialization/types; the bot keeps only a compatibility re-export.
- **Event bus unification** — pending. Cache/path invalidation should use an injected event-bus port instead of split singleton buses.
- **Defense-assist combat ownership** — done for the current cleanup slice. `@ralphschuler/screeps-defense` owns defense-assist combat power, body planning, aggregate response sizing, and active-body filtering; `@ralphschuler/screeps-spawn` consumes the package API and keeps only a compatibility re-export.
- **Defender requirement ownership** — done. `@ralphschuler/screeps-defense` owns defender requirement sizing, emergency/assistance decisions, ally-safe hostile filtering, and active defender counting. `@ralphschuler/screeps-spawn/src/defenderManager.ts` is now only a compatibility re-export.

## P2 — cleanup and coverage

- Remove remaining bot-local duplicates for layouts after package tests import framework packages directly.
- Continue consolidating defense-assist assigned-power helpers so spawn and cluster coordination share the same accounting contract.
- Consolidate duplicate Screeps test setup globals into shared fixtures.
- Add package-level behavior tests before moving any public logic.
- Keep docs aligned with Node.js 24 and current package names.

## P3 — staged simplification

- Split large modules only around stable seams and pure calculators:
  - `packages/@ralphschuler/screeps-stats/src/unifiedStats.ts`
  - `packages/@ralphschuler/screeps-kernel/src/kernel.ts`
  - `packages/screeps-economy/src/market/marketManager.ts`
  - `packages/screeps-spawn/src/spawnNeedsAnalyzer.ts`
- Replace weak `any`/broad casts with typed ports and Memory accessors as files are touched.
- Keep generated artifacts documented/ignored; do not hand-edit `wiki/`, coverage, reports, or temporary debug files.

## Current baseline observations

Collected 2026-06-13 using Node.js 24.15.0/npm 11.12.1; refreshed 2026-06-30 using Node.js 24.18.0/npm 11.16.0:

- `npm run check-versions` — passed.
- `npm run sync:deps:check` — passed.
- `npm run build` — passed; latest bot bundle 1.23 MiB / 2 MiB.
- `npm run typecheck` — passed.
- `npm run lint:all` — passed with Node module-type warnings from package ESLint configs.
- `npm run test:all` — passed, including Docker private-server smoke through the server workspace.
- `packages/screeps-server/artifacts/smoke/summary.md` — status passed, 45/45 `screepsmod-testing` checks, tick ~2981.
- `npm run quality:duplication` — produced reports and identified high-value framework-first duplicates, especially visuals, intershard schema, kernel decorators/events, command registry, and bot-local layout mirrors.
- `npm run quality:complexity` — completed; largest files include `unifiedStats.ts`, `kernel.ts`, `marketManager.ts`, `shardManager.ts`, `spawnNeedsAnalyzer.ts`, and bot `expansionManager.ts`.
- `npm run build:docs` — passed and generated ignored `wiki/` output.

The `custom.code-refinement-scout` agent is required for each major maintenance pass. On 2026-06-30 it identified defender requirement ownership as the best next framework-first slice; that consolidation is now complete.

## Validation commands

```bash
nvm use
npm ci
npm run check-versions
npm run sync:deps:check
npm run build
npm run typecheck
npm run lint:all
npm run test:all
npm run test:server:smoke
npm run quality:duplication
npm run quality:complexity
npm run build:docs
```
