import { BehaviorResult } from "Behaviors/Behavior";
import { getEnergyFromStorage } from "Behaviors/getEnergyFromStorage";
import { moveTo } from "Behaviors/moveTo";
import { setState, States } from "Behaviors/states";
import { MinionBuilders, MinionTypes } from "Minions/minionTypes";
import { spawnMinion } from "Minions/spawnMinion";
import { Budgets } from "Selectors/budgets";
import { getTowerRefillerLocation } from "Selectors/getHqLocations";
import { minionCostPerTick } from "Selectors/minionCostPerTick";
import { roomPlans } from "Selectors/roomPlans";
import { spawnEnergyAvailable } from "Selectors/spawnEnergyAvailable";
import { storageEnergyAvailable } from "Selectors/storageEnergyAvailable";
import profiler from "utils/profiler";
import { Objective } from "./Objective";


declare global {
    interface CreepMemory {
        depositSource?: Id<Source>
    }
}

/**
 * Picks up energy from Storage and transfers it to Towers
 */
export class TowerLogisticsObjective extends Objective {
    cost(office: string) {
        return minionCostPerTick(MinionBuilders[MinionTypes.ACCOUNTANT](spawnEnergyAvailable(office), 3));
    }
    budget(office: string, energy: number) {
        let body = MinionBuilders[MinionTypes.ACCOUNTANT](spawnEnergyAvailable(office), 3);
        let cost = minionCostPerTick(body);

        const hq = roomPlans(office)?.headquarters;
        const towersNeedRefilled = hq?.towers.some(t => ((t.structure as StructureTower)?.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0) > CARRY_CAPACITY * 3)
        const count = (towersNeedRefilled && storageEnergyAvailable(office) !== 0) ? 1 : 0
        return {
            cpu: 0.5 * count,
            spawn: body.length * CREEP_SPAWN_TIME * count,
            energy: cost * count,
        }
    }
    spawn() {
        for (let office in Memory.offices) {
            const budget = Budgets.get(office)?.get(this.id) ?? 0;
            const hq = roomPlans(office)?.headquarters;

            const towersNeedRefilled = hq?.towers.some(t => ((t.structure as StructureTower)?.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0) > CARRY_CAPACITY * 3)
            if (budget < this.cost(office) || !towersNeedRefilled || storageEnergyAvailable(office) === 0) {
                this.metrics.set(office, {spawnQuota: 0, energyBudget: budget, minions: this.minions(office).length})
                continue
            }
            this.metrics.set(office, {spawnQuota: 1, energyBudget: budget, minions: this.minions(office).length})

            // Maintain one small Accountant to fill towers
            let preferredSpace = getTowerRefillerLocation(office);
            if (this.minions(office).length === 0) {
                spawnMinion(
                    office,
                    this.id,
                    MinionTypes.ACCOUNTANT,
                    MinionBuilders[MinionTypes.ACCOUNTANT](spawnEnergyAvailable(office), 3)
                )({
                    preferredSpawn: hq?.spawn.structure as StructureSpawn,
                    preferredSpaces: preferredSpace ? [preferredSpace] : undefined,
                    allowOtherSpaces: false
                })
            }
        }
    }

    action(creep: Creep) {
        // Check HQ state
        const hq = roomPlans(creep.memory.office)?.headquarters;
        if (!hq) return;
        const creepIsEmpty = creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0;

        if (!creep.memory.state) {
            if (creepIsEmpty) {
                setState(States.GET_ENERGY_STORAGE)(creep);
            } else {
                setState(States.FILL_TOWERS)(creep);
            }
        }
        if (creep.memory.state === States.GET_ENERGY_STORAGE) {
            const result = getEnergyFromStorage(creep)
            if (result === BehaviorResult.SUCCESS) {
                setState(States.FILL_TOWERS)(creep);
            }
        }
        if (creep.memory.state === States.FILL_TOWERS) {
            if (creepIsEmpty) {
                setState(States.GET_ENERGY_STORAGE)(creep);
                return;
            }
            const tower = hq.towers.find(t => ((t.structure as StructureTower)?.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0) >= creep.store.getCapacity());
            if (tower?.structure && moveTo(tower?.pos, 1)(creep) === BehaviorResult.SUCCESS) {
                creep.transfer(tower.structure, RESOURCE_ENERGY);
            }
        }
    }
}

profiler.registerClass(TowerLogisticsObjective, 'TowerLogisticsObjective')
