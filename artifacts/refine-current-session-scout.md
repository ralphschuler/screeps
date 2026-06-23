## Read-only scout findings

Changed files: **none by me**. Existing dirty work untouched. `git status --short` shows **186 entries**; candidate exact paths below are clean.

Validation performed: read-only `git status`, `wc -l`, package/test/export inspection, ROADMAP/AGENTS ally-safety check, local Screeps type grep for terminal APIs.

## Candidate slices

| Slice | Exact files | Evidence/value | Validation | Risks |
|---|---|---|---|---|
| **1. SS2 terminal comms façade split** | `packages/@ralphschuler/screeps-standards/src/SS2TerminalComms.ts` plus new internal files under `src/ss2/`; tests `packages/@ralphschuler/screeps-standards/test/ss2.test.mjs`, `packages/screeps-bot/test/unit/standards/SS2TerminalComms.test.ts` | 616-line static class mixes codec, Memory persistence, incoming assembly, send queue, JSON. Public export via `src/index.ts`; used by `packages/screeps-bot/src/SwarmBot.ts`. High readability, low gameplay risk. | `npm run build:standards`; `npm run test:standards`; `npm test -w screeps-typescript-starter -- --grep SS2TerminalComms` | Static state + Memory persistence; ESM `.js` import style must remain. |
| **2. TerminalManager transfer planning/execution split** | `packages/screeps-economy/src/terminals/terminalManager.ts`; likely new `terminalTransferQueue.ts`, `terminalCapacity.ts`, `terminalBalancing.ts`; tests `packages/screeps-economy/test/TerminalManager.test.ts`, `TerminalRouter.test.ts`, `exports.test.ts` | 800 lines. Public export in `packages/screeps-economy/src/index.ts`. Mixes emergency transfers, capacity clearing, balancing, execution. Local types verify `terminal.send()`/`calcTransactionCost()`. | `npm run build:economy`; `npm run test:economy -- --grep TerminalManager` | Package has dirty `marketManager.ts`; avoid touching market path. Resource send/sell behavior sensitive. |
| **3. ClusterManager operation modules** | `packages/@ralphschuler/screeps-clusters/src/clusterManager.ts`; likely new `clusterMetrics.ts`, `clusterTerminalBalance.ts`, `clusterDefenseRequests.ts`; tests `packages/@ralphschuler/screeps-clusters/test/clusterManager.test.ts`, `attackTargetSelector.test.ts`, `defenseReinforcements.test.ts` | 721 lines. Clean package. Public export in `src/index.ts`. Mixes metrics, terminal balance, squads, offense, focus room, defense assignment. Existing code uses `getActualHostileCreeps/Structures`; tests include ally safety. | `npm run build:clusters`; `npm run test:clusters`; `npm run check:alliance-safety` | Military/offense code: must preserve TooAngel/TedRoastBeef non-aggression and not change target policy. |

## Notes

- ROADMAP supports layered cluster/inter-room logistics and modular testable subsystems.
- Best first slice: **SS2 terminal comms** — cleanest, self-contained, good tests, no alliance/combat policy.