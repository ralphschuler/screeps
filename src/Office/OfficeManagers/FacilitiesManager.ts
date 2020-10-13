import { CachedConstructionSite, CachedStructure, FacilitiesAnalyst } from "Boardroom/BoardroomManagers/FacilitiesAnalyst";
import { DepotRequest } from "Logistics/LogisticsRequest";
import { MinionRequest, MinionTypes } from "MinionRequests/MinionRequest";
import { OfficeManagerStatus } from "Office/OfficeManager";
import { BuildTask } from "Office/OfficeManagers/OfficeTaskManager/TaskRequests/types/BuildTask";
import { RepairTask } from "Office/OfficeManagers/OfficeTaskManager/TaskRequests/types/RepairTask";
import profiler from "screeps-profiler";
import { HRManager } from "./HRManager";
import { LogisticsManager } from "./LogisticsManager";
import { OfficeTaskManager } from "./OfficeTaskManager/OfficeTaskManager";
import { TaskAction } from "./OfficeTaskManager/TaskRequests/TaskAction";

const buildPriority = (site: CachedConstructionSite) => {
    // Adds a fractional component to sub-prioritize the most
    // complete construction sites
    let completion = site.progress / site.progressTotal;
    switch(site.structureType) {
        case STRUCTURE_ROAD:
            return 1 + completion;
        case STRUCTURE_CONTAINER:
            return 10 + completion;
        case STRUCTURE_EXTENSION:
            return 12 + completion;
        default:
            return 5 + completion;
    }
}

export class FacilitiesManager extends OfficeTaskManager {
    structures: CachedStructure[] = [];
    sites: CachedConstructionSite[] = [];
    handymen: Creep[] = [];

    depotRequests = new Map<TaskAction, DepotRequest>();

    plan() {
        super.plan();
        let facilitiesAnalyst = global.boardroom.managers.get('FacilitiesAnalyst') as FacilitiesAnalyst;
        let logisticsManager = this.office.managers.get('LogisticsManager') as LogisticsManager;
        let hrManager = this.office.managers.get('HRManager') as HRManager;
        // TODO - Update these with callbacks. Until then, load each tick
        this.sites = facilitiesAnalyst.getConstructionSites(this.office);
        this.sites.sort((a, b) => (buildPriority(b) - buildPriority(a)));
        this.structures = facilitiesAnalyst.getStructures(this.office);
        this.handymen = facilitiesAnalyst.getHandymen(this.office);

        switch (this.status) {
            case OfficeManagerStatus.OFFLINE: {
                // Manager is offline, do nothing
                return;
            }
            case OfficeManagerStatus.MINIMAL: {
                // Perform repairs if needed, or
                // delegate minimal resources to
                // new construction
                let jobs = this.submitOrders(2);
                if (jobs > 0 && this.handymen.length < 1) {
                    hrManager.submit(new MinionRequest(`${this.office.name}_Facilities`, 4, MinionTypes.HANDYMAN, {manager: this.constructor.name}))
                }
                break;
            }
            case OfficeManagerStatus.NORMAL: {
                // Perform repairs if needed, or
                // delegate resources to new
                // construction.
                let jobs = this.submitOrders(2);
                if (jobs > 0 && (this.handymen.length < (jobs / 2))) {
                    hrManager.submit(new MinionRequest(`${this.office.name}_Facilities`, 5, MinionTypes.HANDYMAN, {manager: this.constructor.name}))
                }
                break;
            }
            case OfficeManagerStatus.PRIORITY: {
                // Dedicate extra resources to
                // new construction, performing
                // repairs if needed.
                let jobs = this.submitOrders(2);
                if (jobs > 0 && this.handymen.length < jobs) {
                    hrManager.submit(new MinionRequest(`${this.office.name}_Facilities`, 6, MinionTypes.HANDYMAN, {manager: this.constructor.name}))
                }
                break;
            }
        }
        // Request depots for active assignments
        for (const [creepId, request] of this.assignments) {
            let pos = (request as BuildTask|RepairTask).pos;
            let needsDepot = true;
            for (let [sourcePos] of logisticsManager.sources) {
                if (pos.inRangeTo(sourcePos, 5)) {
                    needsDepot = false;
                }
            }
            if (needsDepot && !this.depotRequests.has(request)) {
                let depotReq = new DepotRequest(pos, request.priority, request.capacity);
                logisticsManager.submit(creepId, depotReq);
                this.depotRequests.set(request, depotReq);
            }
        }

    }
    submitOrders(max = 5) {
        if (this.requests.size >= max) return this.requests.size;

        let repairable = (this.structures.map(s => s.gameObj).filter(structure => {
            if (!structure) return false;
            switch (structure.structureType) {
                case STRUCTURE_WALL:
                    return false;
                    // return (structure.hits < Math.min(100000, structure.hitsMax));
                case STRUCTURE_RAMPART:
                    return ((structure as StructureRampart).my && structure.hits < Math.min(100000, structure.hitsMax));
                default:
                    if (this.status === OfficeManagerStatus.NORMAL || this.status === OfficeManagerStatus.PRIORITY)
                        return structure.hits < (structure.hitsMax * 0.8);
                    return structure.hits < (structure.hitsMax * 0.5); // In MINIMAL mode, repair structures below half health
            }
        }) as Structure[]).sort((a, b) => a.hits - b.hits);

        [...repairable, ...this.sites].slice(0, max - this.requests.size).forEach((site) => {
            if (site instanceof Structure) {
                this.submit(`${site.id}`, new RepairTask(site, 5))
            } else {
                this.submit(`${site.id}`, new BuildTask(site, Math.floor(buildPriority(site))))
            }
        })
        return this.requests.size;
    }

    run() {
        super.run();
        if (global.v.construction.state) {
            super.report();
            this.requests.forEach(task => {
                if (task instanceof BuildTask) {
                    new RoomVisual(task.destination.pos.roomName).rect(task.destination.pos.x-1, task.destination.pos.y-1, 2, 2, {stroke: '#0f0', fill: 'transparent', lineStyle: 'dotted'});
                } else if (task instanceof RepairTask) {
                    new RoomVisual(task.pos.roomName).rect(task.pos.x-1, task.pos.y-1, 2, 2, {stroke: 'yellow', fill: 'transparent', lineStyle: 'dotted'});
                }
            })
        }
    }

    cleanup() {
        super.cleanup();
        let activeAssignments = Array.from(this.assignments.values());
        for (const [req, depot] of this.depotRequests) {
            if (!activeAssignments.includes(req)) {
                depot.completed = true;
            }
            if (depot.completed) {
                this.depotRequests.delete(req);
            }
        }
    }
}


profiler.registerClass(FacilitiesManager, 'FacilitiesManager');
