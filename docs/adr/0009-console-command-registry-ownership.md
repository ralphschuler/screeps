# ADR-0009: Console Command Registry Ownership

## Status

Accepted

## Context

The repository had near-identical command registry implementations in:

- `packages/screeps-bot/src/core/commandRegistry.ts`
- `packages/@ralphschuler/screeps-console/src/commandRegistry.ts`
- `packages/@ralphschuler/screeps-core/src/commandRegistry.ts`

This violated framework-first development because command registration behavior was duplicated in the runtime bot package. The bot copy also contained newer compatibility behavior that the framework console package did not own yet:

- side-effect-free `getCommand()` in lazy-loading mode,
- `clear()` compatibility alias,
- Stage 3 decorator metadata support,
- duplicate decorator metadata prevention.

## Decision

`@ralphschuler/screeps-console` is the canonical owner of the command registry, command decorators, help generation, and command registration helpers.

`packages/screeps-bot/src/core/commandRegistry.ts` is now a compatibility re-export only. Bot command classes may keep their existing import paths, but behavior is implemented and tested in the framework console package.

The older `@ralphschuler/screeps-core` command registry remains for compatibility until a future public-API cleanup can remove or deprecate it safely.

## Consequences

### Positive

- Removes a large bot-local duplicate and keeps `packages/screeps-bot` closer to a thin integration layer.
- Moves decorator compatibility behavior into the reusable framework package.
- Lets console package tests cover behavior used by the bot.
- Reduces risk that bot and framework command registries drift independently.

### Negative

- Existing bot imports still route through a compatibility module, so the old path remains visible.
- `@ralphschuler/screeps-core` still exposes a legacy duplicate until a separate breaking-change-safe cleanup.
- Console package logs through its framework logger stub unless the consuming bot configures package-level logging.

## Alternatives Considered

### Keep the bot registry as canonical

- **Pros**: No import changes.
- **Cons**: Continues framework-first violation and keeps reusable behavior in runtime code.
- **Why rejected**: Runtime bot should compose framework packages, not own shared console infrastructure.

### Move registry to `@ralphschuler/screeps-core`

- **Pros**: Core is dependency-light.
- **Cons**: Console command behavior is not a core primitive; it would make core own higher-level console concerns.
- **Why rejected**: `@ralphschuler/screeps-console` already owns command collections and global console integration.

## Performance Impact

- **CPU impact**: Neutral. Registry operations are low-frequency startup/console work.
- **Memory impact**: Slightly positive in the bundle by removing a large duplicate source module from bot code paths.
- **Scalability**: No room/creep hot-path impact.

## References

- [Architecture overview](../architecture/README.md)
- [Package index](../packages/README.md)
- `packages/@ralphschuler/screeps-console/src/commandRegistry.ts`
- `packages/screeps-bot/src/core/commandRegistry.ts`
