# Stamp blueprint planner

`@ralphschuler/screeps-layouts` is the canonical source for room layout logic. `packages/screeps-bot` should consume the package API and keep only compatibility adapters while old bot-local layout modules are retired.

## Model

The planner uses modular stamps instead of one all-or-nothing bunker:

- `EXT10_DIAMOND` extension pods.
- `HUB_CORE` storage/spawn/link/terminal/factory/tower hub.
- `SOURCE_MINING`, `CONTROLLER_STAMP`, and `MINERAL_STAMP` anchored operational stamps.
- `LAB3_TO_LAB10` compact chemistry cluster.
- `DEFENSE_TOWER_PAIR` and `LATE_GAME_HEAVY` RCL8 additions.

Ramparts are stored as an overlay (`BlueprintPlan.ramparts`), not as the primary structure map. A tile can have a planned structure plus a planned rampart overlay.

## Guarantee loop

```text
RCL targets from CONTROLLER_STRUCTURES
→ fixed existing structures/sites count toward demand
→ preferred stamps
→ partial stamp placement
→ unplaced demand
→ fallback resolver
→ validation
→ construction queue
```

Failed stamp members do not fail the plan. They become `UnplacedDemand` and are resolved by type-specific fallback. Critical fallback structures receive road access and rampart overlays.

## Public API

```ts
import {
  buildConstructionQueue,
  createBlueprintFactsFromRoom,
  planRoomBlueprint,
  validatePlanAgainstRclLimits
} from "@ralphschuler/screeps-layouts";

const facts = createBlueprintFactsFromRoom(room);
const plan = planRoomBlueprint(facts, room.controller?.level ?? 1);
const validation = validatePlanAgainstRclLimits(facts, plan);
const queue = buildConstructionQueue(plan, { currentRcl: room.controller?.level ?? 1 });
```

## Validation coverage

Package tests cover:

- open-room RCL8 exact mandatory structure counts,
- RCL2/RCL3 extension and tower limits,
- RCL6 terminal/extractor/lab/extension targets,
- blocked extension and lab stamp fallback,
- existing structure/site demand accounting,
- existing offset spawn adoption,
- road access and rampart overlays for critical fallback structures,
- construction queue current-RCL filtering.

Run:

```bash
npm test -w @ralphschuler/screeps-layouts
npm run build -w @ralphschuler/screeps-layouts
```
