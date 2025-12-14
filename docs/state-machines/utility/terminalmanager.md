# TerminalManager State Machine

**Role:** `terminalManager`  
**Category:** Utility  
**Description:** Manages terminal market operations and inter-room transfers

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckTerminal
    
    CheckTerminal --> ManageTerminal: Terminal exists
    CheckTerminal --> Idle: No terminal
    
    state ManageTerminal {
        [*] --> CheckOrders
        CheckOrders --> ExecuteOrder: Has pending orders
        CheckOrders --> BalanceResources: No orders
        
        state ExecuteOrder {
            [*] --> PrepareResources
            PrepareResources --> SendTerminal: Resources ready
            SendTerminal --> [*]
        }
        
        state BalanceResources {
            [*] --> CheckExcess
            CheckExcess --> SellExcess: Excess resources
            CheckExcess --> BuyDeficit: Deficit resources
            CheckExcess --> Idle2: Balanced
        }
    }
```

**Key Behaviors:**
- Manages terminal operations
- Executes market orders
- Balances resource levels across rooms
- Sends inter-room transfers
- Monitors market prices
- **Note:** Often automated via terminal logic, not always a creep role

**Body:** Logistics (10 CARRY, 5 MOVE) if needed for manual transfers
