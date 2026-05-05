# PRD: Dockerized Screeps Private-Server Testing

## Status

Approved for documentation only. This PRD captures the final plan. Implementation requires separate approval.

## Objective

Create a product and engineering plan for replacing old Screeps mock/performance-server testing with a real Dockerized Screeps private server that can run the bot locally and in CI. The system must support:

- short PR smoke tests
- manual and nightly long-run tests
- a 2-hour accelerated world simulation
- opponent bots
- required in-game assertions through `screepsmod-testing`

## Background

The repository currently contains or references old testing paths based on mock/private-server tooling that should be removed or replaced during implementation:

- `screeps-server-mockup`
- `screeps-performance-server`
- mock server helper paths
- performance-server scripts and docs

Current decision: Screeps private server has moved forward and should be run as a current real server in Docker, not through legacy mock infrastructure.

## Decisions

- Stage 1 writes only this `PRD.md`.
- Stage 2 implementation requires separate approval.
- Long-run CI runs manually and nightly.
- PR CI runs short smoke only; no 2-hour PR blocker.
- Server image is repo-local, based on official `screeps@4.3.0` on Node 22.
- Repository/bot build runtime remains `.nvmrc` Node 24.
- Long-run duration is 2 hours wall time.
- Initial tick duration is 100ms.
- Opponent rollout starts with simplebot.
- TooAngel, Overmind, and Choreographer may be added after compatibility is verified and versions are pinned.
- `screepsmod-testing` is required, not optional.
- `screepsmod-testing` must be built, loaded by the server, and used for in-game assertions/events/state checks.
- Old `screeps-server-mockup` and `screeps-performance-server` paths must be removed.
- CI long-run must be secretless.
- Raw logs are retained for 3 days.
- Sanitized summary/results artifacts are retained for 30 days.

## Assumptions

- CI can run jobs with 150–180 minute timeout for manual/nightly long-run workflows.
- CI long-run does not need Steam/API secrets.
- `screepsmod-testing` can be adapted without replacing the whole package.
- If advanced opponent bots fail, simplebot-only is acceptable for first rollout.
- If 100ms tick duration is unstable, the implementation can raise tick duration to 200ms.

## Non-Goals

- No implementation during PRD stage.
- No live deployment to official Screeps servers.
- No bot behavior changes as part of this testing infrastructure work.
- No 2-hour PR blocking run.
- No Grafana exporter in the CI server stack.
- No compatibility with old mock/private server runners.
- No reliance on `screeps-server-mockup`.
- No reliance on `screeps-performance-server`.

## Users and Use Cases

### Developer local smoke test

A developer can start the Docker private server locally, upload the bot, run a short smoke test, inspect logs/results, then tear down volumes.

### CI PR smoke test

A pull request can run a short real-server smoke test to catch startup, upload, spawn, and basic runtime regressions without blocking on a 2-hour run.

### Nightly/manual long-run

A scheduled or manually triggered workflow runs the bot for 2 hours in an accelerated private-server world with opponent bots and in-game assertions.

### Bot infrastructure maintainer

A maintainer can inspect summary artifacts, mod test results, and sanitized logs to diagnose regressions in CPU, room survival, creep count, task-board behavior, or critical errors.

## Functional Requirements

### Real private server

- The test server must run a real Screeps private server in Docker.
- The server image must be repo-local and based on Node 22 with pinned `screeps@4.3.0`.
- The server must expose game and CLI/API access needed by the harness.
- Docker Compose must support local and CI execution.

### CI modes

- PR CI must run only a short smoke test.
- Manual CI must support a 2-hour long-run test.
- Nightly CI must support a 2-hour long-run test.
- Long-run workflows must have enough timeout buffer, expected 150–180 minutes.

### Bot and opponent setup

- The harness must build the bot before upload.
- The harness must upload our bot to the private server.
- The harness must spawn our bot in an expected room.
- The first implementation must support simplebot as an opponent.
- Advanced bots may be enabled only after compatibility and version pinning.

### `screepsmod-testing`

- `screepsmod-testing` must be included in server configuration, e.g. `../screepsmod-testing` in CI config.
- CI must run `npm run build:mod` before server start.
- CI must fail if `screepsmod-testing` fails to build.
- CI must fail if `screepsmod-testing` fails to load in the server.
- Smoke and long-run tests must include in-game assertions from `screepsmod-testing`.
- `screepsmod-testing` results must be included in long-run artifacts.

### Required in-game assertions

The in-game test suite must check at least:

- server ready / game ticks advancing
- our bot user exists
- our bot spawned in expected room
- owned room exists after warmup
- owned room survives long-run
- no global reset loop
- creep count above minimum after N ticks
- spawn refill/task-board progress
- `Memory.creepTaskBoard` exists and progresses
- CPU bucket not chronically empty
- critical console errors below threshold
- opponent bots exist / rooms initialized

### Harness behavior

The Docker harness must:

- start the server stack
- wait for HTTP/API/CLI readiness
- create/auth users as needed
- upload our bot bundle
- spawn rooms/opponents
- watch server logs and mod output/results
- run for target duration or smoke duration
- emit summary JSON and Markdown
- sanitize logs
- always clean up Docker volumes

The harness must fail if:

- server readiness times out
- bot upload fails
- our bot does not spawn
- `screepsmod-testing` fails to load
- `screepsmod-testing` reports failed tests
- mod result artifact or memory result is missing
- hard server timeout occurs
- critical runtime thresholds are breached

## Technical Requirements

### Files expected in implementation stage

Implementation may add/update:

- `packages/screeps-server/Dockerfile`
- `packages/screeps-server/docker-compose.ci.yml`
- `packages/screeps-server/config.ci.yml`
- `packages/screeps-server/scripts/*`
- `packages/screeps-server/package.json`
- `packages/screeps-bot/package.json`
- `packages/screeps-bot/scripts/*`
- `packages/screepsmod-testing/*`
- `.github/workflows/*`
- root `package.json`
- `package-lock.json`
- docs mentioning mockup/performance-server

Stage 1 must only create/update `PRD.md`.

### Scripts expected in implementation stage

Add or update scripts for:

- `server:ci:up`
- `server:ci:down`
- `test:server:smoke`
- `test:server:long`

### CI workflow requirements

Add a long-run workflow, likely `.github/workflows/screeps-long-run.yml`, with:

- `workflow_dispatch`
- nightly cron
- 150–180 minute timeout
- minimal permissions
- Docker setup
- bot build
- mod build
- server startup
- long-run harness execution
- artifact upload
- unconditional cleanup

Update existing performance/integration workflows so old mock/performance-server paths are removed or converted to short real-server smoke.

## Security and Operations Requirements

- CI long-run must be secretless.
- No Grafana exporter in CI server stack.
- No Steam key required in CI.
- Docker services must bind to localhost in CI/local by default.
- Docker services must include resource controls where practical:
  - CPU limits
  - memory limits
  - pids limits
  - log size limits
- Docker images and npm packages must be pinned.
- Server config for CI must set auto-update behavior off.
- Raw logs must be retained for only 3 days.
- Sanitized summaries and result artifacts must be retained for 30 days.
- Logs must be sanitized before long retention.
- `docker compose down -v` or equivalent volume cleanup must always run.

## Cleanup Requirements

Implementation must remove old infrastructure references and code paths for:

- `screeps-server-mockup`
- mock server fallback behavior
- `screeps-performance-server`
- `performance-test-with-logs.js` usage, unless rewritten for the new Docker harness
- docs that instruct users to use old mock/performance-server testing

Normal unit tests remain in scope and should be preserved.

## Rollout Plan

### Stage 1: PRD only

- Create/update `PRD.md` only.
- Do not modify implementation files.
- Validate document contains required decisions, requirements, non-goals, acceptance criteria, rollout/validation, risks, and open questions.

### Stage 2: Smoke implementation

- Add Docker image and CI compose config.
- Add minimal server config and simplebot opponent.
- Build/load `screepsmod-testing`.
- Run short local smoke test.
- Run short CI smoke test.

### Stage 3: Long-run implementation

- Add 2-hour manual/nightly workflow.
- Add summary artifacts.
- Add thresholds for pass/fail.
- Add sanitized log retention.

### Stage 4: Expand opponents and assertions

- Add pinned advanced bots if compatible.
- Expand `screepsmod-testing` state assertions.
- Tune tick duration and thresholds.

## Validation Plan

### Stage 1 validation

- Confirm `PRD.md` exists.
- Confirm no non-PRD files changed.
- Confirm this PRD contains:
  - decisions
  - requirements
  - non-goals
  - acceptance criteria
  - rollout/validation
  - risks/mitigations
  - open questions

### Stage 2+ validation commands

Expected commands after implementation:

```bash
npm ci --ignore-scripts
npm run build
npm run lint
npm test -w screeps-typescript-starter
npm run build:mod
npm run test:server:smoke
npm run test:server:long
```

### CI validation

- PR smoke workflow passes.
- Manual long-run completes 2 hours.
- Nightly long-run completes 2 hours.
- Summary artifact is uploaded.
- `screepsmod-testing` results are uploaded.
- Raw logs are retained for 3 days only.
- Sanitized summary/results retained for 30 days.

## Acceptance Criteria

### PRD stage

- [x] `PRD.md` created or updated.
- [x] No implementation required in PRD stage.
- [x] Implementation remains gated behind separate approval.
- [x] PRD states `screepsmod-testing` is required.
- [x] PRD states `screepsmod-testing` must assert in-game events/states.
- [x] PRD states old mock/performance-server infrastructure is to be removed.
- [x] PRD defines long-run and PR smoke behavior.

### Implementation stage

- [ ] No `screeps-server-mockup` code path remains.
- [ ] No `screeps-performance-server` dependency/script remains.
- [ ] Docker private server uses Node 22 and pinned official Screeps package.
- [ ] Local smoke test starts real server, uploads bot, and runs ticks.
- [ ] `screepsmod-testing` is built and loaded in Docker server.
- [ ] CI fails when `screepsmod-testing` fails to build or load.
- [ ] Smoke and long-run tests include in-game assertions from `screepsmod-testing`.
- [ ] At least one assertion checks `Memory.creepTaskBoard` progress/state.
- [ ] Manual/nightly CI runs 2 hours with opponent bots.
- [ ] PR CI only runs short smoke.
- [ ] Logs/artifacts are produced with the required retention policy.
- [ ] Documentation is updated to current server model.
- [ ] All validation commands pass.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Official image approach fails | Server cannot start in CI | Temporarily use pinned `screepers/screeps-launcher` digest |
| 100ms tick duration flakes | False failures | Raise tick duration to 200ms |
| Advanced bots fail to load | Long-run setup fails | Start with simplebot-only rollout |
| `screepsmod-testing` cannot read needed state | Missing required assertions | Add explicit bot-side `Memory.stats` / `Memory.creepTaskBoard` assertions or expose via console/API |
| CI timeout too short | Long-run killed early | Use 150–180 minute timeout |
| Resource exhaustion | Runner instability | Add Docker CPU/memory/pids/log limits |
| Secrets in logs | Secret leakage | Secretless CI, sanitized logs, short raw retention |
| Stale docs confuse users | Wrong local/CI commands | Update docs and grep for forbidden references |

## Open Questions

- What exact threshold should define “CPU bucket not chronically empty”?
- What minimum creep count should be required after warmup?
- What warmup tick/time should be used before survival assertions begin?
- Which advanced opponent bots should be enabled first after simplebot?
- Should long-run failure thresholds be strict initially or report-only for first few nights?
- Should `screepsmod-testing` write results to files, Memory, console output, or all three?
- Should the long-run workflow update baselines automatically or only upload reports?

## Out of Scope Until Later

- Grafana export for long-run CI.
- Automatic deployment after long-run success.
- Multi-shard long-run testing.
- Market/economy scenario seeding beyond basic world setup.
- Combat scenario tuning beyond opponent bot presence.
