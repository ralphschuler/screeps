# Siege State Machine

**Role:** `siege`  
**Category:** Military  
**Description:** Structure destruction specialist for sieges

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckTargetRoom
    
    CheckTargetRoom --> TravelToTarget: Not in target room
    CheckTargetRoom --> SiegeRoom: In target room
    
    state SiegeRoom {
        [*] --> FindStructure
        FindStructure --> DismantleStructure: Structure found
        FindStructure --> AttackStructure: No dismantleable
        FindStructure --> Idle: No structures
        
        state Priority {
            note right of Priority
            Structure priority:
            1. Spawns
            2. Towers
            3. Storage/Terminal
            4. Walls/Ramparts
            5. Other
            end note
        }
        
        DismantleStructure --> [*]
        AttackStructure --> [*]
    }
    
    TravelToTarget --> CheckTargetRoom
    SiegeRoom --> CheckTargetRoom
```

**Key Behaviors:**
- Assigned to specific target room
- Prioritizes critical structures (spawns, towers)
- Uses dismantle() for 50 hits per WORK part
- Uses attack() if no WORK parts
- Heavily armored (TOUGH) to survive defenses
- Works with squad for protection

**Body:** 10 WORK, 10 TOUGH, 15 MOVE (boosted in serious sieges)
