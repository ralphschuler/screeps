# Bot Performance Testing

Performance validation uses the real Dockerized Screeps private server in `packages/screeps-server`.

## Smoke

```bash
npm run test:server:smoke
```

## Long Run

```bash
npm run test:server:long
```

The long run is also available through the manual/nightly `Screeps Long Run` GitHub Actions workflow.

## Assertions

`packages/screepsmod-testing` is required and runs in-game assertions for server state, room survival, creep population, CPU bucket health, and `Memory.creepTaskBoard` progress.

## Reports

Harness output is written to `packages/screeps-server/artifacts/<mode>/`.
