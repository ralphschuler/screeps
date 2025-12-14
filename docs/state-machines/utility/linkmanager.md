# LinkManager State Machine

**Role:** `linkManager`  
**Category:** Utility  
**Description:** Manages energy transfer via link network (if not automated)

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckLinks
    
    CheckLinks --> ManageTransfers: Links exist
    CheckLinks --> Idle: No links
    
    state ManageTransfers {
        [*] --> ScanLinks
        ScanLinks --> TransferEnergy: Link needs transfer
        ScanLinks --> Wait: All balanced
        
        TransferEnergy --> CooldownWait: Transferred
        CooldownWait --> [*]
        Wait --> [*]
    }
    
    ManageTransfers --> CheckLinks
```

**Key Behaviors:**
- Manages link network if not automated
- Transfers energy from source links to storage/controller links
- Monitors link cooldowns
- Balances energy distribution
- **Note:** Most bots automate links via StructureLink.transferEnergy()

**Body:** Pure movement (1 MOVE) - Minimal since links do the work
