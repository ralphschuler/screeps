## Safe Vertical Refactor Plan: Defense Threat Body Profiling

### Assumptions

- No behavior changes.
- Preserve ROADMAP Section 12 defense posture + Section 25 alliance safety.
- Current dirty tree is large; avoid unrelated files.
- Target files currently clean; same package has dirty `towerActionPolicy` files → do not touch.

### Candidate Files

- `packages/screeps-defense/src/threat/threatAssessment.ts`
- New internal helper: `packages/screeps-defense/src/threat/bodyThreatProfile.ts`
- Optional focused test: `packages/screeps-defense/test/threatBodyProfile.test.ts`
- Existing test update: `packages/screeps-defense/test/threatAssessment.test.ts`
- Doc-only: `packages/screeps-defense/README.md`

## Ordered Phases

### Phase 0 — Baseline / Stop Gate

1. Confirm target files still clean:
   ```bash
   git diff -- packages/screeps-defense/src/threat/threatAssessment.ts packages/screeps-defense/README.md
   git status --short
   ```
2. Run focused baseline:
   ```bash
   npm test -w @ralphschuler/screeps-defense -- --grep "Threat Assessment"
   ```

**Stop if:** target files already dirty or focused baseline fails.

### Phase 1 — Golden Safety Tests

Add/update tests before extraction:

- Assert `assessThreat` ignores allied creeps via `getActualHostileCreeps`.
- Include TooAngel / TedRoastBeef regression if practical.
- Preserve existing WORK-part dismantle scoring + rollback via `Memory.defenseSettings.workPartThreatScoring = false`.
- Add exact boundary checks for current thresholds: `100`, `500`, `1000`.

**Acceptance:** tests pass before refactor.

### Phase 2 — Extract Pure Body Profile Helper

Move only body-part counting/scoring logic from `assessThreat` into internal helper:

```ts
summarizeHostileBody(hostile, options)
```

Returned data:

- active `attackParts`, `rangedParts`, `healParts`, `workParts`
- `isBoosted`
- `dps`
- `scoreContribution`
- role flags: melee/ranged/healer/dismantler

Keep public exports unchanged. `assessThreat(room)` must still start from:

```ts
const hostiles = getActualHostileCreeps(room);
```

**Stop if:** helper extraction needs changes outside threat module/tests/docs.

### Phase 3 — Documentation Alignment

Update `packages/screeps-defense/README.md` only to match current behavior:

- Dismantlers: active WORK parts score when enabled, not only `5+ WORK`.
- Mention rollback setting.
- Correct danger thresholds to code behavior: `100`, `500`, `1000`.
- Explicitly state allied entities are filtered before scoring.

### Phase 4 — Validation

Run:

```bash
npm test -w @ralphschuler/screeps-defense -- --grep "Threat Assessment|body profile|ally"
npm run lint:defense
npm run build:defense
npm run check:alliance-safety
```

Optional broader check if package-local changes look isolated:

```bash
npm run test:defense
```

## Rollback Point

Before editing, target files should have empty diff. Roll back only this slice:

```bash
git restore -- \
  packages/screeps-defense/src/threat/threatAssessment.ts \
  packages/screeps-defense/test/threatAssessment.test.ts \
  packages/screeps-defense/README.md

rm -f packages/screeps-defense/src/threat/bodyThreatProfile.ts
rm -f packages/screeps-defense/test/threatBodyProfile.test.ts
```

Do **not** run `git restore .` because tree has unrelated dirty work.

## Risks

- Defense code is safety-critical; scoring drift can affect safe mode/defender spawning.
- Dirty tree may cause package-wide lint/test failures unrelated to this slice.
- Alliance safety regression unacceptable; must keep allied filtering centralized.

## Validation Performed

- Inspected dirty tree: many unrelated modified/untracked files.
- Read ROADMAP defense/alliance sections.
- Inspected `threatAssessment.ts`, existing tests, defense README.
- Ran:
  ```bash
  npm test -w @ralphschuler/screeps-defense -- --grep "Threat Assessment"
  ```
  Result: `25 passing`.

## Changed Files

None.