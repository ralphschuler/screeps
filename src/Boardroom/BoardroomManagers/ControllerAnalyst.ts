import { CachedController, Controllers } from "WorldState/Controllers";
import { DefenseAnalyst, TerritoryIntent } from "./DefenseAnalyst";

import { BoardroomManager } from "Boardroom/BoardroomManager";
import { LegalData } from "WorldState/LegalData";
import { LegalManager } from "Office/OfficeManagers/LegalManager";
import { MapAnalyst } from "./MapAnalyst";
import { Memoize } from "typescript-memoize";
import { Office } from "Office/Office";
import { RoomArchitect } from "./Architects/RoomArchitect";
import { Structures } from "WorldState/Structures";
import { byId } from "utils/gameObjectSelectors";

export class ControllerAnalyst extends BoardroomManager {
    plan() {
        let roomArchitect = this.boardroom.managers.get('RoomArchitect') as RoomArchitect;
        this.boardroom.offices.forEach(office => {
            let controller = LegalData.byRoom(office.name)
            if (!controller && Game.rooms[office.name].controller) {
                controller = { id: Game.rooms[office.name].controller!.id }
            };
            if (!controller) return;
            // Initialize properties
            if (!controller.containerPos || !controller.linkPos) {
                let {container, link} = roomArchitect.headquarters.get(office.name) ?? {}
                controller.containerPos = container?.pos;
                controller.linkPos = link?.pos;
            }
            if (controller.containerPos && !byId(controller.containerId)) {
                controller.containerId = Structures.byPos(controller.containerPos)[0]?.id as Id<StructureContainer>
            }
            if (controller.linkPos && !byId(controller.linkId)) {
                controller.linkId = Structures.byPos(controller.linkPos)[0]?.id as Id<StructureLink>
            }
            LegalData.set(controller.id, controller, office.name);
        })
    }
    @Memoize((office: Office) => ('' + office.name + Game.time))
    getDesignatedUpgradingLocations(office: Office) {
        let controller = LegalData.byRoom(office.name);
        if (!controller?.containerPos) return null;

        return controller;
    }
    @Memoize((office: Office) => ('' + office.name + Game.time))
    getReservingControllers(office: Office) {
        let mapAnalyst = this.boardroom.managers.get('MapAnalyst') as MapAnalyst;
        let defenseAnalyst = this.boardroom.managers.get('DefenseAnalyst') as DefenseAnalyst;
        let territories = mapAnalyst.calculateNearbyRooms(office.name, 1);
        let controllers: CachedController[] = [];
        for (let t of territories) {
            let intent = defenseAnalyst.getTerritoryIntent(t)
            if (intent === TerritoryIntent.EXPLOIT) {
                let controller = Controllers.byRoom(t);
                if (controller) {
                    controllers.push(controller);
                }
            }
        }
        return controllers;
    }
    @Memoize((office: Office) => ('' + office.name + Game.time))
    unassignedUpgradeRequests(office: Office) {
        return (office.managers.get('LegalManager') as LegalManager).requests.filter(r => {
            return r.assigned.length === 0
        });
    }
}
