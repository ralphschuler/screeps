import { expect } from "chai";

import { resolveVisualizationProfile, selectRoomsForVisualization } from "../../src/core/visualizationMode";

describe("Visualization workload profiling", () => {
  it("disables visualizations on low bucket", () => {
    const profile = resolveVisualizationProfile({
      hasCpuBudget: true,
      bucketMode: "low",
      bucket: 3000,
      ownedRoomCount: 1
    });

    expect(profile.workload).to.equal("off");
    expect(profile.renderMap).to.equal(false);
    expect(profile.roomRenderStride).to.equal(1);
  });

  it("disables visualizations on critical bucket even with high room count", () => {
    const profile = resolveVisualizationProfile({
      hasCpuBudget: true,
      bucketMode: "critical",
      bucket: 1000,
      ownedRoomCount: 8
    });

    expect(profile.workload).to.equal("off");
    expect(profile.renderMap).to.equal(false);
  });

  it("uses detailed profile in high bucket", () => {
    const profile = resolveVisualizationProfile({
      hasCpuBudget: true,
      bucketMode: "high",
      bucket: 10000,
      ownedRoomCount: 12
    });

    expect(profile.workload).to.equal("detailed");
    expect(profile.renderMap).to.equal(true);
    expect(profile.roomRenderStride).to.equal(1);
    expect(profile.roomVisualizerConfig.showPheromones).to.equal(false);
  });

  it("uses standard profile in normal bucket for small empires", () => {
    const profile = resolveVisualizationProfile({
      hasCpuBudget: true,
      bucketMode: "normal",
      bucket: 6000,
      ownedRoomCount: 2
    });

    expect(profile.workload).to.equal("standard");
    expect(profile.renderMap).to.equal(true);
    expect(profile.roomRenderStride).to.equal(1);
    expect(profile.roomVisualizerConfig.showCombat).to.equal(true);
  });

  it("uses minimal profile in normal bucket for larger empires", () => {
    const profile = resolveVisualizationProfile({
      hasCpuBudget: true,
      bucketMode: "normal",
      bucket: 6000,
      ownedRoomCount: 4
    });

    expect(profile.workload).to.equal("minimal");
    expect(profile.renderMap).to.equal(false);
    expect(profile.roomRenderStride).to.equal(3);
    expect(profile.roomVisualizerConfig.showCombat).to.equal(false);
  });

  it("does not render rooms beyond profile stride", () => {
    const rooms = [{ name: "W1N1" }, { name: "W1N2" }, { name: "W1N3" }, { name: "W1N4" }, { name: "W1N5" }];

    const profile = resolveVisualizationProfile({
      hasCpuBudget: true,
      bucketMode: "normal",
      bucket: 6000,
      ownedRoomCount: 4
    });

    const selected = selectRoomsForVisualization(rooms, profile);
    expect(selected.map(room => room.name)).to.deep.equal(["W1N1", "W1N4"]);
  });
});
