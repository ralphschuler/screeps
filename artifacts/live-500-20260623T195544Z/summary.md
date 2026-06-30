# Live 500-tick Screeps observer summary

- Generated: 2026-06-23T20:32:24.569Z
- Shard: shard1
- Tick range: 71873740 → 71874241 (span 501; requested 500)
- Samples: 25
- Rooms observed: W17S29, W18S27, W18S28, W18S29, W18S30, W18S33, W18S34, W19S26, W19S27, W19S28, W19S29, W20S20, W5S15
- Read-only methods used: api.time, api.memory.get, api.raw.game.roomObjects, api.raw.game.roomStatus, api.me
- Ally safety: TooAngel/TedRoastBeef excluded from hostiles; state-changing endpoints used = false

## CPU / bucket

- CPU used avg/max: 30.403 / 55.52
- Bucket first/last/min/avg: 6301 / 2939 / 199 / 6362.32
- Skipped processes avg/max: 31.76 / 46

## Room health

| Room | RCL | Avg creeps | Max hostiles | Avg energy | Max queue/emergency | Avg open/assigned tasks |
|---|---:|---:|---:|---:|---:|---:|
| W19S26 | 3 | 1.16 | 1 | 0/0 | 0 / 0 | 7.56/0.24 |
| W17S29 | 6 | 13.2 | 0 | 926/2300 | 10 / 2 | 38.4/1.84 |
| W18S29 | 6 | 13.4 | 0 | 1016.6/1800 | 22 / 15 | 34.64/2.12 |
| W18S28 | 5 | 12.36 | 0 | 155.72/300 | 7 / 0 | 22.64/0.36 |

## Latest roles

| Role | Count | Active | Idle | Spawning | Avg CPU |
|---|---:|---:|---:|---:|---:|
| guard | 11 | 0 | 9 | 2 | 0.081 |
| harvester | 6 | 2 | 4 | 0 | 0.257 |
| hauler | 5 | 3 | 2 | 0 | 0.155 |
| healer | 4 | 0 | 4 | 0 | 0.089 |
| queenCarrier | 3 | 2 | 1 | 0 | 0.233 |
| interShardScout | 3 | 0 | 3 | 0 | 0.09 |
| pioneer | 2 | 1 | 1 | 0 | 0.145 |
| ranger | 1 | 0 | 1 | 0 | 0.066 |

## Latest hostiles / defenders

- W18S33: eduter/NathanLeo parts={"move":1,"work":5} boosted=0; eduter/DeclanNoah parts={"move":2,"work":9,"carry":1} boosted=0; eduter/IanZachary parts={"carry":9,"move":9} boosted=0
- W18S34: eduter/LukeCaden parts={"move":1,"work":5} boosted=0; eduter/Riley parts={"move":3,"work":15,"carry":1} boosted=0; eduter/RyanCaleb parts={"work":1,"carry":9,"move":5} boosted=0; eduter/Lucy parts={"move":1,"work":5} boosted=0

## Ranked issue candidates

| Rank | Candidate | Impact | Urgency | Risk | Evidence |
|---:|---|---|---|---|---|
| 1 | W19S26 hostile pressure / bootstrap-defense gap | high | high | medium | stats hostiles max=1; latest hostile owners=unknown; hostile combat parts=0; local my combat parts=8; defense requests=[] |
| 2 | W18S29 spawn queue backlog | high | high | low-medium | avg queue=9.04; max queue=22; avg emergency=2.36; max emergency=15; avg energy=1016.6/1800 |
| 3 | Combat creeps idle while a hostile combat creep is present | high | high | medium | guard idle=9/11; healer idle=4/4; latest hostile combat parts=40 |
| 4 | W17S29 spawn queue backlog | high | medium | low-medium | avg queue=7; max queue=10; avg emergency=0.64; max emergency=2; avg energy=926/2300 |
| 5 | W17S29 open task backlog with low assignment | medium-high | medium | low | avg open tasks=38.4; avg assigned tasks=1.84; avg creeps=13.2 |
| 6 | W18S29 open task backlog with low assignment | medium-high | medium | low | avg open tasks=34.64; avg assigned tasks=2.12; avg creeps=13.4 |
| 7 | CPU spikes / skipped low-frequency work | medium-high | high | low-medium | cpu max=55.52; bucket min=199; skipped processes max=46 |
| 8 | W18S28 open task backlog with low assignment | medium-high | medium | low | avg open tasks=22.64; avg assigned tasks=0.36; avg creeps=12.36 |

## Recommended top candidate

**W19S26 hostile pressure / bootstrap-defense gap** — stats hostiles max=1; latest hostile owners=unknown; hostile combat parts=0; local my combat parts=8; defense requests=[]

Likely code areas: packages/@ralphschuler/screeps-defense, packages/@ralphschuler/screeps-spawn, packages/@ralphschuler/screeps-roles

## Validation / deploy risks

- Analysis only; no source edits, no deploy.
- Live API sample is bounded to 501 ticks; re-sample before risky combat/defense changes.
- Avoid any change that targets allies TooAngel or TedRoastBeef.
