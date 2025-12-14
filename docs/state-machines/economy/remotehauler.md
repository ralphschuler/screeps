# RemoteHauler State Machine

**Role:** `remoteHauler`  
**Category:** Economy  
**Description:** Transports energy from remote rooms back to home storage

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckLocation
    
    CheckLocation --> CollectRemote: In remote room + empty
    CheckLocation --> DeliverHome: In home room + has energy
    CheckLocation --> MoveToRemote: In home + empty
    CheckLocation --> MoveToHome: In remote + has energy
    
    state CollectRemote {
        [*] --> FindEnergy
        FindEnergy --> WithdrawContainer: Container with energy
        FindEnergy --> PickupDropped: Dropped resources
        FindEnergy --> Idle: No energy
    }
    
    state DeliverHome {
        [*] --> CheckStorage
        CheckStorage --> TransferStorage: Storage exists
        CheckStorage --> DeliverSpawns: No storage
    }
    
    MoveToRemote --> MoveToRoom: Travel to remote
    MoveToHome --> MoveToRoom: Travel to home
    
    CollectRemote --> CheckLocation: Full
    DeliverHome --> CheckLocation: Empty
    MoveToRoom --> CheckLocation: Arrived
```

**Key Behaviors:**
- Assigned to specific remote room (memory.targetRoom)
- Collects energy in remote room (container/drops)
- Returns to home room to deliver
- Continuous cycle between rooms
- Long travel paths (energy efficient body needed)

**Body:** Heavy CARRY with MOVE for roads (12 CARRY, 6 MOVE)
