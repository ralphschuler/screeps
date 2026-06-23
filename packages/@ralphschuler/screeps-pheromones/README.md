# @ralphschuler/screeps-pheromones

Pheromone-based room coordination for the Screeps swarm architecture.

## Purpose

This package implements ROADMAP Section 5: stigmergic communication through small numeric signals on each `SwarmState`. Rooms do not issue direct commands to creeps through this package; they publish pressure signals such as `harvest`, `build`, `defense`, and `war` that spawn and role systems can read.

## Signals

The current `PheromoneState` tracks:

- `expand`
- `harvest`
- `build`
- `upgrade`
- `defense`
- `war`
- `siege`
- `logistics`
- `nukeTarget`

Each value is clamped to the configured range and decays during periodic updates.

## Update flow

1. `updateMetrics(room, swarm)` samples room state into rolling averages.
   - source energy harvested
   - controller progress
   - actual hostile count and potential attack damage
   - permanent allies are filtered by `@ralphschuler/screeps-core`
2. `updatePheromones(swarm, room)` runs only when `Game.time >= swarm.nextUpdateTick`.
   - applies configured decay
   - adds room contribution pressure from metrics/current state
   - sets `lastUpdate` and `nextUpdateTick`
3. Event methods add immediate spikes for hostiles, destroyed structures, nukes, and lost remotes.
4. Diffusion methods propagate selected high-level signals to neighboring rooms or cluster rooms.

## Module map

- `src/manager.ts` — public facade; owns config and per-room trackers.
- `src/metrics.ts` — room sampling and rolling metric snapshots.
- `src/contributionRules.ts` — periodic decay and contribution math.
- `src/eventSignals.ts` — event-driven pheromone spikes.
- `src/diffusionRules.ts` — cardinal room diffusion and cluster danger diffusion.
- `src/sourceCache.ts` — tick-local source cache shared by metrics/contributions.
- `src/limits.ts` — shared numeric clamping.
- `src/rollingAverage.ts` — rolling average primitive and room tracker shape.

## Usage

```typescript
import { pheromoneManager } from "@ralphschuler/screeps-pheromones";

pheromoneManager.updateMetrics(room, swarm);
pheromoneManager.updatePheromones(swarm, room);

pheromoneManager.onHostileDetected(swarm, hostileCount, dangerLevel);
pheromoneManager.onStructureDestroyed(swarm, structureType);
pheromoneManager.onNukeDetected(swarm);
pheromoneManager.onRemoteSourceLost(swarm);

pheromoneManager.applyDiffusion(roomSwarmMap);

const dominant = pheromoneManager.getDominantPheromone(swarm.pheromones);
```

## Validation

From the repository root:

```bash
npm run build:pheromones
npm run test:pheromones
npm run lint -w @ralphschuler/screeps-pheromones --if-present
```

## Safety constraints

- Do not treat permanent allies (`TooAngel`, `TedRoastBeef`) as threat signals.
- Keep pheromones as compact numeric state; avoid large Memory objects.
- Preserve the public `PheromoneManager` API unless callers are migrated in the same change.

## License

Unlicense - Public Domain
