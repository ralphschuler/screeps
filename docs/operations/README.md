# Operations guide

Operate the bot with CPU, bucket, spawn health, room survival, and error rate as first-class signals.

## Monitoring sources

- Screeps console output.
- `Memory.stats` / unified stats package output. Screeps memory polling is rate-limited; prefer the console WebSocket stream for bounded live-analysis automation.
- `scripts/live-cpu-profile.mjs` for read-only CPU/bucket/process samples from console stats logs by default, with explicit Memory polling fallback; its logs redact token-bearing API error fragments.
- Grafana dashboards linked from the root README when available.
- Private-server artifacts under `packages/screeps-server/artifacts/<mode>/`.
- GitHub Actions validation artifacts for duplication, complexity, coverage, and smoke tests.
- [Global runtime diagnostics](global-runtime-diagnostics.md) for global resets and stale heap switches.

## Artifact hygiene

Generated local live/deploy/refinement outputs are ignored by default so routine diagnostics do not dirty `git status`. Prefer `.tmp/artifacts/...` for new local collectors and keep long-lived evidence in docs or an explicitly reviewed path. Historical curated files already tracked under `artifacts/` remain tracked; force-add a generated artifact only when a PR intentionally needs that exact evidence file.

Current ignored generated paths include `.tmp/`, `artifacts/live-500-*`, `artifacts/live-analysis-*`, `artifacts/postdeploy-*`, `artifacts/deploy-*`, `artifacts/issue-*`, `artifacts/cpu-profile*`, `artifacts/code-refinement-*`, `artifacts/agent/`, `artifacts/subagents/`, and `packages/screeps-server/artifacts/`.

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

## Live CPU profiling

Use the bounded root script for read-only live CPU, bucket, process, room, role, and CPU-detail samples. The default path subscribes once to the Screeps console WebSocket stream and parses the bot's `{"type":"stats","data":...}` logs, avoiding `/api/user/memory` polling limits:

```bash
SCREEPS_TOKEN=<read-only-token-with-console-access> npm run profile:live:cpu
```

Override the target safely with CLI flags or env vars when profiling a private server:

```bash
SCREEPS_TOKEN=<token> npm run profile:live:cpu -- --samples 5 --interval 1000 --shards shard0 --hostname 127.0.0.1 --protocol http --port 21025
```

Supported environment variables: `SCREEPS_TOKEN` (required), `SCREEPS_HOSTNAME`, `SCREEPS_PROTOCOL`, `SCREEPS_PORT`, and `SCREEPS_PATH`. Use `--source memory` only when console stats are unavailable or a no-rate-limit token is configured; do not paste token-bearing Screeps URLs into issues or logs.

By default, the profiler fails closed when every requested shard returns zero samples. For console mode, this usually means the bot did not emit stats logs on that shard before `--console-timeout`. For Memory mode, it usually means `/api/user/memory` is rate-limited or unavailable. Use `--allow-empty` only when you intentionally want degraded artifacts for investigation:

```bash
SCREEPS_TOKEN=<token> node scripts/live-cpu-profile.mjs --source console --samples 1 --interval 0 --shards shard1 --allow-empty
```

For structural live snapshots, pass explicit rooms when possible. The default stats path reads one console WebSocket stats sample and skips `/api/user/memory` when those explicit rooms are enough; use `--stats-source memory --memory-paths all` only with no-rate-limit credentials or intentionally low-frequency checks:

```bash
SCREEPS_TOKEN=<token> node packages/screeps-server/scripts/export-live-structural-snapshot.js --shard shard1 --rooms W18S28,W18S27 --console-timeout 15000
```

Deployment gates can still fail when requested Memory reads are unavailable while writing redacted artifacts:

```bash
SCREEPS_TOKEN=<token> node packages/screeps-server/scripts/export-live-structural-snapshot.js --shard shard1 --rooms W18S28,W18S27 --stats-source memory --memory-paths all --fail-on-memory-errors
```

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
- **Live Memory API rate limits:** use `scripts/live-cpu-profile.mjs --source console` first, and use structural snapshots with `--rooms ...` so they can rely on console stats plus room-object endpoints. Reserve Memory modes for no-rate-limit tokens or very low-frequency checks. Do not paste token-bearing Screeps account URLs into issues or logs.
- **Allied target risk:** use shared alliance helpers from core/defense and add tests for `TooAngel`/`TedRoastBeef`.

## Deploy/version marker

The built bundle should expose enough console or Memory information to identify deployed code version and branch. If live behavior is unclear, compare current bundle build time/hash with deploy logs before debugging gameplay.
