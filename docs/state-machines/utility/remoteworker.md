# RemoteWorker State Machine

**Role:** `remoteWorker`  
**Category:** Utility  
**Description:** Builds and maintains infrastructure in remote rooms

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckLocation
    
    CheckLocation --> TravelToRemote: Not in remote room
    CheckLocation --> WorkInRemote: In remote room
    
    state WorkInRemote {
        [*] --> CheckWorking
        CheckWorking --> Collection: working=false (empty)
        CheckWorking --> Construction: working=true (has energy)
        
        state Collection {
            [*] --> FindEnergy
            FindEnergy --> Harvest: Get from source
            FindEnergy --> Pickup: Get drops
        }
        
        state Construction {
            [*] --> Build: Has construction sites
            Build --> Repair: No sites
            Repair --> Idle: Nothing to do
        }
    }
    
    TravelToRemote --> CheckLocation
    WorkInRemote --> CheckLocation
```

**Key Behaviors:**
- Assigned to specific remote room
- Builds containers at sources
- Builds roads from sources to home room
- Repairs damaged infrastructure
- Self-sufficient (harvests in remote room)
- Works independently

**Body:** Balanced (5 WORK, 5 CARRY, 5 MOVE)
