# RemoteHarvester State Machine

**Role:** `remoteHarvester`  
**Category:** Economy  
**Description:** Mines sources in remote (non-owned) rooms

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckLocation
    
    CheckLocation --> MoveToRemote: In home room
    CheckLocation --> HarvestRemote: In remote room
    
    MoveToRemote --> MoveToRoom: Travel to remote
    MoveToRoom --> CheckLocation
    
    state HarvestRemote {
        [*] --> CheckSource
        CheckSource --> HarvestSource: Has assigned source
        CheckSource --> Idle: No source
        
        HarvestSource --> CheckFull: Harvesting
        CheckFull --> DepositContainer: Full + container exists
        CheckFull --> DropEnergy: Full + no container
        CheckFull --> Continue: Not full
        
        DepositContainer --> [*]
        DropEnergy --> [*]
        Continue --> [*]
    }
    
    HarvestRemote --> CheckLocation: Action complete
```

**Key Behaviors:**
- Assigned to specific remote room (memory.targetRoom)
- Travels to remote room
- Harvests from assigned source
- Deposits in container built by remoteWorker
- Works with remoteHauler for energy transport
- Vulnerable to attacks (no military escort in early game)

**Body:** Same as harvester (5 WORK, 1 CARRY, 1 MOVE)
