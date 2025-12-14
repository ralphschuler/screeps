# Harasser State Machine

**Role:** `harasser`  
**Category:** Military  
**Description:** Fast, cheap disruptor for early-game aggression

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckTarget
    
    CheckTarget --> TravelToTarget: Has target room
    CheckTarget --> Idle: No target
    
    state HarassRoom {
        [*] --> FindTarget
        FindTarget --> AttackCreep: Hostile creep nearby
        FindTarget --> AttackStructure: Hostile structure nearby
        FindTarget --> Flee: Overwhelmed
        
        AttackCreep --> CheckHealth: Attacked
        AttackStructure --> CheckHealth: Attacked
        
        CheckHealth --> Flee: Low HP
        CheckHealth --> Continue: Healthy
        
        Continue --> FindTarget
    }
    
    TravelToTarget --> HarassRoom
    HarassRoom --> CheckTarget: Target eliminated or dead
```

**Key Behaviors:**
- Cheap, fast units for disruption
- Attacks economy creeps (harvesters, haulers)
- Attacks weak structures (extensions, containers)
- Flees when damaged
- Hit-and-run tactics
- Minimal investment, maximum disruption

**Body:** 2 ATTACK, 2 MOVE (260 energy) - Very cheap
