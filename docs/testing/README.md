# Testing guide

Use layered validation: package unit tests first, bot integration tests next, then private-server smoke when runtime behavior or deployability matters.

## Commands

```bash
npm run check-versions
npm run sync:deps:check
npm run build
npm run typecheck
npm run lint:all
npm run test:unit
npm run test:integration
npm run test:all
npm run test:server:smoke
npm run quality:duplication
npm run quality:complexity
npm run build:docs
npm run verify
```

## Unit tests

Each framework package should have meaningful tests in `packages/<package>/test/`.

Run examples:

```bash
npm test -w @ralphschuler/screeps-roles
npm test -w @ralphschuler/screeps-spawn
npm test -w @ralphschuler/screeps-defense
npm test -w @ralphschuler/screeps-economy
npm test -w screeps-typescript-starter
```

Test public behavior and stable contracts, not private implementation details. Prefer pure planners/scorers for body planning, spawn priorities, remote profitability, threat scoring, tower policy, market decisions, and memory migrations.

## Integration tests

Main bot integration tests live under `packages/screeps-bot/test/integration/` and package interaction tests live near the packages they exercise.

Important integration coverage:

- main loop executes with mocked `Game`/`Memory`,
- framework packages compose through `packages/screeps-bot`,
- spawn queue produces required creeps for common room states,
- defense reacts to hostiles and ignores allies,
- remote mining assigns miner/hauler/reserver work,
- stats emit without crashing,
- Memory migrations are idempotent.

## Mocking Game and Memory

- Bot tests load `packages/screeps-bot/test/setup-mocha.mjs`.
- Framework tests commonly load local `test/setup.ts` files.
- Mock only runtime boundaries: `Game`, `Memory`, `RawMemory`, market API, pathfinding, time, random, and expensive IO.
- Keep stubs aligned with package public exports. If a shared package re-exports a helper, the test stub must expose it too.

## Private-server smoke

```bash
npm run test:server:smoke
```

The smoke harness is in `packages/screeps-server/` and starts a Dockerized Screeps private server with `packages/screepsmod-testing` loaded.

Check artifacts after a run:

```text
packages/screeps-server/artifacts/smoke/summary.md
packages/screeps-server/artifacts/smoke/summary.json
packages/screeps-server/artifacts/smoke/harness.log
packages/screeps-server/artifacts/smoke/docker.log
```

A passing smoke run must show tick progression, bot upload/load, room survival, no fatal console errors, task-board health, and acceptable CPU/bucket health.

## Quality gates

- `quality:duplication` uses JSCPD and fails when total duplication exceeds the 22% transitional threshold while framework extraction continues. The long-term target remains < 5% duplication.
- `quality:complexity` writes complexity artifacts under `reports/` and fails when more than 22% of analyzed files exceed 300 lines. The long-term target remains < 20% files over 300 lines.
- `build:docs` validates documentation aggregation.
- `verify` runs the primary local gate plus alliance safety and production dependency audit.

## Adding tests

1. Put package tests next to the package.
2. Add behavior-first assertions.
3. Run the narrow package test.
4. Run dependent bot/package tests.
5. Run private-server smoke for runtime-affecting changes.
