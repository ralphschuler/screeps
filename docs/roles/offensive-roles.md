# Offensive Military Roles

Offensive military roles are designed for attacking enemy rooms, raiding resources, and dismantling enemy structures. This document describes the offensive roles and their tactical behavior.

## Overview

Offensive operations require:
1. Proper body composition (boosted for major operations)
2. Squad coordination for maximum effectiveness
3. Target prioritization (healers > ranged > melee)
4. Tactical retreat when critically damaged
5. Supply lines for healing and reinforcement

## Roles

### Soldier

**Purpose**: Primary assault unit for attacking hostile creeps and structures

**Behavior**:
- Engages hostile creeps using priority targeting
- Attacks hostile structures when no creeps present
- Can operate solo or as part of a squad
- Patrols when no targets available

**Tactical Features** ✅:
- **Retreat at 30% HP**: Preserves expensive units, especially boosted ones
- **Priority targeting**: Healers > Ranged > Melee > Support
- **Squad coordination**: Waits for squad members, follows orders
- **Home healing**: Returns to spawn area when damaged

**Body Configuration**:
- Basic: `[TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE]`
- Standard: `[TOUGH×5, ATTACK×10, MOVE×15]`
- Boosted: `[TOUGH×10, ATTACK×20, MOVE×30]` with XUH2O (ATTACK) and XLH2O (HEAL)

**Combat Tactics**:
- Melee range (1 tile): Uses ATTACK parts
- Can use RANGED_ATTACK if equipped
- Targets healers first to eliminate enemy sustainability

### Siege Unit

**Purpose**: Dismantler specialized in breaking enemy defenses

**Behavior**:
- Prioritizes spawns and towers
- Dismantles walls and ramparts
- Destroys other hostile structures
- Works with squads to breach fortified positions

**Tactical Features** ✅:
- **Retreat at 30% HP**: Critical for preserving expensive WORK-boosted units
- **Priority dismantling**: Spawns > Towers > Walls/Ramparts > Other structures
- **Target selection**: Focuses on weak walls (< 100k hits) first
- **Squad integration**: Coordinates with soldiers and rangers

**Body Configuration**:
- Basic: `[WORK, WORK, WORK, MOVE, MOVE, MOVE]`
- Standard: `[WORK×10, CARRY×5, MOVE×15]`
- Boosted: `[WORK×20, CARRY×10, MOVE×30]` with XZH2O (dismantle) and XLH2O (move)

**Combat Tactics**:
- Dismantle range (1 tile): Uses WORK parts
- 50 damage per WORK part per tick to structures
- Boosted can deal 100+ damage per tick
- Focus fire on single targets for rapid breakthrough

### Ranger

**Purpose**: Ranged attack specialist for kiting and area damage

**Behavior**:
- Maintains distance of 3 tiles from enemies (kiting)
- Provides ranged support for squads
- Can assist neighboring rooms when requested
- Flees from close-range threats

**Tactical Features** ✅:
- **Retreat at 30% HP**: Preserves valuable ranged attackers
- **Kiting behavior**: Stays at range 3, flees if closer
- **Priority targeting**: Healers > Ranged > Melee > Support
- **Room assistance**: Can respond to defense requests
- **Squad coordination**: Provides covering fire for melee units

**Body Configuration**:
- Basic: `[RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE]`
- Standard: `[RANGED_ATTACK×10, MOVE×10]`
- Boosted: `[RANGED_ATTACK×20, MOVE×20]` with KHO2 (ranged attack) and XLH2O (move)

**Combat Tactics**:
- Attack range: 3 tiles optimal, 1-3 tiles possible
- Damage falloff: 10 at range 1, 4 at range 2-3
- Mass attack: 1-4 damage to all hostiles in range 3
- Kite enemies to maximize uptime while minimizing damage taken

### Harasser

**Purpose**: Fast hit-and-run unit for disrupting enemy economy

**Behavior**:
- Targets worker creeps (builders, upgraders, haulers)
- Flees from combat creeps
- Fast movement for guerrilla tactics
- Cheap and disposable

**Tactical Features** ✅:
- **Retreat at 40% HP**: Earlier retreat for hit-and-run tactics
- **Worker targeting**: Focuses on disrupting enemy economy
- **Threat avoidance**: Flees from any combat creeps within 5 tiles
- **Mobile warfare**: Fast movement for quick strikes

**Body Configuration**:
- Standard: `[ATTACK×2, MOVE×4]` or `[RANGED_ATTACK, MOVE×2]`
- Focus on mobility over durability
- Cheap to replace for continuous harassment

**Combat Tactics**:
- Hit-and-run: Attack workers, flee from defenders
- Disrupt mining: Target haulers and harvesters
- Economy drain: Force enemy to spawn defenders
- Avoid direct combat with military creeps

## Squad Coordination

Squads provide coordinated offensive capabilities:

### Squad States

1. **Gathering**: Members rally at designated room
   - Wait for 50% of squad before advancing
   - Ensures coordinated assault

2. **Moving**: Squad travels to target room
   - Members stay together
   - Scouts can go ahead

3. **Attacking**: Execute role-specific combat
   - Individual retreat at squad threshold
   - Coordinate target selection

4. **Retreating**: Withdraw to rally room
   - Triggered by high casualties or objective complete

5. **Dissolving**: Squad disbands, members return home

### Squad Composition

**Raid Squad** (small, fast):
- 2x Soldier
- 1x Ranger
- 1x Healer

**Siege Squad** (heavy assault):
- 4x Soldier
- 2x Siege Unit
- 2x Ranger
- 2x Healer

**Harassment Squad** (economy disruption):
- 3-5x Harasser
- Fast, cheap, expendable

## Boost Integration

Boosting is managed by `BoostManager`:
- Automatic boosting based on danger level
- Different compounds for each role
- Cost-benefit analysis before boosting

**When to Boost**:
- Major offensive operations (siege)
- Defending against strong enemies
- High-value targets (power banks)

**Boost Costs**:
- 30 mineral + 20 energy per body part
- Significant investment for large creeps
- Consider unboost after operation to recover 50% of minerals

## Threat Assessment

All offensive roles include intelligent retreat logic:

1. **HP Monitoring**: Continuous health checks
2. **Retreat Threshold**: Role-specific percentages
3. **Home Return**: Navigate back to home room
4. **Spawn Healing**: Position near spawn/towers
5. **Resume**: Return to combat when healed

## Best Practices

### Planning
- Scout target room thoroughly
- Identify high-value targets
- Calculate required force
- Prepare supply lines

### Execution
- Use squads for coordinated assaults
- Boost expensive units
- Focus fire on priority targets
- Maintain healing support

### Defense
- Monitor for counter-attacks
- Prepare retreat paths
- Have replacements ready
- Don't overcommit resources

### Economy
- Balance offense with economy
- Offensive operations are expensive
- Ensure sufficient energy income
- Consider RoI (return on investment)

## Performance Metrics

Monitor offensive effectiveness:
- **Damage dealt**: Total damage to enemy structures/creeps
- **Losses**: Creeps lost vs. enemy losses
- **Resource efficiency**: Energy spent vs. value destroyed
- **Objective success**: Targets destroyed, rooms captured

## Troubleshooting

**Squads not coordinating**:
- Verify squad state transitions
- Check rally point accessibility
- Ensure members have squadId assigned

**High casualty rate**:
- Reduce retreat threshold (retreat earlier)
- Add more healers to composition
- Use boosted creeps for tough targets
- Improve threat assessment

**Stuck at walls**:
- Deploy siege units
- Use ranged attacks on ramparts
- Coordinate with nukes if available
- Consider alternate paths

**Ineffective harassment**:
- Harassers should avoid combat creeps
- Target isolated workers
- Use speed to escape
- Accept some losses (they're cheap)
