# FactoryWorker State Machine

**Role:** `factoryWorker`  
**Category:** Economy  
**Description:** Operates factory for commodity production

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckWorking
    
    CheckWorking --> CollectResources: working=false (empty)
    CheckWorking --> SupplyFactory: working=true (has resources)
    
    state CollectResources {
        [*] --> CheckStorage
        CheckStorage --> WithdrawStorage: Get components
        CheckStorage --> CheckTerminal: No components
        CheckTerminal --> WithdrawTerminal: Get from terminal
        CheckTerminal --> Idle: No source
    }
    
    state SupplyFactory {
        [*] --> CheckFactory
        CheckFactory --> TransferFactory: Factory needs resources
        CheckFactory --> CollectProducts: Factory supplied
        
        CollectProducts --> WithdrawFactory: Factory has products
        CollectProducts --> ReturnStorage: Return to storage
    }
    
    CollectResources --> CheckWorking: Full
    SupplyFactory --> CheckWorking: Empty
```

**Key Behaviors:**
- Supplies resources to factory
- Collects produced commodities
- Returns products to storage/terminal
- Enables factory commodity production
- Works with factory production planner

**Body:** Logistics focused (10 CARRY, 5 MOVE)
