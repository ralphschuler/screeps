# Operations guide

Operate the bot with CPU, bucket, spawn health, room survival, and error rate as first-class signals.

## Monitoring sources

- Screeps console output.
- `Memory.stats` / unified stats package output. Screeps memory polling is rate-limited; use a no-rate-limit API token for bounded live-analysis automation when available.
- `scripts/live-cpu-profile.mjs` for read-only CPU/bucket/process samples from `Memory.stats`; its logs redact token-bearing API error fragments.
- Grafana dashboards linked from the root README when available.
- Private-server artifacts under `packages/screeps-server/artifacts/<mode>/`.
- GitHub Actions validation artifacts for duplication, complexity, coverage, and smoke tests.
- [Global runtime diagnostics](global-runtime-diagnostics.md) for global resets and stale heap switches.

## Key health checks

| Signal | Healthy expectation | Investigate when |
| --- | --- | --- |
| CPU bucket | stable or recovering | bucket trends below 5000, crisis below 2000 |
| Main loop | one successful tick per game tick | uncaught exception or global reset loop |
| Spawn uptime | spawns busy when energy and demand exist | idle spawn with missing critical roles |
| Creep count | matches room phase and remote count | collapse, runaway spawning, or stale creep memory |
| Task board | room boards exist and stale reservations pruned | assignments missing or stale reservations grow |
| Defense | hostiles classified, allies ignored | allied entity targeted or safe mode misfires |
| Economy | sources mined, haulers moving, storage/terminal sane | dropped energy buildup, terminal overflow, link idle |

## CPU/bucket policy

- Critical spawn/mining/defense work should survive low bucket.
- Global planning, visuals, market scans, layout work, and expansion scoring should be bucket/interval gated.
- Avoid pathfinding every tick; prefer cached paths/routes and stable room data.
- Keep expensive logging throttled and structured.

## Runtime triage

1. Check recent console errors and global reset frequency.
2. Inspect CPU/bucket stats and process-level CPU if exported.
3. Inspect room-level spawn/economy/defense stats.
4. Check Memory size and recently added serialized data.
5. Reproduce with unit tests or `npm run test:server:smoke` when possible.
6. Fix with a behavior test before changing runtime logic.

## Private-server artifacts

After smoke/long tests, inspect:

```text
packages/screeps-server/artifacts/smoke/summary.md
packages/screeps-server/artifacts/smoke/summary.json
packages/screeps-server/artifacts/smoke/harness.log
packages/screeps-server/artifacts/smoke/docker.log
```

Treat these as failures: no tick progression, bot upload failure, missing test mod results, fatal console errors above threshold, reset loops, dead spawn/room, unhealthy CPU bucket, or missing task-board assertions.

## Common issues

- **Deploy says credentials valid but no upload:** confirm `DEPLOY=true` path via `npm run push`, not `npm run build`.
- **Private-server ports busy:** harness auto-selects alternate ports; stale containers can be stopped with server package scripts.
- **Global reset loop:** inspect first thrown error in console/harness logs, then add a regression test around initialization.
- **Global heap switch:** check `Memory.runtimeDiagnostics.global.switchCount`; repeated increments mean heap globals may be stale.
- **Bucket drain:** disable expensive visuals/planning first, then profile process metrics and hot path pathfinding.
- **Live Memory API rate limits:** reduce sample count/interval pressure or configure a no-rate-limit `SCREEPS_TOKEN`; do not paste token-bearing Screeps account URLs into issues or logs.
- **Allied target risk:** use shared alliance helpers from core/defense and add tests for `TooAngel`/`TedRoastBeef`.

## Deploy/version marker

The built bundle should expose enough console or Memory information to identify deployed code version and branch. If live behavior is unclear, compare current bundle build time/hash with deploy logs before debugging gameplay.
