import { assert } from "chai";
import type { SwarmState } from "../../src/memory/schemas";
import { LabEconomyWorkflow } from "../../src/labs/labEconomyWorkflow";

function createSwarm(): SwarmState {
  return {
    colonyLevel: "matureColony",
    posture: "eco",
    danger: 0,
    pheromones: {
      expand: 0,
      harvest: 0,
      build: 0,
      upgrade: 0,
      defense: 0,
      war: 0,
      siege: 0,
      logistics: 0,
      nukeTarget: 0
    },
    nextUpdateTick: 0,
    eventLog: [],
    missingStructures: {
      spawn: false,
      storage: false,
      terminal: false,
      labs: false,
      nuker: true,
      factory: true,
      extractor: false,
      powerSpawn: true,
      observer: true
    },
    role: "capital",
    remoteAssignments: [],
    metrics: {
      energyHarvested: 0,
      energySpawning: 0,
      energyConstruction: 0,
      energyRepair: 0,
      energyTower: 0,
      controllerProgress: 0,
      hostileCount: 0,
      damageReceived: 0,
      constructionSites: 0,
      energyAvailable: 0,
      energyCapacity: 0,
      energyNeed: 0
    },
    lastUpdate: 1000
  };
}

function createRoom(): Room {
  return { name: "W1N1" } as Room;
}

describe("LabEconomyWorkflow", () => {
  beforeEach(() => {
    (global as any).Game = { time: 1000 };
  });

  afterEach(() => {
    delete (global as any).Game;
  });

  it("initializes, prepares boosts, plans, and saves when no reaction is available", () => {
    const calls: string[] = [];
    const workflow = new LabEconomyWorkflow({
      labManager: {
        initialize: roomName => calls.push(`initialize:${roomName}`),
        areLabsReady: () => {
          calls.push("areLabsReady");
          return false;
        },
        setActiveReaction: () => {
          calls.push("setActiveReaction");
          return true;
        },
        save: roomName => calls.push(`save:${roomName}`)
      },
      boostManager: {
        prepareLabs: (room, swarm) => calls.push(`prepare:${room.name}:${swarm.posture}`)
      },
      chemistryPlanner: {
        planReactions: (room, swarm) => {
          calls.push(`plan:${room.name}:${swarm.posture}`);
          return null;
        },
        executeReaction: () => calls.push("executeReaction")
      },
      labConfigManager: {
        getConfig: () => undefined
      },
      logger: {
        debug: message => calls.push(`debug:${message}`)
      }
    });

    const result = workflow.run(createRoom(), createSwarm());

    assert.deepEqual(calls, ["initialize:W1N1", "prepare:W1N1:eco", "plan:W1N1:eco", "save:W1N1"]);
    assert.deepInclude(result, {
      roomName: "W1N1",
      initialized: true,
      boostPrepared: true,
      reactionPlanned: false,
      reactionReady: false,
      activeReactionChanged: false,
      reactionExecuted: false,
      saved: true
    });
  });

  it("sets and executes a ready reaction through one workflow Interface", () => {
    const calls: string[] = [];
    const reaction = {
      input1: RESOURCE_HYDROGEN,
      input2: RESOURCE_OXYGEN,
      product: RESOURCE_HYDROXIDE,
      priority: 10
    };
    const workflow = new LabEconomyWorkflow({
      labManager: {
        initialize: roomName => calls.push(`initialize:${roomName}`),
        areLabsReady: (roomName, step) => {
          calls.push(`ready:${roomName}:${step.input1}+${step.input2}->${step.product}`);
          return true;
        },
        setActiveReaction: (roomName, input1, input2, output) => {
          calls.push(`set:${roomName}:${input1}+${input2}->${output}`);
          return true;
        },
        save: roomName => calls.push(`save:${roomName}`)
      },
      boostManager: {
        prepareLabs: () => calls.push("prepare")
      },
      chemistryPlanner: {
        planReactions: () => {
          calls.push("plan");
          return reaction;
        },
        executeReaction: (_room, planned) => calls.push(`execute:${planned.product}`)
      },
      labConfigManager: {
        getConfig: () => undefined
      },
      logger: {
        debug: message => calls.push(`debug:${message}`)
      }
    });

    const result = workflow.run(createRoom(), createSwarm());

    assert.deepEqual(calls, [
      "initialize:W1N1",
      "prepare",
      "plan",
      "ready:W1N1:H+O->OH",
      "set:W1N1:H+O->OH",
      "execute:OH",
      "save:W1N1"
    ]);
    assert.deepInclude(result, {
      roomName: "W1N1",
      initialized: true,
      boostPrepared: true,
      reactionPlanned: true,
      reactionReady: true,
      activeReactionChanged: true,
      reactionExecuted: true,
      saved: true
    });
  });

  it("does not reset or execute when the active reaction already matches", () => {
    const calls: string[] = [];
    const reaction = {
      input1: RESOURCE_HYDROGEN,
      input2: RESOURCE_OXYGEN,
      product: RESOURCE_HYDROXIDE,
      priority: 10
    };
    const workflow = new LabEconomyWorkflow({
      labManager: {
        initialize: () => calls.push("initialize"),
        areLabsReady: () => true,
        setActiveReaction: () => {
          calls.push("setActiveReaction");
          return true;
        },
        save: () => calls.push("save")
      },
      boostManager: {
        prepareLabs: () => calls.push("prepare")
      },
      chemistryPlanner: {
        planReactions: () => reaction,
        executeReaction: () => calls.push("executeReaction")
      },
      labConfigManager: {
        getConfig: () => ({
          activeReaction: {
            input1: RESOURCE_HYDROGEN,
            input2: RESOURCE_OXYGEN,
            output: RESOURCE_HYDROXIDE
          }
        })
      },
      logger: {
        debug: message => calls.push(`debug:${message}`)
      }
    });

    const result = workflow.run(createRoom(), createSwarm());

    assert.notInclude(calls, "setActiveReaction");
    assert.include(calls, "executeReaction");
    assert.isFalse(result.activeReactionChanged);
    assert.isTrue(result.reactionExecuted);
  });

  it("reports not-ready reactions without executing them and still saves", () => {
    const calls: string[] = [];
    const reaction = {
      input1: RESOURCE_HYDROGEN,
      input2: RESOURCE_OXYGEN,
      product: RESOURCE_HYDROXIDE,
      priority: 10
    };
    const workflow = new LabEconomyWorkflow({
      labManager: {
        initialize: () => calls.push("initialize"),
        areLabsReady: () => false,
        setActiveReaction: () => {
          calls.push("setActiveReaction");
          return true;
        },
        save: () => calls.push("save")
      },
      boostManager: {
        prepareLabs: () => calls.push("prepare")
      },
      chemistryPlanner: {
        planReactions: () => reaction,
        executeReaction: () => calls.push("executeReaction")
      },
      labConfigManager: {
        getConfig: () => undefined
      },
      logger: {
        debug: message => calls.push(`debug:${message}`)
      }
    });

    const result = workflow.run(createRoom(), createSwarm());

    assert.notInclude(calls, "setActiveReaction");
    assert.notInclude(calls, "executeReaction");
    assert.include(calls, "save");
    assert.isTrue(result.reactionPlanned);
    assert.isFalse(result.reactionReady);
    assert.isFalse(result.reactionExecuted);
  });
});
