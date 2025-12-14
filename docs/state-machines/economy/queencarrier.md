# QueenCarrier State Machine

**Role:** `queenCarrier`  
**Category:** Economy  
**Description:** High-priority distributor that keeps spawns and extensions filled from storage

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckWorking
    
    CheckWorking --> Collection: working=false (empty)
    CheckWorking --> Delivery: working=true (has energy)
    
    state Collection {
        [*] --> CheckStorage
        CheckStorage --> WithdrawStorage: Storage has energy
        CheckStorage --> CheckTerminal: Storage empty
        CheckTerminal --> WithdrawTerminal: Terminal has energy
        CheckTerminal --> Idle: No energy
    }
    
    state Delivery {
        [*] --> DeliverSpawns
        DeliverSpawns --> Transfer: Spawn/Extension needs energy
        DeliverSpawns --> WaitStorage: All full
        WaitStorage --> MoveTo: Move near storage
    }
    
    Collection --> CheckWorking: Full
    Delivery --> CheckWorking: Empty
```

**Key Behaviors:**
- Specialized for spawn/extension refilling only
- Only sources energy from storage/terminal (no containers/sources)
- Waits near storage when spawns are full (instant response)
- Highest priority for spawn energy (faster spawning)
- Minimal travel time maximizes efficiency

**Body:** Heavy CARRY focus (e.g., 16 CARRY, 8 MOVE)
