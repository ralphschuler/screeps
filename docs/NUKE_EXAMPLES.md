# Nuke Coordination System - Usage Examples

## Example 1: Basic Nuke Strike

### Scenario
- Your empire has RCL8 room W1N1 with a loaded nuker
- Enemy room W5N5 (RCL7, 3 towers, 2 spawns)
- War mode enabled

### Automatic Process

```typescript
// 1. System evaluates target (runs every 500 ticks)
scoreNukeCandidate("W5N5")
// Returns: score = 82
// - RCL 7: +21 points
// - 3 towers: +15 points  
// - 2 spawns: +20 points
// - Owned room: +30 points
// - Distance 4: -8 points
// - War target: +15 points
// - ROI 2.5x: +10 points
// Total: 82 > minimum 35 ✓

// 2. Impact prediction
predictNukeImpact("W5N5", pos(25, 25))
// Returns:
// - estimatedDamage: 45M hits
// - estimatedValue: 750k energy
// - threatenedStructures: ["spawn-24,25", "tower-26,24", ...]

// 3. ROI check
calculateNukeROI("W5N5", pos(25, 25))
// Cost: 305k (300k energy + 5k ghodium)
// Gain: 750k
// ROI: 2.46x > threshold 2.0x ✓

// 4. Launch authorized
launchNukes()
// Creates NukeInFlight:
// {
//   id: "W1N1-W5N5-10000",
//   sourceRoom: "W1N1",
//   targetRoom: "W5N5",
//   launchTick: 10000,
//   impactTick: 60000,
//   estimatedDamage: 45000000,
//   estimatedValue: 750000
// }

// Log: "NUKE LAUNCHED from W1N1 to W5N5! Impact in 50000 ticks. 
//       Predicted damage: 45.0M hits, value: 750k, ROI: 2.46x"
```

## Example 2: Coordinated Salvo

### Scenario
- Two nukers ready: W1N1 and W2N2
- Same target: W6N6

### Automatic Process

```typescript
// Tick 10000: First nuke launched from W1N1
// Tick 10005: Second nuke launched from W2N2

// After both launches, system coordinates:
coordinateNukeSalvos()

// Groups by target:
// W6N6: [
//   { impactTick: 60000, ... },
//   { impactTick: 60005, ... }
// ]

// Spread: 5 ticks < 10 tick window ✓
// Assigns salvo ID: "salvo-W6N6-60000"

// Both nukes now have matching salvoId
// Log: "Nuke salvo salvo-W6N6-60000 coordinated: 
//       2 nukes on W6N6, impact spread: 5 ticks"
```

## Example 3: Siege Squad Coordination

### Scenario
- Nuke launched to W7N7, impact tick: 60000
- Current tick: 59200

### Automatic Process

```typescript
// Tick 59200: Within coordination window (< 1000 ticks to impact)
coordinateWithSieges()

// Finds nuke in flight to W7N7
// ticksUntilImpact: 800

// Deploys siege squad:
deploySiegeSquadForNuke(nuke)

// 1. Find nearest cluster (W1N1, distance: 6)
// 2. Create siege squad:
// {
//   id: "siege-nuke-W7N7-59200",
//   type: "siege",
//   rallyRoom: "W1N1",
//   targetRooms: ["W7N7"],
//   state: "gathering"
// }

// 3. Link to nuke:
// nuke.siegeSquadId = "siege-nuke-W7N7-59200"

// 4. Increase pheromones in W7N7:
// siege: +80
// war: +60

// Squad spawns, travels, arrives around tick 60000
// Nuke lands, destroys defenses
// Squad attacks weakened structures during 200-tick safe mode cooldown
```

## Example 4: Incoming Nuke Defense

### Scenario
- Enemy launches nuke at your room W1N1
- Nuke detected at tick 10000
- Impact tick: 60000

### Automatic Process

```typescript
// Detection (every tick):
detectIncomingNukes()

// Finds nuke in W1N1
// Creates alert:
// {
//   roomName: "W1N1",
//   landingPos: { x: 25, y: 25 },
//   impactTick: 60000,
//   timeToLand: 50000,
//   sourceRoom: "W5N5",
//   threatenedStructures: ["spawn-25,25", "storage-24,24"],
//   evacuationTriggered: false
// }

// Updates swarm state:
// - nukeDetected: true
// - danger: 3
// - pheromones.defense: +50
// - pheromones.siege: +30

// Log: "INCOMING NUKE DETECTED in W1N1! Landing at (25, 25), 
//       impact in 50000 ticks. Source: W5N5. Threatened structures: 2"

// Critical structures threatened (spawn, storage):
triggerEvacuation(room, alert)

// timeToLand = 50000 >= 5000
// → posture: "defensive" (prepare, not evacuate yet)
// → pheromones.defense: 100

// Log: "NUKE DEFENSE PREPARATION in W1N1: 
//       Critical structures in blast radius"
```

## Example 5: Counter-Nuke Response

### Scenario
- Enemy nuked your room W1N1 from W5N5
- Enemy W5N5 is RCL8
- Your war pheromone: 70
- Resources available: 1M energy, 15k ghodium

### Automatic Process

```typescript
// After nuke detection:
processCounterNukeStrategies()

// For each incoming nuke alert:
// 1. Check source room: W5N5 ✓
// 2. Check intel:
//    - controllerLevel: 8 (has nuker) ✓
// 3. Check war pheromone: 70 >= 60 ✓
// 4. Check resources:
//    - Need: 600k energy, 10k ghodium (2x buffer)
//    - Have: 1M energy, 15k ghodium ✓

// All conditions met → Authorize counter-nuke

// Add to war targets:
overmind.warTargets.push("W5N5")

// Increase war pheromones empire-wide:
// All owned rooms: pheromones.war +30

// Log: "COUNTER-NUKE AUTHORIZED: W5N5 added to war targets 
//       for nuke retaliation"

// Next nuke evaluation cycle:
// W5N5 now in warTargets
// Will be scored and potentially nuked back
```

## Example 6: Poor ROI Rejection

### Scenario
- Target: W8N8 (RCL3, 1 spawn, no towers)
- Your nuker ready in W1N1

### Automatic Process

```typescript
// Evaluation:
scoreNukeCandidate("W8N8")
// - RCL 3: +9 points
// - 1 spawn: +10 points
// - Owned room: +30 points
// - Distance 7: -14 points
// - War target: +15 points
// - ROI 0.8x: -20 points (penalty for poor ROI)
// Total: 30 < minimum 35 ✗

// Not added to nuke candidates

// Even if score was high enough:
launchNukes()
// ROI check before launch:
roi = 0.8x < 2.0x threshold
// Log: "Skipping nuke launch on W8N8: ROI 0.80x below threshold 2.00x"
// Launch cancelled

// Resources saved for better targets
```

## Example 7: Economics Tracking

### Scenario
- 5 nukes have been launched over time
- Tracking cumulative statistics

### Automatic Process

```typescript
// After each launch, economics updated:
// Launch 1: 300k energy, 5k ghodium, 1M value destroyed
// Launch 2: 300k energy, 5k ghodium, 800k value destroyed
// Launch 3: 300k energy, 5k ghodium, 1.2M value destroyed
// Launch 4: 300k energy, 5k ghodium, 900k value destroyed
// Launch 5: 300k energy, 5k ghodium, 1.1M value destroyed

updateNukeEconomics()

// Cumulative:
// nukeEconomics = {
//   nukesLaunched: 5,
//   totalEnergyCost: 1.5M,
//   totalGhodiumCost: 25k,
//   totalDamageDealt: 250M hits,
//   totalValueDestroyed: 5M energy,
//   lastROI: 3.28x,
//   lastLaunchTick: 60000
// }

// Every 5 nukes, log milestone:
// "Nuke economics: 5 nukes, ROI: 3.28x, Value destroyed: 5000k"

// Decision-making:
// Average ROI of 3.28x exceeds 2.0x threshold
// → Nuke program is economically successful
// → Continue aggressive targeting
```

## Example 8: Cleanup Operations

### Scenario
- Multiple nukes in flight and alerts
- Some have already impacted

### Automatic Process

```typescript
// Current tick: 65000

// Nukes in flight:
// [
//   { impactTick: 60000 },  // Already impacted (5000 ticks ago)
//   { impactTick: 62000 },  // Already impacted (3000 ticks ago)
//   { impactTick: 70000 }   // Still in flight (5000 ticks away)
// ]

cleanupNukeTracking()

// Remove impacted nukes:
nukesInFlight = nukesInFlight.filter(n => n.impactTick > 65000)
// Result: 1 nuke remaining

// Incoming alerts:
// [
//   { impactTick: 61000 },  // Already impacted
//   { impactTick: 68000 }   // Still incoming
// ]

// Remove old alerts:
incomingNukes = incomingNukes.filter(a => a.impactTick > 65000)
// Result: 1 alert remaining

// Log: "Cleaned up 2 impacted nuke alert(s)"
```

## Configuration Examples

### Conservative Settings

```typescript
// Require higher ROI and scores
const conservativeNukes = new NukeManager({
  minScore: 50,          // Higher target quality
  roiThreshold: 3.0,     // Require 3x ROI
  salvoSyncWindow: 5     // Tighter coordination
});
```

### Aggressive Settings

```typescript
// Lower thresholds for more frequent nukes
const aggressiveNukes = new NukeManager({
  minScore: 30,          // Lower target threshold
  roiThreshold: 1.5,     // Accept lower ROI
  counterNukeWarThreshold: 40  // Counter-nuke more easily
});
```

### Siege-Focused Settings

```typescript
// Emphasize siege coordination
const siegeNukes = new NukeManager({
  siegeCoordinationWindow: 2000,  // Deploy squads earlier
  salvoSyncWindow: 15             // Allow looser salvo timing
});
```
