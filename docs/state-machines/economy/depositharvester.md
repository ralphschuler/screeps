# DepositHarvester State Machine

**Role:** `depositHarvester`  
**Category:** Economy  
**Description:** Harvests from deposits in highway/SK rooms for rare resources

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckLocation
    
    CheckLocation --> TravelToDeposit: Not at deposit room
    CheckLocation --> HarvestDeposit: At deposit room
    
    state HarvestDeposit {
        [*] --> CheckDeposit
        CheckDeposit --> Harvest: Deposit available + not full
        CheckDeposit --> ReturnHome: Full or deposit depleted
        
        Harvest --> [*]
        ReturnHome --> [*]
    }
    
    TravelToDeposit --> MoveToRoom
    MoveToRoom --> CheckLocation
```

**Key Behaviors:**
- Targets deposits (highway/SK rooms)
- Harvests rare commodities
- Returns home when full or deposit on cooldown
- Risky (SK rooms have strongholds)
- Requires WORK parts for harvesting

**Body:** Balanced (5 WORK, 10 CARRY, 8 MOVE for speed)
