# Global runtime diagnostics

The bot records lightweight diagnostics for Screeps global resets and stale heap switches.

## Why this exists

Screeps normally runs consecutive ticks in the same JavaScript heap until a global reset. During server instability, the runtime can also alternate between older heaps. A stale heap switch means global variables may contain values from several ticks ago.

## Runtime behavior

`packages/screeps-bot/src/core/globalRuntimeDiagnostics.ts` runs at the top of `main.loop`.

It records:

- `Memory.__globalResetCount` — backward-compatible reset counter used by private-server runtime assertions.
- `Memory.runtimeDiagnostics.global.resetCount` — number of observed new heaps/global resets.
- `Memory.runtimeDiagnostics.global.switchCount` — number of observed stale heap switches.
- `Memory.runtimeDiagnostics.global.lastTick` — last tick observed by diagnostics.
- `Memory.runtimeDiagnostics.global.lastResetTick` — last new-heap tick.
- `Memory.runtimeDiagnostics.global.lastSwitchTick` — last detected stale-heap tick.
- `Memory.runtimeDiagnostics.global.lastSwitchPreviousTick` — stale heap's previous tick marker.

Global switches are logged with throttling. The diagnostic does not clear heap state or skip ticks; it only makes the condition visible.

## Triage

Investigate when:

- `switchCount` increases repeatedly.
- `__globalResetCount` climbs quickly in private-server smoke or live stats.
- Console logs show `Global heap switch detected` near runtime anomalies.

Use this signal before enabling any Memory/RawMemory hack that relies on heap continuity.
