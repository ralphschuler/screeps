# Screeps Server Testing Guide

## Overview

Server tests use a real Dockerized Screeps private server. Mock server runners are not supported.

## Smoke Test

```bash
npm run test:server:smoke
```

The smoke test builds the bot and `screepsmod-testing`, starts the Docker server, seeds runtime scenarios, uploads the bot, waits for strict in-game assertions, emits artifacts, and tears down volumes. Default smoke runtime is 15 minutes or 10,000 ticks.

Available scenarios:

- `default-bootstrap`
- `construction-economy`
- `remote-mining` (accepts room remote assignments, remote stats, or active remote-role creeps as runtime telemetry)
- `defense-hostile`
- `defense-hard-invader` (clears bootstrap safe-mode while seeding and records 50-part hostile seed metadata for runtime assertions)
- `nukerless-nuke` (seeds an incoming nuke without an owned nuker and verifies defensive alert memory)
- `stacked-nukes` (seeds two same-tile incoming nukes and verifies distinct object-ID alerts)
- `alliance-safety`

Override with `SCREEPS_TEST_SCENARIOS=none` or a comma list.

## Long Run

```bash
npm run test:server:long
```

The long run targets 2 hours wall time at the configured accelerated tick duration.

## Test Mod

`packages/screepsmod-testing` is required. It runs assertions inside the server runtime and writes results for the harness to inspect.

Required checks include bot spawn, room survival, creep population, CPU bucket health, `Memory.creepTaskBoard`, room/empire memory schemas, stats export, spawn queue telemetry, scenario-specific behavior, and permanent ally safety for `TooAngel`/`TedRoastBeef`.

## Artifacts

Artifacts are written to `packages/screeps-server/artifacts/<mode>/`. The harness summary records `finishedGameTime` and `metrics.ticksAdvanced` from the latest observed server game-time read, including the final read that causes polling to stop.

## Cleanup

The harness always runs Docker cleanup with volume removal. Manual cleanup:

```bash
npm run server:ci:down
```
