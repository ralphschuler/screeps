# LabTech State Machine

**Role:** `labTech`  
**Category:** Economy  
**Description:** Manages lab reactions and mineral logistics

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckWorking
    
    CheckWorking --> CollectMinerals: working=false (empty)
    CheckWorking --> SupplyLabs: working=true (has resources)
    
    state CollectMinerals {
        [*] --> CheckStorage
        CheckStorage --> WithdrawStorage: Get minerals from storage
        CheckStorage --> CheckTerminal: No minerals
        CheckTerminal --> WithdrawTerminal: Get from terminal
        CheckTerminal --> Idle: No source
    }
    
    state SupplyLabs {
        [*] --> CheckLabs
        CheckLabs --> TransferLab: Lab needs minerals
        CheckLabs --> CollectProducts: All supplied
        
        CollectProducts --> WithdrawLab: Lab has products
        CollectProducts --> ReturnStorage: Return to storage
    }
    
    CollectMinerals --> CheckWorking: Full
    SupplyLabs --> CheckWorking: Empty
```

**Key Behaviors:**
- Supplies reactant minerals to input labs
- Collects reaction products from output labs
- Returns products to storage/terminal
- Enables lab-based mineral production
- Coordinates with lab reaction planner

**Body:** Pure logistics (10 CARRY, 5 MOVE)
