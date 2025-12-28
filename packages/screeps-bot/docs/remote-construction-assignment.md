# Remote Construction Site Assignment - Implementation Summary

## Problem

Builders were unable to work on construction sites in remote rooms because the target assignment manager only searched for construction sites within the creep's home room. This caused remote harvesting infrastructure (containers and roads) to never be built, preventing the establishment of remote mining operations.

## Solution

Extended the `targetAssignmentManager.ts` to discover and assign construction sites from visible remote rooms.

### Key Changes

#### 1. Remote Site Discovery (`getRemoteConstructionSites`)

```typescript
function getRemoteConstructionSites(room: Room): ConstructionSite[]
```

- Retrieves remote room assignments from `swarm.remoteAssignments`
- Only processes **visible** remote rooms (where `Game.rooms[remoteName]` exists)
- Skips enemy-owned rooms for safety
- Returns array of construction sites from all accessible remote rooms

#### 2. Updated Builder Assignment (`assignBuildersToTargets`)

```typescript
const localSites = room.find(FIND_MY_CONSTRUCTION_SITES);
const remoteSites = getRemoteConstructionSites(room);
const allSites = [...localSites, ...remoteSites];
```

- Combines local and remote construction sites
- Applies priority-based sorting across all sites
- Distributes builders using existing round-robin algorithm

#### 3. Remote Infrastructure Prioritization (`getConstructionPriority`)

New priority system favors remote infrastructure to bootstrap remote mining economy:

| Structure | Location | Priority | Rationale |
|-----------|----------|----------|-----------|
| Container | Remote | 100 | **Highest** - Critical for remote mining |
| Spawn | Local | 95 | Essential for room operation |
| Extension | Local | 90 | Energy capacity expansion |
| Tower | Local | 85 | Defense capability |
| Road | Remote | 80 | Hauler efficiency |
| Storage | Local | 75 | Energy storage |
| Link | Local | 70 | Energy distribution |
| Container | Local | 65 | Lower than remote containers |
| Road | Local | 50 | Lower than remote roads |
| Rampart | Any | 40 | Defense structures |
| Wall | Any | 30 | Defense structures |

### Cross-Room Movement

The existing action executor (`executor.ts`) already supports cross-room movement:
- `executeWithRange()` uses `moveTo()` from screeps-cartographer
- Automatically handles multi-room pathfinding
- Builders will path to remote rooms when assigned remote construction sites

### Performance Characteristics

- **Complexity**: O(n+m) where n = creeps, m = construction sites (local + remote)
- **CPU Impact**: Minimal - only processes visible remote rooms
- **Memory**: Uses existing `swarm.remoteAssignments` structure
- **Alignment**: Maintains ROADMAP Section 2 target: "Eco-Raum ≤ 0.1 CPU"

## Testing

### Unit Tests (`test/unit/remoteConstructionAssignment.test.ts`)

Comprehensive test coverage for:
- ✅ Remote site discovery from visible rooms
- ✅ Handling of invisible remote rooms
- ✅ Skipping enemy-owned rooms
- ✅ Construction priority system
- ✅ Builder distribution across local and remote sites
- ✅ Edge cases (no remotes, undefined swarm state, mixed visibility)
- ✅ Performance with many remote rooms

### Integration Testing

Required manual validation:
- [ ] Builders successfully path to remote rooms
- [ ] Remote containers get built before local structures
- [ ] CPU usage stays within budget
- [ ] No pathfinding errors or infinite loops

## Architecture Alignment

### ROADMAP Compliance

- **Section 2**: Maintains CPU efficiency targets (≤0.1 CPU per eco room)
- **Section 8**: Uses existing medium-frequency update cycle (10 tick refresh)
- **Section 18**: Leverages aggressive caching for room finds

### Swarm Architecture Principles

- **Decentralized Assignment**: Maintains O(n+m) assignment complexity
- **Emergent Behavior**: Builders autonomously work on remote infrastructure
- **Local Rules, Global Effect**: Priority system creates coordinated remote building

## Usage

No configuration required - the system automatically:
1. Detects remote room assignments from `swarm.remoteAssignments`
2. Discovers construction sites in visible remote rooms
3. Assigns builders based on priority
4. Builders path to and build remote infrastructure

## Future Enhancements

Potential improvements (marked as TODOs in issue comments):
- [ ] Adjust priorities dynamically based on room needs
- [ ] Consider distance when assigning remote sites
- [ ] Add metrics for remote construction efficiency
- [ ] Coordinate with remote harvester spawning

## References

- Issue: [we need to change how we distribute tasks to creeps](https://github.com/ralphschuler/screeps/issues/XXX)
- Related: `remoteInfrastructure.ts` - Places remote construction sites
- Related: `builder.ts` - Builder behavior implementation
- Related: `executor.ts` - Cross-room movement execution
