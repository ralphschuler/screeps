# Claimer State Machine

**Role:** `claimer`  
**Category:** Utility  
**Description:** Claims or reserves controllers for room expansion

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckTargetRoom
    
    CheckTargetRoom --> TravelToTarget: Not in target room
    CheckTargetRoom --> ClaimController: In target room
    
    state ClaimController {
        [*] --> FindController
        FindController --> MoveToController: Not in range
        FindController --> CheckMode: In range
        
        CheckMode --> Claim: Claim mode
        CheckMode --> Reserve: Reserve mode
        
        Claim --> Success: Claimed
        Reserve --> Success: Reserved
        
        MoveToController --> FindController
        Success --> [*]
    }
    
    TravelToTarget --> CheckTargetRoom
    ClaimController --> CheckTargetRoom: Action complete
```

**Key Behaviors:**
- Assigned to specific target room
- Two modes:
  - **Claim:** Takes ownership (requires GCL)
  - **Reserve:** Reserves for remote mining
- Claims/reserves then dies (single-use)
- Reservation increases source energy capacity
- Critical for expansion strategy

**Body (Claim):** 1 CLAIM, 1 MOVE (650 energy)
**Body (Reserve):** 2 CLAIM, 1 MOVE (1300 energy for max reservation)
