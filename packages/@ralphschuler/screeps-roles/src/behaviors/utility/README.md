# Utility behavior internals

Utility roles are split by ownership so `utility.ts` stays a dispatcher/facade:

- `remoteWorker.ts` owns remote mining infrastructure upkeep only.
  - Requires `memory.targetRoom` from the spawn compiler.
  - Builds containers before roads, then repairs containers/roads.
  - Uses remote energy first; returns excess home when no remote work exists.
- `safety.ts` contains survival interrupts for long-lived utility states.
  - Dangerous remote hostiles preempt committed `remoteWorker` build/repair/harvest states.
  - Local-room defense remains owned by room defense logic.
- `logistics.ts` contains small support creep behaviors for link and terminal energy/resource shuttling.

Normal `builder` creeps stay local-only. Remote construction belongs to `remoteWorker` so remote mining work cannot pull local bootstrap builders away from the home room.
