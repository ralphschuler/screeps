# Integration Test Guide

Integration tests run against the real Dockerized private server defined in `docker-compose.ci.yml`.

## Local Smoke

```bash
npm run build
npm run build:mod
npm run test:server:smoke
```

## Local Client Connection

Default local server bind is localhost-only:

```text
http://127.0.0.1:21025
User: swarm-bot
Password: ci-password
Server password: ci-password
```

Use LAN binding only when needed:

```bash
npm run server:local:up -- --serverHost=0.0.0.0
```

If a running container still exposes `0.0.0.0`, recreate/reset it:

```bash
npm run server:local:down
npm run server:local:up
npm run server:local:reset
```

## CI

Pull requests run a short private-server smoke workflow. Long simulations run from the dedicated manual/nightly workflow.

## In-Game Assertions

`screepsmod-testing` is loaded by the private server and runs assertions in the game runtime. Add new state checks under `packages/screepsmod-testing/src/suites/` and include them in `config.ci.yml`.

Required assertion areas:

- server tick progression
- bot user/room/spawn setup
- room survival
- creep population
- task-board state via `Memory.creepTaskBoard`
- CPU bucket health
- critical error thresholds

## Failure Policy

The harness fails if the server does not become ready, the bot cannot be uploaded, the testing mod does not load, mod results are missing, or any mod test fails.
