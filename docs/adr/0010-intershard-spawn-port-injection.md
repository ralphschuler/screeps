# ADR-0010: Intershard Spawn Port Injection

## Status

Accepted

## Context

Cross-shard resource transfers need to request `crossShardCarrier` creeps. The reusable intershard package previously had two undesirable options:

- depend directly on `@ralphschuler/screeps-spawn`, which would tangle package dependencies because spawn planning already depends on intershard types, or
- keep a no-op spawn stub in `@ralphschuler/screeps-intershard`, causing framework and bot implementations to drift.

The bot package also contained a near-duplicate `resourceTransferCoordinator.ts` just to import the real spawn queue/body planner.

## Decision

`@ralphschuler/screeps-intershard` owns the cross-shard transfer lifecycle. It exposes `configureResourceTransferCoordinator()` for runtime ports:

- body planner (`optimizeBody`),
- spawn queue (`addRequest`),
- spawn priority numeric mapping.

`packages/screeps-bot/src/intershard/resourceTransferCoordinator.ts` is now a thin adapter that injects `@ralphschuler/screeps-spawn` implementations and re-exports the framework coordinator.

## Consequences

### Positive

- Removes bot-local transfer lifecycle duplication.
- Keeps `@ralphschuler/screeps-intershard` independent from spawn package internals.
- Preserves real runtime spawn queue behavior through explicit adapter wiring.
- Adds a testable port seam for intershard carrier spawn requests.

### Negative

- Runtime wiring must happen before cross-shard transfer requests are processed.
- The adapter uses a narrow type cast because the framework port accepts a package-local spawn request shape while the runtime spawn queue requires the concrete spawn package type.

## Alternatives Considered

### Add `@ralphschuler/screeps-spawn` as an intershard dependency

- **Pros**: Direct imports, fewer adapters.
- **Cons**: Creates a tighter dependency cycle between spawn and intershard concerns.
- **Why rejected**: Framework packages should keep dependencies directional and minimal.

### Keep duplicate bot coordinator

- **Pros**: No API change.
- **Cons**: Violates framework-first architecture and lets fixes diverge.
- **Why rejected**: Transfer lifecycle is reusable framework behavior.

## Performance Impact

- **CPU impact**: Neutral; one extra function indirection on low-frequency transfer planning.
- **Memory impact**: Slightly positive in source/bundle maintainability by removing duplicate bot logic.
- **Scalability**: No per-creep hot-path impact.

## References

- [Architecture overview](../architecture/README.md)
- `packages/@ralphschuler/screeps-intershard/src/resourceTransferCoordinator.ts`
- `packages/screeps-bot/src/intershard/resourceTransferCoordinator.ts`
