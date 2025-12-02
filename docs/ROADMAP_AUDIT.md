# ROADMAP Audit Report

This document provides a comprehensive audit of the screeps-ant-swarm repository against the ROADMAP.md specification. Each finding should be converted into a GitHub issue for tracking.

---

## 1. Vision & High-Level Objectives

### ✅ Implemented
- Basic swarm architecture with pheromone system
- Multi-room support via clusters
- CPU bucket management

### ❌ Gaps / Issues

#### Issue #1: No Remote Mining Implementation
**Severity: High**
**Description:** The roadmap specifies "Remote-Mining in neutralen/feindlichen Räumen" (remote mining in neutral/hostile rooms), but the current implementation lacks proper remote mining infrastructure.
**Missing:**
- No `remoteHarvester` role implementation (only listed in spawn definitions but behavior not implemented)
- No `remoteHauler` role implementation
- No remote reservation logic
- The `remoteWorker` utility role exists but doesn't properly mine and transport back

**Recommended Actions:**
- Implement dedicated `remoteHarvester` behavior that travels to assigned remote source
- Implement `remoteHauler` behavior for transporting energy from remotes
- Add remote room assignment logic to cluster management

#### Issue #2: No Expansion/Claim Queue System
**Severity: High**
**Description:** While `ExpansionCandidate` and `claimQueue` structures exist in memory schemas, there's no actual implementation that evaluates rooms for expansion and populates this queue.
**Missing:**
- Room scoring algorithm based on sources, minerals, distance, terrain
- Automatic claim queue population
- Integration with scout intel
- GCL-based expansion decisions

**Recommended Actions:**
- Implement expansion scoring in `overmind` or new `expansionManager` module
- Connect scout intel gathering to expansion evaluation
- Implement claim dispatch based on GCL availability

#### Issue #3: Market Trading Not Implemented
**Severity: Medium**
**Description:** Roadmap Section 15 specifies Market-Integration with trading AI, but no market functionality exists.
**Missing:**
- `marketManager.ts` module
- Order creation/management
- Buy/sell logic based on resource needs
- War-mode aggressive purchasing

**Recommended Actions:**
- Create `empire/marketManager.ts` as specified in roadmap Section 22
- Implement order scanning and price analysis
- Add resource surplus/deficit detection
- Implement terminal transfer logistics

---

## 2. Design Principles (Resource Efficiency)

### ✅ Implemented
- Dezentralität (decentralization): Each room has own SwarmState in memory
- Stigmergische Kommunikation: Pheromone system implemented in `logic/pheromone.ts`
- CPU bucket management with different modes
- Scheduler with frequency-based task execution

### ❌ Gaps / Issues

#### Issue #4: Pheromone Diffusion Not Active in Main Loop
**Severity: Medium**
**Description:** The `pheromoneManager.applyDiffusion()` method exists but is never called in the main loop. Pheromones should spread to neighboring rooms.
**Location:** `src/logic/pheromone.ts` line 354-394

**Recommended Actions:**
- Add diffusion call to periodic scheduler task
- Ensure owned room SwarmStates are passed to diffusion function

#### Issue #5: CPU Target Budget Not Enforced Per Subsystem
**Severity: Low**
**Description:** Roadmap specifies "Öko-Raum ≤ 0,1 CPU, Kampf-Raum ≤ 0,25 CPU, globaler Overmind ≤ 1 CPU alle 20–50 Ticks" but current implementation only has general CPU management, not per-subsystem limits.

**Recommended Actions:**
- Add CPU budgets per subsystem type
- Implement early-exit when room exceeds budget
- Add profiler warnings for budget violations

---

## 3. Architecture Layers

### ✅ Implemented
- Raum-Ebene (Room level): `RoomNode` class manages individual rooms
- Creep-/Squad-Ebene: Role behaviors implemented
- Basic cluster structure in schemas

### ❌ Gaps / Issues

#### Issue #6: No Global Meta-Layer (Overmind) Implementation
**Severity: High**
**Description:** Roadmap Section 3.1 specifies a "Global Meta-Layer (Empire / Multi-Shard)" but no active overmind logic runs. Only schema exists.
**Missing:**
- Active overmind loop
- Shard coordination
- War target management
- Expansion decisions
- Power bank tracking activation

**Recommended Actions:**
- Create `empire/empireManager.ts` as specified in roadmap
- Implement periodic overmind tick (every 20-50 ticks)
- Add war target evaluation
- Add expansion queue management

#### Issue #7: No Shard-Strategic Layer
**Severity: Medium**
**Description:** Roadmap Section 3.2 specifies per-shard strategic coordination with `Game.cpu.setShardLimits`. No implementation exists.
**Missing:**
- Shard role assignment
- CPU limit distribution across shards
- Shard prioritization logic

**Recommended Actions:**
- Create shard strategy module
- Implement `setShardLimits` based on shard role
- Add shard health monitoring

#### Issue #8: No Active Cluster Management
**Severity: Medium**
**Description:** While `ClusterMemory` schema exists, there's no active cluster manager that coordinates inter-room logistics, terminal transfers, or military coordination.
**Missing:**
- `clusters/clusterManager.ts` implementation
- Terminal transfer logic between rooms
- Coordinated military actions
- Cluster metrics aggregation

**Recommended Actions:**
- Implement cluster manager as specified in roadmap Section 22
- Add inter-room terminal transfer logic
- Implement squad coordination across rooms

---

## 4. Memory & Data Models

### ✅ Implemented
- `OvermindMemory`, `ClusterMemory`, `SwarmState` schemas
- `InterShardMemorySchema` with serialization
- Room intel structures
- Creep memory schemas

### ❌ Gaps / Issues

#### Issue #9: Source Meta Not Tracked
**Severity: Medium**
**Description:** Roadmap Section 4 (Room) specifies "sourceMeta (pro Source Slots, Distanz, Container/Link-IDs)" but this is not implemented.
**Missing:**
- Source slot analysis (walkable tiles around sources)
- Distance to storage/spawn
- Associated container/link IDs
- Optimal harvester count per source

**Recommended Actions:**
- Add `SourceMeta` interface to schemas
- Implement source analysis on room initialization
- Use source meta for harvester assignment

#### Issue #10: No Lab Configuration in Memory
**Severity: Low**
**Description:** Roadmap specifies "labConfig, defenseConfig, remoteConfig" in room memory but only `missingStructures` is implemented.

**Recommended Actions:**
- Add `labConfig` with reaction chains
- Add `defenseConfig` with rampart hit targets per danger level
- Add `remoteConfig` with assigned remote rooms and their status

---

## 5. Pheromone System

### ✅ Implemented
- All pheromone types (expand, harvest, build, upgrade, defense, war, siege, logistics, nukeTarget)
- Decay factors configurable
- Event-driven updates (hostileDetected, structureDestroyed, nukeDetected)
- Rolling averages for metrics

### ❌ Gaps / Issues

#### Issue #11: Nuke Detection Not Wired
**Severity: Medium**
**Description:** `pheromoneManager.onNukeDetected()` exists but nothing calls it. Room.nukes should be checked periodically.

**Recommended Actions:**
- Add nuke detection to room threat assessment
- Call `onNukeDetected` when `room.find(FIND_NUKES).length > 0`

---

## 6. Colony Lifecycle (Phases)

### ✅ Implemented
- Evolution stages defined: seedNest, foragingExpansion, matureColony, fortifiedHive, empireDominance
- Stage transitions based on RCL and structure counts
- Missing structures tracking

### ❌ Gaps / Issues

#### Issue #12: Stage Requirements Don't Match Roadmap
**Severity: Low**
**Description:** Evolution thresholds don't perfectly match roadmap specifications:
- `seedNest` should be RCL 1-3, but requires only RCL 1
- `foragingExpansion` requires remotes but remotes aren't implemented
- `matureColony` requires terminal at RCL 4 but terminal is RCL 6

**Recommended Actions:**
- Review and adjust `EVOLUTION_STAGES` thresholds
- Remove terminal requirement from matureColony or make it conditional

---

## 7. Early-Game Strategy - Scout & Static Mining

### ✅ Implemented
- Scout role exists with exploration behavior
- Static harvester role that stays at source
- Container-based mining possible

### ❌ Gaps / Issues

#### Issue #13: Scout Intel Not Connected to Expansion
**Severity: Medium**
**Description:** Scout records `RoomIntel` but this data isn't used for expansion decisions.

**Recommended Actions:**
- Create expansion scoring based on scout intel
- Prioritize rooms with 2 sources
- Evaluate mineral types for strategic value

---

## 8. Economy & Infrastructure

### ✅ Implemented
- All core economy roles: larvaWorker, harvester, hauler, upgrader, builder, queenCarrier
- mineralHarvester, labTech, factoryWorker roles
- Link transfer logic in roomNode

### ❌ Gaps / Issues

#### Issue #14: No Dedicated Remote Roles
**Severity: High**
**Description:** Roadmap specifies "Remote Miner & Remote Carrier" but these don't exist as proper implementations.
**Current:** `remoteWorker` utility role does basic harvest-and-return but doesn't properly integrate with remote room management.

**Recommended Actions:**
- Create `remoteHarvester` economy role (stationary at remote source)
- Create `remoteCarrier` economy role (dedicated transport)
- Implement remote container placement

#### Issue #15: No Carrier Dimensioning Based on Distance
**Severity: Low**
**Description:** Roadmap mentions "Dimensionierung abhängig von Distanz und Source-Output" but hauler body size doesn't account for distance.

**Recommended Actions:**
- Calculate path length to sources
- Scale hauler body based on distance and energy throughput needed

---

## 9. Base Blueprints

### ✅ Implemented
- Four blueprint tiers: EARLY_COLONY, CORE_COLONY, ECONOMIC_MATURITY, WAR_READY
- Structure placement relative to anchor
- RCL-based structure limit enforcement
- Construction site placement logic

### ❌ Gaps / Issues

#### Issue #16: No Extractor Placement in Blueprints
**Severity: Medium**
**Description:** Blueprints don't include extractor placement, which should be at the mineral location.

**Recommended Actions:**
- Add separate extractor placement logic (dynamic, based on mineral position)
- Ensure extractor is placed when RCL reaches 6

#### Issue #17: Blueprint Extensions Don't Fill Capacity
**Severity: Low**
**Description:** Blueprints define fewer extensions than RCL allows. E.g., WAR_READY only lists ~20 extensions but RCL 8 allows 60.

**Recommended Actions:**
- Expand extension arrays in blueprints
- Or implement dynamic extension placement algorithm

#### Issue #18: No Automatic Layout Planner
**Severity: Medium**
**Description:** Roadmap mentions "automatische Planner (z.B. Floodfill/Distance Transform)" as future enhancement. Current blueprints are static coordinates.

**Recommended Actions:**
- Consider implementing dynamic layout planner
- Add flood-fill based placement for remaining structures

---

## 10. Creep Ecosystem

### ✅ Implemented
- Economy roles: larvaWorker, harvester, hauler, builder, upgrader, queenCarrier, mineralHarvester, labTech, factoryWorker
- Military roles: guard, healer, soldier, siegeUnit, harasser, ranger
- Utility roles: scout, claimer, engineer, remoteWorker, linkManager, terminalManager
- Power roles: powerHarvester, powerCarrier (creeps), powerQueen, powerWarrior (PowerCreeps)

### ❌ Gaps / Issues

#### Issue #19: Missing Roles from Roadmap
**Severity: Medium**
**Description:** Several roles specified in roadmap are missing:
- `defender` (separate from guard)
- `rangedDefender`
- Squad roles with naming convention (e.g., `raidAlpha.*`)
- `explorer` (controller touch specialist)

**Recommended Actions:**
- Review if guard/ranger cover defender needs
- Implement squad naming system
- Add explorer role or merge with scout

---

## 11. Cluster & Empire Logic

### ❌ Major Gap

#### Issue #20: No Active Empire/Cluster Logic
**Severity: High**
**Description:** This is one of the largest gaps. Roadmap Section 11 specifies extensive empire-level coordination that isn't implemented:
**Missing:**
- Squad formation from multiple rooms
- Rally point management
- Terminal resource balancing
- War target coordination
- Nuke candidate management
- Inter-shard portal tracking and usage

**Recommended Actions:**
- Implement `clusters/clusterManager.ts`
- Implement `empire/empireManager.ts`
- Add squad system with state machine
- Add terminal transfer coordination

---

## 12. Combat & Defense

### ✅ Implemented
- Tower attack/heal/repair logic
- Hostile priority targeting (healers > ranged > melee)
- Danger level calculation (0-3)
- Posture system (eco, defensive, war, siege, evacuate, nukePrep)
- Military role behaviors

### ❌ Gaps / Issues

#### Issue #21: No Safe Mode Trigger
**Severity: High**
**Description:** Roadmap mentions "Safe Mode als Notbremse" but no code triggers safe mode when defense fails.

**Recommended Actions:**
- Add safe mode trigger when:
  - Critical structures under attack and defense inadequate
  - Spawn/Storage about to be destroyed
- Add cooldown tracking

#### Issue #22: No Dynamic Defender Spawning
**Severity: Medium**
**Description:** Roadmap specifies "Spawns halten immer Slots frei für Sofort-Defender" but spawn logic doesn't reserve slots.

**Recommended Actions:**
- Add spawn slot reservation during danger > 0
- Implement emergency spawn queue for defenders

#### Issue #23: Boost System Not Integrated
**Severity: Medium**
**Description:** `BoostConfig` exists in config but no code actually boosts creeps.
**Missing:**
- Lab pre-loading with boost compounds
- Creep boosting before role execution
- Boost decisions based on posture/danger

**Recommended Actions:**
- Implement boost manager in `labs/boostManager.ts`
- Add boost check in creep spawn
- Route new military creeps through boost labs

---

## 13. Nukes

### ❌ Not Implemented

#### Issue #24: No Nuke Management
**Severity: Medium**
**Description:** Roadmap Section 13 specifies nuke scoring and launching but only `nukeCandidates` schema exists.
**Missing:**
- Nuke candidate scoring
- Ghodium accumulation
- Nuker resource loading
- Nuke launch decisions
- Coordination with siege timing

**Recommended Actions:**
- Implement `empire/nukeManager.ts` as specified
- Add nuke scoring factors
- Add nuker energy/ghodium loading logic

---

## 14. Power Creeps

### ✅ Implemented
- Power Creep context and behaviors
- PowerQueen (economy operator) with multiple powers
- PowerWarrior (combat support)
- Power bank harvesting roles

### ❌ Gaps / Issues

#### Issue #25: Power Creep Powers Limited
**Severity: Low**
**Description:** Not all operator powers are implemented. Missing:
- PWR_SHIELD (mobile protection)
- PWR_REGEN_SOURCE
- PWR_REGEN_MINERAL

**Recommended Actions:**
- Add additional power usage based on situation
- Implement shield for siege operations

#### Issue #26: No Power Bank Discovery System
**Severity: Medium**
**Description:** `powerBanks` tracked in overmind but never populated. Scout doesn't detect power banks.

**Recommended Actions:**
- Add power bank detection in scout intel
- Add power bank harvesting dispatch
- Track decay times

---

## 15. Market Integration

### ❌ Not Implemented

#### Issue #27: No Market Manager
**Severity: Medium**
**Description:** Roadmap Section 15 completely unimplemented.

**Recommended Actions:**
- Create `empire/marketManager.ts`
- Implement order creation
- Implement deal execution
- Add price tracking
- Implement eco vs war mode trading strategies

---

## 16. Lab & Boost System

### ✅ Partially Implemented
- Basic lab reaction logic in roomNode
- labTech role for resource movement
- Lab config in config module

### ❌ Gaps / Issues

#### Issue #28: No Chemistry Planner
**Severity: Medium**
**Description:** Roadmap specifies reaction chain planning but current lab logic just runs whatever reaction is possible.
**Missing:**
- Target compound configuration
- Reaction chain calculation
- Intermediate product tracking
- Boost stockpile management

**Recommended Actions:**
- Implement `labs/chemistryPlanner.ts`
- Add reaction chain targeting
- Add compound stockpile thresholds

---

## 17. Walls & Ramparts

### ✅ Implemented
- Engineer role repairs ramparts/walls
- Rampart placement in blueprints
- Basic repair targeting

### ❌ Gaps / Issues

#### Issue #29: No Dynamic Repair Targets Based on Danger
**Severity: Medium**
**Description:** Roadmap specifies hit targets per danger level (100k at danger 0, 50M+ at danger 3) but current code uses fixed 100k.
**Location:** `src/roles/behaviors/utility.ts` lines 235-244

**Recommended Actions:**
- Read danger level from swarm state
- Adjust repair target based on danger:
  - danger 0: 100k
  - danger 1: 300k
  - danger 2: 5M
  - danger 3: 50M+

---

## 18. CPU Management & Scheduling

### ✅ Implemented
- Scheduler with high/medium/low frequency tasks
- Bucket modes (low/normal/high)
- Per-room CPU profiling
- Creep priority-based execution

### ❌ Gaps / Issues

#### Issue #30: Scheduler Tasks Not Registered
**Severity: Medium**
**Description:** `Scheduler` class exists with `registerTask` but no tasks are actually registered. Main loop runs subsystems directly without using scheduler.

**Recommended Actions:**
- Register tasks with scheduler instead of direct calls
- Use scheduler for pheromone updates, cluster logic, strategic decisions
- Benefit from automatic bucket-based skipping

---

## 19. Resiliency & Respawn

### ✅ Implemented
- InterShard memory schema with recovery plan structure
- Multiple room support

### ❌ Gaps / Issues

#### Issue #31: No Evacuation Logic
**Severity: Medium**
**Description:** `evacuate` posture exists but no logic actually evacuates resources or creeps.

**Recommended Actions:**
- Implement evacuation behavior when posture is evacuate
- Move resources to terminal for transfer
- Despawn non-essential creeps
- Route valuable creeps to safe rooms

---

## 20. Pathfinding & Traffic Management

### ✅ Implemented
- Cartographer library integration
- `moveCreep`, `moveToRoom`, `fleeFrom` utilities
- preTick and reconcileTraffic calls

### ❌ Gaps / Issues

#### Issue #32: No Global Path Caching
**Severity: Low**
**Description:** Roadmap specifies "global/raumweise gecachten Pfaden" but no explicit path caching beyond cartographer's internal cache.

**Recommended Actions:**
- Consider adding explicit path caching for critical routes
- Cache storage↔source paths
- Cache storage↔controller paths

#### Issue #33: No Yield/Priority Rules
**Severity: Low**
**Description:** Roadmap specifies "Yield-Regeln" where low-priority creeps yield to high-priority but no such logic exists.

**Recommended Actions:**
- Consider adding traffic priority system
- Defenders should have right-of-way over haulers

---

## 21. Logging, Monitoring & Visualization

### ✅ Implemented
- Logger with levels (debug/info/warn/error)
- Scoped logger creation
- Profiler with CPU tracking

### ❌ Gaps / Issues

#### Issue #34: No RoomVisual Integration
**Severity: Low**
**Description:** Roadmap specifies pheromone heatmaps, path visualization, blueprint overlay but none implemented.

**Recommended Actions:**
- Add `visuals/roomVisuals.ts` as specified in roadmap
- Implement pheromone heatmap visualization
- Add path/traffic lane visualization
- Add blueprint overlay (planned vs built)

#### Issue #35: No Memory Segment Stats
**Severity: Low**
**Description:** Roadmap mentions "Memory-Segments oder externen Endpunkten" for stats but not implemented.

**Recommended Actions:**
- Implement stats segment for external monitoring
- Consider Grafana integration

---

## 22. Project Structure & Tests

### ✅ Implemented
- TypeScript structure similar to roadmap
- Core, memory, roles, utils, logic, config directories
- Mocha test infrastructure
- ESLint configuration

### ❌ Gaps / Issues

#### Issue #36: Missing Modules from Roadmap Structure
**Severity: Medium**
**Description:** Roadmap Section 22 specifies exact file structure, several missing:
- `clusters/clusterManager.ts` - NOT IMPLEMENTED
- `empire/empireManager.ts` - NOT IMPLEMENTED
- `empire/marketManager.ts` - NOT IMPLEMENTED
- `empire/powerManager.ts` - EXISTS (partial in roles/power)
- `empire/nukeManager.ts` - NOT IMPLEMENTED
- `labs/chemistryPlanner.ts` - NOT IMPLEMENTED
- `labs/boostManager.ts` - NOT IMPLEMENTED
- `defense/towerLogic.ts` - EXISTS (in roomNode)
- `defense/wallManager.ts` - NOT IMPLEMENTED
- `planning/layoutPlanner.ts` - NOT IMPLEMENTED
- `visuals/roomVisuals.ts` - NOT IMPLEMENTED

**Recommended Actions:**
- Create missing modules as specified
- Move tower logic to dedicated file
- Implement cluster manager
- Implement empire manager

#### Issue #37: Insufficient Test Coverage
**Severity: Medium**
**Description:** Only 3 test files exist with 9 tests. Major systems lack tests:
- Pheromone system
- Evolution/posture logic
- Spawn prioritization
- Blueprint placement
- Scheduler

**Recommended Actions:**
- Add unit tests for pheromone calculations
- Add tests for evolution stage determination
- Add tests for spawn role selection
- Add tests for blueprint structure filtering

#### Issue #38: Lint Errors Present
**Severity: Low**
**Description:** 14 ESLint errors and 20 warnings exist in codebase.

**Recommended Actions:**
- Fix lint errors (max-classes-per-file, unnecessary type assertions, bitwise operators)
- Consider addressing warnings

---

## Performance Audit

### ✅ Good Practices Found
- CPU bucket management prevents overuse
- Priority-based creep execution
- Reserved CPU for finalization
- Per-tick caching (clearRoomCaches)
- Profiler for CPU monitoring

### ❌ Potential Issues

#### Issue #39: Room.find Called Multiple Times
**Severity: Low**
**Description:** Some room finds are repeated. E.g., `FIND_SOURCES` called multiple times in different functions.

**Recommended Actions:**
- Cache room.find results in context
- Reuse findings within same tick

#### Issue #40: Blueprint Terrain Check Per Structure
**Severity: Low**
**Description:** Blueprint placement calls `room.getTerrain()` and checks terrain per structure. Could cache.

**Recommended Actions:**
- Cache terrain lookup
- Pre-filter invalid positions

---

## Production Readiness Audit

### ❌ Issues for Production

#### Issue #41: No Error Recovery in Main Loop
**Severity: Medium**
**Description:** While ErrorMapper wraps the loop, individual subsystems don't have try-catch. A crash in one room affects all.

**Recommended Actions:**
- Wrap room node execution in try-catch
- Continue processing other rooms on error
- Log errors with room context

#### Issue #42: No Memory Migration System
**Severity: Medium**
**Description:** `version` field exists in creep memory but no migration code runs when version changes.

**Recommended Actions:**
- Implement memory version checking
- Add migration functions for schema changes

#### Issue #43: Memory Size Not Actively Managed
**Severity: Low**
**Description:** `isMemoryNearLimit()` exists but is never called.

**Recommended Actions:**
- Check memory size periodically
- Prune old data when near limit
- Clear stale room intel

---

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

## Priority Recommendations

### High Priority (Critical for Basic Function)
1. Issue #1: Remote Mining Implementation
2. Issue #2: Expansion Queue System
3. Issue #6: Global Meta-Layer (Overmind)
4. Issue #14: Remote Harvester/Carrier Roles
5. Issue #20: Active Empire/Cluster Logic
6. Issue #21: Safe Mode Trigger

### Medium Priority (Required for Full Feature Set)
7. Issue #3: Market Trading
8. Issue #4: Pheromone Diffusion
9. Issue #7: Shard Strategic Layer
10. Issue #8: Active Cluster Management
11. Issue #24: Nuke Management
12. Issue #27: Market Manager
13. Issue #28: Chemistry Planner
14. Issue #30: Scheduler Task Registration

### Low Priority (Polish/Optimization)
15. Issue #34: RoomVisual Integration
16. Issue #32: Global Path Caching
17. Issue #37: Test Coverage
18. Issue #38: Lint Errors

---

## Conversion to GitHub Issues

To convert this audit to GitHub issues, create issues with:
- **Title**: Brief description (e.g., "Implement Remote Mining System")
- **Labels**: `enhancement`, `roadmap`, `priority:high|medium|low`
- **Body**: Copy relevant issue section from this document

Each numbered "Issue #X" in this document should become a separate GitHub issue for tracking.
