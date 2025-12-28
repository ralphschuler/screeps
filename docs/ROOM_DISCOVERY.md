# Room Discovery and Expansion System

## Overview

The bot includes an automated room discovery and expansion system that operates in three phases:

1. **Discovery** - Automatically discovers nearby rooms
2. **Scouting** - Scouts discover room intel (sources, controller, threats)
3. **Expansion** - Scores and claims the best available rooms

## How It Works

### Phase 1: Room Discovery (empireManager.ts)

The `discoverNearbyRooms()` method runs every 100 ticks and automatically adds nearby rooms to `empire.knownRooms`:

- **Discovery Range**: Up to 5 linear distance from any owned room
- **Frequency**: Every 100 ticks (CPU efficient)
- **Output**: Stub intel entries marked as `scouted: false`

**Key Benefits**:
- No manual intervention needed
- Discovers rooms in expanding rings around owned rooms
- Highway rooms are identified immediately (can't be claimed)
- SK rooms are identified immediately (require special handling)
- CPU efficient due to infrequent execution (every 100 ticks)
- Memory spike protection (max 50 rooms discovered per tick)

### Phase 2: Room Scouting (intelScanner.ts)

The `IntelScanner` automatically scans discovered rooms to gather detailed intel:

- **Scan Queue**: Built from all rooms in `empire.knownRooms`
- **Priority**: Threat level (high threat first), then age (oldest scans first)
- **Frequency**: Continuous (3 rooms per tick by default)
- **Data Collected**: 
  - Source count and positions
  - Controller level and owner
  - Mineral type
  - Structure counts (towers, spawns)
  - Terrain type (plains, swamp, mixed)
  - Threat level (hostile creeps)

**Auto-scouting**: Rooms are also automatically scouted when:
- They become visible (adjacent to owned rooms)
- Scouts manually visit them
- Observers scan them

### Phase 3: Expansion (expansionManager.ts + empireManager.ts)

The expansion system automatically scores and claims rooms:

#### Scoring (Multi-Factor)
Rooms are scored based on:
1. **Source count** (+40 for 2 sources, +20 for 1)
2. **Mineral type** (rare minerals get bonus)
3. **Distance** (-5 per linear distance)
4. **Hostile proximity** (heavy penalty for adjacent hostiles)
5. **Threat level** (-15 per threat level)
6. **Terrain** (+15 for plains, -10 for swamp)
7. **Highway proximity** (+10 strategic bonus)
8. **Portal proximity** (+10 for cross-shard expansion)
9. **Cluster proximity** (+25 for distance ≤ 2, +15 for distance ≤ 3, +5 for distance ≤ 5 from existing clusters)

#### Claiming Process
1. Top candidates added to `empire.claimQueue` (max 10)
2. Expansion triggers when:
   - GCL allows more rooms
   - 70%+ GCL progress to next level
   - 60%+ of owned rooms are RCL 4+ (stable)
3. Closest stable room (RCL 4+) switches to "expand" posture
4. Room spawns claimer to claim target
5. Progress monitored, auto-cancels if:
   - Claimer dies repeatedly
   - Target becomes hostile
   - Energy reserves drop too low
   - Timeout (5000 ticks)

## Console Commands

Check expansion status:
```javascript
expansion.status()  // View GCL, claim queue, active claims
```

Manual control:
```javascript
expansion.pause()   // Pause autonomous expansion
expansion.resume()  // Resume autonomous expansion
expansion.clearQueue()  // Clear claim queue
```

Remote mining:
```javascript
expansion.addRemote('W1N1', 'W2N1')     // Add remote manually
expansion.removeRemote('W1N1', 'W2N1')  // Remove remote
```

## Configuration

### Discovery Settings (empireManager.ts)
```typescript
const maxDiscoveryDistance = 5;      // How far to discover rooms
const discoveryInterval = 100;       // How often to discover (ticks)
const maxRoomsToDiscoverPerTick = 50; // Prevent memory spikes
```

### Expansion Settings (expansionManager.ts)
```typescript
maxRemoteDistance: 2,            // Max distance for remote mining
maxRemotesPerRoom: 4,            // Max remotes per owned room
minRclForRemotes: 3,             // Min RCL before remote mining
minRclForClaiming: 4,            // Min RCL before claiming
minGclProgressForClaim: 0.7,     // Min 70% GCL progress
minStableRoomPercentage: 0.6     // Min 60% rooms must be RCL 4+
```

### Empire Settings (empireManager.ts)
```typescript
minGclForExpansion: 2,           // Min GCL before expansion
maxExpansionDistance: 10,        // Max distance for expansion
minExpansionScore: 50,           // Min score to be considered
```

## Troubleshooting

### "Expansion queue is empty"
**Cause**: Nearby rooms not yet discovered or scouted
**Solution**: Wait 100 ticks for discovery, then wait for scouts to gather intel

### "Expansion paused despite GCL availability"
**Causes**:
1. GCL progress < 70% - Wait for more GCL progress
2. <60% of rooms are stable (RCL 4+) - Develop existing rooms first
3. Expansion manually paused - Run `expansion.resume()`

**Check**: Run `expansion.status()` to see readiness

### "No remote rooms assigned"
**Causes**:
1. Room RCL < 3 - Remotes disabled until RCL 3
2. Low energy reserves - Need 10K+ energy in storage
3. Under attack (danger ≥ 2) - Remotes disabled during defense

**Solution**: Stabilize economy and security first

### "Claimer spawned but not claiming"
**Causes**:
1. Path blocked or too dangerous
2. Target became hostile
3. Energy shortage cancelled expansion

**Check**: Monitor with `expansion.status()`, review logs

## Performance

The room discovery system is designed to be CPU efficient:

- **Discovery**: Runs every 100 ticks (configurable), limited to 50 rooms per tick
- **Scouting**: Existing IntelScanner handles 3 rooms per tick
- **Expansion**: Runs every 30 ticks with efficient scoring

Actual CPU usage varies based on empire size, number of rooms being processed, and current game conditions. The infrequent execution and built-in limits ensure minimal impact on overall bot performance.

## Related Systems

- **ROADMAP.md Section 2**: Remote Mining & Expansion
- **ROADMAP.md Section 7**: Scout & Static Mining
- **expansionScoring.ts**: Multi-factor scoring algorithms
- **intelScanner.ts**: Continuous enemy scanning
- **remoteInfrastructure.ts**: Remote mining logistics
