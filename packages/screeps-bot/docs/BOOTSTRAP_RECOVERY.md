# Workforce Collapse Recovery - Bootstrap System

## Overview

The bootstrap system handles total workforce collapse scenarios where all or most creeps die and the room needs to recover from scratch. It uses a deterministic spawning strategy with ultra-minimal creep bodies to ensure recovery even with very limited energy.

## Problem Statement

In Screeps, if all creeps die and energy in extensions is depleted, a room can enter a deadlock state:
- No creeps exist to harvest energy from sources
- No energy in spawn/extensions to spawn new creeps
- Energy doesn't regenerate automatically - sources must be harvested

Without a bootstrap system, the room would be permanently stuck until manual intervention or energy assistance from other rooms.

## Solution: Three-Layer Recovery System

### Layer 1: Ultra-Minimal Bootstrap Bodies

**150 Energy Emergency Body**: `[WORK, CARRY]`
- Cost: 150 energy (vs standard 200)
- Can harvest energy from sources
- Can carry and deposit energy
- No MOVE part - moves slowly (1 tile per 2 ticks on plains)
- Sufficient to kickstart the economy

This ultra-minimal body ensures recovery is possible even when:
- Spawn has < 200 energy (can't spawn standard creep)
- Extensions are empty
- No other creeps exist

### Layer 2: Aggressive Bootstrap Spawning

The system distinguishes between **active** (working) and **spawning** (still being built) creeps:

```typescript
// Emergency detection uses ACTIVE creeps only
isEmergencySpawnState(roomName) {
  const activeCounts = countCreepsByRole(roomName, true); // activeOnly=true
  return getEnergyProducerCount(activeCounts) === 0;
}

// Role limits use TOTAL creeps (including spawning)
isBootstrapMode(roomName, room) {
  const activeCounts = countCreepsByRole(roomName, true);
  const totalCounts = countCreepsByRole(roomName, false);
  
  // Keep spawning if no active producers, even if one is spawning
  if (getEnergyProducerCount(activeCounts) === 0) {
    return true;
  }
  
  // Check role minimums against total counts to avoid duplicates
  // ...
}
```

**Benefits**:
- System can spawn multiple small creeps rapidly during collapse
- Avoids waiting for one creep to finish spawning before starting the next
- Faster recovery through parallel spawning (if multiple spawns available)
- Still prevents duplicate spawning once a role is being built

### Layer 3: Inter-Room Energy Assistance

The resource sharing system automatically helps collapsed rooms:

```typescript
// Resource sharing triggers BEFORE emergency
criticalEnergyThreshold: 300,  // Request help early
// Bootstrap system works at lower threshold
bootstrapMinimum: 150  // Ultra-minimal creep cost
```

**Assistance Flow**:
1. Room drops below 300 energy → Requests help from cluster
2. Healthy rooms spawn carriers and send energy
3. If room drops below 150 → Ultra-critical, highest priority
4. Bootstrap system kicks in if energy arrives too late

## Bootstrap Mode Activation

Bootstrap mode activates when ANY of these conditions are true:

1. **Zero active energy producers** (even if one is spawning)
   ```typescript
   getEnergyProducerCount(activeCounts) === 0
   ```

2. **Harvesters exist but no transport**
   ```typescript
   getTransportCount(activeCounts) === 0 && harvesters > 0
   ```

3. **Missing critical role from bootstrap order**
   - Not enough larvaWorkers, harvesters, haulers, etc.

## Bootstrap Spawn Order

When in bootstrap mode, the system uses **deterministic priority spawning** instead of weighted selection:

| Priority | Role | Min Count | Condition | Purpose |
|----------|------|-----------|-----------|---------|
| 1 | `larvaWorker` | 1 | Always | Energy production & transport |
| 2 | `harvester` | 1 | Always | Efficient static mining |
| 3 | `hauler` | 1 | Always | Energy distribution |
| 4 | `harvester` | 2 | Always | Second source coverage |
| 5 | `queenCarrier` | 1 | Storage exists | Spawn/extension management |
| 6 | `upgrader` | 1 | Always | Controller progress |

This order ensures:
- Energy production comes first (can't do anything without energy)
- Transport is established (energy must reach spawn/extensions)
- Basic economy roles are prioritized
- Room can transition to normal operation

## Body Scaling

Each role has multiple body templates that scale with available energy:

### LarvaWorker Bodies
```typescript
bodies: [
  { parts: [WORK, CARRY], cost: 150 },                    // Ultra-minimal (bootstrap)
  { parts: [WORK, CARRY, MOVE], cost: 200 },              // Minimal (early game)
  { parts: [WORK, WORK, CARRY, CARRY, MOVE, MOVE], cost: 400 },
  // ... larger bodies
]
```

**Selection Logic**:
```typescript
// In emergency mode, use available energy instead of capacity
const isEmergency = isEmergencySpawnState(room.name);
const effectiveCapacity = isEmergency ? energyAvailable : energyCapacity;

// Find best affordable body
const body = getBestBody(roleDef, effectiveCapacity);
```

This ensures:
- In emergency: Spawn ASAP with whatever energy is available
- In normal mode: Wait for optimal body (use full capacity)

## Logging & Monitoring

### Workforce Collapse Warning
```
[1000] [WARN] [spawn] [E1N1] WORKFORCE COLLAPSE: 100 energy available, 
need 150 to spawn minimal larvaWorker. Room will recover once energy reaches 150.
```

Triggered when:
- No active energy producers exist
- Energy < 150 (can't spawn bootstrap creep)

### Bootstrap Mode Status
```
[1000] [INFO] [spawn] [E1N1] BOOTSTRAP MODE: 0 active energy producers 
(0 larva, 0 harvest), 0 total. Energy: 150/300
```

Logged every 10 ticks when in bootstrap mode, showing:
- Number of active energy producers
- Breakdown by role (larvaWorkers, harvesters)
- Total counts (including spawning creeps)
- Energy available vs capacity

### Bootstrap Spawn Success
```
[1000] [INFO] [spawn] [E1N1] BOOTSTRAP SPAWN: larvaWorker 
(larvaWorker_1000_123) with 2 parts, cost 150. Recovery in progress.
```

Confirms successful spawn of bootstrap creep.

## Code Organization

### Core Files

**`src/logic/spawn.ts`**
- Bootstrap mode detection: `isBootstrapMode()`
- Emergency detection: `isEmergencySpawnState()`
- Bootstrap role selection: `getBootstrapRole()`
- Creep counting: `countCreepsByRole(roomName, activeOnly?)`
- Body templates and selection

**`src/clusters/resourceSharing.ts`**
- Inter-room energy assistance
- Critical energy threshold detection
- Carrier spawning and routing

**`test/unit/workforceCollapseRecovery.test.ts`**
- 13 comprehensive tests covering all scenarios
- Tests for 150 energy body, bootstrap order, emergency detection
- Edge cases: spawning creeps, multi-spawn rooms, energy below minimum

## Example Recovery Scenarios

### Scenario 1: Total Collapse with 150 Energy

```
Tick 1000:
- All creeps dead
- 150 energy available
- [WARN] WORKFORCE COLLAPSE detected

Tick 1001:
- [INFO] BOOTSTRAP MODE active
- [INFO] BOOTSTRAP SPAWN: larvaWorker (150 energy)
- Creep spawning: [WORK, CARRY]

Tick 1004:
- larvaWorker finishes spawning
- Moves to source (slowly, no MOVE part)
- Starts harvesting

Tick 1010:
- larvaWorker deposits energy in spawn
- 350 energy now available
- [INFO] BOOTSTRAP SPAWN: harvester (250 energy)

Tick 1020:
- 2 active energy producers
- Normal economy resuming
- Bootstrap mode will end once all critical roles spawned
```

### Scenario 2: Near-Collapse with Energy Assistance

```
Tick 1000:
- 1 dying creep (TTL=50)
- 280 energy available
- Resource sharing: Request help (< 300 threshold)

Tick 1020:
- Last creep dies
- 250 energy available
- [INFO] BOOTSTRAP MODE active
- [INFO] BOOTSTRAP SPAWN: larvaWorker (200 energy)

Tick 1050:
- Carrier from neighboring room arrives
- Deposits 500 energy
- 750 energy now available
- Bootstrap accelerates with better bodies
```

### Scenario 3: Multiple Spawns Parallel Recovery

```
Tick 1000:
- Room with 2 spawns
- All creeps dead
- 300 energy available

Tick 1001:
- [INFO] BOOTSTRAP MODE: 0 active producers
- Spawn 1: [INFO] BOOTSTRAP SPAWN: larvaWorker (150 energy)
- 150 energy remaining

Tick 1002:
- [INFO] BOOTSTRAP MODE: 0 active producers (1 spawning)
- Still in emergency: no ACTIVE producers yet
- Spawn 2: [INFO] BOOTSTRAP SPAWN: larvaWorker (150 energy)
- Both spawns working on recovery simultaneously!

Tick 1004:
- First larvaWorker done spawning
- Bootstrap mode continues for second spawn

Tick 1005:
- Second larvaWorker done spawning
- 2 active energy producers
- Rapid recovery!
```

## Testing

All tests located in `test/unit/workforceCollapseRecovery.test.ts`:

### Critical Tests
- ✅ Ultra-minimal 150 energy body exists
- ✅ Spawns with exactly 150 energy
- ✅ Prefers standard 200 body when available
- ✅ Recovers from complete workforce loss
- ✅ Handles energy below 150 (waits)
- ✅ Multi-spawn coordination
- ✅ Bootstrap order enforcement
- ✅ Active vs spawning creep counting
- ✅ Emergency event emission

Run tests:
```bash
npm test -- --grep "workforce collapse"
```

## Performance Considerations

### CPU Impact
- Creep counting cached per tick
- Bootstrap mode check: O(n) where n = number of creeps
- Runs only when spawns available and not spawning
- Logging throttled (every 10 ticks)

### Memory Impact
- No additional memory structures needed
- Uses existing creep memory (homeRoom, role)
- Bootstrap state is computed, not stored

## Best Practices

### For Bot Operators

1. **Monitor Logs**: Watch for WORKFORCE COLLAPSE warnings
2. **Check Energy Levels**: Keep rooms above 300 energy when possible
3. **Resource Sharing**: Ensure clusters are configured for energy assistance
4. **Multiple Spawns**: Build additional spawns (RCL 7+) for faster recovery
5. **Safe Mode**: Use as last resort if bootstrap fails due to attacks

### For Developers

1. **Test Changes**: Run workforce collapse tests before deploying
2. **Maintain Bootstrap Order**: Critical roles first, utilities later
3. **Body Templates**: Keep 150-energy body for larvaWorker
4. **Logging**: Don't remove bootstrap logs - they're crucial for debugging
5. **Resource Sharing**: Keep thresholds aligned with bootstrap minimum

## Related Systems

### Pheromone System
- `pheromones.harvest` increases during energy shortage
- Influences normal spawning priorities
- Not used in bootstrap mode (deterministic instead)

### Defensive Posture
- Room danger level affects spawning
- Bootstrap mode still activates even in defensive posture
- Energy producers prioritized over defenders during collapse

### Evolution Manager
- Colony level affects body sizes
- Bootstrap always uses smallest available body in emergency
- Overrides evolution recommendations

## Future Enhancements

Possible improvements (not currently implemented):

1. **Energy Drop Mining**: Code to explicitly handle dropped resources
2. **Emergency Source Keepers**: Handle SK rooms during collapse
3. **Power Creep Assistance**: Use power creeps to speed recovery
4. **Nuke Recovery**: Special bootstrap for post-nuke scenarios
5. **Multi-Shard Coordination**: Cross-shard energy assistance

## Troubleshooting

### Room Not Recovering

**Symptoms**: Room stuck with < 150 energy, no creeps spawning

**Possible Causes**:
1. Energy < 150: Bootstrap can't spawn, need energy from another room
2. Spawn blocked: Creep or structure on spawn exit
3. Sources depleted: Wait 300 ticks for regeneration
4. Under attack: Use safe mode to buy time

**Solutions**:
```javascript
// Check bootstrap state
Game.rooms.E1N1.find(FIND_MY_SPAWNS)[0].room.energyAvailable  // Current energy
Game.rooms.E1N1.find(FIND_MY_CREEPS).length  // Should be 0 if collapsed

// Manual energy transfer (if you have other rooms)
Game.rooms.E2N1.terminal.send(RESOURCE_ENERGY, 1000, 'E1N1')

// Check for blocking
Game.rooms.E1N1.find(FIND_MY_SPAWNS)[0].pos.lookFor(LOOK_CREEPS)
```

### Bootstrap Mode Not Activating

**Symptoms**: Room has creeps but economy is weak

**Possible Causes**:
- Minimum roles met (bootstrap only for critical roles)
- Creeps exist but not harvesting efficiently
- Wrong roles spawned

**Solutions**:
- Review bootstrap order requirements
- Check creep behaviors (are they idle?)
- Verify source assignment

### Multiple Small Creeps Not Spawning

**Symptoms**: Only one bootstrap creep spawns despite emergency

**Check**:
```javascript
// Should be 0 while first creep is spawning
isEmergencySpawnState('E1N1')  // Uses active counts

// Should be 1 (counts spawning creep)
countCreepsByRole('E1N1', false).get('larvaWorker')  // Total

// Should be 0 (doesn't count spawning)
countCreepsByRole('E1N1', true).get('larvaWorker')  // Active only
```

If not working as expected, check game version and test suite.

## References

- [Screeps API - Spawn](https://docs.screeps.com/api/#StructureSpawn)
- [Screeps API - Creep](https://docs.screeps.com/api/#Creep)
- [ROADMAP.md](../../ROADMAP.md) - Section 19: Resilienz & Respawn-Fähigkeit
- [Resource Sharing](../clusters/resourceSharing.ts)
- [Spawn Manager](../logic/spawn.ts)
