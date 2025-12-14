# Healer State Machine

**Role:** `healer`  
**Category:** Military  
**Description:** Provides healing support to friendly military units

## State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CheckTargets
    
    CheckTargets --> FollowSquad: In squad
    CheckTargets --> DefensiveHealing: Not in squad
    
    state FollowSquad {
        [*] --> CheckSquadTarget
        CheckSquadTarget --> MoveToSquad: Squad has target
        CheckSquadTarget --> WaitRally: No squad target
        
        state HealingLogic {
            [*] --> FindDamaged
            FindDamaged --> HealAdjacent: Damaged creep adjacent
            FindDamaged --> RangedHeal: Damaged creep in range 3
            FindDamaged --> FollowCombat: No damaged creeps
        }
        
        MoveToSquad --> HealingLogic
        WaitRally --> HealingLogic
    }
    
    state DefensiveHealing {
        [*] --> FindDamagedAlly
        FindDamagedAlly --> Heal: Ally adjacent
        FindDamagedAlly --> RangedHeal2: Ally in range
        FindDamagedAlly --> Patrol: No damaged allies
    }
```

**Key Behaviors:**
- Prioritizes healing damaged friendly creeps
- Uses heal() for adjacent (12 HP)
- Uses rangedHeal() for range 3 (4 HP)
- Follows squad members in offensive operations
- Patrols when no healing needed
- Essential for sustained combat

**Body:** HEAL and MOVE focused (10 HEAL, 10 MOVE)
