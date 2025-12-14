# Ranger State Machine

**Role:** `ranger`  
**Category:** Military  
**Description:** Ranged combat specialist for flexible engagement

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckHostiles
    
    CheckHostiles --> Engage: Hostiles detected
    CheckHostiles --> Patrol: No hostiles
    
    state Engage {
        [*] --> SelectTarget
        SelectTarget --> OptimalRange: Target selected
        
        state OptimalRange {
            [*] --> CheckDistance
            CheckDistance --> RangedAttack: Range 3
            CheckDistance --> MoveCloser: Range > 3
            CheckDistance --> MoveAway: Range < 3
            
            RangedAttack --> [*]
            MoveCloser --> [*]
            MoveAway --> [*]
        }
    }
    
    state Patrol {
        [*] --> WalkRoute
        WalkRoute --> [*]
    }
    
    Engage --> CheckHostiles
    Patrol --> CheckHostiles
```

**Key Behaviors:**
- Maintains optimal range 3 for ranged attacks
- Kites melee attackers (stays at range)
- Flexible positioning
- Works independently or in squads
- Mass attack for area damage if multiple enemies

**Body:** 15 RANGED_ATTACK, 5 MOVE (boosted for serious combat)
