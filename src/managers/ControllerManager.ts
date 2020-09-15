import { Mine, SourceAnalyst } from "analysts/SourceAnalyst";
import { SpawnAnalyst, SpawnData } from "analysts/Spawnanalyst";
import { EnergyRequest } from "requests/types/EnergyRequest";
import { MinionRequest, MinionTypes } from "requests/types/MinionRequest";
import { Request } from "requests/Request";
import { Manager } from "./Manager";
import { RequestManager } from "./RequestManager";
import { UpgradeRequest } from "requests/types/UpgradeRequest";
import { UpgradeTask } from "tasks/types/UpgradeTask";
import { WithdrawTask } from "tasks/types/WithdrawTask";

export class ControllerManager extends Manager {
    upgrader: Creep|null = null;
    init = (room: Room) => {
        if (!room.controller) return; // Nothing to manage in this room

        this.upgrader = room.find(FIND_MY_CREEPS).find(c => c.memory.type === 'UPGRADER') || null;

        // Request minions, if needed
        if (!this.upgrader) {
            global.managers.request.submit(new MinionRequest(room.controller.id, 4, MinionTypes.UPGRADER))
            // Request energy, if no dedicated upgraders
            global.managers.request.submit(new UpgradeRequest(room.controller.id, 1, room.controller))
        }
    }
    run = (room: Room) => {
        if (!room.controller || !this.upgrader) return;
        if (global.managers.task.isIdle(this.upgrader)) {
            if(this.upgrader.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                // Upgrader has energy - dump it into controller
                global.managers.task.assign(new UpgradeTask(this.upgrader, room.controller));
            } else {
                // Upgrader needs energy - get from controller container, preferably
                let depot = global.analysts.controller.getDesignatedUpgradingLocations(room);
                if (depot && depot.container) {
                    global.managers.task.assign(new WithdrawTask(this.upgrader, depot.container));
                } else {
                    // No upgrader depot exists yet; see if there's a spawn we can withdraw from instead
                    let spawn = global.analysts.spawn.getSpawns(room).find(s => s.energy > 0);
                    if (spawn) {
                        global.managers.task.assign(new WithdrawTask(this.upgrader, spawn.spawn));
                    }
                }
            }
        }
    }
}