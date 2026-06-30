import { expect } from "chai";
import { planEmergencyEnergyRoute, planMilitaryBoostAllocation } from "../src/militaryResourcePoolingIntent.ts";

(globalThis as any).RESOURCE_CATALYZED_GHODIUM_ALKALIDE ??= "XGHO2";
(globalThis as any).RESOURCE_CATALYZED_UTRIUM_ACID ??= "XUH2O";

describe("Military resource logistics allocation Module", () => {
  it("allocates boost materials atomically when every need is available", () => {
    const intent = planMilitaryBoostAllocation({
      squadId: "squad1",
      needs: { [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: 300, [RESOURCE_CATALYZED_UTRIUM_ACID]: 300 },
      available: { [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: 300, [RESOURCE_CATALYZED_UTRIUM_ACID]: 600 }
    });

    expect(intent).to.deep.equal({
      success: true,
      allocated: ["300 XGHO2", "300 XUH2O"],
      missing: []
    });
  });

  it("reports missing boosts without partial allocation", () => {
    const intent = planMilitaryBoostAllocation({
      squadId: "squad1",
      needs: { [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: 600 },
      available: { [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: 300 }
    });

    expect(intent).to.deep.equal({
      success: false,
      allocated: [],
      missing: [{ resourceType: RESOURCE_CATALYZED_GHODIUM_ALKALIDE, needed: 600, available: 300 }]
    });
  });

  it("prefers nearer sources for emergency energy routing", () => {
    const intent = planEmergencyEnergyRoute({
      targetRoom: "W1N1",
      amount: 10000,
      targetHasTerminal: true,
      distance: (fromRoom, _toRoom) => {
        return fromRoom === "W3N3" ? 1 : 5;
      },
      sources: [
        {
          roomName: "W2N2",
          availableEnergy: 50000,
          reservedEnergy: 15000,
          hasTerminal: true,
          terminalEnergy: 50000
        },
        {
          roomName: "W3N3",
          availableEnergy: 40000,
          reservedEnergy: 0,
          hasTerminal: false,
          terminalEnergy: 0
        }
      ]
    });

    expect(intent).to.deep.equal({ success: true, sourceRoom: "W3N3", delivery: "hauler", excessEnergy: 40000 });
  });

  it("chooses terminal delivery only when terminal energy covers transfer cost", () => {
    const intent = planEmergencyEnergyRoute({
      targetRoom: "W1N1",
      amount: 5000,
      targetHasTerminal: true,
      distance: () => 3,
      sources: [
        {
          roomName: "W2N2",
          availableEnergy: 12000,
          reservedEnergy: 0,
          hasTerminal: true,
          terminalEnergy: 5000
        }
      ]
    });

    expect(intent).to.deep.equal({
      success: true,
      sourceRoom: "W2N2",
      delivery: "hauler",
      excessEnergy: 12000
    });
  });

  it("reports no-source when no room has enough unreserved energy", () => {
    const intent = planEmergencyEnergyRoute({
      targetRoom: "W1N1",
      amount: 10000,
      targetHasTerminal: true,
      distance: () => 1,
      sources: [
        {
          roomName: "W2N2",
          availableEnergy: 12000,
          reservedEnergy: 5000,
          hasTerminal: true,
          terminalEnergy: 12000
        }
      ]
    });

    expect(intent).to.deep.equal({ success: false, reason: "no-source" });
  });

  it("allows routing when source has exactly the requested excess energy", () => {
    const intent = planEmergencyEnergyRoute({
      targetRoom: "W1N1",
      amount: 10000,
      targetHasTerminal: false,
      distance: () => 1,
      sources: [
        {
          roomName: "W2N2",
          availableEnergy: 15000,
          reservedEnergy: 5000,
          hasTerminal: false,
          terminalEnergy: 0
        }
      ]
    });

    expect(intent).to.deep.equal({
      success: true,
      sourceRoom: "W2N2",
      delivery: "hauler",
      excessEnergy: 10000
    });
  });
});
