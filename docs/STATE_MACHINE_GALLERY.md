# Creep State Machine Gallery

Visual index of all creep state machines organized by category.

## Economy Roles (13)

### Core Economy

| Role | Description | Complexity |
|------|-------------|------------|
| [LarvaWorker](state-machines/economy/larvaworker.md) | General purpose starter creep | ⭐⭐⭐ |
| [Harvester](state-machines/economy/harvester.md) | Stationary source miner | ⭐⭐ |
| [Hauler](state-machines/economy/hauler.md) | Energy transport specialist | ⭐⭐ |
| [Builder](state-machines/economy/builder.md) | Construction specialist | ⭐⭐ |
| [Upgrader](state-machines/economy/upgrader.md) | Controller upgrade specialist | ⭐⭐ |

### Advanced Economy

| Role | Description | Complexity |
|------|-------------|------------|
| [QueenCarrier](state-machines/economy/queencarrier.md) | Priority spawn distributor | ⭐ |
| [MineralHarvester](state-machines/economy/mineralharvester.md) | Mineral extraction | ⭐⭐ |
| [DepositHarvester](state-machines/economy/depositharvester.md) | Highway deposit harvesting | ⭐⭐ |

### Specialized Economy

| Role | Description | Complexity |
|------|-------------|------------|
| [LabTech](state-machines/economy/labtech.md) | Lab logistics and reactions | ⭐⭐ |
| [FactoryWorker](state-machines/economy/factoryworker.md) | Factory operations | ⭐⭐ |

### Remote Economy

| Role | Description | Complexity |
|------|-------------|------------|
| [RemoteHarvester](state-machines/economy/remoteharvester.md) | Remote source mining | ⭐⭐ |
| [RemoteHauler](state-machines/economy/remotehauler.md) | Remote energy transport | ⭐⭐⭐ |
| [InterRoomCarrier](state-machines/economy/interroomcarrier.md) | Inter-room bulk logistics | ⭐⭐⭐ |

---

## Military Roles (7)

### Defensive

| Role | Description | Complexity |
|------|-------------|------------|
| [Guard](state-machines/military/guard.md) | Room defense patrol | ⭐⭐⭐ |
| [RemoteGuard](state-machines/military/remoteguard.md) | Remote room defense | ⭐⭐⭐ |
| [Healer](state-machines/military/healer.md) | Combat healing support | ⭐⭐ |

### Offensive

| Role | Description | Complexity |
|------|-------------|------------|
| [Soldier](state-machines/military/soldier.md) | Offensive combat unit | ⭐⭐⭐ |
| [Siege](state-machines/military/siege.md) | Structure destruction | ⭐⭐⭐ |
| [Harasser](state-machines/military/harasser.md) | Early game disruption | ⭐⭐ |
| [Ranger](state-machines/military/ranger.md) | Ranged combat specialist | ⭐⭐⭐ |

---

## Utility Roles (6)

### Exploration & Expansion

| Role | Description | Complexity |
|------|-------------|------------|
| [Scout](state-machines/utility/scout.md) | Room exploration and intel | ⭐⭐⭐ |
| [Claimer](state-machines/utility/claimer.md) | Controller claiming/reserving | ⭐⭐ |

### Infrastructure

| Role | Description | Complexity |
|------|-------------|------------|
| [Engineer](state-machines/utility/engineer.md) | Repairs and maintenance | ⭐⭐⭐ |
| [RemoteWorker](state-machines/utility/remoteworker.md) | Remote infrastructure | ⭐⭐⭐ |

### Logistics Management

| Role | Description | Complexity |
|------|-------------|------------|
| [LinkManager](state-machines/utility/linkmanager.md) | Link network management | ⭐ |
| [TerminalManager](state-machines/utility/terminalmanager.md) | Terminal operations | ⭐⭐ |

---

## Complexity Legend

- ⭐ **Simple** - Single purpose, straightforward logic
- ⭐⭐ **Moderate** - Multiple states, some decision logic
- ⭐⭐⭐ **Complex** - Many states, priority systems, coordination

## Quick Reference

### Working State Pattern (Economy)

Many economy roles use the working state pattern:

```
Empty → Collect Energy → Full → Deliver/Work → Empty
```

Roles using this pattern:
- LarvaWorker
- Hauler
- Builder
- Upgrader
- QueenCarrier

### Combat Priority Pattern (Military)

Military roles use priority targeting:

```
Scan for Hostiles → Priority Selection → Engage → Repeat
```

Priority order: Healers > Ranged > Melee > Support

### Assignment Pattern (Specialized)

Specialized roles use assignment-based logic:

```
Check Assignment → Travel to Target → Execute Task → Complete
```

Roles using this pattern:
- Harvester (source assignment)
- RemoteHarvester (remote room)
- RemoteHauler (remote room)
- RemoteGuard (remote room)
- Claimer (target room)
- Scout (target room)

## Architecture Overview

All roles follow the same execution flow:

```
Context → Behavior → State Machine → Executor
```

See [STATE_MACHINES.md](STATE_MACHINES.md) for detailed architecture documentation.

## Implementation Reference

All role implementations are in:
- `/packages/screeps-bot/src/roles/behaviors/economy.ts`
- `/packages/screeps-bot/src/roles/behaviors/military.ts`
- `/packages/screeps-bot/src/roles/behaviors/utility.ts`

Entry points:
- `/packages/screeps-bot/src/roles/economy/index.ts`
- `/packages/screeps-bot/src/roles/military/index.ts`
- `/packages/screeps-bot/src/roles/utility/index.ts`

State machine logic:
- `/packages/screeps-bot/src/roles/behaviors/stateMachine.ts`
