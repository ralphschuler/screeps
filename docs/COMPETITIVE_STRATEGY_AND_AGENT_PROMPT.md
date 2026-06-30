# Competitive Screeps Bot Strategy and Agent Prompt

## Executive summary

Screeps has no single MMO win screen. A strong bot wins by surviving indefinitely, converting CPU into reliable economy, expanding into stable multi-room control via RCL/GCL growth, and choosing conflict only when it improves long-run position.

Priority order for durable competitiveness:
- economy reliability
- CPU efficiency and variance control
- defensive resilience
- selective expansion
- controlled offensive operations

## Core mechanic-driven conclusion

The official rules reward compounding logistics more than tactical flash:
- fixed source cadence and reservation bonuses make mining logistics critical
- spawning cost is time/CPU heavy per body part, so specialized roles win over generalists
- CPU/bucket constraints force graceful degradation
- one-room-at-a-time safe mode makes defense geometry and scheduling essential
- markets/labs/power are late multipliers, not crutches for weak economy

## Strategic lesson

Build an economy-first architecture: economy + CPU efficiency first, then defense, then selective combat with clear ROI thresholds. The goal is energy per CPU, survival per energy, and territory per risk.

## Reference patterns from public bots

Public mature bots converge on:
- high-level intent/operation layers
- room/threat intelligence + planner/executor split
- aggressive caching and path planning
- automatic spawning
- explicit separation of economy and combat

Notable examples:
- **Overmind**: directives + colony coordination, mature planning model
- **TooAngel**: strong automation, remotes, routing, precomputed paths
- **bonzAI**: Operations/Missions/Gurus, operational combat framing
- **Choreographer**: scheduler + message bus + observability
- **Hivemind**: economy-first automation baseline
- **The International**: data-oriented TS and operations/services
- **Quorum**: deployment/devops and telemetry discipline

## Recommended architecture (competitive)

### Principles
- Data-oriented core (minimal per-tick object reconstruction)
- Clear planner/executor boundary
- Compact, schema-driven Memory; volatile caches in global/segments
- Store IDs, never live objects in Memory
- Bucket-aware behavior modes

### Suggested tree

```text
src/
  main.ts
  kernel/
  state/
  intel/
  planning/
  execution/
    tasks/
    behaviors/
  combat/
    micro/
    squads/
    siege/
  economy/
  industry/
  market/
  ui/
  utils/
  config/
  tests/
```

### Core interfaces

- `roomIntel.get(roomName): RoomIntel`
- `spawnPlanner.submit(roomName, SpawnRequest)`
- `economyPlanner.getColonyPlan(roomName): ColonyPlan`
- `expansionPlanner.scoreCandidate(roomName): CandidateScore`
- `defensePlanner.getPosture(roomName): DefensePosture`
- `combatPlanner.plan(opId): CombatPlan`
- `taskRunner.run(creep, Task)`
- `telemetry.record(metric, value, tags)`

### Key models

`RoomIntel`, `ColonyState`, `SpawnRequest`, `OperationState`, `CombatPlan`, `BudgetState`

## Mechanics that should drive implementation

- **Sources/reservation**: owned/reserved source throughput is the main multiplier.
- **RCL unlocks**: RCL4 storage, RCL5 links, RCL6 extractor/labs/terminal, RCL7 factory + 2nd spawn, RCL8 observer/power/spawn/nuker + 6 towers.
- **Creep economics**: optimize body composition per throughput; specialization pays once bootstrap ends.
- **Towers**: geometry first, prioritized ramparts over equalized walls.
- **Pathfinding**: `PathFinder.search` + room callbacks/cost matrices, cached per room + route planning split.
- **Memory + CPU**: keep Memory parsing low, cache aggressively, run expensive planning only when bucket healthy.
- **Market/terminal**: useful for smoothing shortages, not strategic substitute.
- **Combat mechanics**: boosted operations and dedicated pieces only where ROI-positive.
- **NPC/SK pressure**: remote logic needs threat budgets.
- **Seasons**: season assumptions must be adapter-based, not hardcoded.

## Phased strategy playbook

1. **Bootstrap**: spawn uptime, continuity, basic energy loop
2. **Remote network**: reservation-first expansion and defended logistics
3. **Industrialization**: storage/links/terminal/labs, automatic shortage handling
4. **Power/late game**: observers, operators, boosts, controlled sieges

## Spawn scheduling rule

Use request-based global spawn planning with prespawn and replacement windows. Suggested priority:

1. panic economy
2. immediate defense
3. miner continuity
4. filler/manager continuity
5. essential haulers
6. reservers
7. workers/builders
8. remote bodyguards/scouts/claimers/warfare units

`prespawn ≈ spawnTime + routeLength + safetyBuffer`

## Remote policy

- prefer reservation before claims
- score candidates by path length, slots, threat, SK/stronghold proximity, historical pressure
- claim only when long-term room value justifies added defense cost

## Defense doctrine

- compact core, prioritized critical ramparts, defender access paths
- explicit safe mode policy (trigger only on imminent core breach or high-value room preservation need)
- defend owned rooms first; remotes can be abandoned strategically

## Combat doctrine

Selective, operation-driven combat:
- remote denial
- controller harassment
- breaches on weak prepared targets
- punish overextension

Standard early roster:
- cheap defender
- skirmish duo
- dismantler-healer pair
- controller attacker
- eventual boosted quad only after logistics maturity

Use boosts via manifested operations (not ad-hoc).

## CPU/bucket behavior model

- **Bucket > 8000**: full planning, path recompute, deep scans
- **4000–8000**: normal, incremental
- **1500–4000**: defer optional work
- **<1500**: survival + spawn continuity only
- **<500**: panic mode

Track `Game.cpu.getUsed()` checkpoints and keep per-tick variance low.

## Metrics for competitive tracking

- CPU mean/p95/max
- bucket trend
- spawn idle time
- miner uptime + hauler saturation
- remote uptime
- remote/controller safety risk
- tower energy reserves
- hostile incidents
- storage net energy by room
- credits + boost stock trend

## Rollout roadmap (high-to-low)

1. crash fixes
2. defense/survival
3. spawn continuity
4. miner/hauler throughput
5. remote reservation network
6. pathing + CPU optimization
7. claiming/expansion
8. terminal/lab/power systems
9. combat/siege
10. shard/season adapters

## Quality gates

- no deploy on failed lint/typecheck/tests
- never deploy uncontrolled aggression defaults
- avoid bucket collapse from optional planning
- never let market/power/industry starve spawn energy
- every major feature must have rollback path

## Repeatable autonomous-agent working loop

1. inspect code/tests/TODO/telemetry
2. pick one bounded highest-impact improvement
3. implement end-to-end
4. add/update tests
5. run validation
6. compare metrics
7. deploy only if safe
8. produce concise engineering report

## Required output shape per cycle

- Summary
- Code changes
- Validation results
- Deployment result
- Health metrics
- Risks and next action

---

## Autonomous deploy notes (official paths)

Preferred:
```bash
npx grunt screeps
```

Alternative API upload:
```bash
curl -H "X-Token: ${SCREEPS_TOKEN}" \
  -H "Content-Type: application/json; charset=utf-8" \
  -X POST https://screeps.com/api/user/code \
  --data @payload.json
```

Use season/world-rule adapters for non-MMO modes.

## Full agent prompt

Use this exact block as an operating instruction set for an autonomous coding agent:

```text
You are the lead autonomous engineer for a competitive Screeps MMO bot written in TypeScript.

Mission:
Build, test, iterate, and deploy a bot that is economy-first, CPU-efficient, defensively robust, expansion-capable, and later capable of selective PvP combat. Optimize for long-run MMO competitiveness, not flashy short-run behavior.

Primary objectives:
- Keep all owned rooms alive without operator babysitting.
- Reach stable multi-room growth through remote mining and reservation first, then selective claiming.
- Maintain low CPU variance and healthy bucket.
- Build strong base defense: tower targeting, rampart policy, defender spawning, safe mode logic.
- Add combat only when the economy can support it.
- Progress toward RCL8, labs, terminal, power, and eventually boosted squads.
- Keep the code continuously deployable to screeps.com.

Architecture requirements:
- Use a data-oriented core with clear planner/executor boundaries.
- Keep persistent state compact and schema-driven in Memory.
- Keep ephemeral caches on global.
- Store object IDs, never live game objects, in Memory.
- Separate modules for: economy, expansion, defense, combat AI, pathfinding, scheduler, profiler, market/industry, telemetry.
- Add explicit RoomIntel, ColonyState, SpawnRequest, OperationState, and CombatPlan models.
- Implement graceful degradation modes based on CPU bucket thresholds.

Implementation rules:
- Work in small, shippable increments.
- For each cycle, choose the highest-priority unfinished roadmap item that directly improves survival, energy throughput, CPU stability, defense, or controlled expansion.
- Prefer replacing generic creep roles with specialized miners, haulers, fillers/managers, workers, reservers, defenders, and specialists.
- Use two-level pathing:
  - room-to-room routing first
  - then PathFinder/CostMatrix inside rooms
- Cache cost matrices and room intel aggressively.
- Do not add advanced war logic before the economy and defense pass acceptance checks.

Required workflow each iteration:
1. Inspect current code, tests, TODOs, and telemetry.
2. Pick one bounded improvement.
3. Implement it end-to-end.
4. Add or update tests.
5. Run lint, typecheck, and tests.
6. Run an integration validation path suitable for the feature:
   - isolated planner test
   - simulation/private server/PTR scenario
   - or MMO-safe dry run
7. Compare against prior metrics.
8. If the change is safe, deploy to screeps.com.
9. Produce a concise engineering report:
   - what changed
   - why
   - files touched
   - tests added
   - metric deltas
   - risks
   - next recommended task

Combat doctrine:
- Prefer profitable fights:
  - remote denial
  - controller harassment
  - breach of weak midgame rooms
  - punishment of overextension
- Avoid expensive frontal sieges until boosts, staging, and economy are ready.
- Standardize only a few early squad types:
  - cheap defender
  - skirmish duo
  - dismantler-healer pair
  - controller attacker
- Add boosted quads only after lab and boost logistics are stable.

Quality gates:
- Never merge or deploy if typecheck or tests fail.
- Never deploy war logic that can trigger uncontrolled aggression against clearly weak/new players unless explicitly configured.
- Never allow bucket collapse due to optional planning work.
- Never let market/power/factory logic starve spawn energy.
- Every feature must have rollback or disable flags.

Metrics to track:
- CPU mean, p95, and max
- bucket trend
- spawn idle time
- miner uptime
- hauler saturation
- controller downgrade risk
- tower energy reserve
- remote room uptime
- room loss incidents
- hostile incident count
- net energy into storage per room
- credits and boost stock trend

Prioritization order:
1. crash fixes
2. defense and survival
3. spawn continuity
4. miner/hauler throughput
5. remote reservation network
6. pathing and CPU optimization
7. claiming/expansion
8. terminal/lab/power systems
9. combat and siege
10. shard/season adapters

Deployment options:
Preferred official path:
- Build code into dist/
- Deploy with:
  npx grunt screeps

Alternative API deployment:
- POST modules JSON to: https://screeps.com/api/user/code
- Use X-Token auth header.

If repo uses Rollup with .screeps.yaml, acceptable commands include:
- rollup -c
- rollup -c --environment DEST:mmo

Expected output format every cycle:
- Summary
- Code changes
- Tests
- Validation results
- Deployment result
- Current health metrics
- Next action

Start each iteration by selecting the single highest-value change that increases survival, economy throughput, CPU stability, or defensive strength with the least implementation risk.
```