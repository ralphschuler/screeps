import { calculateFranchiseSurplus, countEnergyInContainersOrGround } from "utils/gameObjectSelectors";

import { Boardroom } from "Boardroom/Boardroom";
import { BoardroomManager } from "Boardroom/BoardroomManager";
import { Capacity } from "WorldState/Capacity";
import { ControllerAnalyst } from "./ControllerAnalyst";
import { FacilitiesAnalyst } from "./FacilitiesAnalyst";
import { HRAnalyst } from "./HRAnalyst";
import { LogisticsAnalyst } from "./LogisticsAnalyst";
import { Metrics } from "screeps-viz";
import { RoomData } from "WorldState/Rooms";
import { SalesAnalyst } from "./SalesAnalyst";

export class PipelineMetrics {
    constructor(
        public mineRate: Metrics.NonNegativeDeltaTimeseries = Metrics.newTimeseries(),
        public mineContainerLevels: Metrics.Timeseries = Metrics.newTimeseries(),
        public roomEnergyLevels: Metrics.Timeseries = Metrics.newTimeseries(),
        public spawnEnergyRate: Metrics.NonNegativeDeltaTimeseries = Metrics.newTimeseries(),
        public storageLevels: Metrics.Timeseries = Metrics.newTimeseries(),
        public storageFillRate: Metrics.DeltaTimeseries = Metrics.newTimeseries(),
        public fleetLevels: Metrics.Timeseries = Metrics.newTimeseries(),
        public mobileDepotLevels: Metrics.Timeseries = Metrics.newTimeseries(),
        public controllerDepotLevels: Metrics.Timeseries = Metrics.newTimeseries(),
        public controllerDepotFillRate: Metrics.DeltaTimeseries = Metrics.newTimeseries(),
        public logisticsThroughput: Metrics.NonNegativeDeltaTimeseries = Metrics.newTimeseries(),
        public buildRate: Metrics.Timeseries = Metrics.newTimeseries(),
        public repairRate: Metrics.Timeseries = Metrics.newTimeseries(),
        public upgradeRate: Metrics.Timeseries = Metrics.newTimeseries(),
        public deathLossesRate: Metrics.Timeseries = Metrics.newTimeseries(),
        public spawnUtilization: Metrics.Timeseries = Metrics.newTimeseries(),
    ) { }
}

export class StatisticsAnalyst extends BoardroomManager {
    constructor(
        boardroom: Boardroom,
        private salesAnalyst = boardroom.managers.get('SalesAnalyst') as SalesAnalyst,
        private hrAnalyst = boardroom.managers.get('HRAnalyst') as HRAnalyst,
        private logisticsAnalyst = boardroom.managers.get('LogisticsAnalyst') as LogisticsAnalyst,
        private controllerAnalyst = boardroom.managers.get('ControllerAnalyst') as ControllerAnalyst,
        private facilitiesAnalyst = boardroom.managers.get('FacilitiesAnalyst') as FacilitiesAnalyst
    ) {
        super(boardroom);
    }
    metrics: Map<string, PipelineMetrics> = new Map();

    reset() {
        this.metrics = new Map();
        Memory.boardroom.StatisticsAnalyst = "";
    }

    plan() {
        this.boardroom.offices.forEach(office => {
            if (!this.metrics.has(office.name)) {
                this.metrics.set(office.name,  new PipelineMetrics());
                //     new NonNegativeDeltaMetric( // mineRate
                //         this.salesAnalyst.getUsableSourceLocations(office)
                //             .reduce((sum, source) => (sum + (source instanceof Source ? source.energyCapacity : 0)), 0),
                //         500
                //     ),
                //     new Metric( // mineContainerLevels
                //         this.salesAnalyst.getUsableSourceLocations(office).length * CONTAINER_CAPACITY,
                //         500
                //     ),
                //     new Metric( // roomEnergyLevels
                //         Game.rooms[office.center.name].energyCapacityAvailable,
                //         500
                //     ),
                //     new NonNegativeDeltaMetric( // spawnEnergyRate
                //         100,
                //         500
                //     ),
                //     new Metric( // storageLevels
                //         Capacity.byId(this.logisticsAnalyst.getStorage(office)?.id)?.capacity ?? 0,
                //         500
                //     ),
                //     new DeltaMetric( // storageFillRate
                //         100,
                //         500
                //     ),
                //     new Metric( // fleetLevels
                //         this.logisticsAnalyst.getCarriers(office).reduce((sum, creep) => (sum + (Capacity.byId(creep.id)?.capacity ?? 0)), 0),
                //         500
                //     ),
                //     new Metric( // mobileDepotLevels
                //         this.logisticsAnalyst.depots.get(office.name)?.reduce((sum, creep) => (sum + (Capacity.byId(creep)?.capacity ?? 0)), 0) ?? 0,
                //         500
                //     ),
                //     new Metric( // controllerDepotLevels
                //         Capacity.byId(this.controllerAnalyst.getDesignatedUpgradingLocations(office)?.containerId)?.capacity || 0,
                //         500
                //     ),
                //     new DeltaMetric( // controllerDepotFillRate
                //         Capacity.byId(this.controllerAnalyst.getDesignatedUpgradingLocations(office)?.containerId)?.capacity || 0,
                //         500
                //     ),
                //     new NonNegativeDeltaMetric( // logisticsThroughput
                //         100,
                //         500
                //     ),
                //     new Metric( // buildRate
                //         100,
                //         500
                //     ),
                //     new Metric( // repairRate
                //         100,
                //         500
                //     ),
                //     new Metric( // upgradeRate
                //         100,
                //         500
                //     ),
                //     new Metric( // deathLossesRate
                //         100,
                //         500
                //     ),
                //     new Metric( // spawnUtilization
                //         1,
                //         500
                //     ),
                // ));
            } else {
                let pipelineMetrics = this.metrics.get(office.name) as PipelineMetrics;
                Metrics.updateNonNegativeDelta(
                    pipelineMetrics.mineRate,
                    this.salesAnalyst.getUsableSourceLocations(office)
                        .reduce((sum, source) => (sum + (source instanceof Source ? source.energy : 0)), 0)
                );
                Metrics.update(
                    pipelineMetrics.mineContainerLevels,
                    this.salesAnalyst.getUsableSourceLocations(office)
                        .reduce((sum, source) => (sum + calculateFranchiseSurplus(source)), 0)
                );
                Metrics.update(
                    pipelineMetrics.roomEnergyLevels,
                    Game.rooms[office.name]?.energyAvailable ?? 0
                );
                Metrics.updateNonNegativeDelta(
                    pipelineMetrics.spawnEnergyRate,
                    Game.rooms[office.name]?.energyAvailable ?? 0
                );
                Metrics.update(
                    pipelineMetrics.storageLevels,
                    Capacity.byId(this.logisticsAnalyst.getStorage(office)?.id)?.used ??
                    countEnergyInContainersOrGround(this.facilitiesAnalyst.getPlannedStructures(office).find(s => s.structureType === STRUCTURE_STORAGE)?.pos)
                );
                Metrics.updateDelta(
                    pipelineMetrics.storageFillRate,
                    Capacity.byId(this.logisticsAnalyst.getStorage(office)?.id)?.used ?? 0
                );
                let fleetLevel = this.logisticsAnalyst.getCarriers(office)
                    .reduce((sum, creep) => (sum + (Capacity.byId(creep.id)?.used ?? 0)), 0)
                Metrics.update(pipelineMetrics.fleetLevels, fleetLevel);
                Metrics.updateNonNegativeDelta(pipelineMetrics.logisticsThroughput, fleetLevel);
                Metrics.update(
                    pipelineMetrics.mobileDepotLevels,
                    this.logisticsAnalyst.depots.get(office.name)?.reduce((sum, creep) => (sum + (Capacity.byId(creep)?.used ?? 0)), 0) ?? 0
                );
                Metrics.update(
                    pipelineMetrics.controllerDepotLevels,
                    Capacity.byId(this.controllerAnalyst.getDesignatedUpgradingLocations(office)?.containerId)?.used || 0
                );
                Metrics.updateDelta(
                    pipelineMetrics.controllerDepotFillRate,
                    Capacity.byId(this.controllerAnalyst.getDesignatedUpgradingLocations(office)?.containerId)?.used || 0
                );
                Metrics.update(
                    pipelineMetrics.spawnUtilization,
                    this.hrAnalyst.getSpawns(office).filter(s => s.spawning).length
                );

                let building = 0;
                let repairing = 0;
                let upgrading = 0;
                let deathLosses = this.logisticsAnalyst.getTombstones(office)
                    .filter(t => t.creep.my && t.deathTime === Game.time - 1)
                    .reduce((sum, t) => sum + (Capacity.byId(t.id)?.used ?? 0), 0);

                for (let room of RoomData.byOffice(office) ?? []) {
                    if (!Game.rooms[room.name]) return;
                    Game.rooms[room.name].getEventLog().forEach(event => {
                        switch (event.event) {
                            case EVENT_BUILD:
                                building += event.data.energySpent;
                                break;
                            case EVENT_REPAIR:
                                repairing += event.data.energySpent;
                                break;
                            case EVENT_UPGRADE_CONTROLLER:
                                upgrading += event.data.energySpent;
                                break;
                        }
                    })
                }
                Metrics.update(
                    pipelineMetrics.buildRate,
                    building
                );
                Metrics.update(
                    pipelineMetrics.repairRate,
                    repairing
                );
                Metrics.update(
                    pipelineMetrics.upgradeRate,
                    upgrading
                );
                Metrics.update(
                    pipelineMetrics.deathLossesRate,
                    deathLosses
                );
            }
        })
    }
}
