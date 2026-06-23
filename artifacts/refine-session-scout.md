## Read-only scout result

**Changed files:** none. No edits made.

## Safe next refactor slice

**Slice:** split `packages/@ralphschuler/screeps-kernel/src/events.ts`

Evidence:
- `events.ts` is ~946 LOC.
- Clean package: `git status --short -- packages/@ralphschuler/screeps-kernel` → no output.
- Framework-first: event bus/kernel infra, no gameplay policy or ally targeting changes.
- Existing tests cover behavior.

Suggested files:
- Add `packages/@ralphschuler/screeps-kernel/src/events/types.ts`
- Add `packages/@ralphschuler/screeps-kernel/src/events/priorities.ts`
- Add `packages/@ralphschuler/screeps-kernel/src/events/config.ts`
- Modify only `packages/@ralphschuler/screeps-kernel/src/events.ts` to import/re-export and keep `EventBus` behavior intact.

Keep API stable:
- `packages/@ralphschuler/screeps-kernel/src/index.ts` already exports from `./events`; preserve that path.

## Dirty conflicts observed

No direct conflicts for kernel slice.

Avoid current dirty zones:
- `package.json`
- layouts, memory, pheromones, roles, stats
- `packages/screeps-bot/*`
- defense, economy, spawn
- untracked `artifacts/*` and new module dirs in those packages

## Validation performed

Passed:
```bash
npm run build -w @ralphschuler/screeps-kernel -- --noEmit
npm test -w @ralphschuler/screeps-kernel -- --grep EventBus
```

Result: **17 EventBus tests passing**.

## Risks

- Must preserve event priority defaults exactly.
- Re-export `EventBusConfig`, `EventPriority`, event types from `events.ts` to avoid consumer breakage.
- Do not touch hostile/defense semantics; this is structure-only.