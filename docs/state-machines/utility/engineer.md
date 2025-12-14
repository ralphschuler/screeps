# Engineer State Machine

**Role:** `engineer`  
**Category:** Utility  
**Description:** Maintains walls, ramparts, and critical infrastructure

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckWorking
    
    CheckWorking --> Collection: working=false (empty)
    CheckWorking --> Maintenance: working=true (has energy)
    
    state Collection {
        [*] --> FindEnergy
        FindEnergy --> Withdraw: Get from container/storage
        FindEnergy --> Harvest: Get from source
        FindEnergy --> Idle: No energy
    }
    
    state Maintenance {
        [*] --> CheckPriority
        CheckPriority --> RepairCritical: Critical damage
        CheckPriority --> RepairWalls: Walls below target
        CheckPriority --> RepairRamparts: Ramparts below target
        CheckPriority --> Idle2: All maintained
        
        RepairCritical --> [*]
        RepairWalls --> [*]
        RepairRamparts --> [*]
        Idle2 --> [*]
    }
    
    Collection --> CheckWorking: Full
    Maintenance --> CheckWorking: Empty
```

**Key Behaviors:**
- Specializes in defensive structure maintenance
- Repair priority:
  1. Critical structures (roads, containers)
  2. Walls (based on danger level)
  3. Ramparts (based on danger level)
- Dynamic repair targets based on threat
- Scales wall/rampart hits with room danger level
- Essential for long-term defense

**Body:** WORK focused (10 WORK, 5 CARRY, 10 MOVE)
