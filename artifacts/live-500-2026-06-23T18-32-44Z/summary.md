# Live 500-tick Screeps Observer Summary

- Shard: shard1
- Tick range: 71872697 -> 71873199 (span 502)
- Samples: 32 (sample span 502)
- CPU avg/max: 37.63/65.09; bucket start/end/min/delta: 5782/9232/5782/3450
- Skipped processes avg: 28.7
- Ally safety: configured allies TooAngel, TedRoastBeef; ally sightings 0; allies excluded from hostiles.

## Top processes/subsystems
- process creep:scout_71872539_736e6jbge (Creep scout_71872539_736e6jbge (scout)): avg 16.797, max 42.405, samples 31
- process remote:infrastructure (Remote Infrastructure Manager): avg 6.982, max 12.451, samples 32
- process room:W17S29 (Room W17S29 (owned)): avg 5.782, max 44.999, samples 32
- process empire:market (Market Manager): avg 3.423, max 7.074, samples 32
- process expansion:manager (Expansion Manager): avg 2.552, max 3.506, samples 32
- process creep:interShardScout_71872693_yrkao8c8y (Creep interShardScout_71872693_yrkao8c8y (interShardScout)): avg 2.461, max 2.461, samples 1
- process creep:interShardScout_71872790_wjeprxuyo (Creep interShardScout_71872790_wjeprxuyo (interShardScout)): avg 2.287, max 2.287, samples 1
- process core:memorySegmentStats (Memory Segment Stats): avg 1.341, max 1.389, samples 32
- subsystem kernel: avg 24.272, max 89.552, samples 32
- subsystem spawns: avg 6.354, max 80.568, samples 32
- subsystem taskBoard: avg 0.659, max 35.487, samples 32
- subsystem visualizations: avg 0.319, max 46.067, samples 29
- subsystem processSync: avg 0.087, max 31.364, samples 32

## Room health latest
- W19S26: status=n/a, spawns=1, towers=0 energy=0, myCreeps=0, hostiles=1, allies=0, controller=3/TedRoastBeef
  - hostile admon/r_8_ae72 @41,33 hits=5000/5000
- W17S29: status=n/a, spawns=1, towers=2 energy=1340, myCreeps=12, hostiles=0, allies=0, controller=6/TedRoastBeef
- W18S28: status=n/a, spawns=1, towers=2 energy=491, myCreeps=12, hostiles=0, allies=0, controller=5/TedRoastBeef
- W18S29: status=n/a, spawns=1, towers=2 energy=1850, myCreeps=14, hostiles=0, allies=0, controller=6/TedRoastBeef
- W15S30: status=n/a, spawns=0, towers=0 energy=0, myCreeps=0, hostiles=0, allies=0, controller=n/a/unowned
- W15S31: status=n/a, spawns=0, towers=0 energy=0, myCreeps=0, hostiles=0, allies=0, controller=0/unowned
- W16S23: status=n/a, spawns=0, towers=0 energy=0, myCreeps=0, hostiles=0, allies=0, controller=0/Invader
- W16S24: status=n/a, spawns=0, towers=0 energy=0, myCreeps=0, hostiles=4, allies=0, controller=n/a/unowned
  - hostile Source Keeper/Keeper5982fd5ab097071b4adbf220 @45,5 hits=5000/5000
  - hostile Source Keeper/Keeper5982fd5ab097071b4adbf223 @4,15 hits=5000/5000
  - hostile Source Keeper/Keeper5982fd5ab097071b4adbf224 @38,31 hits=5000/5000
- W16S25: status=n/a, spawns=0, towers=4 energy=2130, myCreeps=0, hostiles=8, allies=0, controller=n/a/unowned
  - hostile Invader/defender0 @10,7 hits=5000/5000
  - hostile Invader/defender1 @12,7 hits=5000/5000
  - hostile Invader/defender2 @11,7 hits=5000/5000
- W16S26: status=n/a, spawns=0, towers=0 energy=0, myCreeps=0, hostiles=4, allies=0, controller=n/a/unowned
  - hostile Source Keeper/Keeper5982fd5ab097071b4adbf235 @44,15 hits=5000/5000
  - hostile Source Keeper/Keeper5982fd5ab097071b4adbf238 @43,37 hits=5000/5000
  - hostile Source Keeper/Keeper5982fd5ab097071b4adbf232 @11,6 hits=5000/5000
- W16S27: status=n/a, spawns=0, towers=0 energy=0, myCreeps=0, hostiles=0, allies=0, controller=0/Invader
- W16S28: status=n/a, spawns=0, towers=0 energy=0, myCreeps=0, hostiles=0, allies=0, controller=0/unowned

## Spawn/task/roles latest
- roles: {"builder":6,"queenCarrier":4,"upgrader":5,"scout":3,"harvester":6,"guard":6,"hauler":6,"mineralHarvester":1,"pioneer":3,"interShardScout":2,"healer":1,"claimer":1,"ranger":1}
- taskBoard: total=247, assigned=8, unassigned=239, status={"unknown":125,"open":114,"assigned":8}
- queue empire.claimQueue: 1

## Hostiles/defense
- hostile sightings: 118
- tick 71873168 W16S25: 8 hostile creeps (Invader, Invader, Invader, Invader, Source Keeper)
- tick 71873168 W16S26: 4 hostile creeps (Source Keeper, Source Keeper, Source Keeper, Source Keeper)
- tick 71873185 W19S26: 1 hostile creeps (admon)
- tick 71873185 W16S24: 4 hostile creeps (Source Keeper, Source Keeper, Source Keeper, Source Keeper)
- tick 71873185 W16S25: 8 hostile creeps (Invader, Invader, Invader, Invader, Source Keeper)
- tick 71873185 W16S26: 4 hostile creeps (Source Keeper, Source Keeper, Source Keeper, Source Keeper)
- tick 71873199 W19S26: 1 hostile creeps (admon)
- tick 71873199 W16S24: 4 hostile creeps (Source Keeper, Source Keeper, Source Keeper, Source Keeper)
- tick 71873199 W16S25: 8 hostile creeps (Invader, Invader, Invader, Invader, Source Keeper)
- tick 71873199 W16S26: 4 hostile creeps (Source Keeper, Source Keeper, Source Keeper, Source Keeper)
- defense rooms latest: W19S26

## Ranked candidates
1. Add low-risk W19S26 responder/avoidance behavior for visible hostiles — impact=high, evidence=high, risk=medium, score=17
2. Reduce task/spawn backlog by tightening spawn intent prioritization — impact=high, evidence=medium, risk=low, score=16
3. Optimize/throttle hottest CPU path: creep:scout_71872539_736e6jbge (Creep scout_71872539_736e6jbge (scout)) — impact=medium, evidence=high, risk=medium, score=14

## Recommended top candidate
Add low-risk W19S26 responder/avoidance behavior for visible hostiles

