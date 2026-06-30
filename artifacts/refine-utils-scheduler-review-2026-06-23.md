## Findings

### Must-fix
None found in scoped diff.

### Suggestions
- **Low — docs stale test tree**  
  `packages/screeps-utils/README.md:203-213` omits `test/optimization/computationScheduler.test.ts`, while scheduler coverage is claimed at `README.md:226`. Add `optimization/` to tree.

## Changed files

Reviewer edits: **none**.

Scoped dirty files:
- `M packages/screeps-utils/README.md`
- `M packages/screeps-utils/src/optimization/computationScheduler.ts`
- `?? packages/screeps-utils/src/optimization/schedulerPolicy.ts`
- `?? packages/screeps-utils/test/optimization/computationScheduler.test.ts`

## Validation performed

Passed:
```bash
git diff --check -- <scoped files>
npm run build -w @ralphschuler/screeps-utils
npm test -w @ralphschuler/screeps-utils   # 63 passing
npm run lint -w @ralphschuler/screeps-utils
```

Notes:
- Lint emitted existing package warning: `MODULE_TYPELESS_PACKAGE_JSON`.
- Public barrel stable: `packages/screeps-utils/src/optimization/index.ts:7-9` still exports only existing modules, not `schedulerPolicy`.
- ROADMAP CPU-bucket intent preserved: bucket gates/budget deferral remain at `computationScheduler.ts:213-223`, helper logic at `schedulerPolicy.ts:31-43`.

## Risks

- No private-server smoke run; review limited to utils unit/build/lint.
- No full monorepo validation.
- New helper module is “internal by barrel,” not technically private if consumers deep-import compiled files.