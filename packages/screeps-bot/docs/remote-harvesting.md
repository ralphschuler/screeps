# Remote Harvesting System

## Overview

Remote harvesting allows your bot to efficiently mine energy from sources in nearby neutral rooms without claiming them. This maximizes energy income while conserving GCL for strategic room claims.

## How It Works

The remote harvesting system consists of three main components:

### 1. Expansion Manager (`src/empire/expansionManager.ts`)
- Automatically identifies and assigns remote rooms to owned rooms
- Evaluates remote room candidates based on:
  - Number of sources (more is better)
  - Distance from home room (closer is better)
  - Threat level (safer is better)
  - Terrain type (plains preferred over swamps)
- Spawns claimer creeps to reserve remote room controllers
- Maximum of 3 remote rooms per owned room (configurable)

### 2. Remote Infrastructure Manager (`src/empire/remoteInfrastructure.ts`)
- Automatically builds infrastructure in assigned remote rooms:
  - **Containers**: Placed adjacent to each source for efficient harvesting
  - **Roads**: Built from home room to remote rooms and within remote rooms
- Rate-limited to avoid overwhelming builders
- Only builds in neutral rooms or rooms reserved by the bot
- Runs every 50 ticks with low CPU priority

### 3. Remote Worker Roles
- **remoteHarvester**: Stationary miner that sits at remote sources
  - Uses 5+ WORK parts for efficient harvesting
  - Deposits energy into nearby containers
  - Falls back to dropping energy if no container exists
- **remoteHauler**: Transport creep that moves energy from remote to home
  - Large CARRY capacity for bulk transport
  - Delivers to spawns/extensions/towers/storage in home room
  - Picks up from remote containers or dropped energy

## Requirements

### Minimum RCL
Remote harvesting becomes available at **RCL 3** as defined in the ROADMAP (Stage 2 - Foraging Expansion).

### Configuration
The expansion manager can be configured via `ExpansionManagerConfig`:
```typescript
{
  maxRemoteDistance: 2,      // Maximum linear distance for remote rooms
  maxRemotesPerRoom: 3,      // Maximum remote rooms per owned room
  minRemoteSources: 1,       // Minimum sources required in remote room
  minRclForRemotes: 3        // Minimum RCL before enabling remotes
}
```

## Lifecycle

### Phase 1: Scout & Identify
1. Scout creeps explore neighboring rooms
2. Room intel is stored in `Memory.empire.knownRooms`
3. Expansion manager evaluates rooms as remote candidates

### Phase 2: Reserve
1. Expansion manager assigns remote rooms to owned rooms
2. Claimer creeps are spawned with task="reserve"
3. Claimers travel to remote rooms and reserve controllers
4. Reservation increases source capacity from 1500 to 3000 energy

### Phase 3: Build Infrastructure
1. Remote infrastructure manager detects assigned remotes
2. Containers are placed at each source (1 per source)
3. Roads are planned and built:
   - From home room storage/spawn to remote room center
   - From remote room center to each source
4. Construction sites are placed gradually (rate-limited)

### Phase 4: Harvest
1. remoteHarvester creeps spawn with targetRoom set to remote
2. Harvesters travel to remote room and sit at sources
3. Harvesters continuously mine and fill adjacent containers
4. remoteHauler creeps spawn and collect from containers
5. Haulers transport energy back to home room

## Monitoring

### Console Commands
Check remote mining status:
```javascript
// View remote assignments for a room
Memory.rooms['E1N1'].swarm.remoteAssignments

// View all creeps with remote roles
_.filter(Game.creeps, c => c.memory.role === 'remoteHarvester' || c.memory.role === 'remoteHauler')
```

### Logs
The system logs important events:
- Remote room assignments: `[Expansion] Assigned remote room X to Y`
- Container placement: `[RemoteInfra] Placed container construction site at source...`
- Road placement: `[RemoteInfra] Placed X remote road construction sites in...`

## Troubleshooting

### Remote harvesters not spawning
- Check that room has reached RCL 3+
- Verify remote rooms are assigned: `Memory.rooms['E1N1'].swarm.remoteAssignments`
- Check that spawn priority allows remote roles (depends on posture)

### No containers in remote rooms
- Ensure you have vision of the remote room (scout needs to visit)
- Check that room is not owned/reserved by another player
- Verify construction site limit not exceeded (max 5 per remote room)

### Haulers idle or not collecting energy
- Verify containers exist at sources in remote room
- Check that harvesters are actively mining
- Ensure haulers have correct targetRoom in memory

### Energy not reaching home room
- Check road network is complete between rooms
- Verify haulers are delivering to correct structures
- Monitor for hostile creeps blocking routes

## Performance Considerations

### CPU Usage
- Remote infrastructure manager runs every 50 ticks (low frequency)
- Container placement: ~0.01 CPU per remote room
- Road calculation: ~0.02 CPU per remote room
- Total impact: ~0.05 CPU per owned room with remotes

### Memory Usage
- Remote assignments: ~50 bytes per remote room
- Room intel: ~200 bytes per scouted room
- Minimal impact on overall memory footprint

### Spawn Priorities
Remote roles have moderate priority:
- remoteHarvester: 75 (spawns before builders/upgraders)
- remoteHauler: 70 (similar to builders)
- Scaled by posture (higher in "expand" posture)

## Best Practices

1. **Scout early**: Send scouts to explore neighbors at RCL 2-3
2. **Reserve promptly**: Send claimers to reserve as soon as remote assigned
3. **Build roads first**: Roads improve efficiency before harvesters arrive
4. **Monitor threats**: Check `room.threatLevel` and adjust remotes accordingly
5. **Defend routes**: Place guards along critical remote routes if needed
6. **Balance remotes**: Don't assign more remotes than your economy can support

## Related Files

- `src/empire/expansionManager.ts` - Remote room assignment
- `src/empire/remoteInfrastructure.ts` - Infrastructure planning
- `src/roles/behaviors/economy.ts` - remoteHarvester & remoteHauler logic
- `src/layouts/roadNetworkPlanner.ts` - Road calculation
- `src/logic/spawn.ts` - Remote role spawning logic
- `test/unit/remoteSpawning.test.ts` - Remote spawning tests
- `test/unit/remoteInfrastructure.test.ts` - Infrastructure tests
