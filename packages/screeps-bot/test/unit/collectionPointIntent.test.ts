import { assert } from "chai";
import { planCollectionPointIntent } from "../../src/utils/common/collectionPointIntent";

describe("Collection point intent Module", () => {
  it("selects the best valid idle traffic point without mutating candidates", () => {
    const candidates = [
      { x: 1, y: 1, distanceFromSpawn: 3, onRoad: false, blocked: false, exit: false },
      { x: 10, y: 10, distanceFromSpawn: 8, distanceToStorage: 5, distanceToController: 8, onRoad: false, blocked: false, exit: false },
      { x: 11, y: 10, distanceFromSpawn: 8, distanceToStorage: 5, distanceToController: 8, onRoad: true, blocked: false, exit: false },
      { x: 12, y: 10, distanceFromSpawn: 8, onRoad: false, blocked: true, exit: false }
    ];
    const before = JSON.stringify(candidates);

    const intent = planCollectionPointIntent({
      candidates,
      minDistanceFromSpawn: 5,
      maxDistanceFromSpawn: 15,
      preferredDistanceFromSpawn: 8,
      storageDistanceWeight: 0.5,
      controllerDistanceWeight: 0.3,
      roadPenalty: 5
    });

    assert.equal(JSON.stringify(candidates), before);
    assert.deepEqual(intent, { position: { x: 10, y: 10 }, reason: "selected" });
  });

  it("reports no valid point when all candidates are blocked or too close", () => {
    const intent = planCollectionPointIntent({
      candidates: [{ x: 1, y: 1, distanceFromSpawn: 1, onRoad: false, blocked: false, exit: false }],
      minDistanceFromSpawn: 5,
      maxDistanceFromSpawn: 15,
      preferredDistanceFromSpawn: 8,
      storageDistanceWeight: 0.5,
      controllerDistanceWeight: 0.3,
      roadPenalty: 5
    });

    assert.deepEqual(intent, { reason: "none-valid" });
  });
});
