# Screeps Private Server Testing

This package owns the real Dockerized Screeps private-server test stack used by local smoke tests and CI long-run simulations.

## Runtime Model

- Server container: Node 22 + pinned `screeps@4.3.0`
- Bot build/runtime in this repo: Node from `.nvmrc`
- CI server stack: `docker-compose.ci.yml`
- CI config: `config.ci.yml`
- Test mod: `../screepsmod-testing` is required and loaded by the server

Old mock/performance-server runners are intentionally not supported.

## Local Commands

From repo root:

```bash
npm run build
npm run build:mod
npm run test:server:smoke
```

Long run:

```bash
npm run test:server:long
```

Manual local stack control:

```bash
npm run server:local:up
npm run server:local:down
npm run server:local:reset
npm run server:local:logs
```

Default local bind is localhost-only:

```text
http://127.0.0.1:21025
User: swarm-bot
Password: ci-password
Server password: ci-password
```

LAN access is explicit opt-in and requires non-default passwords because shared-network clients can reach the local server:

```bash
npm run server:local:up -- --serverHost=0.0.0.0 --serverPassword=<strong-server-password> --password=<strong-bot-password>
```

A LAN bind with the default `ci-password` server or bot password fails before Docker Compose starts. If Docker still shows a stale `0.0.0.0` bind, recreate or reset the local stack:

```bash
npm run server:local:down
npm run server:local:up
# or discard volumes:
npm run server:local:reset
```

Manual CI stack control:

```bash
npm run server:ci:up
npm run server:ci:down
```

## CI Behavior

- Pull requests run strict real-server smoke tests with seeded runtime scenarios (default 15 minutes / 3000 ticks).
- Manual and nightly workflow runs execute a 2-hour accelerated simulation.
- The CI mod list intentionally omits `screepsmod-bots`. The harness creates `swarm-bot` as a regular player, keeps its user identifier consistent across user/code/room records, and uploads then reads back the repository bundle; it never seeds an NPC bot AI.
- Raw Docker logs are retained briefly.
- Sanitized summaries and mod results are retained longer.

## Required In-Game Checks

`screepsmod-testing` must assert server and bot state from inside the game runtime. CI uses a 100-tick runtime warmup and requires zero skipped assertions afterward. Player-sandbox summaries and bot-code warmup timestamps are also persisted outside user `Memory`, preventing backend/player write races from producing stale false-green results.

- ticks advancing
- our bot user/room/spawn exists
- no reset loop
- creep population after warmup
- CPU bucket health
- `Memory.creepTaskBoard` exists and records room task boards
- room/empire memory schemas and numeric pheromone channels
- unified stats and spawn queue telemetry
- default, construction, remote-mining, defense-hostile, defense-hard-invader, and alliance-safety scenario assertions
- permanent allies (`TooAngel`, `TedRoastBeef`) are never treated as war targets
- critical console error counter below threshold

## Artifacts

Harness artifacts are written under:

```text
packages/screeps-server/artifacts/<mode>/
```

Expected files:

- `summary.json`
- `summary.md`
- `harness.log`
- `docker.log`
- `scenario-<name>.json` for each configured runtime scenario

`summary.json`/`summary.md` preserve merged and source-specific in-game assertion results:

- `metrics.screepsmodTesting` merged from player sandbox + backend cronjob
- `metrics.screepsmodTestingPlayer` from the player sandbox
- `metrics.screepsmodTestingBackend` from the backend cronjob, including DB/runtime diagnostics such as owned controllers, spawns, creeps, task-board rooms, scenario metrics, and recent bot error notifications
