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

LAN access is explicit opt-in:

```bash
npm run server:local:up -- --serverHost=0.0.0.0
```

If Docker still shows a stale `0.0.0.0` bind, recreate or reset the local stack:

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

- Pull requests run short real-server smoke tests.
- Manual and nightly workflow runs execute a 2-hour accelerated simulation.
- Raw Docker logs are retained briefly.
- Sanitized summaries and mod results are retained longer.

## Required In-Game Checks

`screepsmod-testing` must assert server and bot state from inside the game runtime, including:

- ticks advancing
- our bot user/room/spawn exists
- no reset loop
- creep population after warmup
- CPU bucket health
- `Memory.creepTaskBoard` exists and records room task boards
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
