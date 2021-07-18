import { DefenseAnalyst, TerritoryIntent } from "Analysts/DefenseAnalyst";

import { Controllers } from "WorldState/Controllers";
import { HRAnalyst } from "Analysts/HRAnalyst";
import { MinionRequest } from "BehaviorTree/requests/MinionRequest";
import { OfficeManager } from "Office/OfficeManager";
import { RoomData } from "WorldState/Rooms";
import { byId } from "utils/gameObjectSelectors";

export class DefenseStrategist extends OfficeManager {
    public request?: MinionRequest;
    public fallbackRequest?: MinionRequest;
    buildRequest?: MinionRequest;

    plan() {
        let [target] = DefenseAnalyst.getPrioritizedAttackTargets(this.office);

        for (let tower of DefenseAnalyst.getTowers(this.office)) {
            // Primary orders
            if (target) {
                tower.attack(target);
            }
        }

        const attackEvents = Game.rooms[this.office.name].getEventLog().filter(e => e.event === EVENT_ATTACK)

        for (let event of attackEvents) {
            let attacker = byId(event.objectId as Id<unknown>)
            if (attacker instanceof Creep && !attacker.my && attacker.owner.username !== 'Invader') {
                // Hostile player attacked
                if (global.boardroom.offices.size === 1 || HRAnalyst.getSpawns(this.office).length > 0) {
                    // This is our last office, or we still have spawns - defend it
                    RoomData.set(this.office.name, {
                        ...RoomData.byRoom(this.office.name),
                        name: this.office.name,
                        scanned: Game.time,
                        intent: TerritoryIntent.DEFEND,
                        intentExpires: Game.time + 1000,
                    })
                } else {
                    // Concede
                    (Controllers.byRoom(this.office.name) as StructureController).unclaim();
                    RoomData.set(this.office.name, {
                        ...RoomData.byRoom(this.office.name),
                        name: this.office.name,
                        scanned: Game.time,
                        intent: TerritoryIntent.AVOID,
                        intentExpires: Game.time + 100000,
                    })
                }
            }
        }
    }
}
// profiler.registerClass(DefenseStrategist, 'DefenseStrategist');
