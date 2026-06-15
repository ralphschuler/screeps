# Game strategy

`ROADMAP.md` is the full strategy source of truth. This page summarizes the maintained doctrine for implementation and review.

## Doctrine

- Economy first: stable sources, spawn uptime, hauling, and controller progress before advanced combat.
- Distributed swarm: many resilient colonies instead of a few overbuilt rooms.
- Local rules plus pheromones: room/creep behavior should use compact local signals and limited global impulses.
- CPU-aware automation: cache stable data, spread planning over ticks, and degrade gracefully when bucket is low.
- Ally safety: never attack, target, harass, or classify `TooAngel` or `TedRoastBeef` as enemies.

## Economy

Priority order:

1. Bootstrap spawn energy and larva/worker loop.
2. Static mining at sources.
3. Hauling demand sized by source output and path distance.
4. Controller progress without starving spawn/repair.
5. Storage/link/terminal flows.
6. Market/factory/lab work only when base economy is stable.

Useful package homes:

- role behavior: `@ralphschuler/screeps-roles`,
- spawn demand/queues: `@ralphschuler/screeps-spawn`,
- links/terminal/market/factory: `@ralphschuler/screeps-economy`,
- Memory schema: `@ralphschuler/screeps-memory`.

## Remote mining

Remote selection should consider:

- source count and reservation value,
- route distance and terrain,
- keeper/highway/player danger,
- hauling cost and body size,
- defense requirements,
- CPU cost.

Reserve-before-claim and avoid overexpansion when CPU, spawn capacity, or defense cannot support the room.

## Construction and layout

Room plans use modular stamps with fallback demand resolution. Preferred hub/extension/lab/defense stamps should be attempted first, but missing structures must be placed by fallback and validated against the current RCL limits. Critical fallback structures should receive road access and rampart overlays.

Package home: `@ralphschuler/screeps-layouts`.

## Defense

Defense should be reliable before offense:

- classify hostiles with ally filtering,
- prioritize tower focus fire by threat/heal/range,
- keep rampart repair floors appropriate to danger,
- spawn emergency defenders without starving recovery,
- use safe mode for dangerous attacks, not harmless scouts by default,
- coordinate helpers across nearby rooms.

Defense package homes: `@ralphschuler/screeps-defense`, `@ralphschuler/screeps-spawn`, `@ralphschuler/screeps-clusters`.

## Expansion

Expansion scoring should include:

- GCL room slot availability,
- distance from owned rooms,
- sources/mineral value,
- remote profitability,
- defense risk,
- hostile/ally proximity,
- CPU and spawn capacity.

Unsafe targets should be blocked even in growth mode.

## Combat

Combat is modular and safety-gated:

- start with defense and remote denial,
- keep offensive target selection ally-safe,
- prefer tested body planning and threat math,
- avoid brittle squad choreography unless covered by tests/private-server validation,
- gate high-risk offense through config/posture.

## Labs, boosts, and market

- Labs should maintain practical compounds and respond to war posture.
- Boosting should be reserved for significant combat/economic value.
- Market trades should account for terminal energy transfer cost, credit reserve, order fees, and room-level stock.
- Terminal balancing must preserve emergency energy and avoid capacity deadlocks.

## Intershard

InterShardMemory is limited and should stay compact. Share shard health, expansion/evacuation intents, and cross-shard tasks as small versioned payloads.

## Validation expectations

Gameplay changes should include package tests and, when runtime behavior is affected, private-server smoke validation:

```bash
npm run test:server:smoke
```
