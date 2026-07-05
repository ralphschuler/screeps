---
name: screeps-private-server
description: Use when starting, testing, debugging, or changing the local Dockerized Screeps private server, CI smoke/long simulations, private-server auth/binding, screepsmod-testing assertions, or bot upload/runtime checks.
---

# Screeps Private Server

Use this skill for this repo's local/CI Screeps private-server workflow. Prefer this over remote live-world tooling.

## Sources of Truth

Read these first when the task touches private-server behavior:

1. `packages/screeps-server/README.md`
2. `packages/screeps-server/INTEGRATION_TEST_GUIDE.md`
3. `packages/screeps-server/TESTING_GUIDE.md`
4. `packages/screeps-server/PERFORMANCE_TESTING_GUIDE.md`
5. `packages/screeps-server/docker-compose.ci.yml`
6. `packages/screeps-server/config.ci.yml`
7. `packages/screepsmod-testing/` for in-game assertions

ROADMAP.md and AGENTS.md still govern bot architecture and safety.

## Runtime Model

- Real Dockerized private server, not mocks.
- Server package: `@ralphschuler/screeps-server`.
- Server container uses pinned `screeps@4.3.0`.
- Test mod: `packages/screepsmod-testing` is loaded by the server.
- Artifacts: `packages/screeps-server/artifacts/<mode>/`.
- Default local bind: `http://127.0.0.1:21025`.
- Default local credentials:
  - User: `swarm-bot`
  - Password: `ci-password`
  - Server password: `ci-password`

## Commands

From repo root:

```bash
npm run build
npm run build:mod
npm run test:server:smoke
```

Long simulation:

```bash
npm run test:server:long
```

Manual local stack:

```bash
npm run server:local:up
npm run server:local:down
npm run server:local:reset
npm run server:local:logs
```

Manual CI stack:

```bash
npm run server:ci:up
npm run server:ci:down
```

LAN access is opt-in only and requires non-default server and bot passwords because shared-network clients can reach the local server:

```bash
npm run server:local:up -- --serverHost=0.0.0.0 --serverPassword=<strong-server-password> --password=<strong-bot-password>
```

A LAN bind with either default `ci-password` credential is rejected before Docker Compose starts. If Docker shows stale `0.0.0.0`, recreate/reset:

```bash
npm run server:local:down
npm run server:local:up
# or discard volumes
npm run server:local:reset
```

## Process Tool Rule

Use the `process` tool for long-running server commands/log tails:

- `npm run server:local:up`
- `npm run server:local:logs`
- `npm run test:server:long`

Use plain shell only for finite quick checks.

## Failure Policy

Treat these as failing conditions:

- server not ready
- bot upload failure
- testing mod not loaded
- missing mod results
- any mod assertion failure
- reset loops
- no tick progression
- unhealthy CPU bucket
- critical console errors over threshold

## Required In-Game Assertions

When changing private-server tests, preserve/add assertions for:

- tick progression
- bot user/room/spawn setup
- room survival
- creep population after warmup
- `Memory.creepTaskBoard` existence and room boards
- CPU bucket health
- critical console error thresholds

Add new in-game checks under `packages/screepsmod-testing/src/suites/` and wire them through server config.

## Safety

- Never expose the local server on LAN unless explicitly requested.
- Never commit real credentials or tokens.
- Never attack allies `TooAngel` or `TedRoastBeef` in any generated test scenario or bot logic.
- For destructive server actions (`server:local:reset`, volume deletion), confirm user intent unless reset is explicitly requested.

## Output Contract

For private-server work, report:

- command(s) run
- server bind and auth assumptions
- artifact paths checked
- pass/fail summary from `summary.md` or `summary.json`
- next failure to inspect, if failing
