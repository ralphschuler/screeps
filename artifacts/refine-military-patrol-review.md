## Findings

**Must-fix:** none.

**Suggestions:** none.

## Changed files reviewed

- `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts`
- `packages/@ralphschuler/screeps-roles/src/behaviors/military/patrolWaypoints.ts`
- `packages/@ralphschuler/screeps-roles/test/militaryPatrolWaypoints.test.ts`

No edits made.

## Contract check

Preserved:

- Namespace: `"patrol"` — `patrolWaypoints.ts:14`
- TTL: `1000` — `patrolWaypoints.ts:17`, used at `:127`
- Spawn-count invalidation — `:111-118`
- Waypoint order — `:39-60`, `:69-74`, tested `militaryPatrolWaypoints.test.ts:61-87`
- Wall filtering after clamp — `:99-102`, tested `:89-100`
- `patrolIndex` init/advance/wrap — `:137-151`, tested `:131-165`

## Validation performed

- `npm run build -w @ralphschuler/screeps-roles` ✅
- `npm test -w @ralphschuler/screeps-roles -- --grep "military patrol waypoints"` ✅ 7 passing
- `npm run lint -w @ralphschuler/screeps-roles` ✅ warning only: package module-type warning

## Risks

- No private-server smoke run.
- Review scoped only to requested files; repo has many unrelated dirty files.