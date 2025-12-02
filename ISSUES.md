# ROADMAP Audit Issues

This document contains all 43 issues identified in the repository audit against the ROADMAP.md specification.
Each issue is formatted for easy creation as a GitHub issue.

## Summary Statistics

| Category | Implemented | Partially | Missing |
|----------|-------------|-----------|---------|
| Vision/Objectives | 30% | 20% | 50% |
| Design Principles | 70% | 20% | 10% |
| Architecture Layers | 40% | 20% | 40% |
| Memory/Data Models | 80% | 10% | 10% |
| Pheromone System | 90% | 5% | 5% |
| Colony Lifecycle | 80% | 15% | 5% |
| Economy/Infrastructure | 70% | 15% | 15% |
| Base Blueprints | 70% | 20% | 10% |
| Creep Ecosystem | 80% | 15% | 5% |
| Cluster/Empire | 10% | 10% | 80% |
| Combat/Defense | 70% | 20% | 10% |
| Nukes | 10% | 0% | 90% |
| Power Creeps | 70% | 15% | 15% |
| Market | 0% | 0% | 100% |
| Labs/Boosts | 40% | 20% | 40% |
| Walls/Ramparts | 60% | 20% | 20% |
| CPU Management | 80% | 15% | 5% |
| Pathfinding | 90% | 5% | 5% |
| Logging | 80% | 10% | 10% |
| Tests/Structure | 50% | 20% | 30% |

**Overall Implementation: ~60%**

---

## High Priority Issues (Critical for Basic Function)

### Issue #1: No Remote Mining Implementation

**Severity:** High  
**Category:** Vision & High-Level Objectives  
**Labels:** `enhancement`, `high-priority`

**Description:**
The roadmap specifies "Remote-Mining in neutralen/feindlichen Räumen" (remote mining in neutral/hostile rooms), but the current implementation lacks proper remote mining infrastructure.

**Missing:**
- No remoteHarvester role implementation (only listed in spawn definitions but behavior not implemented)
- No remoteHauler role implementation
- No remote reservation logic
- The remoteWorker utility role exists but doesn't properly mine and transport back

**Recommended Actions:**
- [ ] Implement dedicated remoteHarvester behavior that travels to assigned remote source
- [ ] Implement remoteHauler behavior for transporting energy from remotes
- [ ] Add remote room assignment logic to cluster management

---

### Issue #2: No Expansion/Claim Queue System

**Severity:** High  
**Category:** Vision & High-Level Objectives  
**Labels:** `enhancement`, `high-priority`

**Description:**
While ExpansionCandidate and claimQueue structures exist in memory schemas, there's no actual implementation that evaluates rooms for expansion and populates this queue.

**Missing:**
- Room scoring algorithm based on sources, minerals, distance, terrain
- Automatic claim queue population
- Integration with scout intel
- GCL-based expansion decisions

**Recommended Actions:**
- [ ] Implement expansion scoring in overmind or new expansionManager module
- [ ] Connect scout intel gathering to expansion evaluation
- [ ] Implement claim dispatch based on GCL availability

---

### Issue #6: No Global Meta-Layer (Overmind) Implementation

**Severity:** High  
**Category:** Architecture Layers  
**Labels:** `enhancement`, `high-priority`

**Description:**
Roadmap Section 3.1 specifies a "Global Meta-Layer (Empire / Multi-Shard)" but no active overmind logic runs. Only schema exists.

**Missing:**
- Active overmind loop
- Shard coordination
- War target management
- Expansion decisions
- Power bank tracking activation

**Recommended Actions:**
- [ ] Create empire/empireManager.ts as specified in roadmap
- [ ] Implement periodic overmind tick (every 20-50 ticks)
- [ ] Add war target evaluation
- [ ] Add expansion queue management

---

### Issue #14: No Dedicated Remote Roles

**Severity:** High  
**Category:** Economy & Infrastructure  
**Labels:** `enhancement`, `high-priority`

**Description:**
Roadmap specifies "Remote Miner & Remote Carrier" but these don't exist as proper implementations. Current: remoteWorker utility role does basic harvest-and-return but doesn't properly integrate with remote room management.

**Recommended Actions:**
- [ ] Create remoteHarvester economy role (stationary at remote source)
- [ ] Create remoteCarrier economy role (dedicated transport)
- [ ] Implement remote container placement

---

### Issue #20: No Active Empire/Cluster Logic

**Severity:** High  
**Category:** Cluster & Empire Logic  
**Labels:** `enhancement`, `high-priority`

**Description:**
This is one of the largest gaps. Roadmap Section 11 specifies extensive empire-level coordination that isn't implemented.

**Missing:**
- Squad formation from multiple rooms
- Rally point management
- Terminal resource balancing
- War target coordination
- Nuke candidate management
- Inter-shard portal tracking and usage

**Recommended Actions:**
- [ ] Implement clusters/clusterManager.ts
- [ ] Implement empire/empireManager.ts
- [ ] Add squad system with state machine
- [ ] Add terminal transfer coordination

---

### Issue #21: No Safe Mode Trigger

**Severity:** High  
**Category:** Combat & Defense  
**Labels:** `bug`, `high-priority`

**Description:**
Roadmap mentions "Safe Mode als Notbremse" but no code triggers safe mode when defense fails.

**Recommended Actions:**
- [ ] Add safe mode trigger when:
  - Critical structures under attack and defense inadequate
  - Spawn/Storage about to be destroyed
- [ ] Add cooldown tracking

---

## Medium Priority Issues (Required for Full Feature Set)

### Issue #3: Market Trading Not Implemented

**Severity:** Medium  
**Category:** Vision & High-Level Objectives  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Roadmap Section 15 specifies Market-Integration with trading AI, but no market functionality exists.

**Missing:**
- marketManager.ts module
- Order creation/management
- Buy/sell logic based on resource needs
- War-mode aggressive purchasing

**Recommended Actions:**
- [ ] Create empire/marketManager.ts as specified in roadmap Section 22
- [ ] Implement order scanning and price analysis
- [ ] Add resource surplus/deficit detection
- [ ] Implement terminal transfer logistics

---

### Issue #4: Pheromone Diffusion Not Active in Main Loop

**Severity:** Medium  
**Category:** Design Principles  
**Labels:** `bug`, `medium-priority`

**Description:**
The pheromoneManager.applyDiffusion() method exists but is never called in the main loop. Pheromones should spread to neighboring rooms.

**Location:** `src/logic/pheromone.ts` line 354-394

**Recommended Actions:**
- [ ] Add diffusion call to periodic scheduler task
- [ ] Ensure owned room SwarmStates are passed to diffusion function

---

### Issue #7: No Shard-Strategic Layer

**Severity:** Medium  
**Category:** Architecture Layers  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Roadmap Section 3.2 specifies per-shard strategic coordination with Game.cpu.setShardLimits. No implementation exists.

**Missing:**
- Shard role assignment
- CPU limit distribution across shards
- Shard prioritization logic

**Recommended Actions:**
- [ ] Create shard strategy module
- [ ] Implement setShardLimits based on shard role
- [ ] Add shard health monitoring

---

### Issue #8: No Active Cluster Management

**Severity:** Medium  
**Category:** Architecture Layers  
**Labels:** `enhancement`, `medium-priority`

**Description:**
While ClusterMemory schema exists, there's no active cluster manager that coordinates inter-room logistics, terminal transfers, or military coordination.

**Missing:**
- clusters/clusterManager.ts implementation
- Terminal transfer logic between rooms
- Coordinated military actions
- Cluster metrics aggregation

**Recommended Actions:**
- [ ] Implement cluster manager as specified in roadmap Section 22
- [ ] Add inter-room terminal transfer logic
- [ ] Implement squad coordination across rooms

---

### Issue #9: Source Meta Not Tracked

**Severity:** Medium  
**Category:** Memory & Data Models  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Roadmap Section 4 (Room) specifies "sourceMeta (pro Source Slots, Distanz, Container/Link-IDs)" but this is not implemented.

**Missing:**
- Source slot analysis (walkable tiles around sources)
- Distance to storage/spawn
- Associated container/link IDs
- Optimal harvester count per source

**Recommended Actions:**
- [ ] Add SourceMeta interface to schemas
- [ ] Implement source analysis on room initialization
- [ ] Use source meta for harvester assignment

---

### Issue #11: Nuke Detection Not Wired

**Severity:** Medium  
**Category:** Pheromone System  
**Labels:** `bug`, `medium-priority`

**Description:**
pheromoneManager.onNukeDetected() exists but nothing calls it. Room.nukes should be checked periodically.

**Recommended Actions:**
- [ ] Add nuke detection to room threat assessment
- [ ] Call onNukeDetected when room.find(FIND_NUKES).length > 0

---

### Issue #13: Scout Intel Not Connected to Expansion

**Severity:** Medium  
**Category:** Early-Game Strategy  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Scout records RoomIntel but this data isn't used for expansion decisions.

**Recommended Actions:**
- [ ] Create expansion scoring based on scout intel
- [ ] Prioritize rooms with 2 sources
- [ ] Evaluate mineral types for strategic value

---

### Issue #16: No Extractor Placement in Blueprints

**Severity:** Medium  
**Category:** Base Blueprints  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Blueprints don't include extractor placement, which should be at the mineral location.

**Recommended Actions:**
- [ ] Add separate extractor placement logic (dynamic, based on mineral position)
- [ ] Ensure extractor is placed when RCL reaches 6

---

### Issue #18: No Automatic Layout Planner

**Severity:** Medium  
**Category:** Base Blueprints  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Roadmap mentions "automatische Planner (z.B. Floodfill/Distance Transform)" as future enhancement. Current blueprints are static coordinates.

**Recommended Actions:**
- [ ] Consider implementing dynamic layout planner
- [ ] Add flood-fill based placement for remaining structures

---

### Issue #19: Missing Roles from Roadmap

**Severity:** Medium  
**Category:** Creep Ecosystem  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Several roles specified in roadmap are missing:
- defender (separate from guard)
- rangedDefender
- Squad roles with naming convention (e.g., raidAlpha.*)
- explorer (controller touch specialist)

**Recommended Actions:**
- [ ] Review if guard/ranger cover defender needs
- [ ] Implement squad naming system
- [ ] Add explorer role or merge with scout

---

### Issue #22: No Dynamic Defender Spawning

**Severity:** Medium  
**Category:** Combat & Defense  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Roadmap specifies "Spawns halten immer Slots frei für Sofort-Defender" but spawn logic doesn't reserve slots.

**Recommended Actions:**
- [ ] Add spawn slot reservation during danger > 0
- [ ] Implement emergency spawn queue for defenders

---

### Issue #23: Boost System Not Integrated

**Severity:** Medium  
**Category:** Combat & Defense  
**Labels:** `enhancement`, `medium-priority`

**Description:**
BoostConfig exists in config but no code actually boosts creeps.

**Missing:**
- Lab pre-loading with boost compounds
- Creep boosting before role execution
- Boost decisions based on posture/danger

**Recommended Actions:**
- [ ] Implement boost manager in labs/boostManager.ts
- [ ] Add boost check in creep spawn
- [ ] Route new military creeps through boost labs

---

### Issue #24: No Nuke Management

**Severity:** Medium  
**Category:** Nukes  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Roadmap Section 13 specifies nuke scoring and launching but only nukeCandidates schema exists.

**Missing:**
- Nuke candidate scoring
- Ghodium accumulation
- Nuker resource loading
- Nuke launch decisions
- Coordination with siege timing

**Recommended Actions:**
- [ ] Implement empire/nukeManager.ts as specified
- [ ] Add nuke scoring factors
- [ ] Add nuker energy/ghodium loading logic

---

### Issue #26: No Power Bank Discovery System

**Severity:** Medium  
**Category:** Power Creeps  
**Labels:** `enhancement`, `medium-priority`

**Description:**
powerBanks tracked in overmind but never populated. Scout doesn't detect power banks.

**Recommended Actions:**
- [ ] Add power bank detection in scout intel
- [ ] Add power bank harvesting dispatch
- [ ] Track decay times

---

### Issue #27: No Market Manager

**Severity:** Medium  
**Category:** Market Integration  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Roadmap Section 15 completely unimplemented.

**Recommended Actions:**
- [ ] Create empire/marketManager.ts
- [ ] Implement order creation
- [ ] Implement deal execution
- [ ] Add price tracking
- [ ] Implement eco vs war mode trading strategies

---

### Issue #28: No Chemistry Planner

**Severity:** Medium  
**Category:** Lab & Boost System  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Roadmap specifies reaction chain planning but current lab logic just runs whatever reaction is possible.

**Missing:**
- Target compound configuration
- Reaction chain calculation
- Intermediate product tracking
- Boost stockpile management

**Recommended Actions:**
- [ ] Implement labs/chemistryPlanner.ts
- [ ] Add reaction chain targeting
- [ ] Add compound stockpile thresholds

---

### Issue #29: No Dynamic Repair Targets Based on Danger

**Severity:** Medium  
**Category:** Walls & Ramparts  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Roadmap specifies hit targets per danger level (100k at danger 0, 50M+ at danger 3) but current code uses fixed 100k.

**Location:** `src/roles/behaviors/utility.ts` lines 235-244

**Recommended Actions:**
- [ ] Read danger level from swarm state
- [ ] Adjust repair target based on danger:
  - danger 0: 100k
  - danger 1: 300k
  - danger 2: 5M
  - danger 3: 50M+

---

### Issue #30: Scheduler Tasks Not Registered

**Severity:** Medium  
**Category:** CPU Management & Scheduling  
**Labels:** `bug`, `medium-priority`

**Description:**
Scheduler class exists with registerTask but no tasks are actually registered. Main loop runs subsystems directly without using scheduler.

**Recommended Actions:**
- [ ] Register tasks with scheduler instead of direct calls
- [ ] Use scheduler for pheromone updates, cluster logic, strategic decisions
- [ ] Benefit from automatic bucket-based skipping

---

### Issue #31: No Evacuation Logic

**Severity:** Medium  
**Category:** Resiliency & Respawn  
**Labels:** `enhancement`, `medium-priority`

**Description:**
evacuate posture exists but no logic actually evacuates resources or creeps.

**Recommended Actions:**
- [ ] Implement evacuation behavior when posture is evacuate
- [ ] Move resources to terminal for transfer
- [ ] Despawn non-essential creeps
- [ ] Route valuable creeps to safe rooms

---

### Issue #36: Missing Modules from Roadmap Structure

**Severity:** Medium  
**Category:** Project Structure & Tests  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Roadmap Section 22 specifies exact file structure, several missing:
- clusters/clusterManager.ts - NOT IMPLEMENTED
- empire/empireManager.ts - NOT IMPLEMENTED
- empire/marketManager.ts - NOT IMPLEMENTED
- empire/powerManager.ts - EXISTS (partial in roles/power)
- empire/nukeManager.ts - NOT IMPLEMENTED
- labs/chemistryPlanner.ts - NOT IMPLEMENTED
- labs/boostManager.ts - NOT IMPLEMENTED
- defense/towerLogic.ts - EXISTS (in roomNode)
- defense/wallManager.ts - NOT IMPLEMENTED
- planning/layoutPlanner.ts - NOT IMPLEMENTED
- visuals/roomVisuals.ts - NOT IMPLEMENTED

**Recommended Actions:**
- [ ] Create missing modules as specified
- [ ] Move tower logic to dedicated file
- [ ] Implement cluster manager
- [ ] Implement empire manager

---

### Issue #37: Insufficient Test Coverage

**Severity:** Medium  
**Category:** Project Structure & Tests  
**Labels:** `enhancement`, `medium-priority`

**Description:**
Only 3 test files exist with 9 tests. Major systems lack tests:
- Pheromone system
- Evolution/posture logic
- Spawn prioritization
- Blueprint placement
- Scheduler

**Recommended Actions:**
- [ ] Add unit tests for pheromone calculations
- [ ] Add tests for evolution stage determination
- [ ] Add tests for spawn role selection
- [ ] Add tests for blueprint structure filtering

---

### Issue #41: No Error Recovery in Main Loop

**Severity:** Medium  
**Category:** Production Readiness  
**Labels:** `bug`, `medium-priority`

**Description:**
While ErrorMapper wraps the loop, individual subsystems don't have try-catch. A crash in one room affects all.

**Recommended Actions:**
- [ ] Wrap room node execution in try-catch
- [ ] Continue processing other rooms on error
- [ ] Log errors with room context

---

### Issue #42: No Memory Migration System

**Severity:** Medium  
**Category:** Production Readiness  
**Labels:** `enhancement`, `medium-priority`

**Description:**
version field exists in creep memory but no migration code runs when version changes.

**Recommended Actions:**
- [ ] Implement memory version checking
- [ ] Add migration functions for schema changes

---

## Low Priority Issues (Polish/Optimization)

### Issue #5: CPU Target Budget Not Enforced Per Subsystem

**Severity:** Low  
**Category:** Design Principles  
**Labels:** `enhancement`, `low-priority`

**Description:**
Roadmap specifies "Öko-Raum ≤ 0,1 CPU, Kampf-Raum ≤ 0,25 CPU, globaler Overmind ≤ 1 CPU alle 20–50 Ticks" but current implementation only has general CPU management, not per-subsystem limits.

**Recommended Actions:**
- [ ] Add CPU budgets per subsystem type
- [ ] Implement early-exit when room exceeds budget
- [ ] Add profiler warnings for budget violations

---

### Issue #10: No Lab Configuration in Memory

**Severity:** Low  
**Category:** Memory & Data Models  
**Labels:** `enhancement`, `low-priority`

**Description:**
Roadmap specifies "labConfig, defenseConfig, remoteConfig" in room memory but only missingStructures is implemented.

**Recommended Actions:**
- [ ] Add labConfig with reaction chains
- [ ] Add defenseConfig with rampart hit targets per danger level
- [ ] Add remoteConfig with assigned remote rooms and their status

---

### Issue #12: Stage Requirements Don't Match Roadmap

**Severity:** Low  
**Category:** Colony Lifecycle  
**Labels:** `bug`, `low-priority`

**Description:**
Evolution thresholds don't perfectly match roadmap specifications:
- seedNest should be RCL 1-3, but requires only RCL 1
- foragingExpansion requires remotes but remotes aren't implemented
- matureColony requires terminal at RCL 4 but terminal is RCL 6

**Recommended Actions:**
- [ ] Review and adjust EVOLUTION_STAGES thresholds
- [ ] Remove terminal requirement from matureColony or make it conditional

---

### Issue #15: No Carrier Dimensioning Based on Distance

**Severity:** Low  
**Category:** Economy & Infrastructure  
**Labels:** `enhancement`, `low-priority`

**Description:**
Roadmap mentions "Dimensionierung abhängig von Distanz und Source-Output" but hauler body size doesn't account for distance.

**Recommended Actions:**
- [ ] Calculate path length to sources
- [ ] Scale hauler body based on distance and energy throughput needed

---

### Issue #17: Blueprint Extensions Don't Fill Capacity

**Severity:** Low  
**Category:** Base Blueprints  
**Labels:** `enhancement`, `low-priority`

**Description:**
Blueprints define fewer extensions than RCL allows. E.g., WAR_READY only lists ~20 extensions but RCL 8 allows 60.

**Recommended Actions:**
- [ ] Expand extension arrays in blueprints
- [ ] Or implement dynamic extension placement algorithm

---

### Issue #25: Power Creep Powers Limited

**Severity:** Low  
**Category:** Power Creeps  
**Labels:** `enhancement`, `low-priority`

**Description:**
Not all operator powers are implemented.

**Missing:**
- PWR_SHIELD (mobile protection)
- PWR_REGEN_SOURCE
- PWR_REGEN_MINERAL

**Recommended Actions:**
- [ ] Add additional power usage based on situation
- [ ] Implement shield for siege operations

---

### Issue #32: No Global Path Caching

**Severity:** Low  
**Category:** Pathfinding & Traffic Management  
**Labels:** `enhancement`, `low-priority`

**Description:**
Roadmap specifies "global/raumweise gecachten Pfaden" but no explicit path caching beyond cartographer's internal cache.

**Recommended Actions:**
- [ ] Consider adding explicit path caching for critical routes
- [ ] Cache storage↔source paths
- [ ] Cache storage↔controller paths

---

### Issue #33: No Yield/Priority Rules

**Severity:** Low  
**Category:** Pathfinding & Traffic Management  
**Labels:** `enhancement`, `low-priority`

**Description:**
Roadmap specifies "Yield-Regeln" where low-priority creeps yield to high-priority but no such logic exists.

**Recommended Actions:**
- [ ] Consider adding traffic priority system
- [ ] Defenders should have right-of-way over haulers

---

### Issue #34: No RoomVisual Integration

**Severity:** Low  
**Category:** Logging, Monitoring & Visualization  
**Labels:** `enhancement`, `low-priority`

**Description:**
Roadmap specifies pheromone heatmaps, path visualization, blueprint overlay but none implemented.

**Recommended Actions:**
- [ ] Add visuals/roomVisuals.ts as specified in roadmap
- [ ] Implement pheromone heatmap visualization
- [ ] Add path/traffic lane visualization
- [ ] Add blueprint overlay (planned vs built)

---

### Issue #35: No Memory Segment Stats

**Severity:** Low  
**Category:** Logging, Monitoring & Visualization  
**Labels:** `enhancement`, `low-priority`

**Description:**
Roadmap mentions "Memory-Segments oder externen Endpunkten" for stats but not implemented.

**Recommended Actions:**
- [ ] Implement stats segment for external monitoring
- [ ] Consider Grafana integration

---

### Issue #38: Lint Errors Present

**Severity:** Low  
**Category:** Project Structure & Tests  
**Labels:** `bug`, `low-priority`

**Description:**
14 ESLint errors and 20 warnings exist in codebase.

**Recommended Actions:**
- [ ] Fix lint errors (max-classes-per-file, unnecessary type assertions, bitwise operators)
- [ ] Consider addressing warnings

---

### Issue #39: Room.find Called Multiple Times

**Severity:** Low  
**Category:** Performance  
**Labels:** `enhancement`, `low-priority`

**Description:**
Some room finds are repeated. E.g., FIND_SOURCES called multiple times in different functions.

**Recommended Actions:**
- [ ] Cache room.find results in context
- [ ] Reuse findings within same tick

---

### Issue #40: Blueprint Terrain Check Per Structure

**Severity:** Low  
**Category:** Performance  
**Labels:** `enhancement`, `low-priority`

**Description:**
Blueprint placement calls room.getTerrain() and checks terrain per structure. Could cache.

**Recommended Actions:**
- [ ] Cache terrain lookup
- [ ] Pre-filter invalid positions

---

### Issue #43: Memory Size Not Actively Managed

**Severity:** Low  
**Category:** Production Readiness  
**Labels:** `enhancement`, `low-priority`

**Description:**
isMemoryNearLimit() exists but is never called.

**Recommended Actions:**
- [ ] Check memory size periodically
- [ ] Prune old data when near limit
- [ ] Clear stale room intel

---

## Issue Tracking Status

| Audit # | Title | Severity | Status | GitHub Issue # |
|---------|-------|----------|--------|----------------|
| 1 | No Remote Mining Implementation | High | Created | [#42](https://github.com/ralphschuler/screeps-ant-swarm/issues/42) |
| 2 | No Expansion/Claim Queue System | High | Created | [#43](https://github.com/ralphschuler/screeps-ant-swarm/issues/43) |
| 3 | Market Trading Not Implemented | Medium | Created | [#47](https://github.com/ralphschuler/screeps-ant-swarm/issues/47) |
| 4 | Pheromone Diffusion Not Active | Medium | Created | [#48](https://github.com/ralphschuler/screeps-ant-swarm/issues/48) |
| 5 | CPU Budget Not Per Subsystem | Low | Pending | - |
| 6 | No Overmind Implementation | High | Created | [#44](https://github.com/ralphschuler/screeps-ant-swarm/issues/44) |
| 7 | No Shard-Strategic Layer | Medium | Created | [#49](https://github.com/ralphschuler/screeps-ant-swarm/issues/49) |
| 8 | No Active Cluster Management | Medium | Created | [#50](https://github.com/ralphschuler/screeps-ant-swarm/issues/50) |
| 9 | Source Meta Not Tracked | Medium | Pending | - |
| 10 | No Lab Configuration in Memory | Low | Pending | - |
| 11 | Nuke Detection Not Wired | Medium | Pending | - |
| 12 | Stage Requirements Mismatch | Low | Pending | - |
| 13 | Scout Intel Not Connected | Medium | Pending | - |
| 14 | No Dedicated Remote Roles | High | Created | [#45](https://github.com/ralphschuler/screeps-ant-swarm/issues/45) |
| 15 | No Carrier Distance Scaling | Low | Pending | - |
| 16 | No Extractor in Blueprints | Medium | Pending | - |
| 17 | Extensions Don't Fill Capacity | Low | Pending | - |
| 18 | No Automatic Layout Planner | Medium | Pending | - |
| 19 | Missing Roles from Roadmap | Medium | Pending | - |
| 20 | No Active Empire/Cluster Logic | High | Created | [#46](https://github.com/ralphschuler/screeps-ant-swarm/issues/46) |
| 21 | No Safe Mode Trigger | High | Pending | - |
| 22 | No Dynamic Defender Spawning | Medium | Pending | - |
| 23 | Boost System Not Integrated | Medium | Pending | - |
| 24 | No Nuke Management | Medium | Pending | - |
| 25 | Power Creep Powers Limited | Low | Pending | - |
| 26 | No Power Bank Discovery | Medium | Pending | - |
| 27 | No Market Manager | Medium | Pending | - |
| 28 | No Chemistry Planner | Medium | Pending | - |
| 29 | No Dynamic Repair Targets | Medium | Pending | - |
| 30 | Scheduler Tasks Not Registered | Medium | Pending | - |
| 31 | No Evacuation Logic | Medium | Pending | - |
| 32 | No Global Path Caching | Low | Pending | - |
| 33 | No Yield/Priority Rules | Low | Pending | - |
| 34 | No RoomVisual Integration | Low | Pending | - |
| 35 | No Memory Segment Stats | Low | Pending | - |
| 36 | Missing Modules from Roadmap | Medium | Pending | - |
| 37 | Insufficient Test Coverage | Medium | Pending | - |
| 38 | Lint Errors Present | Low | Pending | - |
| 39 | Room.find Called Multiple Times | Low | Pending | - |
| 40 | Blueprint Terrain Check Cache | Low | Pending | - |
| 41 | No Error Recovery in Main Loop | Medium | Pending | - |
| 42 | No Memory Migration System | Medium | Pending | - |
| 43 | Memory Size Not Managed | Low | Pending | - |

---

## Priority Recommendations

### High Priority (Critical for Basic Function)
1. Issue #1: Remote Mining Implementation
2. Issue #2: Expansion Queue System  
3. Issue #6: Global Meta-Layer (Overmind)
4. Issue #14: Remote Harvester/Carrier Roles
5. Issue #20: Active Empire/Cluster Logic
6. Issue #21: Safe Mode Trigger

### Medium Priority (Required for Full Feature Set)
1. Issue #3: Market Trading
2. Issue #4: Pheromone Diffusion
3. Issue #7: Shard Strategic Layer
4. Issue #8: Active Cluster Management
5. Issue #24: Nuke Management
6. Issue #27: Market Manager
7. Issue #28: Chemistry Planner
8. Issue #30: Scheduler Task Registration

### Low Priority (Polish/Optimization)
1. Issue #34: RoomVisual Integration
2. Issue #32: Global Path Caching
3. Issue #37: Test Coverage
4. Issue #38: Lint Errors
