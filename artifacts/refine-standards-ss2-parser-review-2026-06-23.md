## Findings

### Must-fix

1. **Required parser file is untracked**
   - Evidence: `git status --short` shows:
     - `?? packages/@ralphschuler/screeps-standards/src/ss2/`
   - `SS2TerminalComms.ts:9` imports `./ss2/description.js`.
   - If this file is missed in commit/PR, package build breaks. Add `src/ss2/description.ts`.

2. **README protocol doc conflicts with ROADMAP/code**
   - `README.md:79`: `msg_id`: `1-3 character alphanumeric`.
   - ROADMAP says SS2 Message ID is **3-stellig alphanumerisch**.
   - Sender code also generates exactly 3 chars: `SS2TerminalComms.ts:517-532`.
   - If parser leniency is intentional, docs should say protocol uses 3 chars; parser accepts 1-3.

### Suggestions

- Add test for packet-zero payload pipes:
  - Current pipe test covers continuation only: `test/ss2.test.mjs:23-30`.
  - Add case like `abc|0|2|hello|with|pipes` to cover final-marker branch plus pipe payload.

## Questions

None blocking.

## Changed files observed

- Modified:
  - `packages/@ralphschuler/screeps-standards/README.md`
  - `packages/@ralphschuler/screeps-standards/src/SS2TerminalComms.ts`
  - `packages/@ralphschuler/screeps-standards/test/ss2.test.mjs`
- Untracked:
  - `packages/@ralphschuler/screeps-standards/src/ss2/description.ts`

## Validation performed

- Read diff/status and scoped files.
- Ran:
  - `npm run test -w @ralphschuler/screeps-standards` ✅
  - `npm run lint -w @ralphschuler/screeps-standards` ✅ with existing module-type warning.

## Summary / risks

Refactor preserves parser behavior and `.js` TS import builds. Main risk: untracked required source file. Secondary risk: README now documents protocol differently from ROADMAP and generated outbound format.