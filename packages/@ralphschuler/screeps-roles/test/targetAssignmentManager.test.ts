import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";

import { getAssignedSource } from "../src/economy/targetAssignmentManager";
import { createMockCreep, MockGame, resetMockGame } from "./setup";

describe("targetAssignmentManager memory initialization", () => {
  beforeEach(() => {
    resetMockGame();
    MockGame.getObjectById = () => null;
  });

  it("initializes missing core memory fields for assignment lookups", () => {
    const creep = createMockCreep("worker1", {
      memory: {}
    });

    const source = getAssignedSource(creep);

    expect(source).to.equal(null);
    expect(creep.memory.role).to.equal("unknown");
    expect(creep.memory.homeRoom).to.equal("W1N1");
    expect(creep.memory.working).to.equal(false);
    expect(creep.memory.room).to.equal("W1N1");
  });

  it("returns source for stored sourceId and preserves assignment memory", () => {
    const source = {
      id: "SRC1" as Id<Source>
    } as unknown as Source;

    MockGame.getObjectById = (id) => (id === "SRC1" ? source : null);

    const creep = createMockCreep("worker2", {
      memory: {
        sourceId: "SRC1" as Id<Source>
      }
    });

    const result = getAssignedSource(creep);

    expect(result).to.equal(source);
    expect(creep.memory.sourceId).to.equal("SRC1");
  });
});
