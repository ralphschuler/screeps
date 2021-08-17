import { BehaviorResult } from "Behaviors/Behavior";
import { getEnergyFromStorage } from "Behaviors/getEnergyFromStorage";
import { moveTo } from "Behaviors/moveTo";
import { setState, States } from "Behaviors/states";
import { STORAGE_LEVEL } from "config";
import { UPGRADE_CONTROLLER_COST } from "gameConstants";
import { MinionBuilders, MinionTypes } from "Minions/minionTypes";
import { spawnMinion } from "Minions/spawnMinion";
import { byId } from "Selectors/byId";
import { facilitiesWorkToDo } from "Selectors/facilitiesWorkToDo";
import { officeShouldSupportAcquireTarget } from "Selectors/findAcquireTarget";
import { minionCostPerTick } from "Selectors/minionCostPerTick";
import { profitPerTick } from "Selectors/profitPerTick";
import { roomPlans } from "Selectors/roomPlans";
import { spawnEnergyAvailable } from "Selectors/spawnEnergyAvailable";
import { storageEnergyAvailable } from "Selectors/storageEnergyAvailable";
import profiler from "utils/profiler";
import { Objective } from "./Objective";


declare global {
    interface CreepMemory {
        facilitiesTarget?: string;
    }
}

export class UpgradeObjective extends Objective {
    spawnTarget(office: string) {
        const rcl = Game.rooms[office]?.controller?.level ?? 0
        if (rcl < 4) return 0; // Engineers will handle early upgrades

        if (rcl === 8) return 1; // Upgrading is capped at RCL8
        if (officeShouldSupportAcquireTarget(office)) return 0; // Scale back upgrading to support office
        if (facilitiesWorkToDo(office).some(s => !s.structure)) return 0; // Scale back upgrading for construction

        let surplusIncome = profitPerTick(office, this);
        surplusIncome = Math.max(0, surplusIncome);
        // Spawn based on maximizing use of available energy
        const workPartsPerParalegal = Math.min(15, Math.floor(((spawnEnergyAvailable(office) - 50) * 3/4) / 100))
        // const engineerEfficiency = Math.min(0.8, (workPartsPerEngineer * 0.2));
        let paralegals = Math.floor(surplusIncome / (UPGRADE_CONTROLLER_COST * workPartsPerParalegal));

        // Unless at RCL 8, Adjust by storage energy levels - more for surplus, fewer for deficit
        paralegals += Math.min(2, Math.floor(
            (storageEnergyAvailable(office) - STORAGE_LEVEL[rcl]) /
            (UPGRADE_CONTROLLER_COST * workPartsPerParalegal * CREEP_LIFE_TIME * 0.8)
        ))
        return Math.max(0, paralegals);
    }
    energyValue(office: string) {
        const paralegals = this.spawnTarget(office);
        const workPartsPerParalegal = Math.min(15, Math.floor(((spawnEnergyAvailable(office) - 50) * 3/4) / 100))
        const minionCosts = minionCostPerTick(MinionBuilders[MinionTypes.PARALEGAL](spawnEnergyAvailable(office))) * paralegals;
        const workCosts = (workPartsPerParalegal * paralegals) * UPGRADE_CONTROLLER_COST;
        return -(workCosts + minionCosts);
    }
    spawn() {
        for (let office in Memory.offices) {
            const target = this.spawnTarget(office);
            // Calculate prespawn time based on time to spawn next minion
            const prespawnTime = MinionBuilders[MinionTypes.PARALEGAL](spawnEnergyAvailable(office)).length * CREEP_SPAWN_TIME
            const actual = this.assigned.map(byId).filter(c => (
                c?.memory.office === office && (
                    !c.ticksToLive || c.ticksToLive > prespawnTime
                )
            )).length

            if (target > actual) {
                spawnMinion(
                    office,
                    this.id,
                    MinionTypes.PARALEGAL,
                    MinionBuilders[MinionTypes.PARALEGAL](spawnEnergyAvailable(office))
                )({
                    preferredSpawn: roomPlans(office)?.headquarters?.spawn.structure as StructureSpawn
                })
            }
        }
    }

    action(creep: Creep) {
        // Do work
        if (!creep.memory.state || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            setState(States.GET_ENERGY)(creep);
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            setState(States.WORKING)(creep);
        }
        if (creep.memory.state === States.GET_ENERGY) {
            if (getEnergyFromStorage(creep) === BehaviorResult.SUCCESS) {
                setState(States.WORKING)(creep);
            }
        }
        if (creep.memory.state === States.WORKING) {
            const controller = Game.rooms[creep.memory.office]?.controller
            if (!controller) return;
            moveTo(controller.pos, 3)(creep);
            if (creep.upgradeController(controller) == ERR_NOT_ENOUGH_ENERGY) {
                setState(States.GET_ENERGY)(creep);
            }
        }
    }
}

profiler.registerClass(UpgradeObjective, 'UpgradeObjective')
