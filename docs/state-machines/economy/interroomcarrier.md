# InterRoomCarrier State Machine

**Role:** `interRoomCarrier`  
**Category:** Economy  
**Description:** Transfers resources between rooms via terminals

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckAssignment
    
    CheckAssignment --> CollectSource: Has source + dest rooms
    CheckAssignment --> Idle: No assignment
    
    state CollectSource {
        [*] --> MoveToSource
        MoveToSource --> AtSource: Arrived at source
        AtSource --> Withdraw: Withdraw from terminal/storage
        Withdraw --> [*]: Full
    }
    
    state DeliverDest {
        [*] --> MoveToDest
        MoveToDest --> AtDest: Arrived at destination
        AtDest --> Transfer: Transfer to terminal/storage
        Transfer --> [*]: Empty
    }
    
    CollectSource --> DeliverDest: Full
    DeliverDest --> CheckAssignment: Empty
```

**Key Behaviors:**
- Assigned source and destination rooms
- Transfers specific resources between rooms
- Larger capacity than terminal transfers (no energy cost)
- Used for bulk inter-room logistics
- Slower than terminal but more energy efficient for large amounts

**Body:** Maximum capacity (25 CARRY, 25 MOVE on roads)
