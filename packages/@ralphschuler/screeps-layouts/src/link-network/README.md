# Link network planner internals

Dynamic links are planned outside static blueprints because useful link tiles
vary with live room objects and terrain.

## Intent

- **RCL 5:** build a controller receiver and the farthest visible source sender.
  This creates the first useful energy transfer pair.
- **RCL 6+:** reserve capacity for a storage receiver after the first useful
  source/controller pair, then fill remaining source capacity.
- **RCL 8:** reserve a spawn/core distribution link when capacity allows.
- **Cleanup safety:** exact planned links and already-built functional links are
  protected so blueprint cleanup does not remove working legacy networks.

## Modules

- `types.ts` — public plan shapes plus small internal geometry types.
- `constants.ts` — RCL gate and role priorities.
- `candidates.ts` — deterministic tile search and position keys.
- `blockedPositions.ts` — unavailable/occupied link tile collection.
- `classification.ts` — exact-plan and functional-range role classification.
- `index.ts` — internal barrel for the planner facade and focused tests.
- `../linkNetworkPlanner.ts` — public facade and orchestration.

The split keeps the exported planner API stable while making each policy choice
small enough to test and review.
