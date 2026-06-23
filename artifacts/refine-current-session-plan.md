## Findings

- Worktree is dirty globally.
- Clean candidate package: `packages/@ralphschuler/screeps-standards`.
- Safe slice: extract SS2 transaction-description parsing from large `SS2TerminalComms` class into a pure internal module.
- Changed files now: none.
- Validation performed: read-only inspection only; no tests run.

## Assumptions

- No behavior change.
- `SS2TerminalComms.parseTransaction()` remains public API.
- No changes to `Memory`, `Game.market`, terminal sending, combat, spawn, or ally logic.
- Generated `dist/` remains build output, not source-edited.

## Vertical Slice

**Goal:** deepen module structure + improve parser understandability.

Touch only:

- `packages/@ralphschuler/screeps-standards/src/SS2TerminalComms.ts`
- new `packages/@ralphschuler/screeps-standards/src/ss2Description.ts`
- `packages/@ralphschuler/screeps-standards/test/ss2.test.mjs`

## Ordered Phases

1. **Baseline guard**
   - Check selected package still clean:
     ```bash
     git status --short -- packages/@ralphschuler/screeps-standards packages/@ralphschuler/screeps-core
     npm test -w @ralphschuler/screeps-standards
     ```
   - Stop if selected files already dirty or baseline test fails.

2. **Characterization tests**
   - Add/confirm parser tests for valid first packet, continuation packet, malformed descriptions, edge regex limits.
   - Run:
     ```bash
     npm test -w @ralphschuler/screeps-standards
     ```

3. **Extract pure parser module**
   - Add `ss2Description.ts` with:
     - regex constants
     - `parseSS2TransactionDescription(description): SS2TransactionMessage | null`
     - JSDoc explaining SS2 format.
   - Update `SS2TerminalComms.parseTransaction()` to delegate.
   - Preserve exact regex/return shape.

4. **Final validation**
   ```bash
   npm run build -w @ralphschuler/screeps-standards
   npm test -w @ralphschuler/screeps-standards
   npm run lint -w @ralphschuler/screeps-standards
   npm run check:alliance-safety
   git diff --check -- packages/@ralphschuler/screeps-standards
   ```

## Acceptance Criteria

- Diff limited to listed files.
- Public exports unchanged.
- `SS2TerminalComms.parseTransaction()` behavior unchanged.
- No gameplay/swarm policy changes.
- No ally/combat targeting changes.
- Build, package tests, lint, alliance safety pass.

## Rollback / Stop

Rollback:

```bash
git restore packages/@ralphschuler/screeps-standards/src/SS2TerminalComms.ts \
  packages/@ralphschuler/screeps-standards/test/ss2.test.mjs
rm -f packages/@ralphschuler/screeps-standards/src/ss2Description.ts
```

Stop if:

- Baseline fails.
- Diff touches dirty packages.
- Parser tests change expected behavior.
- Build/lint failure not clearly caused by slice.

## Risks

- ESM import path must use `.js` in TS source.
- Tests import `dist`, so build must run before test.
- Protocol parsing edge cases can silently change if regex is not copied exactly.