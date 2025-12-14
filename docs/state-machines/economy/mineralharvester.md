# MineralHarvester State Machine

**Role:** `mineralHarvester`  
**Category:** Economy  
**Description:** Extracts minerals from extractors for labs and market

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckAssignment
    
    CheckAssignment --> FindMineral: No assigned mineral
    CheckAssignment --> HarvestMineral: Has assigned mineral
    
    FindMineral --> AssignMineral: Mineral with extractor
    AssignMineral --> HarvestMineral
    FindMineral --> Idle: No minerals
    
    HarvestMineral --> CheckFull: Harvesting
    CheckFull --> DepositContainer: Full + container nearby
    CheckFull --> DepositStorage: Full + no container
    CheckFull --> Continue: Not full
    
    DepositContainer --> CheckFull
    DepositStorage --> CheckFull
    Continue --> CheckFull
```

**Key Behaviors:**
- Only spawned when extractor exists
- Stays at assigned mineral like harvesters
- Deposits in container or storage
- Works with mineralCarrier for transport
- Stops when mineral depletes (regenerates slowly)

**Body:** Similar to harvester (5 WORK, 1 CARRY, 1 MOVE)
