## Findings

### Must-fix

- **High — untracked new modules can be omitted**
  - `packages/@ralphschuler/screeps-kernel/src/events.ts:32-34` imports:
    - `./events/config`
    - `./events/priorities`
    - `./events/types`
  - But `git status` shows `packages/@ralphschuler/screeps-kernel/src/events/` as untracked.
  - If these files are not added to the commit/PR, build breaks and event API facade fails.
  - Must add:
    - `src/events/config.ts`
    - `src/events/priorities.ts`
    - `src/events/types.ts`

### Suggestions

- **Low — stale example in facade comment**
  - `src/events.ts:22-23` emits `{ roomName, creepId }`.
  - Actual `HostileDetectedEvent` requires `hostileId`, `hostileOwner`, `bodyParts`, `threatLevel` in `src/events/types.ts:26-31`.
  - Update comment example. Not new behavior, but touched facade still documents wrong payload.

## Changed files

Reviewer edits: **none**.

Scoped worktree changes reviewed:
- `packages/@ralphschuler/screeps-kernel/README.md`
- `packages/@ralphschuler/screeps-kernel/src/events.ts`
- `packages/@ralphschuler/screeps-kernel/src/events/{config,priorities,types}.ts` untracked

## Validation performed

- Scoped diff/read review.
- `npm run build:kernel` ✅
- `npm run lint:kernel` ✅ with existing Node module-type warning
- `npm run test:kernel` ✅ `97 passing`

## Risks

- Many unrelated dirty files exist; not reviewed.
- No full repo verify/private-server run.