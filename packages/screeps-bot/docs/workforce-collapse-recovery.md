# Workforce Collapse Recovery System

## Overview

The workforce collapse recovery system ensures the bot can recover from catastrophic scenarios where all or most creeps die simultaneously. This document explains the recovery mechanisms and design decisions.

## Problem Statement

In Screeps, rooms can enter a deadlock state when:
1. All creeps die at once (e.g., hostile attack, nuke, manual suicide)
2. Extensions are empty or don't exist (RCL 1)
3. The spawn has insufficient energy to spawn the minimum creep

**Example Deadlock Scenario:**
- All creeps dead
- Spawn has 180 energy
- Previous minimum creep cost: 200 energy (larvaWorker: WORK, CARRY, MOVE)
- Result: Cannot spawn → Cannot harvest → Cannot recover

## Solution: Ultra-Minimal Emergency Body

### Emergency Body Design

Added a 150 energy body to larvaWorker: `[WORK, CARRY]`

**Rationale:**
- **WORK part (100 energy)**: Can harvest energy from sources
- **CARRY part (50 energy)**: Can carry and deliver energy to spawns/extensions
- **No MOVE part**: Saves 50 energy, making recovery possible with just 150 energy in spawn

**Trade-offs:**
- Moves slowly: 1 tile per 2 ticks on plains (vs. 1 tile per tick with MOVE)
- Lower efficiency: Takes longer to harvest and deliver
- Acceptable for emergency recovery: Speed is secondary to survival

### Body Selection Priority

The system uses `getBestBody()` to select the most appropriate body based on available energy:

```typescript
// Energy levels and bodies selected:
150-199 energy → [WORK, CARRY] (150 cost) - Emergency mode
200-399 energy → [WORK, CARRY, MOVE] (200 cost) - Standard minimal
400-599 energy → [WORK×2, CARRY×2, MOVE×2] (400 cost) - Improved
600-799 energy → [WORK×3, CARRY×3, MOVE×3] (600 cost) - Better
800+ energy    → [WORK×4, CARRY×4, MOVE×4] (800 cost) - Optimal
```

## Recovery Process

### Detection

The system detects emergency states through:

1. **Emergency State Detection** (`isEmergencySpawnState`)
   - Checks if zero energy-producing creeps exist
   - Returns `true` when `getEnergyProducerCount()` === 0

2. **Bootstrap Mode Detection** (`isBootstrapMode`)
   - Active when critical roles are missing
   - Follows deterministic bootstrap order instead of weighted selection

### Recovery Sequence

When in emergency + bootstrap mode:

```
Tick N: All creeps dead, spawn has 150 energy
  → isEmergencySpawnState() = true
  → isBootstrapMode() = true
  → effectiveCapacity = energyAvailable (150)
  → getBootstrapRole() = "larvaWorker"
  → getBestBody(larvaWorker, 150) = [WORK, CARRY]
  → Spawn ultra-minimal larvaWorker ✓

Tick N+1: Ultra-minimal larvaWorker harvests
  → Slowly moves to source (1 tile per 2 ticks)
  → Harvests energy (2 energy/tick with WORK)
  
Tick N+20: Energy accumulates in spawn
  → energyAvailable = 200+
  → Spawn standard larvaWorker with MOVE part
  → Recovery accelerates

Tick N+50: Multiple creeps, energy flowing
  → Bootstrap completes
  → Normal operations resume
```

### Bootstrap Order

During recovery, roles are spawned in this deterministic order:

1. **larvaWorker** (min 1) - Energy production + transport
2. **harvester** (min 1) - Static mining at first source
3. **hauler** (min 1) - Energy transport
4. **harvester** (min 2) - Second source coverage
5. **queenCarrier** (min 1, if storage exists) - Spawn/extension filling
6. **upgrader** (min 1) - Controller progress

## Monitoring and Diagnostics

### Emergency Event

When energy is critically low (< 150) during emergency:

```typescript
kernel.emit("spawn.emergency", {
  roomName: room.name,
  energyAvailable: 100,
  message: "Critical workforce collapse - waiting for energy",
  source: "SpawnManager"
});
```

This event:
- Priority: HIGH
- Helps identify deadlock situations
- Can trigger alerts or recovery actions

### Visual Indicators

During emergency recovery, you may observe:
- Ultra-minimal creeps moving very slowly
- Low spawn rate (waiting for energy accumulation)
- Bootstrap mode active longer than normal

## Edge Cases

### Scenario: < 150 Energy

**Problem**: Spawn has < 150 energy, cannot spawn anything
**Solution**: Wait for passive energy accumulation or manual intervention

**Note**: This is extremely rare because:
- Sources regenerate energy every 300 ticks
- Spawns can hold up to 300 energy
- For deadlock, all sources must be depleted AND all creeps must die simultaneously

### Scenario: Multiple Spawns

**Handled automatically**: 
- `room.energyAvailable` aggregates all spawn/extension energy
- System uses total available energy for body selection
- No special logic needed

### Scenario: Container-based Mining

**Handled by harvester behavior**:
- Harvesters without CARRY parts drop energy on the ground
- Haulers can pick up dropped energy
- No additional recovery logic needed

## Testing

Comprehensive test suite covers:
- Ultra-minimal body selection (150 energy)
- Emergency spawning with various energy levels (150-300)
- Bootstrap order during recovery
- Emergency event emission
- Multi-spawn rooms
- Edge cases (< 150 energy, exact thresholds)

See: `test/unit/workforceCollapseRecovery.test.ts` (13 tests)

## Performance Impact

**Minimal impact during normal operations:**
- Emergency detection: O(n) where n = creep count (cached per tick)
- Bootstrap mode: Only active when critical roles missing
- Body selection: O(k) where k = number of body templates (~5 per role)

**During emergency:**
- Slightly increased spawn time (ultra-minimal creeps take longer)
- Recovery typically completes within 50-100 ticks
- CPU usage normal (no expensive operations)

## Related Systems

- **Bootstrap System** (`isBootstrapMode`, `getBootstrapRole`)
- **Emergency Detection** (`isEmergencySpawnState`)
- **Spawn Manager** (`runSpawnManager`)
- **Event System** (spawn.emergency event)
- **Role Definitions** (ROLE_DEFINITIONS.larvaWorker)

## Future Enhancements

Potential improvements:
1. **Energy transfer between rooms**: If multiple rooms exist, transfer energy to collapsed room
2. **Reserved emergency energy**: Keep minimum energy in storage for emergencies
3. **Predictive warnings**: Detect when workforce is critically low before total collapse
4. **Automated recovery assistance**: Request help from other rooms in cluster

## Roadmap Alignment

From ROADMAP.md section 19 (Resilienz & Respawn-Fähigkeit):

> "Resilienz & Respawn-Fähigkeit
> - Redundanz: Möglichst früh mehrere Räume pro Shard claimen
> - Notfallpläne: Recovery-Plan für absehbaren Wipe
> - Respawn: GCL bleibt nach Respawn erhalten"

This implementation directly addresses the "Notfallpläne" requirement by ensuring recovery from workforce collapse without manual intervention.
