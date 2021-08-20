import { BehaviorResult } from "Behaviors/Behavior";
import { moveTo } from "Behaviors/moveTo";
import { MinionBuilders, MinionTypes } from "Minions/minionTypes";
import { spawnMinion } from "Minions/spawnMinion";
import { getPatrolRoute } from "Selectors/getPatrolRoute";
import { minionCostPerTick } from "Selectors/minionCostPerTick";
import { spawnEnergyAvailable } from "Selectors/spawnEnergyAvailable";
import { getTerritoryIntent, TerritoryIntent } from "Selectors/territoryIntent";
import profiler from "utils/profiler";
import { Objective } from "./Objective";


declare global {
    interface CreepMemory {
        exploreTarget?: string;
    }
    interface RoomMemory {
        scanned?: number;
    }
}

export class ExploreObjective extends Objective {
    energyValue(office: string) {
        return -minionCostPerTick(MinionBuilders[MinionTypes.AUDITOR](spawnEnergyAvailable(office)));
    }
    spawn() {
        for (const office in Memory.offices) {
            if (getTerritoryIntent(office) === TerritoryIntent.DEFEND) return;
            const target = 1;
            const actual = this.minions(office).length

            let spawnQueue = [];

            if (target > actual) {
                spawnQueue.push(spawnMinion(
                    office,
                    this.id,
                    MinionTypes.AUDITOR,
                    MinionBuilders[MinionTypes.AUDITOR](spawnEnergyAvailable(office))
                ))
            }

            // For each available spawn, up to the target number of minions,
            // try to spawn a new minion
            spawnQueue.forEach((spawner, i) => spawner());
        }
    }

    action(creep: Creep) {
        // Select a target
        if (!creep.memory.exploreTarget) {
            // Ignore aggression on scouts
            creep.notifyWhenAttacked(false);

            let rooms = getPatrolRoute(creep).map(room => ({
                name: room,
                scanned: Memory.rooms[room]?.scanned
            }));

            if (!rooms.length) return;

            const bestMatch = rooms
                .reduce((last, match) => {
                    // Ignore rooms we've already scanned for now
                    if (last === undefined) return match;
                    if ((match.scanned ?? 0) > (last.scanned ?? 0)) {
                        return last;
                    }
                    return match;
                })
            creep.memory.exploreTarget = bestMatch?.name;
        }

        // Do work
        if (creep.memory.exploreTarget) {
            if (!Game.rooms[creep.memory.exploreTarget]) {
                if (moveTo(new RoomPosition(25, 25, creep.memory.exploreTarget), 20)(creep) === BehaviorResult.FAILURE) {
                    Memory.rooms[creep.memory.exploreTarget] ??= { }; // Unable to path
                    Memory.rooms[creep.memory.exploreTarget].scanned = Game.time;
                    delete creep.memory.exploreTarget;
                    return;
                }
            } else {
                // Room is visible
                const controller = Game.rooms[creep.memory.exploreTarget].controller;
                if (!controller) { // Exploration done
                    delete creep.memory.exploreTarget;
                    return;
                }
                // In room, sign controller
                const result = moveTo(Game.rooms[creep.memory.exploreTarget].controller?.pos, 1)(creep)
                creep.signController(controller, 'This sector property of the Grey Company');
                if (result !== BehaviorResult.INPROGRESS) {
                    // Done, or else no path to controller; abort
                    delete creep.memory.exploreTarget;
                    return;
                }
            }
        }
    }
}

profiler.registerClass(ExploreObjective, 'ExploreObjective')
