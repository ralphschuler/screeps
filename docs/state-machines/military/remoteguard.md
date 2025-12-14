# RemoteGuard State Machine

**Role:** `remoteGuard`  
**Category:** Military  
**Description:** Defends remote mining operations

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckTargetRoom
    
    CheckTargetRoom --> TravelToRemote: Not in remote room
    CheckTargetRoom --> DefendRemote: In remote room
    
    state DefendRemote {
        [*] --> ScanHostiles
        ScanHostiles --> Combat: Hostiles found
        ScanHostiles --> PatrolRemote: No hostiles
        
        state Combat {
            [*] --> PriorityTarget
            PriorityTarget --> Attack: Target selected
            Attack --> [*]
        }
        
        state PatrolRemote {
            [*] --> PatrolSources
            PatrolSources --> [*]
        }
    }
    
    TravelToRemote --> CheckTargetRoom
    DefendRemote --> CheckTargetRoom
```

**Key Behaviors:**
- Assigned to specific remote room
- Protects remoteHarvesters and remoteHaulers
- Patrols between sources
- Engages invaders and hostile players
- Essential for secure remote mining

**Body:** Similar to guard (5 TOUGH, 10 RANGED_ATTACK, 10 MOVE)
