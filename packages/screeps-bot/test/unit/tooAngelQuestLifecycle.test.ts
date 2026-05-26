import { assert } from "chai";
import { planBuildcsQuestLifecycle } from "../../src/empire/tooangel/questLifecycle";

describe("TooAngel quest lifecycle Module", () => {
  it("completes visible buildcs quests with no remaining construction sites", () => {
    const intent = planBuildcsQuestLifecycle({
      quest: { id: "q1", type: "buildcs", status: "active", targetRoom: "W1N1", deadline: 2000, assignedCreeps: [] },
      time: 1000,
      targetVisible: true,
      constructionSiteCount: 0,
      existingAssignedCreeps: [],
      availableBuilders: [],
      maxBuilders: 3
    });

    assert.equal(intent.status, "completed");
    assert.deepEqual(intent.notifyComplete, { questId: "q1", success: true });
  });

  it("assigns builders up to cap and emits creep memory intents", () => {
    const intent = planBuildcsQuestLifecycle({
      quest: { id: "q1", type: "buildcs", status: "active", targetRoom: "W1N1", deadline: 0, assignedCreeps: ["b0"] },
      time: 1000,
      targetVisible: true,
      constructionSiteCount: 2,
      existingAssignedCreeps: ["b0"],
      availableBuilders: ["b1", "b2", "b3"],
      maxBuilders: 3
    });

    assert.deepEqual(intent.assignedCreeps, ["b0", "b1", "b2"]);
    assert.deepEqual(intent.creepAssignments.map(a => a.creepName), ["b0", "b1", "b2"]);
  });

  it("fails active quests after deadline", () => {
    const intent = planBuildcsQuestLifecycle({
      quest: { id: "q1", type: "buildcs", status: "active", targetRoom: "W1N1", deadline: 999, assignedCreeps: [] },
      time: 1000,
      targetVisible: true,
      constructionSiteCount: 1,
      existingAssignedCreeps: [],
      availableBuilders: [],
      maxBuilders: 3
    });

    assert.equal(intent.status, "failed");
    assert.equal(intent.skipReason, "deadline-missed");
  });
});
