import { expect } from "chai";
import { planOpportunisticIntent, type OpportunisticIntentSnapshot } from "../../src/economy/opportunisticIntent";

describe("Opportunistic secondary-intent Module", () => {
  const base: OpportunisticIntentSnapshot = {
    bucket: 10000,
    primaryActionType: "moveTo",
    freeCapacity: 100,
    usedEnergy: 100,
    workParts: 1,
    droppedEnergy: [],
    damagedStructures: [],
    energyReceivers: []
  };

  it("keeps the primary action when CPU bucket is below the policy threshold", () => {
    const intent = planOpportunisticIntent({ ...base, bucket: 1000, droppedEnergy: [{ id: "energy", range: 1, amount: 100 }] });

    expect(intent).to.deep.equal({ type: "keepPrimary", reason: "low-bucket" });
  });

  it("prefers adjacent dropped energy before transfer or repair opportunities", () => {
    const intent = planOpportunisticIntent({
      ...base,
      droppedEnergy: [{ id: "energy", range: 1, amount: 100 }],
      damagedStructures: [{ id: "road", range: 1, structureType: STRUCTURE_ROAD, hits: 20, hitsMax: 100 }],
      energyReceivers: [{ id: "spawn", range: 1, structureType: STRUCTURE_SPAWN }]
    });

    expect(intent).to.deep.equal({ type: "pickup", targetId: "energy", reason: "nearby-energy" });
  });

  it("selects the highest-priority adjacent energy receiver", () => {
    const intent = planOpportunisticIntent({
      ...base,
      freeCapacity: 0,
      energyReceivers: [
        { id: "tower", range: 1, structureType: STRUCTURE_TOWER },
        { id: "spawn", range: 1, structureType: STRUCTURE_SPAWN }
      ]
    });

    expect(intent).to.deep.equal({
      type: "transfer",
      targetId: "spawn",
      resourceType: RESOURCE_ENERGY,
      reason: "nearby-energy-receiver"
    });
  });

  it("repairs only adjacent critical non-wall structures", () => {
    const intent = planOpportunisticIntent({
      ...base,
      freeCapacity: 0,
      usedEnergy: 50,
      workParts: 1,
      damagedStructures: [
        { id: "rampart", range: 1, structureType: STRUCTURE_RAMPART, hits: 10, hitsMax: 100 },
        { id: "road", range: 1, structureType: STRUCTURE_ROAD, hits: 20, hitsMax: 100 }
      ]
    });

    expect(intent).to.deep.equal({ type: "repair", targetId: "road", reason: "nearby-critical-repair" });
  });
});
